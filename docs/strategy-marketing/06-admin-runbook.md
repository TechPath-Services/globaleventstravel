# 06 — Admin Runbook (Ops)

Everything below is done in the admin panel. No code changes are needed to run, tune or extend
these tools.

## 0. After the first deploy (once)

1. Deploy backend first. On start it creates the new tables and trek columns automatically.
2. Optional: run `poetry run seed` on the server **only if** you want the 10 draft winter treks and
   the 4 draft city shells. Seed is insert-only: it never overwrites existing treks or settings.
   (Alembic users: `alembic upgrade head` also works; the new migration merges the two old heads.)
3. Deploy admin and frontend.

## 1. Treks (Admin → Treks → edit → **Marketing** tab)

For every trek you sell:

| Field | Example | Why |
|-------|---------|-----|
| Pickup city | `Dehradun` | Connects the trek to city pages and calculator routes. Must match the route destination spelling (the field suggests existing ones). |
| Pickup time | `6:00 AM` | Shown on city pages, quiz results and the calculator |
| Quiz tags | Summit sunrise, Snowy forests | Which quiz answers recommend this trek |
| Result persona | The Sunrise Summiteer | The shareable quiz headline |
| Share line | My first snow summit is waiting… | WhatsApp share text |

**Winter quiz membership is automatic:** any *published* trek whose *Best Season* includes a quiz
month (default Dec–Mar) appears in the quiz. To remove a trek from the quiz, unpublish it or
change its season.

**Seeded winter treks** (Kuari Pass, Dayara Bugyal, Chopta Chandrashila, Nag Tibba, Har Ki Dun,
Dodital, Triund, Prashar Lake, Kheerganga, Kareri Lake) are **drafts**. Before publishing each:
check price, itinerary, includes/excludes, images, then add batches.

## 2. Tool settings (Admin → Growth Tools → **Tool Settings**)

- **Student discount:** on/off, % (10), cap (₹1,500), group bonus (8+ students → ₹1,000),
  verification promise, terms, FAQs. Changes are live immediately on every page.
- **Quiz:** on/off, title, subtitle, season months. For a summer quiz later, switch months to
  Apr–Jun (the URL stays `/tools/winter-trek-quiz/`; ask dev to add a summer URL if you want both).
- **Calculator:** fill **all** rates before promoting it — hotel tiers (per person per night),
  food per travel day, offloading per day, insurance, gear rent/buy prices and "rates last
  checked". Empty rates are hidden from users, not guessed. Gear keywords match each trek's
  equipment list (e.g. keyword `down jacket` shows the item on treks that list a down jacket, and
  marks it "Included" if the trek's includes mention it).
- **City page rules:** thresholds for the publish gate (default 90 days, 2 routes, 3 tips,
  4 FAQs, 300-character intro).

## 3. City pages (Admin → Growth Tools → **Departure Cities**)

Status badges: **Draft** → **Ready to publish** (all checks pass) → **Live** →
**Live · needs re-verify** (older than 90 days).

To publish a city:

1. **Routes** — one row per real option. Destination = trek pickup city (e.g. `Dehradun`,
   `Rishikesh`). Fill operator, departs from, departure time, duration, one-way fare min/max, and
   **source** (URL, or "Called operator on 2026-11-05"). Add our group departure as mode
   *Our group departure* (source optional) — it becomes the headline block on the page.
2. **Intro** — real, city-specific advice (≥ 300 characters). Never copy another city's text.
3. **Local tips** (≥ 3) and **FAQs** (≥ 4) — use real questions from WhatsApp leads.
4. **Verification** — click *Today* on "Last verified" only after checking every route; set
   *Verified by*.
5. Switch **Published** on and save. If anything is missing, the save is rejected and the list of
   issues is shown at the top of the form.

Every 90 days: re-check routes, update fares, click *Today*, save. Until then a stale page shows a
"we're re-checking timings" banner.

## 4. Leads (Admin → **Leads**)

Filter by **source** to see what each tool brings in:

| Source | Comes from | What's in notes |
|--------|-----------|-----------------|
| `quiz_winter` | Quiz result "Send me this plan" | Persona + all quiz answers |
| `budget_calculator` | Calculator "Get an exact quote" | Summary + link to their exact breakdown |
| `student_discount` | Student page | College name (+ `ref:` code if from an ambassador link) |
| `city_<slug>` | City page form | City name |

Student verification: message the student on WhatsApp, check college ID + second proof, add
"verified — <college> — 2026-27" to the lead notes, apply the discount when confirming the booking,
then **delete the ID images** (DPDP Act data minimisation).

Ambassador tracking: give each ambassador a link like
`https://globaleventstravels.com/student-discount/?ref=amb-du01` — the code lands in lead notes.

## 5. Analytics (when ready)

Paste the GA4 or Plausible snippet into Admin → Settings → **Website Widget**. These events start
reporting automatically: `quiz_start`, `quiz_complete`, `quiz_share`, `calculator_start`,
`calculator_complete`, `calculator_share`, `student_offer_share`, `lead_submit`.
