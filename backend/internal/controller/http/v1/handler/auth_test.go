package handler_test

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"life/internal/controller/http/v1/handler"
	"life/internal/usecase/auth"
)

// stubUC satisfies just enough of auth.UseCase for handler tests.
// We use NewForTest with nil repos because handler tests only call BeginGoogle
// (which uses no repos) or test cookie-level behaviour.
func newHandler() *handler.AuthHandler {
	uc := auth.NewForTest(nil, nil, time.Hour)
	return handler.NewAuth(uc, "session", time.Hour, false, "", "http://localhost:3000")
}

func TestBeginGoogle_Redirects(t *testing.T) {
	h := newHandler()
	req := httptest.NewRequest(http.MethodGet, "/v1/auth/google", nil)
	rr := httptest.NewRecorder()
	h.BeginGoogle(rr, req)

	if rr.Code != http.StatusFound {
		t.Errorf("got %d, want %d", rr.Code, http.StatusFound)
	}
	loc := rr.Header().Get("Location")
	if loc == "" {
		t.Error("expected a redirect Location header")
	}
}

func TestCallback_MissingStateCookie(t *testing.T) {
	h := newHandler()
	req := httptest.NewRequest(http.MethodGet, "/v1/auth/google/callback?code=x&state=y", nil)
	rr := httptest.NewRecorder()
	h.Callback(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("got %d, want 400", rr.Code)
	}
}

func TestCallback_StateMismatch(t *testing.T) {
	h := newHandler()
	req := httptest.NewRequest(http.MethodGet, "/v1/auth/google/callback?code=x&state=wrong", nil)
	req.AddCookie(&http.Cookie{Name: "oauth_state", Value: "correct"})
	rr := httptest.NewRecorder()
	h.Callback(rr, req)

	// CompleteGoogle will return ErrInvalidState → 400
	if rr.Code != http.StatusBadRequest {
		t.Errorf("got %d, want 400", rr.Code)
	}
}

func TestLogout_MissingCookie(t *testing.T) {
	h := newHandler()
	req := httptest.NewRequest(http.MethodPost, "/v1/auth/logout", nil)
	rr := httptest.NewRecorder()
	h.Logout(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("got %d, want 401", rr.Code)
	}
}

func TestMe_NoUser_ReturnsUnauthorized(t *testing.T) {
	h := newHandler()
	req := httptest.NewRequest(http.MethodGet, "/v1/auth/me", nil)
	rr := httptest.NewRecorder()
	h.Me(rr, req) // no user in context

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("got %d, want 401", rr.Code)
	}
}
