package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"life/internal/controller/http/middleware"
	"life/internal/controller/http/v1/response"
	"life/internal/entity"
	"life/internal/usecase/energy"
)

type EnergyHandler struct {
	uc *energy.UseCase
}

func NewEnergy(uc *energy.UseCase) *EnergyHandler {
	return &EnergyHandler{uc: uc}
}

type logEnergyRequest struct {
	Activity     string    `json:"activity"`
	StartedAt    time.Time `json:"started_at"`
	EndedAt      time.Time `json:"ended_at"`
	EnergyBefore int16     `json:"energy_before"`
	EnergyAfter  int16     `json:"energy_after"`
	Notes        string    `json:"notes"`
}

func (h *EnergyHandler) Log(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		response.Unauthorized(w, "not authenticated")
		return
	}

	var req logEnergyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}
	if req.Activity == "" {
		response.BadRequest(w, "activity is required")
		return
	}

	e := &entity.EnergyEntry{
		UserID:       user.ID,
		Activity:     req.Activity,
		StartedAt:    req.StartedAt,
		EndedAt:      req.EndedAt,
		EnergyBefore: clampRating(req.EnergyBefore),
		EnergyAfter:  clampRating(req.EnergyAfter),
		Notes:        req.Notes,
	}
	if err := h.uc.Log(r.Context(), e); err != nil {
		response.InternalError(w, "failed to log entry")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{"success": true, "data": energyPayload(e)})
}

func (h *EnergyHandler) List(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		response.Unauthorized(w, "not authenticated")
		return
	}

	q := r.URL.Query()
	from, err := parseTime(q.Get("from"), time.Now().AddDate(0, 0, -7))
	if err != nil {
		response.BadRequest(w, "invalid from date")
		return
	}
	to, err := parseTime(q.Get("to"), time.Now())
	if err != nil {
		response.BadRequest(w, "invalid to date")
		return
	}

	entries, err := h.uc.ListInRange(r.Context(), user.ID, from, to)
	if err != nil {
		response.InternalError(w, "failed to fetch entries")
		return
	}

	payloads := make([]map[string]any, len(entries))
	for i := range entries {
		payloads[i] = energyPayload(&entries[i])
	}
	response.Success(w, payloads)
}

func (h *EnergyHandler) Summary(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	if user == nil {
		response.Unauthorized(w, "not authenticated")
		return
	}

	days := 7
	if d := r.URL.Query().Get("days"); d != "" {
		if parsed, err := strconv.Atoi(d); err == nil && parsed > 0 {
			days = parsed
		}
	}

	deltas, err := h.uc.Summary(r.Context(), user.ID, days)
	if err != nil {
		response.InternalError(w, "failed to compute summary")
		return
	}
	response.Success(w, deltas)
}

func energyPayload(e *entity.EnergyEntry) map[string]any {
	return map[string]any{
		"id":             e.ID,
		"activity":       e.Activity,
		"started_at":     e.StartedAt,
		"ended_at":       e.EndedAt,
		"energy_before":  e.EnergyBefore,
		"energy_after":   e.EnergyAfter,
		"notes":          e.Notes,
		"created_at":     e.CreatedAt,
	}
}

func parseTime(s string, fallback time.Time) (time.Time, error) {
	if s == "" {
		return fallback, nil
	}
	return time.Parse(time.RFC3339, s)
}
