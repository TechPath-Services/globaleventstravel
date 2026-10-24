# 03 — Student Discount Page

Status: Draft — policy needs sign-off
URL: `/student-discount/`
Lead source tag: `student_discount`

## 1. Why this asset

- Students are the largest segment for easy/moderate winter treks (Kedarkantha, Brahmatal) and
  plan in groups, so one student can bring 4–10 bookings.
- Student offers are shared organically in college WhatsApp groups and on Reddit, and colleges
  link to them from club pages, placement/"student perks" pages, and event sponsor sections.
  Links from `.ac.in` / `.edu.in` domains are strong trust signals.
- Winter break (late Dec – Jan) lines up with peak winter trek season.

## 2. Recommended policy (for sign-off)

| Rule | Recommendation | Why |
|------|----------------|-----|
| Discount | 10% off the trek package, **capped at ₹1,500** per person | Simple to share ("10% off"); cap protects margin on expensive treks |
| Eligibility | Currently enrolled full-time students in India (college/university); school students 16–17 only with a parent/guardian booking | Clear and verifiable |
| Proof | Valid college ID card for the current academic year **plus** one of: college email address, fee receipt, or bonafide certificate | ID alone is easy to fake |
| Applies to | Trek package only (not transport add-ons, offloading, rentals) | Margin protection |
| Blackout | **None — decided 2026-10-24: valid on all dates** | Simpler message; watch holiday batch fill rates |
| Seasonal limit | One student discount per student per season | Prevents reuse |
| Combining | Not combinable with other offers; best single offer applies | Standard |
| Transferability | Non-transferable; name on ID must match booking name and trek-day ID check | Stops resale |
| Group perk (optional) | Groups of 8+ verified students: trip organiser gets an extra ₹1,000 off | Rewards the person who spreads the offer |

> **Decided:** 10% capped at ₹1,500, no blackout dates, group perk on (8+ students → ₹1,000 for
> the organiser). Every value above — %, cap, group size/bonus, verification promise, terms and
> FAQs — is editable in Admin → Growth Tools → Tool Settings and updates the site immediately.

### Margin view

On Kedarkantha (₹9,999), 10% = ₹1,000 per student. With no blackout dates, the discount also
applies to Christmas–New Year batches that usually sell out; review fill rates after the first
season and lower the % or cap in admin if needed.

## 3. Verification flow (built)

1. Student fills a short form on the page (name, WhatsApp, college, trek of interest).
   → creates a `Lead` with `source = "student_discount"` and `notes = "College / university: …"`
   (filter by source in Admin → Leads; the college shows under the source column).
2. Ops receives the existing Brevo lead notification email.
3. Ops messages the student on WhatsApp and asks for ID + secondary proof.
4. Ops checks proof, notes "student verified — college X — season 2026-27" in the lead `notes`,
   applies the discount manually when confirming the booking.
5. **ID images are deleted from WhatsApp/ops devices after verification.** We store only:
   verified yes/no, college name, date verified. (Data minimisation under India's DPDP Act 2023.)
6. On trek day, the trek leader checks the physical student ID at the pickup point.

Later (once volume justifies it): admin "verify student" action and discount recorded on the
booking. See doc 05.

## 4. Page copy draft

**Title tag:** Student Discount on Himalayan Treks — 10% Off | Global Events Travels
**Meta description:** Students get 10% off Kedarkantha, Brahmatal and other Himalayan treks with a
valid student ID. Plan your winter break trek with your college group.

---

**H1:** 10% off Himalayan treks for students

**Sub:** Show a valid student ID, get 10% off your trek (up to ₹1,500). Perfect for winter break
with your college gang.

[ Claim student discount ] [ Find your trek — take the quiz ]

**How it works**
1. **Tell us your trek and college** — 30-second form below.
2. **Verify on WhatsApp** — send your college ID and a college email / fee receipt. We reply within
   [X working hours — ops to confirm].
3. **Book with your discount** — your discounted price is locked in for the batch you choose.

**Treks students love this winter**
- **Kedarkantha** — easy, 6 days from Dehradun, snow summit at 3,810 m. From ₹9,999 → ₹8,999 for
  students.
- **Brahmatal** — moderate, 6 days, frozen lakes and Trishul views. From ₹10,999 → ₹9,899 for
  students.
*(Prices pulled live from the trek API; discounted price computed on the page.)*

**Coming as a group?**
Groups of 8+ students: the organiser gets an extra ₹1,000 off. *(Only if group perk is approved.)*
Need help convincing the group? Send them our
[budget calculator](/tools/trek-budget-calculator/) with your exact breakdown.

**Is it safe for first-timers?**
Short, trust-building section: guide experience, safety kit (first aid, oxygen on Brahmatal per
current `includes`), group sizes, ratings. Link to reviews.

**FAQ**
- *Who counts as a student?* Anyone currently enrolled full-time in an Indian college or university.
  Students aged 16–17 can join with a parent/guardian's booking and consent.
- *Can I use it with other offers?* No, but we'll always apply the best single offer for you.
- *Does it apply to all dates?* Yes, every open batch including holiday departures, while seats
  last.
- *What do you do with my ID?* We use it only to verify you're a student, then delete the image.
  We keep a note that you're verified, nothing else.
- *Can my friend who isn't a student join?* Yes, at the regular price, in the same batch.
- *I'm an international student in India / a student abroad?* [Decision needed.]

**Small print** (link to full terms; also add a line to `/cancellation-refund/` which already
mentions promotional offers).

**Structured data:** `Offer` with `eligibleCustomerType` description and `priceSpecification`
on the trek listing; `FAQPage` for the FAQ block.

## 5. Distribution plan

### 5.1 College outreach (Phase 3, before mid-December)

Target list (build in a sheet): adventure / mountaineering / photography / NSS clubs at colleges in
Delhi NCR, Chandigarh, Dehradun and Lucknow. Start with 40 clubs.

**Email template (draft)**

> Subject: Winter break trek for [Club name] — 10% student discount
>
> Hi [Name],
>
> I'm [Name] from Global Events Travels — we run Himalayan treks out of Manali, Kasol and
> Dehradun.
>
> We've put together a student offer for winter break: 10% off treks like Kedarkantha and
> Brahmatal with a valid student ID. Details: https://globaleventstravels.com/student-discount/
>
> Two free things your members might find useful even if they don't trek with us:
> - A 60-second quiz that recommends a winter trek based on fitness and days:
>   https://globaleventstravels.com/tools/winter-trek-quiz/
> - A calculator that shows the real all-in cost of a trek from your city:
>   https://globaleventstravels.com/tools/trek-budget-calculator/
>
> If you think it's useful, we'd be grateful if you shared it with members or added it to your
> club's resources page. For club trips of 8+ we can also do a pre-trek fitness briefing on campus
> or over video.
>
> Thanks,
> [Name] · [WhatsApp]

### 5.2 Campus ambassadors

- 1 ambassador per target college (start with 10).
- Reward: free trek seat for every 8 verified student bookings they bring (tracked with
  `?ref=amb-[code]` → saved in lead `source` suffix or `notes`).
- Their job: seed the offer in class/hostel WhatsApp groups, put up one poster, run one info session.

### 5.3 Reddit

Rules for whoever posts:
- Use a personal account that discloses the affiliation ("I work with Global Events Travels").
- Only post in threads where someone asks about winter treks, student trips or budgets. Answer the
  question fully in the comment; the link is secondary.
- Check each subreddit's self-promotion rules first. Candidates: city subs (r/delhi, r/Chandigarh,
  r/dehradun, r/lucknow), travel/trekking subs, and college subs where allowed.
- Never post the same text twice. Never use multiple accounts.

### 5.4 WhatsApp share kit

- One square image (1080×1080): "Students: 10% off Himalayan treks this winter" + QR code.
- Pre-written message for ambassadors:
  `Winter break plan? 🏔️ Global Events Travels is giving students 10% off Kedarkantha & Brahmatal with college ID. Details + quiz to pick your trek: https://globaleventstravels.com/student-discount/?ref=wa`

## 6. Success metrics

- Student leads (`source = student_discount`), verification rate, booking conversion
- Average group size of student bookings
- Referring domains from `.ac.in` / `.edu.in`
- Discount cost vs incremental bookings (by batch fill rate)
