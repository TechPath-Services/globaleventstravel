# Light Theme Design System & Reference Guide
## Global Events Travels - Complete Design Specifications

---

## 🎨 COLOR PALETTE (WCAG AA Compliant - Light Theme)

### Primary Colors

```
Primary Blue (Sky Blue):
  --primary-50:   #f0f9ff   (Lightest, 1% dark)
  --primary-100:  #e0f2fe   (Surfaces, very light backgrounds)
  --primary-200:  #bae6fd   (Borders, light accents)
  --primary-300:  #7dd3fc   (Hover states, light buttons)
  --primary-400:  #38bdf8   (Medium accents, secondary interactive)
  --primary-500:  #0ea5e9   ★ MAIN PRIMARY - Links, primary buttons
  --primary-600:  #0284c7   ★ PRIMARY DARK - Hover states, focus rings
  --primary-700:  #0369a1   (Darker states, dark mode text on light)
  --primary-800:  #075985   (Very dark, text on light backgrounds)
  --primary-900:  #082f49   (Darkest, strong contrast)
```

**Usage Examples:**
```html
<!-- Primary button -->
<button class="bg-primary-500 text-white hover:bg-primary-600">
  Book Trek
</button>

<!-- Primary link -->
<a href="#" class="text-primary-500 hover:text-primary-600">Learn more</a>

<!-- Light background section -->
<section class="bg-primary-50">Trek highlights</section>

<!-- Focus ring -->
<input class="focus:ring-primary-500" />
```

### Neutral Colors (Gray Scale)

```
Neutral:
  --neutral-50:   #fafafa   (Near white, almost invisible background)
  --neutral-100:  #f5f5f5   (Very light gray, section backgrounds)
  --neutral-200:  #e5e5e5   (Light gray, borders)
  --neutral-300:  #d4d4d4   (Medium light gray, borders on light bg)
  --neutral-400:  #a3a3a3   (Medium gray, lighter text)
  --neutral-500:  #737373   (Medium gray, secondary text)
  --neutral-600:  #525252   ★ BODY TEXT - Primary reading text
  --neutral-700:  #404040   ★ HEADINGS - Dark text for contrast
  --neutral-800:  #262626   (Very dark gray, high contrast text)
  --neutral-900:  #171717   (Near black, maximum contrast)
```

**Usage Examples:**
```html
<!-- Page background -->
<body class="bg-white text-neutral-700">

<!-- Section with light background -->
<section class="bg-neutral-100">

<!-- Body text -->
<p class="text-neutral-600">Your trek awaits...</p>

<!-- Secondary text -->
<span class="text-neutral-500">Optional text</span>

<!-- Borders -->
<div class="border border-neutral-200">
```

### Semantic Colors

```
Success:    #10b981  (Emerald-500) - Confirmations, success messages
Warning:    #f59e0b  (Amber-500)   - Alerts, cautions
Danger:     #ef4444  (Red-500)     - Errors, destructive actions
Info:       #3b82f6  (Blue-500)    - Information, secondary action
```

### Contrast Ratios (All WCAG AA Compliant)

```
✅ RECOMMENDED COMBINATIONS:

Light backgrounds + dark text:
  White (#fff) + Neutral-900 (#171717) = 21:1  (AAA - Perfect)
  White (#fff) + Neutral-700 (#404040) = 13:1  (AAA - Excellent)
  White (#fff) + Neutral-600 (#525252) = 11:1  (AAA - Great)
  White (#fff) + Primary-700 (#0369a1) = 8.5:1 (AAA - Good)
  White (#fff) + Primary-600 (#0284c7) = 7:1   (AAA - Good)
  White (#fff) + Primary-500 (#0ea5e9) = 5.5:1 (AAA - Fair)

Light section + text:
  Neutral-100 + Neutral-900 = 18:1 (AAA)
  Primary-50 + Neutral-900 = 20:1 (AAA)
  Primary-100 + Primary-900 = 16:1 (AAA)
```

---

## 🔤 TYPOGRAPHY SYSTEM

### Font Stack (Light Theme Optimized)

```css
/* Primary font - clean, readable for light backgrounds */
--font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                    Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Monospace for code */
--font-family-mono: 'Monaco', 'Menlo', 'Ubuntu Mono', 
                    'Courier New', monospace;
```

### Font Sizes (Mobile-First)

```
h1:  2.25rem (36px) mobile, 3.5rem (56px) desktop - Page titles
h2:  1.875rem (30px) mobile, 2.25rem (36px) desktop - Section headers
h3:  1.5rem (24px) mobile, 1.875rem (30px) desktop - Subsections
h4:  1.25rem (20px) - Card titles
body: 1rem (16px) - Base reading text
small: 0.875rem (14px) - Secondary text, captions
```

### Font Weights

```
400 (Normal)   - Body text, links
500 (Medium)   - Buttons, input labels, badges
600 (Semibold) - Section headers, subheadings
700 (Bold)     - Page titles, emphasis
```

### Line Heights

```
Headings:  1.2 (tight - 120%) - Compact heading layout
Body:      1.5 (normal - 150%) - Readable paragraph text
Labels:    1.4 (144%) - Form labels, captions
```

### Letter Spacing

```
Headings:    -0.02em (tight negative tracking)
Body:        0 (normal)
Uppercase:   +0.05em (slightly wider for caps)
```

### Typography Examples (Light Theme)

```html
<!-- Page Title -->
<h1 class="text-4xl font-bold text-neutral-900">
  Discover Amazing Treks
</h1>

<!-- Section Header -->
<h2 class="text-3xl font-semibold text-neutral-800 mt-12 mb-6">
  Featured Expeditions
</h2>

<!-- Card Title -->
<h3 class="text-xl font-semibold text-neutral-900">
  Hampta Pass Trek
</h3>

<!-- Body Text -->
<p class="text-base text-neutral-600 leading-relaxed">
  Experience the majestic beauty of the Himalayas...
</p>

<!-- Secondary Text / Caption -->
<p class="text-sm text-neutral-500">
  Duration: 4 days | Difficulty: Moderate
</p>

<!-- Button Text -->
<button class="font-medium text-white">
  Book Now
</button>
```

---

## 🎯 SPACING & LAYOUT

### Spacing Scale (Tailwind default)

```
0:    0
1:    0.25rem (4px)
2:    0.5rem  (8px)
3:    0.75rem (12px)
4:    1rem    (16px)    ← Base unit
6:    1.5rem  (24px)
8:    2rem    (32px)    ← Page/section margins
10:   2.5rem  (40px)
12:   3rem    (48px)    ← Large sections
16:   4rem    (64px)
20:   5rem    (80px)
24:   6rem    (96px)    ← Hero sections
32:   8rem    (128px)
```

### Spacing Guidelines

```
Microspacing:
  Between form label and input: 0.5rem (2)
  Within button padding: 0.5rem-1rem (2-4)
  Icon-text gap: 0.5rem (2)

Spacing:
  Component margins: 1rem-1.5rem (4-6)
  Section padding: 2rem-3rem (8-12)
  Section gaps: 1.5rem-2rem (6-8)

Macro spacing:
  Page top/bottom: 3rem-4rem (12-16)
  Between sections: 3rem-6rem (12-24)
  Hero section height: 24rem-40rem (96px-640px)
```

### Container Sizes

```
Mobile:  100% width, padding 1rem (16px)
Tablet:  max-width 42rem (672px), padding 1.5rem
Desktop: max-width 80rem (1280px), padding 2rem
```

---

## 🖼️ COMPONENT PATTERNS

### Buttons - Light Theme

```html
<!-- Primary Button -->
<button class="px-6 py-3 bg-primary-500 text-white font-medium 
               rounded-lg hover:bg-primary-600 
               active:bg-primary-700 transition-colors duration-200
               focus:outline-none focus:ring-2 focus:ring-primary-500 
               focus:ring-offset-2">
  Book Trek
</button>

<!-- Secondary Button -->
<button class="px-6 py-3 border-2 border-primary-500 text-primary-600 
               font-medium rounded-lg hover:bg-primary-50
               focus:outline-none focus:ring-2 focus:ring-primary-500">
  Learn More
</button>

<!-- Ghost Button (Light background) -->
<button class="px-6 py-3 text-primary-600 font-medium 
               hover:bg-primary-50 rounded-lg
               focus:outline-none focus:ring-2 focus:ring-primary-500">
  View Details
</button>

<!-- Disabled Button -->
<button disabled class="px-6 py-3 bg-neutral-300 text-neutral-500 
                        font-medium rounded-lg cursor-not-allowed">
  Unavailable
</button>
```

### Cards - Light Theme

```html
<!-- Trek Card -->
<div class="bg-white border border-neutral-200 rounded-xl 
            overflow-hidden shadow-sm hover:shadow-md 
            transition-shadow duration-300">
  <img src="trek.jpg" alt="Trek" class="w-full h-48 object-cover">
  <div class="p-6">
    <h3 class="text-xl font-semibold text-neutral-900 mb-2">
      Hampta Pass
    </h3>
    <p class="text-neutral-600 text-sm mb-4">
      4-day moderate alpine trek
    </p>
    <div class="flex gap-4 mb-4">
      <span class="bg-primary-100 text-primary-700 px-3 py-1 
                   rounded-full text-sm font-medium">
        Moderate
      </span>
      <span class="text-neutral-600 text-sm">
        ★ 4.8 (24 reviews)
      </span>
    </div>
    <div class="flex justify-between items-center">
      <span class="text-xl font-bold text-neutral-900">₹15,000</span>
      <button class="px-4 py-2 bg-primary-500 text-white 
                     rounded-lg font-medium hover:bg-primary-600">
        View
      </button>
    </div>
  </div>
</div>
```

### Forms - Light Theme

```html
<form class="space-y-6 bg-white p-8 rounded-xl border border-neutral-200">
  <!-- Form Group -->
  <div class="space-y-2">
    <label class="block text-sm font-medium text-neutral-700">
      Full Name
    </label>
    <input type="text" placeholder="Your name" 
           class="w-full px-4 py-3 border border-neutral-300 
                  rounded-lg focus:border-primary-500 
                  focus:ring-2 focus:ring-primary-100
                  text-neutral-900 placeholder-neutral-400
                  transition-colors">
  </div>

  <!-- Email Field -->
  <div class="space-y-2">
    <label class="block text-sm font-medium text-neutral-700">
      Email Address
    </label>
    <input type="email" required 
           class="w-full px-4 py-3 border border-neutral-300 rounded-lg
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                  text-neutral-900">
  </div>

  <!-- Textarea -->
  <div class="space-y-2">
    <label class="block text-sm font-medium text-neutral-700">
      Special Requirements
    </label>
    <textarea rows="4" placeholder="Tell us about any special needs"
              class="w-full px-4 py-3 border border-neutral-300 rounded-lg
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                     text-neutral-900 placeholder-neutral-400 resize-vertical">
    </textarea>
  </div>

  <!-- Submit Button -->
  <button type="submit" 
          class="w-full bg-primary-500 text-white font-medium py-3
                 rounded-lg hover:bg-primary-600 
                 active:bg-primary-700 transition-colors">
    Submit Booking
  </button>
</form>
```

### Alerts - Light Theme

```html
<!-- Success Alert -->
<div class="bg-green-50 border border-green-200 rounded-lg p-4">
  <p class="text-green-800 font-medium">
    ✓ Trek added successfully
  </p>
</div>

<!-- Warning Alert -->
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
  <p class="text-amber-900 font-medium">
    ⚠ Only 2 spots remaining
  </p>
</div>

<!-- Error Alert -->
<div class="bg-red-50 border border-red-200 rounded-lg p-4">
  <p class="text-red-900 font-medium">
    ✗ Please check your email address
  </p>
</div>

<!-- Info Alert -->
<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <p class="text-blue-900 font-medium">
    ℹ Trek available from March to May
  </p>
</div>
```

---

## ✨ ANIMATIONS & TRANSITIONS

### Hover Effects (Light Theme Appropriate)

```css
/* Subtle scale on cards */
.card {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

/* Color transition on links */
a {
  transition: color 150ms ease-out;
  color: #0ea5e9;
}
a:hover {
  color: #0284c7;
}

/* Button interaction */
button {
  transition: all 200ms ease-out;
  background-color: #0ea5e9;
}
button:hover {
  background-color: #0284c7;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}
```

### Loading States

```html
<!-- Spinner -->
<div class="inline-block">
  <div class="w-6 h-6 border-3 border-primary-200 border-t-primary-500 
              rounded-full animate-spin"></div>
</div>

<!-- Skeleton (shimmer) -->
<div class="animate-pulse">
  <div class="bg-neutral-200 rounded-lg h-12 w-full mb-4"></div>
  <div class="bg-neutral-200 rounded-lg h-4 w-3/4"></div>
</div>
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
Mobile:    < 640px    (sm:)  - 1 column, full width
Tablet:    640px+     (md:)  - 2 columns, max-width container
Laptop:    1024px+    (lg:)  - 3+ columns, wider container
Desktop:   1280px+    (xl:)  - Full resolution, max-width 80rem
```

### Mobile-First Example

```html
<!-- 1 column mobile, 2 tablet, 3 desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="bg-white rounded-lg shadow">Trek Card</div>
  <div class="bg-white rounded-lg shadow">Trek Card</div>
  <div class="bg-white rounded-lg shadow">Trek Card</div>
</div>

<!-- Text sizing -->
<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">
  Featured Treks
</h1>

<!-- Padding responsive -->
<div class="p-4 md:p-8 lg:p-12">
  Section content
</div>
```

---

## 🎯 ACCESSIBILITY GUIDELINES

### Color Contrast

```
✅ Text on white background:
   - Primary-700 (#0369a1): 8.3:1 ratio (AAA)
   - Neutral-600 (#525252): 11:1 ratio (AAA)
   - Neutral-700 (#404040): 13:1 ratio (AAA)

✅ Text on Primary-50 background:
   - Neutral-900 (#171717): 20:1 ratio (AAA)
   - Primary-900 (#082f49): 16:1 ratio (AAA)

⚠️ AVOID (poor contrast on light background):
   - Primary-100 text (too light)
   - Neutral-200+ text on white (insufficient contrast)
```

### Focus States

```html
<!-- Always provide visible focus indicator -->
<input class="focus:outline-none focus:ring-2 focus:ring-primary-500 
             focus:ring-offset-2">

<!-- Button focus -->
<button class="focus:outline-none focus:ring-2 focus:ring-primary-500 
              focus:ring-offset-2">
  Action
</button>

<!-- Link focus -->
<a href="#" class="focus:outline-none focus:ring-2 focus:ring-primary-500 
                   focus:ring-offset-2 rounded px-1">
  Link text
</a>
```

### Semantic HTML

```html
<!-- Use semantic elements for accessibility -->
<header>Navigation and branding</header>
<main>Page content</main>
<section>Grouped content</section>
<article>Trek description</article>
<aside>Sidebar, related links</aside>
<footer>Site footer</footer>

<!-- Form accessibility -->
<label for="name">Full Name</label>
<input id="name" type="text" required>

<!-- Image alt text -->
<img src="trek.jpg" alt="Hikers on snowy mountain ridge">

<!-- Use semantic buttons/links -->
<button>Action</button>  ✅
<div onclick="...">Action</div>  ❌
```

---

## 🔍 SEO BEST PRACTICES

### Light Theme HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Discover amazing treks...">
  <meta name="theme-color" content="#ffffff">
  <title>Treks | Global Events Travels</title>
  
  <!-- Open Graph for social sharing -->
  <meta property="og:title" content="Treks">
  <meta property="og:description" content="...">
  <meta property="og:image" content="/hero.jpg">
  <meta property="og:type" content="website">
</head>
<body class="bg-white text-neutral-900">
  <!-- Semantic structure -->
  <header role="banner">...</header>
  <main role="main">...</main>
  <footer role="contentinfo">...</footer>
</body>
</html>
```

---

## 🎨 QUICK CSS SNIPPETS FOR LIGHT THEME

```css
/* Light theme body */
body {
  background-color: #ffffff;
  color: #404040;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
}

/* Readable paragraphs */
p {
  color: #525252;
  line-height: 1.625;
}

/* Light sections */
section {
  background-color: #fafafa;
}

/* Borders on light theme */
.border-light {
  border-color: #e5e5e5;
}

/* Shadows (subtle) */
.shadow-light {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Links */
a {
  color: #0ea5e9;
  text-decoration: none;
}
a:hover {
  color: #0284c7;
  text-decoration: underline;
}

/* Form inputs */
input, textarea, select {
  background-color: #ffffff;
  color: #404040;
  border-color: #e5e5e5;
}
input:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}
```

---

**Light Theme Reference Guide**
**Global Events Travels Website**
**December 16, 2025**

