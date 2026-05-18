package odyssey_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"life/internal/entity"
	"life/internal/usecase/odyssey"
)

type fakeOdysseyRepo struct {
	plans []*entity.OdysseyPlan
}

func (r *fakeOdysseyRepo) Create(_ context.Context, plan *entity.OdysseyPlan) error {
	plan.ID = uuid.New()
	plan.CreatedAt = time.Now()
	for i := range plan.Paths {
		plan.Paths[i].ID = uuid.New()
		plan.Paths[i].PlanID = plan.ID
		plan.Paths[i].SortOrder = int16(i + 1)
	}
	cp := *plan
	r.plans = append(r.plans, &cp)
	return nil
}

func (r *fakeOdysseyRepo) GetLatestForUser(_ context.Context, userID uuid.UUID) (*entity.OdysseyPlan, error) {
	for i := len(r.plans) - 1; i >= 0; i-- {
		if r.plans[i].UserID == userID {
			return r.plans[i], nil
		}
	}
	return nil, nil
}

func (r *fakeOdysseyRepo) ListForUser(_ context.Context, userID uuid.UUID) ([]*entity.OdysseyPlan, error) {
	var out []*entity.OdysseyPlan
	for _, p := range r.plans {
		if p.UserID == userID {
			out = append(out, p)
		}
	}
	return out, nil
}

func (r *fakeOdysseyRepo) UpdatePath(_ context.Context, path *entity.OdysseyPath) error {
	for _, plan := range r.plans {
		for i := range plan.Paths {
			if plan.Paths[i].ID == path.ID {
				plan.Paths[i].Likeability = path.Likeability
				plan.Paths[i].Confidence = path.Confidence
				plan.Paths[i].Excitement = path.Excitement
				return nil
			}
		}
	}
	return nil
}

func samplePaths() []entity.OdysseyPath {
	return []entity.OdysseyPath{
		{Label: "Path A", Description: "Desc A", TimelineText: "5 years", Likeability: 7, Confidence: 6, Excitement: 8},
		{Label: "Path B", Description: "Desc B", TimelineText: "2 years", Likeability: 5, Confidence: 8, Excitement: 6},
		{Label: "Path C", Description: "Desc C", TimelineText: "1 year", Likeability: 9, Confidence: 4, Excitement: 9},
	}
}

func TestCreate_AssignsIDsAndSortOrder(t *testing.T) {
	ctx := context.Background()
	uc := odyssey.New(&fakeOdysseyRepo{})

	plan, err := uc.Create(ctx, uuid.New(), samplePaths())
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if plan.ID == uuid.Nil {
		t.Error("plan ID should be set")
	}
	for i, p := range plan.Paths {
		if p.SortOrder != int16(i+1) {
			t.Errorf("path %d sort_order: got %d, want %d", i, p.SortOrder, i+1)
		}
	}
}

func TestGetLatest_ReturnsNilForNewUser(t *testing.T) {
	ctx := context.Background()
	uc := odyssey.New(&fakeOdysseyRepo{})

	got, err := uc.GetLatest(ctx, uuid.New())
	if err != nil {
		t.Fatalf("GetLatest: %v", err)
	}
	if got != nil {
		t.Error("expected nil for user with no plans")
	}
}

func TestUpdatePath_PersistsRatings(t *testing.T) {
	ctx := context.Background()
	repo := &fakeOdysseyRepo{}
	uc := odyssey.New(repo)

	userID := uuid.New()
	plan, _ := uc.Create(ctx, userID, samplePaths())

	target := &plan.Paths[0]
	target.Likeability = 3
	target.Confidence = 3
	target.Excitement = 3

	if err := uc.UpdatePath(ctx, target); err != nil {
		t.Fatalf("UpdatePath: %v", err)
	}

	latest, _ := uc.GetLatest(ctx, userID)
	if latest.Paths[0].Likeability != 3 {
		t.Errorf("expected likeability=3, got %d", latest.Paths[0].Likeability)
	}
}
