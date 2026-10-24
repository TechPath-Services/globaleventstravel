# 01 — "Which Winter Trek Suits Me?" Quiz

Status: **Built** (see doc 05). Trek list, tags, personas and season months are managed in admin —
the tables below were the starting design; the live data now comes from the trek table.
URL: `/tools/winter-trek-quiz/`
Lead source tag: `quiz_winter`

## 1. Why this asset

- "Best winter trek for beginners", "Kedarkantha vs Brahmatal" and similar comparison searches
  peak Oct–Dec. A quiz answers that comparison in a personal way and is far more shareable than
  another listicle.
- Personal results ("I'm a Brahmatal trekker") are shared in WhatsApp groups and Instagram stories,
  which brings friends back to take it themselves.
- Bloggers writing "winter treks in India" posts can link to it as a "not sure? take this quiz"
  resource. That is the link-earning mechanic.

## 2. Positioning & rules

- **No gate before the result.** Anyone can see their recommendation without giving a phone number.
  Gated quizzes don't earn links.
- **Honest recommendations.** If someone has no high-altitude experience and wants Chadar, the
  result says "not yet — start with Kedarkantha". Honesty is what makes people trust and share it.
- **Only recommend treks with live winter batches** (pulled from the API at render time). Fallback
  copy if a trek has no open batch: "Batches for this trek open soon — get notified on WhatsApp".
- 6–8 questions, under 90 seconds, mobile-first (most traffic will come from WhatsApp).

## 3. Draft questions

Each answer adds points to trek attributes. Scoring details are in section 4.

**Q1. Have you trekked in the Himalayas before?**
- Never — this would be my first trek
- Once or twice, nothing above ~4,000 m
- Yes, several treks including high passes or summits above 4,000 m

**Q2. How would you describe your fitness right now?**
- I can walk 5 km comfortably but don't really exercise
- I can jog 5 km without stopping
- I run/cycle/gym regularly and can jog 5 km in under 35 minutes

**Q3. How many days can you take, including travel?**
- A long weekend (3–4 days)
- About a week (5–7 days)
- 8 days or more

**Q4. What's the moment you're trekking for?** *(pick one)*
- Standing on a summit at sunrise with 360° snow peaks
- Camping beside a frozen alpine lake
- Walking through silent snow-covered forests and meadows
- The hardest, most extreme winter experience I can get

**Q5. How do you feel about cold?**
- I'm fine down to about 0 °C, beyond that I'm miserable
- I can handle −10 °C at night with good gear
- Bring on −20 °C

**Q6. Where will you start your journey from?**
- Delhi / NCR
- Chandigarh / Punjab / Haryana
- Lucknow / UP
- Dehradun / Uttarakhand
- Somewhere else in India
- Outside India

*(Not used for scoring the trek — used to link the matching `/treks-from/[city]/` page and prefill the
budget calculator.)*

**Q7. Who's coming with you?**
- Solo
- Friends / college group
- Partner
- Family with teenagers

**Q8. What's your rough budget for the trek package itself (per person)?**
- Under ₹10,000
- ₹10,000 – ₹15,000
- No fixed budget, experience matters more

## 4. Scoring model

### 4.1 Trek attribute table (draft — confirm against live catalog)

Values for Kedarkantha and Brahmatal come from the current seed catalog
(`backend/app/db/seed.py`). Rows marked **[confirm]** are candidates only; include them only if
we operate them this winter.

| Trek | Difficulty | Days | Max alt. | Price | Highlight tag | Cold level | Min experience |
|------|-----------|------|----------|-------|---------------|-----------|----------------|
| Kedarkantha | easy | 6 | 3,810 m | ₹9,999 | summit | 2 | none |
| Brahmatal | moderate | 6 | 3,425 m | ₹10,999 | frozen_lake | 2 | none |
| Nag Tibba **[confirm]** | easy | 2–3 | ~3,000 m | [confirm] | weekend / forest | 1 | none |
| Dayara Bugyal **[confirm]** | easy | 5–6 | ~3,600 m | [confirm] | meadow | 2 | none |
| Kuari Pass **[confirm]** | moderate | 6 | ~3,800 m | [confirm] | summit / views | 2 | none |
| Chadar **[confirm]** | challenging | 8–9 | ~3,400 m | [confirm] | extreme | 3 | high |

### 4.2 Scoring rules

```
score(trek) =
    3 × match(highlight, Q4)            # the emotional reason, weighted highest
  + 2 × fits(days, Q3)                  # hard constraint, soft-scored
  + 2 × fits(difficulty, Q1 + Q2)       # experience + fitness → allowed difficulty
  + 1 × fits(cold_level, Q5)
  + 1 × fits(price, Q8)
  + 0.5 × group_bonus(Q7)               # e.g. family → easy treks get a bump

Hard filters (trek is removed, not just down-scored):
  - Q1 = "Never" AND trek.min_experience = high          → remove
  - Q3 = "Long weekend" AND trek.days > 4                 → remove (unless no trek remains)
  - trek has no active winter batch                       → remove
```

- Top score = primary result. Second score = "Also great for you".
- Ties break toward the easier trek (safer recommendation).
- If every trek is filtered out (e.g. weekend + no weekend trek offered), show the closest match with
  an honest note: "You'll need ~6 days for this one. Here's how to make it work with 2 days leave."

### 4.3 Personas (result names — this is what gets shared)

| Result | Persona name | Share line |
|--------|--------------|-----------|
| Kedarkantha | The Sunrise Summiteer | "My first snow summit is waiting. I'm a Kedarkantha trekker." |
| Brahmatal | The Frozen Lake Wanderer | "Frozen lakes + Trishul views. I'm a Brahmatal trekker." |
| Nag Tibba | The Weekend Escape Artist | "Two days, one snow peak. I'm a Nag Tibba trekker." |
| Dayara Bugyal | The Snow Meadow Dreamer | "Endless snow meadows. I'm a Dayara Bugyal trekker." |
| Kuari Pass | The Panorama Hunter | "Nanda Devi views all day. I'm a Kuari Pass trekker." |
| Chadar | The Ice Walker | "Walking on a frozen river at −20 °C. I'm a Chadar trekker." |

## 5. Result page draft (Kedarkantha example)

> **You're a Sunrise Summiteer 🏔️**
> **Your winter trek: Kedarkantha (3,810 m) — 6 days from Dehradun**
>
> **Why it fits you:** You want a real summit but it's your first Himalayan trek. Kedarkantha gives
> you a proper summit push at sunrise with views of Swargarohini, Bandarpoonch and Black Peak, on a
> well-marked trail that first-timers complete every winter.
>
> **What to expect:** 4–6 hours of walking a day, nights of −10 °C to −15 °C in peak winter,
> summit day starts at 3–4 AM. Microspikes are provided.
>
> **Getting there from Delhi:** Overnight bus to Dehradun, our pickup is at 6 AM.
> → [Full route, timings and fares from Delhi](/treks-from/delhi/)
>
> **What will it cost you all-in?** → [Open the budget calculator (prefilled)](/tools/trek-budget-calculator/?trek=kedarkantha&from=delhi)
>
> **Students:** save 10% with a valid student ID → [Student discount](/student-discount/)
>
> **Also great for you:** Brahmatal — frozen lakes and Trishul views, similar difficulty.
>
> [ See Kedarkantha dates & price ] [ Send me this plan on WhatsApp ]
>
> Share your result: [WhatsApp] [Instagram story] [Copy link]

## 6. Shareability mechanics

- **Result URL is stable and indexable:** `/tools/winter-trek-quiz/result/kedarkantha/`.
  Sharing the link shows the result card, not the start of the quiz.
- **Per-result OG image** (1200×630) with persona name + trek photo + "Take the quiz" — this is what
  appears in WhatsApp previews.
- **Instagram story card** (1080×1920) downloadable image.
- **WhatsApp share text:**
  `I got "The Sunrise Summiteer" — Kedarkantha 🏔️ Which winter trek are you? https://globaleventstravels.com/tools/winter-trek-quiz/?ref=wa`
- **Embed snippet** for bloggers (iframe + a credit link back), offered in the page footer.

## 7. Page copy (landing)

**Title tag:** Which Winter Trek Suits You? 60-Second Quiz | Global Events Travels
**Meta description:** Kedarkantha, Brahmatal or something else? Answer 8 quick questions about
your experience, fitness, days and budget, and get an honest winter trek recommendation.

**H1:** Which winter trek suits you?
**Sub:** 8 questions. 60 seconds. An honest pick based on your fitness, time and budget — not on
what we want to sell.
**CTA:** Start the quiz

Below the fold (for SEO + trust): a short comparison table of all winter treks in the quiz,
"How we pick your trek" (explains the scoring in plain language), and an FAQ:
- *Which winter trek is best for beginners?*
- *Kedarkantha or Brahmatal — which is easier?*
- *Can I do a winter trek in a long weekend?*
- *How cold does it get on winter treks?*

## 8. Outreach plan

| Target | Pitch |
|--------|-------|
| Bloggers ranking for "winter treks in India" | "Your readers ask which one to pick — here's a free quiz you can embed or link." |
| College adventure clubs | "Use this before your winter trip planning meeting" + student discount |
| Instagram trekking creators | Story template: "Take it and tag us with your result" |
| Reddit threads asking "first winter trek?" | Answer the question in full, link quiz as an extra |

## 9. Success metrics

- Start → completion rate ≥ 65%
- Share click rate ≥ 8% of completions
- Result → trek page click-through ≥ 30%
- Leads with `source = quiz_winter`
- Referring domains to `/tools/winter-trek-quiz/`
