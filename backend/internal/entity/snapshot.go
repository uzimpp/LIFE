package entity

import (
	"time"

	"github.com/google/uuid"
)

type Goal struct {
	Title string `json:"title"`
	Why   string `json:"why"`
}

type LifeSnapshot struct {
	ID           uuid.UUID
	UserID       uuid.UUID
	LifeAreas    map[string]int // e.g. {"health": 7, "career": 4}
	InterestTags []string
	TopGoals     []Goal
	CreatedAt    time.Time
}
