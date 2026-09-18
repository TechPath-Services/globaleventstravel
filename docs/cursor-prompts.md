# Cursor AI Prompts & Implementation Guide
## Detailed prompts for rapid development with Cursor AI

---

## 🚀 PROMPT SET 1: PROJECT INITIALIZATION

### Prompt 1.1: Create Complete Folder Structure

```
@agent

Create the complete folder structure for the Global Events Travels project with proper gitignore files. Generate:

1. Create root directory structure:
   - frontend/ (Astro project)
   - backend/ (FastAPI project)
   - docs/
   - .github/workflows/
   - docker-compose.yml

2. Frontend folder structure at frontend/src/:
   - pages/ with subdirectories: treks/, blog/, api/
   - components/ with: layout/, trek/, booking/, review/, guide/, forms/, common/, hero/, sections/
   - layouts/
   - content/ (with treks/, guides/, blog/)
   - styles/
   - lib/
   - utils/
   - public/ with subdirectories: images/, videos/, documents/, fonts/

3. Backend folder structure at backend/app/:
   - api/v1/endpoints/
   - models/ (Pydantic)
   - db/models/ (SQLAlchemy)
   - crud/
   - services/
   - core/
   - utils/
   - migrations/
   - tests/

4. Create .gitignore files for:
   - Frontend (node_modules, dist, .env.local)
   - Backend (venv, __pycache__, .env, *.db)
   - Root (.DS_Store, .vscode)

5. Create README.md files in each folder explaining purpose

Use tree-like output or markdown lists.
```

### Prompt 1.2: Initialize Astro Project with Config

```
@agent

Generate complete Astro project configuration for Global Events Travels:

1. Create astro.config.mjs with:
   - Site URL: https://globaleventstravels.com
   - Tailwind integration
   - Image optimization (@astrojs/image)
   - Sitemap generation
   - React integration (for client components)
   - Output mode: hybrid (static + dynamic)
   - Vite configuration for API URL

2. Create tailwind.config.js with:
   - Light theme color scheme (sky blue primary)
   - Extended colors: primary, accent, neutral
   - Typography plugin
   - No darkMode configuration (light only)
   - Custom spacing if needed

3. Create tsconfig.json with:
   - Strict mode
   - React JSX preset
   - Path aliases: @/* -> ./src/*
   - DOM lib

4. Create package.json with scripts:
   - dev
   - build
   - preview
   - check (astro check)
   - Dependencies: astro, tailwindcss, @astrojs/*, react

5. Create .env.example with:
   - PUBLIC_API_BASE_URL
   - PUBLIC_SITE_URL

Include all necessary configuration options.
```

### Prompt 1.3: Initialize FastAPI Backend with Config

```
@agent

Generate complete FastAPI backend project setup:

1. Create app/main.py with:
   - FastAPI app initialization
   - CORS middleware (configurable origins)
   - TrustedHostMiddleware
   - Health check endpoint
   - API router inclusion
   - Error handlers
   - Logging setup
   - Request/Response middleware

2. Create app/core/config.py with:
   - Settings class using Pydantic
   - Environment variables: DATABASE_URL, SECRET_KEY, DEBUG, CORS_ORIGINS
   - API configuration
   - Database configuration
   - Email configuration

3. Create app/core/exceptions.py with:
   - Custom exceptions (AppException, ValidationException, NotFoundException)
   - Exception handlers

4. Create app/core/logger.py with:
   - Logging configuration
   - Structured logging setup

5. Create requirements.txt with:
   - fastapi>=0.109
   - sqlalchemy>=2.0
   - pydantic>=2.0
   - pydantic-settings
   - asyncpg
   - alembic
   - python-dotenv
   - pytest
   - pytest-asyncio

6. Create .env.example with:
   - DATABASE_URL
   - SECRET_KEY
   - DEBUG
   - CORS_ORIGINS
   - API_TITLE

7. Create app/db/base.py with:
   - SQLAlchemy Base class setup
   - Async engine configuration

Include proper async/await patterns and type hints.
```

---

## 🎨 PROMPT SET 2: FRONTEND COMPONENTS

### Prompt 2.1: Core Layout Components

```
@agent

Generate Astro layout and header/footer components:

1. Create src/layouts/MainLayout.astro:
   - Accepts title, description props
   - Includes Header and Footer
   - Sets up SEO meta tags
   - Includes global CSS
   - Defines main container with slot
   - Mobile viewport setup

2. Create src/components/layout/Header.astro:
   - Logo/brand link
   - Navigation menu: Home, Treks, About, Guides, Contact
   - Mobile hamburger menu (Astro island)
   - Sticky header with scroll detection
   - Light theme styling (white background, dark text)
   - Responsive: mobile nav drawer, desktop horizontal

3. Create src/components/layout/Footer.astro:
   - Company info section
   - Quick links: Treks, About, Blog, Contact
   - Social media links
   - Newsletter signup form
   - Copyright notice
   - Multiple columns on desktop, stacked on mobile

4. Create src/components/layout/Navigation.astro:
   - Mobile navigation drawer
   - Smooth animation on open/close
   - Navigation links

Use Tailwind CSS for light theme styling with:
- White/neutral backgrounds
- Dark gray text (#374151)
- Sky blue accent (#0ea5e9)
```

### Prompt 2.2: Trek Display Components

```
@agent

Generate trek listing and card components:

1. Create src/components/trek/TrekCard.astro:
   - Props: trek object (name, slug, difficulty, duration, price, image, rating)
   - Display: Image, name, difficulty badge, duration, elevation, price
   - Hover: subtle shadow, slight scale transform
   - Link to: /treks/{slug}
   - Responsive: full-width on mobile, constrained width on desktop
   - Light theme: white card, colored difficulty badge

2. Create src/components/trek/TrekGrid.astro:
   - Props: treks array, layout type (grid/list)
   - Desktop: 3 columns
   - Tablet: 2 columns
   - Mobile: 1 column
   - Gap: 1.5rem
   - Show loading skeleton if no treks
   - Show empty state if no results

3. Create src/components/trek/TrekFilters.astro (React client component):
   - Props: onFilterChange callback, initialFilters
   - Difficulty filter: checkboxes for easy, moderate, hard, expert
   - Price range: slider from ₹5,000 to ₹50,000
   - Season: checkboxes for available seasons
   - Duration: input field (days)
   - Apply and Reset buttons
   - Mobile: collapsible drawer with backdrop
   - State management with useState hooks

4. Create src/components/trek/TrekDetail.astro:
   - Props: trek object with full data
   - Sections:
     a. Hero image section
     b. Trek summary (name, rating, reviews count)
     c. Key details grid (difficulty, duration, elevation, distance, price)
     d. Description section
     e. Itinerary (expandable days)
     f. What's included / What to bring (lists)
     g. Image gallery with lightbox
     h. Guide information card
     i. Reviews section
     j. Booking form CTA
   - Light theme styling throughout

5. Create src/components/trek/TrekItinerary.astro:
   - Props: itinerary days array
   - Vertical timeline layout
   - Each day: circle number, title, description
   - Expandable on mobile
   - Show elevation gain and distance per day
   - Color accent on current/next day

Include all TypeScript props interfaces and ensure light theme compliance.
```

### Prompt 2.3: Booking & Review Forms

```
@agent

Generate interactive form components (React):

1. Create src/components/booking/BookingForm.astro:
   - Wrapper that hydrates client component
   - Client component: BookingForm.client.tsx

2. Create src/components/booking/BookingForm.client.tsx (React):
   - Form fields:
     a. Full name (required, min 2 chars)
     b. Email (required, email validation)
     c. Phone (required, phone format)
     d. Group size (required, min 1, max 50)
     e. Preferred date (date picker)
     f. Special requirements (textarea, optional)
   - Validation: client-side with error messages below fields
   - Submit button: disabled while loading
   - Loading state: spinner on button
   - Success: confirmation modal with booking reference number
   - Error: error toast with retry option
   - API: POST to /api/bookings (Astro API route)

3. Create src/components/review/ReviewForm.astro (React client):
   - Fields:
     a. Star rating (1-5, clickable stars)
     b. Review title (required)
     c. Review comment (required, min 20 chars, max 1000)
     d. Your name (required)
     e. Email (optional)
   - Validation with error messages
   - Character counter for comment field
   - Submit button with loading state
   - Success: "Review submitted" message, refresh reviews section
   - API: POST to /api/treks/{trek_id}/reviews

4. Create src/components/forms/ContactForm.astro (React client):
   - Fields:
     a. Name
     b. Email
     c. Subject
     d. Message
   - Validation
   - Success: "Thank you" message with newsletter opt-in
   - Error handling

Use react-hook-form or Zod for validation.
Include accessible labels, error handling, loading states.
Light theme styling.
```

### Prompt 2.4: Testimonials & Guide Components

```
@agent

Generate testimonial and guide components:

1. Create src/components/testimonial/TestimonialCard.astro:
   - Props: name, image, role, testimonial text, trek_name (optional)
   - Display: profile image, quote, author name, role
   - Quote styling: italic, larger text
   - Light theme: subtle border, rounded corners
   - Hover: shadow effect

2. Create src/components/testimonial/TestimonialCarousel.astro:
   - Props: testimonials array
   - Carousel/slider: shows 3 at a time on desktop, 1 on mobile
   - Navigation: prev/next buttons
   - Auto-play with pause on hover
   - Pagination dots
   - Smooth transitions

3. Create src/components/guide/GuideCard.astro:
   - Props: guide object (name, bio, image, experience, specializations, rating)
   - Display: profile image, name, experience years, specializations tags
   - Rating stars (if available)
   - Brief bio
   - Light theme styling

4. Create src/components/guide/GuideGrid.astro:
   - Props: guides array
   - Grid layout: 3 columns desktop, 2 tablet, 1 mobile
   - Display GuideCards in grid

All components use light theme with:
- White/light backgrounds
- Dark text (#374151)
- Sky blue accents (#0ea5e9)
- Smooth hover transitions
```

---

## 🔧 PROMPT SET 3: BACKEND ENDPOINTS

### Prompt 3.1: Trek Endpoints

```
@agent

Generate FastAPI trek management endpoints in app/api/v1/endpoints/treks.py:

1. GET /treks
   - Query params: skip (default 0), limit (default 10, max 100), difficulty, max_price, season
   - Response: List[TrekResponse] with pagination info
   - Filtering logic: apply all filters with AND operator
   - Sorting: by rating descending (popular first)
   - Proper docstring and example response

2. GET /treks/{trek_id}
   - Response: Full TrekResponse with itinerary, images, reviews, guide
   - Error: 404 if not found
   - Docstring

3. GET /treks/slug/{slug}
   - Alternative endpoint to get by slug
   - Response: TrekResponse
   - Error: 404 if not found

4. GET /treks/popular
   - Query: limit (default 6)
   - Response: Top rated treks
   - Sorted by rating descending

5. GET /treks/{trek_id}/itinerary
   - Response: List of itinerary days in order

6. GET /treks/{trek_id}/images
   - Response: List of trek images ordered by display_order

Use:
- Pydantic models for request/response
- Async/await
- Proper error handling
- Database session dependency
- Logging
- Comprehensive docstrings

All responses paginated where applicable.
```

### Prompt 3.2: Review & Rating Endpoints

```
@agent

Generate review management endpoints in app/api/v1/endpoints/reviews.py:

1. GET /reviews
   - Query: trek_id (optional), skip, limit, sort_by (date, rating)
   - Response: List[ReviewResponse]
   - Filter by trek if trek_id provided
   - Paginated

2. GET /reviews/{review_id}
   - Response: ReviewResponse
   - Error: 404 if not found

3. POST /reviews
   - Body: ReviewCreate (trek_id, user_name, email, rating, title, comment)
   - Validation: rating 1-5, comment min 20 chars
   - Response: ReviewResponse (201 Created)
   - Update trek rating after review added
   - Logging

4. PUT /reviews/{review_id}
   - Update review (only by author or admin)
   - Body: ReviewUpdate (optional fields)

5. DELETE /reviews/{review_id}
   - Delete review
   - Update trek rating
   - 204 No Content response

6. POST /reviews/{review_id}/helpful
   - Increment helpful count for review

All endpoints:
- Async/await
- Proper validation
- Error handling
- Logging
- Docstrings
```

### Prompt 3.3: Booking Endpoints

```
@agent

Generate booking management endpoints in app/api/v1/endpoints/bookings.py:

1. POST /bookings
   - Body: BookingCreate (trek_id, name, email, phone, group_size, preferred_date, special_requirements)
   - Validation: all required fields, email format, phone format, group_size > 0
   - Response: BookingResponse (201 Created)
   - Send confirmation email
   - Store in database
   - Return booking reference number

2. GET /bookings
   - Admin only (check JWT)
   - Query: status, trek_id, skip, limit, sort_by
   - Response: List[BookingResponse] paginated

3. GET /bookings/{booking_id}
   - Get specific booking
   - Response: BookingResponse
   - Error: 404 if not found

4. PUT /bookings/{booking_id}
   - Update booking status (pending, confirmed, cancelled)
   - Body: {status: str}
   - Send status update email
   - Response: BookingResponse

5. DELETE /bookings/{booking_id}
   - Admin only
   - Delete booking
   - 204 No Content

All endpoints:
- Async/await
- Email service integration
- Logging
- Error handling
- Proper validation
```

### Prompt 3.4: Search Endpoint

```
@agent

Generate search endpoint in app/api/v1/endpoints/search.py:

1. GET /search
   - Query: q (search term, min 2 chars), type (trek, guide, blog)
   - Response: SearchResults { treks: [], guides: [], blogs: [] }
   - Search in: trek name, description, guide name, blog title

2. Full-text search implementation:
   - Use PostgreSQL full-text search (FTS)
   - Search vectors on trek.name, trek.description
   - Rank results by relevance
   - Limit: 20 results per type
   - Paginated

3. Search filtering:
   - By type: trek_search, guide_search, blog_search
   - Return only published items
   - Order by relevance

Endpoint:
- Async/await
- Input validation
- Error handling
- Logging
- Docstring with examples
```

---

## 🗄️ PROMPT SET 4: DATABASE & MODELS

### Prompt 4.1: Database Models

```
@agent

Generate SQLAlchemy ORM models in app/db/models/:

1. Trek model (trek.py):
   - Fields: id, name, slug, difficulty, duration, price, season, elevation, distance, description, guide_id
   - Fields: rating, review_count, created_at, updated_at
   - Relationships: itineraries (cascade delete), images, reviews, bookings, guide
   - Indexes: difficulty, price, guide_id, created_at
   - Unique: slug

2. Itinerary model (itinerary.py):
   - Fields: id, trek_id, day, title, description, elevation_gain, distance
   - Relationship: trek
   - Unique: trek_id + day
   - Cascade delete with trek

3. TrekImage model (image.py):
   - Fields: id, trek_id, url, caption, display_order, created_at
   - Relationship: trek
   - Cascade delete with trek

4. Review model (review.py):
   - Fields: id, trek_id, user_name, email, rating, title, comment, helpful_count, created_at
   - Relationship: trek
   - Cascade delete with trek
   - Index: trek_id, created_at

5. Booking model (booking.py):
   - Fields: id, trek_id, name, email, phone, group_size, preferred_date, special_requirements, status, created_at, updated_at
   - Relationship: trek
   - Index: email, trek_id, status
   - Status enum: pending, confirmed, cancelled

6. Guide model (guide.py):
   - Fields: id, name, bio, experience_years, profile_image_url, specializations, rating, created_at
   - Relationship: treks

All models:
- Inherit from declarative_base()
- Proper datetime fields with defaults
- Type hints
- __tablename__ defined
- Indexes for frequent queries
- Cascade settings where appropriate
```

### Prompt 4.2: Pydantic Models

```
@agent

Generate Pydantic models in app/models/:

1. trek.py:
   - TrekBase (common fields)
   - TrekCreate (for POST)
   - TrekUpdate (for PUT, all optional)
   - TrekResponse (for GET responses)
   - Fields with validators: slug lowercase, difficulty enum, price > 0

2. review.py:
   - ReviewBase
   - ReviewCreate (trek_id, user_name, email, rating 1-5, title, comment)
   - ReviewResponse
   - Validators: rating range, comment length

3. booking.py:
   - BookingBase
   - BookingCreate (trek_id, name, email, phone, group_size, preferred_date, special_requirements)
   - BookingResponse
   - Validators: email, phone format, group_size > 0

4. guide.py:
   - GuideBase
   - GuideResponse

5. Common models:
   - PaginationParams (skip, limit)
   - ListResponse[T] (items, total, skip, limit)

All models:
- Use Pydantic v2 syntax
- Include docstrings
- Config: from_attributes = True
- Validators where needed
- Field descriptions
```

---

## 📋 PROMPT SET 5: SERVICES & UTILITIES

### Prompt 5.1: Trek Service

```
@agent

Generate trek service in app/services/trek_service.py:

1. TrekService class:

   a. get_filtered_treks(db, skip, limit, difficulty, max_price, season):
      - Build query with optional filters
      - Use AND logic for filters
      - Return paginated results

   b. get_popular_treks(db, limit):
      - Get top-rated treks
      - Sorted by rating descending

   c. search_treks(db, query, limit):
      - Full-text search using trek name and description
      - Return top matches

   d. get_trek_with_reviews(db, trek_id):
      - Get trek with all related reviews
      - Calculate average rating

   e. update_trek_rating(db, trek_id):
      - Recalculate average rating from reviews
      - Update trek.rating field

All methods:
- Async/await
- Type hints
- Error handling
- Logging
```

### Prompt 5.2: Email Service

```
@agent

Generate email service in app/services/email_service.py:

1. EmailService class:

   a. send_booking_confirmation(booking_data):
      - Email to customer
      - Include: booking reference, trek name, group size, date
      - Use HTML template

   b. send_admin_notification(booking_data):
      - Email to admin
      - New booking notification

   c. send_review_confirmation(review_data):
      - Thank you email for review

   d. send_newsletter_signup(email):
      - Confirmation email for newsletter

Email templates:
- HTML formatted
- Professional design
- Light theme colors
- Responsive layout

Configuration:
- SMTP setup from environment variables
- From address configured
- Async email sending if possible
```

---

## 🚀 QUICK START COMMAND SEQUENCE

**Use these commands in order when starting a new feature:**

```bash
# 1. Start Cursor and ask for folder structure
@agent Generate complete folder structure...

# 2. Initialize Astro frontend
cd frontend
npm install
npm run dev

# 3. Initialize FastAPI backend (new terminal)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 4. Ask Cursor for specific components
@agent Generate TrekCard component with props...

# 5. Ask Cursor for API endpoints
@agent Generate GET /treks endpoint...

# 6. Test endpoints
curl http://localhost:8000/api/v1/treks

# 7. Build and test locally
npm run build
pytest tests/

# 8. Deploy
git push  # Triggers CI/CD
```

---

## 📊 PERFORMANCE OPTIMIZATION PROMPTS

### Prompt: Image Optimization

```
@agent

Generate image optimization strategy:

1. Use astro:assets for optimization
2. Implement lazy loading
3. Generate WebP formats
4. Set appropriate sizes:
   - Trek list images: 400x300
   - Trek detail hero: 1200x600
   - Gallery: 800x600
5. Quality: 80 for jpg, 75 for webp
6. Include responsive srcset for desktop/mobile
```

### Prompt: Caching Strategy

```
@agent

Generate caching strategy for FastAPI:

1. Cache treks list (1 hour TTL)
2. Cache individual trek (2 hours TTL)
3. Cache popular treks (6 hours TTL)
4. Invalidate cache on updates
5. Use Redis for distributed caching
6. Cache key: {resource}:{id}:{filters_hash}
```

---

## 🔐 SECURITY PROMPTS

### Prompt: Security Implementation

```
@agent

Implement security best practices:

1. CORS: Only allow frontend domain
2. CSRF protection on forms
3. Rate limiting on contact/booking endpoints
4. Input validation with Pydantic
5. SQL injection prevention (use ORM)
6. XSS prevention: sanitize user input
7. JWT for admin endpoints
8. Environment variables for secrets
```

---

**Generated:** December 16, 2025
**For:** Global Events Travels + Cursor AI Development

