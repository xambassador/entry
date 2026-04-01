package store

import (
	"database/sql"
	"fmt"
)

const schema = `
CREATE TABLE IF NOT EXISTS entries (
	id           TEXT PRIMARY KEY,
	date         TEXT NOT NULL UNIQUE,
	title        TEXT NOT NULL DEFAULT '',
	mood         TEXT NOT NULL DEFAULT '',
	emoji        TEXT NOT NULL DEFAULT '',
	file_path    TEXT NOT NULL,
	word_count   INTEGER NOT NULL DEFAULT 0,
	tags         TEXT NOT NULL DEFAULT '[]',
	content_hash TEXT NOT NULL DEFAULT '',
	created_at   TEXT NOT NULL,
	updated_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);

CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts USING fts5(
	title,
	tags,
	content=entries,
	content_rowid=rowid,
	tokenize='unicode61'
);

-- Keep FTS index in sync with the entries table.
CREATE TRIGGER IF NOT EXISTS entries_fts_insert AFTER INSERT ON entries BEGIN
	INSERT INTO entries_fts(rowid, title, tags) VALUES (new.rowid, new.title, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS entries_fts_update AFTER UPDATE ON entries BEGIN
	INSERT INTO entries_fts(entries_fts, rowid, title, tags) VALUES ('delete', old.rowid, old.title, old.tags);
	INSERT INTO entries_fts(rowid, title, tags) VALUES (new.rowid, new.title, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS entries_fts_delete AFTER DELETE ON entries BEGIN
	INSERT INTO entries_fts(entries_fts, rowid, title, tags) VALUES ('delete', old.rowid, old.title, old.tags);
END;

CREATE TABLE IF NOT EXISTS sessions (
	id         TEXT PRIMARY KEY,
	token_hash TEXT NOT NULL UNIQUE,
	ip_address TEXT NOT NULL DEFAULT '',
	user_agent TEXT NOT NULL DEFAULT '',
	created_at TEXT NOT NULL,
	expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
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
