# Global Events Travels - Astro + FastAPI Development Guide
## Enterprise-Grade Architecture for Trekking Platform

**Project:** Global Events Travels Website Rebuild
**Tech Stack:** Astro 5 + FastAPI + Tailwind CSS + mysql
**Theme:** Modern Light Theme
**Target:** High-performance, SEO-optimized trekking platform
**Date:** December 16, 2025

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Folder Structure](#folder-structure)
4. [Frontend Best Practices (Astro)](#frontend-best-practices-astro)
5. [Backend Best Practices (FastAPI)](#backend-best-practices-fastapi)
6. [Database Design](#database-design)
7. [Light Theme Design System](#light-theme-design-system)
8. [Development Workflow](#development-workflow)
9. [Cursor AI Prompts](#cursor-ai-prompts)
10. [Deployment & Performance](#deployment--performance)

---

## 🎯 PROJECT OVERVIEW

### Vision
Build a modern, high-performing trekking platform that showcases Global Events Travels' expeditions with:
- **Dynamic trek catalog** with detailed itineraries
- **Real-time booking system** with form validation
- **User testimonials & reviews** management
- **Advanced filtering** (difficulty, duration, price, season)
- **Image gallery** with lazy loading
- **SEO optimization** for trek discoveries
- **Light theme** for excellent readability
- **Mobile-first responsive design**

### Key Features to Implement
✅ Trek listing with detailed views
✅ Filtering & search functionality
✅ Booking/inquiry form
✅ User reviews & ratings
✅ Guide management
✅ Seasonal availability
✅ Price comparison
✅ Image galleries (multiple per trek)
✅ Testimonials carousel
✅ Contact forms
✅ Newsletter signup
✅ Admin dashboard

---

## 🛠️ TECH STACK & ARCHITECTURE

### Frontend Stack
```
Astro 5.x          - Meta-framework for static + dynamic content
React Components   - For interactive elements (optional)
Tailwind CSS 4     - Utility-first CSS with light theme
TypeScript         - Type-safe development
Astro Integrations - Optimized images, SEO, sitemap
```

### Backend Stack
```
FastAPI 0.109+     - Async Python web framework
Pydantic 2.x       - Data validation & serialization
SQLAlchemy 2.x     - ORM with async support
PostgreSQL 15+     - Relational database
Alembic            - Database migrations
Redis              - Caching layer (optional)
```

### Development Tools
```
Cursor AI          - Code generation & refactoring
VS Code            - IDE
Git/GitHub         - Version control
Docker             - Containerization
Pytest             - Testing framework
```

### Deployment
```
Frontend: Vercel, Netlify, or Cloudflare Pages
Backend: Railway, Render, or AWS/GCP
Database: Managed PostgreSQL (PlanetScale, Supabase, or AWS RDS)
CDN: Cloudflare or AWS CloudFront
```

---

## 📁 FOLDER STRUCTURE

### Complete Project Layout

```
global-events-travels/
├── frontend/                          # Astro frontend app
│   ├── src/
│   │   ├── pages/                    # Route pages (file-based routing)
│   │   │   ├── index.astro           # Homepage
│   │   │   ├── treks/
│   │   │   │   ├── index.astro       # Trek listing page
│   │   │   │   └── [slug].astro      # Dynamic trek detail page
│   │   │   ├── about.astro           # About page
│   │   │   ├── contact.astro         # Contact page
│   │   │   ├── guides.astro          # Guides page
│   │   │   ├── testimonials.astro    # Testimonials page
│   │   │   ├── blog/
│   │   │   │   ├── index.astro       # Blog listing
│   │   │   │   └── [slug].astro      # Blog post detail
│   │   │   └── api/
│   │   │       ├── treks.ts          # API route: GET treks with filters
│   │   │       ├── trek/[id].ts      # API route: GET single trek
│   │   │       ├── search.ts         # API route: Trek search
│   │   │       ├── testimonials.ts   # API route: GET testimonials
│   │   │       ├── reviews.ts        # API route: POST/GET reviews
│   │   │       ├── bookings.ts       # API route: POST booking inquiry
│   │   │       └── contact.ts        # API route: POST contact form
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.astro      # Navigation header
│   │   │   │   ├── Footer.astro      # Footer with links
│   │   │   │   ├── Navigation.astro  # Mobile nav
│   │   │   │   └── Sidebar.astro     # (if needed)
│   │   │   │
│   │   │   ├── trek/
│   │   │   │   ├── TrekCard.astro    # Trek card component
│   │   │   │   ├── TrekGrid.astro    # Trek grid/list layout
│   │   │   │   ├── TrekDetail.astro  # Full trek detail view
│   │   │   │   ├── TrekGallery.astro # Image gallery with lightbox
│   │   │   │   ├── TrekItinerary.astro # Day-by-day itinerary
│   │   │   │   ├── PriceTable.astro  # Season/group price table
│   │   │   │   └── TrekFilters.astro # Filter sidebar/component
│   │   │   │
│   │   │   ├── booking/
│   │   │   │   ├── BookingForm.astro # Main booking form
│   │   │   │   ├── BookingModal.astro # Modal variant
│   │   │   │   └── FormSteps.astro   # Multi-step form
│   │   │   │
│   │   │   ├── review/
│   │   │   │   ├── ReviewCard.astro  # Single review card
│   │   │   │   ├── ReviewSection.astro # Reviews section
│   │   │   │   ├── RatingStars.astro # Star rating component
│   │   │   │   └── ReviewForm.astro  # Submit review form
│   │   │   │
│   │   │   ├── testimonial/
│   │   │   │   ├── TestimonialCard.astro
│   │   │   │   └── TestimonialCarousel.astro
│   │   │   │
│   │   │   ├── guide/
│   │   │   │   ├── GuideCard.astro
│   │   │   │   └── GuideGrid.astro
│   │   │   │
│   │   │   ├── forms/
│   │   │   │   ├── ContactForm.astro # Generic contact form
│   │   │   │   ├── NewsletterForm.astro
│   │   │   │   └── SearchBar.astro   # Trek search component
│   │   │   │
│   │   │   ├── common/
│   │   │   │   ├── Button.astro      # Reusable button
│   │   │   │   ├── Badge.astro       # Tags/badges
│   │   │   │   ├── Card.astro        # Card container
│   │   │   │   ├── Modal.astro       # Modal dialog
│   │   │   │   ├── Spinner.astro     # Loading spinner
│   │   │   │   ├── Alert.astro       # Alert/notification
│   │   │   │   ├── Pagination.astro  # Pagination controls
│   │   │   │   └── Breadcrumb.astro  # Breadcrumb nav
│   │   │   │
│   │   │   ├── hero/
│   │   │   │   ├── HeroHome.astro    # Homepage hero
│   │   │   │   └── HeroPage.astro    # Page hero sections
│   │   │   │
│   │   │   └── sections/
│   │   │       ├── FeaturedTreks.astro
│   │   │       ├── Statistics.astro
│   │   │       ├── WhyChooseUs.astro
│   │   │       ├── SafetyFeatures.astro
│   │   │       ├── TeamHighlights.astro
│   │   │       └── CTA.astro
│   │   │
│   │   ├── layouts/
│   │   │   ├── MainLayout.astro      # Base layout wrapper
│   │   │   ├── TrekLayout.astro      # Trek-specific layout
│   │   │   └── BlogLayout.astro      # Blog post layout
│   │   │
│   │   ├── content/
│   │   │   ├── treks/                # Markdown trek data (optional)
│   │   │   │   ├── hampta-pass.md
│   │   │   │   ├── sar-pass.md
│   │   │   │   └── ...
│   │   │   ├── guides/               # Guide bios
│   │   │   └── blog/                 # Blog posts
│   │   │
│   │   ├── styles/
│   │   │   ├── global.css            # Global styles
│   │   │   ├── variables.css         # CSS custom properties (colors, spacing)
│   │   │   ├── typography.css        # Font definitions
│   │   │   └── animations.css        # Reusable animations
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                # Fetch wrapper for backend API
│   │   │   ├── constants.ts          # App constants (API URL, pagination, etc)
│   │   │   ├── filters.ts            # Filter logic (difficulty, price, etc)
│   │   │   ├── formatting.ts         # Date, currency, text formatting
│   │   │   ├── validation.ts         # Form validation utilities
│   │   │   ├── seo.ts                # SEO helpers
│   │   │   └── types.ts              # TypeScript type definitions
│   │   │
│   │   ├── utils/
│   │   │   ├── image.ts              # Image optimization utilities
│   │   │   ├── cache.ts              # Caching strategies
│   │   │   └── analytics.ts          # Analytics tracking
│   │   │
│   │   └── env.d.ts                  # Environment type definitions
│   │
│   ├── public/
│   │   ├── images/
│   │   │   ├── hero/                 # Hero images
│   │   │   ├── treks/                # Trek images (organized by trek)
│   │   │   │   ├── hampta-pass/
│   │   │   │   ├── sar-pass/
│   │   │   │   └── ...
│   │   │   ├── guides/               # Guide profile images
│   │   │   ├── testimonials/         # User profile images
│   │   │   ├── icons/                # SVG icons
│   │   │   └── logos/                # Brand logos
│   │   │
│   │   ├── videos/
│   │   │   ├── hero-intro.mp4        # Hero video
│   │   │   └── trek-preview/         # Trek preview videos
│   │   │
│   │   ├── documents/
│   │   │   └── trek-brochures/       # PDF downloads
│   │   │
│   │   ├── fonts/
│   │   │   └── custom-fonts/         # Custom typefaces
│   │   │
│   │   └── robots.txt, sitemap.xml
│   │
│   ├── astro.config.mjs              # Astro configuration
│   ├── tailwind.config.js            # Tailwind CSS config (light theme)
│   ├── tsconfig.json                 # TypeScript config
│   ├── package.json
│   └── .env.example
│
├── backend/                           # FastAPI backend app
│   ├── app/
│   │   ├── main.py                   # FastAPI app initialization
│   │   ├── __init__.py
│   │   │
│   │   ├── api/                      # API route handlers
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py         # Main router
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── treks.py      # Trek endpoints
│   │   │   │   │   ├── reviews.py    # Review endpoints
│   │   │   │   │   ├── bookings.py   # Booking endpoints
│   │   │   │   │   ├── guides.py     # Guide endpoints
│   │   │   │   │   ├── testimonials.py
│   │   │   │   │   ├── search.py     # Search endpoint
│   │   │   │   │   ├── contact.py    # Contact form
│   │   │   │   │   └── auth.py       # Authentication
│   │   │   │   └── dependencies.py   # Dependency injection
│   │   │   │
│   │   │   ├── health.py             # Health check endpoint
│   │   │   └── middleware.py         # Custom middleware
│   │   │
│   │   ├── models/                   # Pydantic models (request/response schemas)
│   │   │   ├── __init__.py
│   │   │   ├── trek.py               # Trek models
│   │   │   ├── booking.py            # Booking models
│   │   │   ├── review.py             # Review models
│   │   │   ├── guide.py              # Guide models
│   │   │   ├── contact.py            # Contact form model
│   │   │   ├── testimonial.py        # Testimonial model
│   │   │   ├── user.py               # User model
│   │   │   └── common.py             # Common/shared models
│   │   │
│   │   ├── db/                       # Database layer
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # Base SQLAlchemy classes
│   │   │   ├── session.py            # Database session management
│   │   │   │
│   │   │   └── models/               # SQLAlchemy ORM models
│   │   │       ├── __init__.py
│   │   │       ├── trek.py           # Trek table model
│   │   │       ├── booking.py        # Booking table model
│   │   │       ├── review.py         # Review table model
│   │   │       ├── guide.py          # Guide table model
│   │   │       ├── testimonial.py    # Testimonial table model
│   │   │       ├── user.py           # User table model
│   │   │       ├── contact.py        # Contact inquiry model
│   │   │       └── image.py          # Trek images table
│   │   │
│   │   ├── crud/                     # CRUD operations
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # Base CRUD class
│   │   │   ├── trek.py               # Trek CRUD
│   │   │   ├── booking.py            # Booking CRUD
│   │   │   ├── review.py             # Review CRUD
│   │   │   ├── guide.py              # Guide CRUD
│   │   │   ├── testimonial.py        # Testimonial CRUD
│   │   │   ├── user.py               # User CRUD
│   │   │   ├── contact.py            # Contact CRUD
│   │   │   └── image.py              # Image CRUD
│   │   │
│   │   ├── services/                 # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── trek_service.py       # Trek filtering, search, recommendations
│   │   │   ├── booking_service.py    # Booking logic, notifications
│   │   │   ├── review_service.py     # Review moderation, ratings
│   │   │   ├── search_service.py     # Full-text search, pagination
│   │   │   ├── email_service.py      # Email notifications
│   │   │   ├── validation_service.py # Data validation
│   │   │   └── cache_service.py      # Caching logic
│   │   │
│   │   ├── core/                     # Core configuration
│   │   │   ├── __init__.py
│   │   │   ├── config.py             # Environment configuration
│   │   │   ├── security.py           # JWT, OAuth, security utilities
│   │   │   ├── exceptions.py         # Custom exceptions
│   │   │   └── logger.py             # Logging configuration
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── __init__.py
│   │   │   ├── email.py              # Email template functions
│   │   │   ├── date.py               # Date utilities
│   │   │   ├── currency.py           # Currency formatting
│   │   │   ├── constants.py          # App constants
│   │   │   └── validators.py         # Validation helpers
│   │   │
│   │   └── __init__.py
│   │
│   ├── migrations/                   # Alembic database migrations
│   │   ├── alembic.ini
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       ├── 001_initial_schema.py
│   │       ├── 002_add_trek_details.py
│   │       └── ...
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py               # Pytest fixtures
│   │   ├── test_api/
│   │   │   ├── test_treks.py
│   │   │   ├── test_bookings.py
│   │   │   ├── test_reviews.py
│   │   │   └── test_search.py
│   │   ├── test_services/
│   │   │   ├── test_trek_service.py
│   │   │   ├── test_booking_service.py
│   │   │   └── test_search_service.py
│   │   └── test_db/
│   │       ├── test_models.py
│   │       └── test_crud.py
│   │
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Environment variables
│   ├── main.py                       # Entry point
│   └── docker/
│       └── Dockerfile                # Docker container definition
│
├── docker-compose.yml                # Multi-container orchestration
├── .github/
│   └── workflows/
│       ├── frontend-deploy.yml       # Frontend CI/CD
│       └── backend-deploy.yml        # Backend CI/CD
│
├── docs/                             # Documentation
│   ├── API.md                        # API documentation
│   ├── DATABASE.md                   # Database schema docs
│   ├── DEPLOYMENT.md                 # Deployment guide
│   ├── ARCHITECTURE.md               # Architecture overview
│   └── CONTRIBUTING.md               # Contributing guidelines
│
└── README.md                         # Project overview
```

---

## 🎨 FRONTEND BEST PRACTICES (ASTRO)

### 1. File Organization Principles

**Rule 1: Feature-Based Organization**
```
✅ GOOD:
src/components/trek/
  - TrekCard.astro
  - TrekDetail.astro
  - TrekGallery.astro
  - TrekFilters.astro

❌ AVOID:
src/components/
  - TrekCard.astro
  - TrekDetail.astro
  - ReviewCard.astro
  - GuideCard.astro  (all mixed)
```

**Rule 2: Shared vs Feature Components**
```
src/components/
├── common/        # Truly reusable (Button, Badge, Card)
├── layout/        # Page structure (Header, Footer)
├── trek/          # Trek-specific (TrekCard, TrekGallery)
├── booking/       # Booking-specific (BookingForm)
└── forms/         # Form utilities (ContactForm, SearchBar)
```

**Rule 3: Type Definitions**
```typescript
// src/lib/types.ts - CENTRALIZED
export interface Trek {
  id: number;
  name: string;
  slug: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  duration: number; // days
  price: number;
  season: string[];
  elevation: number;
  distance: number; // km
  description: string;
  itinerary: ItineraryDay[];
  images: TrekImage[];
  reviews: Review[];
  guide_id: number;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  elevation_gain: number;
  distance: number;
}

export interface TrekImage {
  id: number;
  trek_id: number;
  url: string;
  caption?: string;
  order: number;
}

export interface Review {
  id: number;
  trek_id: number;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
}

export interface Booking {
  id: number;
  trek_id: number;
  name: string;
  email: string;
  phone: string;
  group_size: number;
  preferred_date: string;
  special_requirements?: string;
  created_at: string;
}
```

### 2. Astro Component Best Practices

**Pattern 1: Island Architecture (Interactive Components)**
```astro
---
// src/components/trek/BookingForm.astro
import BookingFormClient from './BookingForm.client';

interface Props {
  trek_id: number;
}

const { trek_id } = Astro.props;
---

<section class="py-12">
  <h2 class="text-3xl font-bold mb-8">Book This Trek</h2>
  
  <!-- Only this island is interactive (hydrated) -->
  <BookingFormClient client:load trek_id={trek_id} />
</section>
```

**Pattern 2: Passing Data from Layout to Components**
```astro
---
// src/layouts/MainLayout.astro
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title} | Global Events Travels</title>
    {description && <meta name="description" content={description} />}
  </head>
  <body>
    <Header />
    <main class="min-h-screen">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

**Pattern 3: API Routes for Dynamic Data**
```typescript
// src/pages/api/treks.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const difficulty = url.searchParams.get('difficulty');
  const maxPrice = url.searchParams.get('maxPrice');
  
  const params = new URLSearchParams();
  if (difficulty) params.append('difficulty', difficulty);
  if (maxPrice) params.append('max_price', maxPrice);
  
  const response = await fetch(
    `${import.meta.env.API_BASE_URL}/api/v1/treks?${params}`,
    { headers: { 'Accept': 'application/json' } }
  );
  
  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), {
      status: 500,
    });
  }
  
  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### 3. Astro Configuration for Performance

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import image from '@astrojs/image';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://globaleventstravels.com',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    image({
      serviceEntryPoint: '@astrojs/image/sharp',
    }),
    sitemap(),
    react({ include: ['**/components/**/*.client.*'] }),
  ],
  output: 'hybrid', // Mix static + dynamic routes
  vite: {
    define: {
      __API_BASE_URL__: JSON.stringify(
        process.env.API_BASE_URL || 'http://localhost:8000'
      ),
    },
  },
  experimental: {
    assets: true, // Enhanced image optimization
  },
});
```

### 4. CSS/Tailwind Strategy (Light Theme)

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light theme primary colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0ea5e9',  // Sky blue primary
          600: '#0284c7',
          700: '#0369a1',
          900: '#082f49',
        },
        // Neutral/gray for light theme
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          500: '#737373',
          700: '#404040',
          900: '#171717',
        },
        // Accent colors
        accent: {
          green: '#10b981',
          orange: '#f97316',
          red: '#ef4444',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#1f2937',
            a: { color: '#0ea5e9', '&:hover': { color: '#0284c7' } },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

### 5. Image Optimization Strategy

```astro
---
// src/components/trek/TrekGallery.astro
import { Image } from 'astro:assets';

interface Props {
  images: Array<{
    url: string;
    caption?: string;
  }>;
  alt: string;
}

const { images, alt } = Astro.props;
---

<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  {images.map((image) => (
    <Image
      src={image.url}
      alt={image.caption || alt}
      width={600}
      height={400}
      loading="lazy"
      format="webp"
      quality={80}
      class="rounded-lg shadow-md"
    />
  ))}
</div>
```

### 6. SEO Best Practices

```astro
---
// src/lib/seo.ts
interface SEOMetaTags {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export function generateMetaTags(seo: SEOMetaTags) {
  return {
    title: `${seo.title} | Global Events Travels`,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: {
      title: seo.title,
      description: seo.description,
      image: seo.ogImage,
      type: seo.ogType || 'website',
    },
  };
}
```

---

## 🔧 BACKEND BEST PRACTICES (FASTAPI)

### 1. Project Structure Principles

**Rule 1: Separation of Concerns**
```
✅ Routes handle HTTP → Pydantic models handle validation → 
Services handle business logic → CRUD handles database

❌ Avoid putting database queries directly in routes
```

**Rule 2: Async-First Development**
```python
# ✅ GOOD - async/await for I/O bound operations
@router.get("/treks/{trek_id}")
async def get_trek(trek_id: int, db: AsyncSession = Depends(get_db)):
    trek = await crud.trek.get(db, id=trek_id)
    return trek

# ❌ AVOID - blocking operations
@router.get("/treks/{trek_id}")
def get_trek(trek_id: int, db: Session = Depends(get_db)):
    trek = crud.trek.get(db, id=trek_id)  # Blocking!
    return trek
```

### 2. FastAPI Project Setup

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import logging

from app.api.v1.router import router as api_router
from app.core.config import settings
from app.core.logger import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Global Events Travels API",
    description="REST API for trekking platform",
    version="1.0.0",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

# Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}

# Include API routes
app.include_router(api_router, prefix="/api/v1")

logger.info("FastAPI app initialized")
```

### 3. Router Organization

```python
# app/api/v1/router.py
from fastapi import APIRouter

from app.api.v1.endpoints import (
    treks,
    bookings,
    reviews,
    guides,
    search,
    contact,
)

router = APIRouter()

# Include endpoint routers
router.include_router(treks.router, prefix="/treks", tags=["Treks"])
router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
router.include_router(guides.router, prefix="/guides", tags=["Guides"])
router.include_router(search.router, prefix="/search", tags=["Search"])
router.include_router(contact.router, prefix="/contact", tags=["Contact"])
```

### 4. Endpoint Pattern (Clean Code)

```python
# app/api/v1/endpoints/treks.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.trek import trek_crud
from app.models.trek import TrekCreate, TrekResponse
from app.services.trek_service import TrekService
from app.db.session import get_db

router = APIRouter()
trek_service = TrekService()

@router.get("", response_model=list[TrekResponse])
async def list_treks(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    difficulty: str | None = Query(None),
    max_price: float | None = Query(None),
    season: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    List all treks with optional filtering.
    
    Query Parameters:
    - skip: Pagination offset (default: 0)
    - limit: Items per page (default: 10, max: 100)
    - difficulty: Filter by difficulty (easy, moderate, hard, expert)
    - max_price: Filter by maximum price
    - season: Filter by season (e.g., 'monsoon', 'winter')
    """
    filters = {
        "difficulty": difficulty,
        "max_price": max_price,
        "season": season,
    }
    
    treks = await trek_service.get_filtered_treks(
        db, skip=skip, limit=limit, **filters
    )
    return treks

@router.get("/{trek_id}", response_model=TrekResponse)
async def get_trek(
    trek_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a single trek by ID with full details."""
    trek = await trek_crud.get(db, id=trek_id)
    if not trek:
        raise HTTPException(status_code=404, detail="Trek not found")
    return trek

@router.post("", response_model=TrekResponse, status_code=201)
async def create_trek(
    trek_in: TrekCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin),
):
    """Create a new trek (admin only)."""
    trek = await trek_crud.create(db, obj_in=trek_in)
    return trek
```

### 5. Pydantic Models (Request/Response)

```python
# app/models/trek.py
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import List, Optional

class ItineraryDayBase(BaseModel):
    day: int = Field(..., ge=1)
    title: str = Field(..., min_length=3, max_length=200)
    description: str
    elevation_gain: int = Field(..., ge=0)
    distance: float = Field(..., gt=0)

class TrekImageBase(BaseModel):
    url: str
    caption: Optional[str] = None
    order: int = 0

class TrekBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    slug: str = Field(..., min_length=3, max_length=200)
    difficulty: str = Field(..., regex="^(easy|moderate|hard|expert)$")
    duration: int = Field(..., ge=1)
    price: float = Field(..., gt=0)
    season: List[str]
    elevation: int = Field(..., ge=0)
    distance: float = Field(..., gt=0)
    description: str
    
    @validator("slug")
    def slug_lowercase(cls, v):
        return v.lower().replace(" ", "-")

class TrekCreate(TrekBase):
    guide_id: int
    itinerary: List[ItineraryDayBase]
    images: List[TrekImageBase] = []

class TrekUpdate(BaseModel):
    name: Optional[str] = None
    difficulty: Optional[str] = None
    price: Optional[float] = None
    season: Optional[List[str]] = None

class TrekResponse(TrekBase):
    id: int
    guide_id: int
    itinerary: List[ItineraryDayBase]
    images: List[TrekImageBase]
    rating: float = 0
    review_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### 6. Service Layer (Business Logic)

```python
# app/services/trek_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional

from app.crud.trek import trek_crud
from app.db.models.trek import Trek

class TrekService:
    """Service for trek-related business logic."""
    
    async def get_filtered_treks(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 10,
        difficulty: Optional[str] = None,
        max_price: Optional[float] = None,
        season: Optional[str] = None,
    ) -> List[Trek]:
        """Get treks with advanced filtering."""
        query = select(Trek)
        
        filters = []
        if difficulty:
            filters.append(Trek.difficulty == difficulty)
        if max_price:
            filters.append(Trek.price <= max_price)
        if season:
            filters.append(Trek.season.contains([season]))
        
        if filters:
            query = query.where(and_(*filters))
        
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_popular_treks(
        self, db: AsyncSession, limit: int = 6
    ) -> List[Trek]:
        """Get treks sorted by review rating."""
        query = select(Trek).order_by(Trek.rating.desc()).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()
```

### 7. Database Models (SQLAlchemy)

```python
# app/db/models/trek.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base import Base

class Trek(Base):
    __tablename__ = "treks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    difficulty = Column(String(20), nullable=False, index=True)
    duration = Column(Integer, nullable=False)  # days
    price = Column(Float, nullable=False, index=True)
    season = Column(ARRAY(String), nullable=False)
    elevation = Column(Integer)  # meters
    distance = Column(Float)  # kilometers
    description = Column(Text)
    guide_id = Column(Integer, nullable=False)
    rating = Column(Float, default=0)
    review_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    itineraries = relationship("Itinerary", back_populates="trek", cascade="all, delete-orphan")
    images = relationship("TrekImage", back_populates="trek", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="trek", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="trek")
```

---

## 🗄️ DATABASE DESIGN

### Trek-Related Tables

```sql
-- Treks Table
CREATE TABLE treks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    duration INT NOT NULL,  -- days
    price FLOAT NOT NULL,
    season TEXT[] NOT NULL,  -- ['monsoon', 'winter']
    elevation INT,
    distance FLOAT,
    description TEXT,
    guide_id INT NOT NULL REFERENCES guides(id),
    rating FLOAT DEFAULT 0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Itinerary Days
CREATE TABLE itineraries (
    id SERIAL PRIMARY KEY,
    trek_id INT NOT NULL REFERENCES treks(id) ON DELETE CASCADE,
    day INT NOT NULL,
    title VARCHAR(200),
    description TEXT,
    elevation_gain INT,
    distance FLOAT,
    UNIQUE(trek_id, day)
);

-- Trek Images
CREATE TABLE trek_images (
    id SERIAL PRIMARY KEY,
    trek_id INT NOT NULL REFERENCES treks(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    caption TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Guides Table
CREATE TABLE guides (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    bio TEXT,
    experience_years INT,
    profile_image_url VARCHAR(500),
    specializations TEXT[],
    rating FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews/Ratings
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    trek_id INT NOT NULL REFERENCES treks(id) ON DELETE CASCADE,
    user_name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings/Inquiries
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    trek_id INT NOT NULL REFERENCES treks(id),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    group_size INT NOT NULL,
    preferred_date DATE,
    special_requirements TEXT,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, confirmed, cancelled
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Contact Inquiries
CREATE TABLE contact_inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',  -- new, read, replied
    created_at TIMESTAMP DEFAULT NOW()
);

-- Testimonials
CREATE TABLE testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(200),
    image_url VARCHAR(500),
    testimonial TEXT NOT NULL,
    trek_id INT REFERENCES treks(id),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_treks_difficulty ON treks(difficulty);
CREATE INDEX idx_treks_price ON treks(price);
CREATE INDEX idx_treks_guide ON treks(guide_id);
CREATE INDEX idx_reviews_trek ON reviews(trek_id);
CREATE INDEX idx_bookings_trek ON bookings(trek_id);
CREATE INDEX idx_bookings_email ON bookings(email);
```

---

## 🎨 LIGHT THEME DESIGN SYSTEM

### Color Palette

```css
/* Primary Colors - Light theme optimized */
--primary-50: #f0f9ff;   /* Lightest background */
--primary-100: #e0f2fe;
--primary-200: #bae6fd;
--primary-300: #7dd3fc;
--primary-400: #38bdf8;
--primary-500: #0ea5e9;  /* Main primary */
--primary-600: #0284c7;
--primary-700: #0369a1;
--primary-800: #075985;
--primary-900: #082f49;  /* Darkest text on light backgrounds */

/* Neutral Colors - for light theme */
--neutral-50: #fafafa;   /* Almost white */
--neutral-100: #f5f5f5;  /* Light gray background */
--neutral-200: #e5e5e5;
--neutral-300: #d4d4d4;
--neutral-400: #a3a3a3;
--neutral-500: #737373;
--neutral-600: #525252;
--neutral-700: #404040;
--neutral-800: #262626;
--neutral-900: #171717;  /* Near black for text */

/* Accent Colors */
--success: #10b981;
--warning: #f59e0b;
--danger: #ef4444;
--info: #3b82f6;
```

### Typography (Light Theme)

```css
body {
  color: #374151;  /* Dark gray text on light background */
  background-color: #ffffff;  /* White background */
}

h1 { color: #111827; font-weight: 700; }
h2 { color: #1f2937; font-weight: 600; }
h3 { color: #374151; font-weight: 600; }

a { color: #0ea5e9; }  /* Sky blue links */
a:hover { color: #0284c7; }

code { 
  background: #f3f4f6;  /* Light gray background
  color: #374151;
}
```

### Contrast Ratios (WCAG AA Compliant)

```
✅ Dark gray (#374151) on white = 9:1 (AAA)
✅ Primary blue (#0ea5e9) on white = 5.5:1 (AAA)
✅ Neutral-600 (#525252) on white = 8.5:1 (AAA)
```

---

## 🚀 DEVELOPMENT WORKFLOW

### Step 1: Local Setup

```bash
# Clone and setup
git clone https://github.com/yourusername/global-events-travels.git
cd global-events-travels

# Frontend
cd frontend
npm install
npm run dev  # http://localhost:3000

# Backend (in new terminal)
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000
```

### Step 2: Database Setup

```bash
# Create PostgreSQL database
createdb global_events_travels

# Run migrations
cd backend
alembic upgrade head
```

### Step 3: Environment Variables

```bash
# frontend/.env.local
PUBLIC_API_BASE_URL=http://localhost:8000

# backend/.env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/global_events_travels
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=["http://localhost:3000"]
DEBUG=true
```

### Step 4: Code Generation with Cursor

**Use these prompts for component generation...**

---

## 🔌 CURSOR AI PROMPTS

### Prompt 1: Generate All Trek-Related Components

```
@agent

Generate complete Astro components for the trek listing and detail pages:

1. TrekCard.astro - Card component displaying:
   - Trek image (lazy loaded)
   - Name, difficulty badge
   - Duration, elevation, distance
   - Price with rupee symbol
   - Star rating and review count
   - 2-line hover effect with subtle shadow

2. TrekGrid.astro - Grid layout:
   - 3 columns on desktop, 2 on tablet, 1 on mobile
   - Spacing: gap-6
   - Show featured treks first (featured: true)

3. TrekFilters.astro - Sidebar filters:
   - Difficulty (Easy, Moderate, Hard, Expert)
   - Price range slider (₹5,000 - ₹50,000)
   - Season checkboxes
   - Duration input
   - Apply/Reset buttons
   - Mobile: collapsible drawer

4. TrekDetail.astro - Full trek page:
   - Hero image section
   - Trek info (name, rating, reviews)
   - Details grid (difficulty, duration, elevation, distance, price)
   - Description section
   - Day-by-day itinerary (expandable)
   - Image gallery with lightbox
   - What's included / What to bring
   - Reviews section
   - Guide info card
   - Booking form CTA at bottom

5. TrekItinerary.astro - Itinerary display:
   - Vertical timeline
   - Day number circle
   - Title and description
   - Distance and elevation gain
   - Expandable content on mobile

Design:
- Light theme with sky blue accents (#0ea5e9)
- White backgrounds, dark gray text (#374151)
- Smooth transitions and hover states
- Responsive and accessible
- TypeScript props with full typing

Include all necessary props, state management, and form handling.
```

### Prompt 2: Generate FastAPI Backend Endpoints

```
@agent

Create complete FastAPI endpoints for trek management:

1. GET /treks - List all treks
   - Query params: skip, limit, difficulty, max_price, season
   - Response: TrekResponse list with pagination

2. GET /treks/{trek_id} - Get single trek
   - Include: itinerary, images, reviews, guide info
   - Response: Full TrekResponse

3. GET /treks/search - Search treks
   - Query: q (search term)
   - Search in: name, description
   - Return paginated results

4. GET /treks/popular - Get featured/popular treks
   - Sorted by rating
   - Limit: 6 treks

5. GET /treks/{trek_id}/reviews - Get trek reviews
   - Paginated
   - Sorted by date (newest first)

6. POST /treks/{trek_id}/reviews - Submit review
   - Require: rating, user_name, comment
   - Validate: rating 1-5
   - Return created review

7. GET /guides/{guide_id} - Get guide info
   - Include: bio, experience, profile image, specializations

8. POST /bookings - Create booking inquiry
   - Require: trek_id, name, email, phone, group_size
   - Optional: preferred_date, special_requirements
   - Send confirmation email
   - Return booking reference

Use:
- Pydantic models for validation
- Async/await for all I/O operations
- Database session dependency injection
- Proper error handling and status codes
- Logging for all operations
- Response documentation in docstrings
```

### Prompt 3: Generate Database Models

```
@agent

Create SQLAlchemy ORM models for trek platform:

1. Trek model
   - Fields: id, name, slug, difficulty, duration, price, season, elevation, distance, description, guide_id, rating, review_count, timestamps
   - Relationships: itineraries, images, reviews, bookings, guide
   - Indexes: difficulty, price, guide_id, created_at

2. Itinerary model
   - Fields: id, trek_id, day, title, description, elevation_gain, distance
   - Relationship: trek

3. TrekImage model
   - Fields: id, trek_id, url, caption, order
   - Relationship: trek

4. Review model
   - Fields: id, trek_id, user_name, email, rating, title, comment, helpful_count, created_at
   - Relationship: trek

5. Booking model
   - Fields: id, trek_id, name, email, phone, group_size, preferred_date, special_requirements, status, timestamps
   - Relationship: trek

6. Guide model
   - Fields: id, name, bio, experience_years, profile_image_url, specializations, rating
   - Relationship: treks

All models:
- Inherit from Base
- Have proper timestamps (created_at, updated_at)
- Include appropriate indexes
- Use proper constraints
- Include relationships with cascading deletes where needed
```

### Prompt 4: Generate Contact & Booking Forms

```
@agent

Create Astro form components with validation:

1. BookingForm.astro (React client component)
   - Fields: name, email, phone, group_size, preferred_date, special_requirements
   - Validation: email format, phone format, group_size > 0
   - Submit to: POST /api/bookings
   - Success: Show confirmation with booking reference
   - Error: Show error message with retry
   - Loading state while submitting

2. ContactForm.astro (React client component)
   - Fields: name, email, subject, message
   - Validation: email, message length
   - Submit to: POST /api/contact
   - Success: Thank you message, newsletter opt-in
   - Error handling

3. ReviewForm.astro
   - Fields: rating (1-5 stars), title, comment, user name
   - Star rating picker
   - Character count for comment
   - Submit to: POST /api/treks/{trek_id}/reviews
   - After submit: Refresh reviews section

4. NewsletterForm.astro
   - Email field only
   - Submit to: POST /api/newsletter
   - Success: "Check your email" message

All forms:
- Light theme design
- Accessible labels and error messages
- Loading spinners during submission
- CSRF protection (if applicable)
- Clear success/error states
- Mobile-responsive
```

---

## 📊 DEPLOYMENT & PERFORMANCE

### Frontend Deployment Checklist

```
Pre-deployment:
☐ Run `npm run build` - verify successful build
☐ Check Lighthouse score > 90
☐ Test on mobile devices
☐ Verify SEO metadata
☐ Check image optimization
☐ Test forms end-to-end
☐ Verify API calls to production backend

Deployment to Vercel:
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

Performance targets:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- Lighthouse score: > 90
```

### Backend Deployment Checklist

```
Pre-deployment:
☐ Run tests: `pytest tests/`
☐ Check code quality: `black`, `flake8`, `mypy`
☐ Run migrations: `alembic upgrade head`
☐ Check environment variables
☐ Verify database backups
☐ Test API endpoints with production data

Docker deployment:
1. Build image: `docker build -t get-api:latest .`
2. Push to registry: `docker push yourusername/get-api:latest`
3. Deploy to server: `docker-compose up -d`

Production checklist:
☐ Disable Swagger docs (DEBUG=false)
☐ Use PostgreSQL (not SQLite)
☐ Enable CORS only for frontend domain
☐ Setup logging and monitoring
☐ Setup error tracking (Sentry)
☐ Setup uptime monitoring
☐ Configure automated backups
```

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: global_events_travels
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@postgres:5432/global_events_travels
      SECRET_KEY: ${SECRET_KEY}
      CORS_ORIGINS: ${CORS_ORIGINS}
      DEBUG: "false"
    depends_on:
      - postgres
    ports:
      - "8000:8000"
    command: uvicorn app.main:app --host 0.0.0.0

  frontend:
    build: ./frontend
    environment:
      PUBLIC_API_BASE_URL: ${API_BASE_URL}
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 📚 CODING STANDARDS & GUIDELINES

### Python Conventions (Backend)

```python
# File naming: snake_case
trek_service.py  # ✅
TrekService.py   # ❌

# Import organization
import os
import sys
from typing import Optional, List

from sqlalchemy import select
from fastapi import APIRouter, Depends

from app.crud.trek import trek_crud
from app.models.trek import TrekResponse

# Function naming: snake_case
async def get_trek_by_slug(db: AsyncSession, slug: str):
    pass

# Class naming: PascalCase
class TrekService:
    pass

# Constants: UPPER_SNAKE_CASE
MAX_TREK_PRICE = 100000
DEFAULT_PAGE_SIZE = 10
```

### TypeScript/Astro Conventions (Frontend)

```typescript
// File naming: PascalCase for components
TrekCard.astro    // ✅
trekCard.astro    // ❌

trek_service.ts   // ✅ for utility/service files

// Interface naming
interface Trek { }          // ✅
interface TrekProps { }     // For component props
type TrekDifficulty = ...   // For types

// Variable naming: camelCase
const trekList = [];
let currentPage = 0;

// Function naming: camelCase or verb prefix
const getTrekById = () => { }
const handleFormSubmit = () => { }
const formatPrice = () => { }
```

---

## 🎯 NEXT STEPS

1. **Week 1:** Setup project structure, configure Astro + FastAPI, setup database
2. **Week 2:** Build core components (TrekCard, TrekDetail, Filters)
3. **Week 3:** Implement API endpoints and CRUD operations
4. **Week 4:** Build forms (Booking, Contact, Review)
5. **Week 5:** SEO, performance optimization, testing
6. **Week 6:** Deploy frontend and backend
7. **Week 7:** Monitor, fix issues, gather feedback

---

**Created:** December 16, 2025
**For:** Global Events Travels
**Tech Stack:** Astro 5 + FastAPI + mysql
**Status:** Enterprise-Grade Ready

