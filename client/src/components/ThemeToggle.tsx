'use client';

import * as React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-8 w-8 sm:w-24 rounded-lg bg-[#E2E8F0] dark:bg-[#14171D] border border-slate-300 dark:border-[#272D37] opacity-60" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <>
      {/* ── Mobile: Single 1-Tap Toggle (Dark ⇄ Light, inherits system mode on 1st load) ── */}
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={`Current: ${theme === 'system' ? 'System (' + resolvedTheme + ')' : resolvedTheme}. Tap to switch to ${isDark ? 'Light' : 'Dark'} mode`}
        aria-label="Toggle theme mode"
        className="flex md:hidden p-2 rounded-lg border border-slate-300 dark:border-[#272D37] bg-[#E2E8F0] dark:bg-[#14171D] text-slate-700 dark:text-[#FFE11B] hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 cursor-pointer shadow-xs"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 fill-slate-700/20" />
        )}
      </button>

      {/* ── Desktop: 3-Option Segmented Selector (Light / Dark / Auto) ── */}
      <div className="hidden md:flex items-center p-0.5 rounded-lg border border-slate-300 dark:border-[#272D37] bg-[#E2E8F0] dark:bg-[#14171D] text-xs font-mono shadow-xs">
        {/* Light Option */}
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
            theme === 'light'
              ? 'bg-[#F5F7FA] text-amber-600 font-bold border border-slate-300 shadow-xs'
              : 'text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F3F4F6]'
          }`}
          title="Light mode (Soft tinted palette)"
          aria-label="Light mode"
        >
          <Sun className="w-3.5 h-3.5" />
          <span className="text-[10px]">Light</span>
        </button>

        {/* Dark Option */}
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
            theme === 'dark'
              ? 'bg-[#FFE11B] text-[#0D0F12] font-black shadow-xs'
              : 'text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F3F4F6]'
          }`}
          title="Dark mode (Tactical dark palette)"
          aria-label="Dark mode"
        >
          <Moon className="w-3.5 h-3.5" />
          <span className="text-[10px]">Dark</span>
        </button>

        {/* System Option */}
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
            theme === 'system'
              ? 'bg-[#CBD5E1] dark:bg-[#272D37] text-slate-900 dark:text-[#FFE11B] font-bold shadow-xs'
              : 'text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F3F4F6]'
          }`}
          title="System Auto mode (Default)"
          aria-label="System mode"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span className="text-[10px]">Auto</span>
        </button>
      </div>
    </>
  );
}
