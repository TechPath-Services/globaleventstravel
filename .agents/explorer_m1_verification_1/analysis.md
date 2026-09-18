# Comprehensive Verification Protocol & Quality Assurance Specification

**Project**: Global Events Travels (Astro SSR Frontend)  
**Milestone**: M1 (Treks Page UI/UX Redesign & Optimization)  
**Target URL**: `http://localhost:4321/treks`  
**Explorer**: Verification & Quality Explorer (Explorer M1 Verification 1)  
**Date**: 2026-08-25  

---

## 1. Executive Summary & Verification Objectives

Milestone M1 redesigns and optimizes the Treks catalog page (`frontend/src/pages/treks/index.astro`), removes the "Featured Treks" section, establishes full responsiveness across all viewport tiers, and adheres strictly to backend immutability.

This verification protocol establishes the deterministic testing procedures across three core dimensions:
1. **Automated Quality Gates**: Exact CLI commands, flags, and pass/fail thresholds for static type checking, template validation, and production bundle compilation.
2. **Browser Verification Protocol**: Precise, step-by-step browser inspection procedures across mobile, tablet, and desktop viewports at `http://localhost:4321/treks`.
3. **Role-Specific Test Matrices**: Specialized validation matrices tailored for **Reviewers** (design tokens, code cleanliness, accessibility), **Challengers** (adversarial edge cases, stress conditions, viewport extremes), and the **Forensic Auditor** (requirement traceability, backend immutability, layout compliance).

---

## 2. Automated Verification Architecture

The automated verification suite ensures zero build breaks, type safety, and project-wide quality gate compliance before any code is approved.

### 2.1 Automated Command Matrix

| Stage | Command | Directory | Purpose | Strict Acceptance Threshold |
|---|---|---|---|---|
| **Type & Template Check** | `npm run check` | `frontend/` | Executes `astro check` across all `.astro`, `.ts`, and `.tsx` files | **0 errors, 0 warnings** |
| **Production Build** | `npm run build` | `frontend/` | Executes `astro build` to compile SSR endpoints, client assets, and static pages | **Exit code 0, clean build in `frontend/dist/`** |
| **Frontend Lint** | `make lint-frontend` | Repo root | Runs frontend type and syntax validation | **Exit code 0** |
| **Full Preflight Gate** | `make preflight` | Repo root | Executes `scripts/preflight.sh` covering backend format/lint/test, frontend check, admin lint/build | **"All preflight checks passed!" (Exit code 0)** |

### 2.2 Detailed Command Specifications

#### 1. Type & Template Safety (`npm run check`)
- **Execution**:
  ```bash
  cd /Users/sanjeev/Documents/project/globaleventstravel/frontend
  npm run check
  # In sandboxed or CI environments, prepend ASTRO_TELEMETRY_DISABLED=1 if telemetry writes to user home are restricted:
  # ASTRO_TELEMETRY_DISABLED=1 npm run check
  ```
- **What is validated**:
  - `Trek` interface conformance (`frontend/src/lib/types.ts`) for all props passed to `TrekGrid.astro` and `TrekCard.astro`.
  - Proper handling of optional fields (`short_description`, `rating`, `review_count`, `featured_image`, `best_season`, `max_altitude`, `distance`).
  - Astro template expression syntax and import paths.
  - Complete elimination of unused imports (e.g. `TrekTrendingRow`).
- **Remediation Guide for Common Failures**:
  - *Missing property error on Trek*: Ensure nullish coalescing (`?? 0` or `|| ''`) is used for optional API fields.
  - *Astro Props type mismatch*: Verify `interface Props` in `.astro` components strictly aligns with imported types.
  - *Telemetry write permission in sandbox (`EPERM ... config.json`)*: Run with `ASTRO_TELEMETRY_DISABLED=1`.

#### 2. Production Bundle Compilation (`npm run build`)
- **Execution**:
  ```bash
  cd /Users/sanjeev/Documents/project/globaleventstravel/frontend
  npm run build
  ```
- **What is validated**:
  - SSR route compilation for dynamic pages (`export const prerender = false` in `src/pages/treks/index.astro`).
  - Tailwind CSS utility class purging and bundling into production stylesheet.
  - React client island hydration bundles (`GoogleReviews.tsx`).
  - Asset resolution and static asset copying (`/images/...`).
- **Remediation Guide for Common Failures**:
  - *Dynamic import / React mismatch*: Ensure React 18 island directives (`client:visible` or `client:load`) are correctly specified.
  - *Tailwind class mismatch*: Ensure custom utility classes are defined in `global.css` or Tailwind config.

#### 3. Workspace Quality Gate (`make preflight`)
- **Execution**:
  ```bash
  cd /Users/sanjeev/Documents/project/globaleventstravel
  make preflight
  ```
- **What is validated**:
  - Backend: `black --check app/`, `isort --check-only app/`, `flake8 app/`, `pytest`.
  - Frontend: `astro check`.
  - Admin: `next lint`, `next build`.

---

## 3. Browser Verification Protocol (`http://localhost:4321/treks`)

The browser verification protocol specifies exact user-flows, DOM assertions, and visual checks across all standard screen sizes.

### 3.1 Verification Prerequisites & Setup
1. **Backend Service**: Running on port `8000` with seeded database (`cd backend && poetry run uvicorn app.main:app --port 8000`).
2. **Frontend Service**: Running on port `4321` (`cd frontend && npm run dev`).
3. **Target URL**: `http://localhost:4321/treks`.

---

### 3.2 Test Suite A: Featured Treks Section Removal (Requirement R2)

| # | Inspection Point | Method | Expected Deterministic Outcome |
|---|---|---|---|
| A.1 | **Visual Scan** | Visual inspection of `/treks` | Zero "Featured Treks" or "Trending This Season" carousel/row between the Hero Search Bar and the Main Catalog Section. |
| A.2 | **DOM Inspection** | Element selector query | `document.querySelector('TrekTrendingRow')` and any `.snap-x` horizontal scroll trending container are **NOT present** in the DOM. |
| A.3 | **Network Inspection** | DevTools Network Tab | Zero outbound requests sent to `GET /api/v1/treks/featured?limit=6`. Only standard catalog requests (`GET /api/v1/treks?...`) are triggered. |
| A.4 | **Layout Flow** | Scroll position audit | The Hero Search Bar transitions seamlessly into the Main Filterable Catalog without jarring whitespace or orphan headers. |

---

### 3.3 Test Suite B: Multi-Viewport Responsiveness (Requirement R1)

#### 1. Mobile Viewport (375px × 667px / 390px × 844px / 414px × 896px)

```
+------------------------------------+
|  [Header: Logo & Menu Toggle]      |
+------------------------------------+
|  [Hero: Catchy Title (text-3xl)]   |
|  "Find Your Next Himalayan..."     |
+------------------------------------+
|  [Search Card]                     |
|  [ Location Dropdown             ] |
|  [ Difficulty Dropdown           ] |
|  [ Budget Dropdown               ] |
|  [ [Primary Search Button]       ] |
|  [Popular: Winter | Easy | <10K  ] |
+------------------------------------+
|  [Mobile Filter & Sort Bar]        |
|  [Filters (Active Count)] [Sort v] |
+------------------------------------+
|  [Active Filter Dismissible Chips] |
+------------------------------------+
|  [Trek Grid (1 Column)]            |
|  +--------------------------------+ |
|  | [Trek Card 1 - Full Width]     | |
|  | - 4:3 Image + Badges           | |
|  | - Title, Rating, Spec Row      | |
|  +--------------------------------+ |
|  | [Trek Card 2 - Full Width]     | |
+------------------------------------+
|  [Pagination: < Prev  1/3  Next > ]|
+------------------------------------+
|  [Explore by Region (2 Columns)]   |
+------------------------------------+
|  [Why Choose Us / Reviews / FAQs]  |
+------------------------------------+
|  [WhatsApp CTA Banner]             |
+------------------------------------+
```

- **Detailed Mobile Checkpoints**:
  - **Hero Section**: Heading wraps cleanly without overflowing horizontal viewport bounds; subtitle is legible (`text-base md:text-lg`).
  - **Search Bar**: Inputs stack vertically with `100%` width; touch padding is generous (`py-3`); Search button spans full width.
  - **Mobile Filter Drawer/Sheet**: Filter accordions do NOT push trek cards 500px down on initial load; instead, filters are accessible via a sticky/floating filter toggle or compact drawer.
  - **Active Filter Chips**: Dynamically render when query params are present; touch-dismissable with single tap on '✕'.
  - **Trek Cards Grid**: Renders in strict **1-column layout** (`grid-cols-1`). Cards occupy full container width minus padding.
  - **Card Badge Placement**: Difficulty badge (top-left) and Price badge (top-right) do not overlap or truncate on screens as narrow as 360px.
  - **Specs Row**: Duration, Altitude, Distance display compactly with inline SVG icons.
  - **Touch Targets**: All buttons, links, dropdowns, and pagination controls have minimum touch targets of `44px × 44px`.
  - **Explore by Region**: Displays as a balanced **2-column grid** (`grid-cols-2`).

#### 2. Tablet Viewport (768px × 1024px / 820px × 1180px)
- **Search Bar**: Inputs align in a responsive 2-column or 3-column subgrid (`grid grid-cols-1 sm:grid-cols-3 lg:flex`) without excessive horizontal stretching.
- **Filters & Catalog**: Sidebar is either rendered as a sleek top bar or collapsible side drawer; trek cards display in a clean **2-column grid** (`md:grid-cols-2 gap-6`).
- **Card Proportions**: Cards maintain optimal visual density with high-resolution image rendering and non-clipped text lines.
- **Explore by Region**: Displays in 2-to-3 columns with readable typography and overlay gradients.

#### 3. Desktop Viewport (1280px × 800px / 1440px × 900px / 1920px × 1080px)
- **Hero & Search**: Large cinematic heading (`text-5xl lg:text-6xl`); floating search card with horizontal inline form (`flex flex-row items-end gap-4`).
- **Main Split Layout**:
  - **Sticky Left Sidebar (`w-72`)**: Fixed on scroll (`sticky top-24`), collapsible accordions for Difficulty, Budget, and Season with active highlight states.
  - **Catalog Grid (`xl:grid-cols-3`)**: 3-column grid for standard cards with ample spacing (`gap-6`), avoiding card compression.
- **Interactive Micro-Interactions**:
  - Card hover triggers smooth image scale (`group-hover:scale-105 duration-500`).
  - "View Details" CTA smoothly fades in on card hover (`group-hover:opacity-100 duration-300`).
  - Active filter chips bar displays prominently above grid with "Clear All" link.
- **Explore by Region**: Elegant **4-column grid** (`lg:grid-cols-4 gap-4`).
- **Pagination**: Full sequence with previous/next buttons, numeric page pills, and ellipsis indicators (`1, 2, 3 ... 5`).

---

### 3.4 Test Suite C: Filter, Search, Sort & Navigation Interactivity

| Test ID | Action | Expected URL / State | Expected Visual Output |
|---|---|---|---|
| **C.1** | Select Region "Uttarakhand" in Search Bar & click Search | `/treks?location=Uttarakhand&page=1` | Trek grid updates to show only Uttarakhand treks; active filter pill "Region: Uttarakhand ✕" appears. |
| **C.2** | Click "Easy" in Difficulty filter sidebar | `/treks?difficulty=easy&page=1` | Only easy treks are displayed; "Easy" filter item shows active highlight (`bg-primary-50`). |
| **C.3** | Combine Filters: Difficulty "Moderate" + Budget "Under ₹20K" | `/treks?difficulty=moderate&max_price=20000&page=1` | Treks matching both criteria are shown; count displays `Showing 1-X of Y treks`; both active chips appear. |
| **C.4** | Click '✕' on "Moderate" Active Filter Chip | `/treks?max_price=20000&page=1` | "Moderate" filter is removed; Budget "Under ₹20K" remains active; list updates automatically. |
| **C.5** | Click "Reset" or "Clear All" | `/treks` | All filters cleared; full trek list restored; pagination resets to page 1. |
| **C.6** | Change Sort Dropdown to "Price (Low to High)" | `/treks?sort=price_asc` | Treks sorted in ascending order of price; lowest price trek renders first. |
| **C.7** | Click Page 2 in Pagination | `/treks?page=2` (preserving any active filters) | Items 10–18 rendered; page 2 highlighted as active in pagination bar. |
| **C.8** | Click Region Card "Himachal Pradesh" | `/treks?location=Himachal&page=1` | Navigates to filtered catalog for Himachal; resets page to 1. |
| **C.9** | Zero Results Query (e.g. `difficulty=extreme&max_price=5000`) | `/treks?difficulty=extreme&max_price=5000&page=1` | Clean empty state with search icon, "No treks found" title, explanatory text, and "Clear Filters" CTA button. |
| **C.10** | Click Trek Card Title / Image | `/treks/[slug]` | Clean browser navigation to individual trek details page. |

---

### 3.5 Test Suite D: Trek Card Data Integrity & Visual Polish

| Attribute | Source Field | Expected Rendering Rule |
|---|---|---|
| **Image** | `trek.featured_image` | Aspect ratio `4:3`, lazy loaded, fallback to `/images/treks/placeholder.jpg` if null. |
| **Difficulty** | `trek.difficulty` | Colored pill matching `DIFFICULTY_LABELS` (Green for Easy, Amber for Moderate, Orange for Difficult, Red for Challenging/Extreme). |
| **Price** | `trek.price` | Formatted in Indian Rupees: `₹XX,XXX` + "per person" subtext. |
| **Rating** | `trek.rating`, `review_count` | 5-star visual representation with numeric score `4.X (XX reviews)`. |
| **Duration** | `trek.duration` | Computed format: `${duration - 1}N/${duration}D` (e.g. `5N/6D`). |
| **Altitude** | `trek.max_altitude` | Number formatted with unit: `X,XXXm` (e.g. `3,800m`). |
| **Distance** | `trek.distance` | Number formatted with unit: `XX km` (e.g. `20 km`). |
| **Description** | `trek.short_description` | Clamped to maximum 2 lines (`line-clamp-2`). |
| **Season Tags** | `trek.best_season` | First 3 tags rendered as compact pills (e.g. `Dec`, `Jan`, `Feb`). |

---

## 4. Multi-Role Test Matrices

### 4.1 Reviewer Test Matrix (Code Quality, Aesthetics, Accessibility)

The Reviewer verifies design fidelity, clean code patterns, and accessibility.

| Area | Inspection Target | Acceptance Standard | Pass/Fail |
|---|---|---|---|
| **Design System** | Brand Colors | Primary `#F39C12` (Orange) for CTAs & active chips; Secondary `#1F3C88` (Blue) for headings; Neutral `#F4F6F7` surfaces. | [ ] |
| **Design System** | Spacing & Hierarchy | Consistent padding (`container-custom`, `.section`), crisp typography scale (`h1` 4xl-6xl, `h2` 3xl-4xl, card title xl). | [ ] |
| **Accessibility** | Color Contrast | Contrast ratio >= 4.5:1 for normal text and >= 3:1 for large headings (WCAG 2.1 AA). | [ ] |
| **Accessibility** | Semantic Markup | Semantic `<main>`, `<section>`, `<aside>`, `<article>`, `<nav aria-label="Pagination">`. | [ ] |
| **Accessibility** | Keyboard Navigation | Focus indicators on all links, selects, and filter buttons. | [ ] |
| **Code Polish** | Clean Imports | No orphaned imports (e.g. `TrekTrendingRow` removed). | [ ] |
| **Code Polish** | Separation of Concerns | Layout logic cleanly divided between `index.astro`, `TrekGrid.astro`, and `TrekCard.astro`. | [ ] |

---

### 4.2 Challenger Test Matrix (Edge Cases, Stress & Adversarial Conditions)

The Challenger actively attempts to break the implementation with stress tests and edge cases.

| Test Case | Scenario / Input | Invalidation Condition (What would cause failure) | Pass/Fail |
|---|---|---|---|
| **Viewport Extreme 1** | Ultra-narrow screen (320px width, e.g. Galaxy Fold) | Horizontal scrollbars appear; price and difficulty badges collide or clip; text overflows viewport. | [ ] |
| **Viewport Extreme 2** | Ultra-wide screen (2560px width / 4K monitor) | Layout stretches uncontrollably beyond `max-w-7xl`; content misaligns or card images become pixelated. | [ ] |
| **URL Tampering 1** | `page=0` or `page=-5` | Backend crashes or 500 internal server error. Expected: Clamped to `page=1`. | [ ] |
| **URL Tampering 2** | `page=99999` | Page crashes or blank screen without message. Expected: Friendly empty state with reset button. | [ ] |
| **URL Tampering 3** | Invalid difficulty: `difficulty=superhard123` | Server crashes or template throws unhandled exception. Expected: Silently ignored or treated as 'all'. | [ ] |
| **URL Tampering 4** | Invalid price: `max_price=-500` or `max_price=abc` | Unhandled parsing exception. Expected: Handled gracefully without crash. | [ ] |
| **Data Defect 1** | Trek record with missing/null `featured_image` | Broken image icon. Expected: Renders `/images/treks/placeholder.jpg` fallback cleanly. | [ ] |
| **Data Defect 2** | Trek record with `rating: 0` or `rating: null` | `NaN` rating display. Expected: Renders `0.0 (0 reviews)` with empty stars. | [ ] |
| **Data Defect 3** | Trek record with empty `best_season: []` | Template iteration error on `null`. Expected: Clean omission of season pills. | [ ] |
| **Rapid Filter Clicking** | Rapid consecutive clicks on multiple filter pills | Race condition or broken URL parameters. Expected: Deterministic URL state and clean page load. | [ ] |
| **Backend Latency** | Simulated 2-second backend delay | Broken layout during fetch. Expected: SSR renders complete markup with data upon resolution. | [ ] |

---

### 4.3 Forensic Auditor Test Matrix (Contract & Requirement Traceability)

The Forensic Auditor verifies immutable constraints and exact compliance with specifications.

| Requirement | Audit Objective | Verification Command / Evidence | Pass/Fail |
|---|---|---|---|
| **R1 (UI/UX Redesign)** | Verify Treks page is fully responsive across mobile, tablet, and desktop viewports. | Browser inspection at 375px, 768px, and 1440px. | [ ] |
| **R2 (Remove Featured Treks)** | Verify complete removal of Featured Treks section, API call, and markup. | `grep_search` in `src/pages/treks/index.astro` for `featuredTreks` and `TrekTrendingRow` returns 0 results. | [ ] |
| **R3 (Backend Immutability)** | Verify ZERO modifications to backend APIs, schemas, or models. | `git status backend/` and `git diff backend/` are completely empty. | [ ] |
| **Acceptance Criteria 1** | `npm run check` in `frontend/` passes with 0 new TypeScript errors. | Run `npm run check` in `frontend/` -> Exit code 0. | [ ] |
| **Acceptance Criteria 2** | `npm run build` in `frontend/` builds production bundle with 0 errors. | Run `npm run build` in `frontend/` -> Exit code 0. | [ ] |
| **Monorepo Rule** | Workspace preflight quality gate passes across all sub-projects. | Run `make preflight` -> Exit code 0. | [ ] |
| **Layout Compliance** | `.agents/` contains ONLY agent metadata; no source code or assets. | Check `.agents/` directory contents. | [ ] |

---

## 5. Sequential Execution Checklist for Implementers & Verifiers

```markdown
### Verification Execution Checklist

- [ ] Step 1: Execute static typecheck
      cd frontend && npm run check
      Verify: 0 errors, 0 warnings.

- [ ] Step 2: Execute production build
      cd frontend && npm run build
      Verify: Build completes successfully; dist/ generated.

- [ ] Step 3: Run full monorepo preflight gate
      make preflight
      Verify: All backend, frontend, and admin checks report PASS (✓).

- [ ] Step 4: Verify Featured Treks removal
      Open http://localhost:4321/treks in browser.
      Verify: No "Trending This Season" / "Featured Treks" section exists.
      Verify: No network call to /api/v1/treks/featured.

- [ ] Step 5: Verify Mobile Viewport (375px)
      Set DevTools device emulation to iPhone SE / iPhone 14.
      Verify: Search card stacks vertically; 1-column trek grid; no horizontal overflow; touch targets >= 44px.

- [ ] Step 6: Verify Tablet Viewport (768px)
      Set DevTools device emulation to iPad Mini.
      Verify: Search inputs align in multi-column subgrid; 2-column trek grid; balanced card padding.

- [ ] Step 7: Verify Desktop Viewport (1440px)
      Set DevTools device emulation to Desktop.
      Verify: Sticky left sidebar; 3-column trek grid; hover micro-interactions; full pagination sequence.

- [ ] Step 8: Verify Filter & Sort Interactivity
      Test Region, Difficulty, Budget, and Season filters.
      Test Active Filter Chips dismissal and Clear All action.
      Test Sort dropdown (price_asc, rating, newest).
      Test Pagination across multiple pages with active filters.

- [ ] Step 9: Verify Trek Card Details & Navigation
      Verify price formatting in INR (₹XX,XXX), difficulty badges, rating stars, duration, altitude, distance.
      Click card -> verifies navigation to /treks/[slug].

- [ ] Step 10: Verify Challenger Edge Cases
      Test page=9999 (empty state), invalid query params, missing images placeholder.

- [ ] Step 11: Verify Forensic Invariants
      git diff backend/ -> Must be empty (0 changes).
```

---

## 6. Conclusion & Sign-Off Readiness

This verification protocol establishes an ironclad, deterministic testing framework for Milestone M1. Following this protocol guarantees that all requirements in `ORIGINAL_REQUEST.md` (R1, R2, R3) and `PROJECT.md` are rigorously validated and verified before milestone completion.
