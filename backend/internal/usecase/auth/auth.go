package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"life/internal/config"
	"life/internal/entity"
	"life/internal/usecase/repo"
)

var ErrInvalidState = errors.New("oauth state mismatch")

type UseCase struct {
	oauthCfg *oauth2.Config
	users    repo.UserRepo
	sessions repo.SessionRepo
	ttl      time.Duration
}

func New(cfg *config.Config, users repo.UserRepo, sessions repo.SessionRepo) *UseCase {
	return &UseCase{
		oauthCfg: &oauth2.Config{
			ClientID:     cfg.OAuth.ClientID,
			ClientSecret: cfg.OAuth.ClientSecret,
			RedirectURL:  cfg.OAuth.RedirectURL,
			Scopes:       []string{"openid", "email", "profile"},
			Endpoint:     google.Endpoint,
		},
		users:    users,
		sessions: sessions,
		ttl:      cfg.Session.TTL,
	}
}

// NewForTest creates a UseCase with a stub OAuth config, intended for unit tests.
func NewForTest(users repo.UserRepo, sessions repo.SessionRepo, ttl time.Duration) *UseCase {
	return &UseCase{
		oauthCfg: &oauth2.Config{
			ClientID:     "test-client",
			ClientSecret: "test-secret",
			RedirectURL:  "http://localhost/callback",
			Scopes:       []string{"openid", "email", "profile"},
			Endpoint:     google.Endpoint,
		},
		users:    users,
		sessions: sessions,
		ttl:      ttl,
	}
}

// BeginGoogle returns the redirect URL and a random state token.
func (uc *UseCase) BeginGoogle() (authURL, state string, err error) {
	b := make([]byte, 16)
	if _, err = rand.Read(b); err != nil {
		return "", "", fmt.Errorf("auth.BeginGoogle rand: %w", err)
	}
	state = base64.URLEncoding.EncodeToString(b)
	return uc.oauthCfg.AuthCodeURL(state, oauth2.AccessTypeOnline), state, nil
}

// CompleteGoogle exchanges the code, upserts the user, and creates a session.
func (uc *UseCase) CompleteGoogle(ctx context.Context, code, state, expectedState string) (*entity.Session, error) {
	if state != expectedState {
		return nil, ErrInvalidState
	}

	token, err := uc.oauthCfg.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("auth.CompleteGoogle exchange: %w", err)
	}

	info, err := fetchUserInfo(ctx, uc.oauthCfg.Client(ctx, token))
	if err != nil {
		return nil, fmt.Errorf("auth.CompleteGoogle userinfo: %w", err)
	}

	u := &entity.User{
		Email:     info.Email,
		GoogleID:  info.Sub,
		Name:      info.Name,
		AvatarURL: info.Picture,
	}
	if err = uc.users.Upsert(ctx, u); err != nil {
		return nil, fmt.Errorf("auth.CompleteGoogle upsert: %w", err)
	}

	sess, err := uc.sessions.Create(ctx, u.ID, uc.ttl)
	if err != nil {
		return nil, fmt.Errorf("auth.CompleteGoogle session: %w", err)
	}
	return sess, nil
}

// Logout deletes the session by ID.
func (uc *UseCase) Logout(ctx context.Context, sessionID uuid.UUID) error {
	return uc.sessions.Delete(ctx, sessionID)
}

// Me returns the user for a valid session, or nil if the session is expired/missing.
func (uc *UseCase) Me(ctx context.Context, sessionID uuid.UUID) (*entity.User, error) {
	sess, err := uc.sessions.GetValid(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("auth.Me session: %w", err)
	}
	if sess == nil {
		return nil, nil
	}
	return uc.users.GetByID(ctx, sess.UserID)
}

type googleUserInfo struct {
	Sub     string `json:"sub"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

func fetchUserInfo(ctx context.Context, client *http.Client) (*googleUserInfo, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://openidconnect.googleapis.com/v1/userinfo", nil)
	if err != nil {
		return nil, err
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var info googleUserInfo
	return &info, json.Unmarshal(body, &info)
}
