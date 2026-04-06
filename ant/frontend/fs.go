package frontend

import (
	"embed"
	"io/fs"
)

//go:embed dist
var distFS embed.FS

// FS returns a sub-filesystem rooted at the embedded dist/ directory.
func FS() fs.FS {
	sub, err := fs.Sub(distFS, "dist")
	if err != nil {
		panic("frontend: failed to sub dist FS: " + err.Error())
	}
	return sub
}
