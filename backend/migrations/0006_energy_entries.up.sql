CREATE TABLE energy_entries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity       TEXT NOT NULL,
  started_at     TIMESTAMPTZ NOT NULL,
  ended_at       TIMESTAMPTZ NOT NULL,
  energy_before  SMALLINT NOT NULL CHECK (energy_before BETWEEN 1 AND 10),
  energy_after   SMALLINT NOT NULL CHECK (energy_after  BETWEEN 1 AND 10),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON energy_entries (user_id, started_at DESC);
