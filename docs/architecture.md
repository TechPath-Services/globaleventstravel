# Global Events Travels — Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                  │
│  Browser (Public Site)    Browser (Admin Dashboard)             │
└───────────┬──────────────────────────┬──────────────────────────┘
            │                          │
            ▼                          ▼
┌───────────────────────┐   ┌─────────────────────────┐
│   Frontend (Astro)    │   │   Admin (Next.js 14)    │
│   Port: 4321          │   │   Port: 3001            │
│   SSR + Islands       │   │   App Router + Firebase │
└───────────┬───────────┘   └────────────┬────────────┘
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────┐
│              Backend API (FastAPI)                   │
│              Port: 8000                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │ REST API │  │ Services │  │ Background Tasks  │ │
│  │ v1/      │  │ (Brevo,  │  │ (Email, Sync)     │ │
│  │          │  │  Storage) │  │                   │ │
│  └────┬─────┘  └──────────┘  └───────────────────┘ │
│       │                                             │
│  ┌────▼─────┐  ┌──────────┐                        │
│  │   CRUD   │  │ Alembic  │                        │
│  │   Layer  │  │ Migr.    │                        │
│  └────┬─────┘  └────┬─────┘                        │
│       │              │                              │
│  ┌────▼──────────────▼─────┐                       │
│  │  SQLAlchemy ORM         │                       │
│  │  SQLite (dev) / MySQL   │                       │
│  └─────────────────────────┘                       │
└─────────────────────────────────────────────────────┘
```

## Sub-Projects

| Project | Tech | Purpose | Port |
|---------|------|---------|------|
| `frontend/` | Astro 5 + React Islands + Tailwind | Public-facing SSR site | 4321 |
| `backend/` | FastAPI + SQLAlchemy + Poetry | REST API, business logic, data | 8000 |
| `admin/` | Next.js 14 + Firebase Auth + Zustand | Content management dashboard | 3001 |

## Key Design Decisions

1. **Island Architecture** — Astro renders static HTML; React components hydrate only where interactivity is needed (`client:load`).
2. **Layered Backend** — `endpoints/ → crud/ → db/models/` with `services/` for external integrations (Brevo email, Azure storage, Google Places).
3. **Firebase Auth for Admin** — Admin uses Firebase ID tokens; backend verifies issuer/project_id (no signature check) and creates synthetic admin users.
4. **Dual DB Support** — SQLite for development, MySQL for production, switchable via `DATABASE_URL`.
5. **JSON-in-SQL Arrays** — Trek/Expedition models store arrays (gallery, includes, best_season, equipment) as JSON strings.

## External Services

| Service | Purpose | Config Key |
|---------|---------|------------|
| Brevo | Transactional email (lead notifications, itinerary delivery) | `BREVO_API_KEY` |
| Azure Blob Storage | Image/file uploads (production) | `AZURE_STORAGE_CONNECTION_STRING` |
| Google Places API | Review sync into DB | `GOOGLE_MAPS_API_KEY` |
| Firebase | Admin authentication | `NEXT_PUBLIC_FIREBASE_*` |

## Related Documentation

- [Deployment Guide](./deployment.md)
- [Platform Migration](./platform-migration.md)
- [Design System](./design-system.md)
- [Development Guide](./dev-guide.md)
- [Quick Reference](./quick-reference.md)
