'use client';

import React, { useEffect } from 'react';
import { X, Keyboard, Search, Sparkles, Download, Layers, ShieldCheck } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'search' | 'actions' | 'general';
}

const SHORTCUTS: ShortcutItem[] = [
  // Search & Navigation
  {
    keys: ['/'],
    description: 'Focus URL input field',
    category: 'search',
  },
  {
    keys: ['Enter'],
    description: 'Execute review extraction / search',
    category: 'search',
  },
  {
    keys: ['Alt', 'S'],
    description: 'Toggle Saved / Bookmarks drawer',
    category: 'search',
  },

  // Actions & Exports
  {
    keys: ['Alt', 'B'],
    description: 'Open Report Issue / Feedback modal',
    category: 'actions',
  },
  {
    keys: ['Alt', 'C'],
    description: 'Export loaded reviews to CSV (Excel)',
    category: 'actions',
  },

  // General & Interface
  {
    keys: ['?'],
    description: 'Open / close this shortcuts guide',
    category: 'general',
  },
  {
    keys: ['Alt', 'T'],
    description: 'Toggle dark / light tactical theme',
    category: 'general',
  },
  {
    keys: ['Esc'],
    description: 'Close active modal, lightbox, or drawer',
    category: 'general',
  },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#F5F7FA] dark:bg-[#14171D] border border-slate-300 dark:border-[#272D37] rounded-2xl shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-[#F3F4F6]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-300 dark:border-[#272D37]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-[#FFE11B]/15 border border-amber-500/30 dark:border-[#FFE11B]/30 flex items-center justify-center text-amber-600 dark:text-[#FFE11B]">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-[#F3F4F6]">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9CA3AF]">
                Boost your productivity with quick keyboard commands
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1D222A] transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 sm:p-5 max-h-[65vh] overflow-y-auto space-y-5 text-xs font-sans">
          {/* Section 1: Search & Navigation */}
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-500 dark:text-[#6B7280] tracking-wider uppercase mb-2.5">
              <Search className="w-3 h-3" />
              <span>Search & Navigation</span>
            </div>
            <div className="space-y-1.5">
              {SHORTCUTS.filter(s => s.category === 'search').map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#EAEFF5] dark:bg-[#0D0F12] border border-slate-200/80 dark:border-[#1E232B]"
                >
                  <span className="text-slate-700 dark:text-[#D1D5DB]">{s.description}</span>
                  <div className="flex items-center gap-1 font-mono">
                    {s.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-2 py-0.5 text-[11px] font-semibold bg-white dark:bg-[#1A1F26] border border-slate-300 dark:border-[#272D37] rounded shadow-sm text-slate-800 dark:text-[#F3F4F6]"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Actions & Exports */}
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-500 dark:text-[#6B7280] tracking-wider uppercase mb-2.5">
              <Download className="w-3 h-3" />
              <span>Actions & Exports</span>
            </div>
            <div className="space-y-1.5">
              {SHORTCUTS.filter(s => s.category === 'actions').map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#EAEFF5] dark:bg-[#0D0F12] border border-slate-200/80 dark:border-[#1E232B]"
                >
                  <span className="text-slate-700 dark:text-[#D1D5DB]">{s.description}</span>
                  <div className="flex items-center gap-1 font-mono">
                    {s.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-2 py-0.5 text-[11px] font-semibold bg-white dark:bg-[#1A1F26] border border-slate-300 dark:border-[#272D37] rounded shadow-sm text-slate-800 dark:text-[#F3F4F6]"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Interface & General */}
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-500 dark:text-[#6B7280] tracking-wider uppercase mb-2.5">
              <Layers className="w-3 h-3" />
              <span>General & Display</span>
            </div>
            <div className="space-y-1.5">
              {SHORTCUTS.filter(s => s.category === 'general').map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#EAEFF5] dark:bg-[#0D0F12] border border-slate-200/80 dark:border-[#1E232B]"
                >
                  <span className="text-slate-700 dark:text-[#D1D5DB]">{s.description}</span>
                  <div className="flex items-center gap-1 font-mono">
                    {s.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-2 py-0.5 text-[11px] font-semibold bg-white dark:bg-[#1A1F26] border border-slate-300 dark:border-[#272D37] rounded shadow-sm text-slate-800 dark:text-[#F3F4F6]"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer tip */}
        <div className="p-3 sm:px-5 border-t border-slate-300 dark:border-[#272D37] bg-slate-100/50 dark:bg-[#0E1014] text-[11px] font-mono text-slate-500 dark:text-[#9CA3AF] flex items-center justify-between">
          <span>ProTip: Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#1D222A] border border-slate-300 dark:border-[#272D37] rounded text-slate-800 dark:text-slate-200 font-bold">?</kbd> anywhere to toggle this guide</span>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
