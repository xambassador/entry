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
	ID        string   `json:"id"`
	UserID    string   `json:"user_id"`
	Date      string   `json:"date"`
	Title     string   `json:"title"`
	Mood      string   `json:"mood"`
	Emoji     string   `json:"emoji"`
	FilePath  string   `json:"file_path"`
	WordCount int      `json:"word_count"`
	Tags      []string `json:"tags"`
	CreatedAt string   `json:"created_at"`
	UpdatedAt string   `json:"updated_at"`
}

type EntryStore struct {
	db *sql.DB
}

func NewEntryStore(db *sql.DB) *EntryStore {
	return &EntryStore{db: db}
}

type CreateEntryParams struct {
	UserID    string
	Date      string
	Title     string
	Mood      string
	Emoji     string
	FilePath  string
	WordCount int
	Tags      []string
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
		INSERT INTO entries (id, user_id, date, title, mood, emoji, file_path, word_count, tags, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		id, p.UserID, p.Date, p.Title, p.Mood, p.Emoji, p.FilePath, p.WordCount, string(tagsJSON), now, now,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert entry: %w", err)
	}

	return &Entry{
		ID:        id,
		UserID:    p.UserID,
		Date:      p.Date,
		Title:     p.Title,
		Mood:      p.Mood,
		Emoji:     p.Emoji,
		FilePath:  p.FilePath,
		WordCount: p.WordCount,
		Tags:      tags,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

type ListEntriesParams struct {
	UserID string
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
	query := `SELECT COUNT(*) FROM entries WHERE user_id = ?`
	args := []any{p.UserID}
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
		SELECT id, user_id, date, title, mood, emoji, file_path, word_count, tags, created_at, updated_at
		FROM entries
		WHERE user_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
		ORDER BY date DESC
		LIMIT ? OFFSET ?`,
		p.UserID, fmt.Sprintf("%02d", p.Month), fmt.Sprintf("%04d", p.Year), p.Limit, p.Offset,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to list entries: %w", err)
	}
	defer rows.Close()

	entries := []Entry{}
	for rows.Next() {
		var e Entry
		var tagsJSON string
		if err := rows.Scan(&e.ID, &e.UserID, &e.Date, &e.Title, &e.Mood, &e.Emoji, &e.FilePath, &e.WordCount, &tagsJSON, &e.CreatedAt, &e.UpdatedAt); err != nil {
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

func (s *EntryStore) GetByID(userID, id string) (*Entry, error) {
	var e Entry
	var tagsJSON string
	err := s.db.QueryRow(`
		SELECT id, user_id, date, title, mood, emoji, file_path, word_count, tags, created_at, updated_at
		FROM entries WHERE user_id = ? AND id = ?`, userID, id).
		Scan(&e.ID, &e.UserID, &e.Date, &e.Title, &e.Mood, &e.Emoji, &e.FilePath, &e.WordCount, &tagsJSON, &e.CreatedAt, &e.UpdatedAt)
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
	UserID    string
	ID        string
	Title     string
	Mood      string
	Emoji     string
	WordCount int
	Tags      []string
	FilePath  string
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
		SET title = ?, mood = ?, emoji = ?, word_count = ?, tags = ?, file_path = ?, updated_at = ?
		WHERE user_id = ? AND id = ?`,
		p.Title, p.Mood, p.Emoji, p.WordCount, string(tagsJSON), p.FilePath, now, p.UserID, p.ID,
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

	return s.GetByID(p.UserID, p.ID)
}

type SearchEntriesParams struct {
	UserID string
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

	const selectCols = `e.id, e.user_id, e.date, e.title, e.mood, e.emoji, e.file_path, e.word_count, e.tags, e.created_at, e.updated_at`
	const baseQuery = `
		FROM entries e
		JOIN entries_fts fts ON fts.rowid = e.rowid
		WHERE e.user_id = ? AND entries_fts MATCH ?`

	var total int
	if err := s.db.QueryRow(`SELECT COUNT(*) `+baseQuery, p.UserID, matchExpr).Scan(&total); err != nil {
		return nil, fmt.Errorf("failed to count fts search results: %w", err)
	}

	rows, err := s.db.Query(
		`SELECT `+selectCols+baseQuery+` ORDER BY e.date DESC LIMIT ? OFFSET ?`,
		p.UserID, matchExpr, p.Limit, p.Offset,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to fts search entries: %w", err)
	}
	defer rows.Close()

	entries := []Entry{}
	for rows.Next() {
		var e Entry
		var tagsJSON string
		if err := rows.Scan(&e.ID, &e.UserID, &e.Date, &e.Title, &e.Mood, &e.Emoji, &e.FilePath, &e.WordCount, &tagsJSON, &e.CreatedAt, &e.UpdatedAt); err != nil {
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

func (s *EntryStore) ExistsByDate(userID, date string) (bool, error) {
	var count int
	err := s.db.QueryRow(`SELECT COUNT(*) FROM entries WHERE user_id = ? AND date = ?`, userID, date).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check entry existence: %w", err)
	}
	return count > 0, nil
}
