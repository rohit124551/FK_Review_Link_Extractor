'use client';

import React from 'react';
import {
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';
import { TEST_IDS } from '@/constants/testIds';
import { SearchMode } from '@/types';

interface ResultsHeaderProps {
  productName: string;
  totalReviews: number;
  mode: SearchMode;
  currentPage: number;
  hasMorePages: boolean;
  onPageChange: (newPage: number) => void;
  onExportCsv: () => void;
  isLoading?: boolean;
}

export function ResultsHeader({
  productName,
  totalReviews,
  mode,
  currentPage,
  hasMorePages,
  onPageChange,
  onExportCsv,
  isLoading,
}: ResultsHeaderProps) {
  if (totalReviews === 0 && !productName) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 sm:mt-8 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-[#F5F7FA] dark:bg-[#14171D] border border-slate-300 dark:border-[#272D37] shadow-sm dark:shadow-lg transition-colors">
        {/* Product Title and Review Count */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-500 dark:text-[#FFE11B] flex-shrink-0" />
            <h2
              data-testid={TEST_IDS.RESULTS_PRODUCT_TITLE}
              className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-[#F3F4F6] truncate"
            >
              {productName || 'Flipkart Product Reviews'}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span
              data-testid={TEST_IDS.RESULTS_COUNT_BADGE}
              className="px-2 py-0.5 rounded bg-amber-500/10 dark:bg-[#FFE11B]/10 border border-amber-500/30 dark:border-[#FFE11B]/30 text-amber-600 dark:text-[#FFE11B] font-bold text-[11px]"
            >
              {totalReviews} {totalReviews === 1 ? 'REVIEW' : 'REVIEWS'} FOUND
            </span>
            {mode === 'page' && (
              <span className="text-slate-600 dark:text-[#9CA3AF] text-[11px]">
                PAGE <strong className="text-slate-900 dark:text-[#F3F4F6]">{currentPage}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls: Pagination & Exports */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 font-mono text-xs w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-200 dark:border-[#272D37]">
          {/* Pagination buttons in page mode */}
          {mode === 'page' && (
            <div className="flex items-center gap-1 mr-1 sm:mr-2 bg-[#E5EBF2] dark:bg-[#0D0F12] p-1 rounded-lg border border-slate-300 dark:border-[#272D37]">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1 || isLoading}
                className="p-1 rounded text-slate-600 dark:text-[#9CA3AF] hover:text-amber-600 dark:hover:text-[#FFE11B] hover:bg-slate-200 dark:hover:bg-[#1D222A] disabled:opacity-30 transition-colors cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-bold text-slate-800 dark:text-[#F3F4F6]">
                P.{currentPage}
              </span>
              <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasMorePages || isLoading}
                className="p-1 rounded text-slate-600 dark:text-[#9CA3AF] hover:text-amber-600 dark:hover:text-[#FFE11B] hover:bg-slate-200 dark:hover:bg-[#1D222A] disabled:opacity-30 transition-colors cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Export CSV */}
          <button
            type="button"
            data-testid={TEST_IDS.RESULTS_EXPORT_CSV}
            onClick={onExportCsv}
            disabled={totalReviews === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E5EBF2] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] text-slate-700 dark:text-[#9CA3AF] hover:text-amber-600 dark:hover:text-[#FFE11B] hover:border-amber-400 dark:hover:border-[#FFE11B]/40 transition-colors disabled:opacity-30 cursor-pointer font-bold"
            title="Export reviews to CSV (Excel compatible)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
