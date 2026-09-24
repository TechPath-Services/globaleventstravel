# Detailed Specification Analysis: Treks Page Redesign

## 1. Overview & Objectives

This specification document outlines the comprehensive analysis of the Treks page (`/treks`) on the Astro frontend (`frontend/src/pages/treks/index.astro`), defining exact routes, component hierarchies, data contracts, feature tables, edge cases, responsive layout requirements, and strict boundary invariants.

The primary goals of the redesign:
1. **R1 (UI/UX Redesign & Responsiveness)**: Transform the page into a visually stunning, intuitive, and modern experience that is fully responsive across mobile (320px–640px), tablet (641px–1024px), and desktop (1025px+).
2. **R2 (Remove Featured Treks)**: Completely remove the "Featured Treks" section (`featuredTreks` API call, `<TrekTrendingRow />` component usage, and markup).
3. **R3 (Backend & API Integrity)**: Preserve all backend APIs, data structures, and data contracts without modification.

---

## 2. Route & File Architecture

### Primary Page & Layout
| File Path | Role | Description |
|-----------|------|-------------|
| `frontend/src/pages/treks/index.astro` | Page Route (`/treks`) | SSR Astro page handling data fetching, URL query params, search, filters, pagination, and section composition. |
| `frontend/src/layouts/MainLayout.astro` | Root Layout | Provides site `<head>`, SEO metadata, global styles, `Header.astro`, `Footer.astro`, and `StickyWhatsAppButton.astro`. |
| `frontend/src/pages/treks/[slug].astro` | Trek Detail (`/treks/[slug]`) | Destination route when clicking any trek card or link. |

### UI Components Used on `/treks`
| Component | Path | Function |
|-----------|------|----------|
| `TrekGrid.astro` | `frontend/src/components/trek/TrekGrid.astro` | Renders a responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`) of `TrekCard` components or an empty state when no treks match. |
| `TrekCard.astro` | `frontend/src/components/trek/TrekCard.astro` | Displays individual trek details: image with aspect ratio, price badge (INR formatted), difficulty badge, rating/review count, duration (`XN/YD`), altitude (`Xm`), distance (`Xkm`), short description, season badges, and hover actions. |
| `TrekTrendingRow.astro` | `frontend/src/components/trek/TrekTrendingRow.astro` | Previously used exclusively for the "Featured Treks" section. **Must be removed from `treks/index.astro`**. |
| `WhyChooseUs.astro` | `frontend/src/components/sections/WhyChooseUs.astro` | 4-column trust statistics section displaying happy trekkers, ratings, years of experience, and no hidden costs. |
| `GoogleReviews.tsx` | `frontend/src/components/sections/GoogleReviews.tsx` | React interactive island (`client:visible`) rendering live Google reviews carousel, aggregate rating, review count, and link to review on Google. |

### Core Libraries & Utilities
| Library File | Path | Function |
|--------------|------|----------|
| `api.ts` | `frontend/src/lib/api.ts` | Base API fetcher, `treksApi.list()`, `treksApi.getFeatured()`, `getGoogleReviews()`, `getSiteSettings()`. |
| `types.ts` | `frontend/src/lib/types.ts` | TypeScript interfaces: `Trek`, `Difficulty`, `TrekStatus`, `PaginatedResponse`, `TrekBatch`, `TrekFAQ`, etc. |
| `constants.ts` | `frontend/src/lib/constants.ts` | Constants: `DIFFICULTY_LABELS`, `API_BASE_URL`, `TREK_REGIONS`, `SITE_CONFIG`, `PAGINATION`. |
| `global.css` | `frontend/src/styles/global.css` | Tailwind base, components (`.container-custom`, `.card`, `.badge`, `.btn-primary`), and brand colors (Primary Orange `#F39C12`, Secondary Blue `#1F3C88`). |

---

## 3. Data Contracts & API Interfaces

### 3.1 `GET /api/v1/treks` (Filtered / Paginated List)
- **URL**: `${API_BASE_URL}/api/v1/treks`
- **Query Parameters**:
  - `skip` (`number`, default `0`): Calculated as `(currentPage - 1) * ITEMS_PER_PAGE`.
  - `limit` (`number`, default `9` on frontend, backend max `100`).
  - `status` (`string`): Set to `'published'` for public listings.
  - `difficulty` (`string`, optional): One of `'easy' | 'moderate' | 'difficult' | 'challenging' | 'extreme'`.
  - `season` (`string`, optional): Best season name, e.g. `'Dec'`, `'May'`, `'October'`.
  - `max_price` (`number` or `string`, optional): Maximum price filter (e.g. `10000`, `20000`).
  - `min_price` (`number` or `string`, optional): Minimum price filter.
  - `location` (`string`, optional): Case-insensitive partial match on trek location.
  - `sort` (`string`, optional): One of `'newest' | 'popularity' | 'price_asc' | 'price_desc' | 'rating'`. Default is `'newest'`.
  - `search` (`string`, optional): Case-insensitive search across name, short description, and location.
- **Response Schema (`PaginatedResponse<TrekListResponse>`)**:
```json
{
  "items": [
    {
      "id": 1,
      "name": "Kedarkantha Trek",
      "slug": "kedarkantha",
      "short_description": "A classic winter snow trek in Uttarakhand...",
      "difficulty": "easy",
      "duration": 6,
      "max_altitude": 3800,
      "distance": 20.0,
      "price": 8500.0,
      "featured_image": "/images/destinations/uttarakhand.jpg",
      "status": "published",
      "featured": true,
      "location": "Sankri, Uttarakhand",
      "best_season": ["Dec", "Jan", "Feb", "Mar", "Apr"],
      "rating": 4.9,
      "review_count": 128,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 15,
  "skip": 0,
  "limit": 9
}
```

### 3.2 `GET /api/v1/treks?limit=100&status=published` (Aggregate Filter Derivation)
- Used during SSR to extract:
  1. `allSeasons`: Unique sorted array of best season tags.
  2. `derivedRegions`: Top 6 regions computed by parsing trek locations (e.g., `"Sankri, Uttarakhand"` -> `"Uttarakhand"`), counting occurrences, and mapping to `REGION_IMAGE_MAP`.
  3. `budgetTiers`: Dynamic budget tier brackets up to maximum trek price.
  4. `popularChips`: 5 quick search pill links for high-frequency queries.

### 3.3 `GET /api/v1/treks/featured` (REMOVED)
- Previously called in `treks/index.astro` (line 211).
- **Specification Mandate**: Removed entirely to eliminate redundant network overhead and satisfy R2.

---

## 4. Component Hierarchy and Page Structure

```
MainLayout
│
├── 1. Cinematic Hero Section
│      └── Title, Subtitle, Background Image with Overlay
│
├── 2. Smart Search & Filter Header Bar
│      ├── Location Dropdown (derivedRegions)
│      ├── Difficulty Dropdown (DIFFICULTY_LABELS)
│      ├── Budget Dropdown (budgetTiers)
│      ├── Search CTA Button
│      └── Quick Filter Pill Chips (Popular Searches / Active Filters)
│
├── 3. Main Results Section (Split Layout)
│      ├── Left Aside: Filter Sidebar (Desktop Sticky / Mobile Drawer/Modal)
│      │     ├── Header: "Filters" + "Reset All"
│      │     ├── Difficulty Filter (Badges with selection state)
│      │     ├── Budget Filter (Price ranges with active state)
│      │     └── Season Filter (Season tag checkboxes/pills)
│      │
│      └── Right / Center Content Area:
│            ├── Results Status Bar (Count: "Showing X-Y of Z treks" + Sort Dropdown)
│            ├── Active Filters Bar (Dismissible filter chips for quick removal)
│            ├── TrekGrid
│            │     └── TrekCard[] (or Empty State if 0 results)
│            └── Pagination Controls (Previous, Numbers, Ellipsis, Next)
│
├── 4. Explore by Region Section
│      └── Responsive 2-to-4 column grid of region cards linking to filtered location URLs
│
├── 5. Why Trek With Us Section
│      └── 4-column trust indicators (10,000+ Trekkers, 4.8 Rating, 8+ Years, No Hidden Costs)
│
├── 6. Google Reviews Section (<GoogleReviews client:visible />)
│      └── Real Google Reviews interactive carousel with star rating & verified badges
│
├── 7. FAQ Section
│      └── Interactive collapsible accordion (<details>) with booking & preparation FAQs
│
└── 8. Final CTA Banner
       └── High-converting CTA card with "Get Free Itinerary" linking to /#lead-form
```

---

## 5. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Routing | SSR Page Route | Dynamic server-side rendered page supporting URL query params | `url.searchParams` (`page`, `difficulty`, `season`, `max_price`, `location`, `sort`) | HTML page response | Falls back to page 1 and default filters | `src/pages/treks/index.astro:19` |
| 2 | Filtering | Location Filter | Filter treks by state/region (e.g., Uttarakhand, Himachal) | `location=string` | Treks matching location string | Case-insensitive partial match via backend `ilike` | `src/pages/treks/index.astro:31`, `backend/app/crud/trek.py:66` |
| 3 | Filtering | Difficulty Filter | Filter treks by difficulty tier | `difficulty=easy\|moderate\|difficult\|challenging\|extreme` | Treks matching difficulty enum | Ignored if invalid enum | `src/lib/constants.ts:37`, `backend/app/api/v1/endpoints/treks.py:25` |
| 4 | Filtering | Budget Filter | Filter treks with price `<= max_price` | `max_price=number` | Treks under price threshold | Ignored if <= 0 or empty | `backend/app/crud/trek.py:57` |
| 5 | Filtering | Season Filter | Filter treks by best season (month name) | `season=string` (e.g. `Dec`, `May`) | Treks where `best_season` contains season | Substring/JSON containment match | `backend/app/crud/trek.py:73` |
| 6 | Sorting | Sort Order | Sort trek listing | `sort=newest\|popularity\|price_asc\|price_desc\|rating` | Reordered trek list | Defaults to `newest` (`created_at.desc()`) | `backend/app/crud/trek.py:78-89` |
| 7 | Pagination | Page Navigation | Paginated trek listings (9 items/page) | `page=number` (`skip=(page-1)*9`, `limit=9`) | Slice of treks, total count, total pages | Clamped to `page >= 1` | `src/pages/treks/index.astro:22-44` |
| 8 | UI/UX | Smart Search Bar | Hero floating form for quick filtering by location, difficulty, budget | Form inputs | Form GET navigation to `/treks?...` | Resets to page 1 on search | `src/pages/treks/index.astro:247-315` |
| 9 | UI/UX | Popular Search Chips | Quick one-click filter pills | Chip href click | Navigates to pre-filtered `/treks` URL | N/A | `src/pages/treks/index.astro:305-312` |
| 10 | UI/UX | Trek Cards | Comprehensive card with image, badges, price in INR, rating, stats | `Trek` object | Rendered card with hover effects | Image fallback to placeholder if null | `src/components/trek/TrekCard.astro` |
| 11 | UI/UX | Empty Results State | Clean placeholder when 0 treks match current filters | `treks.length === 0` | Empty illustration, friendly message, reset suggestion | Renders empty state safely | `src/components/trek/TrekGrid.astro:33-45` |
| 12 | UI/UX | Explore by Region | Visual region cards with trek counts and background images | `derivedRegions` | Links to `/treks?location={region}&page=1` | Falls back to default regions if empty | `src/pages/treks/index.astro:525-557` |
| 13 | Trust | Trust Statistics | Why Choose Us 4-stat display | Content API / defaults | 4-column metric boxes | Uses default hardcoded metrics if API fails | `src/components/sections/WhyChooseUs.astro` |
| 14 | Social Proof | Google Reviews | Verified reviews carousel island | `/api/v1/google-reviews` API | Interactive carousel with ratings and review link | Hidden gracefully if API unavailable | `src/components/sections/GoogleReviews.tsx` |
| 15 | Conversion | Free Itinerary CTA | Bottom banner prompting for WhatsApp itinerary | Click action | Navigates to `/#lead-form` | N/A | `src/pages/treks/index.astro:611-627` |
| 16 | Deprecated | Featured Treks (REMOVED) | Horizontal trending row of featured treks | `treks/featured` API | `<TrekTrendingRow />` | **Must be completely removed per R2** | `src/pages/treks/index.astro:208-217, 317-328` |

---

## 6. Edge Cases & Observed Behaviors

| # | Feature | Input / Condition | Expected / Observed Behavior |
|---|---------|-------------------|-----------------------------|
| 1 | Pagination | `page < 1` or `page=0` or `page=-5` | `Math.max(1, parseInt(...))` clamps current page to `1`. |
| 2 | Pagination | `page > totalPages` (e.g. `page=999`) | API returns `items: []`, `total: 15`. UI displays empty state with reset button. |
| 3 | Filter combination | No matching treks (e.g. `difficulty=extreme&max_price=5000`) | API returns `items: []`, `total: 0`. `TrekGrid` renders "No treks found" with clear filter CTA. |
| 4 | Search string | Special characters in search query (`location=Kashmir & Ladakh`) | `encodeURIComponent` safely encodes parameter in URL and API fetch. |
| 5 | Price display | Missing or 0 price | Formats safely as `₹0` via `Intl.NumberFormat('en-IN')`. |
| 6 | Rating display | `trek.rating = 0` or `null` | Displays `0.0 (0 reviews)` with hollow stars; does not throw null reference error. |
| 7 | Image URLs | `featured_image` is `null` or missing | Falls back to `/images/treks/placeholder.jpg` or `/images/destinations/uttarakhand.jpg`. |
| 8 | Multiple filters | Active `difficulty` + `season` + `max_price` + `location` | `buildFilterUrl` and `buildPageUrl` correctly combine all active filters while preserving or resetting `page=1`. |
| 9 | Mobile Viewport (< 640px) | Long filter sidebar above results | Sidebar pushes trek grid off-screen on mobile unless redesigned into collapsible sheet / filter toggle button. |
| 10 | Tablet Viewport (768px - 1024px) | 2-column card grid with medium padding | Cards align in 2 columns (`md:grid-cols-2`), search form stacks cleanly. |
| 11 | Backend Failure | Backend API down or unreachable | `try/catch` block logs error; page renders gracefully with empty listings rather than 500 error crash. |

---

## 7. Responsive Breakpoint Matrix & UX Requirements

| Viewport Tier | Breakpoint | Layout Requirements |
|---------------|------------|---------------------|
| **Mobile Small / Standard** | `< 640px` (`sm`) | - Hero heading scaled (`text-3xl`).<br>- Smart search bar inputs stacked vertically with full-width button.<br>- Quick filter chips horizontally scrollable with touch snap (`overflow-x-auto`).<br>- Filter sidebar collapsible or hidden behind a floating/sticky "Filters & Sort" bar to avoid burying trek results.<br>- Trek grid: 1 column (`grid-cols-1`).<br>- Cards: full width with touch-friendly targets (min 44x44px).<br>- Pagination: compact Previous/Next with current page indicator.<br>- Explore by region: 2 columns (`grid-cols-2`). |
| **Tablet** | `640px – 1024px` (`md`, `lg`) | - Search form 2-row or 3-column layout.<br>- Trek grid: 2 columns (`md:grid-cols-2`).<br>- Filters: top filter bar or collapsible sidebar.<br>- Explore by region: 2 to 3 columns. |
| **Desktop / Wide** | `> 1024px` (`lg`, `xl`, `2xl`) | - Hero heading `text-5xl lg:text-6xl`.<br>- Search form single horizontal row with inline submit.<br>- Layout: 2-column split with sticky left sidebar (`w-72`) and 3-column trek grid (`lg:grid-cols-3`).<br>- Pagination: full numeric sequence with ellipsis. |

---

## 8. Strict Boundary Invariants

1. **Backend Immutability**:
   - Zero files inside `backend/` may be edited, added, or deleted.
   - All REST contracts (`/api/v1/treks`, `/api/v1/treks/{slug}`, `/api/v1/google-reviews`, `/api/v1/content/home/why_choose_us`) must be consumed as-is.
2. **Type Safety & Data Model Stability**:
   - `frontend/src/lib/types.ts` `Trek` interface and `frontend/src/lib/constants.ts` `DIFFICULTY_LABELS` must remain compatible with backend models.
3. **Featured Treks Removal (R2)**:
   - Must remove `featuredResponse = await fetch(...)` from `treks/index.astro`.
   - Must remove `<TrekTrendingRow treks={featuredTreks} />` section from `treks/index.astro`.
   - Must remove unused `import TrekTrendingRow` from `treks/index.astro`.
4. **Verification Commands**:
   - `npm run check` in `frontend/` must pass with 0 errors.
   - `npm run build` in `frontend/` must build successfully.
