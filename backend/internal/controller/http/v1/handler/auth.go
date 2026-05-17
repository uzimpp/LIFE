package handler

import (
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
	"life/internal/controller/http/middleware"
	"life/internal/controller/http/v1/response"
	"life/internal/usecase/auth"
)

type AuthHandler struct {
	uc          *auth.UseCase
	cookieName  string
	cookieTTL   time.Duration
	secure      bool
	domain      string
	frontendURL string
}

func NewAuth(uc *auth.UseCase, cookieName string, ttl time.Duration, secure bool, domain string, frontendURL string) *AuthHandler {
	return &AuthHandler{
		uc:          uc,
		cookieName:  cookieName,
		cookieTTL:   ttl,
		secure:      secure,
		domain:      domain,
		frontendURL: frontendURL,
	}
}

// BeginGoogle redirects the user to Google OAuth consent.
func (h *AuthHandler) BeginGoogle(w http.ResponseWriter, r *http.Request) {
	authURL, state, err := h.uc.BeginGoogle()
	if err != nil {
		response.InternalError(w, "failed to begin auth")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		Path:     "/",
		MaxAge:   600,
		HttpOnly: true,
		Secure:   h.secure,
		SameSite: http.SameSiteLaxMode,
	})
	http.Redirect(w, r, authURL, http.StatusFound)
}

// Callback handles the Google OAuth callback.
func (h *AuthHandler) Callback(w http.ResponseWriter, r *http.Request) {
	stateCookie, err := r.Cookie("oauth_state")
	if err != nil {
		response.BadRequest(w, "missing state cookie")
		return
	}

	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")

	sess, err := h.uc.CompleteGoogle(r.Context(), code, state, stateCookie.Value)
	if err != nil {
		if errors.Is(err, auth.ErrInvalidState) {
			response.BadRequest(w, "invalid state")
			return
		}
		response.InternalError(w, "auth failed")
		return
	}

	// Clear the state cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   h.secure,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     h.cookieName,
		Value:    sess.ID.String(),
		Path:     "/",
		MaxAge:   int(h.cookieTTL.Seconds()),
		HttpOnly: true,
		Secure:   h.secure,
		SameSite: http.SameSiteLaxMode,
		Domain:   h.domain,
	})

	http.Redirect(w, r, h.frontendURL+"/me", http.StatusFound)
}

// Logout deletes the session and clears the cookie.
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(h.cookieName)
	if err != nil {
		response.Unauthorized(w, "not logged in")
		return
	}

	id, err := uuid.Parse(cookie.Value)
	if err != nil {
		response.Unauthorized(w, "invalid session")
		return
	}

	if err = h.uc.Logout(r.Context(), id); err != nil {
		response.InternalError(w, "logout failed")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     h.cookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   h.secure,
	})

	response.Success(w, nil)
}

// Me returns the current authenticated user.
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		response.Unauthorized(w, "not authenticated")
		return
	}
	response.Success(w, map[string]any{
		"id":         user.ID,
		"email":      user.Email,
		"name":       user.Name,
		"avatar_url": user.AvatarURL,
	})
}
