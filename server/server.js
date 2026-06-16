/**
 * ═══════════════════════════════════════════════════════════════
 *   🛒 Flipkart Review Scraper — Node.js Backend
 *   
 *   Endpoints:
 *     GET  /api/cookie-status     → Check if cookies are saved
 *     POST /api/save-cookies      → Save Flipkart cookies
 *     POST /api/reviews           → Fetch one page of reviews
 *     POST /api/search-by-name    → Scan up to 8 pages for a reviewer name
 * ═══════════════════════════════════════════════════════════════
 */

const express = require('express');
const fetch   = require('node-fetch');
const path    = require('path');
const fs      = require('fs');
require('dotenv').config();

const app  = express();
const PORT = 3001;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Constants ────────────────────────────────────────────────
const COOKIE_FILE   = path.join(__dirname, 'cookies.txt');
const FLIPKART_BASE = 'https://www.flipkart.com';
const API_URL       = 'https://2.rome.api.flipkart.com/api/4/page/fetch?cacheFirst=false';

const VALID_SORT_ORDERS = [
  'MOST_RECENT',
  'MOST_HELPFUL',
  'POSITIVE_FIRST',
  'NEGATIVE_FIRST',
];

const MAX_SCAN_PAGES = 8;

// COOKIE ENDPOINTS REMOVED - using .env file now

// ═══════════════════════════════════════════════════════════════
// FETCH REVIEWS — single page
// Body: { pageUri, page, sortOrder }
// ═══════════════════════════════════════════════════════════════

app.post('/api/reviews', async (req, res) => {
  const { pageUri, page = 1, sortOrder = 'MOST_RECENT' } = req.body;

  // ── Validate ──
  if (!pageUri) {
    return res.json({ error: 'Missing pageUri' });
  }
  if (!VALID_SORT_ORDERS.includes(sortOrder)) {
    return res.json({
      error: `Invalid sortOrder. Use one of: ${VALID_SORT_ORDERS.join(', ')}`,
    });
  }
  const pageNum = parseInt(page);
  if (isNaN(pageNum) || pageNum < 1) {
    return res.json({ error: 'Page must be a positive integer' });
  }

  const cookies = loadCookies();
  if (!cookies) {
    return res.json({ error: 'No cookies saved. Please add cookies first.' });
  }

  console.log(`\n🔵 GET REVIEWS  page=${pageNum}  sort=${sortOrder}`);

  try {
    const parsed = await fetchReviewPage(pageUri, pageNum, sortOrder, cookies);

    if (parsed.error) {
      return res.json(parsed);
    }

    console.log(`   📊 ${parsed.reviews.length} reviews | hasMorePages=${parsed.hasMorePages} | "${parsed.productName}"`);

    res.json({
      ...parsed,
      currentPage: pageNum,
      sortOrder:   sortOrder,
    });
  } catch (err) {
    console.error('   ❌ Error:', err.message);
    res.json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// SEARCH BY NAME — scans up to N pages
// Body: { pageUri, name, maxPages, sortOrder }
// ═══════════════════════════════════════════════════════════════

app.post('/api/search-by-name', async (req, res) => {
  const {
    pageUri,
    name,
    maxPages  = MAX_SCAN_PAGES,
    sortOrder = 'MOST_RECENT',
  } = req.body;

  // ── Validate ──
  if (!pageUri)         return res.json({ error: 'Missing pageUri' });
  if (!name?.trim())    return res.json({ error: 'Missing reviewer name' });

  const cookies = loadCookies();
  if (!cookies) return res.json({ error: 'No cookies saved' });

  const scanMax = Math.min(MAX_SCAN_PAGES, Math.max(1, parseInt(maxPages) || MAX_SCAN_PAGES));
  const needle  = name.trim().toLowerCase();

  console.log(`\n🟣 NAME SEARCH  "${name}"  (max ${scanMax} pages, sort=${sortOrder})`);

  const matched      = [];
  const pagesScanned = [];
  let productName    = 'Unknown Product';
  let stoppedReason  = 'completed';

  for (let page = 1; page <= scanMax; page++) {
    let parsed;
    try {
      parsed = await fetchReviewPage(pageUri, page, sortOrder, cookies);
    } catch (err) {
      console.log(`   ❌ Page ${page} error:`, err.message);
      stoppedReason = err.message;
      break;
    }

    if (parsed.error) {
      console.log(`   ❌ Page ${page}: ${parsed.error}`);
      stoppedReason = parsed.error;
      break;
    }

    if (page === 1) {
      productName = parsed.productName;
    }

    pagesScanned.push(page);

    let pageMatches = 0;
    const cleanNeedle = needle.replace(/\s+/g, '');
    for (const rev of parsed.reviews) {
      if (rev.author) {
        const cleanAuthor = rev.author.toLowerCase().replace(/\s+/g, '');
        if (cleanAuthor.includes(cleanNeedle)) {
          matched.push({ ...rev, _foundOnPage: page });
          pageMatches++;
        }
      }
    }

    console.log(`   📄 Page ${page}: ${parsed.reviews.length} reviews, ${pageMatches} match | hasMore=${parsed.hasMorePages}`);

    // Stop if API says no more pages
    if (!parsed.hasMorePages) {
      stoppedReason = 'no more pages';
      break;
    }

    // Small delay between requests
    if (page < scanMax) {
      await sleep(500);
    }
  }

  console.log(`   ✅ ${matched.length} total match(es) across ${pagesScanned.length} pages — ${stoppedReason}`);

  res.json({
    reviews:      matched,
    productName,
    pagesScanned: pagesScanned.length,
    searchName:   name,
    sortOrder,
    stoppedReason,
  });
});

// ═══════════════════════════════════════════════════════════════
// CORE: Fetch one review page from Flipkart's API
// Returns: { reviews, productName, hasMorePages, apiSortOrder } | { error }
// ═══════════════════════════════════════════════════════════════

async function fetchReviewPage(pageUri, page, sortOrder, cookies) {
  const uri = buildPageUri(pageUri, page, sortOrder);

  const payload = {
    pageUri: uri,
    pageContext: {
      trackingContext: { context: { eVar61: '' } },
      fetchSeoData:    true,
      networkSpeed:    10000,
    },
  };

  const response = await fetch(API_URL, {
    method:  'POST',
    headers: buildApiHeaders(cookies),
    body:    JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    return {
      error: `Flipkart API returned ${response.status}`,
      hint:  response.status === 401
        ? 'Cookies expired! Please refresh cookies.'
        : errText.slice(0, 200),
    };
  }

  const data = await response.json();
  return parseApiResponse(data);
}

// ═══════════════════════════════════════════════════════════════
// PARSE FLIPKART API RESPONSE
// ═══════════════════════════════════════════════════════════════

function parseApiResponse(data) {
  const reviews     = [];
  let productName   = 'Unknown Product';
  let hasMorePages  = false;
  let apiSortOrder  = null;

  // ── 1. Product name (from tracking) ──
  try {
    const title = data?.RESPONSE?.pageData?.pageContext?.tracking?.title;
    if (title) productName = title;
  } catch {}

  // ── 2. Fallback: SEO keywords ──
  if (productName === 'Unknown Product') {
    try {
      const keywords = data?.RESPONSE?.pageData?.seoData?.seo?.keywords;
      if (keywords) {
        productName = keywords.replace(/\s+Reviews?\s*$/i, '').trim();
      }
    } catch {}
  }

  // ── 3. Pagination ──
  try {
    hasMorePages = data?.RESPONSE?.pageData?.hasMorePages === true;
  } catch {}

  // ── 4. Sort order (echoed back) ──
  try {
    apiSortOrder = data?.RESPONSE?.pageData?.pageContext?.sortOrder || null;
  } catch {}

  // ── 5. Walk all widgets to extract reviews ──
  const allWidgets = findAllWidgets(data);

  for (const widget of allWidgets) {
    const type = widget?.type || widget?.widgetType;

    if (type === 'REVIEWS' || type === 'REVIEW') {
      const components = widget?.data?.renderableComponents
                      || widget?.data?.reviews
                      || widget?.renderableComponents
                      || [];

      for (const rc of components) {
        const v = rc?.value || rc;
        if (v?.type === 'ProductReviewValue' || v?.rating !== undefined) {
          reviews.push(buildReview(v));
        }
      }
    }
  }

  return { reviews, productName, hasMorePages, apiSortOrder };
}

// ─── Build a single review object ─────────────────────────────
function buildReview(v) {
  const locObj   = v?.location || {};
  const location = [locObj?.city, locObj?.state].filter(Boolean).join(', ');

  // Filter out "Size" attribute
  const attrs = {};
  for (const a of v?.productAttributeList || []) {
    if (a?.name && a.name.toLowerCase() !== 'size') {
      attrs[a.name] = a.value;
    }
  }

  return {
    id:             v?.id || null,
    title:          v?.title || null,
    text:           v?.text || null,
    rating:         v?.rating || null,
    author:         v?.author || null,
    certifiedBuyer: v?.certifiedBuyer || false,
    created:        v?.created || null,
    location:       location || null,
    helpfulCount:   v?.helpfulCount || 0,
    attributes:     attrs,
    permalink:      v?.url ? FLIPKART_BASE + v.url : null,
  };
}

// ─── Recursively walk JSON tree to find widget objects ────────
function findAllWidgets(node, results = []) {
  if (!node || typeof node !== 'object') return results;

  if (node.type && (node.data !== undefined || node.widgetType)) {
    results.push(node);
  }
  if (node.widget && typeof node.widget === 'object') {
    results.push(node.widget);
  }

  if (Array.isArray(node)) {
    for (const item of node) findAllWidgets(item, results);
  } else {
    for (const key of Object.keys(node)) {
      if (key === 'widget') continue;
      findAllWidgets(node[key], results);
    }
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/** Build URI with page + sortOrder params (replaces existing ones) */
function buildPageUri(pageUri, page, sortOrder) {
  let uri = pageUri
    .replace(/[?&]page=\d+/g, '')
    .replace(/[?&]sortOrder=[A-Z_]+/g, '')
    .replace(/&+/g, '&')
    .replace(/\?&/g, '?')
    .replace(/[?&]$/, '');

  const sep = uri.includes('?') ? '&' : '?';
  return `${uri}${sep}page=${page}&sortOrder=${sortOrder}`;
}

/** Load cookies from .env */
function loadCookies() {
  return process.env.FLIPKART_COOKIES || null;
}

/** Headers for Flipkart API call */
function buildApiHeaders(cookies) {
  return {
    'Accept':            '*/*',
    'Accept-Encoding':   'gzip, deflate, br, zstd',
    'Accept-Language':   'en-US,en;q=0.9',
    'Connection':        'keep-alive',
    'Content-Type':      'application/json',
    'Cookie':            cookies,
    'Host':              '2.rome.api.flipkart.com',
    'Origin':            'https://www.flipkart.com',
    'Referer':           'https://www.flipkart.com/',
    'Sec-Fetch-Dest':    'empty',
    'Sec-Fetch-Mode':    'cors',
    'Sec-Fetch-Site':    'same-site',
    'User-Agent':        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0',
    'X-User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0 FKUA/msite/0.0.4/msite/Mobile',
    'flipkart_secure':   'true',
    'sec-ch-ua':         '"Microsoft Edge";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
    'sec-ch-ua-mobile':  '?0',
    'sec-ch-ua-platform':'"Windows"',
  };
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ═══════════════════════════════════════════════════════════════
// BUG REPORT / ISSUE SUBMISSION ENDPOINT
// ═══════════════════════════════════════════════════════════════

app.post('/api/report-bug', async (req, res) => {
  const { type = 'Extraction Issue', url = '', issue = '', email = '', mobile = '' } = req.body;

  if (!issue.trim()) {
    return res.json({ error: 'Description is required' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  console.log(`\n🐛 FEEDBACK REPORT RECEIVED [${type}]:`);
  if (url.trim()) console.log(`   URL:    ${url}`);
  console.log(`   Issue:  ${issue}`);
  if (email.trim()) console.log(`   Email:  ${email}`);
  if (mobile.trim()) console.log(`   Mobile: ${mobile}`);

  if (webhookUrl) {
    try {
      let embedColor = 14251782; // Amber #d97706
      let typeIcon = '🔗';
      let titleText = 'New Extraction Issue Reported';

      if (type === 'Add a Feature') {
        embedColor = 3066993; // Greenish #2ecc71
        typeIcon = '💡';
        titleText = 'New Feature Request Submitted';
      } else if (type === 'Bug Report' || type === 'Any Bug') {
        embedColor = 15158332; // Red #e74c3c
        typeIcon = '🐛';
        titleText = 'New Bug Reported';
      }

      const fields = [];
      if (url.trim()) {
        fields.push({ name: '🔗 Provided URL', value: url.trim() });
      }
      fields.push({ name: '📝 Description / Details', value: issue.trim() });
      if (email.trim()) {
        fields.push({ name: '📧 Contact Email', value: email.trim(), inline: true });
      }
      if (mobile.trim()) {
        fields.push({ name: '📱 Mobile Number', value: mobile.trim(), inline: true });
      }

      const payload = {
        embeds: [
          {
            title: `${typeIcon} ${titleText}`,
            color: embedColor,
            fields: fields,
            timestamp: new Date().toISOString()
          }
        ]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error(`   ❌ Failed to send to Discord webhook: Status ${response.status}`);
      } else {
        console.log(`   ✅ Successfully forwarded to Discord webhook`);
      }
    } catch (err) {
      console.error(`   ❌ Webhook error:`, err.message);
    }
  } else {
    console.log(`   ⚠ DISCORD_WEBHOOK_URL is not set in .env. Report logged to console only.`);
  }

  res.json({ success: true, message: 'Thank you! Your response is really valuable to us and we appreciate your time.' });
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔════════════════════════════════════════════╗');
  console.log('  ║   🛒  Flipkart Review Scraper              ║');
  console.log('  ║                                            ║');
  console.log(`  ║   ▶  http://localhost:${PORT}                ║`);
  console.log('  ╚════════════════════════════════════════════╝');
  console.log('');
  console.log('  Endpoints:');
  console.log('    GET  /api/cookie-status');
  console.log('    POST /api/save-cookies     { cookies }');
  console.log('    POST /api/reviews          { pageUri, page, sortOrder }');
  console.log('    POST /api/search-by-name   { pageUri, name, maxPages, sortOrder }');
  console.log('');
});