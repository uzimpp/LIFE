package entity

import (
	"time"

	"github.com/google/uuid"
)

type OdysseyPath struct {
	ID           uuid.UUID
	PlanID       uuid.UUID
	SortOrder    int16
	Label        string
	Description  string
	TimelineText string
	Likeability  int16
	Confidence   int16
	Excitement   int16
}

type OdysseyPlan struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	Paths     []OdysseyPath
	CreatedAt time.Time
}
