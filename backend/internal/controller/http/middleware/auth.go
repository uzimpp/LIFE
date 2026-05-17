package middleware

import (
	"context"
	"net/http"

	"github.com/google/uuid"
	"life/internal/entity"
	"life/internal/usecase/repo"
)

type contextKey string

const UserContextKey contextKey = "user"

// Auth reads the session cookie, validates it, and injects *entity.User into the request context.
// On missing or invalid session it returns 401.
func Auth(sessions repo.SessionRepo, users repo.UserRepo, cookieName string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(cookieName)
			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			id, err := uuid.Parse(cookie.Value)
			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			sess, err := sessions.GetValid(r.Context(), id)
			if err != nil || sess == nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			user, err := users.GetByID(r.Context(), sess.UserID)
			if err != nil || user == nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), UserContextKey, user)))
		})
	}
}

// UserFromContext extracts *entity.User from the context set by Auth middleware.
func UserFromContext(ctx context.Context) *entity.User {
	u, _ := ctx.Value(UserContextKey).(*entity.User)
	return u
}
