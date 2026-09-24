# Project: Treks Page UI/UX Redesign & Optimization

## Architecture
- **Framework**: Astro 4 SSR (`@astrojs/vercel` / node) with Tailwind CSS 3 and React 18 islands.
- **Scope Root**: `frontend/src/pages/treks/index.astro` and `frontend/src/components/trek/`.
- **Target Page**: `http://localhost:4321/treks` (Treks catalog & discovery).
- **Data Flow**:
  1. Astro SSR extracts query params (`page`, `difficulty`, `season`, `max_price`, `location`, `sort`, `search`).
  2. SSR fetches `/api/v1/treks` from backend (with query params) and aggregates filter dimensions.
  3. Redesigned UI renders Hero, Search Bar, Mobile/Tablet/Desktop Responsive Filters, Active Filter Chips, Responsive Trek Grid (`TrekGrid.astro` + `TrekCard.astro`), Pagination, Region Cards, Trust Stats (`WhyChooseUs.astro`), Google Reviews (`GoogleReviews.tsx`), FAQs, and Free Itinerary CTA.
  4. "Featured Treks" section and its API call (`/api/v1/treks/featured`) are completely removed.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Remove Featured Treks (R2) | Eliminate `featuredTreks` API call, `<TrekTrendingRow>` import, and section markup from `treks/index.astro` | M1 | ORIGINAL_REQUEST §R2 | DONE |
| 2 | Backend API Integrity (R3) | Maintain exact `/api/v1/treks` query parameters and data structures without backend changes | M1 | ORIGINAL_REQUEST §R3 | DONE |
| 3 | Hero & Search Bar Redesign | Modernized hero with clean typography, floating search bar with location, difficulty, budget selectors, and quick search chips | M1 | Survey (Explorer 1 & Spec Miner) | DONE |
| 4 | Mobile Filter Modal / Drawer | Collapsible filter controls for mobile viewports (<640px) with sticky/floating filter toggle so catalog is immediately accessible | M1 | Survey (Explorer 1) | DONE |
| 5 | Active Filters Dismissible Chips | Dynamic active filter pill chips above the results grid with one-click dismiss and "Clear All" action | M1 | Survey (Explorer 1 & Spec Miner) | DONE |
| 6 | Responsive Trek Grid & Layout | 1-col on mobile, 2-col on tablet (md), 3-col on desktop (xl) with sticky desktop filter sidebar | M1 | Survey (Explorer 1 & Spec Miner) | DONE |
| 7 | Refined Trek Card UI/UX | Clean card layout with aspect ratio image, price in INR, difficulty badge, specs (duration, altitude, distance), and hover actions | M1 | Survey (Explorer 1) | DONE |
| 8 | Dynamic Pagination Controls | Responsive pagination with page numbers, ellipsis, previous/next buttons, and empty-state fallback | M1 | Survey (Spec Miner) | DONE |
| 9 | Explore by Region & Trust Sections | Visually balanced region cards grid, Why Choose Us trust stats, Google Reviews carousel, FAQ accordion, and WhatsApp CTA | M1 | Survey (Spec Miner) | DONE |
| 10 | Typecheck & Build Safety | Ensure `npm run check` and `npm run build` pass in `frontend/` with 0 new errors | M1 | ORIGINAL_REQUEST Acceptance Criteria | DONE |
| 11 | Browser Verification | Verify `http://localhost:4321/treks` in browser across mobile, tablet, and desktop viewports | M1 | ORIGINAL_REQUEST Acceptance Criteria | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Treks Page UI/UX Redesign & Optimization | `frontend/src/pages/treks/index.astro`, `frontend/src/components/trek/*` — Remove Featured Treks, redesign responsive layout, mobile filter sheet, active filter chips, polish cards, typecheck, build, and browser verification | Survey complete | DONE |

## Interface Contracts
### Frontend ↔ Backend REST API (`/api/v1/treks`)
- `GET /api/v1/treks?skip={number}&limit={number}&status=published&difficulty={string}&season={string}&max_price={number}&min_price={number}&location={string}&sort={string}&search={string}`
- Schema: `PaginatedResponse<TrekListResponse>` -> `{ items: Trek[], total: number, skip: number, limit: number }`
- Verified: Zero backend modifications, exact REST API compatibility preserved.

## Code Layout
- `frontend/src/pages/treks/index.astro`: Primary page route (Updated, verified)
- `frontend/src/components/trek/TrekGrid.astro`: Grid layout & empty state (Updated, verified)
- `frontend/src/components/trek/TrekCard.astro`: Individual trek card (Updated, verified)
- `frontend/src/components/trek/TrekTrendingRow.astro`: Deprecated / removed from usage
- `frontend/src/styles/global.css`: Global styles & Tailwind utilities (Preserved)
