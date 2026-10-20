import React from 'react';
import Link from 'next/link';
import { Compass, Home, Search, Mail, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: '404 - Page Not Found | FK Review Finder',
  description: 'The requested review page or resource could not be found.',
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#EDF2F7] dark:bg-[#0D0F12] text-slate-900 dark:text-[#F3F4F6] relative overflow-hidden transition-colors">
      {/* Background radial glow */}
      <div className="absolute w-96 h-96 rounded-full bg-amber-500/10 dark:bg-[#FFE11B]/5 blur-3xl pointer-events-none -top-20 -right-20" />
      <div className="absolute w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl pointer-events-none -bottom-20 -left-20" />

      <div className="max-w-md w-full relative z-10 text-center">
        {/* Tactical Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-[#FFE11B]/10 border border-amber-500/30 dark:border-[#FFE11B]/30 font-mono text-xs text-amber-600 dark:text-[#FFE11B] mb-6">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>STATUS: 404 // RESOURCE_NOT_FOUND</span>
        </div>

        {/* Big Glitch 404 Display */}
        <div className="relative mb-4">
          <h1 className="text-7xl sm:text-8xl font-heading font-black tracking-tighter text-slate-900 dark:text-white select-none">
            4<span className="text-amber-500 dark:text-[#FFE11B]">0</span>4
          </h1>
          <div className="w-16 h-1 bg-amber-500 dark:bg-[#FFE11B] mx-auto rounded-full mt-2" />
        </div>

        {/* Heading & Explanation */}
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Page Not Found
        </h2>
        <p className="text-sm font-sans text-slate-600 dark:text-[#9CA3AF] mb-8 leading-relaxed">
          The review query, direct link, or resource you are trying to reach does not exist, has expired, or may have been relocated.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#FFE11B] text-[#0D0F12] font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#FFE11B]/90 transition-all shadow-md active:scale-98"
          >
            <Home className="w-4 h-4" />
            <span>Return to Search</span>
          </Link>

          <a
            href="mailto:developer@rohitkumarranjan.in?subject=FK%20Review%20Finder%20-%20404%20Broken%20Link%20Report"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-[#272D37] bg-white dark:bg-[#14171D] text-slate-700 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-white font-sans font-medium text-xs transition-all active:scale-98"
          >
            <Mail className="w-4 h-4" />
            <span>Report Broken URL</span>
          </a>
        </div>

        {/* Diagnostic info footer */}
        <div className="mt-12 pt-6 border-t border-slate-300/60 dark:border-[#272D37]/60 font-mono text-[11px] text-slate-500 dark:text-[#6B7280]">
          FK Review Finder Edge Router • Clean URL Normalizer Active
        </div>
      </div>
    </main>
  );
}
