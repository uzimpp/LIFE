package snapshot

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"life/internal/entity"
	"life/internal/usecase/repo"
)

type UseCase struct {
	snapshots repo.SnapshotRepo
}

func New(snapshots repo.SnapshotRepo) *UseCase {
	return &UseCase{snapshots: snapshots}
}

func (uc *UseCase) Create(ctx context.Context, userID uuid.UUID, areas map[string]int, tags []string, goals []entity.Goal) (*entity.LifeSnapshot, error) {
	s := &entity.LifeSnapshot{
		UserID:       userID,
		LifeAreas:    areas,
		InterestTags: tags,
		TopGoals:     goals,
	}
	if err := uc.snapshots.Create(ctx, s); err != nil {
		return nil, fmt.Errorf("snapshot.Create: %w", err)
	}
	return s, nil
}

func (uc *UseCase) GetLatest(ctx context.Context, userID uuid.UUID) (*entity.LifeSnapshot, error) {
	return uc.snapshots.GetLatest(ctx, userID)
}

func (uc *UseCase) List(ctx context.Context, userID uuid.UUID) ([]*entity.LifeSnapshot, error) {
	return uc.snapshots.ListForUser(ctx, userID)
}
