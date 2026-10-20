# 🛒 Flipkart Review Finder (FK Review Finder)

A production-grade, full-stack review extraction, search, and discovery platform for Flipkart. Extract direct review permalinks, search reviews by reviewer author name across multiple pages, filter verified buyer feedback, inspect reviewer photos, filter loaded reviews locally in real time, and stream diagnostic telemetry to Discord channels.

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Backend-Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflareworkers)](https://workers.cloudflare.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-FFE11B?style=for-the-badge&labelColor=0D0F12)](LICENSE)

---

## 📖 Table of Contents

- [Why This Project Exists](#-why-this-project-exists)
- [What Does This Project Do?](#-what-does-this-project-do)
- [Who Is This For?](#-who-is-this-for)
- [How It Works (Step by Step)](#-how-it-works-step-by-step)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#️-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Cloudflare Worker Backend](#-cloudflare-worker-backend)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Keyboard Shortcuts](#️-keyboard-shortcuts)
- [Incident & Bug Tracking Pipeline](#-incident--bug-tracking-pipeline)
- [SEO & OpenGraph Optimization](#-seo--opengraph-optimization)
- [Design System](#-design-system)
- [Author & Support](#-author--support)
- [License](#-license)

---

## ❓ Why This Project Exists

### The Problem: Flipkart's New UI Killed Review Links

Before Flipkart's UI update, extracting a direct link to a specific review was simple — you could right-click on the review timestamp, copy the link, and share it. Some reviews even had a visible "Share" or "Permalink" option.

**After the update, all of that is gone:**

| What Changed | Before (Old UI) | After (New UI) |
|---|---|---|
| **Direct review URL** | Visible in the browser address bar when you clicked a review | No longer accessible — reviews load inside a dynamic overlay |
| **Right-click → Copy link** | Worked on review timestamps and titles | No clickable links exist on individual reviews |
| **Share button** | Available on some reviews | Completely removed |
| **Review page structure** | Standard HTML pages with proper URLs | JavaScript-rendered dynamic content with no unique URLs |

This means if you need a direct link to someone's review — for example, to report a fake review, to reference a review in a dispute, to share a helpful review with someone, or to document customer feedback — **you simply cannot get it from Flipkart's website anymore**.

### The Solution: Flipkart Review Finder

Flipkart Review Finder bypasses Flipkart's frontend entirely. Instead of relying on what's visible in the browser, it calls Flipkart's **internal Rome API** (the same backend API that Flipkart's own mobile app and website call behind the scenes). From the raw API response, Flipkart Review Finder:

1. **Extracts every review** with its full data (rating, title, text, author, location, date, verified buyer status, helpfulness count, and customer-uploaded photos).
2. **Reconstructs the direct permalink URL** for each review — the exact URL that links straight to that specific review on Flipkart.
3. **Lets you copy that link** with a single click.
4. **Lets you search by reviewer name** across multiple pages — so you can find a specific person's review even if it's buried on page 5 or 8.
5. **In-Results Search & Filter Bar** — search loaded reviews locally for keywords (`"battery"`, `"camera"`, `"fake"`) with live yellow text highlighting, star ratings (`1★`–`5★`), and photo filters.
6. **Save Individual Reviews & Search Links** — 1-click bookmarking of particular reviews and search links directly into an offline Saved Drawer.
7. **Clean CSV Export** — download formatted, Excel-compatible review dossiers.

---

## 🔍 What Does This Project Do?

In simple terms:

> **You paste a Flipkart product link → Flipkart Review Finder fetches all reviews for that product → You can search, filter, bookmark, copy direct review permalinks, and export everything to CSV.**

Flipkart does not provide a public developer API for reviews. Flipkart Review Finder utilizes Flipkart's internal Rome API endpoints to parse raw JSON widgets and reconstruct **clickable permalink URLs** that Flipkart's new UI no longer shows.

### What Data Does It Extract?

For each review, the app extracts and displays:

| Field | Description |
|---|---|
| ⭐ **Rating** | Star rating (1–5) with high-contrast badge display |
| 📝 **Title** | Review headline written by the reviewer |
| 💬 **Full Text** | Complete review body (with real-time keyword highlighting) |
| 👤 **Author Name** | Reviewer's display name |
| 📍 **Location** | City and state of the reviewer |
| 📅 **Date** | When the review was posted (e.g. "Today", "2 months ago") |
| ✅ **Verified Buyer** | Certified buyer verification badge |
| 👍 **Helpful Votes** | Upvotes and helpful count from other buyers |
| 📷 **Buyer Photos** | High-resolution customer uploaded images with interactive lightbox preview |
| 🔗 **Permalink** | **Direct URL straight to the individual review on Flipkart** ← Primary feature |
| 🏷️ **Product Attributes** | Color, storage, and variant details (excluding size) |

---

## 👥 Who Is This For?

- **Anyone who needs a direct link to a Flipkart review** — The primary use case. If Flipkart's new UI hides the review link, this app reconstructs it for you.
- **Sellers & Brand Owners** — Monitor customer feedback, track specific critical reviews, and get direct permalinks to reviews you want to respond to or report.
- **Buyers Filing Complaints or Disputes** — Need to reference a specific misleading or damaged-goods review in a dispute? Copy the exact link.
- **Market Researchers & Data Analysts** — Collect, filter, and analyze customer sentiment across product categories with structured CSV exports.
- **Quality Assurance & Support Teams** — Track negative reviews, link them to internal bug tickets, and document them with permanent links.

---

## 🚶 How It Works (Step by Step)

### Step 1: Paste a Flipkart URL
Copy any Flipkart product or review link from your browser or mobile app and paste it into the search panel. The app automatically recognizes and normalizes:

| Link Type | Example | What Happens |
|---|---|---|
| **Product Page** (`/p/`) | `flipkart.com/product-name/p/itm...?pid=...` | Automatically converted to a clean review page URI |
| **Review Page** (`/product-reviews/`) | `flipkart.com/.../product-reviews/itm...?pid=...` | Used directly with proper page and sort parameters |
| **Share / DL Link** | `dl.flipkart.com/dl/product-name/p/itm...?pid=...` | Normalized into standard web format |

> **Mobile Optimization:** On mobile screens, long URLs are formatted into a clean, compact single-line verification pill (`✓ Valid Flipkart Product Link [PID]`), preventing messy 3–5 line text wrapping.

### Step 2: Configure & Fetch
- **Sort Order**: Choose from Most Recent, Most Helpful, Positive First, or Negative First.
- **Fetch by Page**: Navigate through pages (1 to 10+) to inspect chronologically.
- **Search by Reviewer Name**: Enter a reviewer's name (e.g. "Rahul", "Priya") and the app will automatically scan up to 8 pages (80+ reviews) to find all matches, ranking exact name matches first.

### Step 3: Browse, Filter, Bookmark & Export
- **Copy Permalink**: One click copies the direct review permalink to your clipboard.
- **Save Individual Reviews**: Click `SAVE` on any review to pin it to your offline drawer.
- **Local In-Results Search**: Type into the in-results search bar to filter visible reviews by keywords (e.g. `"battery"`, `"camera"`) with live yellow highlighting.
- **Quick Rating Filters**: Tap `5★`, `4★`, `3★`, `2★`, `1★`, `📷 Photos`, or `✓ Verified`.
- **Preview Photos**: Click any customer-uploaded thumbnail to view the full-size image in a lightbox.
- **Export to CSV**: Download the filtered or full review list as an Excel-compatible CSV file.

---

## ✨ Key Features

### 1. Review Discovery & Extraction
- **Single-page review fetching (`/api/reviews`)**: Retrieve reviews per page with ratings, authors, location, certified buyer status, and full text.
- **Multi-page reviewer search (`/api/search-by-name`)**: Scans up to 8 pages (80+ reviews) to locate reviews written by a specific customer name with live progress tracking.
- **High-Resolution Buyer Photos**: Automatically extracts buyer-uploaded images from `item.value.imageURL` CDN templates, replacing dynamic tags with `800x800` high-res endpoints.
- **Direct Permalinks**: Instant one-click copy of the exact Flipkart permalink (`https://www.flipkart.com/reviews/...`).

### 2. In-Results Search & Quick Filters
- **Real-Time Client-Side Filter**: Type keywords into the in-results search bar to filter visible reviews instantly without re-fetching.
- **Live Text Highlighting**: Highlights search queries in Flipkart yellow (`#FFE11B`) across titles, text, and author names.
- **1-Tap Filter Chips**: Filter by star rating (`5★` to `1★`), reviews with customer photos, or verified buyers only.

### 3. Individual Review Bookmarking & Saved Archives
- **Save Reviews Individually**: Dedicated `SAVE` / `SAVED` button on every review card.
- **3-Tab Saved Drawer (`Alt + S`)**:
  - `REVIEWS`: Pinned individual reviews with direct Flipkart links and product search restoration.
  - `LINKS`: Saved product search configurations.
  - `HISTORY`: Chronological search query history (FIFO capped at 30 items).
- **100% Private**: Everything is stored locally in the browser (`localStorage`) with a 1-click "Clear All Data" wipe.

### 4. Production Telemetry & Security Hardening
- **Strict CORS Origin Whitelist**: Restricts backend API access strictly to authorized domains (`https://fk-review.pages.dev`, `https://deal.afdeal.in`, and `localhost`), blocking unauthorized cross-origin requests with `403 Forbidden`.
- **Edge Rate Limiting**: In-memory sliding window rate limiter (60 requests/minute per IP) with automatic `429 Too Many Requests` mitigation.
- **Operational Logging Channel (`FK_LOG_WEBHOOK_URL`)**: Real-time Discord embeds streaming endpoint latency, extracted review counts, client IP, and technical failure details.
- **Bug Reporting Channel (`FK_BUG_WEBHOOK_URL`)**: Forwards user feedback and error reports with auto-linked tracking numbers (`INC-XXXXXX` and `REP-XXXXXX`).

---

## 🛠️ Architecture & Tech Stack

```
┌─────────────────────────────────┐
│     Client (Cloudflare Pages)   │
│       Next.js 16 + React 19     │
│   Tailwind CSS 4 + TypeScript   │
└────────────────┬────────────────┘
                 │ REST / JSON (CORS Whitelisted)
                 ▼
┌─────────────────────────────────┐      Discord Webhooks
│    Cloudflare Worker Backend    ├──────────────────────────► #fk-logs (Telemetry)
│     (Serverless Edge Node)      ├──────────────────────────► #fk-bugs (Bug Reports)
└────────────────┬────────────────┘
                 │ HTTPS (Internal Rome API)
                 ▼
┌─────────────────────────────────┐
│     Flipkart Rome API Nodes     │
│   (2.rome.api.flipkart.com)     │
└─────────────────────────────────┘
```

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router) | Static export (`output: 'export'`) |
| **UI Components** | React 19 | Modular components with TypeScript strict mode |
| **Language** | TypeScript | Strict type safety for review models and API envelopes |
| **Styling** | Tailwind CSS v4 | CSS variables, Swiss Tactical palettes, Cabinet Grotesk + JetBrains Mono |
| **Icons** | Lucide React | Lightweight, consistent SVG icon set |
| **Edge Serverless Backend** | Cloudflare Workers | V8 edge worker with zero cold starts, CORS whitelist, and <250ms latency |
| **Notifications** | Discord Webhooks API | Operational and bug tracking embeds |

---

## 📁 Project Structure

```
Fk-scraper/
├── client/                          # Next.js 16 Static Web App
│   ├── public/
│   │   ├── robots.txt               # Production search engine crawler rules
│   │   └── sitemap.xml              # XML sitemap
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # SEO metadata, OpenGraph, JSON-LD Schema, theme provider
│   │   │   ├── page.tsx             # Main dashboard, in-results filter bar, review list, mobile footer
│   │   │   └── globals.css          # Design system, Swiss Tactical tokens, custom fonts
│   │   ├── components/
│   │   │   ├── common/              # Header, ReportBugModal, SavedDrawer, ImageModal, LegalModal
│   │   │   └── finder/              # Hero, SearchPanel, StatusBar, ResultsHeader, ResultsFilterBar, ReviewCard
│   │   ├── lib/                     # api.ts, normalizer.ts, storage.ts, exportUtils.ts, supportMail.ts, highlight.tsx
│   │   └── types.ts                 # TypeScript interfaces for reviews, saved items, and payloads
│   ├── .env.production              # Production API base URL
│   ├── package.json
│   └── tsconfig.json
│
├── server/                          # Cloudflare Worker Backend & Node.js Server
│   ├── worker.js                    # Cloudflare Worker (copy-pasteable into Cloudflare dashboard)
│   ├── server.js                    # Local Express.js server
│   ├── .env.example                 # Example environment variables template
│   └── package.json
│
├── README.md                        # Comprehensive documentation & setup guide
└── LICENSE                          # MIT License
```

---

## 🚀 Getting Started

### 1. Frontend Development

Navigate to the `client/` directory and install dependencies:

```bash
cd client
npm install
npm run dev
```

The frontend will run at [http://localhost:3000](http://localhost:3000).

To build the static production export:
```bash
npm run build
```
Compiled output will be placed in `client/out/` ready for Cloudflare Pages or any static host.

---

### 2. Backend Local Development

To run the local Node.js Express server:

```bash
cd server
npm install
node server.js
```
The local server runs at [http://localhost:3001](http://localhost:3001).

---

## ⚡ Cloudflare Worker Backend

The production backend runs on **Cloudflare Workers** using [server/worker.js](server/worker.js).

### Features
- **Zero-Cold-Start Edge Execution**: Runs on Cloudflare's global edge network.
- **Strict CORS Origin Whitelist**: Only authorized domains and localhost can access the API.
- **Rate Limit Protection**: In-memory sliding window per IP to prevent API abuse.
- **Automatic Buyer Image CDN Parsing**: Formats buyer image URLs for high-res delivery.

### Deployment Instructions
1. Open the **Cloudflare Dashboard** → **Workers & Pages** → **Create Worker**.
2. Name the worker (e.g. `fk-scraper-backend`).
3. Copy the entire contents of [server/worker.js](server/worker.js) and paste it into the Cloudflare Worker web editor.
4. Click **Save and Deploy**.

---

## 🔐 Environment Variables

Configure these variables in your **Cloudflare Worker Dashboard** under **Settings → Variables and Secrets**:

| Variable Name | Required | Description | Example |
|---|:---:|---|---|
| **`FK_LOG_WEBHOOK_URL`** | Recommended | Discord webhook for operational telemetry and fetch logs | `https://discord.com/api/webhooks/...` |
| **`FK_BUG_WEBHOOK_URL`** | Recommended | Discord webhook for user-submitted bug tickets | `https://discord.com/api/webhooks/...` |
| **`CORS_ORIGINS`** | Optional | Additional allowed CORS origins (comma-separated) | `https://your-domain.com` |
| **`FLIPKART_COOKIES`** | Optional | Flipkart session cookie string if needed for challenges | `T=...; at=...` |

*(Note: In the frontend `client/.env.production`, configure `NEXT_PUBLIC_API_URL` to point to your live backend worker URL).*

---

## 🔌 API Reference

### 1. `POST /api/reviews`
Fetches a single page of reviews for a product link.

**Request:**
```json
{
  "pageUri": "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4?pid=MOBGTAGPTB3VS24W",
  "page": 1,
  "sortOrder": "MOST_RECENT"
}
```

**Response (HTTP 200):**
```json
{
  "status": "success",
  "productName": "Apple iPhone 15 (Black, 128 GB)",
  "reviews": [
    {
      "id": "1db02447-0b5d-4d35-b839-eb9306551cc9",
      "title": "Mind-blowing purchase",
      "text": "Superb display and battery backup.",
      "rating": 5,
      "author": "Rahul Sharma",
      "certifiedBuyer": true,
      "created": "Today",
      "location": "Bengaluru, Karnataka",
      "helpfulCount": 12,
      "upvotes": 12,
      "downvotes": 0,
      "productAttributes": ["Color: Black", "Storage: 128 GB"],
      "images": [
        "https://rukminim1.flixcart.com/blobio/800/800/imr/blobio-imr_...jpg?q=80"
      ],
      "permalink": "https://www.flipkart.com/reviews/MOBGTAGPTB3VS24W:819?reviewId=1db02447-..."
    }
  ],
  "hasMorePages": true,
  "currentPage": 1,
  "totalPages": 25,
  "cached": false,
  "latencyMs": 240,
  "incidentId": null
}
```

---

### 2. `POST /api/search-by-name`
Scans up to 8 pages for a specific reviewer name.

**Request:**
```json
{
  "pageUri": "https://www.flipkart.com/.../p/itm...?pid=...",
  "name": "Rahul Sharma",
  "maxPages": 4,
  "sortOrder": "MOST_RECENT"
}
```

**Response (HTTP 200):**
```json
{
  "status": "success",
  "productName": "Apple iPhone 15 (Black, 128 GB)",
  "reviews": [
    {
      "id": "...",
      "author": "Rahul Sharma",
      "rating": 5,
      "page": 2,
      "exactMatch": true
    }
  ],
  "pagesScanned": 2,
  "maxPages": 4,
  "partial": false,
  "failedPages": [],
  "latencyMs": 680,
  "incidentId": null
}
```

---

### 3. `POST /api/report-bug`
Submits a bug report or user feedback.

**Request:**
```json
{
  "message": "Reviews stopped loading on page 3",
  "incidentId": "INC-542107",
  "pageUri": "https://www.flipkart.com/...",
  "contact": "user@example.com"
}
```

**Response (HTTP 200):**
```json
{
  "ok": true,
  "reportId": "REP-542107"
}
```

---

## ⌨️ Keyboard Shortcuts

All shortcuts are desktop-optimized and automatically disabled when typing in input fields.

| Shortcut | Action |
|---|---|
| `/` | Focus the product URL search input |
| `Enter` | Trigger search / fetch reviews from input field |
| `Alt` + `C` | Export loaded reviews to CSV (Excel) |
| `Alt` + `S` | Open Saved Archives drawer (Reviews, Links, History) |
| `Alt` + `B` | Open the Report Bug / Feedback modal |
| `Alt` + `T` | Toggle between Dark and Light theme |
| `?` | Open / close Keyboard Shortcuts cheat sheet |
| `Esc` | Close any active modal, image preview, or drawer |

---

## 🎯 Incident & Bug Tracking Pipeline

The frontend and backend use a single unified tracking format:

```
Upstream Failure Encountered
       │
       ▼
Generate Incident ID: INC-542107
       │
       ├─► Technical Error Telemetry sent to Discord (#fk-logs)
       │
       └─► User opens "Report This" Modal
             │
             ▼
       Derives Bug Report ID: REP-542107 (Sharing the exact tracking number 542107)
             │
             ▼
       Dispatched to Discord (#fk-bugs)
```

Both engineering and user support share the exact same tracking number across incident logs and bug tickets.

---

## 🔍 SEO & OpenGraph Optimization

The application is pre-configured with SEO best practices:
- **Canonical URLs**: Configurable canonical `metadataBase`.
- **Dynamic Meta Tags**: Title templates and keyword descriptions for Flipkart review discovery.
- **Social Sharing**: OpenGraph and Twitter/X Summary Cards (`summary_large_image`) for WhatsApp, Discord, Twitter, and LinkedIn link previews.
- **Structured Data (JSON-LD)**: Schema.org `WebApplication` and `WebSite` specifications with integrated `SearchAction` queries.
- **Discovery**: Pre-rendered `robots.txt` and `sitemap.xml` in `client/public/`.

---

## 🎨 Design System

| Token | Light Mode | Dark Mode | Description |
|---|---|---|---|
| **Page Background** | `#EDF2F7` | `#0D0F12` | Soft neutral / Deep tactical dark |
| **Card / Surface** | `#F5F7FA` | `#14171D` | Elevated panels & search containers |
| **Border** | `#CBD5E1` | `#272D37` | High-contrast container borders |
| **Brand Accent** | `#2874F0` | `#FFE11B` | Flipkart Blue (Light) / Tactical Yellow (Dark) |
| **Text Primary** | `#0F172A` | `#F3F4F6` | High readability typography |
| **Typography** | Plus Jakarta Sans | Cabinet Grotesk (Headings) | JetBrains Mono (Codes & Telemetry) |

---

## 👤 Author & Support

**Rohit Kumar Ranjan**
- **Website**: [rohitkumarranjan.in](https://rohitkumarranjan.in)
- **GitHub**: [@rohit124551](https://github.com/rohit124551)
- **LinkedIn**: [in/rohitkumarranjan](https://www.linkedin.com/in/rohitkumarranjan)
- **Email Support**: [developer@rohitkumarranjan.in](mailto:developer@rohitkumarranjan.in)

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
