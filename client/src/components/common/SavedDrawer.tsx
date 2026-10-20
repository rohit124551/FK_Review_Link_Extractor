'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Bookmark,
  History,
  Trash2,
  ExternalLink,
  Search,
  ArrowRight,
  Star,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { TEST_IDS } from '@/constants/testIds';
import { BookmarkItem, HistoryItem, SavedReviewItem, SearchMode, SortOrder } from '@/types';
import {
  getBookmarks,
  removeBookmark,
  getHistory,
  clearHistory,
  clearAllUserData,
  getSavedReviews,
  removeSavedReview,
} from '@/lib/storage';
import { toast } from 'sonner';

interface SavedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySaved: (item: {
    url: string;
    mode: SearchMode;
    sortOrder: SortOrder;
    page?: number;
    reviewerName?: string;
    maxPages?: number;
  }) => void;
}

export function SavedDrawer({ isOpen, onClose, onApplySaved }: SavedDrawerProps) {
  const [tab, setTab] = useState<'reviews' | 'bookmarks' | 'history'>('reviews');
  const [savedReviews, setSavedReviews] = useState<SavedReviewItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  const reloadData = () => {
    const revs = getSavedReviews();
    const bms = getBookmarks();
    const hists = getHistory();
    setSavedReviews(revs);
    setBookmarks(bms);
    setHistory(hists);

    // Default to bookmarks tab if no reviews yet
    if (revs.length === 0 && bms.length > 0) {
      setTab('bookmarks');
    }
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeleteSavedReview = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSavedReview(id);
    setSavedReviews(getSavedReviews());
    toast.success('Saved review removed');
  };

  const handleDeleteBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeBookmark(id);
    setBookmarks(getBookmarks());
    toast.success('Bookmark removed');
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    toast.success('History cleared');
  };

  const handlePurgeAllData = () => {
    if (
      window.confirm(
        'Are you sure you want to permanently erase all saved reviews, bookmarks, and search history from your device? This cannot be undone.'
      )
    ) {
      clearAllUserData();
      setSavedReviews([]);
      setBookmarks([]);
      setHistory([]);
      toast.success('All local storage data erased successfully');
    }
  };

  const filteredReviews = savedReviews.filter(
    r =>
      (r.review.title && r.review.title.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (r.review.text && r.review.text.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (r.review.author && r.review.author.toLowerCase().includes(searchFilter.toLowerCase())) ||
      r.productName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredBookmarks = bookmarks.filter(
    b =>
      b.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.url.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredHistory = history.filter(
    h =>
      h.productName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      h.url.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (h.reviewerName && h.reviewerName.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs"
      data-testid={TEST_IDS.SAVED_DRAWER}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#F5F7FA] dark:bg-[#14171D] border-l border-slate-300 dark:border-[#272D37] flex flex-col shadow-2xl transition-colors">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-300 dark:border-[#272D37] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-amber-500/10 dark:bg-[#FFE11B]/10 border border-amber-500/30 dark:border-[#FFE11B]/30 flex items-center justify-center text-amber-600 dark:text-[#FFE11B]">
                <Bookmark className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-[#F3F4F6]">
                SAVED ARCHIVES
              </h3>
            </div>
            <button
              type="button"
              data-testid={TEST_IDS.SAVED_DRAWER_CLOSE}
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F3F4F6] hover:bg-slate-200 dark:hover:bg-[#1D222A] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-300 dark:border-[#272D37] bg-[#E5EBF2] dark:bg-[#0D0F12] text-xs font-mono">
            <button
              type="button"
              onClick={() => setTab('reviews')}
              className={`flex-1 py-3 px-2 font-bold tracking-wider uppercase border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'reviews'
                  ? 'border-[#FFE11B] text-slate-900 dark:text-[#FFE11B] bg-[#F5F7FA] dark:bg-[#14171D]'
                  : 'border-transparent text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F3F4F6]'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>REVIEWS ({savedReviews.length})</span>
            </button>
            <button
              type="button"
              data-testid={TEST_IDS.SAVED_TAB_BOOKMARKS}
              onClick={() => setTab('bookmarks')}
              className={`flex-1 py-3 px-2 font-bold tracking-wider uppercase border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'bookmarks'
                  ? 'border-[#FFE11B] text-slate-900 dark:text-[#FFE11B] bg-[#F5F7FA] dark:bg-[#14171D]'
                  : 'border-transparent text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F3F4F6]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>LINKS ({bookmarks.length})</span>
            </button>
            <button
              type="button"
              data-testid={TEST_IDS.SAVED_TAB_HISTORY}
              onClick={() => setTab('history')}
              className={`flex-1 py-3 px-2 font-bold tracking-wider uppercase border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'history'
                  ? 'border-[#FFE11B] text-slate-900 dark:text-[#FFE11B] bg-[#F5F7FA] dark:bg-[#14171D]'
                  : 'border-transparent text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F3F4F6]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>HISTORY ({history.length})</span>
            </button>
          </div>

          {/* Search Filter Bar */}
          <div className="p-3 border-b border-slate-300 dark:border-[#272D37] bg-[#EDF2F7] dark:bg-[#14171D]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-[#6B7280]" />
              <input
                type="text"
                placeholder={
                  tab === 'reviews'
                    ? 'Filter saved reviews...'
                    : tab === 'bookmarks'
                    ? 'Filter saved links...'
                    : 'Filter recent history...'
                }
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#F5F7FA] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] text-xs text-slate-900 dark:text-[#F3F4F6] placeholder-slate-400 dark:placeholder-[#6B7280] focus:outline-none focus:border-amber-400 dark:focus:border-[#FFE11B] font-mono"
              />
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {tab === 'reviews' ? (
              filteredReviews.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-[#6B7280] font-mono text-xs">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                  No saved reviews yet. Click &quot;SAVE&quot; on any review card to archive it here.
                </div>
              ) : (
                filteredReviews.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-3.5 rounded-lg bg-[#F5F7FA] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] hover:border-amber-400 dark:hover:border-[#FFE11B]/40 transition-all group relative"
                  >
                    {/* Header: Rating & Author */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold text-[10px] flex items-center gap-0.5">
                            <span>{item.review.rating}</span>
                            <Star className="w-2.5 h-2.5 fill-white" />
                          </span>
                          <span className="font-mono text-[10px] text-slate-600 dark:text-[#9CA3AF] truncate">
                            {item.review.author}
                          </span>
                          {item.review.certifiedBuyer && (
                            <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          )}
                        </div>
                        <h4 className="font-sans font-bold text-xs text-slate-900 dark:text-[#F3F4F6] line-clamp-1">
                          {item.review.title || 'Review'}
                        </h4>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={e => handleDeleteSavedReview(item.review.id, e)}
                        title="Remove saved review"
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Product Name tag */}
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#1D222A] text-slate-700 dark:text-[#9CA3AF] font-mono text-[10px] truncate max-w-full">
                        <Tag className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{item.productName}</span>
                      </span>
                    </div>

                    {/* Review text preview */}
                    <p className="font-sans text-xs text-slate-700 dark:text-[#D1D5DB] line-clamp-3 mb-2.5 leading-relaxed">
                      {item.review.text}
                    </p>

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-slate-200 dark:border-[#272D37] flex items-center justify-between font-mono text-[10px] text-slate-500 dark:text-[#6B7280]">
                      <span>
                        {new Date(item.savedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.productUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              onApplySaved({
                                url: item.productUrl!,
                                mode: 'page',
                                sortOrder: 'MOST_RECENT',
                              });
                              onClose();
                            }}
                            className="hover:text-amber-600 dark:hover:text-[#FFE11B] transition-colors cursor-pointer font-bold"
                          >
                            SEARCH PRODUCT
                          </button>
                        )}
                        {item.review.permalink && (
                          <a
                            href={item.review.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            <span>FLIPKART</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : tab === 'bookmarks' ? (
              filteredBookmarks.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-[#6B7280] font-mono text-xs">
                  <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                  No bookmarked links yet. Click bookmark next to the URL input.
                </div>
              ) : (
                filteredBookmarks.map((item, index) => (
                  <div
                    key={item.id}
                    data-testid={`${TEST_IDS.SAVED_ITEM_PREFIX}${index}`}
                    onClick={() => {
                      onApplySaved(item);
                      onClose();
                    }}
                    className="p-3 rounded-lg bg-[#F5F7FA] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] hover:border-amber-400 dark:hover:border-[#FFE11B]/40 hover:bg-slate-200/50 dark:hover:bg-[#1D222A] cursor-pointer transition-all group relative"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-sans font-bold text-xs text-slate-900 dark:text-[#F3F4F6] group-hover:text-amber-600 dark:group-hover:text-[#FFE11B] transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <button
                        type="button"
                        onClick={e => handleDeleteBookmark(item.id, e)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="font-mono text-[10px] text-slate-500 dark:text-[#6B7280] truncate mb-2">
                      {item.url}
                    </p>

                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-600 dark:text-[#6B7280]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#14171D] border border-slate-300 dark:border-[#272D37] text-slate-800 dark:text-[#FFE11B]">
                        {item.mode === 'reviewer'
                          ? `SEARCH: ${item.reviewerName || 'ALL'}`
                          : `PAGE ${item.page || 1}`}
                      </span>
                      <div className="flex items-center gap-1 group-hover:text-amber-600 dark:group-hover:text-[#FFE11B] transition-colors font-bold">
                        <span>LOAD</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              // History Tab
              filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-[#6B7280] font-mono text-xs">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                  No search history recorded yet.
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-2">
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-slate-500 dark:text-[#9CA3AF] hover:text-rose-500 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear History
                    </button>
                  </div>
                  {filteredHistory.map((item, index) => (
                    <div
                      key={item.id}
                      data-testid={`${TEST_IDS.SAVED_ITEM_PREFIX}hist-${index}`}
                      onClick={() => {
                        onApplySaved(item);
                        onClose();
                      }}
                      className="p-3 rounded-lg bg-[#F5F7FA] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] hover:border-amber-400 dark:hover:border-[#FFE11B]/40 hover:bg-slate-200/50 dark:hover:bg-[#1D222A] cursor-pointer transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-sans font-semibold text-xs text-slate-900 dark:text-[#F3F4F6] group-hover:text-amber-600 dark:group-hover:text-[#FFE11B] transition-colors line-clamp-1">
                          {item.productName || 'Flipkart Product Search'}
                        </h4>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                          {item.reviewCount} reviews
                        </span>
                      </div>

                      <div className="font-mono text-[10px] text-slate-500 dark:text-[#9CA3AF] flex items-center justify-between mt-2">
                        <span>
                          {item.mode === 'reviewer'
                            ? `Reviewer: "${item.reviewerName}"`
                            : `Page: ${item.page || 1}`}
                        </span>
                        <span className="text-slate-400 dark:text-[#6B7280]">
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )
            )}
          </div>

          {/* Drawer Bottom Action Bar */}
          <div className="p-3.5 border-t border-slate-300 dark:border-[#272D37] bg-slate-100 dark:bg-[#0D0F12] flex items-center justify-between font-mono text-[11px]">
            <span className="text-slate-500 dark:text-[#6B7280]">
              {savedReviews.length + bookmarks.length + history.length} total saved items
            </span>

            {(savedReviews.length > 0 || bookmarks.length > 0 || history.length > 0) && (
              <button
                type="button"
                onClick={handlePurgeAllData}
                title="Erase all bookmarks & search history"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Data</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
