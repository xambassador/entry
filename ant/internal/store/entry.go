package store

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/oklog/ulid/v2"
)

type Entry struct {
	ID          string   `json:"id"`
	Date        string   `json:"date"`
	Title       string   `json:"title"`
	Mood        string   `json:"mood"`
	Emoji       string   `json:"emoji"`
	FilePath    string   `json:"file_path"`
	WordCount   int      `json:"word_count"`
	Tags        []string `json:"tags"`
	ContentHash string   `json:"content_hash"`
	CreatedAt   string   `json:"created_at"`
	UpdatedAt   string   `json:"updated_at"`
}

type EntryStore struct {
	db *sql.DB
}

func NewEntryStore(db *sql.DB) *EntryStore {
	return &EntryStore{db: db}
}

type CreateEntryParams struct {
	Date        string
	Title       string
	Mood        string
	Emoji       string
	FilePath    string
	WordCount   int
	Tags        []string
	ContentHash string
}

func (s *EntryStore) Create(p CreateEntryParams) (*Entry, error) {
	id := ulid.Make().String()
	now := time.Now().UTC().Format(time.RFC3339)

	tags := p.Tags
	if tags == nil {
		tags = []string{}
	}
	tagsJSON, err := json.Marshal(tags)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal tags: %w", err)
	}

	_, err = s.db.Exec(`
		INSERT INTO entries (id, date, title, mood, emoji, file_path, word_count, tags, content_hash, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		id, p.Date, p.Title, p.Mood, p.Emoji, p.FilePath, p.WordCount, string(tagsJSON), p.ContentHash, now, now,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert entry: %w", err)
	}

	return &Entry{
		ID:          id,
		Date:        p.Date,
		Title:       p.Title,
		Mood:        p.Mood,
		Emoji:       p.Emoji,
		FilePath:    p.FilePath,
		WordCount:   p.WordCount,
		Tags:        tags,
		ContentHash: p.ContentHash,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

type ListEntriesParams struct {
	Limit  int
	Offset int
	Month  int
	Year   int
}

type ListEntriesResult struct {
	Entries []Entry `json:"entries"`
	Total   int     `json:"total"`
	Limit   int     `json:"limit"`
	Offset  int     `json:"offset"`
}

func (s *EntryStore) List(p ListEntriesParams) (*ListEntriesResult, error) {
	var total int
	query := `SELECT COUNT(*) FROM entries WHERE 1=1`
	args := []any{}
	if p.Month != 0 {
		query += " AND strftime('%m', date) = ?"
		args = append(args, fmt.Sprintf("%02d", p.Month))
	}

	if p.Year != 0 {
		query += " AND strftime('%Y', date) = ?"
		args = append(args, fmt.Sprintf("%04d", p.Year))
	}

	err := s.db.QueryRow(query, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count entries: %w", err)
	}

	rows, err := s.db.Query(`
		SELECT id, date, title, mood, emoji, file_path, word_count, tags, content_hash, created_at, updated_at
		FROM entries
		WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
		ORDER BY date DESC
		LIMIT ? OFFSET ?`,
		fmt.Sprintf("%02d", p.Month), fmt.Sprintf("%04d", p.Year), p.Limit, p.Offset,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to list entries: %w", err)
	}
	defer rows.Close()

	entries := []Entry{}
	for rows.Next() {
		var e Entry
		var tagsJSON string
		if err := rows.Scan(&e.ID, &e.Date, &e.Title, &e.Mood, &e.Emoji, &e.FilePath, &e.WordCount, &tagsJSON, &e.ContentHash, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan entry: %w", err)
		}
		if err := json.Unmarshal([]byte(tagsJSON), &e.Tags); err != nil {
			e.Tags = []string{}
		}
		entries = append(entries, e)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating entries: %w", err)
	}

	return &ListEntriesResult{
		Entries: entries,
		Total:   total,
		Limit:   p.Limit,
		Offset:  p.Offset,
	}, nil
}

func (s *EntryStore) GetByID(id string) (*Entry, error) {
	var e Entry
	var tagsJSON string
	err := s.db.QueryRow(`
		SELECT id, date, title, mood, emoji, file_path, word_count, tags, content_hash, created_at, updated_at
		FROM entries WHERE id = ?`, id).
		Scan(&e.ID, &e.Date, &e.Title, &e.Mood, &e.Emoji, &e.FilePath, &e.WordCount, &tagsJSON, &e.ContentHash, &e.CreatedAt, &e.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get entry: %w", err)
	}
	if err := json.Unmarshal([]byte(tagsJSON), &e.Tags); err != nil {
		e.Tags = []string{}
	}
	return &e, nil
}

type UpdateEntryParams struct {
	ID          string
	Title       string
	Mood        string
	Emoji       string
	WordCount   int
	Tags        []string
	FilePath    string
	ContentHash string
}

func (s *EntryStore) Update(p UpdateEntryParams) (*Entry, error) {
	now := time.Now().UTC().Format(time.RFC3339)

	tags := p.Tags
	if tags == nil {
		tags = []string{}
	}
	tagsJSON, err := json.Marshal(tags)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal tags: %w", err)
	}

	result, err := s.db.Exec(`
		UPDATE entries
		SET title = ?, mood = ?, emoji = ?, word_count = ?, tags = ?, file_path = ?, content_hash = ?, updated_at = ?
		WHERE id = ?`,
		p.Title, p.Mood, p.Emoji, p.WordCount, string(tagsJSON), p.FilePath, p.ContentHash, now, p.ID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update entry: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return nil, nil
	}

	return s.GetByID(p.ID)
}

type SearchEntriesParams struct {
	Query  string
	Tags   []string
	Limit  int
	Offset int
}

type SearchEntriesResult struct {
	Entries []Entry `json:"entries"`
	Total   int     `json:"total"`
	Limit   int     `json:"limit"`
	Offset  int     `json:"offset"`
}

func (s *EntryStore) Search(p SearchEntriesParams) (*SearchEntriesResult, error) {
	matchParts := []string{}
	if p.Query != "" {
		matchParts = append(matchParts, `{title} : `+ftsQuote(p.Query)+"*")
	}
	for _, tag := range p.Tags {
		matchParts = append(matchParts, `{tags} : `+ftsQuote(tag))
	}
	matchExpr := strings.Join(matchParts, " OR ")

	const selectCols = `e.id, e.date, e.title, e.mood, e.emoji, e.file_path, e.word_count, e.tags, e.content_hash, e.created_at, e.updated_at`
	const baseQuery = `
		FROM entries e
		JOIN entries_fts fts ON fts.rowid = e.rowid
		WHERE entries_fts MATCH ?`

	var total int
	if err := s.db.QueryRow(`SELECT COUNT(*) `+baseQuery, matchExpr).Scan(&total); err != nil {
		return nil, fmt.Errorf("failed to count fts search results: %w", err)
	}

	rows, err := s.db.Query(
		`SELECT `+selectCols+baseQuery+` ORDER BY e.date DESC LIMIT ? OFFSET ?`,
		matchExpr, p.Limit, p.Offset,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to fts search entries: %w", err)
	}
	defer rows.Close()

	entries := []Entry{}
	for rows.Next() {
		var e Entry
		var tagsJSON string
		if err := rows.Scan(&e.ID, &e.Date, &e.Title, &e.Mood, &e.Emoji, &e.FilePath, &e.WordCount, &tagsJSON, &e.ContentHash, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan entry: %w", err)
		}
		if err := json.Unmarshal([]byte(tagsJSON), &e.Tags); err != nil {
			e.Tags = []string{}
		}
		entries = append(entries, e)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating fts search results: %w", err)
	}

	return &SearchEntriesResult{
		Entries: entries,
		Total:   total,
		Limit:   p.Limit,
		Offset:  p.Offset,
	}, nil
}

func ftsQuote(s string) string {
	return `"` + strings.ReplaceAll(s, `"`, `""`) + `"`
}

func (s *EntryStore) ExistsByDate(date string) (bool, error) {
	var count int
	err := s.db.QueryRow(`SELECT COUNT(*) FROM entries WHERE date = ?`, date).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check entry existence: %w", err)
	}
	return count > 0, nil
}

type YearAtGlanceParams struct {
	Year int
}

type YearAtGlanceEntry struct {
	ID    string `json:"id"`
	Date  string `json:"date"`
	Emoji string `json:"emoji"`
}

type YearAtGlanceResult struct {
	Entries []YearAtGlanceEntry `json:"entries"`
	Total   int                 `json:"total"`
}

func (s *EntryStore) YearAtGlance(p YearAtGlanceParams) (*YearAtGlanceResult, error) {
	var total int
	err := s.db.QueryRow(`
		SELECT COUNT(*) FROM entries
		WHERE strftime('%Y', date) = ?`,
		fmt.Sprintf("%04d", p.Year),
	).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count entries for year: %w", err)
	}

	rows, err := s.db.Query(`
		SELECT id, date, emoji FROM entries
		WHERE strftime('%Y', date) = ?
		ORDER BY date DESC`,
		fmt.Sprintf("%04d", p.Year),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query entries for year: %w", err)
	}
	defer rows.Close()

	entries := []YearAtGlanceEntry{}
	for rows.Next() {
		var e YearAtGlanceEntry
		if err := rows.Scan(&e.ID, &e.Date, &e.Emoji); err != nil {
			return nil, fmt.Errorf("failed to scan entry: %w", err)
		}
		entries = append(entries, e)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating entries for year: %w", err)
	}

	return &YearAtGlanceResult{
		Entries: entries,
		Total:   total,
	}, nil
}
