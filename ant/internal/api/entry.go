package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/xambassador/entry/internal/markdown"
	"github.com/xambassador/entry/internal/store"
	"github.com/xambassador/entry/internal/utils"
)

const defaultUserID = "default"

func (a *API) CreateEntry(w http.ResponseWriter, r *http.Request) {
	body := &createEntryRequest{}
	if err := json.NewDecoder(r.Body).Decode(body); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(ErrInvalidRequestBody, "Invalid request body"))
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
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to check existing entry"))
		return
	}
	if exists {
		utils.WriteJSON(w, http.StatusConflict, utils.NewErrorResponse(ErrEntryAlreadyExists, "An entry already exists for this date"))
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
		Title:     body.Title,
		Mood:      body.Mood,
		Emoji:     body.Emoji,
		CreatedAt: now,
		UpdatedAt: now,
		Tags:      tags,
	}

	relPath, err := markdown.WriteEntry(a.config.DataDir, userID, fm, body.Content)
	if err != nil {
		log.Printf("error writing markdown file: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to write entry file"))
		return
	}

	entry, err := a.entryStore.Create(store.CreateEntryParams{
		UserID:    userID,
		Date:      body.Date,
		Title:     body.Title,
		Mood:      body.Mood,
		Emoji:     body.Emoji,
		FilePath:  relPath,
		WordCount: wordCount,
		Tags:      tags,
	})
	if err != nil {
		log.Printf("error creating entry in db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to create entry"))
		return
	}

	fm.ID = entry.ID
	if _, err := markdown.WriteEntry(a.config.DataDir, userID, fm, body.Content); err != nil {
		log.Printf("error updating markdown file with ID: %v", err)
	}

	utils.WriteJSON(w, http.StatusCreated, entry)
}

type getEntryResponse struct {
	Content string `json:"content"`
	store.Entry
}

func (a *API) GetEntry(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	entry, err := a.entryStore.GetByID(defaultUserID, id)

	if err != nil {
		log.Printf("error getting entry: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to get entry"))
		return
	}
	if entry == nil {
		utils.WriteJSON(w, http.StatusNotFound, utils.NewErrorResponse(ErrEntryNotFound, "Entry not found"))
		return
	}

	content, err := markdown.GetEntryContent(a.config.DataDir, defaultUserID, entry.FilePath)
	if err != nil {
		log.Printf("error getting entry content: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to get entry content"))
		return
	}

	response := getEntryResponse{
		Content: markdown.RemoveFrontmatter(content),
		Entry:   *entry,
	}

	utils.WriteJSON(w, http.StatusOK, response)
}

func (a *API) UpdateEntry(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	body := &updateEntryRequest{}
	if err := json.NewDecoder(r.Body).Decode(body); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(ErrInvalidRequestBody, "Invalid request body"))
		return
	}

	if code, msg := body.validate(); code != "" {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(code, msg))
		return
	}

	entry, err := a.entryStore.GetByID(defaultUserID, id)
	if err != nil {
		log.Printf("error getting entry: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to get entry"))
		return
	}

	if entry == nil {
		utils.WriteJSON(w, http.StatusNotFound, utils.NewErrorResponse(ErrEntryNotFound, "Entry not found"))
		return
	}

	tags := body.Tags
	if tags == nil {
		tags = []string{}
	}

	wordCount := markdown.WordCount(body.Content)
	now := time.Now().UTC().Format(time.RFC3339)

	fm := markdown.Frontmatter{
		ID:        entry.ID,
		Date:      entry.Date,
		Title:     body.Title,
		Mood:      body.Mood,
		Emoji:     body.Emoji,
		CreatedAt: entry.CreatedAt,
		UpdatedAt: now,
		Tags:      tags,
	}

	relPath, err := markdown.WriteEntry(a.config.DataDir, defaultUserID, fm, body.Content)
	if err != nil {
		log.Printf("error writing markdown file: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to write entry file"))
		return
	}

	updated, err := a.entryStore.Update(store.UpdateEntryParams{
		UserID:    defaultUserID,
		ID:        entry.ID,
		Title:     body.Title,
		Mood:      body.Mood,
		Emoji:     body.Emoji,
		WordCount: wordCount,
		Tags:      tags,
		FilePath:  relPath,
	})
	if err != nil {
		log.Printf("error updating entry in db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to update entry"))
		return
	}

	response := getEntryResponse{
		Content: body.Content,
		Entry:   *updated,
	}

	utils.WriteJSON(w, http.StatusOK, response)
}

func (a *API) ListEntries(w http.ResponseWriter, r *http.Request) {
	m := r.URL.Query().Get("month")
	y := r.URL.Query().Get("year")

	month, err := getMonthFromQuery(m)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(ErrInvalidMonth, err.Error()))
		return
	}

	year, err := getYearFromQuery(y)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(ErrInvalidYear, err.Error()))
		return
	}

	userID := defaultUserID

	limit, offset, err := getLimitAndOffsetFromQuery(r, a.config.DefaultLimit, a.config.MaxLimit)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(ErrInvalidLimitOrOffset, err.Error()))
		return
	}

	result, err := a.entryStore.List(store.ListEntriesParams{
		UserID: userID,
		Limit:  limit,
		Offset: offset,
		Month:  month,
		Year:   year,
	})
	if err != nil {
		log.Printf("error listing entries: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to list entries"))
		return
	}

	utils.WriteJSON(w, http.StatusOK, result)
}

func (a *API) SearchEntries(w http.ResponseWriter, r *http.Request) {
	userID := defaultUserID

	q := strings.TrimSpace(r.URL.Query().Get("q"))
	rawTags := r.URL.Query().Get("tags")

	var tags []string
	if rawTags != "" {
		for t := range strings.SplitSeq(rawTags, ",") {
			if trimmed := strings.TrimSpace(t); trimmed != "" {
				tags = append(tags, trimmed)
			}
		}
	}

	if q == "" && len(tags) == 0 {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(ErrMissingQuery, "At least one of 'q' (title search) or 'tags' must be provided"))
		return
	}

	limit, offset, err := getLimitAndOffsetFromQuery(r, a.config.DefaultLimit, a.config.MaxLimit)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(ErrInvalidLimitOrOffset, err.Error()))
		return
	}

	result, err := a.entryStore.Search(store.SearchEntriesParams{
		UserID: userID,
		Query:  q,
		Tags:   tags,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		log.Printf("error searching entries: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to search entries"))
		return
	}

	utils.WriteJSON(w, http.StatusOK, result)
}

func (a *API) YearAtGlance(w http.ResponseWriter, r *http.Request) {
	userID := defaultUserID
	y := r.URL.Query().Get("year")

	year, err := getYearFromQuery(y)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(ErrInvalidYear, err.Error()))
		return
	}

	result, err := a.entryStore.YearAtGlance(store.YearAtGlanceParams{
		UserID: userID,
		Year:   year,
	})
	if err != nil {
		log.Printf("error getting year at glance: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to get year at glance"))
		return
	}

	utils.WriteJSON(w, http.StatusOK, result)
}
