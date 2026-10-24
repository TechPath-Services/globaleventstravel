# 02 — Trek Budget Calculator

Status: **Built** (see doc 05). All rates and gear prices are entered in Admin → Growth Tools →
Tool Settings; travel fares come from verified city routes. Unset rates are hidden, never guessed.
URL: `/tools/trek-budget-calculator/` (embed: `/tools/trek-budget-calculator/embed/`)
Lead source tag: `budget_calculator`

## 1. Why this asset

- "How much does a Kedarkantha trek cost", "Kedarkantha budget from Delhi" and "trek cost
  breakdown" are high-intent searches. Most competitor pages only show the package price, which
  hides 30–50% of the real trip cost (travel, hotel nights, gear, offloading).
- A transparent all-in calculator builds trust and gets cited by budget-travel blogs, Reddit
  answers and college clubs planning group trips. It stays useful every season, so links keep
  accruing for months.
- It's a natural place to show the student discount and the "travel from your city" data.

## 2. Principles

- **All-in and honest.** Include costs we don't earn from (bus tickets, gear). This is what makes it
  link-worthy.
- **No gate before the total.** Lead ask comes after: "Get an exact quote for these dates on
  WhatsApp".
- **Every default number has a source and a date.** Defaults live in a reviewed data file, not in
  component code, and the page shows "Prices last checked: [date]".
- **Shareable state.** All inputs are encoded in the URL so a group leader can send the exact
  breakdown to friends.

## 3. Inputs

| Step | Input | Type | Default / source |
|------|-------|------|------------------|
| 1 | Trek | select | Live treks from API (`price`, or next batch `price_override`) |
| 1 | Batch / month | select | Active batches from API (shows seats left) |
| 2 | Number of people | number (1–20) | 1 |
| 2 | Students in group | number | 0 → applies student discount (see doc 03) |
| 3 | Starting city | select | Delhi, Chandigarh, Lucknow, Dehradun, Other |
| 3 | Travel mode | radio | Options come from city dataset: Volvo/AC bus, ordinary bus, train, flight |
| 4 | Night before trek at base city | toggle + tier | Budget / mid / comfort |
| 4 | Night after trek | toggle + tier | same |
| 5 | Gear | per-item buy / rent / own | Built from trek `equipment_list` |
| 6 | Backpack offloading | toggle | [ops to confirm rate per trek] |
| 6 | Travel insurance | toggle | [ops to confirm partner rate or typical range] |
| 7 | Food & misc on travel days | auto | per person per travel day |
| 7 | Buffer | slider | 10% |

## 4. Cost model

```
per_person =
    package_price(trek, batch)                     # from API
  − student_discount (if eligible, capped)         # doc 03 rules
  + gst_if_not_included                            # [confirm: is listed price inclusive of GST?]
  + travel_to_base(city, mode) + travel_from_base(city, mode)   # city dataset
  + hotel_nights × hotel_rate(base_city, tier)                  # city dataset
  + Σ gear_items(rent_or_buy)                                   # gear dataset
  + offloading (optional)
  + insurance (optional)
  + food_misc × travel_days
  + buffer% × subtotal

group_total = per_person × people  (student discount applied per eligible person)
```

### 4.1 Data that must be collected (owner: ops)

All values marked **[VERIFY]** must be filled from a real source with a date before launch.
Nothing in this table is a final number.

| Item | Where it comes from | Values |
|------|---------------------|--------|
| Package price | API (already exists) | Kedarkantha ₹9,999, Brahmatal ₹10,999 (seed values — use live) |
| GST treatment | Finance | [VERIFY] inclusive or +5%? |
| Delhi ⇄ Dehradun bus | City dataset (doc 04) | [VERIFY] Volvo / ordinary fare ranges |
| Delhi ⇄ Kathgodam / Rishikesh (for Brahmatal) | City dataset | [VERIFY] |
| Dehradun hotel per night (budget/mid/comfort) | Ops / partner hotels | [VERIFY] |
| Gear rental rates (jacket, shoes, poles, gaiters) | Our rental desk or partner shop | [VERIFY] |
| Offloading per trek | Ops | [VERIFY] |
| Insurance | Partner / typical market quote | [VERIFY] |
| Food & misc per travel day | Estimate | [VERIFY] |

### 4.2 Gear dataset (draft structure)

Built from the existing `equipment_list` of each trek so it stays consistent with the trek page.

```json
{
  "down_jacket":   { "label": "Down jacket",          "rent": null, "buy_budget": null, "provided_by_us": false },
  "microspikes":   { "label": "Microspikes",          "rent": null, "buy_budget": null, "provided_by_us": true  },
  "trek_shoes":    { "label": "Trekking shoes",       "rent": null, "buy_budget": null, "provided_by_us": false },
  "trek_poles":    { "label": "Trekking poles",       "rent": null, "buy_budget": null, "provided_by_us": false },
  "gaiters":       { "label": "Gaiters",              "rent": null, "buy_budget": null, "provided_by_us": false },
  "thermals":      { "label": "Thermal innerwear",    "rent": null, "buy_budget": null, "provided_by_us": false },
  "headlamp":      { "label": "Headlamp",             "rent": null, "buy_budget": null, "provided_by_us": false }
}
```

`null` = not yet verified → item is hidden from the calculator until filled. Items we already
provide (microspikes on Kedarkantha and Brahmatal per their `includes`) show as "Included ✓" — a
small trust win versus competitors.

## 5. Output screen draft

> **Kedarkantha from Delhi — 4 friends, 2 students, January batch**
>
> | | Per person | Group (4) |
> |---|---|---|
> | Trek package | ₹9,999 | ₹39,996 |
> | Student discount (2 × 10%) | | − ₹2,000 |
> | Bus Delhi ⇄ Dehradun (Volvo) | ₹[from dataset] | … |
> | Night in Dehradun before pickup | ₹[from dataset] | … |
> | Gear rental (jacket + poles) | ₹[from dataset] | … |
> | Food on travel days | ₹[from dataset] | … |
> | Buffer (10%) | … | … |
> | **Total** | **₹…** | **₹…** |
>
> **Ways to bring this down**
> - Take the overnight ordinary bus instead of Volvo: save ₹…
> - Rent your down jacket instead of buying: save ₹…
> - Are you a student? Save 10% → [Student discount](/student-discount/)
> - Travel on a weekday batch — more seats, same experience.
>
> [ Copy link to this breakdown ] [ Share on WhatsApp ] [ Get an exact quote on WhatsApp ]
>
> *Prices last checked on [date]. Bus and hotel prices change; package price is live from our
> booking system.*

## 6. Link-earning plays

1. **Embed widget.** Compact calculator (trek + city + people → total) as an iframe with a credit
   link: `Trek cost calculator by Global Events Travels`. Offer it to bloggers writing budget guides.
2. **Data story (Phase 3).** "What a winter trek really costs from Delhi, Chandigarh, Lucknow and
   Dehradun (2026–27)" — one blog post + one image table. Pitch to travel journalists and
   newsletters. Each city's real data comes from doc 04, so the story is original research.
3. **Reddit answers.** Threads asking "budget for Kedarkantha from Delhi?" — answer with the
   breakdown in text, link the calculator for people who want to tweak it.
4. **College trip planners.** Group mode (people × students) makes it the tool a club secretary
   sends to the group.

## 7. Page copy (landing)

**Title tag:** Trek Budget Calculator — Real All-in Cost of Himalayan Treks | Global Events Travels
**Meta description:** Package price is only part of it. Add travel from your city, hotel nights,
gear and extras to see the real cost of Kedarkantha, Brahmatal and more — per person and for your
group.

**H1:** What will your trek really cost?
**Sub:** Package, travel from your city, stays, gear and extras — in one honest breakdown.

FAQ (below the tool):
- *How much does a Kedarkantha trek cost from Delhi in total?*
- *Is it cheaper to rent or buy trekking gear for one trek?*
- *Do I need travel insurance for a Himalayan trek?*
- *What's not included in a trek package?*

## 8. Success metrics

- Calculator completions; share-link copies
- Embed installs (count of distinct `referrer` domains loading the embed)
- Leads with `source = budget_calculator`, and their conversion rate (expected to be higher than
  generic leads because cost objections are already handled)
