# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Repository Overview

Full-stack travel/trekking platform with three sub-projects:
- `frontend/` — Public-facing Astro SSR site (Vercel)
- `backend/` — FastAPI REST API (VPS systemd service)
- `admin/` — Next.js 14 admin dashboard (Vercel)

## Development Commands

### Backend (FastAPI + Poetry)
```bash
cd backend
poetry install
poetry run start              # http://localhost:8000 (uvicorn --reload)
poetry run seed               # Seed database with initial data
poetry run sync-google-reviews  # Manually sync Google Place reviews
pytest                        # Run all tests
pytest tests/path/test_file.py::test_name  # Single test
black app/ && isort app/      # Format code
flake8 app/                   # Lint
```

### Frontend (Astro)
```bash
cd frontend
npm install
npm run dev    # http://localhost:4321
npm run build
npm run check  # TypeScript type checking
```

### Admin (Next.js)
```bash
cd admin
npm install
npm run dev    # http://localhost:3001
npm run lint
npm run build
```

## Architecture

### Backend (FastAPI)
**Layered architecture**: `api/v1/endpoints/` → `crud/` → `db/models/` with `services/` for business logic

- `app/core/config.py` — Pydantic settings with `lru_cache`, loaded from `.env`
- `app/core/security.py` — JWT (HS256, 7-day expiry); bcrypt password hashing
- `app/core/auth.py` — Auth dependencies: `get_current_user()`, `get_current_admin_user()`, `get_current_superadmin_user()`; also accepts Firebase ID tokens (verifies issuer/project_id only, no signature check)
- `app/api/v1/router.py` — Aggregates 20+ endpoint modules
- `app/db/session.py` — SQLAlchemy sessions (SQLite in dev, MySQL in prod via `DATABASE_URL`)
- `app/crud/base.py` — Generic `CRUDBase[Model, CreateSchema, UpdateSchema]` with `get`, `get_multi`, `create`, `update`, `remove`; specialized subclasses add complex queries
- Alembic migrations optional — toggle with `USE_ALEMBIC_MIGRATIONS=true`; default is `create_all()` on startup

**Services** (`app/services/`):
- `email.py` — Brevo (transactional email) for lead/contact notifications and itinerary delivery
- `storage.py` — `StorageBackend` abstraction (local or Azure Blob); note: the `/uploads` endpoint bypasses this and writes directly to filesystem
- `google_reviews_sync.py` — Syncs Google Place reviews into DB; called via `POST /google-reviews/sync` or `poetry run sync-google-reviews`

**Key behavioral patterns**:
- Creating a `Lead` triggers `BackgroundTasks` to send admin email notification via Brevo
- `TrekBatch.available_seats` and `is_sold_out` are computed `@property` values, not DB columns; `booked_seats` must be updated manually on booking
- Trek/Expedition models store arrays (gallery, includes, best_season, equipment, meta_keywords) as JSON strings in SQLite/MySQL
- Email delivery status (opened, bounced, delivered) is tracked via Brevo webhook at `POST /webhooks/brevo`, which updates `EmailLog` records
- CORS is currently `allow_origins=["*"]` — all origins allowed

### Frontend (Astro)
- **Island architecture**: static HTML with React interactive islands (`client:load`)
- File-based routing under `src/pages/`; dynamic routes: `treks/[slug].astro`, `expeditions/[slug].astro`, `blog/[slug].astro`, `[slug].astro` (catch-all for static pages)
- `src/lib/api.ts` — Typed fetch wrapper with namespaced APIs (`treksApi`, `expeditionsApi`, `leadsApi`, etc.)
- `src/lib/types.ts` — All TypeScript interfaces; single source of truth for Trek, Expedition, Guide, BlogPost, etc.
- `src/lib/constants.ts` — `SITE_CONFIG`, `NAV_LINKS`, `TREK_OPTIONS`, `DIFFICULTY_LABELS`
- Sitemap generated dynamically at build time by fetching treks, expeditions, and blog posts from the API
- Deployed via `@astrojs/vercel` adapter

### Admin (Next.js 14)
- App Router route groups: `(auth)/login/` for public login, `(dashboard)/dashboard/` for protected routes
- **Firebase Authentication**: login uses `signInWithEmailAndPassword`; Firebase ID token sent as `Authorization: Bearer` to backend; backend creates a synthetic admin user from Firebase token without verifying signature
- `src/store/auth.store.ts` — Zustand store for session state; `src/store/ui.store.ts` for UI
- `src/services/api-client.ts` — Axios client with auth interceptors
- Forms use React Hook Form + Zod validation throughout
- Tiptap rich text editor for blog posts and page content

## Environment Variables

**Backend** (`backend/.env`):
```
DATABASE_URL=sqlite:///./data/app.db   # or mysql+pymysql://user:pass@host:3306/db
SECRET_KEY=change-me-in-production
CORS_ORIGINS=http://localhost:4321,http://localhost:3001
LOCAL_UPLOAD_DIR=uploads
STORAGE_TYPE=local                     # or "azure"
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_CONTAINER_NAME=global-events-travels
BREVO_API_KEY=...
ADMIN_EMAIL=...
SENDER_EMAIL=noreply@example.com
SENDER_NAME=Global Events Travels
API_BASE_URL=http://localhost:8000     # Used to build absolute URLs in emails
FRONTEND_URL=http://localhost:4321
GOOGLE_MAPS_API_KEY=...
GOOGLE_REVIEWS_PLACE_ID=...
GOOGLE_REVIEWS_SYNC_KEY=...            # Optional auth key for cron-triggered sync
USE_ALEMBIC_MIGRATIONS=false
DEBUG=false
```

**Frontend** (`frontend/.env`):
```
PUBLIC_API_BASE_URL=http://localhost:8000
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_GOOGLE_MAPS_API_KEY=...
```

**Admin** (`admin/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
# Firebase config also required (see src/lib/firebase.ts)
```

## Deployment

- CI/CD via `.github/workflows/deploy-backend.yml`, `deploy-admin.yml`, `deploy-frontend.yml`
- Backend production: `api.globaleventstravels.com` — `/home/globaleventstravels-api/htdocs/api.globaleventstravels.com`, port 8100
- Backend staging: `staging.api.globaleventstravels.com` — port 8096
- Admin production: `admin.globaleventstravels.com` — `/home/globaleventstravels-admin/htdocs/admin.globaleventstravels.com`, port 3010
- Frontend production: `globaleventstravels.com` — `/home/globaleventstravels/htdocs/globaleventstravels.com`, port 3011
- Backend runs as a systemd service on VPS; workflow uploads files via SCP, installs deps, generates `.env` from GitHub secrets, and restarts the service
- Frontend and admin also run as systemd services on VPS (built on server via `npm run build`, served by `next start` / Astro node adapter)

## Key Conventions

**Python (backend)**:
- `snake_case` for files/functions, `PascalCase` for classes
- Full type annotations; line length 100 chars (black config)
- Pydantic schemas in `app/models/`, SQLAlchemy models in `app/db/models/`
- All models have `created_at` and `updated_at` timestamps (naive UTC via `datetime.utcnow()`)
- Cascade delete on Trek/Expedition child tables; Lead/Contact deletions set `EmailLog` FK to NULL

**TypeScript (frontend/admin)**:
- `PascalCase` for components, `camelCase` for utilities
- Typed props interfaces for all components
- Astro components use `Astro.props`; React components use typed props interfaces
