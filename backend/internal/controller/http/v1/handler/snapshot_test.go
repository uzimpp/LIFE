package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"life/internal/controller/http/middleware"
	"life/internal/controller/http/v1/handler"
	"life/internal/entity"
	"life/internal/usecase/snapshot"
)

// inMemorySnapshotRepo satisfies repo.SnapshotRepo for handler tests.
type inMemorySnapshotRepo struct {
	rows []*entity.LifeSnapshot
}

func (r *inMemorySnapshotRepo) Create(_ context.Context, s *entity.LifeSnapshot) error {
	s.ID = uuid.New()
	cp := *s
	r.rows = append(r.rows, &cp)
	return nil
}

func (r *inMemorySnapshotRepo) GetLatest(_ context.Context, userID uuid.UUID) (*entity.LifeSnapshot, error) {
	for i := len(r.rows) - 1; i >= 0; i-- {
		if r.rows[i].UserID == userID {
			return r.rows[i], nil
		}
	}
	return nil, nil
}

func ctxWithUser(u *entity.User) context.Context {
	return context.WithValue(context.Background(), middleware.UserContextKey, u)
}

func TestSnapshotCreate_ReturnsCreated(t *testing.T) {
	repo := &inMemorySnapshotRepo{}
	h := handler.NewSnapshot(snapshot.New(repo))

	user := &entity.User{ID: uuid.New(), Email: "a@b.com", Name: "A"}
	body, _ := json.Marshal(map[string]any{
		"life_areas":    map[string]int{"health": 8},
		"interest_tags": []string{"running"},
		"top_goals":     []map[string]string{{"title": "Run 5k", "why": "health"}},
	})

	req := httptest.NewRequest(http.MethodPost, "/v1/snapshots", bytes.NewReader(body))
	req = req.WithContext(ctxWithUser(user))
	rr := httptest.NewRecorder()
	h.Create(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("got %d, want 201", rr.Code)
	}
}

func TestSnapshotCreate_MissingLifeAreas_ReturnsBadRequest(t *testing.T) {
	h := handler.NewSnapshot(snapshot.New(&inMemorySnapshotRepo{}))

	user := &entity.User{ID: uuid.New()}
	body, _ := json.Marshal(map[string]any{
		"top_goals": []map[string]string{{"title": "x", "why": "y"}},
	})

	req := httptest.NewRequest(http.MethodPost, "/v1/snapshots", bytes.NewReader(body))
	req = req.WithContext(ctxWithUser(user))
	rr := httptest.NewRecorder()
	h.Create(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("got %d, want 400", rr.Code)
	}
}

func TestSnapshotGetLatest_NoSnapshot_ReturnsNotFound(t *testing.T) {
	h := handler.NewSnapshot(snapshot.New(&inMemorySnapshotRepo{}))

	user := &entity.User{ID: uuid.New()}
	req := httptest.NewRequest(http.MethodGet, "/v1/snapshots/latest", nil)
	req = req.WithContext(ctxWithUser(user))
	rr := httptest.NewRecorder()
	h.GetLatest(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Errorf("got %d, want 404", rr.Code)
	}
}

func TestSnapshotGetLatest_ReturnsOK(t *testing.T) {
	repo := &inMemorySnapshotRepo{}
	uc := snapshot.New(repo)
	h := handler.NewSnapshot(uc)

	user := &entity.User{ID: uuid.New()}
	_, _ = uc.Create(context.Background(), user.ID,
		map[string]int{"health": 5}, nil,
		[]entity.Goal{{Title: "x", Why: "y"}},
	)

	req := httptest.NewRequest(http.MethodGet, "/v1/snapshots/latest", nil)
	req = req.WithContext(ctxWithUser(user))
	rr := httptest.NewRecorder()
	h.GetLatest(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("got %d, want 200", rr.Code)
	}
}
