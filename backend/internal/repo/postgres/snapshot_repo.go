package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	sq "github.com/Masterminds/squirrel"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"life/internal/entity"
)

type SnapshotRepo struct {
	db *DB
}

func NewSnapshotRepo(db *DB) *SnapshotRepo {
	return &SnapshotRepo{db: db}
}

func (r *SnapshotRepo) Create(ctx context.Context, s *entity.LifeSnapshot) error {
	areasJSON, err := json.Marshal(s.LifeAreas)
	if err != nil {
		return fmt.Errorf("SnapshotRepo.Create marshal areas: %w", err)
	}
	goalsJSON, err := json.Marshal(s.TopGoals)
	if err != nil {
		return fmt.Errorf("SnapshotRepo.Create marshal goals: %w", err)
	}

	sql, args, err := sq.
		Insert("life_snapshots").
		Columns("user_id", "life_areas", "interest_tags", "top_goals").
		Values(s.UserID, areasJSON, s.InterestTags, goalsJSON).
		Suffix("RETURNING id, created_at").
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return fmt.Errorf("SnapshotRepo.Create build: %w", err)
	}

	return r.db.Pool.QueryRow(ctx, sql, args...).Scan(&s.ID, &s.CreatedAt)
}

func (r *SnapshotRepo) ListForUser(ctx context.Context, userID uuid.UUID) ([]*entity.LifeSnapshot, error) {
	sql, args, err := sq.
		Select("id", "user_id", "life_areas", "interest_tags", "top_goals", "created_at").
		From("life_snapshots").
		Where(sq.Eq{"user_id": userID}).
		OrderBy("created_at DESC").
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return nil, fmt.Errorf("SnapshotRepo.ListForUser build: %w", err)
	}

	rows, err := r.db.Pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("SnapshotRepo.ListForUser query: %w", err)
	}
	defer rows.Close()

	var snapshots []*entity.LifeSnapshot
	for rows.Next() {
		var (
			s         entity.LifeSnapshot
			areasJSON []byte
			goalsJSON []byte
		)
		if err = rows.Scan(&s.ID, &s.UserID, &areasJSON, &s.InterestTags, &goalsJSON, &s.CreatedAt); err != nil {
			return nil, fmt.Errorf("SnapshotRepo.ListForUser scan: %w", err)
		}
		if err = json.Unmarshal(areasJSON, &s.LifeAreas); err != nil {
			return nil, fmt.Errorf("SnapshotRepo.ListForUser unmarshal areas: %w", err)
		}
		if err = json.Unmarshal(goalsJSON, &s.TopGoals); err != nil {
			return nil, fmt.Errorf("SnapshotRepo.ListForUser unmarshal goals: %w", err)
		}
		snapshots = append(snapshots, &s)
	}
	return snapshots, rows.Err()
}

func (r *SnapshotRepo) GetLatest(ctx context.Context, userID uuid.UUID) (*entity.LifeSnapshot, error) {
	sql, args, err := sq.
		Select("id", "user_id", "life_areas", "interest_tags", "top_goals", "created_at").
		From("life_snapshots").
		Where(sq.Eq{"user_id": userID}).
		OrderBy("created_at DESC").
		Limit(1).
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return nil, fmt.Errorf("SnapshotRepo.GetLatest build: %w", err)
	}

	row := r.db.Pool.QueryRow(ctx, sql, args...)

	var (
		s         entity.LifeSnapshot
		areasJSON []byte
		goalsJSON []byte
	)
	err = row.Scan(&s.ID, &s.UserID, &areasJSON, &s.InterestTags, &goalsJSON, &s.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("SnapshotRepo.GetLatest scan: %w", err)
	}

	if err = json.Unmarshal(areasJSON, &s.LifeAreas); err != nil {
		return nil, fmt.Errorf("SnapshotRepo.GetLatest unmarshal areas: %w", err)
	}
	if err = json.Unmarshal(goalsJSON, &s.TopGoals); err != nil {
		return nil, fmt.Errorf("SnapshotRepo.GetLatest unmarshal goals: %w", err)
	}

	return &s, nil
}
