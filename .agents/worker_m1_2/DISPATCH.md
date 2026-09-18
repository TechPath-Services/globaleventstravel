# Dispatch: Worker M1 2 (Replacement Worker)

## Identity & Assignment
- Role: Frontend Implementation Worker
- Working directory: /Users/sanjeev/Documents/project/globaleventstravel/.agents/worker_m1_2
- Target Report: /Users/sanjeev/Documents/project/globaleventstravel/.agents/worker_m1_2/changes.md
- Handoff Report: /Users/sanjeev/Documents/project/globaleventstravel/.agents/worker_m1_2/handoff.md
- Parent: Orchestrator (/Users/sanjeev/Documents/project/globaleventstravel/.agents/orchestrator_1)

## Exclusive Write Ownership
You have exclusive write ownership over:
- `frontend/src/pages/treks/index.astro`
- `frontend/src/components/trek/TrekGrid.astro`
- `frontend/src/components/trek/TrekCard.astro`
DO NOT modify any backend files or data structures in `backend/`.

## Reference Blueprints & Context Files
- `/Users/sanjeev/Documents/project/globaleventstravel/.agents/ORIGINAL_REQUEST.md` (MANDATORY TO READ FIRST)
- `/Users/sanjeev/Documents/project/globaleventstravel/PROJECT.md`
- `/Users/sanjeev/Documents/project/globaleventstravel/.agents/explorer_m1_strategy_1/analysis.md` (Page architecture & layout blueprint)
- `/Users/sanjeev/Documents/project/globaleventstravel/.agents/explorer_m1_components_1/analysis.md` (TrekGrid & TrekCard blueprints)
- `/Users/sanjeev/Documents/project/globaleventstravel/.agents/explorer_m1_verification_1/analysis.md` (Verification protocol)

## Implementation Tasks
1. **Remove Featured Treks (R2)**:
   - In `frontend/src/pages/treks/index.astro`, remove the `TrekTrendingRow` import (line 4), remove the `featuredTreks` fetch call to `/api/v1/treks/featured` (lines 208-217), and remove the Featured Treks section markup (lines 317-328).
2. **Redesign Layout & Responsive Filters (R1)**:
   - Update `frontend/src/pages/treks/index.astro`:
     - Clean, modern Hero section.
     - Responsive Search & Filter bar (keyword search with name `search`, location, difficulty, budget).
     - Mobile filter toggle button + accessible sliding drawer / modal for mobile (<640px) and tablet (<1024px) screens.
     - Sticky filter sidebar for desktop (`hidden lg:block lg:w-72`).
     - Active filter chips bar with dismiss URLs and "Clear All" action.
3. **Refine TrekGrid & TrekCard (R1)**:
   - In `frontend/src/components/trek/TrekGrid.astro`:
     - Update grid layout classes to `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`.
     - Modern empty state card with "Clear All Filters" and "Ask an Expert" buttons.
   - In `frontend/src/components/trek/TrekCard.astro`:
     - Beautiful badges (difficulty color coding with pulsating dot, Best Seller tag).
     - Formatted INR price (`₹X,XXX`).
     - 3-column micro-grid specs (Duration, Altitude, Distance).
     - Hover elevation, smooth transitions, and responsive touch targets (>=44px).
4. **Preserve Backend API Integrity (R3)**:
   - Ensure all query parameters and API endpoints match existing backend contracts exactly.
5. **Run Builds & Type Checks**:
   - In `frontend/`: run `ASTRO_TELEMETRY_DISABLED=1 npx astro check` or `npm run check`.
   - In `frontend/`: run `npm run build`.
   - Verify both succeed with exit code 0.
6. **Browser Verification**:
   - Start frontend dev server if needed, test `http://localhost:4321/treks` across viewports (mobile 375px, tablet 768px, desktop 1280px).

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
