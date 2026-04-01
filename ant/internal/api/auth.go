package api

import (
	"crypto/subtle"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/xambassador/entry/internal/store"
	"github.com/xambassador/entry/internal/utils"
)

type loginRequest struct {
	Passphrase string `json:"passphrase"`
}

type loginResponse struct {
	Token     string `json:"token"`
	ExpiresAt string `json:"expires_at"`
}

type verifyResponse struct {
	Authenticated bool   `json:"authenticated"`
	ExpiresAt     string `json:"expires_at,omitempty"`
}

func (a *API) Login(w http.ResponseWriter, r *http.Request) {
	body := &loginRequest{}
	if err := json.NewDecoder(r.Body).Decode(body); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(ErrInvalidRequestBody, "Invalid request body"))
		return
	}

	if strings.TrimSpace(body.Passphrase) == "" {
		utils.WriteJSON(w, http.StatusBadRequest, utils.NewErrorResponse(ErrInvalidRequestBody, "Passphrase is required"))
		return
	}

	if subtle.ConstantTimeCompare([]byte(body.Passphrase), []byte(a.config.AuthSecret)) != 1 {
		utils.WriteJSON(w, http.StatusUnauthorized, utils.NewErrorResponse(ErrInvalidPassphrase, "Invalid passphrase"))
		return
	}

	session, token, err := a.sessionStore.Create(store.CreateSessionParams{
		IPAddress: r.RemoteAddr,
		UserAgent: r.UserAgent(),
		Duration:  a.config.SessionDuration,
	})
	if err != nil {
		log.Printf("error creating session: %v", err)
		utils.WriteJSON(w, http.StatusInternalServerError, utils.NewErrorResponse(ErrInternalError, "Failed to create session"))
		return
	}

	expiresAt, _ := time.Parse(time.RFC3339, session.ExpiresAt)

	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    token,
		Path:     "/",
		Expires:  expiresAt,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	utils.WriteJSON(w, http.StatusOK, loginResponse{
		Token:     token,
		ExpiresAt: session.ExpiresAt,
	})
}

func (a *API) Logout(w http.ResponseWriter, r *http.Request) {
	var token string
	if cookie, err := r.Cookie(sessionCookieName); err == nil {
		token = cookie.Value
	} else if authHeader := r.Header.Get("Authorization"); authHeader != "" {
		if t, ok := strings.CutPrefix(authHeader, "Bearer "); ok {
			token = t
		}
	}

	if token != "" {
		if err := a.sessionStore.DeleteByToken(token); err != nil {
			log.Printf("error deleting session: %v", err)
		}
	}

	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	utils.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (a *API) Verify(w http.ResponseWriter, r *http.Request) {
	var token string
	if cookie, err := r.Cookie(sessionCookieName); err == nil {
		token = cookie.Value
	} else if authHeader := r.Header.Get("Authorization"); authHeader != "" {
		if t, ok := strings.CutPrefix(authHeader, "Bearer "); ok {
			token = t
		}
	}

	if token == "" {
		utils.WriteJSON(w, http.StatusOK, verifyResponse{Authenticated: false})
		return
	}

	session, err := a.sessionStore.GetByToken(token)
	if err != nil || session == nil {
		utils.WriteJSON(w, http.StatusOK, verifyResponse{Authenticated: false})
		return
	}

	utils.WriteJSON(w, http.StatusOK, verifyResponse{
		Authenticated: true,
		ExpiresAt:     session.ExpiresAt,
	})
}
