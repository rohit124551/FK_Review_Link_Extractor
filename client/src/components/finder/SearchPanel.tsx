'use client';

import React, { useMemo } from 'react';
import {
  Link2,
  X,
  Bookmark,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { TEST_IDS } from '@/constants/testIds';
import { SearchMode, SortOrder, LinkNormalized } from '@/types';
import { normalizeFlipkartUrl } from '@/lib/normalizer';

interface SearchPanelProps {
  url: string;
  setUrl: (val: string) => void;
  mode: SearchMode;
  setMode: (mode: SearchMode) => void;
  sortOrder: SortOrder;
  setSortOrder: (sort: SortOrder) => void;
  page: number;
  setPage: (p: number) => void;
  reviewerName: string;
  setReviewerName: (name: string) => void;
  maxPages: number;
  setMaxPages: (mp: number) => void;
  onSearch: () => void;
  isLoading: boolean;
  onBookmark: () => void;
  isBookmarked: boolean;
}

export function SearchPanel({
  url,
  setUrl,
  mode,
  setMode,
  sortOrder,
  setSortOrder,
  page,
  setPage,
  reviewerName,
  setReviewerName,
  maxPages,
  setMaxPages,
  onSearch,
  isLoading,
  onBookmark,
  isBookmarked,
}: SearchPanelProps) {
  // Live normalized link computation
  const normalized: LinkNormalized = useMemo(() => {
    return normalizeFlipkartUrl(url);
  }, [url]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      onSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl bg-[#F5F7FA] dark:bg-[#14171D] border border-slate-300 dark:border-[#272D37] p-4 sm:p-7 shadow-lg dark:shadow-2xl relative transition-colors">
      {/* ── 1. LINK INPUT WITH CLEAR & BOOKMARK ── */}
      <div className="space-y-2 mb-5 sm:mb-6">
        <div className="flex items-center justify-between">
          <label className="font-mono text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-slate-600 dark:text-[#6B7280]">
            FLIPKART PRODUCT LINK
          </label>
        </div>

        <div className="relative flex items-center">
          <Link2 className="w-4 h-4 text-slate-500 dark:text-[#6B7280] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            data-testid={TEST_IDS.URL_INPUT}
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://www.flipkart.com/.../p/itm...?pid=..."
            className="w-full pl-10 pr-20 py-2.5 sm:py-3 rounded-lg bg-[#E5EBF2] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] text-xs sm:text-sm text-slate-900 dark:text-[#F3F4F6] placeholder-slate-500 dark:placeholder-[#4B5563] font-mono focus:outline-none focus:border-[#FFE11B] transition-all"
          />

          <div className="absolute right-2.5 flex items-center gap-1">
            {url && (
              <button
                type="button"
                data-testid={TEST_IDS.URL_CLEAR_BTN}
                onClick={() => setUrl('')}
                className="p-1.5 rounded-md text-slate-500 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F3F4F6] hover:bg-slate-200 dark:hover:bg-[#1D222A] transition-colors cursor-pointer"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              data-testid={TEST_IDS.URL_BOOKMARK_BTN}
              onClick={onBookmark}
              disabled={!normalized.isValid}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                isBookmarked
                  ? 'text-amber-600 dark:text-[#FFE11B] bg-amber-500/10 dark:bg-[#FFE11B]/10 border border-amber-500/30 dark:border-[#FFE11B]/30'
                  : 'text-slate-500 dark:text-[#6B7280] hover:text-amber-600 dark:hover:text-[#FFE11B] hover:bg-slate-200 dark:hover:bg-[#1D222A]'
              } disabled:opacity-30 disabled:hover:text-slate-400`}
              title={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live preview of cleaned link */}
        {url.trim() && (
          <div
            data-testid={TEST_IDS.URL_PREVIEW_PILL}
            className={`flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-lg text-xs border transition-all ${
              normalized.isValid
                ? 'bg-emerald-100/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400'
                : 'bg-rose-100/60 dark:bg-rose-950/25 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-400'
            }`}
          >
            {normalized.isValid ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <div className="min-w-0 flex-1">
              {normalized.isValid ? (
                <>
                  {/* Mobile view: Clean 1-line badge, no 3-5 line URL wrap */}
                  <div className="sm:hidden flex items-center justify-between gap-2">
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300 text-[11px] font-sans">
                      Valid Flipkart Product Link
                    </span>
                    {normalized.pid && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/40 text-[10px] font-mono font-bold text-emerald-900 dark:text-emerald-300 flex-shrink-0">
                        {normalized.pid}
                      </span>
                    )}
                  </div>

                  {/* Desktop view: Single line truncated URI */}
                  <div className="hidden sm:block truncate font-mono text-xs">
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300 font-sans">
                      Detected Flipkart Target:{' '}
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400">
                      {normalized.cleanedUri}
                    </span>
                  </div>
                </>
              ) : (
                <span className="font-sans text-xs">
                  {normalized.errorReason?.includes('flipkart')
                    ? normalized.errorReason
                    : 'Please enter a valid Flipkart product URL (containing flipkart.com/.../p/... or review link)'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. TABS: FETCH PAGE VS FIND REVIEWER ── */}
      <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex p-1 rounded-lg bg-[#E2E8F0] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] mb-5 sm:mb-6">
        <button
          type="button"
          data-testid={TEST_IDS.TAB_FETCH_PAGE}
          onClick={() => setMode('page')}
          className={`py-2 px-3 sm:px-3.5 rounded-md font-sans text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'page'
              ? 'bg-[#FFE11B] text-[#0D0F12] font-black shadow-xs'
              : 'text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F3F4F6]'
          }`}
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Fetch page</span>
        </button>
        <button
          type="button"
          data-testid={TEST_IDS.TAB_FIND_REVIEWER}
          onClick={() => setMode('reviewer')}
          className={`py-2 px-3 sm:px-3.5 rounded-md font-sans text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'reviewer'
              ? 'bg-[#FFE11B] text-[#0D0F12] font-black shadow-xs'
              : 'text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F3F4F6]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Find reviewer</span>
        </button>
      </div>

      {/* ── 3. CONTROLS ROW ── */}
      {mode === 'page' ? (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {/* SORT ORDER */}
          <div className="sm:col-span-5">
            <label className="block font-mono text-[10px] font-bold tracking-widest text-slate-600 dark:text-[#6B7280] uppercase mb-1.5">
              SORT ORDER
            </label>
            <div className="relative">
              <select
                data-testid={TEST_IDS.SORT_SELECT}
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as SortOrder)}
                className="w-full appearance-none rounded-lg bg-[#E5EBF2] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] px-3.5 py-2.5 text-xs text-slate-900 dark:text-[#F3F4F6] font-sans focus:outline-none focus:border-[#FFE11B] transition-colors cursor-pointer"
              >
                <option value="MOST_RECENT">Most recent</option>
                <option value="MOST_HELPFUL">Most helpful</option>
                <option value="POSITIVE_FIRST">Positive first</option>
                <option value="NEGATIVE_FIRST">Negative first</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 dark:text-[#6B7280] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* PAGE */}
          <div className="sm:col-span-3">
            <label className="block font-mono text-[10px] font-bold tracking-widest text-slate-600 dark:text-[#6B7280] uppercase mb-1.5">
              PAGE
            </label>
            <input
              type="number"
              data-testid={TEST_IDS.PAGE_NUMBER_INPUT}
              min={1}
              max={99}
              value={page}
              onChange={e => setPage(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full rounded-lg bg-[#E5EBF2] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] px-3 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-[#F3F4F6] focus:outline-none focus:border-[#FFE11B]"
            />
          </div>

          {/* ACTION BUTTON */}
          <div className="sm:col-span-4">
            <button
              type="button"
              data-testid={TEST_IDS.ACTION_SUBMIT_BTN}
              onClick={onSearch}
              disabled={isLoading || !url.trim()}
              className={`w-full py-2.5 px-4 rounded-lg bg-[#FFE11B] hover:bg-[#ffe642] text-[#0D0F12] font-sans font-bold text-xs transition-all shadow-[0_2px_10px_rgba(255,225,27,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${
                isLoading ? 'animate-scan-bar' : ''
              }`}
            >
              <Copy className="w-4 h-4" />
              <span>{isLoading ? 'Fetching...' : `Fetch page ${page}`}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Reviewer Mode */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            {/* SORT ORDER */}
            <div className="sm:col-span-4">
              <label className="block font-mono text-[10px] font-bold tracking-widest text-slate-600 dark:text-[#6B7280] uppercase mb-1.5">
                SORT ORDER
              </label>
              <div className="relative">
                <select
                  data-testid={TEST_IDS.SORT_SELECT}
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as SortOrder)}
                  className="w-full appearance-none rounded-lg bg-[#E5EBF2] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] px-3.5 py-2.5 text-xs text-slate-900 dark:text-[#F3F4F6] font-sans focus:outline-none focus:border-[#FFE11B] transition-colors cursor-pointer"
                >
                  <option value="MOST_RECENT">Most recent</option>
                  <option value="MOST_HELPFUL">Most helpful</option>
                  <option value="POSITIVE_FIRST">Positive first</option>
                  <option value="NEGATIVE_FIRST">Negative first</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-[#6B7280] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* REVIEWER NAME */}
            <div className="sm:col-span-5">
              <label className="block font-mono text-[10px] font-bold tracking-widest text-slate-600 dark:text-[#6B7280] uppercase mb-1.5">
                REVIEWER NAME
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500 dark:text-[#6B7280]" />
                <input
                  type="text"
                  data-testid={TEST_IDS.REVIEWER_NAME_INPUT}
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Aakash Verma"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#E5EBF2] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] text-xs text-slate-900 dark:text-[#F3F4F6] placeholder-slate-500 dark:placeholder-[#4B5563] font-sans focus:outline-none focus:border-[#FFE11B] transition-colors"
                />
              </div>
            </div>

            {/* MAX PAGES (1-8) */}
            <div className="sm:col-span-3">
              <label className="block font-mono text-[10px] font-bold tracking-widest text-slate-600 dark:text-[#6B7280] uppercase mb-1.5">
                MAX PAGES ({maxPages})
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 4, 8].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setMaxPages(num)}
                    className={`flex-1 py-2 rounded-md font-mono text-[11px] font-bold transition-all border cursor-pointer ${
                      maxPages === num
                        ? 'bg-[#FFE11B] text-[#0D0F12] border-[#FFE11B]'
                        : 'bg-[#E5EBF2] dark:bg-[#0D0F12] text-slate-700 dark:text-[#9CA3AF] border-slate-300 dark:border-[#272D37] hover:border-slate-400 dark:hover:border-[#374151]'
                    }`}
                  >
                    {num}P
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            data-testid={TEST_IDS.ACTION_SUBMIT_BTN}
            onClick={onSearch}
            disabled={isLoading || !url.trim()}
            className={`w-full py-2.5 px-4 rounded-lg bg-[#FFE11B] hover:bg-[#ffe642] text-[#0D0F12] font-sans font-bold text-xs transition-all shadow-[0_2px_10px_rgba(255,225,27,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${
              isLoading ? 'animate-scan-bar' : ''
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Scanning pages...' : `Scan for reviewer across up to ${maxPages} pages`}</span>
          </button>
        </div>
      )}
    </div>
  );
}
