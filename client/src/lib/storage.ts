import { BookmarkItem, HistoryItem, SavedReviewItem, Review } from '../types';

const BOOKMARKS_KEY = 'fk_hardened_bookmarks_v1';
const HISTORY_KEY = 'fk_hardened_history_v1';
const SAVED_REVIEWS_KEY = 'fk_hardened_saved_reviews_v1';
const MAX_HISTORY = 30;

export function getBookmarks(): BookmarkItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(item: Omit<BookmarkItem, 'id' | 'addedAt'>): BookmarkItem {
  const current = getBookmarks();
  const existing = current.find(b => b.url === item.url && b.mode === item.mode);
  if (existing) return existing;

  const newItem: BookmarkItem = {
    ...item,
    id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    addedAt: new Date().toISOString(),
  };

  const updated = [newItem, ...current];
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save bookmark', e);
  }
  return newItem;
}

export function removeBookmark(id: string): void {
  const current = getBookmarks();
  const updated = current.filter(b => b.id !== id);
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove bookmark', e);
  }
}

export function removeBookmarkByUrl(url: string, mode?: string): boolean {
  const current = getBookmarks();
  const filtered = current.filter(b => !(b.url === url && (!mode || b.mode === mode)));
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to remove bookmark by url', e);
    return false;
  }
}

export function isUrlBookmarked(url: string, mode?: string): boolean {
  const current = getBookmarks();
  return current.some(b => b.url === url && (!mode || b.mode === mode));
}

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): void {
  const current = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: `hist-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  // Prepend and filter duplicates of the same URL & mode
  const filtered = current.filter(h => !(h.url === item.url && h.mode === item.mode && h.reviewerName === item.reviewerName));
  const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}

export function clearAllUserData(): void {
  try {
    localStorage.removeItem(BOOKMARKS_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(SAVED_REVIEWS_KEY);
    localStorage.removeItem('fk_onboarding_dismissed');
  } catch (e) {
    console.error('Failed to clear all user data', e);
  }
}

// ─── Individual Review Bookmarks ──────────────────────────────
export function getSavedReviews(): SavedReviewItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReviewItem(item: {
  productName: string;
  productUrl?: string;
  review: Review;
}): SavedReviewItem {
  const current = getSavedReviews();
  const existing = current.find(r => r.review.id === item.review.id);
  if (existing) return existing;

  const newItem: SavedReviewItem = {
    id: item.review.id,
    productName: item.productName || 'Flipkart Product',
    productUrl: item.productUrl,
    review: item.review,
    savedAt: new Date().toISOString(),
  };

  const updated = [newItem, ...current];
  try {
    localStorage.setItem(SAVED_REVIEWS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save review', e);
  }
  return newItem;
}

export function removeSavedReview(reviewId: string): void {
  const current = getSavedReviews();
  const updated = current.filter(r => r.review.id !== reviewId && r.id !== reviewId);
  try {
    localStorage.setItem(SAVED_REVIEWS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove saved review', e);
  }
}

export function isReviewSaved(reviewId: string): boolean {
  if (!reviewId) return false;
  const current = getSavedReviews();
  return current.some(r => r.review.id === reviewId || r.id === reviewId);
}

export function toggleSavedReview(
  productName: string,
  productUrl: string | undefined,
  review: Review
): boolean {
  if (isReviewSaved(review.id)) {
    removeSavedReview(review.id);
    return false; // Now unsaved
  } else {
    saveReviewItem({ productName, productUrl, review });
    return true; // Now saved
  }
}
