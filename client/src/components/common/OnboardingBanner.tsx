'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Link2, X, Check } from 'lucide-react';

interface OnboardingBannerProps {
  onApplyDemoUrl?: (url: string) => void;
}

const DEMO_URL = 'https://www.flipkart.com/apple-iphone-15-black-128-gb/product-reviews/itm6ac6485515ae4?pid=MOBGTAGPTB3VS24W';
const STORAGE_KEY = 'fk_onboarding_dismissed';

export function OnboardingBanner({ onApplyDemoUrl }: OnboardingBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setIsVisible(true);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleUseDemo = () => {
    if (onApplyDemoUrl) {
      onApplyDemoUrl(DEMO_URL);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-5 sm:mb-6 rounded-xl bg-[#F5F7FA] dark:bg-[#14171D] border border-amber-500/40 dark:border-[#FFE11B]/40 p-3.5 sm:p-5 shadow-lg relative transition-all">
      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleDismiss}
        title="Dismiss guide"
        className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1D222A] transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Top Banner Tag */}
      <div className="flex items-start justify-between gap-3 mb-2 sm:mb-2.5 pr-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFE11B] text-[#0D0F12] font-heading font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3 h-3 stroke-[2.5]" />
            Quick Start
          </span>
          <span className="font-sans text-xs text-slate-600 dark:text-[#9CA3AF]">
            3 simple steps to search and verify Flipkart reviews
          </span>
        </div>
      </div>

      <h3 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-[#F3F4F6] mb-3">
        Extract verified reviews, search buyers, and jump directly to original buyer permalinks
      </h3>

      {/* 3 Steps Grid: 1 col on mobile, 3 cols on sm/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-4">
        {/* Step 1 */}
        <div className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-[#272D37] flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-amber-500/15 dark:bg-[#FFE11B]/15 text-amber-600 dark:text-[#FFE11B] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            1
          </div>
          <div className="min-w-0">
            <div className="font-heading font-bold text-xs text-slate-900 dark:text-white">
              Paste Any Link
            </div>
            <div className="font-sans text-[11px] text-slate-500 dark:text-[#9CA3AF] mt-0.5 leading-snug">
              Copy any product or review URL from Flipkart.
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-[#272D37] flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-amber-500/15 dark:bg-[#FFE11B]/15 text-amber-600 dark:text-[#FFE11B] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            2
          </div>
          <div className="min-w-0">
            <div className="font-heading font-bold text-xs text-slate-900 dark:text-white">
              Select Mode
            </div>
            <div className="font-sans text-[11px] text-slate-500 dark:text-[#9CA3AF] mt-0.5 leading-snug">
              Fetch Page (with star filters) or Scan by Reviewer Name.
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-[#272D37] flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-amber-500/15 dark:bg-[#FFE11B]/15 text-amber-600 dark:text-[#FFE11B] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            3
          </div>
          <div className="min-w-0">
            <div className="font-heading font-bold text-xs text-slate-900 dark:text-white">
              Verify & Export
            </div>
            <div className="font-sans text-[11px] text-slate-500 dark:text-[#9CA3AF] mt-0.5 leading-snug">
              Open direct review links on Flipkart or export to CSV/PDF.
            </div>
          </div>
        </div>
      </div>

      {/* Action Row: responsive flex (stacks on mobile, side-by-side on desktop) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-200 dark:border-[#272D37]">
        <button
          type="button"
          onClick={handleUseDemo}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-[#1D222A] border border-slate-300 dark:border-[#272D37] text-slate-800 dark:text-[#F3F4F6] hover:border-amber-500/50 dark:hover:border-[#FFE11B]/40 font-sans font-medium text-xs transition-colors cursor-pointer active:scale-98"
        >
          <Link2 className="w-3.5 h-3.5 text-amber-600 dark:text-[#FFE11B] shrink-0" />
          <span>Try with Sample Product (iPhone 15)</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FFE11B] text-[#0D0F12] font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#FFE11B]/90 transition-all cursor-pointer shadow-xs active:scale-98"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Got it, let&apos;s search</span>
        </button>
      </div>
    </div>
  );
}
