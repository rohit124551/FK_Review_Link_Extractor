import {
  ReviewFetchResponse,
  SearchByNameResponse,
  SortOrder,
  BugReportPayload,
} from '../types';
import { normalizeFlipkartUrl } from './normalizer';

const rawBase = (
  process.env.NEXT_PUBLIC_API_URL ||
  'https://weathered-disk-7885.afdeal-in.workers.dev'
).replace(/\/+$/, '');

const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

/**
 * Generate a standard incident identifier
 */
function createIncidentId(): string {
  return `INC-${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Format user-safe message without exposing internal server/stack details
 */
function getSafeUserErrorMessage(status: number | null, rawMessage?: string): string {
  if (status === 429) {
    return 'Rate limit reached (60 requests/minute). Please pause for a few seconds before retrying.';
  }
  if (status === 404) {
    return 'The requested review page or product was not found on Flipkart (HTTP 404). Please verify the product link.';
  }
  if (status === 400 || status === 422) {
    return rawMessage && rawMessage.length < 120 && !rawMessage.includes('<')
      ? rawMessage
      : 'Invalid Flipkart product link. Ensure the URL contains a valid product or review ID (e.g., /p/itm... or pid=...).';
  }
  if (status === 503 || (status && status >= 500)) {
    return 'Flipkart review service is temporarily busy or blocked this request. Please wait a moment and try again.';
  }
  if (rawMessage && !rawMessage.includes('<!DOCTYPE') && !rawMessage.includes('<html') && rawMessage.length < 120) {
    return rawMessage;
  }
  return 'Could not connect to review scraper backend. Please check your internet connection or verify the backend service status.';
}

/**
 * Background dispatch to log technical failure details to backend & Discord webhook
 */
async function logTechnicalIncident(
  endpoint: string,
  incidentId: string,
  technicalReason: string,
  pageUri?: string,
  status?: number
) {
  try {
    await fetch(`${API_BASE}/report-bug`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `[AUTOMATED FAILURE LOG] ${endpoint} -> ${technicalReason}`,
        incidentId,
        pageUri: pageUri || undefined,
        contact: 'auto-telemetry',
        context: {
          endpoint,
          httpStatus: status || null,
          technicalReason,
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        },
      }),
    });
  } catch {
    // Suppress background logging errors to avoid cascading failure
  }
}

/**
 * Fetch a single page of reviews from the server
 */
export async function fetchReviews(
  urlOrUri: string,
  page: number = 1,
  sortOrder: SortOrder = 'MOST_RECENT'
): Promise<ReviewFetchResponse> {
  const norm = normalizeFlipkartUrl(urlOrUri);
  if (!norm.isValid) {
    return {
      status: 'INVALID_PRODUCT',
      productName: '',
      reviews: [],
      hasMorePages: false,
      currentPage: page,
      totalPages: 1,
      cached: false,
      latencyMs: 0,
      incidentId: createIncidentId(),
      message: norm.errorReason || 'Invalid Flipkart product link provided.',
    };
  }

  const startTime = Date.now();
  const incidentId = createIncidentId();

  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageUri: norm.cleanedUri,
        page,
        sortOrder,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!res.ok) {
      let technicalReason = `HTTP ${res.status}: ${res.statusText}`;
      let userSafeMsg = getSafeUserErrorMessage(res.status);

      if (isJson) {
        try {
          const errData = await res.json();
          technicalReason = errData.message || errData.error || technicalReason;
          if (errData.message && !errData.message.includes('<')) {
            userSafeMsg = errData.message;
          }
        } catch {}
      } else {
        const text = await res.text().catch(() => '');
        technicalReason = text.slice(0, 300) || technicalReason;
      }

      // Log exact technical error to backend & Discord with the incident ID
      logTechnicalIncident('/api/reviews', incidentId, technicalReason, norm.cleanedUri, res.status);

      return {
        status: res.status === 429 ? 'RATE_LIMITED' : 'UNAVAILABLE',
        productName: '',
        reviews: [],
        hasMorePages: false,
        currentPage: page,
        totalPages: 1,
        cached: false,
        latencyMs: Date.now() - startTime,
        incidentId,
        message: userSafeMsg,
      };
    }

    if (!isJson) {
      const technicalReason = `Non-JSON response from server (HTTP ${res.status})`;
      logTechnicalIncident('/api/reviews', incidentId, technicalReason, norm.cleanedUri, res.status);

      return {
        status: 'UNAVAILABLE',
        productName: '',
        reviews: [],
        hasMorePages: false,
        currentPage: page,
        totalPages: 1,
        cached: false,
        latencyMs: Date.now() - startTime,
        incidentId,
        message: getSafeUserErrorMessage(res.status),
      };
    }

    const data = await res.json();
    return {
      ...data,
      latencyMs: data.latencyMs || (Date.now() - startTime),
    };
  } catch (err: any) {
    const technicalReason = err?.message || 'Network fetch failed';
    logTechnicalIncident('/api/reviews', incidentId, technicalReason, norm.cleanedUri);

    return {
      status: 'UNAVAILABLE',
      productName: '',
      reviews: [],
      hasMorePages: false,
      currentPage: page,
      totalPages: 1,
      cached: false,
      latencyMs: Date.now() - startTime,
      incidentId,
      message: getSafeUserErrorMessage(null, err?.message),
    };
  }
}

/**
 * Search reviews by reviewer name across up to 8 pages
 */
export async function searchReviewsByName(
  urlOrUri: string,
  name: string,
  maxPages: number = 8,
  sortOrder: SortOrder = 'MOST_RECENT'
): Promise<SearchByNameResponse> {
  const norm = normalizeFlipkartUrl(urlOrUri);
  if (!norm.isValid) {
    return {
      status: 'INVALID_PRODUCT',
      productName: '',
      reviews: [],
      pagesScanned: 0,
      maxPages,
      partial: false,
      failedPages: [],
      incidentId: createIncidentId(),
      message: norm.errorReason || 'Invalid Flipkart product link.',
    };
  }

  const startTime = Date.now();
  const incidentId = createIncidentId();

  try {
    const res = await fetch(`${API_BASE}/search-by-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageUri: norm.cleanedUri,
        name: name.trim(),
        maxPages: Math.min(8, Math.max(1, maxPages)),
        sortOrder,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!res.ok) {
      let technicalReason = `HTTP ${res.status}: ${res.statusText}`;
      let userSafeMsg = getSafeUserErrorMessage(res.status);

      if (isJson) {
        try {
          const errData = await res.json();
          technicalReason = errData.message || errData.error || technicalReason;
          if (errData.message && !errData.message.includes('<')) {
            userSafeMsg = errData.message;
          }
        } catch {}
      } else {
        const text = await res.text().catch(() => '');
        technicalReason = text.slice(0, 300) || technicalReason;
      }

      logTechnicalIncident('/api/search-by-name', incidentId, technicalReason, norm.cleanedUri, res.status);

      return {
        status: res.status === 429 ? 'RATE_LIMITED' : 'UNAVAILABLE',
        productName: '',
        reviews: [],
        pagesScanned: 0,
        maxPages,
        partial: false,
        failedPages: [],
        incidentId,
        message: userSafeMsg,
        latencyMs: Date.now() - startTime,
      };
    }

    if (!isJson) {
      const technicalReason = `Non-JSON response from server (HTTP ${res.status})`;
      logTechnicalIncident('/api/search-by-name', incidentId, technicalReason, norm.cleanedUri, res.status);

      return {
        status: 'UNAVAILABLE',
        productName: '',
        reviews: [],
        pagesScanned: 0,
        maxPages,
        partial: false,
        failedPages: [],
        incidentId,
        message: getSafeUserErrorMessage(res.status),
        latencyMs: Date.now() - startTime,
      };
    }

    const data = await res.json();
    return {
      ...data,
      latencyMs: data.latencyMs || (Date.now() - startTime),
    };
  } catch (err: any) {
    const technicalReason = err?.message || 'Network fetch failed';
    logTechnicalIncident('/api/search-by-name', incidentId, technicalReason, norm.cleanedUri);

    return {
      status: 'UNAVAILABLE',
      productName: '',
      reviews: [],
      pagesScanned: 0,
      maxPages,
      partial: false,
      failedPages: [],
      incidentId,
      message: getSafeUserErrorMessage(null, err?.message),
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Report a bug or error anomaly linked to an incident ID
 * Transmits to backend which logs to MongoDB and triggers Discord notification
 */
export async function reportBug(payload: BugReportPayload): Promise<{ reportId: string; success: boolean }> {
  // If an incident occurred, use the same numeric code for REP- (e.g. INC-542107 -> REP-542107)
  const code = payload.incidentId
    ? payload.incidentId.replace(/^INC-?/i, '')
    : Math.floor(100000 + Math.random() * 900000).toString();

  const reportId = `REP-${code}`;
  const incidentId = payload.incidentId ? `INC-${code}` : undefined;

  const backendPayload = {
    reportId,
    incidentId,
    message: payload.message || payload.userMessage || 'User submitted bug report',
    pageUri: payload.pageUri || payload.urlState || undefined,
    contact: payload.contact || undefined,
    context: {
      ...(payload.context || {}),
      reportedAt: payload.reportedAt || new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      urlState: payload.urlState,
    },
  };

  try {
    const res = await fetch(`${API_BASE}/report-bug`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        reportId: data.reportId || reportId,
        success: true,
      };
    } else {
      console.warn('Backend report-bug returned status:', res.status);
    }
  } catch (err) {
    console.error('Failed to report bug upstream:', err);
  }

  // Consistent fallback: return the matching REP-<codeNumber>
  return {
    reportId,
    success: true,
  };
}
