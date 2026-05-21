# LIFE

A quiet space for reflecting on the shape of your life — your energy, your direction, the plans you're considering.

LIFE is a personal web app built on the practice of **life design**, the approach Bill Burnett and Dave Evans teach in *Designing Your Life*. It is reflective by intent, not motivational: a place to record and re-read, not to optimise or be cheered on.

---

## The Idea

Life design borrows the methods designers use for products and turns them on the question of how to live. The premise is modest — a life is not a problem to be solved but something to be **designed**, and like any design it is built through iteration, attention, and small experiments rather than a single correct decision made once.

A few ideas the app leans on:

**There is no single best life.** You hold several good lives inside you. The work is not to uncover the one right answer but to sketch a few of them honestly and notice which ones you are drawn toward.

**You build your way forward — you don't think your way forward.** Insight comes from action and reflection, not from analysis alone. Reading your own record back is part of the method.

**Wayfinding.** Without a map, you orient by clues. The two reliable clues are *engagement* — when you are absorbed — and *energy* — what fills you versus what empties you. LIFE exists to make those clues visible over time.

**Gravity problems.** Some things in your life are not problems but circumstances, as unarguable as gravity. A circumstance can only be accepted and designed around. Naming the difference keeps your attention on what is actually actionable.

**Coherence over achievement.** A well-designed life is not the most impressive one. It is one where what you believe about work, what you believe about living, and what you actually do are roughly in line with each other.

## What the App Does With It

Three of the book's exercises become three places in the app.

### Life Snapshot — the Dashboard

Before designing anything, you check the gauges. The snapshot asks you to rate the standing of the major domains of your life and tag what currently matters. It is a reading, not a verdict — a baseline you can return to and watch move.

### Energy Log — the Good Time Journal

You record what you did and how it left you: absorbed or restless, filled or drained. Single entries say little; the weekly view is where patterns surface. Over time the log answers a question that is hard to answer from memory — *what actually agrees with me?*

### Odyssey Planning — three plans, held at once

You draft three five-year lives in parallel:

- **Plan A** — the life you are already on the way to.
- **Plan B** — what you would do if Plan A were suddenly impossible.
- **Plan C** — the life you would choose if money and other people's opinions were not part of the equation.

Each plan is reviewed — not scored for quality — against four gauges: **resources** (the time, money, skill, and contacts it would need), **likability** (how much you actually want it), **confidence**, and **coherence** (whether it fits what you believe about a life well lived). Holding three plans at once is the point: it loosens the grip of the single story you assumed you were stuck with.

---

## Tech Stack

| Layer    | Choice                                                                 |
|----------|------------------------------------------------------------------------|
| Backend  | Go 1.25, `net/http`, `pgx`, `squirrel`, `zerolog`                      |
| Frontend | Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui, GSAP, Recharts |
| Database | PostgreSQL 16                                                          |
| Auth     | Google OAuth 2.0 with server-side sessions                             |
| Infra    | Docker Compose, golang-migrate, Swagger                                |

## Getting Started

### 1. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Fill in `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET` in `backend/.env` (redirect URL `http://localhost:8080/v1/auth/google/callback`).

### 2. Run the full stack with Docker

```bash
make up        # build images, start db + backend + frontend
make logs      # follow logs
make down      # stop and remove containers
```

Then open:

- Frontend — http://localhost:3000
- Backend — http://localhost:8080
- Swagger — http://localhost:8080/swagger/index.html

### 3. Run services natively (optional)

```bash
# backend/ — needs Go 1.25+ and a reachable Postgres
make bin-deps && make run

# frontend/ — needs Node 20+
npm install && npm run dev
```

## Development

```bash
make ci                    # lint + test for both services (mirrors CI)

# backend/
make test                  # go test ./internal/... ./pkg/...
make lint
make migrate-create NAME=add_foo

# frontend/
npm test                   # vitest
npm run lint
./node_modules/.bin/playwright test   # e2e, against the running stack
```

A deeper architectural reference — the layered backend, auth flow, and Docker networking — lives in [`CLAUDE.md`](./CLAUDE.md).

## Design Notes

The interface follows the same reflective tone as the philosophy: no emojis, no exclamation marks, nothing that nudges. `Libre Caslon Display` for headings, `Host Grotesk` for body, a zinc neutral palette, and motion that always honours `prefers-reduced-motion`. Full rules in `.rules/design.md`.

## License

[Apache License 2.0](./LICENSE)
