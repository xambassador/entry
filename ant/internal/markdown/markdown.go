package markdown

import (
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
}

func WriteEntry(dataDir, userID string, fm Frontmatter, content string) (string, error) {
	date, err := time.Parse("2006-01-02", fm.Date)
	if err != nil {
		return "", fmt.Errorf("invalid date format: %w", err)
	}

	relPath := filepath.Join(userID, "entries", date.Format("2006"), date.Format("01"), fm.Date+".md")
	fullPath := filepath.Join(dataDir, relPath)

	if err := os.MkdirAll(filepath.Dir(fullPath), 0o755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	file, err := os.Create(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

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
	b.WriteString("---\n\n")
	b.WriteString(content)
	if !strings.HasSuffix(content, "\n") {
		b.WriteString("\n")
	}

	if _, err := file.WriteString(b.String()); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	return relPath, nil
}

func WordCount(s string) int {
	return len(strings.Fields(s))
}

func GetEntryContent(dataDir, userID, filePath string) (string, error) {
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
