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

type SessionRepo struct {
	db *DB
}

func NewSessionRepo(db *DB) *SessionRepo {
	return &SessionRepo{db: db}
}

func (r *SessionRepo) Create(ctx context.Context, userID uuid.UUID, ttl time.Duration) (*entity.Session, error) {
	expiresAt := time.Now().Add(ttl)
	sql, args, err := sq.
		Insert("sessions").
		Columns("user_id", "expires_at").
		Values(userID, expiresAt).
		Suffix("RETURNING id, user_id, expires_at, created_at").
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return nil, fmt.Errorf("SessionRepo.Create build: %w", err)
	}

	row := r.db.Pool.QueryRow(ctx, sql, args...)
	return scanSession(row)
}

func (r *SessionRepo) GetValid(ctx context.Context, id uuid.UUID) (*entity.Session, error) {
	sql, args, err := sq.
		Select("id", "user_id", "expires_at", "created_at").
		From("sessions").
		Where(sq.And{
			sq.Eq{"id": id},
			sq.Gt{"expires_at": time.Now()},
		}).
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return nil, fmt.Errorf("SessionRepo.GetValid build: %w", err)
	}

	row := r.db.Pool.QueryRow(ctx, sql, args...)
	s, err := scanSession(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("SessionRepo.GetValid scan: %w", err)
	}
	return s, nil
}

func (r *SessionRepo) Delete(ctx context.Context, id uuid.UUID) error {
	sql, args, err := sq.
		Delete("sessions").
		Where(sq.Eq{"id": id}).
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return fmt.Errorf("SessionRepo.Delete build: %w", err)
	}
	_, err = r.db.Pool.Exec(ctx, sql, args...)
	return err
}

func (r *SessionRepo) DeleteExpired(ctx context.Context) error {
	sql, args, err := sq.
		Delete("sessions").
		Where(sq.Lt{"expires_at": time.Now()}).
		PlaceholderFormat(sq.Dollar).
		ToSql()
	if err != nil {
		return fmt.Errorf("SessionRepo.DeleteExpired build: %w", err)
	}
	_, err = r.db.Pool.Exec(ctx, sql, args...)
	return err
}

func scanSession(row pgx.Row) (*entity.Session, error) {
	s := &entity.Session{}
	err := row.Scan(&s.ID, &s.UserID, &s.ExpiresAt, &s.CreatedAt)
	if err != nil {
		return nil, err
	}
	return s, nil
}
