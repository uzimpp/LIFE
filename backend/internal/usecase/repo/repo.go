package repo

import (
	"context"
	"time"

	"github.com/google/uuid"
	"life/internal/entity"
)

type UserRepo interface {
	GetByID(ctx context.Context, id uuid.UUID) (*entity.User, error)
	GetByGoogleID(ctx context.Context, googleID string) (*entity.User, error)
	Upsert(ctx context.Context, u *entity.User) error
}

type EnergyRepo interface {
	Create(ctx context.Context, e *entity.EnergyEntry) error
	ListInRange(ctx context.Context, userID uuid.UUID, from, to time.Time) ([]entity.EnergyEntry, error)
	AggregateByActivity(ctx context.Context, userID uuid.UUID, since time.Time) ([]entity.EnergyDelta, error)
}

type OdysseyRepo interface {
	Create(ctx context.Context, plan *entity.OdysseyPlan) error
	GetLatestForUser(ctx context.Context, userID uuid.UUID) (*entity.OdysseyPlan, error)
	ListForUser(ctx context.Context, userID uuid.UUID) ([]*entity.OdysseyPlan, error)
	UpdatePath(ctx context.Context, path *entity.OdysseyPath) error
}

type SnapshotRepo interface {
	Create(ctx context.Context, s *entity.LifeSnapshot) error
	GetLatest(ctx context.Context, userID uuid.UUID) (*entity.LifeSnapshot, error)
	ListForUser(ctx context.Context, userID uuid.UUID) ([]*entity.LifeSnapshot, error)
}

type SessionRepo interface {
	Create(ctx context.Context, userID uuid.UUID, ttl time.Duration) (*entity.Session, error)
	GetValid(ctx context.Context, id uuid.UUID) (*entity.Session, error)
	Delete(ctx context.Context, id uuid.UUID) error
	DeleteExpired(ctx context.Context) error
}
