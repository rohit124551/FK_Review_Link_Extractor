/**
 * ═══════════════════════════════════════════════════════════════════
 *   🛒 Flipkart Review Finder — Cloudflare Worker Backend & Test UI
 * ═══════════════════════════════════════════════════════════════════
 *
 * Environment Variables (configured in Cloudflare Worker Settings or wrangler.toml):
 *   - FK_LOG_WEBHOOK_URL : Discord webhook URL for operational logs & fetch errors
 *   - FK_BUG_WEBHOOK_URL : Discord webhook URL for user bug reports & feedback
 *   - FLIPKART_COOKIES   : (Optional) Raw cookie string if Flipkart requires session cookies
 *   - CORS_ORIGINS       : (Optional) Comma-separated allowed origins (defaults to *)
 */

const FLIPKART_BASE = 'https://www.flipkart.com';

const API_ENDPOINTS = [
  'https://2.rome.api.flipkart.com/api/4/page/fetch?cacheFirst=false',
  'https://1.rome.api.flipkart.com/api/4/page/fetch?cacheFirst=false',
  'https://rome.api.flipkart.com/api/4/page/fetch?cacheFirst=false',
];

const VALID_SORT_ORDERS = [
  'MOST_RECENT',
  'MOST_HELPFUL',
  'POSITIVE_FIRST',
  'NEGATIVE_FIRST',
];

// Rate Limiter: In-memory sliding window per IP (60 requests per 60 seconds)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;

function checkRateLimit(clientIp) {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry || now - entry.resetTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now });
    // Periodic garbage collection of expired IPs
    if (rateLimitMap.size > 2000) {
      for (const [ip, data] of rateLimitMap.entries()) {
        if (now - data.resetTime > RATE_LIMIT_WINDOW_MS) {
          rateLimitMap.delete(ip);
        }
      }
    }
    return { limited: false, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetInSeconds: 60 };
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const resetInSeconds = Math.max(1, Math.ceil((entry.resetTime + RATE_LIMIT_WINDOW_MS - now) / 1000));
    return { limited: true, remaining: 0, resetInSeconds };
  }

  entry.count += 1;
  const resetInSeconds = Math.max(1, Math.ceil((entry.resetTime + RATE_LIMIT_WINDOW_MS - now) / 1000));
  return { limited: false, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetInSeconds };
}

// Allowed CORS Origins Whitelist
const ALLOWED_ORIGINS = [
  'https://fk-review.pages.dev',
  'https://deal.afdeal.in',
];

function isOriginAllowed(origin) {
  if (!origin) return true; // Direct non-browser / server requests without Origin header
  const clean = origin.trim().replace(/\/+$/, '');
  if (ALLOWED_ORIGINS.includes(clean)) return true;
  // Localhost on any port (e.g. http://localhost:3000, http://127.0.0.1:5173)
  if (/^https?:\/\/localhost(:\d+)?$/.test(clean) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(clean)) {
    return true;
  }
  return false;
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin');

    // Strict CORS Enforcement: Reject unauthorized origins with 403 Forbidden
    if (origin && !isOriginAllowed(origin)) {
      return new Response(
        JSON.stringify(
          {
            error: 'Forbidden',
            message: 'Access Denied: CORS origin not allowed',
            origin,
            allowed: ALLOWED_ORIGINS.concat(['http://localhost:*']),
          },
          null,
          2
        ),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    const cors = getCorsHeaders(request, env);

    // Handle preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'Unknown IP';

    try {
      // ─────────────────────────────────────────────────────────────
      // Root / test routes: Return blank (UI disabled on server link)
      // ─────────────────────────────────────────────────────────────
      if (url.pathname === '/' || url.pathname === '/test') {
        return new Response('', {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        });
      }

      // ─────────────────────────────────────────────────────────────
      // Rate Limit Enforcement (Protects Rome API & Edge Worker)
      // ─────────────────────────────────────────────────────────────
      if (url.pathname.startsWith('/api/')) {
        const rateCheck = checkRateLimit(clientIp);
        if (rateCheck.limited) {
          const incidentId = createIncidentId();
          ctx.waitUntil(
            sendDiscordLog(env, {
              success: false,
              title: '⚠️ Client Exceeded Rate Limit (HTTP 429)',
              endpoint: url.pathname,
              clientIp,
              incidentId,
              errorMessage: `Client sent > ${RATE_LIMIT_MAX_REQUESTS} requests in 60s window.`,
            })
          );

          return jsonResponse(
            {
              status: 'RATE_LIMITED',
              error: 'Too Many Requests',
              message: `Rate limit exceeded (max ${RATE_LIMIT_MAX_REQUESTS} requests per minute). Please pause for ${rateCheck.resetInSeconds} seconds before trying again.`,
              incidentId,
              retryAfter: rateCheck.resetInSeconds,
            },
            429,
            {
              ...cors,
              'Retry-After': String(rateCheck.resetInSeconds),
              'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(rateCheck.resetInSeconds),
            }
          );
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 1. Health & Config Status Check: GET /api/health
      // ─────────────────────────────────────────────────────────────
      if (url.pathname === '/api/health' || url.pathname === '/api/cookie-status' || url.pathname === '/api/status') {
        const logWebhook = Boolean(env.FK_LOG_WEBHOOK_URL || env.DISCORD_WEBHOOK_URL || env.DISCORD_LOG_WEBHOOK_URL);
        const bugWebhook = Boolean(env.FK_BUG_WEBHOOK_URL || env.DISCORD_BUG_WEBHOOK_URL);
        const hasCookies = Boolean(env.FLIPKART_COOKIES && env.FLIPKART_COOKIES.length > 20);

        return jsonResponse(
          {
            status: 'ok',
            online: true,
            timestamp: new Date().toISOString(),
            env: {
              fkLogWebhookConfigured: logWebhook,
              fkBugWebhookConfigured: bugWebhook,
              flipkartCookiesConfigured: hasCookies,
            },
          },
          200,
          cors
        );
      }

      // ─────────────────────────────────────────────────────────────
      // 2. Direct Rome API Diagnostic Probe: GET /api/test-direct
      // ─────────────────────────────────────────────────────────────
      if (url.pathname === '/api/test-direct') {
        const testUri =
          '/apple-iphone-15-black-128-gb/product-reviews/itm6ac6485515ae4?pid=MOBGTAGPTB3VS24W&page=1&sortOrder=MOST_RECENT';
        const payload = {
          pageUri: testUri,
          pageContext: {
            trackingContext: { context: { eVar61: '' } },
            fetchSeoData: true,
            networkSpeed: 10000,
          },
        };

        const results = [];
        for (const ep of API_ENDPOINTS) {
          const t0 = Date.now();
          try {
            const res = await fetch(ep, {
              method: 'POST',
              headers: buildApiHeaders(env),
              body: JSON.stringify(payload),
            });
            const text = await res.text();
            results.push({
              endpoint: ep,
              status: res.status,
              ok: res.ok,
              latencyMs: Date.now() - t0,
              length: text.length,
              preview: text.slice(0, 150),
            });
          } catch (e) {
            results.push({
              endpoint: ep,
              error: e.message,
              latencyMs: Date.now() - t0,
            });
          }
        }

        return jsonResponse({ diagnostic: results }, 200, cors);
      }

      // ─────────────────────────────────────────────────────────────
      // 3. Test Webhook Ping: POST /api/test-webhook
      // ─────────────────────────────────────────────────────────────
      if (url.pathname === '/api/test-webhook') {
        if (request.method !== 'POST') {
          return jsonResponse({ error: 'Method Not Allowed' }, 405, cors);
        }

        const body = await request.json().catch(() => ({}));
        const targetType = body.type === 'bug' ? 'bug' : 'log';

        const webhookUrl = targetType === 'bug'
          ? (env.FK_BUG_WEBHOOK_URL || env.DISCORD_BUG_WEBHOOK_URL)
          : (env.FK_LOG_WEBHOOK_URL || env.DISCORD_WEBHOOK_URL || env.DISCORD_LOG_WEBHOOK_URL);

        if (!webhookUrl) {
          return jsonResponse(
            {
              ok: false,
              message: `Webhook not configured for ${targetType === 'bug' ? 'FK_BUG_WEBHOOK_URL' : 'FK_LOG_WEBHOOK_URL'} in Worker environment.`,
            },
            400,
            cors
          );
        }

        const testPayload = {
          username: targetType === 'bug' ? 'FK Bug Bot (Test)' : 'FK Log Bot (Test)',
          embeds: [
            {
              title: `🧪 Test Webhook Ping — ${targetType === 'bug' ? 'Bug Channel' : 'Operational Log Channel'}`,
              color: targetType === 'bug' ? 0xef4444 : 0x10b981,
              description: `Test alert dispatched from Cloudflare Worker (${url.origin}) to verify channel connectivity.`,
              fields: [
                { name: 'Channel Target', value: targetType === 'bug' ? 'FK Bug Webhook' : 'FK Log Webhook', inline: true },
                { name: 'Client IP', value: clientIp, inline: true },
                { name: 'Timestamp', value: new Date().toISOString() },
              ],
            },
          ],
        };

        const whRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testPayload),
        });

        return jsonResponse(
          {
            ok: whRes.ok,
            status: whRes.status,
            message: whRes.ok ? `Successfully delivered test message to ${targetType} webhook.` : `Discord responded with HTTP ${whRes.status}`,
          },
          whRes.ok ? 200 : 502,
          cors
        );
      }

      // ─────────────────────────────────────────────────────────────
      // Fetch Single Review Page: POST /api/reviews
      // ─────────────────────────────────────────────────────────────
      if (url.pathname === '/api/reviews') {
        if (request.method !== 'POST') {
          return jsonResponse({ error: 'Method Not Allowed' }, 405, cors);
        }

        const t0 = Date.now();
        const body = await request.json().catch(() => ({}));
        const { pageUri, page = 1, sortOrder = 'MOST_RECENT' } = body;

        if (!pageUri) {
          return jsonResponse({ error: 'Missing pageUri' }, 400, cors);
        }

        const validSort = VALID_SORT_ORDERS.includes(sortOrder) ? sortOrder : 'MOST_RECENT';
        const pageNum = Math.max(1, parseInt(page) || 1);
        const incidentId = createIncidentId();

        const formattedUri = buildPageUri(pageUri, pageNum, validSort);
        const payload = {
          pageUri: formattedUri,
          pageContext: {
            trackingContext: { context: { eVar61: '' } },
            fetchSeoData: true,
            networkSpeed: 10000,
          },
        };

        const apiResult = await callFlipkartApi(payload, env);
        const latencyMs = Date.now() - t0;

        if (!apiResult.ok) {
          // Log operational error to FK Log Discord Webhook
          ctx.waitUntil(
            sendDiscordLog(env, {
              success: false,
              title: `/api/reviews FAILED (HTTP ${apiResult.status})`,
              endpoint: '/api/reviews',
              pageUri,
              page: pageNum,
              sortOrder: validSort,
              incidentId,
              clientIp,
              latencyMs,
              errorMessage: `Flipkart API returned HTTP ${apiResult.status}`,
              excerpt: (apiResult.errorText || '').slice(0, 300),
            })
          );

          return jsonResponse(
            {
              status: 'UNAVAILABLE',
              productName: '',
              reviews: [],
              hasMorePages: false,
              currentPage: pageNum,
              totalPages: 1,
              cached: false,
              latencyMs,
              incidentId,
              message: `Flipkart service temporarily returned HTTP ${apiResult.status}`,
            },
            apiResult.status >= 500 ? 503 : 400,
            cors
          );
        }

        const parsed = parseApiResponse(apiResult.data);

        // Background log operational success to FK Log Discord Webhook
        ctx.waitUntil(
          sendDiscordLog(env, {
            success: true,
            title: `/api/reviews OK (${parsed.reviews.length} reviews)`,
            endpoint: '/api/reviews',
            pageUri,
            productName: parsed.productName,
            page: pageNum,
            sortOrder: validSort,
            reviewCount: parsed.reviews.length,
            clientIp,
            latencyMs,
          })
        );

        return jsonResponse(
          {
            status: 'success',
            productName: parsed.productName,
            reviews: parsed.reviews,
            hasMorePages: parsed.hasMorePages,
            currentPage: pageNum,
            totalPages: parsed.totalPages || 1,
            cached: false,
            latencyMs,
            incidentId: null,
          },
          200,
          cors
        );
      }

      // ─────────────────────────────────────────────────────────────
      // Search by Reviewer Name: POST /api/search-by-name
      // ─────────────────────────────────────────────────────────────
      if (url.pathname === '/api/search-by-name') {
        if (request.method !== 'POST') {
          return jsonResponse({ error: 'Method Not Allowed' }, 405, cors);
        }

        const t0 = Date.now();
        const body = await request.json().catch(() => ({}));
        const { pageUri, name, maxPages = 8, sortOrder = 'MOST_RECENT' } = body;

        if (!pageUri) return jsonResponse({ error: 'Missing pageUri' }, 400, cors);
        if (!name || !name.trim()) return jsonResponse({ error: 'Missing reviewer name' }, 400, cors);

        const scanMax = Math.min(8, Math.max(1, parseInt(maxPages) || 8));
        const validSort = VALID_SORT_ORDERS.includes(sortOrder) ? sortOrder : 'MOST_RECENT';
        const needle = name.trim().toLowerCase();
        const incidentId = createIncidentId();

        const matches = [];
        const failedPages = [];
        let productName = 'Unknown Product';
        let scanned = 0;
        let lastError = null;

        for (let p = 1; p <= scanMax; p++) {
          const uri = buildPageUri(pageUri, p, validSort);
          const apiResult = await callFlipkartApi(
            {
              pageUri: uri,
              pageContext: {
                trackingContext: { context: { eVar61: '' } },
                fetchSeoData: true,
                networkSpeed: 10000,
              },
            },
            env
          );

          if (!apiResult.ok) {
            failedPages.push(p);
            lastError = `HTTP ${apiResult.status}`;
            break;
          }

          const parsed = parseApiResponse(apiResult.data);
          if (p === 1 && parsed.productName) {
            productName = parsed.productName;
          }

          scanned++;

          for (const rev of parsed.reviews) {
            const author = (rev.author || '').trim().toLowerCase();
            if (author.includes(needle)) {
              matches.push({
                ...rev,
                page: p,
                exactMatch: author === needle,
              });
            }
          }

          if (!parsed.hasMorePages) break;
          if (p < scanMax) {
            await new Promise(r => setTimeout(r, 350));
          }
        }

        const latencyMs = Date.now() - t0;
        const partial = failedPages.length > 0 && scanned > 0;
        const success = scanned > 0;

        // Background log to FK Log Discord Webhook
        ctx.waitUntil(
          sendDiscordLog(env, {
            success,
            title: `/api/search-by-name ${partial ? 'PARTIAL' : success ? 'OK' : 'FAILED'}`,
            endpoint: '/api/search-by-name',
            pageUri,
            productName,
            reviewerName: name,
            pagesScanned: `${scanned}/${scanMax}`,
            matchesCount: matches.length,
            failedPages: failedPages.join(', ') || 'None',
            incidentId: success ? null : incidentId,
            clientIp,
            latencyMs,
            errorMessage: lastError,
          })
        );

        if (!success) {
          return jsonResponse(
            {
              status: 'UNAVAILABLE',
              productName: '',
              reviews: [],
              pagesScanned: 0,
              maxPages: scanMax,
              partial: false,
              failedPages,
              latencyMs,
              incidentId,
              message: `Could not scan reviews: ${lastError || 'Service error'}`,
            },
            503,
            cors
          );
        }

        return jsonResponse(
          {
            status: partial ? 'partial' : 'success',
            productName,
            reviews: matches,
            pagesScanned: scanned,
            maxPages: scanMax,
            partial,
            failedPages,
            latencyMs,
            incidentId: partial ? incidentId : null,
          },
          200,
          cors
        );
      }

      // ─────────────────────────────────────────────────────────────
      // Bug Report Submission: POST /api/report-bug
      // ─────────────────────────────────────────────────────────────
      if (url.pathname === '/api/report-bug') {
        if (request.method !== 'POST') {
          return jsonResponse({ error: 'Method Not Allowed' }, 405, cors);
        }

        const body = await request.json().catch(() => ({}));
        const rawIncidentId = body.incidentId ? String(body.incidentId).trim() : null;
        const description = (body.message || body.issue || '').trim();

        if (!description) {
          return jsonResponse({ error: 'Description is required' }, 400, cors);
        }

        // Canonical ID: REP-XXXXXX matching INC-XXXXXX if provided
        const reportId = rawIncidentId && rawIncidentId.startsWith('INC-')
          ? rawIncidentId.replace('INC-', 'REP-')
          : (body.reportId || createReportId());

        const bugWebhookUrl = env.FK_BUG_WEBHOOK_URL || env.DISCORD_BUG_WEBHOOK_URL || env.DISCORD_WEBHOOK_URL;

        if (bugWebhookUrl) {
          const payload = {
            username: 'FK Bug Reporter',
            embeds: [
              {
                title: `🐛 New Bug Report — ${reportId}`,
                color: 0xef4444,
                fields: [
                  { name: 'Report ID', value: reportId, inline: true },
                  { name: 'Linked Incident', value: rawIncidentId || 'N/A', inline: true },
                  { name: 'Category', value: body.type || 'Extraction Issue', inline: true },
                  { name: 'User Description / Error', value: description.slice(0, 1024) },
                  { name: 'Target URL', value: body.pageUri || body.url || 'N/A' },
                  { name: 'Contact Info', value: body.contact || body.email || 'None provided', inline: true },
                  { name: 'Client IP', value: clientIp, inline: true },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          };

          ctx.waitUntil(
            fetch(bugWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }).catch(e => console.error('Error posting bug to Discord:', e))
          );
        }

        return jsonResponse({ ok: true, reportId }, 200, cors);
      }

      // 404 Route Not Found
      return jsonResponse({ error: 'Endpoint Not Found', path: url.pathname }, 404, cors);

    } catch (err) {
      console.error('Worker top-level exception:', err);
      return jsonResponse({ error: err.message || 'Internal Server Error' }, 500, cors);
    }
  },
};

// ─── Helpers: CORS & Response ─────────────────────────────────

function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) {
    return {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    };
  }

  const clean = origin.trim().replace(/\/+$/, '');
  if (isOriginAllowed(origin)) {
    return {
      'Access-Control-Allow-Origin': clean,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
  }

  return {};
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  });
}

function createIncidentId() {
  const chars = '0123456789ABCDEF';
  let rand = '';
  for (let i = 0; i < 6; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  return `INC-${rand}`;
}

function createReportId() {
  const chars = '0123456789ABCDEF';
  let rand = '';
  for (let i = 0; i < 6; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  return `REP-${rand}`;
}

// ─── Helpers: Discord Webhooks ─────────────────────────────────

async function sendDiscordLog(env, data) {
  const webhookUrl = env.FK_LOG_WEBHOOK_URL || env.DISCORD_WEBHOOK_URL || env.DISCORD_LOG_WEBHOOK_URL;
  if (!webhookUrl) return;

  const color = data.success ? 0x10b981 : 0xef4444;
  const fields = [
    { name: 'Endpoint', value: data.endpoint || 'N/A', inline: true },
    { name: 'Latency', value: `${data.latencyMs || 0}ms`, inline: true },
    { name: 'Client IP', value: data.clientIp || 'Unknown', inline: true },
  ];

  if (data.productName) fields.push({ name: 'Product Name', value: data.productName.slice(0, 100) });
  if (data.pageUri) fields.push({ name: 'Page URI', value: data.pageUri.slice(0, 250) });
  if (data.reviewCount !== undefined) fields.push({ name: 'Reviews Extracted', value: String(data.reviewCount), inline: true });
  if (data.reviewerName) fields.push({ name: 'Search Query', value: data.reviewerName, inline: true });
  if (data.pagesScanned) fields.push({ name: 'Pages Scanned', value: data.pagesScanned, inline: true });
  if (data.incidentId) fields.push({ name: 'Incident ID', value: data.incidentId, inline: true });
  if (data.errorMessage) fields.push({ name: 'Error Reason', value: data.errorMessage });

  const payload = {
    username: 'FK Scraper Logger',
    embeds: [
      {
        title: data.title || (data.success ? 'Operation Succeeded' : 'Operation Failed'),
        color,
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Failed to dispatch Discord operational log:', err);
  }
}

// ─── Helpers: Flipkart Scraping & Parser ───────────────────────

function normalizeFlipkartUri(raw) {
  if (!raw || typeof raw !== 'string') {
    return { isValid: false, errorReason: 'Empty link provided' };
  }

  let cleaned = raw.trim();
  try {
    const parsed = new URL(cleaned.startsWith('http') ? cleaned : `https://www.flipkart.com${cleaned}`);
    const pid = parsed.searchParams.get('pid');

    let pathname = parsed.pathname;
    // Transform product page /p/ to /product-reviews/
    if (pathname.includes('/p/')) {
      pathname = pathname.replace('/p/', '/product-reviews/');
    }

    const cleanedUri = `${pathname}${pid ? `?pid=${pid}` : ''}`;
    return {
      isValid: true,
      originalUrl: raw,
      cleanedUri,
      pid: pid || undefined,
    };
  } catch {
    return { isValid: false, errorReason: 'Malformed URL' };
  }
}

function buildPageUri(pageUri, page, sortOrder) {
  const norm = normalizeFlipkartUri(pageUri);
  let uri = norm.isValid ? norm.cleanedUri : pageUri;

  uri = uri.replace(/[?&]page=\d+/g, '').replace(/[?&]sortOrder=[A-Z_]+/g, '');
  uri = uri.replace(/&+/g, '&').replace(/\?&/g, '?').replace(/[?&]$/, '');
  const sep = uri.includes('?') ? '&' : '?';
  return `${uri}${sep}page=${page}&sortOrder=${sortOrder}`;
}

async function callFlipkartApi(payload, env) {
  let lastStatus = 500;
  let lastErrorText = '';

  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: buildApiHeaders(env),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return { ok: true, data };
      }

      lastStatus = response.status;
      lastErrorText = await response.text();
    } catch (e) {
      lastErrorText = e.message;
    }
  }

  return { ok: false, status: lastStatus, errorText: lastErrorText };
}

function buildApiHeaders(env) {
  const headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
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

  if (env?.FLIPKART_COOKIES) {
    headers['Cookie'] = env.FLIPKART_COOKIES;
  }

  return headers;
}

function parseApiResponse(data) {
  const reviews = [];
  let productName = 'Unknown Product';
  let hasMorePages = false;
  let totalPages = 1;
  let apiSortOrder = null;

  try {
    const title = data?.RESPONSE?.pageData?.pageContext?.tracking?.title;
    if (title) productName = title;
  } catch {}

  if (productName === 'Unknown Product') {
    try {
      const keywords = data?.RESPONSE?.pageData?.seoData?.seo?.keywords;
      if (keywords) productName = keywords.replace(/\s+Reviews?\s*$/i, '').trim();
    } catch {}
  }

  try {
    hasMorePages = data?.RESPONSE?.pageData?.hasMorePages === true;
  } catch {}

  try {
    apiSortOrder = data?.RESPONSE?.pageData?.pageContext?.sortOrder || null;
  } catch {}

  const allWidgets = findAllWidgets(data);

  for (const widget of allWidgets) {
    const type = widget?.type || widget?.widgetType;

    if (type === 'REVIEWS' || type === 'REVIEW') {
      const components =
        widget?.data?.renderableComponents || widget?.data?.reviews || widget?.renderableComponents || [];

      for (const rc of components) {
        const v = rc?.value || rc;
        if (v?.type === 'ProductReviewValue' || v?.rating !== undefined) {
          const locObj = v?.location || {};
          const location = [locObj?.city, locObj?.state].filter(Boolean).join(', ');

          // Extract attributes (filtering out Size)
          const productAttributes = [];
          for (const a of v?.productAttributeList || []) {
            if (a?.name && a.name.toLowerCase() !== 'size') {
              productAttributes.push(`${a.name}: ${a.value}`);
            }
          }

          // Extract photos / images uploaded by buyer
          const images = [];
          const rawImages = [...(v?.images || []), ...(v?.media || [])];
          for (const item of rawImages) {
            const rawUrl =
              item?.value?.imageURL ||
              item?.imageURL ||
              item?.value?.url ||
              item?.url ||
              item?.dynamicImageUrl ||
              item?.value?.dynamicImageUrl ||
              (typeof item === 'string' ? item : null);
            if (rawUrl && typeof rawUrl === 'string') {
              const fullUrl = rawUrl
                .replace('{@width}', '800')
                .replace('{@height}', '800')
                .replace('{@quality}', '80');
              if (!images.includes(fullUrl)) {
                images.push(fullUrl);
              }
            }
          }

          reviews.push({
            id: v?.id || `rev-${reviews.length + 1}`,
            title: v?.title || '',
            text: v?.text || '',
            rating: typeof v?.rating === 'number' ? v.rating : 5,
            author: v?.author || 'Flipkart Customer',
            certifiedBuyer: Boolean(v?.certifiedBuyer),
            created: v?.created || '',
            location: location || '',
            helpfulCount: v?.helpfulCount || 0,
            upvotes: v?.upvotes || v?.helpfulCount || 0,
            downvotes: v?.downvotes || 0,
            productAttributes,
            images,
            permalink: v?.url ? FLIPKART_BASE + v.url : '',
          });
        }
      }
    }

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

