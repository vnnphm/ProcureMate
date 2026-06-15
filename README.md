# ProcureMate

ProcureMate is a procurement workflow app for creating purchase requests, routing approvals, checking department budgets, and managing vendors.

The project is split into a FastAPI backend and a React/Vite frontend.

## Features

- Session-based login with CSRF protection
- Purchase request intake from plain text
- AI-assisted request extraction and recommendations
- Approval workflow for manager, department head, finance, and procurement steps
- Request audit log and more-info flow
- Department budget tracking and budget impact checks
- Vendor management
- Role-aware backend authorization for approval actions

<img width="800" height="476" alt="ScreenRecording2026-06-11at6 09 45PM-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/418ae7ce-1f04-4960-b83b-2157e5ff36d8" />


## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn-style UI components
- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL, Redis
- Tooling: npm, uv, Docker Compose

## Repository Layout

```text
.
├── backend/
│   ├── docker-compose.yml
│   └── backend/
│       ├── src/
│       ├── migrations/
│       ├── pyproject.toml
│       └── .env.example
└── frontend/
    ├── src/
    ├── package.json
    └── vite.config.ts
```

## Prerequisites

- Node.js and npm
- Python 3.11+
- uv
- Docker Desktop

## Backend Setup

Start Postgres and Redis:

```bash
cd backend
docker compose up -d postgres redis
```

Create a backend environment file:

```bash
cd backend
cp .env.example .env
```

For local development outside Docker, make sure these values point at localhost:

```env
POSTGRES_SERVER=localhost
CACHE_REDIS_HOST=localhost
RATE_LIMITER_REDIS_HOST=localhost
SESSION_REDIS_HOST=localhost
TASKIQ_REDIS_HOST=localhost
```

Run migrations:

```bash
cd backend/backend
POSTGRES_SERVER=localhost CACHE_REDIS_HOST=localhost RATE_LIMITER_REDIS_HOST=localhost SESSION_REDIS_HOST=localhost TASKIQ_REDIS_HOST=localhost uv run alembic upgrade head
```

Start the API:

```bash
POSTGRES_SERVER=localhost CACHE_REDIS_HOST=localhost RATE_LIMITER_REDIS_HOST=localhost SESSION_REDIS_HOST=localhost TASKIQ_REDIS_HOST=localhost uv run uvicorn src.interfaces.main:app --reload --host 0.0.0.0 --port 8000
```

API docs:

```text
http://localhost:8000/docs
```

## Frontend Setup

Create a frontend environment file:

```bash
cd frontend
printf 'VITE_API_BASE_URL=http://localhost:8000/api\n' > .env
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Common Commands

Build frontend:

```bash
cd frontend
npm run build
```

Lint frontend:

```bash
cd frontend
npm run lint
```

Run backend tests:

```bash
cd backend/backend
uv run pytest
```

Run backend migrations:

```bash
cd backend/backend
uv run alembic upgrade head
```

## Git Notes

Do not commit generated or local-only files:

- `node_modules/`
- `.venv/`
- `.env`
- `.idea/`
- `dist/`
- `__pycache__/`

Commit lock files and source files:

- `frontend/package-lock.json`
- `backend/backend/uv.lock`
- source files under `frontend/src/` and `backend/backend/src/`
- Alembic migrations under `backend/backend/migrations/versions/`

## Current Development Notes

- The frontend already calls the backend for auth, requests, approvals, budgets, and vendors.
- Some request detail sections still use mock vendor/comparison data.
- Role-based UI hiding can be improved; backend authorization is the source of truth.
- Budget features require the `department_budgets` migration to be applied.
