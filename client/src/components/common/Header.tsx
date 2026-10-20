'use client';

import React from 'react';
import Link from 'next/link';
import { Focus, Bookmark, Bug, Mail, Keyboard } from 'lucide-react';
import { TEST_IDS } from '@/constants/testIds';
import { ThemeToggle } from '@/components/ThemeToggle';
import { openSupportEmail } from '@/lib/supportMail';

interface HeaderProps {
  onOpenSaved?: () => void;
  onOpenReportBug?: () => void;
  onOpenShortcuts?: () => void;
  savedCount?: number;
  currentUrl?: string;
}

export function Header({
  onOpenSaved,
  onOpenReportBug,
  onOpenShortcuts,
  savedCount = 0,
  currentUrl,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-300 dark:border-[#272D37] bg-[#F5F7FA]/90 dark:bg-[#0D0F12]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            data-testid={TEST_IDS.HEADER_LOGO}
            className="flex items-center gap-2 sm:gap-3 group transition-transform active:scale-98"
          >
            {/* Yellow focus viewfinder box */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FFE11B] flex items-center justify-center text-[#0D0F12] shadow-[0_0_12px_rgba(255,225,27,0.25)] flex-shrink-0">
              <Focus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <span className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-[#F3F4F6] tracking-tight">
              FK Review Finder
            </span>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-sans">
          {/* Theme Mode Toggle */}
          <ThemeToggle />

          {/* Keyboard Shortcuts (Desktop only) */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-white transition-colors font-medium cursor-pointer"
          >
            <Keyboard className="w-4 h-4" />
            <span>Shortcuts</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[10px] font-mono font-bold bg-slate-200 dark:bg-[#1D222A] border border-slate-300 dark:border-[#272D37] rounded text-slate-600 dark:text-[#9CA3AF]">
              ?
            </kbd>
          </button>

          {/* Contact Support Mail */}
          <button
            type="button"
            onClick={() => openSupportEmail({ url: currentUrl })}
            title="Email Support: developer@rohitkumarranjan.in"
            className="p-1.5 sm:px-2 sm:py-1 rounded-md text-slate-600 dark:text-[#9CA3AF] hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium cursor-pointer flex items-center gap-1"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden md:inline">Support</span>
          </button>

          {/* Report Bug */}
          <button
            type="button"
            data-testid={TEST_IDS.HEADER_REPORT_BUG_BTN}
            onClick={onOpenReportBug}
            title="Report an issue"
            className="p-1.5 sm:px-2 sm:py-1 rounded-md text-slate-600 dark:text-[#9CA3AF] hover:text-amber-600 dark:hover:text-[#FFE11B] transition-colors font-medium cursor-pointer flex items-center gap-1"
          >
            <Bug className="w-4 h-4" />
            <span className="hidden md:inline">Report bug</span>
          </button>

          {/* Saved Button */}
          <button
            type="button"
            data-testid={TEST_IDS.HEADER_SAVED_BTN}
            onClick={onOpenSaved}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#272D37] bg-[#F5F7FA] dark:bg-[#14171D] text-slate-800 dark:text-[#F3F4F6] hover:border-amber-500/50 dark:hover:border-[#FFE11B]/40 transition-all cursor-pointer font-medium"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="ml-0.5 sm:ml-1 px-1.5 py-0.2 rounded-full bg-[#FFE11B] text-[#0D0F12] text-[10px] font-black font-mono">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
