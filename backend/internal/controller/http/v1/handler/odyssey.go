package handler

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"life/internal/controller/http/middleware"
	"life/internal/controller/http/v1/response"
	"life/internal/entity"
	"life/internal/usecase/odyssey"
)

type OdysseyHandler struct {
	uc *odyssey.UseCase
}

func NewOdyssey(uc *odyssey.UseCase) *OdysseyHandler {
	return &OdysseyHandler{uc: uc}
}

type odysseyPathInput struct {
	Label        string `json:"label"`
	Description  string `json:"description"`
	TimelineText string `json:"timeline_text"`
	Likeability  int16  `json:"likeability"`
	Confidence   int16  `json:"confidence"`
	Excitement   int16  `json:"excitement"`
}

func (h *OdysseyHandler) Create(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		response.Unauthorized(w, "not authenticated")
		return
	}

	var req struct {
		Paths []odysseyPathInput `json:"paths"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}
	if len(req.Paths) == 0 {
		response.BadRequest(w, "at least one path is required")
		return
	}

	paths := make([]entity.OdysseyPath, len(req.Paths))
	for i, p := range req.Paths {
		paths[i] = entity.OdysseyPath{
			Label:        p.Label,
			Description:  p.Description,
			TimelineText: p.TimelineText,
			Likeability:  clampRating(p.Likeability),
			Confidence:   clampRating(p.Confidence),
			Excitement:   clampRating(p.Excitement),
		}
	}

	plan, err := h.uc.Create(r.Context(), user.ID, paths)
	if err != nil {
		response.InternalError(w, "failed to save plan")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"data":    planPayload(plan),
	})
}

func (h *OdysseyHandler) List(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		response.Unauthorized(w, "not authenticated")
		return
	}

	plans, err := h.uc.List(r.Context(), user.ID)
	if err != nil {
		response.InternalError(w, "failed to retrieve plans")
		return
	}

	payloads := make([]map[string]any, len(plans))
	for i, plan := range plans {
		payloads[i] = planPayload(plan)
	}
	response.Success(w, payloads)
}

func (h *OdysseyHandler) GetLatest(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		response.Unauthorized(w, "not authenticated")
		return
	}

	plan, err := h.uc.GetLatest(r.Context(), user.ID)
	if err != nil {
		response.InternalError(w, "failed to retrieve plan")
		return
	}
	if plan == nil {
		response.NotFound(w, "no odyssey plan found")
		return
	}
	response.Success(w, planPayload(plan))
}

func (h *OdysseyHandler) UpdatePath(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		response.Unauthorized(w, "not authenticated")
		return
	}

	rawID := r.PathValue("id")
	pathID, err := uuid.Parse(rawID)
	if err != nil {
		response.BadRequest(w, "invalid path id")
		return
	}

	var req struct {
		Likeability int16 `json:"likeability"`
		Confidence  int16 `json:"confidence"`
		Excitement  int16 `json:"excitement"`
	}
	if err = json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	path := &entity.OdysseyPath{
		ID:          pathID,
		Likeability: clampRating(req.Likeability),
		Confidence:  clampRating(req.Confidence),
		Excitement:  clampRating(req.Excitement),
	}
	if err = h.uc.UpdatePath(r.Context(), path); err != nil {
		response.InternalError(w, "failed to update path")
		return
	}
	response.Success(w, nil)
}

func clampRating(v int16) int16 {
	if v < 1 {
		return 1
	}
	if v > 10 {
		return 10
	}
	return v
}

func planPayload(plan *entity.OdysseyPlan) map[string]any {
	paths := make([]map[string]any, len(plan.Paths))
	for i, p := range plan.Paths {
		paths[i] = map[string]any{
			"id":            p.ID,
			"sort_order":    p.SortOrder,
			"label":         p.Label,
			"description":   p.Description,
			"timeline_text": p.TimelineText,
			"likeability":   p.Likeability,
			"confidence":    p.Confidence,
			"excitement":    p.Excitement,
		}
	}
	return map[string]any{
		"id":         plan.ID,
		"paths":      paths,
		"created_at": plan.CreatedAt,
	}
}
