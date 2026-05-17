package odyssey

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"life/internal/entity"
	"life/internal/usecase/repo"
)

type UseCase struct {
	odysseys repo.OdysseyRepo
}

func New(odysseys repo.OdysseyRepo) *UseCase {
	return &UseCase{odysseys: odysseys}
}

func (uc *UseCase) Create(ctx context.Context, userID uuid.UUID, paths []entity.OdysseyPath) (*entity.OdysseyPlan, error) {
	plan := &entity.OdysseyPlan{
		UserID: userID,
		Paths:  paths,
	}
	if err := uc.odysseys.Create(ctx, plan); err != nil {
		return nil, fmt.Errorf("odyssey.Create: %w", err)
	}
	return plan, nil
}

func (uc *UseCase) GetLatest(ctx context.Context, userID uuid.UUID) (*entity.OdysseyPlan, error) {
	return uc.odysseys.GetLatestForUser(ctx, userID)
}

func (uc *UseCase) List(ctx context.Context, userID uuid.UUID) ([]*entity.OdysseyPlan, error) {
	return uc.odysseys.ListForUser(ctx, userID)
}

func (uc *UseCase) UpdatePath(ctx context.Context, path *entity.OdysseyPath) error {
	return uc.odysseys.UpdatePath(ctx, path)
}
