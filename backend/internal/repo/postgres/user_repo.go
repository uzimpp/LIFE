package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"life/internal/entity"
)

type UserRepo struct {
	db *DB
}

func NewUserRepo(db *DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) GetByID(ctx context.Context, id uuid.UUID) (*entity.User, error) {
	sql, args, err := sq.
		Select("id", "email", "google_id", "name", "avatar_url", "created_at", "updated_at").
		From("users").
		Where(sq.Eq{"id": id}).
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return nil, fmt.Errorf("UserRepo.GetByID build: %w", err)
	}

	row := r.db.Pool.QueryRow(ctx, sql, args...)
	u, err := scanUser(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("UserRepo.GetByID scan: %w", err)
	}
	return u, nil
}

func (r *UserRepo) GetByGoogleID(ctx context.Context, googleID string) (*entity.User, error) {
	sql, args, err := sq.
		Select("id", "email", "google_id", "name", "avatar_url", "created_at", "updated_at").
		From("users").
		Where(sq.Eq{"google_id": googleID}).
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return nil, fmt.Errorf("UserRepo.GetByGoogleID build: %w", err)
	}

	row := r.db.Pool.QueryRow(ctx, sql, args...)
	u, err := scanUser(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("UserRepo.GetByGoogleID scan: %w", err)
	}
	return u, nil
}

func (r *UserRepo) Upsert(ctx context.Context, u *entity.User) error {
	sql, args, err := sq.
		Insert("users").
		Columns("email", "google_id", "name", "avatar_url", "updated_at").
		Values(u.Email, u.GoogleID, u.Name, u.AvatarURL, time.Now()).
		Suffix(`ON CONFLICT (google_id) DO UPDATE
			SET email = EXCLUDED.email,
			    name = EXCLUDED.name,
			    avatar_url = EXCLUDED.avatar_url,
			    updated_at = EXCLUDED.updated_at
			RETURNING id, email, google_id, name, avatar_url, created_at, updated_at`).
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return fmt.Errorf("UserRepo.Upsert build: %w", err)
	}

	row := r.db.Pool.QueryRow(ctx, sql, args...)
	updated, err := scanUser(row)
	if err != nil {
		return fmt.Errorf("UserRepo.Upsert scan: %w", err)
	}
	*u = *updated
	return nil
}

func scanUser(row pgx.Row) (*entity.User, error) {
	u := &entity.User{}
	return u, row.Scan(
		&u.ID, &u.Email, &u.GoogleID, &u.Name, &u.AvatarURL,
		&u.CreatedAt, &u.UpdatedAt,
	)
}
