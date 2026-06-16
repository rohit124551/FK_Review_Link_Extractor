const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const COOKIE_FILE = path.join(__dirname, 'cookies.txt');
const FLIPKART_BASE = 'https://www.flipkart.com';
const API_URL = 'https://2.rome.api.flipkart.com/api/4/page/fetch?cacheFirst=false';

// Valid sort orders
const VALID_SORT_ORDERS = ['MOST_RECENT', 'MOST_HELPFUL', 'POSITIVE_FIRST', 'NEGATIVE_FIRST'];

// ─── Save cookies ─────────────────────────────────────────────
app.post('/api/save-cookies', (req, res) => {
  const { cookies } = req.body;
  if (!cookies || cookies.length < 20) {
    return res.json({ error: 'Cookie string too short' });
  }
  fs.writeFileSync(COOKIE_FILE, cookies.trim(), 'utf-8');
  res.json({ ok: true });
});

// ─── Cookie status ────────────────────────────────────────────
app.get('/api/cookie-status', (req, res) => {
  if (fs.existsSync(COOKIE_FILE)) {
    const content = fs.readFileSync(COOKIE_FILE, 'utf-8');
    res.json({
      saved: true,
      hasToken: content.includes('at='),
      preview: content.slice(0, 40) + '...',
    });
  } else {
    res.json({ saved: false });
  }
});

// ═════════════════════════════════════════════════════════════
// FETCH REVIEWS (single page)
// Body: { pageUri, page, sortOrder }
// ═════════════════════════════════════════════════════════════
app.post('/api/reviews', async (req, res) => {
  const { pageUri, page = 1, sortOrder = 'MOST_RECENT' } = req.body;

  // ── Validate ──
  if (!pageUri) return res.json({ error: 'Missing pageUri' });
  if (!VALID_SORT_ORDERS.includes(sortOrder)) {
    return res.json({
      error: `Invalid sortOrder. Use: ${VALID_SORT_ORDERS.join(', ')}`,
    });
  }
  const pageNum = parseInt(page);
  if (isNaN(pageNum) || pageNum < 1) {
    return res.json({ error: 'Page must be a positive integer' });
  }
  if (!fs.existsSync(COOKIE_FILE)) {
    return res.json({ error: 'No cookies saved. Please add cookies first.' });
  }
  const cookies = fs.readFileSync(COOKIE_FILE, 'utf-8').trim();

  // ── Build URI with page + sortOrder ──
  const uri = buildPageUri(pageUri, pageNum, sortOrder);

  const payload = {
    pageUri: uri,
    pageContext: {
      trackingContext: { context: { eVar61: '' } },
      fetchSeoData: true,
      networkSpeed: 10000,
    },
  };

  console.log('\n🔵 API Call');
  console.log('   Page:', pageNum, '| Sort:', sortOrder);
  console.log('   URI:', uri.slice(0, 120) + (uri.length > 120 ? '...' : ''));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: buildApiHeaders(cookies),
      body: JSON.stringify(payload),
    });

    console.log('   Status:', response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.log('   Error body:', errText.slice(0, 200));
      return res.json({
        error: `Flipkart API returned ${response.status}`,
        hint: response.status === 401
          ? 'Cookies expired! Please refresh cookies.'
          : errText.slice(0, 200),
      });
    }

    const data = await response.json();
    const parsed = parseApiResponse(data);

    console.log(`   📊 Reviews: ${parsed.reviews.length} | Total Pages: ${parsed.totalPages} | Product: ${parsed.productName}`);

    // Include the page/sort context in response
    res.json({
      ...parsed,
      currentPage: pageNum,
      sortOrder: sortOrder,
    });

  } catch (err) {
    console.error('   ❌ Error:', err.message);
    res.json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════
// SEARCH BY REVIEWER NAME (scans up to N pages server-side)
// Body: { pageUri, name, maxPages, sortOrder }
// Returns matched reviews + scan stats
// ═════════════════════════════════════════════════════════════
app.post('/api/search-by-name', async (req, res) => {
  const {
    pageUri,
    name,
    maxPages = 8,
    sortOrder = 'MOST_RECENT',
  } = req.body;

  if (!pageUri) return res.json({ error: 'Missing pageUri' });
  if (!name || !name.trim()) return res.json({ error: 'Missing reviewer name' });
  if (!fs.existsSync(COOKIE_FILE)) {
    return res.json({ error: 'No cookies saved' });
  }

  const cookies = fs.readFileSync(COOKIE_FILE, 'utf-8').trim();
  const scanMax = Math.min(8, Math.max(1, parseInt(maxPages) || 8));
  const needle = name.trim().toLowerCase();

  console.log(`\n🟣 NAME SEARCH: "${name}" (max ${scanMax} pages, sort: ${sortOrder})`);

  const matched = [];
  const pagesScanned = [];
  let totalPages = 1;
  let productName = 'Unknown Product';
  let stoppedReason = 'completed';

  for (let page = 1; page <= scanMax; page++) {
    if (page > 1 && page > totalPages) {
      stoppedReason = 'no more pages';
      break;
    }

    const uri = buildPageUri(pageUri, page, sortOrder);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: buildApiHeaders(cookies),
        body: JSON.stringify({
          pageUri: uri,
          pageContext: {
            trackingContext: { context: { eVar61: '' } },
            fetchSeoData: true,
            networkSpeed: 10000,
          },
        }),
      });

      if (!response.ok) {
        console.log(`   ❌ Page ${page} HTTP ${response.status}`);
        stoppedReason = `HTTP ${response.status}`;
        break;
      }

      const data = await response.json();
      const parsed = parseApiResponse(data);

      if (page === 1) {
        totalPages  = parsed.totalPages;
        productName = parsed.productName;
      }

      pagesScanned.push(page);

      let pageMatches = 0;
      for (const rev of parsed.reviews) {
        if (rev.author && rev.author.toLowerCase().includes(needle)) {
          matched.push({ ...rev, _foundOnPage: page });
          pageMatches++;
        }
      }

      console.log(`   📄 Page ${page}: ${parsed.reviews.length} reviews, ${pageMatches} match`);

      // Tiny delay to avoid rate limiting
      if (page < Math.min(scanMax, totalPages)) {
        await sleep(500);
      }
    } catch (err) {
      console.log(`   ❌ Page ${page} error:`, err.message);
      stoppedReason = err.message;
      break;
    }
  }

  console.log(`   ✅ Total matches: ${matched.length} across ${pagesScanned.length} pages`);

  res.json({
    reviews:       matched,
    productName,
    totalPages,
    pagesScanned:  pagesScanned.length,
    searchName:    name,
    sortOrder,
    stoppedReason,
  });
});

// ═════════════════════════════════════════════════════════════
// PARSE API RESPONSE
// ═════════════════════════════════════════════════════════════
function parseApiResponse(data) {
  const reviews = [];
  let totalPages = 1;
  let productName = 'Unknown Product';

  const allWidgets = findAllWidgets(data);

  for (const widget of allWidgets) {
    const type = widget?.type || widget?.widgetType;

    // Reviews
    if (type === 'REVIEWS' || type === 'REVIEW') {
      const components = widget?.data?.renderableComponents
                       || widget?.data?.reviews
                       || widget?.renderableComponents
                       || [];
      for (const rc of components) {
        const v = rc?.value || rc;
        if (v?.type === 'ProductReviewValue' || v?.rating !== undefined) {
          const locObj = v?.location || {};
          const location = [locObj?.city, locObj?.state].filter(Boolean).join(', ');

          // Build attributes but exclude Size
          const attrs = {};
          for (const a of v?.productAttributeList || []) {
            if (a?.name && a.name.toLowerCase() !== 'size') {
              attrs[a.name] = a.value;
            }
          }

          reviews.push({
            id:             v?.id,
            title:          v?.title,
            text:           v?.text,
            rating:         v?.rating,
            author:         v?.author,
            certifiedBuyer: v?.certifiedBuyer || false,
            created:        v?.created,
            location,
            helpfulCount:   v?.helpfulCount || 0,
            attributes:     attrs,
            permalink:      v?.url ? FLIPKART_BASE + v.url : '',
          });
        }
      }
    }

    // Pagination
    if (type === 'PAGINATION_BAR' || type === 'PAGINATOR') {
      const tp = widget?.data?.totalPages || widget?.totalPages;
      if (tp) totalPages = tp;
    }

    // Product name
    if (type === 'PRODUCT_MIN' || type === 'PRODUCT_SUMMARY') {
      const name = widget?.data?.product?.value?.titles?.title
                || widget?.data?.titles?.title;
      if (name) productName = name;
    }
  }

  return { reviews, totalPages, productName };
}

// ─── Walk JSON tree for all "widget" objects ──────────────────
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

// ═════════════════════════════════════════════════════════════
// BUILD PAGE URI (handles page & sortOrder cleanly)
// ═════════════════════════════════════════════════════════════
function buildPageUri(pageUri, page, sortOrder) {
  let uri = pageUri;
  // Remove existing page= and sortOrder= params
  uri = uri.replace(/[?&]page=\d+/g, '').replace(/[?&]sortOrder=[A-Z_]+/g, '');
  // Clean up artifacts
  uri = uri.replace(/&+/g, '&').replace(/\?&/g, '?').replace(/[?&]$/, '');
  // Append fresh params
  const sep = uri.includes('?') ? '&' : '?';
  return uri + `${sep}page=${page}&sortOrder=${sortOrder}`;
}

// ═════════════════════════════════════════════════════════════
// API HEADERS
// ═════════════════════════════════════════════════════════════
function buildApiHeaders(cookies) {
  return {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
    'Cookie': cookies,
    'Host': '2.rome.api.flipkart.com',
    'Origin': 'https://www.flipkart.com',
    'Referer': 'https://www.flipkart.com/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0',
    'X-User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0 FKUA/msite/0.0.4/msite/Mobile',
    'flipkart_secure': 'true',
    'sec-ch-ua': '"Microsoft Edge";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
  };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Start server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n  ╔════════════════════════════════════════╗');
  console.log('  ║   🛒 Flipkart Review Scraper           ║');
  console.log('  ║   http://localhost:' + PORT + '                ║');
  console.log('  ╚════════════════════════════════════════╝');
  console.log('\n  Endpoints:');
  console.log('    GET  /api/cookie-status');
  console.log('    POST /api/save-cookies');
  console.log('    POST /api/reviews         { pageUri, page, sortOrder }');
  console.log('    POST /api/search-by-name  { pageUri, name, maxPages, sortOrder }');
  console.log('');
});