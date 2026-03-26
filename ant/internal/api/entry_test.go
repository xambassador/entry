package api_test

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/xambassador/entry/internal/api"
	"github.com/xambassador/entry/internal/config"
	"github.com/xambassador/entry/internal/store"

	_ "modernc.org/sqlite"
)

func newTestServer(t *testing.T) http.Handler {
	t.Helper()

	db, err := sql.Open("sqlite", ":memory:")
	require.NoError(t, err, "open in-memory sqlite")
	t.Cleanup(func() { _ = db.Close() })

	require.NoError(t, store.Migrate(db), "run migrations")

	cfg := &config.Config{
		DataDir: t.TempDir(),
		RequestConfig: config.RequestConfig{
			RequestTimeout: 15 * time.Second,
		},
		PaginationConfig: config.PaginationConfig{
			DefaultLimit: 30,
			MaxLimit:     100,
		},
	}

	return api.NewAPI(cfg, db)
}

func postEntry(t *testing.T, srv http.Handler, body any) *httptest.ResponseRecorder {
	t.Helper()

	raw, err := json.Marshal(body)
	require.NoError(t, err, "marshal request body")

	req := httptest.NewRequest(http.MethodPost, "/api/entries", bytes.NewReader(raw))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)
	return rec
}

func decodeBody(t *testing.T, rec *httptest.ResponseRecorder, dst any) {
	t.Helper()
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), dst))
}

type errorBody struct {
	Error struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

func Test_CreateEntry_Success(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	reqBody := map[string]any{
		"date":    "2026-01-15",
		"mood":    "great",
		"emoji":   "😀",
		"tags":    []string{"work", "focus"},
		"content": "Had a productive day writing Go code.",
	}

	rec := postEntry(t, srv, reqBody)

	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.Equal(t, "application/json; charset=utf-8", rec.Header().Get("Content-Type"))
}

func Test_CreateEntry_Success_WordCountCalculation(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	rec := postEntry(t, srv, map[string]any{
		"date":    "2026-04-20",
		"content": "one two three four five",
	})

	assert.Equal(t, http.StatusCreated, rec.Code)

	var entry map[string]any
	decodeBody(t, rec, &entry)
	assert.EqualValues(t, 5, entry["word_count"])
}

func Test_CreateEntry_Success_ContentWithOnlyWhitespaceWords(t *testing.T) {
	// Content with leading/trailing whitespace but actual words must be accepted.
	t.Parallel()

	srv := newTestServer(t)

	rec := postEntry(t, srv, map[string]any{
		"date":    "2026-04-21",
		"content": "  hello world  ",
	})

	assert.Equal(t, http.StatusCreated, rec.Code)

	var entry map[string]any
	decodeBody(t, rec, &entry)
	assert.EqualValues(t, 2, entry["word_count"])
}

func Test_CreateEntry_InvalidDateFormat(t *testing.T) {
	t.Parallel()

	invalidDates := []string{
		"15-01-2026",
		"2026/01/15",
		"January 15",
		"2026-13-01",
		"2026-00-10",
		"2026-01-32",
		"26-01-15",
		"not-a-date",
		"2026-1-5",
	}

	for _, date := range invalidDates {
		t.Run(date, func(t *testing.T) {
			t.Parallel()

			srv := newTestServer(t)

			rec := postEntry(t, srv, map[string]any{
				"date":    date,
				"content": "Testing invalid date format.",
			})

			assert.Equal(t, http.StatusBadRequest, rec.Code, "date %q should be rejected", date)

			var body errorBody
			decodeBody(t, rec, &body)
			assert.Equal(t, "invalid_date", body.Error.Code)
		})
	}
}

func Test_CreateEntry_InvalidMood(t *testing.T) {
	t.Parallel()

	invalidMoods := []string{
		"happy",
		"sad",
		"GREAT",
		"Good",
		"meh",
		"neutral",
		" great",
		"great ",
	}

	for _, mood := range invalidMoods {
		t.Run(mood, func(t *testing.T) {
			t.Parallel()

			srv := newTestServer(t)

			rec := postEntry(t, srv, map[string]any{
				"date":    "2026-06-01",
				"mood":    mood,
				"content": "Testing invalid mood.",
			})

			assert.Equal(t, http.StatusBadRequest, rec.Code, "mood %q should be rejected", mood)

			var body errorBody
			decodeBody(t, rec, &body)
			assert.Equal(t, "invalid_mood", body.Error.Code)
		})
	}
}

func Test_CreateEntry_MissingContent(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	rec := postEntry(t, srv, map[string]any{
		"date": "2026-07-04",
	})

	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var body errorBody
	decodeBody(t, rec, &body)
	assert.Equal(t, "missing_content", body.Error.Code)
}

func Test_CreateEntry_BlankContent(t *testing.T) {
	t.Parallel()

	blankContents := []string{
		"",
		"   ",
		"\t",
		"\n",
		"  \t  \n  ",
	}

	for _, content := range blankContents {
		content := content
		t.Run("blank:"+content, func(t *testing.T) {
			t.Parallel()

			srv := newTestServer(t)

			rec := postEntry(t, srv, map[string]any{
				"date":    "2026-07-05",
				"content": content,
			})

			assert.Equal(t, http.StatusBadRequest, rec.Code)

			var body errorBody
			decodeBody(t, rec, &body)
			assert.Equal(t, "missing_content", body.Error.Code)
		})
	}
}

func Test_CreateEntry_DuplicateDate_ReturnsConflict(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	body := map[string]any{
		"date":    "2026-09-01",
		"content": "First entry for this date.",
	}

	rec := postEntry(t, srv, body)
	require.Equal(t, http.StatusCreated, rec.Code, "first entry should be created successfully")

	rec2 := postEntry(t, srv, map[string]any{
		"date":    "2026-09-01",
		"content": "Duplicate entry for the same date.",
	})

	assert.Equal(t, http.StatusConflict, rec2.Code)

	var errBody errorBody
	decodeBody(t, rec2, &errBody)
	assert.Equal(t, "entry_exists", errBody.Error.Code)
}

func Test_CreateEntry_DifferentDates_BothSucceed(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	rec1 := postEntry(t, srv, map[string]any{
		"date":    "2026-10-01",
		"content": "Entry for October 1st.",
	})
	assert.Equal(t, http.StatusCreated, rec1.Code)

	rec2 := postEntry(t, srv, map[string]any{
		"date":    "2026-10-02",
		"content": "Entry for October 2nd.",
	})
	assert.Equal(t, http.StatusCreated, rec2.Code)
}

func Test_CreateEntry_InvalidJSON(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	req := httptest.NewRequest(http.MethodPost, "/api/entries", bytes.NewBufferString(`{not valid json`))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var body errorBody
	decodeBody(t, rec, &body)
	assert.Equal(t, "invalid_request_body", body.Error.Code)
}

func Test_CreateEntry_EmptyBody(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	req := httptest.NewRequest(http.MethodPost, "/api/entries", bytes.NewBufferString(`{}`))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var body errorBody
	decodeBody(t, rec, &body)
	assert.Equal(t, "missing_date", body.Error.Code)
}

func putEntry(t *testing.T, srv http.Handler, id string, body any) *httptest.ResponseRecorder {
	t.Helper()

	raw, err := json.Marshal(body)
	require.NoError(t, err, "marshal request body")

	req := httptest.NewRequest(http.MethodPut, "/api/entries/"+id, bytes.NewReader(raw))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)
	return rec
}

func Test_UpdateEntry_Success(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	createRec := postEntry(t, srv, map[string]any{
		"date":    "2026-02-10",
		"mood":    "good",
		"emoji":   "😊",
		"tags":    []string{"original"},
		"content": "Original content.",
	})
	require.Equal(t, http.StatusCreated, createRec.Code)

	var created map[string]any
	decodeBody(t, createRec, &created)
	id := created["id"].(string)

	rec := putEntry(t, srv, id, map[string]any{
		"mood":    "great",
		"emoji":   "🎉",
		"tags":    []string{"updated", "go"},
		"content": "Updated content with more words.",
	})

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "application/json; charset=utf-8", rec.Header().Get("Content-Type"))

	var updated map[string]any
	decodeBody(t, rec, &updated)
	assert.Equal(t, id, updated["id"])
	assert.Equal(t, "great", updated["mood"])
	assert.Equal(t, "🎉", updated["emoji"])
	assert.Equal(t, "Updated content with more words.", updated["content"])
	assert.EqualValues(t, 5, updated["word_count"])
	assert.Equal(t, created["created_at"], updated["created_at"])
	assert.NotEmpty(t, updated["updated_at"])
}

func Test_UpdateEntry_UpdatesWordCount(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	createRec := postEntry(t, srv, map[string]any{
		"date":    "2026-02-11",
		"content": "one two three",
	})
	require.Equal(t, http.StatusCreated, createRec.Code)

	var created map[string]any
	decodeBody(t, createRec, &created)
	id := created["id"].(string)

	rec := putEntry(t, srv, id, map[string]any{
		"content": "one two three four five six seven",
	})

	assert.Equal(t, http.StatusOK, rec.Code)

	var updated map[string]any
	decodeBody(t, rec, &updated)
	assert.EqualValues(t, 7, updated["word_count"])
}

func Test_UpdateEntry_NotFound(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	rec := putEntry(t, srv, "01NONEXISTENTID000000000000", map[string]any{
		"content": "Some content.",
	})

	assert.Equal(t, http.StatusNotFound, rec.Code)

	var body errorBody
	decodeBody(t, rec, &body)
	assert.Equal(t, "entry_not_found", body.Error.Code)
}

func Test_UpdateEntry_InvalidJSON(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	createRec := postEntry(t, srv, map[string]any{
		"date":    "2026-02-12",
		"content": "Hello world.",
	})
	require.Equal(t, http.StatusCreated, createRec.Code)

	var created map[string]any
	decodeBody(t, createRec, &created)
	id := created["id"].(string)

	req := httptest.NewRequest(http.MethodPut, "/api/entries/"+id, bytes.NewBufferString(`{not valid json`))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var body errorBody
	decodeBody(t, rec, &body)
	assert.Equal(t, "invalid_request_body", body.Error.Code)
}

func Test_UpdateEntry_BlankContent(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	createRec := postEntry(t, srv, map[string]any{
		"date":    "2026-02-14",
		"content": "Hello world.",
	})
	require.Equal(t, http.StatusCreated, createRec.Code)

	var created map[string]any
	decodeBody(t, createRec, &created)
	id := created["id"].(string)

	rec := putEntry(t, srv, id, map[string]any{
		"content": "   ",
	})

	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var body errorBody
	decodeBody(t, rec, &body)
	assert.Equal(t, "missing_content", body.Error.Code)
}
