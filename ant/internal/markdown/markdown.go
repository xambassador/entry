package markdown

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type Frontmatter struct {
	ID        string   `yaml:"id"`
	Date      string   `yaml:"date"`
	Title     string   `yaml:"title"`
	Mood      string   `yaml:"mood"`
	Emoji     string   `yaml:"emoji"`
	CreatedAt string   `yaml:"created_at"`
	UpdatedAt string   `yaml:"updated_at"`
	Tags      []string `yaml:"tags"`
	Signature string   `yaml:"signature"`
}

func WriteEntry(dataDir string, fm Frontmatter, content string, hmacKey []byte) (relPath string, contentHash string, err error) {
	date, err := time.Parse("2006-01-02", fm.Date)
	if err != nil {
		return "", "", fmt.Errorf("invalid date format: %w", err)
	}

	relPath = filepath.Join("entries", date.Format("2006"), date.Format("01"), fm.Date+".md")
	fullPath := filepath.Join(dataDir, relPath)

	if err := os.MkdirAll(filepath.Dir(fullPath), 0o755); err != nil {
		return "", "", fmt.Errorf("failed to create directory: %w", err)
	}

	file, err := os.Create(fullPath)
	if err != nil {
		return "", "", fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	signature := computeSignature(fm, content, hmacKey)
	fm.Signature = signature

	fileContent := buildFileContent(fm, content)

	if _, err := file.WriteString(fileContent); err != nil {
		return "", "", fmt.Errorf("failed to write file: %w", err)
	}

	contentHash = sha256Hash(fileContent)

	return relPath, contentHash, nil
}

// computeSignature creates an HMAC-SHA256 over the canonical representation
// of the entry (all frontmatter fields except signature + body content).
func computeSignature(fm Frontmatter, content string, key []byte) string {
	var b strings.Builder
	fmt.Fprintf(&b, "id:%s\n", fm.ID)
	fmt.Fprintf(&b, "date:%s\n", fm.Date)
	fmt.Fprintf(&b, "title:%s\n", fm.Title)
	fmt.Fprintf(&b, "mood:%s\n", fm.Mood)
	fmt.Fprintf(&b, "emoji:%s\n", fm.Emoji)
	fmt.Fprintf(&b, "created_at:%s\n", fm.CreatedAt)
	fmt.Fprintf(&b, "updated_at:%s\n", fm.UpdatedAt)
	for _, tag := range fm.Tags {
		fmt.Fprintf(&b, "tag:%s\n", tag)
	}
	fmt.Fprintf(&b, "content:%s\n", content)

	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(b.String()))
	return hex.EncodeToString(mac.Sum(nil))
}

// VerifySignature checks if the file's HMAC signature is valid.
func VerifySignature(fm Frontmatter, content string, hmacKey []byte) bool {
	expected := computeSignature(fm, content, hmacKey)
	return hmac.Equal([]byte(fm.Signature), []byte(expected))
}

func buildFileContent(fm Frontmatter, content string) string {
	var b strings.Builder
	b.WriteString("---\n")
	fmt.Fprintf(&b, "id: %q\n", fm.ID)
	fmt.Fprintf(&b, "date: %q\n", fm.Date)
	fmt.Fprintf(&b, "title: %q\n", fm.Title)
	fmt.Fprintf(&b, "mood: %q\n", fm.Mood)
	fmt.Fprintf(&b, "emoji: %q\n", fm.Emoji)
	fmt.Fprintf(&b, "created_at: %q\n", fm.CreatedAt)
	fmt.Fprintf(&b, "updated_at: %q\n", fm.UpdatedAt)
	if len(fm.Tags) > 0 {
		b.WriteString("tags: [")
		for i, tag := range fm.Tags {
			if i > 0 {
				b.WriteString(", ")
			}
			fmt.Fprintf(&b, "%q", tag)
		}
		b.WriteString("]\n")
	} else {
		b.WriteString("tags: []\n")
	}
	fmt.Fprintf(&b, "signature: %q\n", fm.Signature)
	b.WriteString("---\n\n")
	b.WriteString(content)
	if !strings.HasSuffix(content, "\n") {
		b.WriteString("\n")
	}
	return b.String()
}

func sha256Hash(content string) string {
	h := sha256.Sum256([]byte(content))
	return hex.EncodeToString(h[:])
}

// ContentHash computes the SHA-256 hash of a file's content.
func ContentHash(dataDir, filePath string) (string, error) {
	fullPath := filepath.Join(dataDir, filePath)
	data, err := os.ReadFile(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}
	return sha256Hash(string(data)), nil
}

func WordCount(s string) int {
	return len(strings.Fields(s))
}

func GetEntryContent(dataDir, filePath string) (string, error) {
	fullPath := filepath.Join(dataDir, filePath)
	contentBytes, err := os.ReadFile(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}
	return string(contentBytes), nil
}

func RemoveFrontmatter(content string) string {
	lines := strings.Split(content, "\n")
	if len(lines) < 3 || lines[0] != "---" {
		return content
	}
	endIndex := -1
	for i := 1; i < len(lines); i++ {
		if lines[i] == "---" {
			endIndex = i
			break
		}
	}
	if endIndex == -1 {
		return content
	}
	return strings.Trim(strings.Join(lines[endIndex+1:], "\n"), "\n")
}
