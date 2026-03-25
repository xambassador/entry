package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/xambassador/entry/internal/markdown"
	"github.com/xambassador/entry/internal/store"
	"github.com/xambassador/entry/internal/utils"
)

const defaultUserID = "default"

var validMoods = map[string]bool{
	"":         true,
	"great":    true,
	"good":     true,
	"okay":     true,
	"bad":      true,
	"terrible": true,
}

type createEntryRequest struct {
	Date    string   `json:"date"`
	Mood    string   `json:"mood"`
	Emoji   string   `json:"emoji"`
	Tags    []string `json:"tags"`
	Content string   `json:"content"`
}

func (r *createEntryRequest) validate() (string, string) {
	if strings.TrimSpace(r.Date) == "" {
		return "missing_date", "Date is required"
	}
	if _, err := time.Parse("2006-01-02", r.Date); err != nil {
		return "invalid_date", "Date must be in YYYY-MM-DD format"
	}
	if !validMoods[r.Mood] {
		return "invalid_mood", "Mood must be one of: great, good, okay, bad, terrible"
	}
	if strings.TrimSpace(r.Content) == "" {
		return "missing_content", "Content is required"
	}
	return "", ""
}

func (a *API) CreateEntry(w http.ResponseWriter, r *http.Request) {
	body := &createEntryRequest{}
	if err := json.NewDecoder(r.Body).Decode(body); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse("invalid_request_body", "Invalid request body"))
		return
	}

	if code, msg := body.validate(); code != "" {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(code, msg))
		return
	}

	userID := defaultUserID

	exists, err := a.entryStore.ExistsByDate(userID, body.Date)
	if err != nil {
		log.Printf("error checking entry existence: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse("internal_error", "Failed to check existing entry"))
		return
	}
	if exists {
		utils.WriteJSON(w, http.StatusConflict, utils.NewErrorResponse("entry_exists", "An entry already exists for this date"))
		return
	}

	wordCount := markdown.WordCount(body.Content)
	now := time.Now().UTC().Format(time.RFC3339)

	tags := body.Tags
	if tags == nil {
		tags = []string{}
	}

	fm := markdown.Frontmatter{
		Date:      body.Date,
		Mood:      body.Mood,
		Emoji:     body.Emoji,
		CreatedAt: now,
		UpdatedAt: now,
		Tags:      tags,
	}

	relPath, err := markdown.WriteEntry(a.config.DataDir, userID, fm, body.Content)
	if err != nil {
		log.Printf("error writing markdown file: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse("internal_error", "Failed to write entry file"))
		return
	}

	entry, err := a.entryStore.Create(store.CreateEntryParams{
		UserID:    userID,
		Date:      body.Date,
		Mood:      body.Mood,
		Emoji:     body.Emoji,
		FilePath:  relPath,
		WordCount: wordCount,
		Tags:      tags,
	})
	if err != nil {
		log.Printf("error creating entry in db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse("internal_error", "Failed to create entry"))
		return
	}

	fm.ID = entry.ID
	if _, err := markdown.WriteEntry(a.config.DataDir, userID, fm, body.Content); err != nil {
		log.Printf("error updating markdown file with ID: %v", err)
	}

	utils.WriteJSON(w, http.StatusCreated, entry)
}

func (a *API) ListEntries(w http.ResponseWriter, r *http.Request) {
	userID := defaultUserID

	limit := a.config.DefaultLimit
	offset := 0

	if raw := r.URL.Query().Get("limit"); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed < 1 {
			utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse("invalid_limit", "Limit must be a positive integer"))
			return
		}
		if parsed > a.config.MaxLimit {
			parsed = a.config.MaxLimit
		}
		limit = parsed
	}

	if raw := r.URL.Query().Get("offset"); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed < 0 {
			utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse("invalid_offset", "Offset must be a non-negative integer"))
			return
		}
		offset = parsed
	}

	result, err := a.entryStore.List(store.ListEntriesParams{
		UserID: userID,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		log.Printf("error listing entries: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse("internal_error", "Failed to list entries"))
		return
	}

	utils.WriteJSON(w, http.StatusOK, result)
}
