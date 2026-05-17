package energy

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"life/internal/entity"
	"life/internal/usecase/repo"
)

type UseCase struct {
	energy repo.EnergyRepo
}

func New(energy repo.EnergyRepo) *UseCase {
	return &UseCase{energy: energy}
}

func (uc *UseCase) Log(ctx context.Context, e *entity.EnergyEntry) error {
	if err := uc.energy.Create(ctx, e); err != nil {
		return fmt.Errorf("energy.Log: %w", err)
	}
	return nil
}

func (uc *UseCase) ListInRange(ctx context.Context, userID uuid.UUID, from, to time.Time) ([]entity.EnergyEntry, error) {
	return uc.energy.ListInRange(ctx, userID, from, to)
}

func (uc *UseCase) Summary(ctx context.Context, userID uuid.UUID, days int) ([]entity.EnergyDelta, error) {
	since := time.Now().AddDate(0, 0, -days)
	return uc.energy.AggregateByActivity(ctx, userID, since)
}
