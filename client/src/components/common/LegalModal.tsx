'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, FileText, CheckCircle, Lock, ServerOff, RefreshCw } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export function LegalModal({
  isOpen,
  onClose,
  initialTab = 'privacy',
}: LegalModalProps) {
  const [tab, setTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#14171D] border border-slate-300 dark:border-[#272D37] rounded-xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#272D37] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#FFE11B]/15 border border-[#FFE11B]/30 flex items-center justify-center text-slate-900 dark:text-[#FFE11B]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-[#F3F4F6]">
              Legal & Transparency Center
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-[#272D37] px-5 bg-slate-50 dark:bg-[#0D0F12]/60">
          <button
            type="button"
            onClick={() => setTab('privacy')}
            className={`py-2.5 px-4 font-sans text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              tab === 'privacy'
                ? 'border-[#FFE11B] text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('terms')}
            className={`py-2.5 px-4 font-sans text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              tab === 'terms'
                ? 'border-[#FFE11B] text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs font-sans text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
          {tab === 'privacy' ? (
            <>
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <ServerOff className="w-4 h-4 text-emerald-500" />
                  100% Client-Side Local Storage
                </h4>
                <p>
                  We prioritize user privacy. All search history, saved review bookmarks, active search parameters, and display preferences are stored exclusively on your device inside your browser’s <code className="font-mono text-[11px] bg-slate-100 dark:bg-[#1D222A] px-1 py-0.5 rounded">localStorage</code>. We do not maintain user accounts, databases, or cookies tracking your identity.
                </p>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  No Tracking Cookies or Ad Networks
                </h4>
                <p>
                  This application does not load third-party ad networks, telemetry trackers, or invasive analytics pixels. Your search queries and product links are only communicated directly to our Cloudflare edge worker to fetch public review data from Flipkart Rome endpoints.
                </p>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-blue-500" />
                  Voluntary Bug & Incident Reports
                </h4>
                <p>
                  When you submit a bug report via the &quot;Report Bug&quot; button, the report message, optional contact details, target URL, and error incident IDs are transmitted securely to developer discord webhooks to diagnose edge scraper issues. No private information is harvested.
                </p>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                  Complete Data Control
                </h4>
                <p>
                  You can permanently delete all local bookmarks, history, and stored preferences at any time using the &quot;Clear All Data&quot; option in the Saved Archives drawer or by clearing your browser cache.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                  1. Analytical Purpose & Fair Use
                </h4>
                <p>
                  Flipkart Review Finder is an independent, non-commercial analytical utility designed to help buyers and researchers search, filter, and reference public customer reviews and verified feedback on Flipkart products.
                </p>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                  2. Third-Party Disclaimer
                </h4>
                <p>
                  This project is not affiliated with, authorized, maintained, sponsored, or in any way officially connected with Flipkart Internet Private Limited, Walmart, or any of their subsidiaries or affiliates. &quot;Flipkart&quot; as well as related names, marks, and images are registered trademarks of their respective owners.
                </p>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                  3. Rate Limiting & Acceptable Use
                </h4>
                <p>
                  To protect public endpoints and edge infrastructure, automated spamming, denial-of-service, or brute-force scraping through this interface is restricted. An automated rate limit of 60 requests per minute is enforced per IP.
                </p>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                  4. Warranty & Liability
                </h4>
                <p>
                  This utility is provided &quot;as-is&quot; without warranties of any kind. Availability is subject to upstream Flipkart endpoint accessibility.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-[#272D37] flex items-center justify-between bg-slate-50 dark:bg-[#0D0F12]/60 font-mono text-[11px] text-slate-500">
          <span>Effective Date: 2026 • Version 2.0</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#FFE11B] text-[#0D0F12] font-heading font-bold text-xs uppercase cursor-pointer hover:bg-[#FFE11B]/90 transition-all"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
