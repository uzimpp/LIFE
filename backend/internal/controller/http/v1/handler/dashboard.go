package handler

import (
	"net/http"
	"sync"
	"time"

	"life/internal/controller/http/middleware"
	"life/internal/controller/http/v1/response"
	"life/internal/usecase/energy"
	"life/internal/usecase/odyssey"
	"life/internal/usecase/snapshot"
)

type DashboardHandler struct {
	snapshots *snapshot.UseCase
	odysseys  *odyssey.UseCase
	energy    *energy.UseCase
}

func NewDashboard(s *snapshot.UseCase, o *odyssey.UseCase, e *energy.UseCase) *DashboardHandler {
	return &DashboardHandler{snapshots: s, odysseys: o, energy: e}
}

func (h *DashboardHandler) Get(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		response.Unauthorized(w, "not authenticated")
		return
	}

	ctx := r.Context()
	userID := user.ID

	var (
		wg           sync.WaitGroup
		snapshotData any
		odysseyData  any
		energyData   any
	)

	wg.Add(3)

	go func() {
		defer wg.Done()
		s, _ := h.snapshots.GetLatest(ctx, userID)
		if s == nil {
			return
		}
		snapshotData = map[string]any{
			"life_areas":    s.LifeAreas,
			"interest_tags": s.InterestTags,
			"top_goals":     s.TopGoals,
			"created_at":    s.CreatedAt,
		}
	}()

	go func() {
		defer wg.Done()
		plan, _ := h.odysseys.GetLatest(ctx, userID)
		if plan == nil {
			return
		}
		// surface the highest-excitement path
		var topPath any
		var maxEx int16
		for _, p := range plan.Paths {
			if p.Excitement > maxEx {
				maxEx = p.Excitement
				topPath = map[string]any{
					"label":       p.Label,
					"description": p.Description,
					"excitement":  p.Excitement,
				}
			}
		}
		odysseyData = map[string]any{
			"plan_id":    plan.ID,
			"created_at": plan.CreatedAt,
			"top_path":   topPath,
			"path_count": len(plan.Paths),
		}
	}()

	go func() {
		defer wg.Done()
		since := time.Now().AddDate(0, 0, -7)
		entries, _ := h.energy.ListInRange(ctx, userID, since, time.Now())
		deltas, _ := h.energy.Summary(ctx, userID, 7)

		var topActivity string
		if len(deltas) > 0 {
			topActivity = deltas[0].Activity
		}
		energyData = map[string]any{
			"entry_count":  len(entries),
			"top_activity": topActivity,
			"summary":      deltas,
		}
	}()

	wg.Wait()

	response.Success(w, map[string]any{
		"snapshot": snapshotData,
		"odyssey":  odysseyData,
		"energy":   energyData,
	})
}
