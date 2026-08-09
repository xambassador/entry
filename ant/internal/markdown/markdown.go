package markdown

import (
	"math/rand"
	"regexp"
	"strings"
)

var (
	imageRe    = regexp.MustCompile(`!\[[^\]]*\]\(([^)]+)\)`)
	linkRe     = regexp.MustCompile(`\[([^\]]*)\]\([^)]+\)`)
	mdSyntaxRe = regexp.MustCompile("[#*_`>~-]")
)

func WordCount(s string) int {
	return len(strings.Fields(s))
}

// ExtractImages returns the URLs of every markdown image (`![alt](url)`) in content.
func ExtractImages(content string) []string {
	matches := imageRe.FindAllStringSubmatch(content, -1)
	images := make([]string, 0, len(matches))
	for _, m := range matches {
		images = append(images, m[1])
	}
	return images
}

// RandomImage returns a randomly picked image URL from content, or "" if none exist.
func RandomImage(content string) string {
	images := ExtractImages(content)
	if len(images) == 0 {
		return ""
	}
	return images[rand.Intn(len(images))]
}

// Excerpt strips markdown syntax from content and truncates it to maxLen runes,
// breaking on a word boundary and appending an ellipsis if truncated.
func Excerpt(content string, maxLen int) string {
	plain := imageRe.ReplaceAllString(content, "")
	plain = linkRe.ReplaceAllString(plain, "$1")
	plain = mdSyntaxRe.ReplaceAllString(plain, "")
	plain = strings.Join(strings.Fields(plain), " ")

	runes := []rune(plain)
	if len(runes) <= maxLen {
		return plain
	}

	truncated := string(runes[:maxLen])
	if idx := strings.LastIndex(truncated, " "); idx > 0 {
		truncated = truncated[:idx]
	}
	return strings.TrimSpace(truncated) + "…"
}
