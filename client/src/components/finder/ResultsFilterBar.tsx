'use client';

import React from 'react';
import { Search, X, Star, Camera, CheckCircle2, RotateCcw } from 'lucide-react';

interface ResultsFilterBarProps {
  totalLoaded: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  ratingFilter: number | 'all';
  onRatingFilterChange: (r: number | 'all') => void;
  photosOnly: boolean;
  onPhotosOnlyChange: (val: boolean) => void;
  certifiedOnly: boolean;
  onCertifiedOnlyChange: (val: boolean) => void;
  onResetFilters: () => void;
}

export function ResultsFilterBar({
  totalLoaded,
  filteredCount,
  searchQuery,
  onSearchChange,
  ratingFilter,
  onRatingFilterChange,
  photosOnly,
  onPhotosOnlyChange,
  certifiedOnly,
  onCertifiedOnlyChange,
  onResetFilters,
}: ResultsFilterBarProps) {
  if (totalLoaded === 0) return null;

  const isFiltering =
    Boolean(searchQuery.trim()) ||
    ratingFilter !== 'all' ||
    photosOnly ||
    certifiedOnly;

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 p-3 sm:p-3.5 rounded-xl bg-[#F5F7FA] dark:bg-[#14171D] border border-slate-300 dark:border-[#272D37] shadow-xs space-y-3 font-sans transition-colors">
      {/* ── TOP ROW: SEARCH IN LOADED REVIEWS & MATCH COUNTER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-[#6B7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={`Search loaded ${totalLoaded} reviews (e.g. camera, battery, quality, author)...`}
            className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-[#E5EBF2] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] text-xs text-slate-900 dark:text-[#F3F4F6] placeholder-slate-400 dark:placeholder-[#6B7280] focus:outline-none focus:border-amber-400 dark:focus:border-[#FFE11B] font-mono transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              title="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Counter & Reset Badge */}
        <div className="flex items-center justify-between sm:justify-end gap-2 font-mono text-[11px] flex-shrink-0">
          <span
            className={`px-2 py-0.5 rounded font-bold ${
              isFiltering
                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-[#FFE11B]'
                : 'text-slate-500 dark:text-[#9CA3AF]'
            }`}
          >
            {isFiltering
              ? `SHOWING ${filteredCount} OF ${totalLoaded}`
              : `${totalLoaded} REVIEWS`}
          </span>

          {isFiltering && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-500 dark:text-[#9CA3AF] dark:hover:text-rose-400 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ── BOTTOM ROW: QUICK FILTER CHIPS (STARS, PHOTOS, CERTIFIED) ── */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-[#272D37] font-mono text-xs">
        <span className="text-[10px] font-bold text-slate-400 dark:text-[#6B7280] uppercase tracking-wider mr-1 hidden sm:inline">
          Filter:
        </span>

        {/* Star Rating Chips */}
        <button
          type="button"
          onClick={() => onRatingFilterChange('all')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
            ratingFilter === 'all'
              ? 'bg-[#FFE11B] text-[#0D0F12] shadow-xs'
              : 'bg-[#E5EBF2] dark:bg-[#0D0F12] text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-[#272D37]'
          }`}
        >
          ALL
        </button>

        {[5, 4, 3, 2, 1].map(r => (
          <button
            key={r}
            type="button"
            onClick={() => onRatingFilterChange(ratingFilter === r ? 'all' : r)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              ratingFilter === r
                ? 'bg-amber-500 text-white dark:bg-[#FFE11B] dark:text-[#0D0F12] shadow-xs'
                : 'bg-[#E5EBF2] dark:bg-[#0D0F12] text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-[#272D37]'
            }`}
            title={`Filter to ${r} star reviews`}
          >
            <span>{r}</span>
            <Star className="w-2.5 h-2.5 fill-current" />
          </button>
        ))}

        <div className="h-4 w-px bg-slate-300 dark:bg-[#272D37] mx-1 hidden sm:block" />

        {/* Buyer Photos Only Chip */}
        <button
          type="button"
          onClick={() => onPhotosOnlyChange(!photosOnly)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
            photosOnly
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'bg-[#E5EBF2] dark:bg-[#0D0F12] text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-[#272D37]'
          }`}
          title="Show only reviews with customer photos"
        >
          <Camera className="w-3 h-3" />
          <span>Photos</span>
        </button>

        {/* Certified Buyers Only Chip */}
        <button
          type="button"
          onClick={() => onCertifiedOnlyChange(!certifiedOnly)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
            certifiedOnly
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'bg-[#E5EBF2] dark:bg-[#0D0F12] text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-[#272D37]'
          }`}
          title="Show only reviews from verified buyers"
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Verified</span>
        </button>
      </div>
    </div>
  );
}
