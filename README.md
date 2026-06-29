# EVER LAB — Longevity Center Website

> Static RTL Hebrew website for EVER LAB, Israel's first dedicated longevity & functional wellness center (Herzliya). Vanilla HTML/CSS/JS — no build step, no framework. Designed to integrate with the existing WooCommerce shop at `ever-lab.co/product/*`.

**Live target:** `https://ever-lab.co`
**Current state:** static prototype, ready for WordPress migration.

---

## 📑 Table of Contents

1. [Quick Start](#-quick-start)
2. [Tech Stack & Constraints](#-tech-stack--constraints)
3. [File Structure](#-file-structure)
4. [Pages](#-pages)
5. [Design System](#-design-system)
6. [Brand Voice Rules](#-brand-voice-rules-important)
7. [Interactive Components](#-interactive-components)
8. [SEO & Structured Data](#-seo--structured-data)
9. [WooCommerce Integration](#-woocommerce-integration)
10. [WordPress Migration — 3 Approaches](#-wordpress-migration--3-approaches)
11. [Things NOT to Break](#-things-not-to-break)
12. [Common Tasks](#-common-tasks)
13. [Migration Checklist](#-migration-checklist)

---

## 🚀 Quick Start

No build step required. Open `index.html` in a browser, or serve locally:

```bash
# Using Python
python3 -m http.server 8000
# or Node
npx serve
```

Visit `http://localhost:8000`.

---

## 🛠 Tech Stack & Constraints

- **HTML5** with `dir="rtl" lang="he"` on `<html>`
- **Vanilla CSS** — all inline in `<style>` blocks at top of each HTML file. No external stylesheet, no preprocessor.
- **Vanilla JS** — small IIFE blocks at bottom of each HTML file. No bundler, no framework, no jQuery.
- **No build step.** Direct browser execution.
- **Fonts:** Google Fonts (Frank Ruhl Libre, Heebo, Cormorant Garamond, Space Mono) — loaded via `<link>` in `<head>`.
- **Images:** all in `/img/`, served as relative paths.

**Why this stack?** Maximum portability — drops directly into any WordPress theme, Vercel, or static hosting with zero config.

---

## 📁 File Structure

```
ever-lab-website/
├── index.html              # Homepage (~8100 lines — hero, method, bio-age test, plan, FAQ, contact)
├── experiences.html        # Shop page (~2200 lines — 10 product cards + modals)
├── accessibility.html      # Accessibility statement (Israeli regulation 35)
├── sitemap.xml             # 3 URLs for SEO
├── robots.txt              # Allows all crawlers + explicit AI bots (GPTBot, ClaudeBot, etc.)
├── llms.txt                # Markdown overview for AI search engines (emerging standard)
├── img/                    # All images (JPG/PNG)
│   ├── EVERLAB_LOGO.png
│   ├── hero.jpg, gym.jpg, recover.jpg, ...
│   └── ... (16 files total)
└── README.md               # This file
```

> Note: `index.v1-journey-architecture.html` is an old archived version, can be deleted.

---

## 📄 Pages

### `index.html` — Homepage

**Sections (in order):**
1. **Hero** — Hero image with `EVER LAB` logo, headlines "הדרך שלך ללונג'ביטי" + tagline
2. **`#step-map`** — "השיטה שלנו" — chapter intro + horizontal **journey-line** (3 steps: assessment → program → re-measurement) with scroll-driven progressive reveal + biometric data rain background
3. **`#step-measure`** — Bio Age Test section with sample report visual (the "53" card + side stats) + body text + expand button
4. **`#measure-expand`** — Expandable detail panel with 3 measurement categories (composition / strength / neuro-motor)
5. **`#step-plan`** — "התוכנית" — 2 plan cards (Training + Recovery)
6. **`#vital-expand` and `#recover-expand`** — Expandable panels for training tech + recovery treatments
7. **`#faq`** — FAQ accordion (8 questions) with FAQPage Schema.org JSON-LD
8. **`#contact`** — Closing CTA, contact info, WhatsApp link

**Floating UI:**
- **Fluid side nav** (`.fluid-nav`) — top-right hamburger, expands to 6 nav items with progress tracking via IntersectionObserver
- **WhatsApp FAB** (`.wa-float`) — bottom-right floating button with pre-filled message
- **Accessibility widget** (`.a11y-*`) — bottom-right toggle, opens panel with 10 controls (text size, contrast, motion reduction, etc.). Israeli accessibility law (תקנה 35) compliant.
- **Cookie consent banner** (`#cookie-banner`) — GDPR/Israeli law compliant with granular controls (necessary / functional / analytics / marketing). Stored in `localStorage` as `everlab_cookie_consent`.

### `experiences.html` — Shop

**Sections (in order):**
1. **Hero** — "The Ever Lab Longevity Experience" title
2. **À la carte (`#section-items`)** — 4 individual items in 4-col sage gradient cards
3. **Curated packages (`#section-packages`)** — 3 packages in 3-col cards
4. **EVER BEST** — 3 combined packages (workout + N recovery treatments)
5. **Closing** — Free consultation CTA via WhatsApp

**All 10 products use the unified `.cat-card` design** (sage gradient variants 1-4 + elegant SVG icons + 2 buttons: לפרטים opens modal, לרכישה links to WooCommerce).

### `accessibility.html` — Accessibility Statement

Standard Israeli accessibility statement per regulation 35. Contact: `reception@ever-lab.co`. **Don't translate or simplify** — it's legally required text in this exact form.

---

## 🎨 Design System

### Color Palette

CSS variables defined at top of each HTML file's `<style>` block:

```css
:root {
  --bg: #F4F0EB;          /* cream background */
  --paper: #FAF6F1;       /* paper/card background */
  --ink: #2C2C2C;         /* primary text */
  --sage-soft: #CDDFB7;   /* lightest sage */
  --sage: #8DAE92;        /* mid sage (brand primary) */
  --sage-deep: #6B8B70;   /* deep sage */
}
```

### Sage Gradient Variants (for `.cat-card`)

Used on product cards in `experiences.html`:

| Variant | Use | Gradient |
|---|---|---|
| `.cat-card-1` | Assessment, Discovery | `#C5D9AF → #98B585` (light sage) |
| `.cat-card-2` | Training, Experience, BEST 2 | `#A294B8 → #786A92` (muted dusty purple) |
| `.cat-card-3` | Recovery, BEST 3 | `#94A8A6 → #6F8B89` (cool slate-sage) |
| `.cat-card-4` | Body Comp, Escape, BEST 4 | `#6B8B70 → #4F6A56` (deep sage) |

### Typography

| Font | Family | Use | Weights used |
|---|---|---|---|
| **Frank Ruhl Libre** | Serif | Headings (h1, h2, h3, big numbers) | 300, 400 |
| **Heebo** | Sans-serif | Body text | 300, 500 |
| **Cormorant Garamond** | Serif (italic) | Accent text (rare — see brand rules) | 400 italic |
| **Space Mono** | Monospace | Labels, data markers, eyebrows | 400 |

**Only 2 weights per font** — keep this discipline.

---

## ✍️ Brand Voice Rules (IMPORTANT)

These rules are non-negotiable. Read carefully before editing copy.

| Rule | Why |
|---|---|
| **❌ Never use em-dashes (—) in body text** | User pet peeve. Use regular dashes (-) or break the sentence. |
| **❌ No emojis as icons** | Use SVG icons instead. Emojis look unprofessional on this brand. |
| **❌ No bolding in body paragraphs** | Looks shouty. Hierarchy via headings only. |
| **✅ "ברמת התא"** | Not "סלולרית" (mobile = cell phone in Hebrew, confusing) |
| **✅ Spelling: "לונג'ביטי"** | Consistent across the site. |
| **✅ Hebrew RTL currency** | Number first, then ₪. Write `550 ₪` not `₪ 550`. |
| **✅ Italic accents — minimal** | If using Cormorant italic for emphasis, use sparingly. Recently we removed italic from many headings — keep them clean serif. |

---

## ⚙️ Interactive Components

### Journey Line (`#step-map`)

Horizontal 3-station timeline in the "השיטה שלנו" section. Features:

- **Continuous sage line** spans across 3 dots (concentric circles)
- **Ruler-style tick marks** along the axis (CSS `repeating-linear-gradient` + `mask-image` to fade near stations)
- **Big serif numbers** (01/02/03) below each station
- **Progressive scroll-driven reveal:**
  - Initial state: only station 01 visible (line collapsed to scaleX(0))
  - At 25% scroll progress: `.jl-reveal-2` class added → line extends to scaleX(0.5), station 02 fades in
  - At 42% scroll progress: `.jl-reveal-3` class added → line completes to scaleX(1), station 03 fades in
  - Implementation: rAF-throttled scroll listener in `<script>` block before FAQ section
- **Mobile (≤720px)** rotates to vertical: scaleY instead of scaleX, origin top.
- **`prefers-reduced-motion`** shows everything immediately.

### Background "Data Rain" (`#step-map`)

10 biometric values (42.3 yrs, 7.4 ms, 38.6 %, 96 bpm, etc.) drift downward in Space Mono behind the journey-line. Mirrors the hero section's `.hero-data-float` aesthetic. Hidden on mobile.

### FAQ Accordion (`#faq`)

Uses native `<details>`/`<summary>` HTML5 elements. Sage `+` icon rotates to 45° (becoming `×`) when item opens. **8 questions** with FAQPage Schema.org JSON-LD for rich Google results. First item starts `<details open>`.

### Category Modals (`experiences.html`)

10 product-specific modals. Pattern:

```html
<div class="cat-modal" id="modal-X" aria-hidden="true" role="dialog" aria-modal="true">
  <div class="cat-modal-backdrop" data-modal-close></div>
  <div class="cat-modal-panel">
    <button class="cat-modal-close" data-modal-close>...</button>
    <div class="cat-modal-eyebrow">EN Label</div>
    <h3 class="cat-modal-title">Hebrew Title</h3>
    <p class="cat-modal-desc">Description...</p>
    <div class="cat-modal-section">
      <h4 class="cat-modal-section-title">מה כלול:</h4>
      <ul class="cat-modal-list">...</ul>
    </div>
    <div class="cat-modal-meta">...</div>
    <a class="cat-modal-cta" href="https://ever-lab.co/product/...">לרכישה</a>
  </div>
</div>
```

**Triggered by** any button with `data-modal-open="modal-X"`. **Closed by** any element with `data-modal-close`, ESC key, or backdrop click. Manages `aria-hidden`, focus, and `body.style.overflow = 'hidden'`. See `<script>` at end of `experiences.html`.

### Accessibility Widget

Persists preferences in `localStorage` (key: `everlab_a11y_prefs`). Controls:
- Text size (small / normal / large)
- Letter spacing
- Line height
- High contrast mode
- Inverted colors
- Greyscale
- Underline links
- Highlight headings
- Stop animations
- Reset to defaults

Applied as `body` classes (e.g., `a11y-large-text`, `a11y-invert`).

---

## 🔍 SEO & Structured Data

### Meta Tags (per page, in `<head>`)

- `<title>` + `<meta description>` + `<meta keywords>`
- `<meta robots>` (index, follow)
- Canonical URL
- Geo meta (Herzliya coordinates)
- **Open Graph** + **Twitter Card** — currently pointing to placeholder `https://ever-lab.co/img/hero.jpg`. **TODO:** create proper 1200×630 social share image.

### Schema.org JSON-LD

Inline `<script type="application/ld+json">` blocks in `<head>`:

- **`index.html`** has:
  - `Organization` + `LocalBusiness` + `HealthAndBeautyBusiness` schema with business info, address, phone, opening hours, services (4 services with prices)
  - `FAQPage` schema mirroring the on-page FAQ (8 questions)
- **`experiences.html`** has:
  - 10 `Product` schemas (one per product card)
  - `BreadcrumbList`
  - `CollectionPage`

### llms.txt

Markdown-formatted business overview at `/llms.txt`. New emerging standard for AI search engines (ChatGPT, Perplexity, Claude, etc.). Contains services, prices, packages, hours, contact, FAQs.

### robots.txt

Allows all crawlers. Explicitly welcomes AI bots: `GPTBot`, `ChatGPT-User`, `PerplexityBot`, `Google-Extended`, `ClaudeBot`, `anthropic-ai`, `Bytespider`, `Applebot-Extended`. References `sitemap.xml`.

---

## 🛒 WooCommerce Integration

Product URLs (already in HTML, point to existing WooCommerce shop at `ever-lab.co`):

| Product | URL slug |
|---|---|
| Body Composition | `/product/body-composition/` |
| Bio Age Test | `/product/bio-age-test/` |
| Trial Workout | `/product/trial-workout/` |
| Single Recovery | `/product/single-recovery/` |
| Longevity Discovery | `/product/longevity-discovery/` |
| Longevity Experience | `/product/longevity-experience/` |
| Longevity Escape (couples) | `/product/longevity-escape-for-two/` |
| EVER BEST 2 | `/product/ever-best-2/` |
| EVER BEST 3 | `/product/ever-best-3/` |
| EVER BEST 4 | `/product/ever-best-4/` |

> **Verify these slugs match the actual WC product slugs after migration.** If not, search-and-replace.

---

## 🔄 WordPress Migration — 3 Approaches

### 🥇 Custom Page Template (Recommended)

**Idea:** Create a custom PHP page template in the active theme (or child theme) that outputs the HTML file directly.

**Steps:**
1. Create `wp-content/themes/<theme>/page-everlab-home.php`:
   ```php
   <?php /* Template Name: EVER LAB Home (Custom) */ ?>
   <?php echo file_get_contents( get_stylesheet_directory() . '/everlab/index.html' ); ?>
   ```
2. Place `index.html` in `wp-content/themes/<theme>/everlab/`
3. Update image paths from `img/` to `/wp-content/uploads/everlab/img/` (or place `img/` at WP root)
4. Repeat for `experiences.html` + `accessibility.html`
5. In WP Admin → Pages → assign templates → set "EVER LAB Home" as static homepage

**Pros:**
- 100% design fidelity — all animations, gradients, scroll-driven reveals preserved
- Fast (no plugin overhead)
- Easy to maintain
- WooCommerce continues to work as-is

**Cons:**
- Future text edits require code editing (not WP-Admin UI)

### 🥈 Block Editor / Elementor with Custom CSS+JS

**Idea:** Break the HTML into Gutenberg blocks (or Elementor sections), register the custom CSS/JS in the theme's `functions.php`.

**Pros:** Editable from WP-Admin.

**Cons:**
- Complex animations (journey-line scroll reveal, data rain, modals) require careful re-implementation as block-level scripts
- Custom CSS gets fragmented across blocks
- Risk of breaking design fidelity

### 🥉 Headless (Static Frontend + WordPress API)

**Idea:** Deploy static HTML to Vercel/Netlify. WordPress is only used for WooCommerce backend.

**Pros:** Best performance, full design control.

**Cons:**
- Two systems to manage
- Domain setup: marketing site on `ever-lab.co`, shop on `shop.ever-lab.co`
- Need to update product URLs in HTML

---

## ⛔ Things NOT to Break

When migrating, **preserve these or the site loses critical functionality:**

1. **`dir="rtl" lang="he"`** on `<html>` element — Hebrew breaks without it
2. **Font preconnect** in `<head>`:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   ```
3. **All `<script type="application/ld+json">`** blocks — these are SEO gold
4. **Image paths** — currently `img/...` (relative). Update consistently if moving images.
5. **Anchor IDs:**
   - `#hero`, `#step-map`, `#step-measure`, `#step-plan`, `#faq`, `#contact` (in `index.html`)
   - `#section-items`, `#section-packages` (in `experiences.html`)
   - Modal IDs: `#modal-body-comp`, `#modal-bio-age`, `#modal-trial-workout`, `#modal-single-recovery`, `#modal-discovery`, `#modal-experience`, `#modal-escape`, `#modal-best-2`, `#modal-best-3`, `#modal-best-4`
6. **`@media (prefers-reduced-motion: reduce)`** rules — accessibility requirement
7. **Cookie consent localStorage key:** `everlab_cookie_consent`
8. **Accessibility prefs localStorage key:** `everlab_a11y_prefs`
9. **WhatsApp pre-filled message URLs** — these are URL-encoded Hebrew. Don't re-encode.

---

## 🔧 Common Tasks

### Adding a new product card to `experiences.html`

1. Pick a `cat-card-N` variant (1-4) based on category fit
2. Copy a `<article class="cat-card cat-card-N">` block, update content:
   - SVG icon
   - Number/label/title/desc
   - Modal target (`data-modal-open="modal-NEW"`)
   - Buy link (`href="https://ever-lab.co/product/NEW/"`)
3. Add a new `<div class="cat-modal" id="modal-NEW">` block before `</main>`
4. Add a corresponding `Product` schema in the JSON-LD

### Changing copy in a gift voucher / modal

Modals are in `experiences.html`. Search for `id="modal-X"` to find the right one. Edit the `<p class="cat-modal-desc">`, `<ul class="cat-modal-list">`, etc.

**Don't forget:** also update the matching text in the card's `<p class="cat-card-desc">` if relevant.

### Updating an FAQ answer

`index.html`, search for `<details class="faq-item">`. Each has a `<summary>` (question) and a `<div class="faq-a">` (answer with `<p>` paragraphs and optional `<ul>`).

**Don't forget:** also update the matching question in the `FAQPage` JSON-LD block.

### Changing business info (address, hours, phone)

Three places to keep in sync:
1. `<script type="application/ld+json">` in `index.html` (Organization/LocalBusiness schema)
2. `#contact` section copy in `index.html`
3. FAQ answer about location (`#faq` last item)
4. `llms.txt` (the "Location & contact" section)

---

## ✅ Migration Checklist

Before going live:

- [ ] Backup current WordPress site
- [ ] Verify all 10 WC product slugs match the URLs in HTML
- [ ] Upload `img/` folder to correct path
- [ ] Upload `sitemap.xml`, `robots.txt`, `llms.txt` to root
- [ ] Test all 3 pages render correctly
- [ ] Test mobile (375px, 768px)
- [ ] Test all interactive elements (FAQ, modals, journey-line scroll reveal)
- [ ] Test cookie consent banner appears + remembers choice
- [ ] Test accessibility widget toggles + persists
- [ ] Test WooCommerce purchases work end-to-end
- [ ] Test contact links (WhatsApp, phone, email)
- [ ] Validate Schema.org with [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Submit `sitemap.xml` to Google Search Console
- [ ] Replace placeholder `og:image` with proper 1200×630 designed image
- [ ] Test reduced-motion preference (DevTools → Rendering → Emulate CSS media feature)

---

## 📞 Questions?

The site was built collaboratively with the owner via Claude Code. All design decisions are documented in the git commit history — read commit messages chronologically for context. Most recent ~125 commits cover the full build.

Active questions or stuck somewhere? Best contact via the project owner.

---

*Built with care, sage tones, and no em-dashes.*
