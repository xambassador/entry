package store

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/oklog/ulid/v2"
)

type Session struct {
	ID        string `json:"id"`
	TokenHash string `json:"-"`
	IPAddress string `json:"ip_address"`
	UserAgent string `json:"user_agent"`
	CreatedAt string `json:"created_at"`
	ExpiresAt string `json:"expires_at"`
}

type SessionStore struct {
	db *sql.DB
}

func NewSessionStore(db *sql.DB) *SessionStore {
	return &SessionStore{db: db}
}

// GenerateToken creates a cryptographically random token and returns both
// the plaintext token (to send to the client) and the SHA-256 hash (to store in DB).
func GenerateToken() (plaintext string, hash string, err error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", "", fmt.Errorf("failed to generate random token: %w", err)
	}
	plaintext = hex.EncodeToString(b)
	hash = HashToken(plaintext)
	return plaintext, hash, nil
}

// HashToken computes the SHA-256 hash of a token string.
func HashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}

type CreateSessionParams struct {
	IPAddress string
	UserAgent string
	Duration  time.Duration
}

// Create inserts a new session and returns the session with the plaintext token.
func (s *SessionStore) Create(p CreateSessionParams) (*Session, string, error) {
	id := ulid.Make().String()
	plaintext, tokenHash, err := GenerateToken()
	if err != nil {
		return nil, "", err
	}

	now := time.Now().UTC()
	expiresAt := now.Add(p.Duration)

	_, err = s.db.Exec(`
		INSERT INTO sessions (id, token_hash, ip_address, user_agent, created_at, expires_at)
		VALUES (?, ?, ?, ?, ?, ?)`,
		id, tokenHash, p.IPAddress, p.UserAgent,
		now.Format(time.RFC3339), expiresAt.Format(time.RFC3339),
	)
	if err != nil {
		return nil, "", fmt.Errorf("failed to insert session: %w", err)
	}

	session := &Session{
		ID:        id,
		TokenHash: tokenHash,
		IPAddress: p.IPAddress,
		UserAgent: p.UserAgent,
		CreatedAt: now.Format(time.RFC3339),
		ExpiresAt: expiresAt.Format(time.RFC3339),
	}

	return session, plaintext, nil
}

// GetByToken looks up a session by its plaintext token. Returns nil if not found or expired.
func (s *SessionStore) GetByToken(token string) (*Session, error) {
	tokenHash := HashToken(token)

	var sess Session
	err := s.db.QueryRow(`
		SELECT id, token_hash, ip_address, user_agent, created_at, expires_at
		FROM sessions
		WHERE token_hash = ?`, tokenHash).
		Scan(&sess.ID, &sess.TokenHash, &sess.IPAddress, &sess.UserAgent, &sess.CreatedAt, &sess.ExpiresAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}

	expiresAt, err := time.Parse(time.RFC3339, sess.ExpiresAt)
	if err != nil {
		return nil, fmt.Errorf("failed to parse session expiry: %w", err)
	}
	if time.Now().UTC().After(expiresAt) {
		// Expired — clean it up and return nil.
		_, _ = s.db.Exec(`DELETE FROM sessions WHERE id = ?`, sess.ID)
		return nil, nil
	}

	return &sess, nil
}

// Delete removes a session by ID.
func (s *SessionStore) Delete(id string) error {
	_, err := s.db.Exec(`DELETE FROM sessions WHERE id = ?`, id)
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}
	return nil
}

// DeleteByToken removes a session by its plaintext token.
func (s *SessionStore) DeleteByToken(token string) error {
	tokenHash := HashToken(token)
	_, err := s.db.Exec(`DELETE FROM sessions WHERE token_hash = ?`, tokenHash)
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}
	return nil
}

// DeleteExpired removes all expired sessions.
func (s *SessionStore) DeleteExpired() (int64, error) {
	now := time.Now().UTC().Format(time.RFC3339)
	result, err := s.db.Exec(`DELETE FROM sessions WHERE expires_at < ?`, now)
	if err != nil {
		return 0, fmt.Errorf("failed to delete expired sessions: %w", err)
	}
	return result.RowsAffected()
}
