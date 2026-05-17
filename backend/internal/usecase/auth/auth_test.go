package auth_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"life/internal/entity"
	"life/internal/usecase/auth"
)

func newTestUC() (*auth.UseCase, *fakeUserRepo, *fakeSessionRepo) {
	users := newFakeUserRepo()
	sessions := newFakeSessionRepo()
	uc := auth.NewForTest(users, sessions, 24*time.Hour)
	return uc, users, sessions
}

func TestBeginGoogle_GeneratesUniqueStates(t *testing.T) {
	uc, _, _ := newTestUC()

	_, state1, err := uc.BeginGoogle()
	if err != nil {
		t.Fatalf("BeginGoogle: %v", err)
	}
	_, state2, err := uc.BeginGoogle()
	if err != nil {
		t.Fatalf("BeginGoogle: %v", err)
	}

	if state1 == state2 {
		t.Error("expected unique states, got duplicates")
	}
}

func TestLogout_DeletesSession(t *testing.T) {
	ctx := context.Background()
	uc, users, sessions := newTestUC()

	u := &entity.User{Email: "a@b.com", GoogleID: "g1", Name: "A"}
	_ = users.Upsert(ctx, u)

	sess, _ := sessions.Create(ctx, u.ID, time.Hour)

	if err := uc.Logout(ctx, sess.ID); err != nil {
		t.Fatalf("Logout: %v", err)
	}

	got, _ := sessions.GetValid(ctx, sess.ID)
	if got != nil {
		t.Error("expected session to be deleted after logout")
	}
}

func TestMe_ReturnsUser(t *testing.T) {
	ctx := context.Background()
	uc, users, sessions := newTestUC()

	u := &entity.User{Email: "x@y.com", GoogleID: "g2", Name: "X"}
	_ = users.Upsert(ctx, u)
	sess, _ := sessions.Create(ctx, u.ID, time.Hour)

	got, err := uc.Me(ctx, sess.ID)
	if err != nil {
		t.Fatalf("Me: %v", err)
	}
	if got == nil || got.ID != u.ID {
		t.Errorf("Me returned wrong user: %v", got)
	}
}

func TestMe_ExpiredSession_ReturnsNil(t *testing.T) {
	ctx := context.Background()
	uc, users, sessions := newTestUC()

	u := &entity.User{Email: "z@z.com", GoogleID: "g3", Name: "Z"}
	_ = users.Upsert(ctx, u)
	// Create an already-expired session directly
	sess := &entity.Session{
		ID:        uuid.New(),
		UserID:    u.ID,
		ExpiresAt: time.Now().Add(-time.Minute),
	}
	sessions.sessions[sess.ID] = sess

	got, err := uc.Me(ctx, sess.ID)
	if err != nil {
		t.Fatalf("Me: %v", err)
	}
	if got != nil {
		t.Error("expected nil for expired session")
	}
}
