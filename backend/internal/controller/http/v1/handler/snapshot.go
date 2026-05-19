package handler

import (
	"encoding/json"
	"net/http"

	"life/internal/controller/http/middleware"
	"life/internal/controller/http/v1/response"
	"life/internal/entity"
	"life/internal/usecase/snapshot"
)

type SnapshotHandler struct {
	uc *snapshot.UseCase
}

func NewSnapshot(uc *snapshot.UseCase) *SnapshotHandler {
	return &SnapshotHandler{uc: uc}
}

type createSnapshotRequest struct {
	LifeAreas    map[string]int `json:"life_areas"`
	InterestTags []string       `json:"interest_tags"`
	TopGoals     []entity.Goal  `json:"top_goals"`
}

func (h *SnapshotHandler) Create(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		response.Unauthorized(w, "not authenticated")
		return
	}

	var req createSnapshotRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	if len(req.LifeAreas) == 0 {
		response.BadRequest(w, "life_areas is required")
		return
	}
	if len(req.TopGoals) == 0 {
		response.BadRequest(w, "top_goals is required")
		return
	}

	s, err := h.uc.Create(r.Context(), user.ID, req.LifeAreas, req.InterestTags, req.TopGoals)
	if err != nil {
		response.InternalError(w, "failed to save snapshot")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"data":    snapshotPayload(s),
	})
}

func (h *SnapshotHandler) List(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		response.Unauthorized(w, "not authenticated")
		return
	}

	snapshots, err := h.uc.List(r.Context(), user.ID)
	if err != nil {
		response.InternalError(w, "failed to retrieve snapshots")
		return
	}

	payloads := make([]map[string]any, len(snapshots))
	for i, s := range snapshots {
		payloads[i] = snapshotPayload(s)
	}
	response.Success(w, payloads)
}

func (h *SnapshotHandler) GetLatest(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		response.Unauthorized(w, "not authenticated")
		return
	}

	s, err := h.uc.GetLatest(r.Context(), user.ID)
	if err != nil {
		response.InternalError(w, "failed to retrieve snapshot")
		return
	}
	if s == nil {
		response.NotFound(w, "no snapshot found")
		return
	}

	response.Success(w, snapshotPayload(s))
}

func snapshotPayload(s *entity.LifeSnapshot) map[string]any {
	return map[string]any{
		"id":            s.ID,
		"life_areas":    s.LifeAreas,
		"interest_tags": s.InterestTags,
		"top_goals":     s.TopGoals,
		"created_at":    s.CreatedAt,
	}
}
