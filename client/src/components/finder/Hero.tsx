'use client';

import React from 'react';

export function Hero() {
  return (
    <div className="relative pt-6 pb-4 sm:pt-12 sm:pb-8 text-left max-w-4xl mx-auto">
      {/* Category Pill / Tag: FLIPKART · REVIEWS · REAL-TIME */}
      <div className="text-amber-500 dark:text-[#FFE11B] font-mono text-[10px] sm:text-[11px] font-bold tracking-widest uppercase mb-2 sm:mb-3">
        FLIPKART &nbsp;·&nbsp; REVIEWS &nbsp;·&nbsp; REAL-TIME
      </div>

      {/* Main Title */}
      <h1 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-[1.08]">
        <span className="text-slate-900 dark:text-[#F3F4F6] block">Find any review.</span>
        <span className="text-slate-500 dark:text-[#6B7280] block mt-0.5">Link straight to it.</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-3 sm:mt-4 text-xs sm:text-base text-slate-600 dark:text-[#9CA3AF] max-w-2xl leading-relaxed">
        Paste any Flipkart product link to search reviews by customer name, filter ratings, and jump directly to verified buyer feedback.
      </p>
    </div>
  );
}
