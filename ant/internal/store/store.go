package store

import (
	"database/sql"
	"fmt"
)

const schema = `
CREATE TABLE IF NOT EXISTS entries (
	id         TEXT PRIMARY KEY,
	user_id    TEXT NOT NULL DEFAULT 'default',
	date       TEXT NOT NULL,
	mood       TEXT NOT NULL DEFAULT '',
	emoji      TEXT NOT NULL DEFAULT '',
	file_path  TEXT NOT NULL,
	word_count INTEGER NOT NULL DEFAULT 0,
	tags       TEXT NOT NULL DEFAULT '[]',
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL,
	UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
`

func Migrate(db *sql.DB) error {
	if _, err := db.Exec("PRAGMA journal_mode=WAL"); err != nil {
		return fmt.Errorf("failed to set WAL mode: %w", err)
	}
	if _, err := db.Exec("PRAGMA foreign_keys=ON"); err != nil {
		return fmt.Errorf("failed to enable foreign keys: %w", err)
	}
	if _, err := db.Exec(schema); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}
	return nil
}
