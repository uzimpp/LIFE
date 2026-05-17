CREATE TABLE odyssey_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE odyssey_paths (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       UUID NOT NULL REFERENCES odyssey_plans(id) ON DELETE CASCADE,
  sort_order    SMALLINT NOT NULL,
  label         TEXT NOT NULL,
  description   TEXT NOT NULL,
  timeline_text TEXT NOT NULL,
  likeability   SMALLINT NOT NULL CHECK (likeability BETWEEN 1 AND 10),
  confidence    SMALLINT NOT NULL CHECK (confidence  BETWEEN 1 AND 10),
  excitement    SMALLINT NOT NULL CHECK (excitement  BETWEEN 1 AND 10),
  UNIQUE (plan_id, sort_order)
);
