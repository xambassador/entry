package api

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/xambassador/entry/internal/utils"
)

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
	Title   string   `json:"title"`
	Mood    string   `json:"mood"`
	Emoji   string   `json:"emoji"`
	Tags    []string `json:"tags"`
	Content string   `json:"content"`
}

func (r *createEntryRequest) validate() (string, string) {
	if strings.TrimSpace(r.Title) == "" {
		return "missing_title", "Title is required"
	}
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

type updateEntryRequest struct {
	Title   string   `json:"title"`
	Mood    string   `json:"mood"`
	Emoji   string   `json:"emoji"`
	Tags    []string `json:"tags"`
	Content string   `json:"content"`
}

func (r *updateEntryRequest) validate() (string, string) {
	if !validMoods[r.Mood] {
		return "invalid_mood", "Mood must be one of: great, good, okay, bad, terrible"
	}
	if strings.TrimSpace(r.Content) == "" {
		return "missing_content", "Content is required"
	}
	return "", ""
}

func getMonthFromQuery(m string) (int, error) {
	if m == "" {
		return int(time.Now().UTC().Month()), nil
	}

	month, err := strconv.Atoi(m)
	if err != nil || month < 1 || month > 12 {
		return 0, fmt.Errorf("invalid month: %s", m)
	}

	return month, nil
}

func getYearFromQuery(y string) (int, error) {
	if y == "" {
		return time.Now().UTC().Year(), nil
	}

	year, err := strconv.Atoi(y)
	if err != nil || year < 1900 || year > time.Now().UTC().Year() {
		return 0, fmt.Errorf("invalid year: %s", y)
	}

	return year, nil
}

func getLimitAndOffsetFromQuery(r *http.Request, defaultLimit, maxLimit int) (int, int, error) {
	limit := defaultLimit
	offset := 0

	if raw := r.URL.Query().Get("limit"); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed < 1 {
			return 0, 0, fmt.Errorf("invalid limit: %s", raw)
		}
		limit = utils.Clamp(parsed, 1, maxLimit)
	}

	if raw := r.URL.Query().Get("offset"); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed < 0 {
			return 0, 0, fmt.Errorf("invalid offset: %s", raw)
		}
		offset = parsed
	}

	return limit, offset, nil
}
