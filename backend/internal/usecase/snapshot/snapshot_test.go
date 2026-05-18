package snapshot_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"life/internal/entity"
	"life/internal/usecase/snapshot"
)

// fakeSnapshotRepo implements repo.SnapshotRepo in-memory.
type fakeSnapshotRepo struct {
	rows []*entity.LifeSnapshot
}

func (r *fakeSnapshotRepo) Create(_ context.Context, s *entity.LifeSnapshot) error {
	s.ID = uuid.New()
	s.CreatedAt = time.Now()
	cp := *s
	r.rows = append(r.rows, &cp)
	return nil
}

func (r *fakeSnapshotRepo) GetLatest(_ context.Context, userID uuid.UUID) (*entity.LifeSnapshot, error) {
	for i := len(r.rows) - 1; i >= 0; i-- {
		if r.rows[i].UserID == userID {
			return r.rows[i], nil
		}
	}
	return nil, nil
}

func (r *fakeSnapshotRepo) ListForUser(_ context.Context, userID uuid.UUID) ([]*entity.LifeSnapshot, error) {
	var out []*entity.LifeSnapshot
	for _, s := range r.rows {
		if s.UserID == userID {
			out = append(out, s)
		}
	}
	return out, nil
}

func TestCreate_PersistsSnapshot(t *testing.T) {
	ctx := context.Background()
	repo := &fakeSnapshotRepo{}
	uc := snapshot.New(repo)

	userID := uuid.New()
	areas := map[string]int{"health": 7, "career": 4}
	tags := []string{"reading", "hiking"}
	goals := []entity.Goal{{Title: "Learn Go", Why: "career"}}

	s, err := uc.Create(ctx, userID, areas, tags, goals)
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if s.ID == uuid.Nil {
		t.Error("expected non-nil ID after create")
	}
	if s.LifeAreas["health"] != 7 {
		t.Errorf("health area: got %d, want 7", s.LifeAreas["health"])
	}
}

func TestGetLatest_ReturnsNilWhenEmpty(t *testing.T) {
	ctx := context.Background()
	uc := snapshot.New(&fakeSnapshotRepo{})

	got, err := uc.GetLatest(ctx, uuid.New())
	if err != nil {
		t.Fatalf("GetLatest: %v", err)
	}
	if got != nil {
		t.Error("expected nil for no snapshots")
	}
}

func TestGetLatest_ReturnsLastCreated(t *testing.T) {
	ctx := context.Background()
	repo := &fakeSnapshotRepo{}
	uc := snapshot.New(repo)

	userID := uuid.New()
	areas1 := map[string]int{"health": 3}
	areas2 := map[string]int{"health": 9}

	_, _ = uc.Create(ctx, userID, areas1, nil, []entity.Goal{{Title: "A", Why: "x"}})
	_, _ = uc.Create(ctx, userID, areas2, nil, []entity.Goal{{Title: "B", Why: "y"}})

	got, err := uc.GetLatest(ctx, userID)
	if err != nil {
		t.Fatalf("GetLatest: %v", err)
	}
	if got.LifeAreas["health"] != 9 {
		t.Errorf("expected latest snapshot, got health=%d", got.LifeAreas["health"])
	}
}
