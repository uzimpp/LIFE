package postgres

import (
	"context"
	"errors"
	"fmt"

	sq "github.com/Masterminds/squirrel"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"life/internal/entity"
)

type OdysseyRepo struct {
	db *DB
}

func NewOdysseyRepo(db *DB) *OdysseyRepo {
	return &OdysseyRepo{db: db}
}

// Create inserts a plan and all its paths in a single transaction.
func (r *OdysseyRepo) Create(ctx context.Context, plan *entity.OdysseyPlan) error {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("OdysseyRepo.Create begin tx: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	planSQL, planArgs, err := sq.
		Insert("odyssey_plans").
		Columns("user_id").
		Values(plan.UserID).
		Suffix("RETURNING id, created_at").
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return fmt.Errorf("OdysseyRepo.Create plan build: %w", err)
	}
	if err = tx.QueryRow(ctx, planSQL, planArgs...).Scan(&plan.ID, &plan.CreatedAt); err != nil {
		return fmt.Errorf("OdysseyRepo.Create plan insert: %w", err)
	}

	for i := range plan.Paths {
		p := &plan.Paths[i]
		p.PlanID = plan.ID
		p.SortOrder = int16(i + 1)

		pathSQL, pathArgs, err := sq.
			Insert("odyssey_paths").
			Columns("plan_id", "sort_order", "label", "description", "timeline_text",
				"likeability", "confidence", "excitement").
			Values(p.PlanID, p.SortOrder, p.Label, p.Description, p.TimelineText,
				p.Likeability, p.Confidence, p.Excitement).
			Suffix("RETURNING id").
			PlaceholderFormat(sq.Dollar).
			ToSql()
		if err != nil {
			return fmt.Errorf("OdysseyRepo.Create path build: %w", err)
		}
		if err = tx.QueryRow(ctx, pathSQL, pathArgs...).Scan(&p.ID); err != nil {
			return fmt.Errorf("OdysseyRepo.Create path insert: %w", err)
		}
	}

	return tx.Commit(ctx)
}

// GetLatestForUser returns the most recent plan with all its paths.
func (r *OdysseyRepo) GetLatestForUser(ctx context.Context, userID uuid.UUID) (*entity.OdysseyPlan, error) {
	planSQL, planArgs, err := sq.
		Select("id", "user_id", "created_at").
		From("odyssey_plans").
		Where(sq.Eq{"user_id": userID}).
		OrderBy("created_at DESC").
		Limit(1).
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return nil, fmt.Errorf("OdysseyRepo.GetLatest plan build: %w", err)
	}

	var plan entity.OdysseyPlan
	err = r.db.Pool.QueryRow(ctx, planSQL, planArgs...).
		Scan(&plan.ID, &plan.UserID, &plan.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("OdysseyRepo.GetLatest plan scan: %w", err)
	}

	pathsSQL, pathsArgs, err := sq.
		Select("id", "plan_id", "sort_order", "label", "description", "timeline_text",
			"likeability", "confidence", "excitement").
		From("odyssey_paths").
		Where(sq.Eq{"plan_id": plan.ID}).
		OrderBy("sort_order").
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return nil, fmt.Errorf("OdysseyRepo.GetLatest paths build: %w", err)
	}

	rows, err := r.db.Pool.Query(ctx, pathsSQL, pathsArgs...)
	if err != nil {
		return nil, fmt.Errorf("OdysseyRepo.GetLatest paths query: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var p entity.OdysseyPath
		if err = rows.Scan(&p.ID, &p.PlanID, &p.SortOrder, &p.Label, &p.Description,
			&p.TimelineText, &p.Likeability, &p.Confidence, &p.Excitement); err != nil {
			return nil, fmt.Errorf("OdysseyRepo.GetLatest path scan: %w", err)
		}
		plan.Paths = append(plan.Paths, p)
	}

	return &plan, rows.Err()
}

// ListForUser returns all plans for a user (newest first) with their paths.
func (r *OdysseyRepo) ListForUser(ctx context.Context, userID uuid.UUID) ([]*entity.OdysseyPlan, error) {
	plansSQL, plansArgs, err := sq.
		Select("id", "user_id", "created_at").
		From("odyssey_plans").
		Where(sq.Eq{"user_id": userID}).
		OrderBy("created_at DESC").
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return nil, fmt.Errorf("OdysseyRepo.ListForUser plans build: %w", err)
	}

	planRows, err := r.db.Pool.Query(ctx, plansSQL, plansArgs...)
	if err != nil {
		return nil, fmt.Errorf("OdysseyRepo.ListForUser plans query: %w", err)
	}
	defer planRows.Close()

	var plans []*entity.OdysseyPlan
	planMap := map[uuid.UUID]*entity.OdysseyPlan{}
	var planIDs []uuid.UUID

	for planRows.Next() {
		var plan entity.OdysseyPlan
		if err = planRows.Scan(&plan.ID, &plan.UserID, &plan.CreatedAt); err != nil {
			return nil, fmt.Errorf("OdysseyRepo.ListForUser plan scan: %w", err)
		}
		plans = append(plans, &plan)
		planIDs = append(planIDs, plan.ID)
		planMap[plan.ID] = &plan
	}
	if err = planRows.Err(); err != nil {
		return nil, err
	}
	if len(plans) == 0 {
		return plans, nil
	}

	pathsSQL, pathsArgs, err := sq.
		Select("id", "plan_id", "sort_order", "label", "description", "timeline_text",
			"likeability", "confidence", "excitement").
		From("odyssey_paths").
		Where(sq.Eq{"plan_id": planIDs}).
		OrderBy("plan_id", "sort_order").
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return nil, fmt.Errorf("OdysseyRepo.ListForUser paths build: %w", err)
	}

	pathRows, err := r.db.Pool.Query(ctx, pathsSQL, pathsArgs...)
	if err != nil {
		return nil, fmt.Errorf("OdysseyRepo.ListForUser paths query: %w", err)
	}
	defer pathRows.Close()

	for pathRows.Next() {
		var p entity.OdysseyPath
		if err = pathRows.Scan(&p.ID, &p.PlanID, &p.SortOrder, &p.Label, &p.Description,
			&p.TimelineText, &p.Likeability, &p.Confidence, &p.Excitement); err != nil {
			return nil, fmt.Errorf("OdysseyRepo.ListForUser path scan: %w", err)
		}
		if plan, ok := planMap[p.PlanID]; ok {
			plan.Paths = append(plan.Paths, p)
		}
	}

	return plans, pathRows.Err()
}

// UpdatePath updates the three rating fields for a single path.
func (r *OdysseyRepo) UpdatePath(ctx context.Context, path *entity.OdysseyPath) error {
	sql, args, err := sq.
		Update("odyssey_paths").
		Set("likeability", path.Likeability).
		Set("confidence", path.Confidence).
		Set("excitement", path.Excitement).
		Where(sq.Eq{"id": path.ID}).
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return fmt.Errorf("OdysseyRepo.UpdatePath build: %w", err)
	}
	_, err = r.db.Pool.Exec(ctx, sql, args...)
	return err
}
