CREATE TABLE life_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  life_areas      JSONB NOT NULL,
  interest_tags   TEXT[] NOT NULL,
  top_goals       JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON life_snapshots (user_id, created_at DESC);
