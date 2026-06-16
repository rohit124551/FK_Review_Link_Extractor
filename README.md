# ⭐ ReviewLens — Flipkart Review Link Extractor

**ReviewLens** is a full-stack web application built to solve one specific problem: **extracting individual review links from Flipkart products**, which became impossible after Flipkart's recent UI update.

> **The Problem:** Flipkart recently redesigned their product review pages. In the new UI, there is no way to right-click or copy the direct link to an individual review. The "Share" button was removed, permalink URLs are no longer visible in the browser, and the review section loads dynamically — making it impossible to grab a direct link to a specific review.
>
> **The Solution:** ReviewLens calls Flipkart's own internal API (the same one their website uses behind the scenes) to fetch the raw review data. It then reconstructs the **direct permalink URL** for every single review, which you can copy with one click. Along with the link, it also extracts the full review details — rating, reviewer name, review text, location, date, and more.

---

## 📖 Table of Contents

- [Why This Project Exists](#-why-this-project-exists)
- [What Does This Project Do?](#-what-does-this-project-do)
- [Who Is This For?](#-who-is-this-for)
- [How It Works (Step by Step)](#-how-it-works-step-by-step)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Keyboard Shortcuts](#️-keyboard-shortcuts)
- [Design System](#-design-system)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

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

This means if you need a direct link to someone's review — for example, to report a fake review, to reference a review in a dispute, to share a helpful review with someone, or to document a customer's feedback — **you simply cannot get it from Flipkart's website anymore**.

### The Solution: ReviewLens

ReviewLens bypasses Flipkart's frontend entirely. Instead of relying on what's visible in the browser, it calls Flipkart's **internal API** (the same backend API that Flipkart's own website calls behind the scenes to load reviews). From the raw API response, ReviewLens:

1. **Extracts every review** with its full data (rating, title, text, author, location, date, verified buyer status, helpfulness count).
2. **Reconstructs the direct permalink URL** for each review — the same URL that Flipkart's old UI used to show but no longer does.
3. **Lets you copy that link** with a single click.
4. **Lets you search by reviewer name** across multiple pages — so you can find a specific person's review even if it's buried on page 5.
5. **Lets you export everything** as CSV or JSON for offline use.

---

## 🔍 What Does This Project Do?

In simple terms:

> You paste a Flipkart product link → ReviewLens fetches all the reviews for that product → You can browse them, search for a specific reviewer by name, sort them, **copy the direct link to any individual review**, and download the data as CSV or JSON.

Flipkart does not provide a public API to access product reviews. ReviewLens uses your authenticated Flipkart session cookies to call Flipkart's internal review API (the same one their website uses behind the scenes). The application then parses the raw API response and presents the review data in a clean, searchable, and exportable interface — most importantly, with **clickable permalink URLs** that Flipkart's new UI no longer shows.

### What Data Does It Extract?

For each review, the app extracts and displays:

| Field | Description |
|---|---|
| ⭐ **Rating** | Star rating (1–5) with visual star display |
| 📝 **Title** | Review headline written by the reviewer |
| 💬 **Full Text** | Complete review body (expandable for long reviews) |
| 👤 **Author Name** | Reviewer's display name |
| 📍 **Location** | City and state of the reviewer |
| 📅 **Date** | When the review was posted |
| ✅ **Verified Buyer** | Whether the reviewer is a certified/verified buyer |
| 👍 **Helpful Count** | Number of people who found the review helpful |
| 🔗 **Permalink** | **Direct URL to the individual review on Flipkart** ← This is the main feature |
| 🏷️ **Product Attributes** | Color, storage, and other variant details (excluding size) |

---

## 👥 Who Is This For?

- **Anyone who needs a direct link to a Flipkart review** — The primary use case. If Flipkart's new UI is hiding the review link from you, this app gets it for you.
- **Sellers & Brands** — Monitor customer feedback, track specific reviews, and get direct links to reviews you want to respond to or report.
- **Buyers filing complaints** — Need to reference a specific fake or misleading review in a dispute? Get the exact link.
- **Market Researchers** — Collect and analyze review sentiment across products with structured CSV/JSON exports.
- **Quality Assurance Teams** — Track negative reviews and document them with direct links.
- **Developers** — Use the extracted JSON data for further analysis, sentiment dashboards, or integrations.

---

## 🚶 How It Works (Step by Step)

### Step 1: Paste a Flipkart URL
Copy any Flipkart product link from your browser and paste it into the sidebar input field. The app accepts three types of links:

| Link Type | Example | What Happens |
|---|---|---|
| **Product Page** (`/p/`) | `flipkart.com/product-name/p/itm...?pid=...&lid=...` | Auto-converted to a review page URL |
| **Review Page** (`/product-reviews/`) | `flipkart.com/.../product-reviews/itm...?pid=...&lid=...` | Used directly |
| **Share / DL Link** | `dl.flipkart.com/dl/product-name/p/itm...?pid=...&lid=...` | Domain converted to `www.flipkart.com` and then processed |

The URL **must** contain both `pid` (product ID) and `lid` (listing ID) parameters. Shortened links (like bit.ly) are **not** supported.

> The app validates the URL in real time as you type — showing a green checkmark for valid links and a red error message for invalid ones.

### Step 2: Configure & Fetch
Once the URL is valid, the sidebar unlocks additional controls:
- **Sort Order** — Choose from Most Recent, Most Helpful, Positive First, or Negative First.
- **Fetch by Page** — Navigate to a specific page number and fetch its reviews.
- **Search by Name** — Enter a reviewer's name and the app will automatically scan up to 8 pages of reviews to find all matches (with a live progress counter: "Scanning page 3 of 8…").

### Step 3: Browse & Use
Reviews are displayed as beautiful glass-morphism cards showing the rating, full review text, author info, and a copy-link button. You can:
- **Expand** long reviews to read the full text.
- **Copy** the direct permalink to any individual review.
- **Export** all loaded reviews as CSV (for spreadsheets) or JSON (for code/data analysis).

---

## ✨ Features

### Core Functionality
- **Single-page review fetching** — Retrieve 10 reviews per page from any Flipkart product.
- **Multi-page name search** — Automatically scans up to 8 consecutive review pages to find reviews by a specific author name (fuzzy matching, ignores spacing differences).
- **Real-time URL validation** — Instantly validates pasted URLs and auto-converts product page links to review page links. No button click needed.
- **Four sort modes** — Most Recent, Most Helpful, Positive First, Negative First.
- **Page navigation** — Increment/decrement page numbers with visual page counter.
- **CSV & JSON export** — Download all currently loaded reviews as structured data files.
- **Copy review permalink** — One-click copy of the direct Flipkart URL for any individual review.

### User Interface
- **Slate + Amber design system** — A carefully curated dark/light color palette using deep slate backgrounds (`#0f172a`, `#1e293b`) and warm amber accents (`#d97706`, `#fbbf24`).
- **Dark & Light mode** — Automatic system preference detection with manual toggle. Powered by `next-themes`.
- **Glassmorphism** — Frosted glass cards, overlays, and modal backgrounds.
- **Micro-animations** — Smooth fade-in-up entrance animations, scale transitions on buttons, progress bar animations on toast notifications.
- **Responsive layout** — Full two-column layout (sidebar + content) on desktop; stacked single-column on mobile with a collapsible sidebar.
- **Onboarding guide** — When no reviews are loaded, the app displays a "How It Works" guide, supported link types, URL requirements, and quick tips.
- **Loading skeleton** — Animated pulse placeholders while reviews are being fetched.
- **Toast notifications** — Non-blocking success/error toasts with auto-dismiss and animated progress bars.

### Accessibility & UX
- **Keyboard shortcuts** — 6 global keyboard shortcuts for power users (desktop only).
- **`aria-pressed`** on sort order toggle buttons for screen reader support.
- **Focus management** — Keyboard shortcut `/` instantly focuses the URL input field.
- **Smart shortcut detection** — Shortcuts are automatically disabled when the user is typing in any input, textarea, or select field.

### Issue & Feedback Reporting
- **Built-in reporting modal** — Users can report extraction issues, request features, or file bug reports directly from the app.
- **Category-aware forms** — Selecting "Extraction Issue" shows the Flipkart URL field (required); selecting "Feature Request" or "Bug Report" hides it (not needed).
- **Discord webhook integration** — All reports are forwarded as color-coded embeds to your private Discord channel.
- **Smart payloads** — Only non-empty fields are sent in the request body and rendered in the Discord embed. No "Not provided" filler text.
- **Secure routing** — The Discord webhook URL is stored in the backend `.env` and never exposed to the frontend.

### Security
- **Server-side cookies** — Flipkart session cookies are loaded from `server/.env` via `dotenv`. They never leave the backend.
- **Server-side webhook** — Discord webhook URL is kept in `server/.env`. The frontend only hits `/api/report-bug`; the backend forwards to Discord.
- **`.gitignore` protection** — All `.env` files, `node_modules`, and build artifacts are excluded from version control.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (Turbopack) | React framework with server-side rendering & API rewrites |
| **UI Library** | React 19 | Component-based UI |
| **Language** | TypeScript | Type safety across the frontend |
| **Styling** | Tailwind CSS 4 | Utility-first CSS with custom design tokens |
| **Icons** | Lucide React | Consistent, lightweight SVG icon set |
| **Theme** | next-themes | System/dark/light mode switching |
| **Backend** | Express.js 4 | Lightweight Node.js API server |
| **HTTP Client** | node-fetch 2 | Server-side HTTP requests to Flipkart's API |
| **Environment** | dotenv | Secure loading of secrets from `.env` files |
| **Webhooks** | Discord Webhooks API | Forwarding user feedback as structured embeds |
| **Dev Tooling** | Concurrently | Running frontend + backend simultaneously |
| **Linting** | ESLint + eslint-config-next | Code quality and Next.js best practices |
| **Font** | Inter (Google Fonts) | Modern, clean variable-weight sans-serif |

---

## 📁 Project Structure

```
FK_Review_Link_Extractor/
│
├── client/                          # ── Next.js 16 Frontend ──
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Main application (all UI, state, logic)
│   │   │   ├── layout.tsx           # Root layout, metadata, theme provider
│   │   │   ├── globals.css          # Design system, animations, glass effects
│   │   │   └── favicon.ico          # App icon
│   │   └── components/
│   │       ├── ThemeProvider.tsx     # next-themes provider wrapper
│   │       └── ThemeToggle.tsx       # Dark/light mode toggle button
│   ├── public/                      # Static assets (SVGs)
│   ├── next.config.ts               # API rewrite proxy (localhost:3000 → 3001)
│   ├── postcss.config.mjs           # PostCSS + Tailwind config
│   ├── tsconfig.json                # TypeScript configuration
│   ├── eslint.config.mjs            # ESLint rules
│   └── package.json                 # Frontend dependencies & scripts
│
├── server/                          # ── Express.js Backend ──
│   ├── server.js                    # API endpoints & Flipkart data parsing
│   ├── server2.js                   # Alternate/experimental server version
│   ├── public/
│   │   └── index.html               # Fallback static page
│   ├── .env                         # 🔒 Secrets (NOT committed to git)
│   ├── package.json                 # Backend dependencies
│   └── package-lock.json
│
├── .gitignore                       # Excludes .env, node_modules, .next, etc.
├── package.json                     # Root scripts (concurrently)
├── package-lock.json
└── README.md                        # This file
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | v18 or higher |
| npm | v9 or higher |
| Flipkart Account | Needed to obtain session cookies |
| Discord Server | Optional — only needed for issue reporting webhooks |

### 1. Clone the Repository

```bash
git clone https://github.com/rohit124551/FK_Review_Link_Extractor.git
cd FK_Review_Link_Extractor
```

### 2. Install All Dependencies

```bash
# One command to install everything (root + client + server)
npm run install:all
```

Or manually:
```bash
npm install                    # Root (concurrently)
cd client && npm install       # Frontend
cd ../server && npm install    # Backend
cd ..
```

### 3. Configure Environment Variables

Create a file named `.env` inside the `server/` directory:

```env
FLIPKART_COOKIES="your_flipkart_session_cookies_here"
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_id/your_token
```

> See [Environment Variables](#-environment-variables) below for detailed instructions on how to obtain these values.

### 4. Start the Application

```bash
npm run dev
```

This starts both services simultaneously:
- **Frontend** → [http://localhost:3000](http://localhost:3000) (Next.js dev server)
- **Backend** → [http://localhost:3001](http://localhost:3001) (Express API server)

The frontend automatically proxies all `/api/*` requests to the backend via Next.js rewrites configured in `next.config.ts`.

---

## 🔐 Environment Variables

All secrets are stored in `server/.env` and are **never committed to GitHub** (protected by `.gitignore`).

### `FLIPKART_COOKIES` (Required)

Your authenticated Flipkart session cookies. These allow the backend to call Flipkart's internal review API on your behalf.

**How to get them:**
1. Open [flipkart.com](https://www.flipkart.com) in your browser and **log in** to your account.
2. Open **DevTools** (`F12` or `Ctrl + Shift + I`).
3. Go to the **Application** tab → **Cookies** → `https://www.flipkart.com`.
4. Copy all the cookie key-value pairs and format them as a single semicolon-separated string:
   ```
   T=TI123...; at=eyJ...; ud=6.1B...; S=d1t1...
   ```
5. Paste this string as the value of `FLIPKART_COOKIES` in your `.env` file.

> ⚠️ **Cookies expire periodically.** If you start getting 401 errors, repeat the steps above to refresh them.

### `DISCORD_WEBHOOK_URL` (Optional)

A Discord webhook URL for receiving bug reports and feature requests from users.

**How to get one:**
1. Open your Discord server → Select a channel (e.g., `#bugs`).
2. Click the **gear icon** (Edit Channel) → **Integrations** → **Webhooks**.
3. Click **New Webhook** → Give it a name (e.g., "ReviewLens Reporter").
4. Click **Copy Webhook URL** and paste it into your `.env`.

> If this variable is not set, reports are simply logged to the server console instead.

---

## 🔌 API Endpoints

The Express backend exposes the following endpoints (all prefixed with `/api`):

### `POST /api/reviews`
Fetches a single page of reviews for a given product.

**Request Body:**
```json
{
  "pageUri": "https://www.flipkart.com/.../product-reviews/itm...?pid=...&lid=...",
  "page": 1,
  "sortOrder": "MOST_RECENT"
}
```

**Response:**
```json
{
  "reviews": [
    {
      "id": "review_id",
      "title": "Great product!",
      "text": "Full review text...",
      "rating": 5,
      "author": "Rohit Kumar",
      "certifiedBuyer": true,
      "created": "2 days ago",
      "location": "Delhi, NCT of Delhi",
      "helpfulCount": 12,
      "attributes": { "Color": "Midnight Black" },
      "permalink": "https://www.flipkart.com/..."
    }
  ],
  "productName": "Samsung Galaxy S24 Ultra",
  "hasMorePages": true,
  "currentPage": 1,
  "sortOrder": "MOST_RECENT"
}
```

**Valid Sort Orders:** `MOST_RECENT`, `MOST_HELPFUL`, `POSITIVE_FIRST`, `NEGATIVE_FIRST`

---

### `POST /api/search-by-name`
Scans up to 8 pages of reviews to find all reviews by a specific author name.

**Request Body:**
```json
{
  "pageUri": "https://www.flipkart.com/.../product-reviews/itm...?pid=...&lid=...",
  "name": "Rohit Kumar",
  "maxPages": 8,
  "sortOrder": "MOST_RECENT"
}
```

**Response:**
```json
{
  "reviews": [
    { "...review data...", "_foundOnPage": 3 }
  ],
  "productName": "Samsung Galaxy S24 Ultra",
  "pagesScanned": 8,
  "searchName": "Rohit Kumar",
  "sortOrder": "MOST_RECENT",
  "stoppedReason": "completed"
}
```

---

### `POST /api/report-bug`
Submits a bug report, feature request, or extraction issue. If `DISCORD_WEBHOOK_URL` is configured, the report is forwarded as a formatted Discord embed.

**Request Body:**
```json
{
  "type": "Extraction Issue",
  "url": "https://flipkart.com/...",
  "issue": "Reviews are not loading for this product",
  "email": "user@example.com",
  "mobile": "+91 98765 43210"
}
```

> Only `type` and `issue` are required. All other fields are optional and are omitted from the Discord embed if left empty.

---

## ⌨️ Keyboard Shortcuts

All shortcuts are **desktop-only** and are automatically disabled when typing in form fields.

| Shortcut | Action |
|---|---|
| `?` | Open / close the keyboard shortcuts guide |
| `/` or `S` | Focus the URL input field |
| `Alt` + `B` | Open the Report Issue / Feature Request modal |
| `Alt` + `T` | Toggle between dark and light theme |
| `Alt` + `E` | Open the export dropdown (when reviews are loaded) |
| `Esc` | Close any open modal or overlay |

A **Shortcuts** button is also visible in the header bar on desktop screens for users who prefer clicking.

---

## 🎨 Design System

The application uses a carefully curated **Slate + Amber** color palette:

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| Page Background | `#f8fafc` | `#0f172a` | Main background |
| Surface | `#f1f5f9` | `#1e293b` | Cards, sidebar |
| Brand | `#d97706` | `#d97706` | Buttons, accents, focus rings |
| Brand Hover | `#b45309` | `#b45309` | Button hover states |
| Brand Tint | `#fef3c7` | `rgba(217,119,6,0.1)` | Subtle highlights |
| Text Primary | `#0f172a` | `#f8fafc` | Headings, body text |
| Text Secondary | `#64748b` | `#94a3b8` | Labels, descriptions |
| Border | `#cbd5e1` | `#334155` | Card borders, dividers |
| Star Color | `#fbbf24` | `#fbbf24` | Review star ratings |

**Typography:** Inter (Google Fonts) — variable weight from 300 to 800.

---

## 📋 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both frontend and backend concurrently |
| `npm run install:all` | Install dependencies for root, client, and server |
| `cd client && npm run dev` | Start only the frontend (Next.js dev server) |
| `cd client && npm run build` | Create a production build of the frontend |
| `cd server && node server.js` | Start only the backend (Express server) |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add some amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Rohit Kumar Ranjan**
- GitHub: [@rohit124551](https://github.com/rohit124551)

---

<p align="center">
  <strong>⭐ ReviewLens</strong> — Built with ❤️ using Next.js + Express
</p>
