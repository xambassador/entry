package api

import (
	"errors"
	"net/http"
	"strings"

	"github.com/xambassador/entry/internal/store"
	"github.com/xambassador/entry/internal/utils"
)

const (
	sessionCookieName = "entry_session"
)

func (a *API) GetSession(r *http.Request) (*store.Session, error) {
	if cookie, err := r.Cookie(sessionCookieName); err == nil && cookie.Value != "" {
		session, err := a.sessionStore.GetByToken(cookie.Value)
		if err == nil && session != nil {
			return session, nil
		}
	}

	if authHeader := r.Header.Get("Authorization"); authHeader != "" {
		if token, ok := strings.CutPrefix(authHeader, "Bearer "); ok && token != "" {
			session, err := a.sessionStore.GetByToken(token)
			if err == nil && session != nil {
				return session, nil
			}
		}
	}

	return nil, errors.New("no valid session found")
}

func (a *API) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		session, err := a.GetSession(r)
		if err == nil && session != nil {
			next.ServeHTTP(w, r)
			return
		}

		utils.WriteJSON(w, http.StatusUnauthorized, utils.NewErrorResponse(ErrUnauthorized, "Authentication required"))
	})
}
