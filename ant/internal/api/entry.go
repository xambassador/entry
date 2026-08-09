package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/xambassador/entry/internal/markdown"
	"github.com/xambassador/entry/internal/store"
	"github.com/xambassador/entry/internal/utils"
)

const entryExcerptLen = 160

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

	exists, err := a.entryStore.ExistsByDate(body.Date)
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

	tags := body.Tags
	if tags == nil {
		tags = []string{}
	}

	entry, err := a.entryStore.Create(store.CreateEntryParams{
		Date:      body.Date,
		Title:     body.Title,
		Mood:      body.Mood,
		Emoji:     body.Emoji,
		Content:   body.Content,
		WordCount: wordCount,
		Tags:      tags,
	})
	if err != nil {
		log.Printf("error creating entry in db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to create entry"))
		return
	}

	utils.WriteJSON(w, http.StatusCreated, entry)
}

type getEntryResponse struct {
	Content string `json:"content"`
	store.Entry
}

func (a *API) GetEntry(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	entry, err := a.entryStore.GetByID(id)
	if err != nil {
		log.Printf("error getting entry: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to get entry"))
		return
	}
	if entry == nil {
		utils.WriteJSON(w, http.StatusNotFound, utils.NewErrorResponse(ErrEntryNotFound, "Entry not found"))
		return
	}

	response := getEntryResponse{
		Content: entry.Content,
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

	entry, err := a.entryStore.GetByID(id)
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

	updated, err := a.entryStore.Update(store.UpdateEntryParams{
		ID:        entry.ID,
		Title:     body.Title,
		Mood:      body.Mood,
		Emoji:     body.Emoji,
		Content:   body.Content,
		WordCount: wordCount,
		Tags:      tags,
	})
	if err != nil {
		log.Printf("error updating entry in db: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to update entry"))
		return
	}

	response := getEntryResponse{
		Content: updated.Content,
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

	limit, offset, err := getLimitAndOffsetFromQuery(r, a.config.DefaultLimit, a.config.MaxLimit)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(ErrInvalidLimitOrOffset, err.Error()))
		return
	}

	result, err := a.entryStore.List(store.ListEntriesParams{
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

	for i := range result.Entries {
		e := &result.Entries[i]
		e.Excerpt = markdown.Excerpt(e.Content, entryExcerptLen)
		e.Image = markdown.RandomImage(e.Content)
	}

	utils.WriteJSON(w, http.StatusOK, result)
}

func (a *API) SearchEntries(w http.ResponseWriter, r *http.Request) {
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
	y := r.URL.Query().Get("year")

	year, err := getYearFromQuery(y)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(ErrInvalidYear, err.Error()))
		return
	}

	result, err := a.entryStore.YearAtGlance(store.YearAtGlanceParams{
		Year: year,
	})
	if err != nil {
		log.Printf("error getting year at glance: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to get year at glance"))
		return
	}

	utils.WriteJSON(w, http.StatusOK, result)
}
