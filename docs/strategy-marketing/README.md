# Marketing Strategy: Linkable Assets & Local SEO (Winter 2026–27)

Owner: Marketing + Engineering
Status: Decisions made · tools built (code complete, tested) · ops data entry pending
Last updated: 2026-10-24

> **Operating the tools:** see [06-admin-runbook.md](./06-admin-runbook.md) for the step-by-step
> admin checklist (what ops must fill in before each tool goes live).

## 1. Goal

Earn backlinks, organic traffic, and WhatsApp leads ahead of the Dec–Mar winter trek season using
three initiatives that compound on each other:

| # | Initiative | Primary outcome | Doc |
|---|------------|-----------------|-----|
| 1 | "Which winter trek suits me?" quiz | Shares + links from blogs, forums, college clubs | [01-winter-trek-quiz.md](./01-winter-trek-quiz.md) |
| 2 | Trek budget calculator | Evergreen links from budget-travel content; high-intent leads | [02-trek-budget-calculator.md](./02-trek-budget-calculator.md) |
| 3 | Student discount page | Reddit / WhatsApp virality; `.ac.in` links from colleges | [03-student-discount.md](./03-student-discount.md) |
| 4 | "Treks from [city]" pages | Local search traffic (Delhi, Chandigarh, Lucknow, Dehradun) | [04-treks-from-city-pages.md](./04-treks-from-city-pages.md) |

Engineering (as built): [05-technical-implementation.md](./05-technical-implementation.md) ·
Ops checklist: [06-admin-runbook.md](./06-admin-runbook.md)

## 2. Why these four work together

They are not independent campaigns. They share data and send traffic to each other:

```
                 ┌──────────────────────────┐
                 │  City route dataset       │  (real bus/train times + fares,
                 │  frontend/src/data/cities │   verified, dated)
                 └────────────┬─────────────┘
                              │ feeds
          ┌───────────────────┼────────────────────┐
          ▼                   ▼                    ▼
  Treks-from-[city]    Budget calculator     Quiz ("Where are you
  pages                (travel cost step)    starting from?" question)
          │                   │                    │
          └─────────┬─────────┴─────────┬──────────┘
                    ▼                   ▼
          Student discount page    Trek detail page  ──►  WhatsApp lead
          ("save 10% more")        (/treks/[slug])        (Lead.source tagged)
```

- The **city dataset** is built once and reused by three surfaces. That makes the research effort
  (the expensive part) pay off three times.
- The **calculator** ends with "how to cut this cost", which links to the **student discount**.
- The **quiz** result links to the trek page, the matching **city page**, and a prefilled
  **calculator**.
- Every lead carries a distinct `source` so we can attribute bookings to each asset.

## 3. Strategic principles

1. **Usefulness first, promotion second.** Linkable assets earn links only if they are genuinely
   useful without booking with us. No email/WhatsApp gate before the quiz result or calculator total.
   The lead ask comes *after* value is delivered ("Send me this plan on WhatsApp").
2. **Real data or no page.** City pages with copy-pasted or invented bus times are doorway pages in
   Google's eyes and damage the whole domain. Each city page ships only when its data sheet is
   complete and verified (enforced at build time, see doc 05).
3. **Timing beats polish.** Winter trek searches climb from October and peak Nov–Dec. Links take
   4–8 weeks to accrue. A good quiz shipped by mid-November beats a perfect one in January.
4. **Protect margin.** The student discount is capped at ₹1,500 per student. It applies on all
   dates (decision below), so watch batch fill rates and tune the % / cap in admin if needed.
5. **Measure.** The frontend has **no analytics installed yet** (decision: set up later). The tools
   already fire events (`quiz_complete`, `calculator_complete`, `lead_submit`, …) that start flowing
   as soon as a GA4 or Plausible script is pasted into Admin → Settings → Website Widget. Until
   then, measure through lead `source` in Admin → Leads.

## 4. Phased plan

Today is 2026-10-24. Winter season opens in December.

### Phase 0 — Foundation (Oct 26 – Nov 1)
- [x] Decide open questions (section 6).
- [x] Build quiz, calculator (+ embed), student discount page, city pages, admin screens.
- [x] Lead `source` values wired into every form (see doc 05) + source filter in Admin → Leads.
- [ ] Deploy backend, admin and frontend (backend adds new tables/columns automatically on start).
- [ ] Ops: fill trek pickup cities + quiz tags, calculator rates, and review/publish the 10 seeded
      winter treks (runbook, doc 06).
- [ ] Ops: collect verified routes for **Dehradun** and **Delhi**.
- [ ] Verify Google Search Console for `globaleventstravels.com` (free; independent of analytics).
- [ ] Later: paste GA4 / Plausible script into Admin → Settings → Website Widget.

### Phase 1 — Ship the fast wins (Nov 2 – Nov 15)
- [ ] Student discount live (already on by default: 10%, cap ₹1,500, all dates).
- [ ] Winter trek quiz live (auto-includes every published trek with Dec–Mar in its season).
- [ ] Publish `/treks-from/dehradun/` and `/treks-from/delhi/` (admin blocks publishing until the
      quality checks pass).
- [ ] Seed outreach list (section 5).

### Phase 2 — Calculator + remaining cities (Nov 16 – Nov 29)
- [ ] Calculator rates filled in admin; calculator promoted.
- [ ] Publish `/treks-from/chandigarh/` and `/treks-from/lucknow/` with group departures.
- [ ] Offer the embed snippet (on the calculator page) to bloggers.

### Phase 3 — Distribution push (Dec 1 – Jan 15)
- [ ] College club outreach before winter break (mid-Dec).
- [ ] Reddit / WhatsApp seeding (rules in doc 03).
- [ ] Blogger / journalist outreach with quiz + calculator ("data story": average real cost of a
      winter trek from 4 cities).

### Phase 4 — Review & extend (Feb 2027)
- [ ] Review KPIs, refresh city data (90-day rule).
- [ ] Reuse quiz engine for "Which summer trek suits me?" (Hampta, Sar Pass, Valley of Flowers,
      Roopkund) before the April–June season.

## 5. Distribution channels (summary)

| Channel | Asset to push | Approach |
|---------|---------------|----------|
| College adventure / mountaineering clubs | Student discount, quiz | Direct email + campus ambassador; ask to list on club "resources" page |
| Reddit (city + travel subs) | Calculator, city pages | Answer real questions with the tool link; never drop-and-run ads |
| WhatsApp trekking groups | Quiz result cards, student offer | Share card image + short link; ambassadors seed |
| Travel bloggers / YouTubers | Calculator embed, cost data story | Offer embed + exclusive data; ask for citation link |
| Instagram (@global_events_travels) | Quiz | Reel: "Answer 6 questions, we'll pick your winter trek" |
| Google Business Profile | City pages (Dehradun office) | Post updates linking to `/treks-from/dehradun/` |

## 6. Decisions (signed off 2026-10-24)

| # | Question | Decision | Where it lives |
|---|----------|----------|----------------|
| 1 | Student discount size | **10%, capped at ₹1,500 per student** | Admin → Growth Tools → Tool Settings |
| 2 | Blackout batches | **None — valid on all dates** | Same; FAQ copy updated |
| 3 | Winter trek list | **All treks we run in Himachal + Uttarakhand.** Quiz pulls every published trek whose best season overlaps Dec–Mar; no hard-coded list | Trek table + Trek → Marketing tab |
| 4 | City group departures | **Yes, we run them** (Delhi, Chandigarh) | Added as a route of type "Our group departure" on each city; shown as the headline block |
| 5 | Analytics | **Later** | Events already fire; paste script into Website Widget when ready |

Seeded (as **drafts**, prices to review): Kuari Pass, Dayara Bugyal, Chopta Chandrashila, Nag Tibba,
Har Ki Dun, Dodital (Uttarakhand); Triund, Prashar Lake, Kheerganga, Kareri Lake (Himachal). List
from public 2026-27 winter trek guides; existing Kedarkantha and Brahmatal got pickup city, quiz tags
and persona filled in (only where empty).

## 7. KPIs (first 90 days)

| Metric | Target (initial, revisit after 30 days) | Source |
|--------|------------------------------------------|--------|
| Referring domains to `/tools/*` and `/student-discount/` | 25+ | Search Console / Ahrefs free |
| Quiz completions | 3,000 | Analytics event `quiz_complete` |
| Calculator completions | 1,500 | Analytics event `calculator_complete` |
| Leads tagged quiz / calculator / student / city | 300 combined | `Lead.source` in admin |
| Student claims verified | 100 | Ops sheet / admin |
| City pages: impressions in Search Console | 20k combined | Search Console |
| Booking conversion from tagged leads | ≥ site average | Admin leads → status `converted` |

Targets are starting assumptions with no historical baseline yet; recalibrate after Phase 1.

## 8. Risks

| Risk | Mitigation |
|------|------------|
| City pages flagged as doorway/spam | Backend publish gate (real routes, tips, FAQs, intro, verified date) — admin cannot publish a thin page; `last_verified` shown publicly |
| Student discount abuse (fake IDs, resale) | Verify ID + college email, one claim per student per season, non-transferable |
| Reddit backlash for self-promotion | Only post in threads asking the question; disclose affiliation; follow each sub's rules |
| Stale fares/timings after publish | 90-day rule: stale pages show a "being re-checked" banner and cannot be edited without re-verifying; admin list flags them |
| Margin erosion (no blackout dates) | ₹1,500 cap; watch fill rate on Dec 20 – Jan 5 batches and lower % / cap in admin if those sell out anyway |
| No analytics → can't prove ROI | Lead `source` attribution works today; add analytics script when ready |
