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
	handler    http.Handler
	config     *config.Config
	entryStore *store.EntryStore
}

func NewAPI(cfg *config.Config, db *sql.DB) *API {
	api := &API{
		config:     cfg,
		entryStore: store.NewEntryStore(db),
	}

	router := chi.NewRouter()

	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(cfg.RequestTimeout))
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"https://*", "http://*"},
	}))

	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		utils.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	router.Route("/api/entries", func(r chi.Router) {
		r.Post("/", api.CreateEntry)
		r.Get("/", api.ListEntries)
		r.Get("/search", api.SearchEntries)
		r.Get("/{id}", api.GetEntry)
		r.Put("/{id}", api.UpdateEntry)
	})

	api.handler = router

	return api
}

func (a *API) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	a.handler.ServeHTTP(w, r)
}
