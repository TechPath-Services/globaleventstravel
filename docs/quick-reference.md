# Quick Reference - Copy & Paste Prompts for Cursor

## How to Use This Document

1. **Find the feature** you want to develop
2. **Copy the entire prompt** (from `---START---` to `---END---`)
3. **Paste it into Cursor** chat
4. **Let Cursor ask clarifying questions** and build step-by-step

---

## Feature 1: Multiple Office Addresses Component

**---START---**

I need to create a responsive "Our Offices" component for Global Events Travels that displays 4 office locations. Here's what I need:

**Offices to display:**
1. Himachal Office: Global Camp's by Global Events Travels, Aleo road petrol pump near chandarmaki cottage, NSB hotel, near coordinates (32.2299, 77.1889)
2. Chennai Office: 306, 1st main road, MKB Nagar, Chennai 600039
3. Kasol Office: Casanova Camp's Choj Bridge, kasol, Near Bus Stand, Manikaran Rd, Near Volvo, Kasol, Sosan, Himachal Pradesh 175101, near coordinates (32.2167, 77.4333)
4. Dehradun Office: Kugiyal niwas Vimal Kumar Singh Ganesh Vihar lane 6, Mata Mandir Rd, near by Kukreja institute, Ajabpur Kalan, Dehradun, Uttarakhand 248001

**Requirements:**
- Card-based layout with office name, address, landmarks, phone, email
- Toggle between viewing all at once (grid) or one at a time (tabs)
- Google Maps embedded for each location (can be static image links for now)
- "Get Directions" button linking to Google Maps
- "Copy Address" button for clipboard functionality
- Icons for location, phone, email using Lucide React
- Responsive: 1 column mobile, 2 columns tablet/desktop
- Smooth transitions and hover effects

Please create:
1. TypeScript interface for office data
2. Component structure and folder organization
3. Reusable OfficeCard component
4. Main OfficesList/OfficesGrid component with toggle
5. Styling with Tailwind CSS

**---END---**

---

## Feature 2: Testimonials & Reviews Section

**---START---**

I need to build a "Traveler Testimonials" section for Global Events Travels. This should showcase detailed reviews from past trekkers.

**Core functionality:**
- Display testimonials in card format (grid layout)
- Each card shows: traveler name, profile image, trek name, star rating (1-5), title, review text
- Show "Verified Traveler" badge for verified reviews
- Tags/highlights from review (e.g., "Great guides", "Amazing views", "Budget-friendly")
- Sorting options: Latest, Highest rated, Most helpful
- Filtering by: Trek name, Rating level
- Search by keyword
- Pagination (10-15 per page)
- Optional: Like/helpful votes system

**Data structure needed:**
- Name, profile image, trek name, rating, title, review text, date, verified status
- Highlighted points from review as tags
- Traveler location/home city

**Design:**
- Profile pictures as circles
- Star rating visualization
- Color-coded difficulty levels
- Hover effects with slight card lift
- "Read more" expandable for longer reviews
- Share testimonial button

Please create:
1. TypeScript interface for testimonial data
2. TestimonialCard component
3. TestimonialList component with filtering/sorting
4. TestimonialSearch component
5. Complete page layout with all features
6. Styling with Tailwind CSS

**---END---**

---

## Feature 3: Blog Page Setup

**---START---**

I need to create a comprehensive blog section for Global Events Travels with ~30 articles focused on trekking, travel tips, and deals.

**Blog post structure:**
- Title, excerpt, full content (markdown)
- Author, publish date, last updated
- Featured image and optional content images
- Category (Trek Guide, Budget Tips, Destination, Gear Review, Safety, Season Guide)
- Tags (Kasol, Kheerganga, Kedarkantha, Budget, Beginners, etc.)
- Read time estimate
- SEO fields (meta description, meta keywords, OG image)

**Blog listing page features:**
- Grid/list view toggle
- Featured posts section at top
- Filter by category and tags
- Search by title/keyword
- Sort by: Latest, Popular, Trending
- Pagination (10-12 per page)
- Reading progress indicator

**Individual blog post page (/blog/[slug]):**
- Full article with proper heading hierarchy
- Table of contents (auto-generated from H2/H3)
- Author info card
- Related posts (3-4 suggestions)
- Social sharing buttons (Twitter, Facebook, WhatsApp, LinkedIn)
- Newsletter signup CTA
- Comment section (optional: Disqus integration)
- Print article option

**Articles to create structure for:**
- "13 Best Summer Treks in India for 2025"
- "Navigate the Market: Where to Find Kasol + Kheerganga Trek Packages"
- "Kasol + Kheerganga Trek for Beginners"
- "The Ultimate Comparison Guide: Choose the Perfect Kasol Kheerganga Trek"
- (Plus 26 more articles in similar style)

Please create:
1. BlogPost TypeScript interface
2. Blog listing page with all filters
3. Individual blog post page with slug routing
4. BlogCard and BlogList components
5. Search and filter functionality
6. Related posts algorithm/component
7. SEO implementation (meta tags, schema markup)
8. Styling with Tailwind CSS
9. Sample markdown for one blog post

**---END---**

---

## Feature 4: Yatra (Pilgrimage) Packages

**---START---**

Create a "Yatra" page for spiritual pilgrimage tour packages. This should showcase 4 pilgrimage options.

**Yatra packages:**
1. Char Dham Yatra (4 sacred temples)
2. Kedarnath Yatra (solo pilgrimage)
3. Do Dham Yatra (2 sacred temples)
4. Kedarnath + Chopta Tunganath Chandrashilla (combined)

**Package information needed:**
- Package name, description, duration, difficulty level
- Key highlights (attractions and sacred sites)
- Day-by-day itinerary with descriptions
- Best seasons for visit
- Price range (min-max per person)
- Group size (min-max participants)
- Accommodations included
- Meal plan details
- Fitness/altitude requirements
- Ratings and reviews count
- Featured image gallery

**Page features:**
- Package cards showing: duration, difficulty, price range, key highlights, rating
- Featured packages section
- Filter by: duration, difficulty, season, price range
- Quick comparison tool (side-by-side)
- Detailed package view modal or separate page
- Testimonials specific to each yatra
- FAQ section (common questions)
- Booking calendar showing available dates
- "Get Details" or "Book Now" CTA

**Detailed package page should include:**
- Full itinerary (day-by-day)
- Image gallery with lightbox
- Inclusions and exclusions lists
- Pricing breakdown and options
- Accommodation details with images
- Spiritual significance information
- Safety and health information
- Permits and documentation required
- Testimonials and success stories
- Booking form with date selection

Please create:
1. YatraPackage TypeScript interface
2. YatraCard component
3. YatraGrid/List component with filters
4. Detailed yatra page with routing
5. YatraItinerary component
6. YatraPricing and BookingCTA components
7. Styling with spiritual/peaceful color palette
8. Initial data for 4 yatra packages

**---END---**

---

## Feature 5: Expeditions Page

**---START---**

Create an "Expeditions" page for high-altitude mountaineering expeditions. Currently featuring 2 expeditions.

**Expeditions to feature:**
1. Black Peak Expedition
2. Friendship Peak Expedition

**Expedition data structure:**
- Name, difficulty (Advanced/Expert/Extreme), duration
- Summit altitude, base altitude
- Location/region
- Highlights and key features
- Complete day-by-day itinerary with altitudes
- Requirements: Previous experience, fitness level, technical skills
- Guide team (names, experience, certifications)
- Equipment (provided vs. personal)
- Price range
- Group size limits
- Season availability
- Success rate percentage
- Gallery and featured images
- Safety protocols and risk information

**Page features:**
- Eye-catching hero section with mountain imagery
- Expedition cards with: altitude badges, difficulty level, duration, success rate
- Filter by: altitude, difficulty, season, duration
- Comparison tool (side-by-side)
- Featured expeditions highlight
- Risk/Safety information section
- Expert guides profile section

**Detailed expedition page should show:**
- Inspiring hero image
- Quick facts badges (altitude, difficulty, duration, success rate)
- Full description and overview
- Visual altitude profile (graph showing elevation changes)
- Day-by-day detailed itinerary with altitudes and activities
- Interactive route map
- Guide team with photos and bios
- Equipment checklist (provided vs. need to bring)
- Training requirements and preparation plan
- Safety protocols and emergency procedures
- Previous climber testimonials with photos
- Fitness requirements explanation
- Altitude sickness information and acclimatization schedule
- Insurance requirements
- Cost breakdown with transparency
- Booking form with experience verification
- Download itinerary as PDF

Please create:
1. Expedition TypeScript interface
2. ExpeditionCard component
3. ExpeditionList component with filters
4. Detailed expedition page with routing
5. ExpeditionItinerary and AltitudeProfile components
6. SafetySection and GuideProfiles components
7. EquipmentChecklist component
8. Professional styling with safety-focused design
9. Initial data for 2 expeditions

**---END---**

---

## Feature 6: Customizable Tour Packages

**---START---**

Create a "Customizable Tours" page showcasing 6 multi-destination tour packages that users can customize.

**Tour packages:**
1. Manali Tour Package
2. Shimla Tour Package
3. Jibhi Tour Package
4. Tirthan Valley Tour Package
5. Dubai Tour Package
6. Thailand Tour Package

**Customization options:**
- Duration (slider with min-max range)
- Group size
- Accommodation type (Budget/Standard/Luxury/Premium with pricing)
- Transportation mode (Self-drive, Bus, Car, Flight, Taxi)
- Meal plan (Breakfast only, Half board, Full board, All meals)
- Activity add-ons (multiple selection with prices)
- Special requests (free text field)
- Real-time price calculator showing total

**Tour package data:**
- Destination, description, highlights
- Default duration and flexible range
- Base price and price components
- Included attractions/activities
- Accommodation options with prices
- Transport options
- Meal options
- Additional activities available
- Best seasons
- What to carry/pack
- Gallery of images

**Page layout:**
- Tour cards showing: destination, duration, highlights, starting price, rating
- Filter by: destination, budget, duration, season
- Featured packages section
- Quick comparison tool

**Customization builder flow:**
1. Select duration (slider)
2. Select group size
3. Choose accommodation (with live price update)
4. Select transportation mode
5. Choose meal plan
6. Select activities/add-ons
7. Add special requests
8. Review summary with total cost
9. Download itinerary as PDF
10. Proceed to booking

**Features needed:**
- Real-time price updates as selections change
- Drag-and-drop itinerary customization (optional but nice)
- Activity selector with images and descriptions
- Save draft for later
- Share customization with friends
- Automatic group discount calculation
- Budget summary with cost breakdown

**Detailed package page includes:**
- Destination overview and images
- Attraction list and descriptions
- Default itinerary (5-7 days)
- Accommodations with options and prices
- Activities and experiences available
- Dining recommendations
- Transportation details
- Best time to visit with weather info
- Packing list
- Travel tips and local info
- Testimonials from past travelers
- FAQ section

Please create:
1. TourPackage TypeScript interface
2. TourCard component
3. TourList component with filters
4. Detailed tour page with routing
5. Complete customization builder with multi-step form
6. PriceCalculator component with real-time updates
7. ActivitySelector and AccommodationSelector components
8. ItinerarySummary component
9. Styling with Tailwind CSS
10. Initial data for 6 tour packages with options

**---END---**

---

## Feature 7: PDF Itinerary Download

**---START---**

Add PDF itinerary download functionality for all tours, treks, yatras, and expeditions. Users should be able to download a well-formatted PDF with complete itinerary details.

**PDF should include:**
1. Cover page with package name, dates, company info
2. Quick facts page (duration, difficulty, price, what's included)
3. Day-by-day itinerary with times, altitudes, activities
4. Accommodation details
5. Transportation guide
6. Packing list
7. Important information (weather, fitness requirements, safety)
8. FAQ section
9. Maps (route map and destination map)
10. All office contact information

**Technical requirements:**
- One-click download button on every package page
- Generate PDF on-the-fly (no pre-generated files)
- File naming: "[PackageName]_Itinerary_[Date].pdf"
- Email option: Send PDF to user email instead of download
- For custom tours: PDF should reflect all chosen customizations
- Mobile responsive PDF viewer (can be viewed on phone)
- PDF size optimization (< 5MB)
- Include company logo and branding

**PDF generation library options:**
- Puppeteer (more control, server-side)
- jsPDF + html2pdf (simpler, client-side)
- PDFKit (Node.js, backend)

**Features:**
- Download button with loading state
- Email to user option
- Share PDF link on WhatsApp/Email
- Print PDF option
- QR code linking to online booking (optional)
- Real-time PDF generation (don't delay user)

**Integration points:**
- /treks/[slug]/page.tsx - Download button
- /yatra/[slug]/page.tsx - Download button
- /expeditions/[slug]/page.tsx - Download button
- /tours/[slug]/page.tsx - Download button
- /tours/[slug]/customize/page.tsx - "Download my custom itinerary" after building
- /api/itinerary/[packageId]/pdf.ts - PDF generation endpoint
- Booking confirmation - Auto-email PDF after booking

Please create:
1. PDF generation utility function (using Puppeteer or jsPDF)
2. PDF template/styling
3. API route for generating PDFs
4. Download button component (with loading states)
5. Email PDF functionality (using Nodemailer)
6. Integration with all package pages
7. Example PDF HTML template
8. Error handling and retry logic

**---END---**

---

## Quick Command Reference

### When pasting to Cursor, you can also add these prefixes:

**For faster iteration:**
```
Act as a senior Next.js developer. I'm building Global Events Travels website.

[PASTE PROMPT HERE]

Start with component structure and TypeScript interfaces, then show me code step by step.
```

**For specific implementation:**
```
I'm using Next.js 14 with App Router, Tailwind CSS, and TypeScript.
Database: MongoDB (via Mongoose)
Hosting: Vercel

[PASTE PROMPT HERE]

Focus on: type safety, reusability, performance, and SEO.
```

**For database-focused:**
```
I need database schema and API endpoints for:

[PASTE PROMPT HERE]

Create Mongoose schemas, API routes, and database operations.
```

---

## Feature Priority Checklist

### Tier 1 - Do First (Week 1-2)
- [ ] Multiple Office Addresses
- [ ] Testimonials Section
- [ ] Expeditions Page

### Tier 2 - Do Next (Week 3-4)
- [ ] Blog Page (create structure, can populate articles gradually)
- [ ] Yatra Packages
- [ ] Tour Customizer

### Tier 3 - Supporting (Week 5-6)
- [ ] Exploration Videos
- [ ] PDF Downloads

---

## Directory Structure Hints for Cursor

When asking Cursor to create components, you can specify:

```
Create the following folder structure:
- app/blog/ → Blog page and routes
- components/blog/ → BlogCard, BlogList, BlogSearch
- lib/blog/ → Blog utilities and API
- data/blog/ → Blog post markdown files
- types/blog.ts → TypeScript interfaces
- public/images/blog/ → Blog images
```

---

## Database Setup Commands

When ready to set up database, ask Cursor to:

```
Create MongoDB schemas using Mongoose for:
1. Testimonials collection
2. Blog posts collection
3. Office addresses collection
4. Tour packages collection
5. Yatra packages collection
6. Expeditions collection
7. Videos collection

Include field validation, indexes, and relationships.
```

---

## Testing Prompt Template

```
Write unit and integration tests for:
- Testimonial filtering and sorting
- Blog search functionality
- Tour customizer price calculation
- PDF generation endpoint
- Office location display

Use Jest and React Testing Library.
```

---

## Performance Optimization Prompt

```
Optimize the following for Core Web Vitals:
- Blog listing page (Largest Contentful Paint)
- Tour customizer (Interaction to Next Paint)
- Video gallery (Cumulative Layout Shift)

Suggest caching strategies, lazy loading, and image optimization.
```

---

## Next Steps After Using Prompts

1. **Copy & paste one feature prompt to Cursor**
2. **Let Cursor build components step-by-step**
3. **Review code for quality and alignment**
4. **Ask for refinements** (styling, features, etc.)
5. **Move to next feature**
6. **Test everything together before deployment**

---

## Common Follow-up Questions for Cursor

Once you're in the conversation, you can ask:

- "Add pagination to this list"
- "Implement search functionality"
- "Make this fully mobile responsive"
- "Add loading skeletons"
- "Implement error boundaries"
- "Add analytics tracking"
- "Create an admin dashboard to manage this data"
- "Add authentication for user testimonials"
- "Create API routes for this component"
- "Set up database with this data"

---

## File Download

Both main prompt files are now ready:
1. **cursor-prompts.md** - Detailed feature prompts with all specifications
2. **implementation-guide.md** - Technical guide, architecture, and best practices

Use these as your complete development roadmap!
