# 04 — "Treks from [City]" Pages

Status: **Built** — waiting on ops route data. City pages are managed in Admin → Growth Tools →
Departure Cities (not YAML files as first proposed). The quality rules in section 3 are enforced by
the backend: a page cannot be published until they pass. Group departures (we run them from Delhi
and Chandigarh) are entered as routes of type "Our group departure". The YAML sheet in section 4
is still a useful checklist for whoever collects the data.
URLs: `/treks-from/dehradun/`, `/treks-from/delhi/`, `/treks-from/chandigarh/`, `/treks-from/lucknow/`
Lead source tag: `city_[city]` (e.g. `city_delhi`)

## 1. Why, and the one rule that matters

People search "treks near Delhi", "winter trek from Chandigarh", "how to reach Kedarkantha from
Lucknow". A page that answers the *journey* question well can rank locally and convert well,
because the biggest friction for a first-timer is logistics, not the trek itself.

**The rule:** these pages are safe only if each one contains real, verified, city-specific
journey data. Pages that swap the city name into the same template are *doorway pages* under
Google's spam policies, and can hurt rankings for the whole site, not just those pages.

So the process is: **data first, page second.** A city page does not ship until its data sheet
passes validation (enforced in the build, see doc 05).

## 2. Launch order

| Order | City | Why this order | Primary treks |
|-------|------|----------------|---------------|
| 1 | Dehradun | We have an office there; Kedarkantha pickup is in Dehradun at 6 AM; ops already knows every detail | Kedarkantha (+ Brahmatal via Rishikesh, ~1 hr away) |
| 2 | Delhi | Largest search volume and largest source city | Kedarkantha (via Dehradun), Brahmatal (via Rishikesh), Himachal summer treks (via Manali / Kasol) |
| 3 | Chandigarh | Gateway to Himachal; also reaches Dehradun | Hampta / Sar Pass (summer) via Manali / Kasol; Kedarkantha via Dehradun |
| 4 | Lucknow | Large student population; train links into Uttarakhand | Kedarkantha (Dehradun), Brahmatal (Rishikesh), Roopkund (Kathgodam, summer) |

Pickup points are taken from current itineraries in the catalog: Kedarkantha → Dehradun 6 AM,
Brahmatal → Rishikesh 5 AM, Roopkund → Kathgodam, Hampta Pass → Manali, Sar Pass → Kasol.

## 3. What makes each page unique (minimum bar)

Every page must have **all** of these, with city-specific content:

1. **Route table** — at least 2 real options per primary trek (e.g. overnight Volvo, ordinary bus,
   train), each with: operator, departure point (actual terminal name), departure time window,
   journey time, fare range, how it connects to our pickup time, source, `last_verified` date.
2. **"Will I make the pickup?" timing** — which departure gets you to the pickup with a safe margin;
   whether you need a night in the base city.
3. **All-in cost from this city** — prefilled link to the budget calculator + a summary line.
4. **Leave planner** — leave days needed if you leave on a Friday night (city-specific because
   journey times differ).
5. **Local tips** written by someone who knows the route (e.g. winter fog delays out of Delhi,
   which ISBT gate, where to wait before a 6 AM pickup in Dehradun).
6. **City-specific FAQ** — at least 4 questions genuinely asked by trekkers from that city
   (pull from WhatsApp lead conversations).
7. **Real photo(s)** — pickup point, bus stand, or group from that city (with permission).

Target: ≥ 60% of the body text is unique to that city. If we can't hit that for a city, we don't
publish it.

## 4. Data collection sheet (one per city)

Owner: ops (they already handle pickups). Review: marketing. Refresh: every 90 days or after any
operator change.

**Allowed sources:** operator websites / counters (UTC — Uttarakhand Transport, HRTC — Himachal,
UPSRTC — UP, Delhi ISBT), IRCTC for trains, aggregator listings (e.g. redBus) cross-checked with
operator, and our own trekkers' recent journeys. Record the source URL or "called operator on
[date]".

```yaml
city: delhi
last_verified: 2026-11-05        # build fails if older than 90 days
verified_by: "<name>"
routes:
  - trek: kedarkantha
    base: dehradun
    pickup: "Dehradun, 6:00 AM"   # from trek itinerary
    options:
      - mode: volvo_bus
        operator: "[VERIFY]"
        from: "[VERIFY e.g. ISBT Kashmere Gate]"
        departs: "[VERIFY time window]"
        duration_hours: "[VERIFY]"
        fare_inr: { min: null, max: null }     # [VERIFY]
        arrives_before_pickup: null           # true/false after checking
        source: "[URL or 'called operator on <date>']"
      - mode: train
        train: "[VERIFY name + number]"
        from: "[VERIFY station]"
        departs: "[VERIFY]"
        duration_hours: "[VERIFY]"
        fare_inr: { sleeper: null, ac3: null } # [VERIFY]
        source: "[IRCTC]"
    night_in_base_recommended: null           # [VERIFY]
    leave_days_if_friday_night_departure: null
local_tips:
  - "[written by ops — real, specific]"
faqs:
  - q: "[real question from a Delhi lead]"
    a: "[answer]"
photos:
  - "[path to real photo + permission noted]"
```

## 5. Page template (structure, not copy)

```
H1: Treks from Delhi — how to reach Kedarkantha, Brahmatal & more (Winter 2026–27)

[Quick answer box]
  "Easiest winter trek from Delhi: Kedarkantha. Take the [operator] overnight bus from
   [terminal] at [time] (~[X] hrs, ₹[min]–[max]) to reach Dehradun before our 6 AM pickup."
  Last verified: [date] · [Plan my cost →] [Get route on WhatsApp →]

[Section] Best treks from Delhi this season
  Cards (from API): trek, days, difficulty, next batch, seats left, price

[Section] How to get there — one block per trek
  Route table (options from data sheet)
  "Will I make the pickup?" note
  Night-before stay suggestion if needed

[Section] Total cost from Delhi
  Summary table (package + travel + stay + gear estimate) → calculator link prefilled

[Section] How much leave do you need?
  Friday-night departure → back on [day]; leave days needed per trek

[Section] Tips from our Delhi trekkers
  Local tips from data sheet

[Section] Students from Delhi colleges
  One line + link to /student-discount/

[Section] FAQ (city-specific)

[Footer note] "Bus and train times change. We re-check this page every 90 days.
               Last verified [date] by [name]. Spotted an error? Tell us on WhatsApp."
```

## 6. City drafts

Below is everything we *know today* from our own itineraries and offices, plus what must be
researched. **No bus/train time or fare is filled in yet — those come only from the data sheet.**

### 6.1 Dehradun (launch first)

- **Our advantage:** Dehradun office (Ganesh Vihar, Mata Mandir Road) and the Kedarkantha pickup
  is here. This page should read like advice from a local team.
- **Known facts (internal):** Kedarkantha pickup 6:00 AM in Dehradun; drive to Sankri via Mussoorie
  and the Yamuna valley, 8–9 hours. Brahmatal pickup is from Rishikesh at 5:00 AM.
- **To verify:** exact pickup landmark; Dehradun → Rishikesh local options for Brahmatal
  (bus/shared cab, time, fare); recommended stays near pickup in three price tiers; what time
  arrivals from Delhi/Chandigarh/Lucknow typically land at Dehradun ISBT and railway station.
- **Unique content ideas:** "Arriving the night before? Where to wait/stay near the pickup point",
  map of pickup point, office visit hours for gear checks, local rental shops.
- **Lead hook:** "Drop by our Dehradun office for a free gear check before your trek."

### 6.2 Delhi

- **Known facts (internal):** Delhi trekkers reach Kedarkantha via Dehradun (6 AM pickup),
  Brahmatal via Rishikesh (5 AM pickup); summer Himachal treks via Manali (Hampta) and Kasol
  (Sar Pass).
- **To verify:** overnight bus options Delhi → Dehradun and Delhi → Rishikesh (operator, terminal,
  departure window, fare range, arrival time vs pickup); overnight trains to Dehradun / Haridwar;
  Delhi → Manali and Delhi → Bhuntar/Kasol Volvo options for the summer section.
- **Unique content ideas:** winter fog delays and why the earlier departure is safer; which ISBT /
  station to use; the "Friday night to Wednesday" leave plan; NCR (Gurgaon / Noida) notes.
- **Decision:** if we run (or start) a shared group departure from Delhi, it becomes the headline.

### 6.3 Chandigarh

- **Known facts (internal):** natural gateway to Manali (Hampta Pass) and Kasol (Sar Pass, our
  Kasol office); also connects to Dehradun for Kedarkantha.
- **To verify:** Chandigarh (ISBT Sector 43 / 17 — confirm which) → Dehradun, → Manali,
  → Bhuntar/Kasol options and fares; Chandigarh → Rishikesh.
- **Unique content ideas:** "Two directions from Chandigarh" — Himachal (summer) vs Uttarakhand
  (winter) decision guide; Punjab / Haryana / Mohali notes; Kasol office as a meeting point.
- **Winter caveat:** our current Himachal treks are summer treks, so the winter section focuses on
  Kedarkantha / Brahmatal via Uttarakhand. State that clearly — honesty helps rankings and trust.

### 6.4 Lucknow

- **Known facts (internal):** Kedarkantha via Dehradun, Brahmatal via Rishikesh, Roopkund (summer)
  via Kathgodam.
- **To verify:** overnight trains Lucknow → Dehradun, → Haridwar (for Rishikesh), → Kathgodam
  (names, numbers, timings, classes, fares); UPSRTC / private bus options; whether arrival times
  make the pickup or require a night in Dehradun / Rishikesh.
- **Unique content ideas:** train-first planning (booking windows, Tatkal tips), student angle
  (large university population), "one extra night in Rishikesh" plan.

## 7. SEO details

- **Title tag pattern (vary wording per city, don't template it blindly):**
  - Dehradun: "Treks from Dehradun: Kedarkantha Pickup, Routes & Local Tips (2026–27)"
  - Delhi: "Winter Treks from Delhi — Bus & Train Routes, Real Costs, Leave Planner"
  - Chandigarh: "Treks from Chandigarh: Himachal & Uttarakhand Routes, Fares, Timings"
  - Lucknow: "Treks from Lucknow: Trains to Dehradun, Rishikesh & Kathgodam Explained"
- **Structured data:** `BreadcrumbList`, `FAQPage`; `TouristTrip` for each trek card.
  Dehradun page also references the `LocalBusiness` for the Dehradun office.
- **Internal links:** each trek page gets a "Getting there from your city" block linking the city
  pages; quiz Q6 and the calculator link into them.
- **Sitemap:** pages must be added explicitly (see doc 05 — the site uses `output: 'server'`).
- **Don't** create pages for cities we can't serve with real data (no "Treks from Mumbai" with
  generic text). Add cities only when the data sheet exists.

## 8. Ongoing freshness

- 90-day re-verification (enforced by build).
- Add one question to the post-trek feedback message: "How did you travel to the pickup, and what
  did it cost?" — this crowdsources current data and gives us real quotes for the tips section.
- Show "Last verified on [date]" on the page; it's a trust signal for users and for Google.

## 9. Success metrics

- Search Console impressions and clicks per city page; queries containing the city name
- Leads with `source = city_[city]`
- Clicks from city page → trek page and → calculator
