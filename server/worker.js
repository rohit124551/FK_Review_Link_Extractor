/**
 * ═══════════════════════════════════════════════════════════════
 *   🛒 Flipkart Review Extractor — Cloudflare Worker Backend
 * ═══════════════════════════════════════════════════════════════
 */

const FLIPKART_BASE = 'https://www.flipkart.com';
const API_URL       = 'https://2.rome.api.flipkart.com/api/4/page/fetch?cacheFirst=false';

const VALID_SORT_ORDERS = [
  'MOST_RECENT',
  'MOST_HELPFUL',
  'POSITIVE_FIRST',
  'NEGATIVE_FIRST',
];

// CORS headers utility
function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env, ctx) {
    const cors = corsHeaders(request);

    // Handle CORS preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: cors
      });
    }

    const url = new URL(request.url);

    try {
      // 1. Endpoint: GET /api/cookie-status
      if (url.pathname === '/api/cookie-status') {
        const cookies = env.FLIPKART_COOKIES;
        if (cookies) {
          return new Response(JSON.stringify({
            saved: true,
            hasToken: cookies.includes('at='),
            preview: cookies.slice(0, 40) + '...',
          }), {
            headers: { 'Content-Type': 'application/json', ...cors }
          });
        }
        return new Response(JSON.stringify({ saved: false }), {
          headers: { 'Content-Type': 'application/json', ...cors }
        });
      }

      // 2. Endpoint: POST /api/reviews
      if (url.pathname === '/api/reviews') {
        if (request.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: cors });
        }

        const body = await request.json();
        const { pageUri, page = 1, sortOrder = 'MOST_RECENT' } = body;

        if (!pageUri) {
          return new Response(JSON.stringify({ error: 'Missing pageUri' }), { headers: cors });
        }
        if (!VALID_SORT_ORDERS.includes(sortOrder)) {
          return new Response(JSON.stringify({ error: `Invalid sortOrder. Use one of: ${VALID_SORT_ORDERS.join(', ')}` }), { headers: cors });
        }

        const pageNum = parseInt(page);
        const cookies = env.FLIPKART_COOKIES;
        if (!cookies) {
          return new Response(JSON.stringify({ error: 'FLIPKART_COOKIES secret is not set in Cloudflare' }), { headers: cors });
        }

        const uri = buildPageUri(pageUri, pageNum, sortOrder);
        const payload = {
          pageUri: uri,
          pageContext: {
            trackingContext: { context: { eVar61: '' } },
            fetchSeoData: true,
            networkSpeed: 10000,
          },
        };

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: buildApiHeaders(cookies),
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text();
          return new Response(JSON.stringify({
            error: `Flipkart API returned ${response.status}`,
            hint: response.status === 401 ? 'Cookies expired! Please update FLIPKART_COOKIES.' : errText.slice(0, 200),
          }), { headers: cors });
        }

        const data = await response.json();
        const parsed = parseApiResponse(data);

        return new Response(JSON.stringify({
          ...parsed,
          currentPage: pageNum,
          sortOrder,
        }), {
          headers: { 'Content-Type': 'application/json', ...cors }
        });
      }

      // 3. Endpoint: POST /api/search-by-name
      if (url.pathname === '/api/search-by-name') {
        if (request.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: cors });
        }

        const body = await request.json();
        const { pageUri, name, maxPages = 8, sortOrder = 'MOST_RECENT' } = body;

        if (!pageUri) return new Response(JSON.stringify({ error: 'Missing pageUri' }), { headers: cors });
        if (!name || !name.trim()) return new Response(JSON.stringify({ error: 'Missing reviewer name' }), { headers: cors });

        const cookies = env.FLIPKART_COOKIES;
        if (!cookies) {
          return new Response(JSON.stringify({ error: 'FLIPKART_COOKIES secret is not set in Cloudflare' }), { headers: cors });
        }

        const scanMax = Math.min(8, Math.max(1, parseInt(maxPages) || 8));
        const needle = name.trim().toLowerCase();

        const matched = [];
        const pagesScanned = [];
        let productName = 'Unknown Product';
        let stoppedReason = 'completed';

        for (let p = 1; p <= scanMax; p++) {
          const uri = buildPageUri(pageUri, p, sortOrder);
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
              stoppedReason = `HTTP ${response.status}`;
              break;
            }

            const data = await response.json();
            const parsed = parseApiResponse(data);

            if (parsed.error) {
              stoppedReason = parsed.error;
              break;
            }

            if (p === 1) {
              productName = parsed.productName;
            }

            pagesScanned.push(p);

            const cleanNeedle = needle.replace(/\s+/g, '');
            for (const rev of parsed.reviews) {
              if (rev.author) {
                const cleanAuthor = rev.author.toLowerCase().replace(/\s+/g, '');
                if (cleanAuthor.includes(cleanNeedle)) {
                  matched.push({ ...rev, _foundOnPage: p });
                }
              }
            }

            // Stop if API says no more pages
            if (!parsed.hasMorePages) {
              stoppedReason = 'no more pages';
              break;
            }

            // Small delay between requests
            if (p < scanMax) {
              await new Promise(r => setTimeout(r, 400));
            }
          } catch (err) {
            stoppedReason = err.message;
            break;
          }
        }

        return new Response(JSON.stringify({
          reviews: matched,
          productName,
          pagesScanned: pagesScanned.length,
          searchName: name,
          sortOrder,
          stoppedReason,
        }), {
          headers: { 'Content-Type': 'application/json', ...cors }
        });
      }

      // 4. Endpoint: POST /api/report-bug
      if (url.pathname === '/api/report-bug') {
        if (request.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: cors });
        }

        const body = await request.json();
        const { type = 'Extraction Issue', url = '', issue = '', email = '', mobile = '' } = body;

        if (!issue.trim()) {
          return new Response(JSON.stringify({ error: 'Description is required' }), { headers: cors });
        }

        const webhookUrl = env.DISCORD_WEBHOOK_URL;
        if (webhookUrl) {
          try {
            const embedColor = type === 'Bug Report' ? 15158332 : type === 'Add a Feature' ? 3447003 : 14253830;
            const embedTitle = type === 'Bug Report' ? '🐛 New Bug Reported' : type === 'Add a Feature' ? '💡 New Feature Request' : '⚠️ New Extraction Issue';

            const fields = [
              { name: 'Category', value: type, inline: true },
              { name: 'Issue Description', value: issue }
            ];

            if (url.trim()) {
              fields.push({ name: 'Target Flipkart URL', value: url });
            }
            if (email.trim()) {
              fields.push({ name: 'Contact Email', value: email, inline: true });
            }
            if (mobile.trim()) {
              fields.push({ name: 'Mobile Number', value: mobile, inline: true });
            }

            const payload = {
              username: 'ReviewLens Reporter',
              embeds: [{
                title: embedTitle,
                color: embedColor,
                fields,
                timestamp: new Date().toISOString()
              }]
            };

            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          } catch (err) {
            console.error(err);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Thank you! Your response is really valuable to us and we appreciate your time.'
        }), {
          headers: { 'Content-Type': 'application/json', ...cors }
        });
      }

      // 404 Fallback
      return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: cors });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
    }
  }
};

// ─── Helper Functions ─────────────────────────────────────────

function buildPageUri(pageUri, page, sortOrder) {
  let uri = pageUri;
  uri = uri.replace(/[?&]page=\d+/g, '').replace(/[?&]sortOrder=[A-Z_]+/g, '');
  uri = uri.replace(/&+/g, '&').replace(/\?&/g, '?').replace(/[?&]$/, '');
  const sep = uri.includes('?') ? '&' : '?';
  return uri + `${sep}page=${page}&sortOrder=${sortOrder}`;
}

function buildApiHeaders(cookies) {
  return {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Type': 'application/json',
    'Cookie': cookies,
    'Host': '2.rome.api.flipkart.com',
    'Origin': 'https://www.flipkart.com',
    'Referer': 'https://www.flipkart.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
    'X-User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 FKUA/msite/0.0.4/msite/Mobile',
    'flipkart_secure': 'true',
  };
}

function parseApiResponse(data) {
  const reviews = [];
  let productName = 'Unknown Product';
  let hasMorePages = false;
  let totalPages = 1;
  let apiSortOrder = null;

  // ── 1. Product name (from tracking context) ──
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

  // ── 3. Pagination — hasMorePages ──
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
      const components = widget?.data?.renderableComponents || widget?.data?.reviews || widget?.renderableComponents || [];
      for (const rc of components) {
        const v = rc?.value || rc;
        if (v?.type === 'ProductReviewValue' || v?.rating !== undefined) {
          const locObj = v?.location || {};
          const location = [locObj?.city, locObj?.state].filter(Boolean).join(', ');

          const attrs = {};
          for (const a of v?.productAttributeList || []) {
            if (a?.name && a.name.toLowerCase() !== 'size') {
              attrs[a.name] = a.value;
            }
          }

          reviews.push({
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
          });
        }
      }
    }

    // Fallback: try to get totalPages from pagination widget if present
    if (type === 'PAGINATION_BAR' || type === 'PAGINATOR') {
      const tp = widget?.data?.totalPages || widget?.totalPages;
      if (tp) totalPages = tp;
    }
  }

  return { reviews, productName, hasMorePages, totalPages, apiSortOrder };
}

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
