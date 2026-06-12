User Facing Site: [https://thedeckgame.vercel.app/](URL)

# The Deck Game

A year-long, 52-challenge competition based at Yale. Each event is a card in a
standard deck; winning an event wins you that card and an invitation to a
*Squid Game*–style finale once all 52 cards are claimed.

This repo is a monorepo: a React frontend and a FastAPI backend, backed by
Supabase (Postgres + Auth + Storage).

```
apps/
  web/   React + TypeScript + Vite      → deploys to Vercel
  api/   FastAPI + SQLAlchemy + Alembic  → deploys to Render (Docker)
```

Supabase provides Google authentication, the Postgres database, and file
storage. The browser uses Supabase **only to sign in** and obtain a JWT; all
application data flows through the FastAPI backend, which is the single source
of authorization and business logic.

## Architecture

```
Browser (apps/web)
  │ Google sign-in via Supabase → JWT
  │ all data calls → FastAPI with Bearer JWT
  ▼
FastAPI (apps/api)  — verifies JWT, owns all logic, talks to Postgres
  ▼
Supabase: Auth · Postgres · Storage (private "resumes" bucket)
```

### Data model
- `users` — Supabase identity, role (`admin`/`applicant`), and a global
  `profile` (JSONB) of reusable fields (school, grad year, major, links, bio,
  resume).
- `games` — an application instance bound to a card (`suit` + `rank`), with a
  `question_schema` (JSONB) built by an admin, and a `status`
  (`draft`/`published`/`closed`).
- `applications` — one per `(user, game)`. On submit, answers are validated and
  **locked**, and the user's profile is **snapshotted** so later profile edits
  never change a submitted application.
- `application_files` — uploaded files (resume + per-question file answers).

## Local development

### 1. Backend (`apps/api`)
```bash
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
cp .env.example .env        # fill in Supabase + DB values
alembic upgrade head        # create the schema
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

### 2. Frontend (`apps/web`)
```bash
cd apps/web
npm install
cp .env.example .env        # fill in Supabase URL + publishable key + API URL
npm run dev
```
App: http://localhost:5173

### Regenerate the typed API client (optional)
With the API running:
```bash
cd apps/web && npm run gen:api
```

## Configuration

Admins are assigned by email allowlist: set `ADMIN_EMAILS` (comma-separated) in
the backend env. Anyone signing in with one of those Google emails becomes an
admin on first login; everyone else is an applicant.

See `apps/api/.env.example` and `apps/web/.env.example` for the full list of
required values, and the M0 setup notes for the Supabase + Google OAuth console
walkthrough.

## Deployment
- **Frontend → Vercel**: root `apps/web`, build `npm run build`, output `dist`.
  `vercel.json` handles SPA routing. Set the `VITE_*` env vars.
- **Backend → Render**: `render.yaml` defines a Docker web service from
  `apps/api`. It runs `alembic upgrade head` then starts uvicorn. Set the
  backend env vars (and add the Vercel domain to `CORS_ORIGINS` and to
  Supabase Auth → URL Configuration).
```
