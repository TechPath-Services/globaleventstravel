# Global Events Travels — Platform Migration Overview
**Prepared for:** Global Events Travels  
**Date:** April 2026  
**Subject:** WordPress → Modern Stack Migration

---

## What Changed & Why It Matters

| # | Area | Before (WordPress – Shared Hosting) | Before Risk | After (Modern Stack – Dedicated VPS) | After Benefit |
|---|------|--------------------------------------|-------------|----------------------------------------|---------------|
| 1 | **Architecture** | Single WordPress install handles everything — website, admin panel, and all data logic in one place | One failure brings down the entire platform (website + admin + data) | Three separate apps: **Frontend** (public site), **Backend** (data/API), **Admin** (dashboard) — each independent | A crash or update in one part does not affect the others |
| 2 | **Hosting** | Shared hosting — your site shares a server with hundreds of other websites | Neighbour sites consuming resources slow your site down; no control over server | Dedicated VPS — the server is exclusively yours | Consistent speed regardless of other websites; full control |
| 3 | **Security** | WordPress core + plugins + themes = large attack surface; database credentials shared across all functions | One vulnerable plugin can expose your entire admin, bookings, and customer data | API-based separation — the public website cannot directly access the database; admin is on a separate subdomain with its own authentication | Even if the public site is compromised, admin and data remain protected |
| 4 | **Authentication** | WordPress username/password login; easily targeted by brute-force bots | Admin login exposed at `/wp-admin` — a well-known URL attacked daily worldwide | Firebase Authentication with secure tokens; admin at a private subdomain (`admin.globaleventstravels.com`) | Industry-grade auth; no publicly guessable login URL |
| 5 | **Performance & Speed** | WordPress generates pages by querying the database on every single visit | Slow page loads, especially under traffic spikes; affects SEO ranking directly | Astro SSR — pages are pre-rendered where possible; only dynamic parts fetch live data | Significantly faster load times; better Core Web Vitals scores → better Google ranking |
| 6 | **SEO & Ranking** | WordPress SEO depends entirely on plugins (Yoast, etc.); plugin conflicts are common; no control over robots/sitemap without extra tools | Plugin updates can silently break sitemap or meta tags; staging and production served identically to Google | Full control: `noindex/nofollow` on staging (Google never indexes test content), `index/follow` on production; auto-generated sitemap with all treks, expeditions, and blog posts | Clean SEO signals to Google; no duplicate content between staging and live site |
| 7 | **Scalability** | Vertical only — to handle more traffic you must upgrade the entire hosting plan | Expensive; hitting plan limits causes downtime during peak seasons | Each layer (frontend, backend, admin) can be scaled independently; backend supports multiple workers | Scale only what's needed; handle trek-season traffic spikes without over-spending |
| 8 | **Deployments & Updates** | Manual FTP uploads or cPanel file manager; no rollback if something breaks | A bad update can take the live site down with no easy way to recover quickly | Automated CI/CD pipeline (GitHub Actions) — push code → automatically builds and deploys; staging tested before production | Zero-downtime deployments; broken code never reaches the live site |
| 9 | **Staging Environment** | Typically none, or a manual copy of the live site | New features tested directly on the live website risking customer-facing errors | Fully separate staging environment (`dev.globaleventstravels.com`) blocked from search engines | Test everything safely before it goes live |
| 10 | **Data & Backups** | Database and files mixed together; backup depends on hosting provider's schedule | Data loss risk if hosting provider fails or plan lapses | API backend with structured database; independent of frontend; can be backed up, migrated, or replaced without touching the website | Data is portable and protected; not locked into a single hosting provider |

---

## Security Highlights

- **Admin panel** is on a completely separate domain — not guessable by bots
- **Firebase Authentication** — no passwords stored in your own database
- **Environment secrets** are never stored in code — managed via GitHub encrypted secrets
- **Staging environment** is blocked from all search engines (`noindex, nofollow` + `Disallow: /` in robots.txt) so test data never appears in Google
- **HTTPS enforced** across all three environments (website, API, admin)

---

## SEO & Ranking Highlights

- Faster page loads → better **Core Web Vitals** → higher Google ranking
- **Sitemap auto-generated** and updated with every new trek, expedition, or blog post
- **Canonical URLs** set correctly on every page — no duplicate content penalties
- Staging content is **completely hidden from Google** — only the live site gets indexed
- **Structured data (JSON-LD)** on every page helps Google understand content (Organisation, WebSite schema)

---

## Scalability Highlights

- During peak trekking season, only the **backend API** needs more resources — frontend stays untouched
- New features (e.g., payment gateway, booking system) can be added to the backend without rebuilding the website
- Admin dashboard can be expanded with new modules independently
- Infrastructure can move to a larger VPS or cloud provider (AWS, GCP) with no code changes

---

## Summary

> **Before:** One WordPress site doing everything on shared hosting — fast to set up, but fragile, slow, and difficult to grow safely.
>
> **After:** Three purpose-built applications on a dedicated server — more secure, significantly faster, fully automated deployments, and built to scale as the business grows.

---

*Document prepared by the development team. Available to discuss any section in further detail.*
