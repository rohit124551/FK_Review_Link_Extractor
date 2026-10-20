'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '@/components/common/Header';
import { SavedDrawer } from '@/components/common/SavedDrawer';
import { ReportBugModal } from '@/components/common/ReportBugModal';
import { ShortcutsModal } from '@/components/common/ShortcutsModal';
import { ImageModal } from '@/components/common/ImageModal';
import { OnboardingBanner } from '@/components/common/OnboardingBanner';
import { LegalModal } from '@/components/common/LegalModal';
import { Hero } from '@/components/finder/Hero';
import { SearchPanel } from '@/components/finder/SearchPanel';
import { StatusBar } from '@/components/finder/StatusBar';
import { ResultsHeader } from '@/components/finder/ResultsHeader';
import { ResultsFilterBar } from '@/components/finder/ResultsFilterBar';
import { ReviewCard } from '@/components/finder/ReviewCard';
import { Mail, ShieldCheck, RotateCcw } from 'lucide-react';
import { SUPPORT_EMAIL, openSupportEmail } from '@/lib/supportMail';
import { useTheme } from 'next-themes';

import {
  Review,
  SearchMode,
  SortOrder,
  SourceStatus,
  ReviewFetchResponse,
  SearchByNameResponse,
} from '@/types';
import { fetchReviews, searchReviewsByName } from '@/lib/api';
import {
  saveBookmark,
  removeBookmarkByUrl,
  isUrlBookmarked,
  addHistoryItem,
  getBookmarks,
  getSavedReviews,
} from '@/lib/storage';
import {
  exportReviewsToCsv,
} from '@/lib/exportUtils';
import { toast } from 'sonner';

export default function ReviewFinderPage() {
  // Search parameters
  const [url, setUrl] = useState<string>('');
  const [mode, setMode] = useState<SearchMode>('page');
  const [sortOrder, setSortOrder] = useState<SortOrder>('MOST_RECENT');
  const [page, setPage] = useState<number>(1);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [maxPages, setMaxPages] = useState<number>(4);

  // Results & status state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<SourceStatus>('IDLE');
  const [productName, setProductName] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasMorePages, setHasMorePages] = useState<boolean>(false);
  const [pagesScanned, setPagesScanned] = useState<number | undefined>(undefined);
  const [responseTimeMs, setResponseTimeMs] = useState<number | undefined>(undefined);
  const [cached, setCached] = useState<boolean>(false);
  const [incidentId, setIncidentId] = useState<string | undefined>(undefined);
  const [failedPages, setFailedPages] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  // Theme & Shortcuts
  const { resolvedTheme, setTheme } = useTheme();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Modals & drawers
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms'>('privacy');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // In-results local filters
  const [inReviewSearch, setInReviewSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [photosOnly, setPhotosOnly] = useState(false);
  const [certifiedOnly, setCertifiedOnly] = useState(false);

  const handleOpenLegal = (tab: 'privacy' | 'terms') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  // Update bookmark status
  useEffect(() => {
    setIsBookmarked(isUrlBookmarked(url, mode));
    setSavedCount(getBookmarks().length + getSavedReviews().length);
  }, [url, mode]);

  // Execute Search
  const handleExecuteSearch = useCallback(async () => {
    if (!url.trim()) {
      toast.error('Please enter a Flipkart product URL');
      return;
    }

    setIsLoading(true);
    setIncidentId(undefined);
    setErrorMessage(undefined);
    setFailedPages([]);

    try {
      if (mode === 'page') {
        const res: ReviewFetchResponse = await fetchReviews(
          url,
          page,
          sortOrder
        );
        setStatus(res.status);
        setProductName(res.productName);
        setReviews(res.reviews);
        setHasMorePages(res.hasMorePages);
        setPagesScanned(1);
        setResponseTimeMs(res.latencyMs);
        setCached(res.cached);
        setIncidentId(res.incidentId);
        setFailedPages(res.failedPages || []);
        setErrorMessage(res.message);

        if (res.status === 'SUCCESS') {
          toast.success(`Loaded ${res.reviews.length} reviews for Page ${page}`);
          addHistoryItem({
            url,
            productName: res.productName,
            mode: 'page',
            sortOrder,
            page,
            reviewCount: res.reviews.length,
            status: res.status,
          });
        } else {
          toast.error(
            `Failed to fetch reviews: ${res.message || res.status} [${res.incidentId}]`
          );
        }
      } else {
        // Reviewer Name Search mode
        if (!reviewerName.trim()) {
          toast.error('Please enter a reviewer name to search');
          setIsLoading(false);
          return;
        }

        const res: SearchByNameResponse = await searchReviewsByName(
          url,
          reviewerName,
          maxPages,
          sortOrder
        );
        setStatus(res.status);
        setProductName(res.productName);
        setReviews(res.reviews);
        setPagesScanned(res.pagesScanned);
        setResponseTimeMs(res.latencyMs || 840);
        setCached(res.cached || false);
        setIncidentId(res.incidentId);
        setFailedPages(res.failedPages || []);
        setErrorMessage(res.message);

        if (res.status === 'SUCCESS' || res.status === 'PARTIAL') {
          toast.success(
            `Found ${res.reviews.length} reviews matching "${reviewerName}"`
          );
          addHistoryItem({
            url,
            productName: res.productName,
            mode: 'reviewer',
            sortOrder,
            reviewerName,
            reviewCount: res.reviews.length,
            status: res.status,
          });
        } else {
          toast.error(
            `Search stopped: ${res.message || res.status} [${res.incidentId}]`
          );
        }
      }
    } catch (err: any) {
      setStatus('UNAVAILABLE');
      const inc = `INC-${Math.floor(100000 + Math.random() * 900000)}`;
      setIncidentId(inc);
      setErrorMessage(err.message || 'Network exception during server proxying');
      toast.error(`Operation failed [${inc}]`);
    } finally {
      setIsLoading(false);
      setSavedCount(getBookmarks().length);
    }
  }, [url, mode, page, sortOrder, reviewerName, maxPages]);

  // Handle toggling bookmark (save / unsave)
  const handleToggleBookmark = () => {
    if (!url.trim()) return;

    if (isBookmarked) {
      removeBookmarkByUrl(url, mode);
      setIsBookmarked(false);
      setSavedCount(getBookmarks().length);
      toast.info('Removed from saved bookmarks');
    } else {
      saveBookmark({
        title: productName || 'Flipkart Product Search',
        url,
        mode,
        sortOrder,
        page: mode === 'page' ? page : undefined,
        reviewerName: mode === 'reviewer' ? reviewerName : undefined,
        maxPages: mode === 'reviewer' ? maxPages : undefined,
      });
      setIsBookmarked(true);
      setSavedCount(getBookmarks().length);
      toast.success('Search bookmarked to local storage');
    }
  };

  // Restore saved query from drawer
  const handleApplySaved = (saved: {
    url: string;
    mode: SearchMode;
    sortOrder: SortOrder;
    page?: number;
    reviewerName?: string;
    maxPages?: number;
  }) => {
    setUrl(saved.url);
    setMode(saved.mode);
    setSortOrder(saved.sortOrder);
    if (saved.page) setPage(saved.page);
    if (saved.reviewerName) setReviewerName(saved.reviewerName);
    if (saved.maxPages) setMaxPages(saved.maxPages);
    setInReviewSearch('');
    setRatingFilter('all');
    setPhotosOnly(false);
    setCertifiedOnly(false);
    toast.info('Restored search parameters');
  };

  // Filter loaded reviews locally by inReviewSearch, ratingFilter, photos, certified
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      if (ratingFilter !== 'all' && rev.rating !== ratingFilter) return false;
      if (photosOnly && (!rev.images || rev.images.length === 0)) return false;
      if (certifiedOnly && !rev.certifiedBuyer) return false;
      if (inReviewSearch.trim()) {
        const q = inReviewSearch.trim().toLowerCase();
        const matchTitle = (rev.title || '').toLowerCase().includes(q);
        const matchText = (rev.text || '').toLowerCase().includes(q);
        const matchAuthor = (rev.author || '').toLowerCase().includes(q);
        const matchLocation = (rev.location || '').toLowerCase().includes(q);
        const matchAttrs = (rev.productAttributes || []).some(a => a.toLowerCase().includes(q));
        if (!matchTitle && !matchText && !matchAuthor && !matchLocation && !matchAttrs) {
          return false;
        }
      }
      return true;
    });
  }, [reviews, ratingFilter, photosOnly, certifiedOnly, inReviewSearch]);

  // Exports
  const handleExportCsv = useCallback(() => {
    const toExport = filteredReviews.length > 0 ? filteredReviews : reviews;
    exportReviewsToCsv(toExport, productName);
    toast.success(`Exported ${toExport.length} reviews to CSV`);
  }, [filteredReviews, reviews, productName]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Escape: Close active dialogs
      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsBugModalOpen(false);
        setIsSavedDrawerOpen(false);
        setPreviewImage(null);
        return;
      }

      // Alt + T: Toggle theme
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
        toast.info(`Switched to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`);
        return;
      }

      // Alt + S: Toggle Saved drawer
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setIsSavedDrawerOpen(prev => !prev);
        return;
      }

      // Alt + B: Open Report Bug modal
      if (e.altKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setIsBugModalOpen(prev => !prev);
        return;
      }

      // Alt + C: Export to CSV
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        if (reviews.length > 0) {
          handleExportCsv();
        } else {
          toast.error('No reviews loaded to export');
        }
        return;
      }

      // Prevent single-key shortcuts if user is typing
      if (isInput) return;

      // Question mark (?): Toggle Shortcuts modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
        return;
      }

      // Forward slash (/): Focus URL input
      if (e.key === '/') {
        e.preventDefault();
        const inputEl = (document.querySelector('input[data-testid="search-url-input"]') ||
          document.querySelector('input[data-testid="url-input"]')) as HTMLInputElement | null;
        if (inputEl) {
          inputEl.focus();
          inputEl.select();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [resolvedTheme, setTheme, reviews, handleExportCsv]);

  return (
    <div className="min-h-screen flex flex-col bg-[#EDF2F7] dark:bg-[#0D0F12] text-slate-900 dark:text-[#F3F4F6] transition-colors">
      {/* ── HEADER ── */}
      <Header
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        onOpenReportBug={() => setIsBugModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        savedCount={savedCount}
        currentUrl={url}
      />

      <main className="flex-1 px-3 sm:px-6 pb-12 sm:pb-16">
        {/* ── HERO BANNER ── */}
        <Hero />

        {/* ── ONBOARDING GUIDE BANNER (First-time visitors) ── */}
        <OnboardingBanner
          onApplyDemoUrl={demoUrl => {
            setUrl(demoUrl);
            toast.info('Loaded demo Flipkart product URL');
            const el = document.querySelector('input[data-testid="search-url-input"]') || document.querySelector('input[placeholder*="flipkart.com"]');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
        />

        {/* ── SEARCH PANEL ── */}
        <SearchPanel
          url={url}
          setUrl={setUrl}
          mode={mode}
          setMode={setMode}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          page={page}
          setPage={p => {
            setPage(p);
          }}
          reviewerName={reviewerName}
          setReviewerName={setReviewerName}
          maxPages={maxPages}
          setMaxPages={setMaxPages}
          onSearch={handleExecuteSearch}
          isLoading={isLoading}
          onBookmark={handleToggleBookmark}
          isBookmarked={isBookmarked}
        />

        {/* ── STATUS BAR & BANNERS ── */}
        <StatusBar
          status={status}
          pagesScanned={pagesScanned}
          maxPages={mode === 'reviewer' ? maxPages : 1}
          responseTimeMs={responseTimeMs}
          cached={cached}
          incidentId={incidentId}
          failedPages={failedPages}
          errorMessage={errorMessage}
          currentUrl={url}
          onRetry={handleExecuteSearch}
          onReportIncident={inc => {
            setIncidentId(inc);
            setIsBugModalOpen(true);
          }}
          isLoading={isLoading}
        />

        {/* ── RESULTS HEADER: PRODUCT & EXPORTS ── */}
        <ResultsHeader
          productName={productName}
          totalReviews={reviews.length}
          mode={mode}
          currentPage={page}
          hasMorePages={hasMorePages}
          onPageChange={newPage => {
            setPage(newPage);
            setTimeout(() => {
              handleExecuteSearch();
            }, 50);
          }}
          onExportCsv={handleExportCsv}
          isLoading={isLoading}
        />

        {/* ── IN-RESULTS LOCAL SEARCH & FILTER BAR ── */}
        <ResultsFilterBar
          totalLoaded={reviews.length}
          filteredCount={filteredReviews.length}
          searchQuery={inReviewSearch}
          onSearchChange={setInReviewSearch}
          ratingFilter={ratingFilter}
          onRatingFilterChange={setRatingFilter}
          photosOnly={photosOnly}
          onPhotosOnlyChange={setPhotosOnly}
          certifiedOnly={certifiedOnly}
          onCertifiedOnlyChange={setCertifiedOnly}
          onResetFilters={() => {
            setInReviewSearch('');
            setRatingFilter('all');
            setPhotosOnly(false);
            setCertifiedOnly(false);
          }}
        />

        {/* ── REVIEW CARDS LIST ── */}
        <section aria-label="Customer Reviews" className="space-y-4 mt-4">
          {reviews.length === 0 ? (
            <div className="w-full max-w-4xl mx-auto py-10 px-4 sm:p-16 text-center rounded-xl border border-dashed border-slate-300 dark:border-[#272D37] bg-[#F5F7FA]/70 dark:bg-[#14171D]/30 font-mono text-xs text-slate-600 dark:text-[#6B7280]">
              {url.trim() ? 'No reviews found for this query.' : 'Awaiting a product link.'}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="w-full max-w-4xl mx-auto py-10 px-4 text-center rounded-xl border border-dashed border-slate-300 dark:border-[#272D37] bg-[#F5F7FA]/70 dark:bg-[#14171D]/30 font-mono text-xs text-slate-600 dark:text-[#6B7280] space-y-3">
              <p>No reviews match your current in-results filters.</p>
              <button
                type="button"
                onClick={() => {
                  setInReviewSearch('');
                  setRatingFilter('all');
                  setPhotosOnly(false);
                  setCertifiedOnly(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFE11B] text-[#0D0F12] font-black font-sans text-xs shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          ) : (
            filteredReviews.map((rev, index) => (
              <ReviewCard
                key={rev.id || index}
                review={rev}
                index={index}
                productName={productName}
                productUrl={url}
                searchQuery={inReviewSearch || (mode === 'reviewer' ? reviewerName : undefined)}
                onPreviewImage={img => setPreviewImage(img)}
                onSavedChange={() => {
                  setSavedCount(getBookmarks().length + getSavedReviews().length);
                }}
              />
            ))
          )}
        </section>
      </main>

      {/* ── MODALS & DRAWERS ── */}
      <SavedDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => {
          setIsSavedDrawerOpen(false);
          setSavedCount(getBookmarks().length + getSavedReviews().length);
        }}
        onApplySaved={handleApplySaved}
      />

      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
        incidentId={incidentId}
        currentUrl={url}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ImageModal
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />

      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-300 dark:border-[#272D37] py-4 pb-8 sm:pb-4 px-4 sm:px-6 bg-[#EDF2F7] dark:bg-[#0D0F12] font-mono text-[11px] text-slate-600 dark:text-[#6B7280] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          {/* Brand & Legal Links with clean flex-wrap & whitespace protection */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 sm:gap-x-3 gap-y-1">
            <span className="font-semibold tracking-wide text-slate-700 dark:text-slate-300 whitespace-nowrap">
              FK Review Finder
            </span>
            <span className="text-slate-400 dark:text-[#272D37]">•</span>
            <button
              type="button"
              onClick={() => handleOpenLegal('privacy')}
              className="hover:text-slate-900 dark:hover:text-[#F3F4F6] transition-colors cursor-pointer whitespace-nowrap"
            >
              Privacy Policy
            </button>
            <span className="text-slate-400 dark:text-[#272D37]">•</span>
            <button
              type="button"
              onClick={() => handleOpenLegal('terms')}
              className="hover:text-slate-900 dark:hover:text-[#F3F4F6] transition-colors cursor-pointer whitespace-nowrap"
            >
              Terms of Service
            </button>
          </div>

          {/* Socials & Support Contact */}
          <div className="flex items-center justify-center gap-4 shrink-0 pt-1 sm:pt-0">
            {/* GitHub */}
            <a
              href="https://github.com/rohit124551"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub: rohit124551"
              className="inline-flex items-center gap-1.5 text-slate-600 dark:text-[#9CA3AF] hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/rohitkumarranjan"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn: rohitkumarranjan"
              className="inline-flex items-center gap-1.5 text-slate-600 dark:text-[#9CA3AF] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
              </svg>
              <span className="hidden sm:inline">LinkedIn</span>
            </a>

            {/* Contact Email */}
            <button
              type="button"
              onClick={() => openSupportEmail({ url })}
              title="Email support: developer@rohitkumarranjan.in"
              className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="sm:hidden">Support</span>
              <span className="hidden sm:inline">Contact: {SUPPORT_EMAIL}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
