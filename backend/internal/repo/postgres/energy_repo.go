package postgres

import (
	"context"
	"fmt"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/google/uuid"
	"life/internal/entity"
)

type EnergyRepo struct {
	db *DB
}

func NewEnergyRepo(db *DB) *EnergyRepo {
	return &EnergyRepo{db: db}
}

func (r *EnergyRepo) Create(ctx context.Context, e *entity.EnergyEntry) error {
	sql, args, err := sq.
		Insert("energy_entries").
		Columns("user_id", "activity", "started_at", "ended_at",
			"energy_before", "energy_after", "notes").
		Values(e.UserID, e.Activity, e.StartedAt, e.EndedAt,
			e.EnergyBefore, e.EnergyAfter, e.Notes).
		Suffix("RETURNING id, created_at").
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return fmt.Errorf("EnergyRepo.Create build: %w", err)
	}
	return r.db.Pool.QueryRow(ctx, sql, args...).Scan(&e.ID, &e.CreatedAt)
}

func (r *EnergyRepo) ListInRange(ctx context.Context, userID uuid.UUID, from, to time.Time) ([]entity.EnergyEntry, error) {
	sql, args, err := sq.
		Select("id", "user_id", "activity", "started_at", "ended_at",
			"energy_before", "energy_after", "notes", "created_at").
		From("energy_entries").
		Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.GtOrEq{"started_at": from},
			sq.LtOrEq{"started_at": to},
		}).
		OrderBy("started_at DESC").
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return nil, fmt.Errorf("EnergyRepo.ListInRange build: %w", err)
	}

	rows, err := r.db.Pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("EnergyRepo.ListInRange query: %w", err)
	}
	defer rows.Close()

	var entries []entity.EnergyEntry
	for rows.Next() {
		var e entity.EnergyEntry
		if err = rows.Scan(&e.ID, &e.UserID, &e.Activity, &e.StartedAt, &e.EndedAt,
			&e.EnergyBefore, &e.EnergyAfter, &e.Notes, &e.CreatedAt); err != nil {
			return nil, fmt.Errorf("EnergyRepo.ListInRange scan: %w", err)
		}
		entries = append(entries, e)
	}
	return entries, rows.Err()
}

func (r *EnergyRepo) AggregateByActivity(ctx context.Context, userID uuid.UUID, since time.Time) ([]entity.EnergyDelta, error) {
	sql, args, err := sq.
		Select("activity",
			"AVG(energy_after::float - energy_before::float) AS avg_delta",
			"COUNT(*) AS cnt").
		From("energy_entries").
		Where(sq.And{
			sq.Eq{"user_id": userID},
			sq.GtOrEq{"started_at": since},
		}).
		GroupBy("activity").
		OrderBy("avg_delta DESC").
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return nil, fmt.Errorf("EnergyRepo.AggregateByActivity build: %w", err)
	}

	rows, err := r.db.Pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("EnergyRepo.AggregateByActivity query: %w", err)
	}
	defer rows.Close()

	var deltas []entity.EnergyDelta
	for rows.Next() {
		var d entity.EnergyDelta
		if err = rows.Scan(&d.Activity, &d.AvgDelta, &d.Count); err != nil {
			return nil, fmt.Errorf("EnergyRepo.AggregateByActivity scan: %w", err)
		}
		deltas = append(deltas, d)
	}
	return deltas, rows.Err()
}
