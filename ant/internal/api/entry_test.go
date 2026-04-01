package api_test

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
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

const testAuthSecret = "test-secret-passphrase"

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
		AuthConfig: config.AuthConfig{
			AuthSecret:      testAuthSecret,
			SessionDuration: 7 * 24 * time.Hour,
		},
	}

	return api.NewAPI(cfg, db)
}

func login(t *testing.T, srv http.Handler) string {
	t.Helper()

	body, err := json.Marshal(map[string]string{"passphrase": testAuthSecret})
	require.NoError(t, err)

	req := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)
	require.Equal(t, http.StatusOK, rec.Code, "login should succeed")

	var resp map[string]any
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
	token, ok := resp["token"].(string)
	require.True(t, ok, "login response should contain token")
	return token
}

func postEntry(t *testing.T, srv http.Handler, token string, body any) *httptest.ResponseRecorder {
	t.Helper()

	raw, err := json.Marshal(body)
	require.NoError(t, err, "marshal request body")

	req := httptest.NewRequest(http.MethodPost, "/api/entries", bytes.NewReader(raw))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

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

func Test_Login_Success(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	body, _ := json.Marshal(map[string]string{"passphrase": testAuthSecret})
	req := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)

	var resp map[string]any
	decodeBody(t, rec, &resp)
	assert.NotEmpty(t, resp["token"])
	assert.NotEmpty(t, resp["expires_at"])

	// Should set a session cookie.
	cookies := rec.Result().Cookies()
	found := false
	for _, c := range cookies {
		if c.Name == "entry_session" {
			found = true
			assert.True(t, c.HttpOnly)
		}
	}
	assert.True(t, found, "should set entry_session cookie")
}

func Test_Login_InvalidPassphrase(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	body, _ := json.Marshal(map[string]string{"passphrase": "wrong-passphrase"})
	req := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)

	var errResp errorBody
	decodeBody(t, rec, &errResp)
	assert.Equal(t, "invalid_passphrase", errResp.Error.Code)
}

func Test_Login_EmptyPassphrase(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	body, _ := json.Marshal(map[string]string{"passphrase": ""})
	req := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_ProtectedRoute_WithoutAuth_Returns401(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	req := httptest.NewRequest(http.MethodGet, "/api/entries?month=1&year=2026", nil)
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)

	var errResp errorBody
	decodeBody(t, rec, &errResp)
	assert.Equal(t, "unauthorized", errResp.Error.Code)
}

func Test_ProtectedRoute_WithBearerToken_Succeeds(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)
	token := login(t, srv)

	req := httptest.NewRequest(http.MethodGet, "/api/entries?month=1&year=2026", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
}

func Test_ProtectedRoute_WithSessionCookie_Succeeds(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)
	token := login(t, srv)

	req := httptest.NewRequest(http.MethodGet, "/api/entries?month=1&year=2026", nil)
	req.AddCookie(&http.Cookie{Name: "entry_session", Value: token})
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
}

func Test_Verify_Authenticated(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)
	token := login(t, srv)

	req := httptest.NewRequest(http.MethodGet, "/api/auth/verify", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)

	var resp map[string]any
	decodeBody(t, rec, &resp)
	assert.Equal(t, true, resp["authenticated"])
}

func Test_Verify_NotAuthenticated(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)

	req := httptest.NewRequest(http.MethodGet, "/api/auth/verify", nil)
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)

	var resp map[string]any
	decodeBody(t, rec, &resp)
	assert.Equal(t, false, resp["authenticated"])
}

func Test_Logout(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)
	token := login(t, srv)

	req := httptest.NewRequest(http.MethodPost, "/api/auth/logout", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)

	// Verify session is gone.
	req2 := httptest.NewRequest(http.MethodGet, "/api/auth/verify", nil)
	req2.Header.Set("Authorization", "Bearer "+token)
	rec2 := httptest.NewRecorder()
	srv.ServeHTTP(rec2, req2)

	var resp map[string]any
	decodeBody(t, rec2, &resp)
	assert.Equal(t, false, resp["authenticated"])
}

func Test_CreateEntry_Success(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)
	token := login(t, srv)

	reqBody := map[string]any{
		"title":   "My First Entry",
		"date":    "2026-01-15",
		"mood":    "Joyful and energetic",
		"emoji":   "😊",
		"tags":    []string{"work", "focus"},
		"content": "Had a productive day writing Go code.",
	}

	rec := postEntry(t, srv, token, reqBody)

	assert.Equal(t, http.StatusCreated, rec.Code)
	assert.Equal(t, "application/json; charset=utf-8", rec.Header().Get("Content-Type"))

	var entry map[string]any
	decodeBody(t, rec, &entry)
	assert.Equal(t, "Joyful and energetic", entry["mood"])
	assert.Equal(t, "😊", entry["emoji"])
}

func Test_CreateEntry_Success_WordCountCalculation(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)
	token := login(t, srv)

	rec := postEntry(t, srv, token, map[string]any{
		"title":   "My First Entry",
		"date":    "2026-04-20",
		"content": "one two three four five",
	})

	assert.Equal(t, http.StatusCreated, rec.Code)

	var entry map[string]any
	decodeBody(t, rec, &entry)
	assert.EqualValues(t, 5, entry["word_count"])
}

func Test_CreateEntry_Success_ContentWithOnlyWhitespaceWords(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)
	token := login(t, srv)

	rec := postEntry(t, srv, token, map[string]any{
		"title":   "My First Entry",
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
			token := login(t, srv)

			rec := postEntry(t, srv, token, map[string]any{
				"title":   "My First Entry",
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

func Test_CreateEntry_AnyMoodIsAccepted(t *testing.T) {
	t.Parallel()

	moods := []string{
		"happy",
		"sad",
		"GREAT",
		"meh",
		"neutral",
		"😊",
		"feeling great today!",
		" great",
		"great ",
		"",
	}

	for i, mood := range moods {
		t.Run("mood:"+mood, func(t *testing.T) {
			t.Parallel()
			srv := newTestServer(t)
			token := login(t, srv)
			date := fmt.Sprintf("2026-06-%02d", i+1)
			rec := postEntry(t, srv, token, map[string]any{
				"title":   "Mood test entry",
				"date":    date,
				"mood":    mood,
				"content": "Any mood should be accepted.",
			})

			assert.Equal(t, http.StatusCreated, rec.Code, "mood %q should be accepted", mood)
		})
	}
}

func Test_CreateEntry_MissingContent(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)
	token := login(t, srv)

	rec := postEntry(t, srv, token, map[string]any{
		"title": "My First Entry",
		"date":  "2026-07-04",
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
			token := login(t, srv)

			rec := postEntry(t, srv, token, map[string]any{
				"title":   "My First Entry",
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
	token := login(t, srv)

	body := map[string]any{
		"title":   "My First Entry",
		"date":    "2026-09-01",
		"content": "First entry for this date.",
	}

	rec := postEntry(t, srv, token, body)
	require.Equal(t, http.StatusCreated, rec.Code, "first entry should be created successfully")

	rec2 := postEntry(t, srv, token, map[string]any{
		"title":   "My Second Entry",
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
	token := login(t, srv)

	rec1 := postEntry(t, srv, token, map[string]any{
		"title":   "My First Entry",
		"date":    "2026-10-01",
		"content": "Entry for October 1st.",
	})
	assert.Equal(t, http.StatusCreated, rec1.Code)

	rec2 := postEntry(t, srv, token, map[string]any{
		"title":   "My Second Entry",
		"date":    "2026-10-02",
		"content": "Entry for October 2nd.",
	})
	assert.Equal(t, http.StatusCreated, rec2.Code)
}

func Test_CreateEntry_InvalidJSON(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)
	token := login(t, srv)

	req := httptest.NewRequest(http.MethodPost, "/api/entries", bytes.NewBufferString(`{not valid json`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

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
	token := login(t, srv)

	req := httptest.NewRequest(http.MethodPost, "/api/entries", bytes.NewBufferString(`{}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var body errorBody
	decodeBody(t, rec, &body)
	assert.Equal(t, "missing_title", body.Error.Code)
}

func putEntry(t *testing.T, srv http.Handler, token, id string, body any) *httptest.ResponseRecorder {
	t.Helper()

	raw, err := json.Marshal(body)
	require.NoError(t, err, "marshal request body")

	req := httptest.NewRequest(http.MethodPut, "/api/entries/"+id, bytes.NewReader(raw))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)
	return rec
}

func Test_UpdateEntry_Success(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)
	token := login(t, srv)

	createRec := postEntry(t, srv, token, map[string]any{
		"title":   "My First Entry",
		"date":    "2026-02-10",
		"mood":    "Calm and focused",
		"emoji":   "😊",
		"tags":    []string{"original"},
		"content": "Original content.",
	})
	require.Equal(t, http.StatusCreated, createRec.Code)

	var created map[string]any
	decodeBody(t, createRec, &created)
	id := created["id"].(string)

	rec := putEntry(t, srv, token, id, map[string]any{
		"mood":    "Excited and happy",
		"emoji":   "🎉",
		"tags":    []string{"updated", "go"},
		"content": "Updated content with more words.",
	})

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "application/json; charset=utf-8", rec.Header().Get("Content-Type"))

	var updated map[string]any
	decodeBody(t, rec, &updated)
	assert.Equal(t, id, updated["id"])
	assert.Equal(t, "Excited and happy", updated["mood"])
	assert.Equal(t, "🎉", updated["emoji"])
	assert.Equal(t, "Updated content with more words.", updated["content"])
	assert.EqualValues(t, 5, updated["word_count"])
	assert.Equal(t, created["created_at"], updated["created_at"])
	assert.NotEmpty(t, updated["updated_at"])
}

func Test_UpdateEntry_UpdatesWordCount(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)
	token := login(t, srv)

	createRec := postEntry(t, srv, token, map[string]any{
		"title":   "My First Entry",
		"date":    "2026-02-11",
		"content": "one two three",
	})
	require.Equal(t, http.StatusCreated, createRec.Code)

	var created map[string]any
	decodeBody(t, createRec, &created)
	id := created["id"].(string)

	rec := putEntry(t, srv, token, id, map[string]any{
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
	token := login(t, srv)

	rec := putEntry(t, srv, token, "01NONEXISTENTID000000000000", map[string]any{
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
	token := login(t, srv)

	createRec := postEntry(t, srv, token, map[string]any{
		"title":   "My First Entry",
		"date":    "2026-02-12",
		"content": "Hello world.",
	})
	require.Equal(t, http.StatusCreated, createRec.Code)

	var created map[string]any
	decodeBody(t, createRec, &created)
	id := created["id"].(string)

	req := httptest.NewRequest(http.MethodPut, "/api/entries/"+id, bytes.NewBufferString(`{not valid json`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

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
	token := login(t, srv)

	createRec := postEntry(t, srv, token, map[string]any{
		"title":   "My First Entry",
		"date":    "2026-02-14",
		"content": "Hello world.",
	})
	require.Equal(t, http.StatusCreated, createRec.Code)

	var created map[string]any
	decodeBody(t, createRec, &created)
	id := created["id"].(string)

	rec := putEntry(t, srv, token, id, map[string]any{
		"content": "   ",
	})

	assert.Equal(t, http.StatusBadRequest, rec.Code)

	var body errorBody
	decodeBody(t, rec, &body)
	assert.Equal(t, "missing_content", body.Error.Code)
}

func Test_GetEntry_ReturnsVerifiedFlag(t *testing.T) {
	t.Parallel()

	srv := newTestServer(t)
	token := login(t, srv)

	createRec := postEntry(t, srv, token, map[string]any{
		"title":   "Integrity Test",
		"date":    "2026-03-15",
		"content": "This entry should be verified.",
	})
	require.Equal(t, http.StatusCreated, createRec.Code)

	var created map[string]any
	decodeBody(t, createRec, &created)
	id := created["id"].(string)

	req := httptest.NewRequest(http.MethodGet, "/api/entries/"+id, nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rec := httptest.NewRecorder()
	srv.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)

	var resp map[string]any
	decodeBody(t, rec, &resp)
	assert.Equal(t, true, resp["verified"])
	assert.NotEmpty(t, resp["content_hash"])
}
