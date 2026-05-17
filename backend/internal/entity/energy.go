package entity

import (
	"time"

	"github.com/google/uuid"
)

type EnergyEntry struct {
	ID            uuid.UUID
	UserID        uuid.UUID
	Activity      string
	StartedAt     time.Time
	EndedAt       time.Time
	EnergyBefore  int16
	EnergyAfter   int16
	Notes         string
	CreatedAt     time.Time
}

// EnergyDelta is average (after - before) for an activity over a period.
type EnergyDelta struct {
	Activity string
	AvgDelta float64
	Count    int
}
