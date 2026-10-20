export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface ReviewProperty {
  name: string;
  value: string;
}

export interface Review {
  id: string;
  title: string;
  text: string;
  author: string;
  rating: number;
  helpfulCount: number;
  upvotes: number;
  downvotes: number;
  certifiedBuyer: boolean;
  created: string;
  location: string;
  permalink: string;
  images: string[];
  productAttributes: string[];
  reviewProperties?: ReviewProperty[];
  userBadge?: string;
  extra?: Record<string, any>;
  page?: number;
  exactMatch?: boolean;
}

export type SortOrder = 'MOST_RECENT' | 'MOST_HELPFUL' | 'POSITIVE_FIRST' | 'NEGATIVE_FIRST';

export type SearchMode = 'page' | 'reviewer';

export type SourceStatus = 
  | 'SUCCESS' 
  | 'PARTIAL' 
  | 'BLOCKED' 
  | 'INVALID_PRODUCT' 
  | 'RATE_LIMITED' 
  | 'UNAVAILABLE' 
  | 'IDLE';

export interface LinkNormalized {
  isValid: boolean;
  originalUrl: string;
  cleanedUri: string;
  pid?: string;
  lid?: string;
  slug?: string;
  itm?: string;
  errorReason?: string;
}

export interface ReviewFetchResponse {
  status: SourceStatus;
  productName: string;
  reviews: Review[];
  hasMorePages: boolean;
  currentPage: number;
  totalPages: number;
  cached: boolean;
  latencyMs: number;
  incidentId?: string;
  failedPages?: number[];
  message?: string;
}

export interface SearchByNameResponse {
  status: SourceStatus;
  productName: string;
  reviews: Review[];
  pagesScanned: number;
  maxPages: number;
  partial: boolean;
  failedPages: number[];
  incidentId?: string;
  message?: string;
  latencyMs?: number;
  cached?: boolean;
}

export type CookieHealthState = 'OK' | 'FAILING' | 'UNKNOWN';

export interface CookieStatus {
  status: CookieHealthState;
  lastOk: string | null;
  lastFailure: {
    type: string;
    timestamp: string;
    message?: string;
  } | null;
  lastAlert: string | null;
  refreshTokenExpiry: string | null;
  ulsnExpiry: string | null;
  probeHost: string;
  lastChecked: string;
}

export type IncidentErrorType =
  | 'BLOCKED'
  | 'CHALLENGE'
  | 'SESSION_EXPIRED'
  | 'INVALID_PRODUCT'
  | 'EMPTY_RESPONSE'
  | 'STRUCTURE_DRIFT'
  | 'TIMEOUT'
  | 'UPSTREAM_ERROR'
  | 'RATE_LIMITED';

export interface Incident {
  id: string;
  timestamp: string;
  endpoint: string;
  inputUrl: string;
  cleanedUri: string;
  pagesScanned: number[];
  searchName?: string;
  sortOrder: SortOrder;
  httpStatus: number;
  errorType: IncidentErrorType;
  errorMessage: string;
  errorSnippet: string;
  runtime: {
    host: string;
    env: string;
    python: string;
  };
  clientIp: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  mode: SearchMode;
  sortOrder: SortOrder;
  page?: number;
  reviewerName?: string;
  maxPages?: number;
  addedAt: string;
}

export interface SavedReviewItem {
  id: string; // review id
  productName: string;
  productUrl?: string;
  review: Review;
  savedAt: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  productName: string;
  mode: SearchMode;
  sortOrder: SortOrder;
  page?: number;
  reviewerName?: string;
  reviewCount: number;
  status: SourceStatus;
  timestamp: string;
}

export interface BugReportPayload {
  message?: string;
  userMessage?: string;
  incidentId?: string;
  reportId?: string;
  pageUri?: string;
  contact?: string;
  urlState?: string;
  reportedAt?: string;
  context?: Record<string, any>;
}

