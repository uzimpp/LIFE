# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

### Full stack (Docker)

```bash
make up          # build images + start postgres, backend, frontend
make down        # stop and remove containers
make logs        # tail all container logs
make ci          # lint + test (mirrors CI)
```

After any code change, rebuild only the affected service:
```bash
docker compose up --build frontend -d
docker compose up --build backend -d
```

### Backend (Go) — run from `backend/`

```bash
make run         # run with -tags migrate (applies migrations on startup)
make build       # compile binary to bin/app
make test        # go test -v -timeout 60s ./internal/... ./pkg/...
make lint        # golangci-lint run
make swagger     # regenerate docs/ from route.go annotations
make deps        # go mod tidy && go mod verify

# single package
go test -v ./internal/usecase/auth/...

# create a new migration
make migrate-create NAME=add_foo_column

# install tools (migrate, swag, golangci-lint, air)
make bin-deps

# hot reload during local dev (requires air)
air
```

### Frontend (Next.js) — run from `frontend/`

```bash
npm run dev      # start dev server on :3000
npm run build    # production build (standalone output)
npm test         # vitest run (unit tests)
npm run lint     # eslint

# Playwright e2e (stack must be running)
./node_modules/.bin/playwright test tests/redirect-flow.spec.ts
```

---

## Architecture

### Monorepo layout

```
LIFE/
├── backend/        Go 1.25 API service
├── frontend/       Next.js 16 App Router
├── docker-compose.yml
└── Makefile        proxies to backend/Makefile + frontend npm
```

### Backend layers (`backend/internal/`)

Strict layered architecture — no layer may import from a layer above it:

```
cmd/app/main.go
  └─ internal/app/app.go          wires everything, handles OS signals
       ├─ internal/config/         env-tagged struct (caarlos0/env)
       ├─ pkg/postgres/            pgxpool wrapper
       ├─ internal/repo/postgres/  one *_repo.go per entity (pgx + squirrel)
       ├─ internal/usecase/        one package per feature: auth, snapshot, odyssey, energy
       │    └─ repo/repo.go        repo interfaces consumed by usecases
       └─ internal/controller/http/
            ├─ router.go           net/http ServeMux, mounts /healthz, /swagger/*, /v1/*
            ├─ middleware/         auth (cookie→context), cors, logging, recover
            └─ v1/
                 ├─ route.go       Deps struct + RegisterV1() — all route registration lives here
                 ├─ handler/       one *_handler.go per feature
                 └─ response/      JSON envelope helpers (Success, BadRequest, etc.)
```

**Key wiring pattern**: `app.go` constructs all repos → usecases → fills `v1.Deps{}` → passes to `router.New()`. To add a new feature: create entity → repo interface in `usecase/repo/repo.go` → postgres impl → usecase package → handler → add to `Deps` + `RegisterV1`.

**Auth flow**: `GET /v1/auth/google` sets an `oauth_state` cookie and redirects to Google. Callback verifies state, exchanges code, upserts user, creates a `sessions` row, sets an opaque `session` cookie (UUID), then redirects to `cfg.HTTP.Host + "/dashboard"` (the frontend URL). The `middleware.Auth` func reads the cookie, looks up the session in Postgres, and injects `*entity.User` into the request context. Protected handlers call `middleware.UserFromContext(r.Context())`.

**Migrations**: numbered SQL files in `backend/migrations/`. Run automatically when the binary is built with `-tags migrate` (which `make run` and the Docker image use). To create a new migration: `make migrate-create NAME=<name>`.

**Routing**: uses Go 1.22+ method+path patterns — `mux.HandleFunc("GET /v1/foo", h)`. Path parameters extracted via `r.PathValue("id")`.

### Frontend layers (`frontend/`)

```
app/
  layout.tsx              root layout — loads Libre Caslon Display + Host Grotesk fonts
  (app)/
    layout.tsx            protected layout — server component that calls GET /v1/auth/me;
                          redirects to /login on 401. Uses BACKEND_URL (Docker internal)
                          not NEXT_PUBLIC_API_URL (browser-facing).
    dashboard/page.tsx    aggregate view, GSAP ScrollTrigger card reveals
    onboarding/page.tsx   life snapshot wizard (3 steps: sliders → tags → goals)
    odyssey/page.tsx      Odyssey Planning wizard (Plan A/B/C + rating review)
    energy/page.tsx       energy log form + recharts weekly bar chart
  login/page.tsx          public, Google sign-in link
lib/
  api.ts                  fetch wrapper — always sends credentials: 'include'
  utils.ts                cn() helper (clsx + tailwind-merge)
components/
  ui/                     shadcn/ui components
  motion/                 shared GSAP/motion components
tests/
  *.test.tsx              vitest unit tests
  *.spec.ts               Playwright e2e tests
```

**Server vs client fetching**: `(app)/layout.tsx` is a server component — it uses `BACKEND_URL` (Docker service name `http://backend:8080`) for server-to-server fetches. All client components (`"use client"`) use `lib/api.ts` which reads `NEXT_PUBLIC_API_URL` (browser-facing `http://localhost:8080`). Never use `NEXT_PUBLIC_API_URL` in server components when running in Docker.

**Motion libraries**: `gsap` for page-level orchestration (ScrollTrigger, multi-step wizard transitions), `motion` (formerly Framer Motion) for component-level micro-interactions (hover, tap, spring). Always respect `prefers-reduced-motion`.

### Docker networking

| Variable | Value in Docker | Purpose |
|---|---|---|
| `BACKEND_URL` | `http://backend:8080` | Server component → Go backend (internal Docker network) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Browser → Go backend (host port mapping) |

After changing `docker-compose.yml` or any server environment variable, rebuild the affected container (`docker compose up --build <service> -d`).

### Design system

Defined in `.plan/ux&ui.md`. Key rules:

- **Tone**: reflective, never motivational. No emojis, no exclamation marks.
- **Typography**: `Libre Caslon Display` via `.title` class for all headings ≥ `text-4xl`. `Host Grotesk` for everything else (applied globally on `<body>`).
- **Colour**: zinc neutral scale only (`zinc-50/950` bg, `zinc-900/100` fg, `zinc-600/400` muted). No gradients. No drop shadows beyond `shadow-sm`.
- **Buttons**: primary = `rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white`. Always include `cursor-pointer` and `focus-visible:ring-2`.
- **Layout**: `max-w-2xl` for prose/wizards, `max-w-5xl` for dashboard. Page padding `px-6` mobile / `px-12` tablet.

### Testing conventions

**Backend**: table-driven, `_test.go` per file. Usecase tests use hand-written in-memory fakes (see `mock_test.go` files) — no mocking libraries. Handler tests use `httptest.NewRecorder`. Integration (repo) tests are gated by `-tags=integration` and use testcontainers.

**Frontend**: `vitest` for unit tests (jsdom environment). `@playwright/test` for e2e — run against the live Docker stack. Use `./node_modules/.bin/playwright` not `npx playwright` (version conflict avoidance).
