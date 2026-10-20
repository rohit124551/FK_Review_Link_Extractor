'use client';

import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Database,
  RefreshCw,
  Bug,
  ShieldAlert,
  Mail,
} from 'lucide-react';
import { TEST_IDS } from '@/constants/testIds';
import { SourceStatus } from '@/types';
import { openSupportEmail } from '@/lib/supportMail';

interface StatusBarProps {
  status: SourceStatus;
  pagesScanned?: number;
  maxPages?: number;
  responseTimeMs?: number;
  cached?: boolean;
  incidentId?: string;
  failedPages?: number[];
  errorMessage?: string;
  currentUrl?: string;
  onRetry: () => void;
  onReportIncident: (incidentId?: string) => void;
  isLoading?: boolean;
}

export function StatusBar({
  status,
  pagesScanned,
  maxPages,
  responseTimeMs,
  cached,
  incidentId,
  failedPages = [],
  errorMessage,
  currentUrl,
  onRetry,
  onReportIncident,
  isLoading,
}: StatusBarProps) {
  if (status === 'IDLE') return null;

  // Status configuration
  const statusConfig: Record<
    SourceStatus,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    SUCCESS: {
      label: 'SUCCESS',
      bg: 'bg-emerald-100 dark:bg-emerald-950/40',
      text: 'text-emerald-800 dark:text-emerald-400',
      border: 'border-emerald-300 dark:border-emerald-500/40',
      icon: CheckCircle,
    },
    PARTIAL: {
      label: 'PARTIAL',
      bg: 'bg-amber-100 dark:bg-amber-950/40',
      text: 'text-amber-800 dark:text-amber-400',
      border: 'border-amber-300 dark:border-amber-500/40',
      icon: AlertTriangle,
    },
    BLOCKED: {
      label: 'BLOCKED',
      bg: 'bg-rose-100 dark:bg-rose-950/40',
      text: 'text-rose-800 dark:text-rose-400',
      border: 'border-rose-300 dark:border-rose-500/40',
      icon: ShieldAlert,
    },
    INVALID_PRODUCT: {
      label: 'INVALID PRODUCT',
      bg: 'bg-slate-200 dark:bg-slate-900/60',
      text: 'text-slate-800 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-600/40',
      icon: XCircle,
    },
    RATE_LIMITED: {
      label: 'RATE LIMITED',
      bg: 'bg-amber-100 dark:bg-amber-950/40',
      text: 'text-amber-800 dark:text-amber-400',
      border: 'border-amber-300 dark:border-amber-500/40',
      icon: Clock,
    },
    UNAVAILABLE: {
      label: 'UNAVAILABLE',
      bg: 'bg-rose-100 dark:bg-rose-950/40',
      text: 'text-rose-800 dark:text-rose-400',
      border: 'border-rose-300 dark:border-rose-500/40',
      icon: XCircle,
    },
    IDLE: {
      label: 'IDLE',
      bg: 'bg-transparent',
      text: 'text-slate-500 dark:text-[#9CA3AF]',
      border: 'border-transparent',
      icon: Clock,
    },
  };

  const currentCfg = statusConfig[status] || statusConfig.SUCCESS;
  const StatusIcon = currentCfg.icon;

  const isErrorState =
    status === 'BLOCKED' ||
    status === 'INVALID_PRODUCT' ||
    status === 'RATE_LIMITED' ||
    status === 'UNAVAILABLE';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 mt-4" data-testid={TEST_IDS.STATUS_BAR}>
      {/* ── METRIC STATUS BAR ── */}
      <div className="rounded-lg bg-[#F5F7FA] dark:bg-[#14171D] border border-slate-300 dark:border-[#272D37] p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 font-mono text-xs shadow-sm dark:shadow-md transition-colors">
        {/* Source Status Badge */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div
            data-testid={TEST_IDS.STATUS_BADGE}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-black tracking-wider ${currentCfg.bg} ${currentCfg.text} ${currentCfg.border}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{currentCfg.label}</span>
          </div>

          {/* Scanned Pages Info */}
          {pagesScanned !== undefined && (
            <span
              data-testid={TEST_IDS.STATUS_PAGE_INFO}
              className="text-slate-600 dark:text-[#9CA3AF] text-[11px]"
            >
              Scanned{' '}
              <strong className="text-slate-900 dark:text-[#F3F4F6]">{pagesScanned}</strong> of{' '}
              <strong className="text-slate-900 dark:text-[#F3F4F6]">{maxPages || pagesScanned}</strong> pages
            </span>
          )}
        </div>

        {/* Telemetry info */}
        <div className="flex items-center gap-2 text-[11px] w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-0 border-slate-200 dark:border-[#272D37]">
          {responseTimeMs !== undefined && (
            <div
              data-testid={TEST_IDS.STATUS_RESPONSE_TIME}
              className="flex items-center gap-1 text-slate-500 dark:text-[#9CA3AF]"
            >
              <Clock className="w-3 h-3 text-slate-400 dark:text-[#6B7280]" />
              <span>{responseTimeMs}ms</span>
            </div>
          )}

          {cached && (
            <div
              data-testid={TEST_IDS.STATUS_CACHE_HIT}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 font-bold"
            >
              <Database className="w-3 h-3" />
              <span>CACHE HIT</span>
            </div>
          )}

          {incidentId && (
            <div
              data-testid={TEST_IDS.STATUS_INCIDENT_BADGE}
              className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 font-bold font-mono"
            >
              {incidentId}
            </div>
          )}

          <button
            type="button"
            data-testid={TEST_IDS.STATUS_RETRY_BTN}
            onClick={onRetry}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] text-slate-800 dark:text-[#9CA3AF] hover:text-amber-700 dark:hover:text-[#FFE11B] hover:border-amber-500 dark:hover:border-[#FFE11B]/40 transition-colors disabled:opacity-40 cursor-pointer font-bold"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-amber-600 dark:text-[#FFE11B]' : ''}`} />
            <span>RETRY</span>
          </button>
        </div>
      </div>

      {/* ── PARTIAL RESULTS WARNING BANNER ── */}
      {status === 'PARTIAL' && failedPages.length > 0 && (
        <div
          data-testid={TEST_IDS.BANNER_PARTIAL}
          className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/25 border border-amber-300 dark:border-amber-500/40 flex items-start gap-3 text-xs shadow-sm"
        >
          <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-mono">
            <span className="font-bold text-amber-900 dark:text-amber-300 block mb-0.5">
              PARTIAL RESULT DISPATCH:
            </span>
            <span className="text-amber-800 dark:text-[#9CA3AF]">
              Scan halted early. Upstream returned transient errors on pages:{' '}
              <span className="text-amber-950 dark:text-amber-400 font-bold">
                [{failedPages.join(', ')}]
              </span>
              . Cached and completed pages are shown below.
            </span>
          </div>
        </div>
      )}

      {/* ── ERROR BANNER (ROSE) WITH INCIDENT ID & REPORT BUTTON ── */}
      {isErrorState && (
        <div
          data-testid={TEST_IDS.BANNER_ERROR}
          className="p-3.5 sm:p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm"
        >
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-mono font-bold text-rose-900 dark:text-rose-300 text-sm">
                OPERATION FAILED {incidentId ? `[${incidentId}]` : ''}
              </div>
              <p className="text-rose-950 dark:text-[#D1D5DB] mt-1 font-mono text-[11px] leading-relaxed break-words">
                {errorMessage ||
                  'The upstream Flipkart service or token verification encountered a challenge. Full stack frame archived in incident log.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-rose-200 dark:border-rose-900/40">
            <button
              type="button"
              onClick={() =>
                openSupportEmail({
                  incidentId,
                  errorMessage,
                  status,
                  url: currentUrl,
                })
              }
              title="Compose email to developer@rohitkumarranjan.in via Gmail"
              className="flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 rounded-md bg-white hover:bg-slate-100 dark:bg-[#1D222A] dark:hover:bg-[#252B35] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-mono text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>GMAIL SUPPORT</span>
            </button>

            <button
              type="button"
              data-testid={TEST_IDS.BANNER_REPORT_THIS_BTN}
              onClick={() => onReportIncident(incidentId)}
              className="flex-1 sm:flex-initial px-3.5 py-2 sm:py-1.5 rounded-md bg-rose-700 hover:bg-rose-800 text-white dark:bg-rose-900/60 dark:hover:bg-rose-800/80 dark:text-rose-100 border border-rose-700 dark:border-rose-500/40 font-mono text-[11px] font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bug className="w-3.5 h-3.5 text-white dark:text-rose-200" />
              <span>REPORT THIS</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
