package api

import (
	"database/sql"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/xambassador/entry/internal/config"
	"github.com/xambassador/entry/internal/store"
	"github.com/xambassador/entry/internal/utils"
)

type API struct {
	handler      http.Handler
	config       *config.Config
	entryStore   *store.EntryStore
	sessionStore *store.SessionStore
}

func NewAPI(cfg *config.Config, db *sql.DB) *API {
	api := &API{
		config:       cfg,
		entryStore:   store.NewEntryStore(db),
		sessionStore: store.NewSessionStore(db),
	}

	router := chi.NewRouter()

	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(cfg.RequestTimeout))
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

	router.Group(func(r chi.Router) {
		r.Use(api.RequireAuth)

		r.Post("/api/auth/logout", api.Logout)

		r.Route("/api/entries", func(r chi.Router) {
			r.Post("/", api.CreateEntry)
			r.Get("/", api.ListEntries)
			r.Get("/search", api.SearchEntries)
			r.Get("/year-at-glance", api.YearAtGlance)
			r.Get("/{id}", api.GetEntry)
			r.Put("/{id}", api.UpdateEntry)
		})
	})

	api.handler = router

	return api
}

func (a *API) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	a.handler.ServeHTTP(w, r)
}
