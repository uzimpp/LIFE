package auth_test

import (
	"context"
	"time"

	"github.com/google/uuid"
	"life/internal/entity"
)

// fakeUserRepo implements repo.UserRepo in-memory.
type fakeUserRepo struct {
	byID       map[uuid.UUID]*entity.User
	byGoogleID map[string]*entity.User
}

func newFakeUserRepo() *fakeUserRepo {
	return &fakeUserRepo{
		byID:       make(map[uuid.UUID]*entity.User),
		byGoogleID: make(map[string]*entity.User),
	}
}

func (r *fakeUserRepo) GetByID(_ context.Context, id uuid.UUID) (*entity.User, error) {
	return r.byID[id], nil
}

func (r *fakeUserRepo) GetByGoogleID(_ context.Context, googleID string) (*entity.User, error) {
	return r.byGoogleID[googleID], nil
}

func (r *fakeUserRepo) Upsert(_ context.Context, u *entity.User) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	r.byID[u.ID] = u
	r.byGoogleID[u.GoogleID] = u
	return nil
}

// fakeSessionRepo implements repo.SessionRepo in-memory.
type fakeSessionRepo struct {
	sessions map[uuid.UUID]*entity.Session
}

func newFakeSessionRepo() *fakeSessionRepo {
	return &fakeSessionRepo{sessions: make(map[uuid.UUID]*entity.Session)}
}

func (r *fakeSessionRepo) Create(_ context.Context, userID uuid.UUID, ttl time.Duration) (*entity.Session, error) {
	s := &entity.Session{
		ID:        uuid.New(),
		UserID:    userID,
		ExpiresAt: time.Now().Add(ttl),
		CreatedAt: time.Now(),
	}
	r.sessions[s.ID] = s
	return s, nil
}

func (r *fakeSessionRepo) GetValid(_ context.Context, id uuid.UUID) (*entity.Session, error) {
	s := r.sessions[id]
	if s == nil || time.Now().After(s.ExpiresAt) {
		return nil, nil
	}
	return s, nil
}

func (r *fakeSessionRepo) Delete(_ context.Context, id uuid.UUID) error {
	delete(r.sessions, id)
	return nil
}

func (r *fakeSessionRepo) DeleteExpired(_ context.Context) error {
	for id, s := range r.sessions {
		if time.Now().After(s.ExpiresAt) {
			delete(r.sessions, id)
		}
	}
	return nil
}
