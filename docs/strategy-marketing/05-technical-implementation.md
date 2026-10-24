# 05 — Technical Implementation (as built)

Status: Implemented and tested (2026-10-24)
Scope: `backend/` (FastAPI), `admin/` (Next.js), `frontend/` (Astro)

Design rule: **nothing about treks, prices, cities or offer terms is hard-coded.** Treks come from
the trek table, offer/calculator/quiz settings from an admin-editable settings document, and city
routes from admin-managed tables.

## 1. Data model

### 1.1 New trek columns (`treks` table)

| Column | Type | Purpose |
|--------|------|---------|
| `pickup_city` | VARCHAR(120) | Links a trek to city routes (`city_routes.to_base`, case-insensitive) |
| `pickup_time` | VARCHAR(50) | Shown on quiz results, city pages, calculator |
| `quiz_tags` | JSON | Which quiz answers the trek matches (vocabulary below) |
| `quiz_persona` | VARCHAR(120) | Result headline, e.g. "The Sunrise Summiteer" |
| `quiz_share_line` | VARCHAR(255) | Pre-filled share text |

Quiz tag vocabulary (`app/models/marketing.py → QUIZ_TAGS`): `summit`, `frozen_lake`,
`snow_forest`, `meadow`, `pass_crossing`, `views`, `weekend`, `culture`, `hot_springs`,
`solitude`, `extreme`. Unknown tags are rejected by the API. Treks without tags get tags inferred
from their name/summary on the frontend, so the quiz works before ops tags anything.

### 1.2 New tables

| Table | Purpose |
|-------|---------|
| `marketing_settings` | Single row (id=1), JSON document: student discount, quiz, calculator rates + gear list, city page quality rules. Stored as JSON so new settings never need a migration; defaults are merged in by the Pydantic schema. |
| `departure_cities` | One row per "Treks from [city]" page: intro, local tips, FAQs, SEO, `last_verified`, `verified_by`, `is_published` |
| `city_routes` | Routes per city: `to_base`, `mode` (`group_departure`, `volvo_bus`, `ordinary_bus`, `train`, `flight`, `shared_cab`, `taxi`), operator, departure point/time, duration, one-way fare range, notes, source. Cascade-deleted with the city. |

Group departures (decision #4) are routes with `mode = group_departure`; city pages show them as
the headline block and the calculator offers them as a travel option.

### 1.3 Migrations

- Default startup path (`create_all`) creates the new tables; `app/db/schema_patch.py` adds the
  new trek columns to existing databases. The same patch runs in `poetry run seed`.
- Alembic users: `alembic/versions/i7j8k9l0m1n2_marketing_tools.py` adds everything and **merges
  the two existing heads** (`g5h6i7j8k9l0`, `h6i7j8k9l0m1`) so `alembic upgrade head` works.

### 1.4 Seed (`app/db/seed_marketing.py`, runs inside `poetry run seed`)

- 10 winter treks (Himachal + Uttarakhand) inserted as **drafts** — never auto-published.
- Marketing fields filled on existing treks **only where empty** (never overwrites admin edits).
- Default marketing settings row.
- Draft city shells for Dehradun, Delhi, Chandigarh, Lucknow **without routes** (ops must add
  verified routes; the publish gate enforces it).

## 2. API

| Method & path | Auth | Purpose |
|---------------|------|---------|
| `GET /api/v1/marketing/settings` | public | Settings + `quiz_tag_options` + `route_modes` |
| `PUT /api/v1/marketing/settings` | admin | Replace settings document (validated) |
| `GET /api/v1/marketing/treks?scope=quiz\|all` | public | Published treks with quiz fields and up to 12 upcoming batches (`price` already resolves `price_override`). `quiz` = best season overlaps the quiz months |
| `GET /api/v1/departure-cities` | public | Published cities (summary, bases, staleness) |
| `GET /api/v1/departure-cities/{slug}` | public | Published city with routes + `reachable_treks` |
| `GET /api/v1/departure-cities/admin` | admin | All cities with `quality_issues` |
| `GET /api/v1/departure-cities/admin/{id}` | admin | One city (draft or live) |
| `POST /api/v1/departure-cities` | admin | Create (routes included) |
| `PUT /api/v1/departure-cities/{id}` | admin | Update; `routes` replaces all routes |
| `DELETE /api/v1/departure-cities/{id}` | admin | Delete city + routes |
| `GET /api/v1/leads?source=…` | existing | New `source` filter |
| `POST /api/v1/leads` | existing | Now accepts `notes` (≤ 2,000 chars); `source` limited to 50 chars |

### 2.1 City publish gate (`app/services/marketing.py → city_quality_issues`)

A city can only be (or stay) published when **all** pass; otherwise the API returns 422 with the
reasons and rolls back the change. Thresholds are editable in Tool Settings.

- Intro ≥ 300 characters of text
- ≥ 2 routes, each with operator, departure point, departure time, duration, min/max fare and
  source (source optional for our group departures)
- ≥ 3 local tips and ≥ 4 FAQs
- `last_verified` set, not in the future, and within 90 days; `verified_by` set
- At least one route destination matches a **published** trek's pickup city

Published pages that go past 90 days stay live with a "being re-checked" banner; any edit then
requires re-verifying (the gate runs on every save).

## 3. Frontend (Astro SSR + React islands)

| URL | File | Notes |
|-----|------|-------|
| `/tools/` | `pages/tools/index.astro` | Hub; only lists enabled tools |
| `/tools/winter-trek-quiz/` | `pages/tools/winter-trek-quiz/index.astro` | Quiz island + live comparison table + data-driven FAQ (FAQPage JSON-LD) |
| `/tools/winter-trek-quiz/result/{slug}/` | `…/result/[slug].astro` | Shareable result; with answers in the query it shows reasons + ranked alternates; OG image = trek image |
| `/tools/trek-budget-calculator/` | `pages/tools/trek-budget-calculator/index.astro` | Calculator; state in URL (shareable); embed snippet |
| `/tools/trek-budget-calculator/embed/` | `…/embed.astro` | `noindex`, `frame-ancestors *`, credit link; excluded from sitemap |
| `/student-discount/` | `pages/student-discount.astro` | Live student prices, claim form (college required), terms + FAQ from settings |
| `/treks-from/` | `pages/treks-from/index.astro` | Published cities |
| `/treks-from/{city}/` | `pages/treks-from/[city].astro` | Quick answer, group departures, routes per pickup base, reachable treks, tips, FAQ, stale banner |

Logic is in pure, unit-tested modules under `src/lib/marketing/`:
`quiz.ts` (scoring, URL answers), `budget.ts` (cost model, URL state), `discount.ts`,
`format.ts`, `analytics.ts` (`track()` no-op until GA4/Plausible exists), `server.ts` (SSR fetch
helpers + JSON-LD builders).

Site-wide additions: footer "Plan Your Trek" column (tools + published cities) and **dynamic
"Popular Treks"** from featured treks (falls back to the old list if the API is down); "Plan this
trek" card on every trek page (student price, calculator, city routes, quiz); header active-link
fix so `/treks-from/` doesn't highlight "Treks"; sitemap includes tools, result pages and
published cities.

Lead sources: `quiz_winter`, `budget_calculator`, `student_discount`, `city_{slug}`. `?ref=` on any
URL is appended to lead notes (for campus ambassador codes).

## 4. Admin

| Screen | Path |
|--------|------|
| Growth Tools → Tool Settings | `/dashboard/marketing/settings` — student discount, quiz, calculator rates & gear, city rules |
| Growth Tools → Departure Cities | `/dashboard/marketing/cities` — status badges (Draft / Ready / Live / needs re-verify), issue list |
| City editor | `/dashboard/marketing/cities/{id}` and `/create` — routes editor, tips, FAQs, SEO, "Verified today" button, publish switch, live quality checklist |
| Trek → Marketing tab | pickup city (suggests route destinations), pickup time, quiz tags, persona, share line |
| Leads | source filter + notes column |

Also: API validation errors (422 arrays) now display as readable text in every admin form.

## 5. Tests & verification

| Check | Result |
|-------|--------|
| Backend `pytest` (new `tests/`, isolated SQLite, no email) | 16 passed — settings, quiz feed, trek tag validation, lead notes/source, city CRUD, publish gate, staleness, cascade, idempotent seed |
| Frontend `vitest` (`npm test`) | 33 passed — quiz scoring/safety rules, budget maths, discount cap, URL sanitising |
| `astro check` | 0 errors |
| Admin `tsc` + `next build` | pass (4 new routes) |
| Live smoke test (seeded SQLite backend + built frontend + browser) | Quiz → result → lead saved with `quiz_winter` + answers; calculator group scenario matched hand calculation (₹61,376); student claim saved with college; city publish blocked (422) until complete, then live with 8 reachable treks; sitemap verified |

Known pre-existing issues (not introduced here): backend `black`/`isort`/`flake8` fail across most
existing files; `npm run lint` in admin is broken because Next 16 removed `next lint` and the
`.eslintrc.json` crashes on ESLint 9. New files pass black/isort/flake8 and Next's ESLint rules.

## 6. Later

- Analytics script (decision: later) → events already wired.
- Admin "student verified" action + discount stored on booking.
- Summer quiz: change quiz months in Tool Settings (e.g. Apr–Jun) — no code change needed.
