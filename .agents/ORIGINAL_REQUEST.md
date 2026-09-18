# Original User Request

## 2026-08-25T13:06:54Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: full team

Redesign and optimize the UI/UX of the Treks page on the Astro frontend. Remove the "Featured Treks" section and ensure the entire page is fully responsive across all device sizes.

Working directory: /Users/sanjeev/Documents/project/globaleventstravel/frontend
Integrity mode: development

## Requirements

### R1. UI/UX Redesign and Responsiveness
Redesign the Treks page to improve the user experience and visual appeal. The new design must be fully responsive, functioning correctly on mobile, tablet, and desktop screens. 

### R2. Remove Featured Treks
The "Featured Treks" section must be completely removed from the page.

### R3. Backend API Integrity
You must not modify any backend APIs, data structures, or the data fetching logic. The frontend must continue to consume the existing API endpoints exactly as they are.

## Acceptance Criteria

### Build and Type Safety
- [ ] Running `npm run check` passes without any new TypeScript errors.
- [ ] Running `npm run build` successfully builds the Astro project without errors.

### Design Verification (Browser Testing)
- [ ] The agent must use browser tools to open the local frontend (`http://localhost:4321/treks`) and visually inspect the page.
- [ ] The agent verifies through the browser that the "Featured Treks" section is completely removed.
- [ ] The agent verifies through the browser that the UI is fully responsive and looks good on different viewports.
- [ ] The agent verifies that the page continues to display the trek data correctly.
