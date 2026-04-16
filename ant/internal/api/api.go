package api

import (
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/xambassador/entry/frontend"
	"github.com/xambassador/entry/internal/config"
	"github.com/xambassador/entry/internal/store"
	"github.com/xambassador/entry/internal/utils"
)

type API struct {
	handler      http.Handler
	config       *config.Config
	entryStore   *store.EntryStore
	sessionStore *store.SessionStore
	loginPath    string
	writePath    string
	// devProxy is for forwarding requests to the Vite dev server during development.
	// In production this will stay nil
	devProxy *httputil.ReverseProxy
}

func NewAPI(cfg *config.Config, db *sql.DB) *API {
	loginPath := "/" + deriveSecret(cfg.AuthSecret, "login-route")
	writePath := "/" + deriveSecret(cfg.AuthSecret, "write-route")

	api := &API{
		config:       cfg,
		entryStore:   store.NewEntryStore(db),
		sessionStore: store.NewSessionStore(db),
		loginPath:    loginPath,
		writePath:    writePath,
	}

	if cfg.DevProxy != "" {
		api.devProxy = newReverseProxy(cfg.DevProxy)
	}

	router := chi.NewRouter()

	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)

	if cfg.DevProxy != "" {
		// In dev mode apply the timeout only to API and secret-page routes.
		// Vite's SSE stream (/@vite/client) and WebSocket connections are
		// intentionally long-lived; wrapping them in a deadline context causes
		// "context canceled" and "WriteHeader on hijacked connection" log spam.
		router.Use(skipTimeoutForProxy(cfg.RequestTimeout, loginPath, writePath))
	} else {
		router.Use(middleware.Timeout(cfg.RequestTimeout))
	}

	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		utils.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	router.Post("/api/auth/login", api.Login)
	router.Get("/api/auth/verify", api.Verify)
	router.Get("/api/auth/session", func(w http.ResponseWriter, r *http.Request) {
		if api.isAuthenticated(r) {
			utils.WriteJSON(w, http.StatusOK, map[string]string{"status": "authenticated"})
			return
		}
		utils.WriteJSON(w, http.StatusUnauthorized, map[string]string{"status": "unauthenticated"})
	})
	router.Group(func(r chi.Router) {
		r.Use(api.RequireAuth)
		r.Post("/api/auth/logout", api.Logout)
	})

	router.Route("/api/entries", func(r chi.Router) {
		r.Get("/", api.ListEntries)
		r.Get("/search", api.SearchEntries)
		r.Get("/year-at-glance", api.YearAtGlance)
		r.Get("/{id}", api.GetEntry)

		r.Group(func(r chi.Router) {
			r.Use(api.RequireAuth)
			r.Post("/", api.CreateEntry)
			r.Put("/{id}", api.UpdateEntry)
		})
	})

	router.Get(loginPath, api.serveLoginPage)
	router.Get(writePath, api.serveWritePage)

	if cfg.DevProxy != "" {
		// Dev mode: everything else goes to Vite with no timeout.
		router.Handle("/*", api.devProxy)
		router.NotFound(api.devProxy.ServeHTTP)
	} else {
		// serve the embedded dist files in production.
		distFS := frontend.FS()
		fileServer := http.FileServerFS(distFS)

		router.Handle("/assets/*", fileServer)
		router.Handle("/vite.svg", fileServer)
		// Anything else falls back to the SPA index.html.
		router.NotFound(api.serveSPA)
	}

	api.handler = router

	return api
}

func (a *API) LoginPath() string {
	return a.loginPath
}

func (a *API) WritePath() string {
	return a.writePath
}

func (a *API) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	a.handler.ServeHTTP(w, r)
}

// In dev mode it proxies to Vite's /login.html; in production it serves the built file.
func (a *API) serveLoginPage(w http.ResponseWriter, r *http.Request) {
	if a.devProxy != nil {
		if a.isAuthenticated(r) {
			http.Redirect(w, r, a.writePath, http.StatusTemporaryRedirect)
			return
		}

		r2 := r.Clone(r.Context())
		r2.URL.Path = "/login.html"
		a.devProxy.ServeHTTP(w, r2)
		return
	}
	serveEmbeddedFile(w, r, "login.html")
}

// In dev mode it proxies to Vite's /write.html; in production it serves the built file.
func (a *API) serveWritePage(w http.ResponseWriter, r *http.Request) {
	if !a.isAuthenticated(r) {
		http.Redirect(w, r, a.loginPath, http.StatusTemporaryRedirect)
		return
	}

	today := time.Now().Format("2006-01-02")
	var redirectId string
	if entryID, err := a.entryStore.GetIDByDate(today); err == nil && entryID != "" {
		redirectId = entryID
	}

	if redirectId != "" && r.URL.Query().Get("edit") == "" {
		http.Redirect(w, r, fmt.Sprintf("%s?edit=%s", a.writePath, redirectId), http.StatusTemporaryRedirect)
		return
	}

	if a.devProxy != nil {
		r2 := r.Clone(r.Context())
		r2.URL.Path = "/write.html"
		a.devProxy.ServeHTTP(w, r2)
		return
	}

	serveEmbeddedFile(w, r, "write.html")
}

// serveSPA serves the main SPA index.html for client-side routing (production only).
func (a *API) serveSPA(w http.ResponseWriter, r *http.Request) {
	serveEmbeddedFile(w, r, "index.html")
}

// serveEmbeddedFile serves a named file from the embedded dist FS.
func serveEmbeddedFile(w http.ResponseWriter, r *http.Request, name string) {
	http.ServeFileFS(w, r, frontend.FS(), name)
}

// checks if the request has a valid session cookie or bearer token.
func (a *API) isAuthenticated(r *http.Request) bool {
	session, err := a.GetSession(r)
	if err == nil && session != nil {
		return true
	}

	return false
}

// newReverseProxy creates a reverse proxy to the given target URL.
func newReverseProxy(target string) *httputil.ReverseProxy {
	u, _ := url.Parse(target)
	proxy := httputil.NewSingleHostReverseProxy(u)
	proxy.ModifyResponse = func(resp *http.Response) error {
		// Strip X-Frame-Options from Vite responses so our pages can load normally.
		resp.Header.Del("X-Frame-Options")
		return nil
	}
	return proxy
}

// skipTimeoutForProxy returns a middleware that applies chi's Timeout only to requests
// that target API routes, the health endpoint, or the secret HTML pages. Vite's SSE
// stream (/@vite/client) and WebSocket upgrade connections are intentionally long-lived;
// wrapping them in a deadline context causes "context canceled" and
// "WriteHeader on hijacked connection" log spam in dev mode.
func skipTimeoutForProxy(d time.Duration, loginPath, writePath string) func(http.Handler) http.Handler {
	applyTimeout := middleware.Timeout(d)
	return func(next http.Handler) http.Handler {
		withTimeout := applyTimeout(next)
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			p := r.URL.Path
			if strings.HasPrefix(p, "/api") ||
				p == "/health" ||
				p == loginPath ||
				p == writePath {
				withTimeout.ServeHTTP(w, r)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// deriveSecret generates a deterministic hex string from a key and purpose using HMAC-SHA256.
// The output is 32 hex characters (16 bytes), stable across restarts for the same key.
func deriveSecret(key, purpose string) string {
	mac := hmac.New(sha256.New, []byte(key))
	mac.Write([]byte(purpose))
	return hex.EncodeToString(mac.Sum(nil))[:32]
}
