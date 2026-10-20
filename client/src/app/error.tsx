'use client';

import React, { useEffect, useState } from 'react';
import { AlertOctagon, RotateCcw, Trash2, Mail, ChevronDown, ChevronUp } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [incidentId, setIncidentId] = useState('');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    // Generate an incident tracking code
    const id = `INC-CRASH-${Math.floor(100000 + Math.random() * 900000)}`;
    setIncidentId(id);

    console.error('Captured Runtime Error:', error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#EDF2F7] dark:bg-[#0D0F12] text-slate-900 dark:text-[#F3F4F6] relative transition-colors">
      <div className="max-w-lg w-full bg-white dark:bg-[#14171D] border border-rose-300 dark:border-rose-900/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 font-mono text-xs text-rose-600 dark:text-rose-400 mb-4">
          <AlertOctagon className="w-4 h-4" />
          <span>RUNTIME ERROR {incidentId ? `• ${incidentId}` : ''}</span>
        </div>

        {/* Header */}
        <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-sm font-sans text-slate-600 dark:text-[#9CA3AF] mb-6 leading-relaxed">
          An unexpected error occurred while rendering the page. Your search data is safe, but the current view needs to be reloaded.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFE11B] text-[#0D0F12] font-heading font-bold text-xs uppercase tracking-wider hover:bg-[#FFE11B]/90 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            type="button"
            onClick={handleClearCacheAndReload}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-[#272D37] bg-slate-100 dark:bg-[#1D222A] text-slate-700 dark:text-[#D1D5DB] hover:text-slate-900 dark:hover:text-white font-sans font-medium text-xs transition-all cursor-pointer active:scale-98"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Clear Cache & Reset</span>
          </button>
        </div>

        {/* Technical Diagnostics Accordion */}
        <div className="border-t border-slate-200 dark:border-[#272D37] pt-4">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between text-xs font-mono text-slate-500 dark:text-[#6B7280] hover:text-slate-700 dark:hover:text-[#9CA3AF] cursor-pointer"
          >
            <span>Technical Diagnostics</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 p-3 rounded-lg bg-slate-100 dark:bg-[#0D0F12] border border-slate-200 dark:border-[#272D37] font-mono text-[11px] text-rose-600 dark:text-rose-400 overflow-x-auto whitespace-pre-wrap">
              <div className="font-bold text-slate-800 dark:text-slate-300 mb-1">
                {error.name || 'Error'}: {error.message || 'Unknown runtime exception'}
              </div>
              {error.digest && <div>Digest: {error.digest}</div>}
              {error.stack && (
                <div className="mt-2 text-slate-500 dark:text-[#6B7280] text-[10px] max-h-36 overflow-y-auto">
                  {error.stack}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Support Link */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#272D37] flex items-center justify-between text-xs font-sans text-slate-500 dark:text-[#6B7280]">
          <span>Need immediate help?</span>
          <a
            href={`mailto:developer@rohitkumarranjan.in?subject=FK%20Review%20Crash%20Report%20${incidentId}&body=Incident:%20${incidentId}%0AError:%20${encodeURIComponent(error.message || '')}`}
            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Developer</span>
          </a>
        </div>
      </div>
    </main>
  );
}
