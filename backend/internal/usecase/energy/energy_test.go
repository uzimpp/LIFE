package energy_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"life/internal/entity"
	"life/internal/usecase/energy"
)

type fakeEnergyRepo struct {
	entries []entity.EnergyEntry
}

func (r *fakeEnergyRepo) Create(_ context.Context, e *entity.EnergyEntry) error {
	e.ID = uuid.New()
	e.CreatedAt = time.Now()
	r.entries = append(r.entries, *e)
	return nil
}

func (r *fakeEnergyRepo) ListInRange(_ context.Context, userID uuid.UUID, from, to time.Time) ([]entity.EnergyEntry, error) {
	var out []entity.EnergyEntry
	for _, e := range r.entries {
		if e.UserID == userID && !e.StartedAt.Before(from) && !e.StartedAt.After(to) {
			out = append(out, e)
		}
	}
	return out, nil
}

func (r *fakeEnergyRepo) AggregateByActivity(_ context.Context, userID uuid.UUID, since time.Time) ([]entity.EnergyDelta, error) {
	totals := map[string]struct{ sum, count float64 }{}
	for _, e := range r.entries {
		if e.UserID == userID && !e.StartedAt.Before(since) {
			t := totals[e.Activity]
			t.sum += float64(e.EnergyAfter - e.EnergyBefore)
			t.count++
			totals[e.Activity] = t
		}
	}
	var out []entity.EnergyDelta
	for act, v := range totals {
		out = append(out, entity.EnergyDelta{Activity: act, AvgDelta: v.sum / v.count, Count: int(v.count)})
	}
	return out, nil
}

func TestLog_PersistsEntry(t *testing.T) {
	ctx := context.Background()
	repo := &fakeEnergyRepo{}
	uc := energy.New(repo)

	e := &entity.EnergyEntry{
		UserID:       uuid.New(),
		Activity:     "Running",
		StartedAt:    time.Now().Add(-time.Hour),
		EndedAt:      time.Now(),
		EnergyBefore: 4,
		EnergyAfter:  8,
	}
	if err := uc.Log(ctx, e); err != nil {
		t.Fatalf("Log: %v", err)
	}
	if e.ID == uuid.Nil {
		t.Error("expected ID after log")
	}
}

func TestListInRange_FiltersCorrectly(t *testing.T) {
	ctx := context.Background()
	repo := &fakeEnergyRepo{}
	uc := energy.New(repo)

	userID := uuid.New()
	now := time.Now()

	_ = uc.Log(ctx, &entity.EnergyEntry{UserID: userID, Activity: "A", StartedAt: now.AddDate(0, 0, -10), EndedAt: now.AddDate(0, 0, -10).Add(time.Hour), EnergyBefore: 5, EnergyAfter: 7})
	_ = uc.Log(ctx, &entity.EnergyEntry{UserID: userID, Activity: "B", StartedAt: now.AddDate(0, 0, -3), EndedAt: now.AddDate(0, 0, -3).Add(time.Hour), EnergyBefore: 5, EnergyAfter: 6})

	entries, err := uc.ListInRange(ctx, userID, now.AddDate(0, 0, -7), now)
	if err != nil {
		t.Fatalf("ListInRange: %v", err)
	}
	if len(entries) != 1 {
		t.Errorf("expected 1 entry in range, got %d", len(entries))
	}
	if entries[0].Activity != "B" {
		t.Errorf("expected activity B, got %s", entries[0].Activity)
	}
}

func TestSummary_ComputesAvgDelta(t *testing.T) {
	ctx := context.Background()
	repo := &fakeEnergyRepo{}
	uc := energy.New(repo)

	userID := uuid.New()
	now := time.Now()
	start := func(d int) time.Time { return now.AddDate(0, 0, d) }

	_ = uc.Log(ctx, &entity.EnergyEntry{UserID: userID, Activity: "Yoga", StartedAt: start(-1), EndedAt: start(-1).Add(time.Hour), EnergyBefore: 4, EnergyAfter: 8})
	_ = uc.Log(ctx, &entity.EnergyEntry{UserID: userID, Activity: "Yoga", StartedAt: start(-2), EndedAt: start(-2).Add(time.Hour), EnergyBefore: 6, EnergyAfter: 8})

	deltas, err := uc.Summary(ctx, userID, 7)
	if err != nil {
		t.Fatalf("Summary: %v", err)
	}
	if len(deltas) != 1 {
		t.Fatalf("expected 1 delta, got %d", len(deltas))
	}
	if deltas[0].AvgDelta != 3.0 {
		t.Errorf("expected avg delta 3.0, got %.2f", deltas[0].AvgDelta)
	}
}
