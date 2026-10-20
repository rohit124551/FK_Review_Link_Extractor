'use client';

import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle2, Mail, ExternalLink } from 'lucide-react';
import { TEST_IDS } from '@/constants/testIds';
import { reportBug } from '@/lib/api';
import { SUPPORT_EMAIL, openSupportEmail } from '@/lib/supportMail';
import { toast } from 'sonner';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId?: string;
  currentUrl?: string;
}

export function ReportBugModal({
  isOpen,
  onClose,
  incidentId,
  currentUrl,
}: ReportBugModalProps) {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a description of the issue');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await reportBug({
        incidentId,
        message: message.trim(),
        contact: contact.trim() || undefined,
        pageUri: currentUrl,
        reportedAt: new Date().toISOString(),
      });

      setSubmittedReportId(res.reportId);
      toast.success(`Report logged under reference ${res.reportId}`);
    } catch {
      toast.error('Failed to submit report. Please try emailing support directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setMessage('');
    setContact('');
    setSubmittedReportId(null);
    onClose();
  };

  const handleDirectEmail = () => {
    const trackingRef = submittedReportId || incidentId;
    openSupportEmail({
      incidentId: trackingRef,
      url: currentUrl,
      customMessage: message.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      data-testid={TEST_IDS.BUG_MODAL}
    >
      <div className="w-full max-w-lg bg-[#F5F7FA] dark:bg-[#14171D] border border-slate-300 dark:border-[#272D37] rounded-xl shadow-2xl p-4 sm:p-6 relative transition-colors">
        <button
          type="button"
          onClick={handleReset}
          className="absolute top-4 right-4 text-slate-500 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F3F4F6] p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#1D222A] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-[#F3F4F6]">
              REPORT AN ISSUE
            </h3>
            <p className="font-sans text-xs text-slate-600 dark:text-[#9CA3AF]">
              Let us know what went wrong so we can fix it
            </p>
          </div>
        </div>

        {submittedReportId ? (
          <div className="py-4 flex flex-col items-center text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-[#F3F4F6]">
              Report Submitted
            </h4>
            
            {/* Bug Report ID */}
            <div className="w-full p-3.5 rounded-lg bg-slate-200/60 dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] text-left font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-[#9CA3AF]">BUG REPORT ID:</span>
                <span className="text-amber-600 dark:text-[#FFE11B] font-bold text-sm">{submittedReportId}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#9CA3AF] max-w-sm">
              Thank you for reporting. Our engineering team has received your submission.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
              <button
                type="button"
                onClick={handleDirectEmail}
                className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>EMAIL SUPPORT</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-1/2 px-4 py-2 rounded-lg bg-[#FFE11B] text-[#0D0F12] font-mono text-xs font-bold hover:bg-[#ffe642] transition-colors cursor-pointer"
              >
                DONE
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {incidentId && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 flex items-center justify-between font-mono text-xs">
                <span className="text-rose-800 dark:text-rose-300 font-medium">LINKED INCIDENT:</span>
                <span className="text-rose-900 dark:text-rose-200 font-bold">{incidentId}</span>
              </div>
            )}

            <div>
              <label className="block font-mono text-[11px] font-semibold tracking-wider text-slate-700 dark:text-[#9CA3AF] uppercase mb-1.5">
                Issue Description *
              </label>
              <textarea
                data-testid={TEST_IDS.BUG_MESSAGE_INPUT}
                required
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="What happened? (e.g. rate limit encountered on page 3, missing reviewer tags, layout drift)..."
                className="w-full rounded-lg bg-[#E5EBF2] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] p-3 text-xs text-slate-900 dark:text-[#F3F4F6] placeholder-slate-500 dark:placeholder-[#6B7280] focus:outline-none focus:border-[#FFE11B] transition-colors resize-none font-sans"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] font-semibold tracking-wider text-slate-700 dark:text-[#9CA3AF] uppercase mb-1.5">
                Your Contact Email / Identifier (Optional)
              </label>
              <input
                type="text"
                data-testid={TEST_IDS.BUG_CONTACT_INPUT}
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="email@example.com for status updates"
                className="w-full rounded-lg bg-[#E5EBF2] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] px-3 py-2 text-xs text-slate-900 dark:text-[#F3F4F6] placeholder-slate-500 dark:placeholder-[#6B7280] focus:outline-none focus:border-[#FFE11B] transition-colors font-mono"
              />
            </div>

            {/* Direct Support Mail Option */}
            <div className="pt-1 flex items-center justify-between text-xs text-slate-600 dark:text-[#9CA3AF]">
              <span>Need help?</span>
              <button
                type="button"
                onClick={handleDirectEmail}
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs cursor-pointer"
                title={`Email: ${SUPPORT_EMAIL}`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="inline sm:hidden">Email Developer</span>
                <span className="hidden sm:inline">{SUPPORT_EMAIL}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                data-testid={TEST_IDS.BUG_CANCEL_BTN}
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-[#272D37] text-slate-700 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-[#F3F4F6] hover:bg-slate-200 dark:hover:bg-[#1D222A] font-mono text-xs font-semibold transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                data-testid={TEST_IDS.BUG_SUBMIT_BTN}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-[#FFE11B] text-[#0D0F12] font-mono text-xs font-bold hover:bg-[#ffe642] disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <span>SUBMITTING...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>SUBMIT REPORT</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
