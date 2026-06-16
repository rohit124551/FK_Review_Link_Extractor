'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';
import { Download, Link2, Copy, Search, RefreshCw, FileSearch, CheckCircle2, AlertCircle, Star, User, ExternalLink, ArrowRight, Sparkles, ThumbsUp, ShieldCheck, Check, ChevronDown, Lock, Smartphone, Monitor, HelpCircle, Globe, Clipboard, Keyboard } from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   STAR RATING COMPONENT
   ═══════════════════════════════════════════════════════ */
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(
        <Star key={i} className="fill-amber-400 text-amber-400" style={{ width: size, height: size }} />
      );
    } else if (i - rating < 1 && i - rating > 0) {
      stars.push(
        <div key={i} className="relative" style={{ width: size, height: size }}>
          <Star className="absolute text-slate-200 dark:text-slate-700" style={{ width: size, height: size }} />
          <div className="absolute overflow-hidden" style={{ width: `${(rating % 1) * 100}%` }}>
            <Star className="fill-amber-400 text-amber-400" style={{ width: size, height: size }} />
          </div>
        </div>
      );
    } else {
      stars.push(
        <Star key={i} className="text-slate-200 dark:text-slate-700" style={{ width: size, height: size }} />
      );
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

/* ═══════════════════════════════════════════════════════
   AVATAR COMPONENT
   ═══════════════════════════════════════════════════════ */
function Avatar({ name }: { name: string }) {
  const initials = (name || 'A')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  
  const colors = [
    'bg-[#d97706]',
    'bg-cyan-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-teal-600',
  ];
  
  const colorIndex = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  
  return (
    <div className={`w-8 h-8 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>
      {initials}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   REVIEW CARD
   ═══════════════════════════════════════════════════════ */
function ReviewCard({ rev, index }: { rev: any; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const textLength = rev.text?.length || 0;
  const isLong = textLength > 400;
  const displayText = (isLong && !isExpanded) ? rev.text.substring(0, 400) + '...' : rev.text;

  const handleCopy = () => {
    navigator.clipboard.writeText(rev.permalink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="glass-card rounded-2xl p-6 animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <StarRating rating={rev.rating || 0} />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{rev.rating}/5</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rev.certifiedBuyer && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      {rev.title && (
        <h3 className="font-semibold text-[15px] text-slate-900 dark:text-slate-100 mb-2 leading-snug">{rev.title}</h3>
      )}

      {/* Body */}
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-1">
        {displayText}
      </p>
      {isLong && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-[#d97706] dark:text-[#d97706] hover:text-[#b45309] mb-4 transition-colors"
        >
          {isExpanded ? '← Show less' : 'Read more →'}
        </button>
      )}
      {!isLong && <div className="mb-4" />}

      {/* Attributes */}
      {rev.attributes && Object.keys(rev.attributes).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(rev.attributes).map(([key, val]) => (
            <span key={key} className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg font-medium">
              {key}: <span className="text-slate-900 dark:text-slate-200">{val as string}</span>
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={rev.author || 'Anonymous'} />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{rev.author || 'Anonymous'}</span>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              {rev.location && <span>{rev.location}</span>}
              {rev.location && rev.created && <span>·</span>}
              {rev.created && <span>{rev.created}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {rev.helpfulCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-[#d97706] dark:text-[#d97706] bg-[#fef3c7] dark:bg-[#d97706]/10 px-2.5 py-1 rounded-full">
              <ThumbsUp className="w-3 h-3" />
              {rev.helpfulCount}
            </span>
          )}
          {rev.permalink && (
            <>
              <a 
                href={rev.permalink} 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#d97706] hover:bg-[#fef3c7] dark:hover:bg-[#d97706]/10 transition-all duration-200"
                title="Open on Flipkart"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleCopy}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#d97706] hover:bg-[#fef3c7] dark:hover:bg-[#d97706]/10 transition-all duration-200"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOAST COMPONENT
   ═══════════════════════════════════════════════════════ */
function Toast({ message, type, onDismiss }: { message: string; type: 'error' | 'success'; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3200);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`fixed top-6 right-6 z-50 animate-slide-in-right max-w-sm`}>
      <div className={`glass rounded-xl shadow-2xl overflow-hidden ${
        type === 'error' ? 'border-red-200 dark:border-red-500/20' : 'border-[#cbd5e1]/40 dark:border-[#d97706]/20'
      }`}>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            type === 'error' 
              ? 'bg-red-100 dark:bg-red-500/15 text-red-500' 
              : 'bg-[#fef3c7] dark:bg-[#d97706]/15 text-[#d97706]'
          }`}>
            {type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">{message}</p>
        </div>
        {/* Progress bar */}
        <div className={`h-0.5 animate-progress ${
          type === 'error' 
            ? 'bg-red-500' 
            : 'bg-[#d97706]'
        }`} />
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   LINK NORMALIZER & VALIDATOR
   ═══════════════════════════════════════════════════════ */
function normalizeFlipkartUrl(inputUrl: string): { cleanUrl: string; error?: string } {
  let cleaned = inputUrl.trim();
  if (!cleaned) {
    return { cleanUrl: '', error: 'Please enter a URL' };
  }

  // Prepend protocol if it starts directly with flipkart.com domain/subdomains
  if (cleaned.startsWith('flipkart.com') || cleaned.startsWith('www.flipkart.com') || cleaned.startsWith('dl.flipkart.com')) {
    cleaned = 'https://' + cleaned;
  }

  // Domain restriction: Ensure it starts with flipkart.com (after protocol)
  const isFlipkartDomain = 
    cleaned.startsWith('https://www.flipkart.com/') || 
    cleaned.startsWith('https://flipkart.com/') ||
    cleaned.startsWith('http://www.flipkart.com/') || 
    cleaned.startsWith('http://flipkart.com/') ||
    cleaned.startsWith('https://dl.flipkart.com/') ||
    cleaned.startsWith('http://dl.flipkart.com/');

  if (!isFlipkartDomain) {
    return { cleanUrl: '', error: 'Only links from flipkart.com are allowed' };
  }

  // Required parameters check: pid and lid
  if (!cleaned.includes('pid=') || !cleaned.includes('lid=')) {
    return { cleanUrl: '', error: "Link must contain both 'pid' and 'lid' parameters" };
  }

  // Convert dl.flipkart.com to www.flipkart.com and remove /dl/ if present
  try {
    const urlObj = new URL(cleaned);
    if (urlObj.hostname === 'dl.flipkart.com') {
      urlObj.hostname = 'www.flipkart.com';
    }
    if (urlObj.pathname.startsWith('/dl/')) {
      urlObj.pathname = urlObj.pathname.substring(3); // Remove '/dl' but keep leading slash
      if (!urlObj.pathname.startsWith('/')) {
        urlObj.pathname = '/' + urlObj.pathname;
      }
    }
    cleaned = urlObj.toString();
  } catch (e) {
    // Basic fallback if URL parsing fails
    cleaned = cleaned.replace('dl.flipkart.com/dl/', 'www.flipkart.com/');
    cleaned = cleaned.replace('dl.flipkart.com/', 'www.flipkart.com/');
  }

  // If it's already a product-reviews link, don't convert, just return
  if (cleaned.includes('/product-reviews/')) {
    return { cleanUrl: cleaned };
  }

  // If it's a product link (containing /p/), convert it
  if (cleaned.includes('/p/')) {
    try {
      const urlObj = new URL(cleaned);
      urlObj.pathname = urlObj.pathname.replace('/p/', '/product-reviews/');
      const pid = urlObj.searchParams.get('pid');
      const lid = urlObj.searchParams.get('lid');
      
      const cleanUrl = `${urlObj.origin}${urlObj.pathname}?pid=${pid}&lid=${lid}&aid=overall&certifiedBuyer=false&sortOrder=MOST_RECENT`;
      return { cleanUrl };
    } catch (e) {
      // Fallback
      let reviewUrl = cleaned.replace('/p/', '/product-reviews/');
      if (!reviewUrl.includes('aid=')) {
        reviewUrl += '&aid=overall&certifiedBuyer=false&sortOrder=MOST_RECENT';
      }
      return { cleanUrl: reviewUrl };
    }
  }

  return { cleanUrl: cleaned };
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
export default function Home() {
  const [url, setUrl] = useState('');
  const [cleanProductUrl, setCleanProductUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isValidProduct, setIsValidProduct] = useState(false);
  const [sortOrder, setSortOrder] = useState('MOST_RECENT');
  const [searchName, setSearchName] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [productName, setProductName] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [lastFetchType, setLastFetchType] = useState<'page' | 'name' | null>(null);
  const [hasResults, setHasResults] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasBeenFocused, setHasBeenFocused] = useState(false);
  const [scanProgress, setScanProgress] = useState<string | null>(null);

  // Bug reporting form states
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [bugType, setBugType] = useState('Extraction Issue');
  const [bugUrl, setBugUrl] = useState('');
  const [bugIssue, setBugIssue] = useState('');
  const [bugEmail, setBugEmail] = useState('');
  const [bugMobile, setBugMobile] = useState('');
  const [submittingBug, setSubmittingBug] = useState(false);

  // Keyboard shortcuts guide modal state
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const { theme, setTheme } = useTheme();

  // Keyboard shortcuts event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in form inputs or textareas
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      // 1. Esc: close modals
      if (e.key === 'Escape') {
        setIsBugModalOpen(false);
        setIsShortcutsOpen(false);
        setExportDropdownOpen(false);
      }

      // 2. ?: Open/close shortcuts guide (Shift + /)
      if (e.key === '?') {
        setIsShortcutsOpen(prev => !prev);
      }

      // 3. / or S: Focus search/URL input field
      if (e.key === '/' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="flipkart.com"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // 4. Alt + B: Open bug feedback modal
      if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleOpenBugModal();
      }

      // 5. Alt + E: Export reviews dropdown trigger
      if (e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (reviews.length > 0) {
          setExportDropdownOpen(prev => !prev);
        }
      }

      // 6. Alt + T: Toggle dark/light theme
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setTheme(theme === 'dark' ? 'light' : 'dark');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reviews, url, theme, setTheme]);

  const handleOpenBugModal = () => {
    setBugUrl(url); // Autofill current URL if any
    setBugType('Extraction Issue');
    setBugIssue('');
    setBugEmail('');
    setBugMobile('');
    setIsBugModalOpen(true);
  };

  const handleReportBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugIssue.trim()) {
      showToast('Please describe the issue or suggestion', 'error');
      return;
    }
    if (bugType === 'Extraction Issue' && !bugUrl.trim()) {
      showToast('Please provide a Flipkart product link', 'error');
      return;
    }
    setSubmittingBug(true);
    try {
      const payload: any = {
        type: bugType,
        issue: bugIssue,
      };
      if (bugType === 'Extraction Issue') {
        payload.url = bugUrl;
      }
      if (bugEmail.trim()) {
        payload.email = bugEmail;
      }
      if (bugMobile.trim()) {
        payload.mobile = bugMobile;
      }

      const res = await fetch('/api/report-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) {
        showToast(data.error, 'error');
      } else {
        showToast(data.message || 'Thank you! Your response is really valuable to us and we appreciate your time.', 'success');
        setIsBugModalOpen(false);
      }
    } catch (err: any) {
      showToast('Failed to submit report: ' + err.message, 'error');
    } finally {
      setSubmittingBug(false);
    }
  };
  
  const exportRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);

  // Sync ref with page state
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // Close export dropdown on outside click or Escape key
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Real-time URL validation and cleanup (Zero-click unlock)
  useEffect(() => {
    if (!url.trim()) {
      setCleanProductUrl('');
      setUrlError(null);
      setIsValidProduct(false);
      setReviews([]);
      setHasResults(false);
      setProductName(null);
      setPage(1);
      return;
    }

    const { cleanUrl, error } = normalizeFlipkartUrl(url);
    if (error) {
      setCleanProductUrl('');
      setUrlError(error);
      setIsValidProduct(false);
      setReviews([]);
      setHasResults(false);
      setProductName(null);
      setPage(1);
    } else {
      setCleanProductUrl(cleanUrl);
      setUrlError(null);
      setIsValidProduct(true);
    }
  }, [url]);

  const showToast = useCallback((text: string, type: 'error' | 'success') => {
    setToastMsg({ text, type });
  }, []);

  const exportReviews = (format: 'json' | 'csv') => {
    if (!reviews.length) return;
    const filename = `reviews-${Date.now()}`;
    
    const triggerDownload = (blob: Blob, name: string) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reviews, null, 2)], { type: 'application/json' });
      triggerDownload(blob, filename + '.json');
    } else {
      const headers = ['rating','title','text','author','location','created','certifiedBuyer','helpfulCount','permalink'];
      const rows = reviews.map((r: any) => 
        headers.map(h => JSON.stringify(r[h] ?? '')).join(',')
      );
      const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
      triggerDownload(blob, filename + '.csv');
    }
    setExportDropdownOpen(false);
    showToast(`Exported ${reviews.length} reviews as ${format.toUpperCase()}`, 'success');
  };

  const loadReviews = async (isNameSearch = false, pageOverride?: number) => {
    if (!isValidProduct || !cleanProductUrl) {
      showToast(urlError || 'Please enter a valid Flipkart URL first', 'error');
      return;
    }

    setLoading(true);
    setReviews([]);
    setHasResults(false);
    setHasNextPage(false);
    setLastFetchType(isNameSearch ? 'name' : 'page');

    if (isNameSearch) {
      const needle = searchName.trim().toLowerCase().replace(/\s+/g, '');
      if (!needle) {
        showToast('Please enter a name to search', 'error');
        setLoading(false);
        return;
      }

      try {
        const accumulatedMatches = [];
        let currentProdName = null;
        let hasMore = true;

        for (let p = 1; p <= 8; p++) {
          setScanProgress(`Scanning page ${p} of 8…`);
          
          const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageUri: cleanProductUrl, page: p, sortOrder })
          });

          const data = await res.json();
          if (data.error) {
            showToast(data.error, 'error');
            break;
          }

          if (p === 1 && data.productName) {
            currentProdName = data.productName;
          }

          const pageReviews = data.reviews || [];
          const matches = pageReviews.filter((rev: any) => {
            if (!rev.author) return false;
            const cleanAuthor = rev.author.toLowerCase().replace(/\s+/g, '');
            return cleanAuthor.includes(needle);
          }).map((rev: any) => ({ ...rev, _foundOnPage: p }));

          accumulatedMatches.push(...matches);
          hasMore = data.hasMorePages === true;
          
          if (!hasMore) {
            break;
          }

          // Small delay to behave nicely
          await new Promise(resolve => setTimeout(resolve, 350));
        }

        setReviews(accumulatedMatches);
        setProductName(currentProdName || 'Product Reviews');
        setHasResults(true);
        setHasNextPage(false);
        showToast(`Found ${accumulatedMatches.length} matching reviews!`, 'success');

      } catch (err: any) {
        showToast('Failed to fetch reviews: ' + err.message, 'error');
      } finally {
        setLoading(false);
        setScanProgress(null);
      }

    } else {
      // Regular page fetch
      try {
        const activePage = pageOverride ?? page;
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageUri: cleanProductUrl, page: activePage, sortOrder })
        });

        const data = await res.json();
        
        if (data.error) {
          showToast(data.error, 'error');
          setLoading(false);
          return;
        }

        const fetchedReviews = data.reviews || [];
        setReviews(fetchedReviews);
        setProductName(data.productName || null);
        setHasNextPage(data.hasMorePages === true);
        setHasResults(true);

        if (fetchedReviews.length > 0) {
          showToast(`Loaded page ${activePage} reviews!`, 'success');
        }
        
      } catch (err: any) {
        showToast('Failed to fetch reviews: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const sortOptions = [
    { value: 'MOST_RECENT', label: 'Recent' },
    { value: 'MOST_HELPFUL', label: 'Helpful' },
    { value: 'POSITIVE_FIRST', label: 'Positive' },
    { value: 'NEGATIVE_FIRST', label: 'Negative' },
  ];
  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-[#1a7a5e] selection:text-white pb-20 transition-colors duration-300">
      
      {/* Toast */}
      {toastMsg && (
        <Toast 
          message={toastMsg.text} 
          type={toastMsg.type} 
          onDismiss={() => setToastMsg(null)} 
        />
      )}

      {/* ── HEADER ── */}
      <header className="glass sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d97706] flex items-center justify-center shadow-lg shadow-[#d97706]/20">
              <Sparkles className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#d97706]">ReviewLens</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Export */}
            <div className="relative" ref={exportRef}>
              <button 
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                disabled={reviews.length === 0}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Download className="w-4 h-4" /> 
                <span className="hidden sm:inline">Export</span>
              </button>
              
              {exportDropdownOpen && reviews.length > 0 && (
                <div className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                  <button 
                    onClick={() => exportReviews('csv')}
                    className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#fef3c7] dark:hover:bg-[#d97706]/10 transition-colors flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Download className="w-3.5 h-3.5" />
                    </div>
                    Export as CSV
                  </button>
                  <button 
                    onClick={() => exportReviews('json')}
                    className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#fef3c7] dark:hover:bg-[#d97706]/10 transition-colors flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Download className="w-3.5 h-3.5" />
                    </div>
                    Export as JSON
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={handleOpenBugModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-200 active:scale-[0.98]"
              title="Report an issue or bug (Alt + B)"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>
            <button 
              onClick={() => setIsShortcutsOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold glass text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 active:scale-[0.98]"
              title="Keyboard Shortcuts Guide (?)"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Shortcuts</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-20 max-h-none lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <Sidebar 
              url={url}
              setUrl={setUrl}
              isValidProduct={isValidProduct}
              urlError={urlError}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              searchName={searchName}
              setSearchName={setSearchName}
              page={page}
              setPage={setPage}
              loading={loading}
              loadReviews={loadReviews}
              hasBeenFocused={hasBeenFocused}
              setHasBeenFocused={setHasBeenFocused}
              scanProgress={scanProgress}
              reviews={reviews}
              hasNextPage={hasNextPage}
            />
          </aside>

          {/* Right Content */}
          <div className="flex-1 min-w-0 w-full">
            
            {/* ── EMPTY STATE — ONBOARDING GUIDE ── */}
            {!hasResults && !loading && (
              <div className="space-y-5 animate-fade-in-up">

                {/* How It Works — Steps */}
                <div className="glass rounded-2xl p-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-5 flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-[#d97706]" /> How It Works
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { num: '1', title: 'Paste URL', desc: 'Copy any Flipkart product link and paste it in the sidebar input.', icon: <Clipboard className="w-4 h-4" /> },
                      { num: '2', title: 'Configure', desc: 'Choose sort order, then fetch by page or search by reviewer name.', icon: <Search className="w-4 h-4" /> },
                      { num: '3', title: 'Get Reviewer Link', desc: 'Find your target review from the list and extract its direct review link.', icon: <Link2 className="w-4 h-4" /> },
                    ].map((step, i) => (
                      <div key={i} className="relative p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 group hover:border-[#d97706]/20 dark:hover:border-[#d97706]/20 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#d97706] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {step.num}
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{step.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed pl-10">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supported Links */}
                <div className="glass rounded-2xl p-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-5 flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-[#d97706]" /> Supported Links
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Product Page', example: 'flipkart.com/product-name/p/itm...?pid=...&lid=...', icon: <Globe className="w-4 h-4" />, tag: 'Auto-converts' },
                      { label: 'Review Page', example: 'flipkart.com/.../product-reviews/itm...?pid=...&lid=...', icon: <Star className="w-4 h-4" />, tag: 'Direct' },
                      { label: 'Share / DL Link', example: 'dl.flipkart.com/dl/product-name/p/itm...?pid=...&lid=...', icon: <Smartphone className="w-4 h-4" />, tag: 'Auto-converts' },
                    ].map((link, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 hover:border-[#d97706]/20 dark:hover:border-[#d97706]/20 transition-all duration-200">
                        <div className="w-8 h-8 rounded-lg bg-[#fef3c7] dark:bg-[#d97706]/10 flex items-center justify-center text-[#d97706] flex-shrink-0 mt-0.5">
                          {link.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{link.label}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              link.tag === 'Direct' 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}>{link.tag}</span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate">{link.example}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements & Tips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Requirements */}
                  <div className="glass rounded-2xl p-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#d97706]" /> Requirements
                    </h4>
                    <ul className="space-y-3">
                      {[
                        { text: 'Link must be from flipkart.com', ok: true },
                        { text: 'Must contain pid parameter', ok: true },
                        { text: 'Must contain lid parameter', ok: true },
                        { text: 'No shortened links (bit.ly, etc.)', ok: false },
                      ].map((req, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                            req.ok 
                              ? 'bg-emerald-50 dark:bg-emerald-500/10' 
                              : 'bg-red-50 dark:bg-red-500/10'
                          }`}>
                            {req.ok 
                              ? <Check className="w-3 h-3 text-emerald-500" />
                              : <AlertCircle className="w-3 h-3 text-red-500" />
                            }
                          </div>
                          <span className="text-slate-600 dark:text-slate-300 font-medium">{req.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips */}
                  <div className="glass rounded-2xl p-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-[#d97706]" /> Quick Tips
                    </h4>
                    <ul className="space-y-3">
                      {[
                        'Open any product on Flipkart',
                        'Copy the URL from your browser\'s address bar',
                        'Paste it in the sidebar — that\'s it!',
                      ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs">
                          <div className="w-5 h-5 rounded-md bg-[#fef3c7] dark:bg-[#d97706]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-[#d97706]">{i + 1}</span>
                          </div>
                          <span className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Trouble extracting? Report a bug */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl glass border border-red-200/50 dark:border-red-500/10 bg-red-50/20 dark:bg-red-500/5 hover:border-red-300 dark:hover:border-red-500/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 dark:bg-red-500/15 flex items-center justify-center text-red-500 flex-shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Unable to fetch or extract reviews?</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Submit the product URL and description so we can fix it.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleOpenBugModal}
                    className="px-4 py-2.5 text-xs font-semibold bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-xl transition-all duration-200 self-stretch sm:self-auto text-center"
                  >
                    Report Issue
                  </button>
                </div>
              </div>
            )}

            {/* ── LOADING SKELETON ── */}
            {loading && (
              <div className="space-y-4">
                {scanProgress && (
                  <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center animate-pulse border border-[#cbd5e1]/30">
                    <RefreshCw className="w-8 h-8 text-[#d97706] animate-spin" />
                    <span className="text-sm font-semibold text-[#d97706]">{scanProgress}</span>
                  </div>
                )}
                {[0, 1, 2].map((i) => (
                  <div 
                    key={i} 
                    className="glass rounded-2xl p-6 animate-fade-in-up"
                    style={{ animationDelay: `${i * 100}ms`, opacity: 1 - i * 0.25 }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <div key={s} className="w-4 h-4 rounded-sm bg-slate-200 dark:bg-slate-800 animate-shimmer" />
                        ))}
                      </div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-12 animate-shimmer" style={{ animationDelay: '0.1s' }} />
                    </div>
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3 mb-4 animate-shimmer" style={{ animationDelay: '0.2s' }} />
                    <div className="space-y-2 mb-6">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-lg w-full animate-shimmer" style={{ animationDelay: '0.3s' }} />
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-lg w-5/6 animate-shimmer" style={{ animationDelay: '0.4s' }} />
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-lg w-4/6 animate-shimmer" style={{ animationDelay: '0.5s' }} />
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-shimmer" />
                        <div>
                          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-lg w-24 mb-1 animate-shimmer" style={{ animationDelay: '0.6s' }} />
                          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-32 animate-shimmer" style={{ animationDelay: '0.7s' }} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-shimmer" />
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-shimmer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── RESULTS ── */}
            {hasResults && !loading && (
              <div className="space-y-5 animate-fade-in-up">
                
                {/* Product Name & Page Indicator */}
                {productName && (
                  <div className="glass rounded-2xl p-5 flex items-center justify-between gap-4">
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug truncate" title={productName}>
                      {productName}
                    </h2>
                    {lastFetchType === 'page' && (
                      <span className="text-xs font-bold bg-[#fef3c7] dark:bg-[#d97706]/10 text-[#d97706] px-3 py-1.5 rounded-xl border border-[#cbd5e1]/30 flex-shrink-0">
                        Page {page}
                      </span>
                    )}
                  </div>
                )}

                {/* Review Cards */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center">
                      <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">No reviews found matching the criteria.</p>
                    </div>
                  ) : (
                    reviews.map((rev: any, i) => <ReviewCard key={i} rev={rev} index={i} />)
                  )}
                </div>

                {/* Next Page Button */}
                {lastFetchType === 'page' && reviews.length > 0 && hasNextPage && (
                  <div className="flex justify-center pt-2 pb-4">
                    <button
                      onClick={() => {
                        const nextPage = pageRef.current + 1;
                        setPage(nextPage);
                        loadReviews(false, nextPage);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.97]"
                    >
                      Next Page
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── BUG REPORT MODAL ── */}
      {isBugModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
          <div className="glass rounded-2xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border border-[#cbd5e1]/50 dark:border-[#d97706]/15">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#d97706]" />
              Report Issue / Request Feature
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
              Let us know how we can improve ReviewLens or fix any problems you are facing.
            </p>

            <form onSubmit={handleReportBug} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">
                  What would you like to report?
                </label>
                <div className="relative">
                  <select
                    value={bugType}
                    onChange={(e) => setBugType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-[#d97706]/10 appearance-none cursor-pointer"
                  >
                    <option value="Extraction Issue">Extraction Issue (e.g. reviews not loading)</option>
                    <option value="Add a Feature">Add a Feature (Feature Request)</option>
                    <option value="Bug Report">Bug Report (UI glitch, crash, etc.)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {bugType === 'Extraction Issue' && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">
                    Flipkart Product URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={bugUrl}
                      onChange={(e) => setBugUrl(e.target.value)}
                      placeholder="https://flipkart.com/..."
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#d97706]/10"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">
                  Details & Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={bugIssue}
                  onChange={(e) => setBugIssue(e.target.value)}
                  placeholder={
                    bugType === 'Extraction Issue'
                      ? "What went wrong? e.g., 'Fails to load reviews' or 'Gets stuck on page 2'"
                      : bugType === 'Add a Feature'
                      ? "Tell us what feature you would like to see added!"
                      : "Describe the bug and how to reproduce it..."
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#d97706]/10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">
                    Contact Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={bugEmail}
                    onChange={(e) => setBugEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#d97706]/10"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={bugMobile}
                    onChange={(e) => setBugMobile(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-[#d97706]/10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-6">
                <button
                  type="button"
                  onClick={() => setIsBugModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBug}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#d97706] hover:bg-[#b45309] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-all duration-200"
                >
                  {submittingBug ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  {submittingBug ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── KEYBOARD SHORTCUTS GUIDE MODAL ── */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
          <div className="glass rounded-2xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl border border-[#cbd5e1]/50 dark:border-[#d97706]/15 animate-fade-in-up">
            <button
              onClick={() => setIsShortcutsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-lg p-1.5"
              aria-label="Close modal"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-[#d97706]" />
              Keyboard Shortcuts
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
              Use these shortcuts to navigate the application quickly.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-sm text-slate-600 dark:text-slate-400">Open Shortcuts Guide</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 shadow-sm font-mono">?</kbd>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-sm text-slate-600 dark:text-slate-400">Focus URL Input</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 shadow-sm font-mono">/</kbd>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-sm text-slate-600 dark:text-slate-400">Report Issue / Request Feature</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 shadow-sm font-mono">Alt</kbd>
                  <span className="text-xs text-slate-400 font-bold">+</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 shadow-sm font-mono">B</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-sm text-slate-600 dark:text-slate-400">Toggle Dark / Light Mode</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 shadow-sm font-mono">Alt</kbd>
                  <span className="text-xs text-slate-400 font-bold">+</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 shadow-sm font-mono">T</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-sm text-slate-600 dark:text-slate-400">Trigger Export Dropdown</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 shadow-sm font-mono">Alt</kbd>
                  <span className="text-xs text-slate-400 font-bold">+</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 shadow-sm font-mono">E</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-slate-600 dark:text-slate-400">Close Modals / Overlays</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 shadow-sm font-mono">Esc</kbd>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center">
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="px-6 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-semibold rounded-xl transition-all shadow-md duration-200"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SIDEBAR COMPONENT
   ═══════════════════════════════════════════════════════ */
interface SidebarProps {
  url: string;
  setUrl: (v: string) => void;
  isValidProduct: boolean;
  urlError: string | null;
  sortOrder: string;
  setSortOrder: (v: string) => void;
  searchName: string;
  setSearchName: (v: string) => void;
  page: number;
  setPage: (p: number) => void;
  loading: boolean;
  loadReviews: (isNameSearch?: boolean, pageOverride?: number) => void;
  hasBeenFocused: boolean;
  setHasBeenFocused: (v: boolean) => void;
  scanProgress: string | null;
  reviews: any[];
  hasNextPage: boolean;
}

const Sidebar = memo(function Sidebar({
  url,
  setUrl,
  isValidProduct,
  urlError,
  sortOrder,
  setSortOrder,
  searchName,
  setSearchName,
  page,
  setPage,
  loading,
  loadReviews,
  hasBeenFocused,
  setHasBeenFocused,
  scanProgress,
  reviews,
  hasNextPage,
}: SidebarProps) {
  const sortOptions = [
    { value: 'MOST_RECENT', label: 'Recent' },
    { value: 'MOST_HELPFUL', label: 'Helpful' },
    { value: 'POSITIVE_FIRST', label: 'Positive' },
    { value: 'NEGATIVE_FIRST', label: 'Negative' },
  ];

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-7 shadow-sm">
      
      {/* Section 1: Product URL */}
      <section className="relative">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
            Product URL
          </label>
          {!isValidProduct && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded-full bg-[#d97706] animate-pulse shadow-sm shadow-[#d97706]/25">
              Paste Link Here
            </span>
          )}
        </div>
        <div className="space-y-3">
          <div className="relative">
            <Link2 className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
              !isValidProduct ? 'text-[#d97706] animate-bounce' : 'text-slate-400'
            }`} />
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setHasBeenFocused(true)}
              placeholder="👉 Paste flipkart.com product link..." 
              className={`w-full bg-slate-50 dark:bg-slate-900/60 border rounded-xl pl-10 pr-4 py-3.5 text-sm font-mono transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-4 ${
                url.trim() && isValidProduct 
                  ? 'border-emerald-500/50 dark:border-emerald-500/35 focus:border-emerald-500 focus:ring-emerald-500/10' 
                  : url.trim() && urlError 
                    ? 'border-rose-500/50 dark:border-rose-500/35 focus:border-rose-500 focus:ring-rose-500/10' 
                    : !url.trim() && !hasBeenFocused
                      ? 'border-[#cbd5e1] shadow-[0_0_15px_rgba(217,119,6,0.15)] dark:shadow-[0_0_20px_rgba(217,119,6,0.1)] focus:border-[#d97706] focus:ring-[#d97706]/20 animate-pulse'
                      : 'border-slate-200 dark:border-slate-700/60 focus:border-[#d97706] focus:ring-[#d97706]/20'
              }`}
            />
          </div>

          {/* Real-time Status Indicator */}
          {url.trim() && (
            <div className="animate-fade-in-up">
              {isValidProduct ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/5 px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Valid Link — Options Unlocked</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-500/5 px-3 py-2 rounded-xl border border-rose-100 dark:border-rose-500/10">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{urlError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Conditional Sidebar sections */}
      {isValidProduct ? (
        <div className="space-y-7 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
          
          {/* Section 2: Sort Order — Pill Toggles */}
          <section>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block">
              Sort Order
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map(sort => (
                <button
                  key={sort.value}
                  onClick={() => setSortOrder(sort.value)}
                  aria-pressed={sortOrder === sort.value}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    sortOrder === sort.value
                      ? 'bg-[#d97706] text-white shadow-sm shadow-[#d97706]/20'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/60 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </section>

          {/* Section 3: Name Search */}
          <section className="relative p-4 rounded-xl bg-[#fef3c7]/80 dark:bg-[#d97706]/5 border border-[#cbd5e1]/40 dark:border-[#d97706]/15">
            <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-[#d97706]" />
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#d97706] dark:text-[#d97706] mb-3 flex items-center gap-2 pl-2">
              <Search className="w-3.5 h-3.5" /> Search by Name
            </label>
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d97706]/60" />
                <input 
                  type="text" 
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="e.g. Tushi Paul..." 
                  className="w-full bg-white dark:bg-slate-900/60 border border-[#cbd5e1]/60 dark:border-[#d97706]/15 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#d97706]"
                />
              </div>
              <button 
                onClick={() => loadReviews(true)} 
                disabled={loading || !searchName.trim()}
                className="w-full bg-[#d97706] hover:bg-[#b45309] disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-[#d97706]/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Scan Reviews
              </button>
              <p className="text-[11px] text-[#d97706]/70 dark:text-[#d97706]/60 pl-1">Scans up to 8 pages of reviews</p>
            </div>
          </section>

          {/* Section 4: Fetch by Page */}
          <section className="pt-5 border-t border-slate-200/60 dark:border-slate-800/60">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block">
              Fetch by Page
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/40 rounded-xl p-1.5">
                <button 
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-25 transition-all text-sm font-semibold shadow-sm bg-white dark:bg-slate-800"
                >
                  −
                </button>
                <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-200 tabular-nums">{page}</span>
                <button 
                  onClick={() => setPage(page + 1)}
                  disabled={reviews.length > 0 && !hasNextPage}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-sm bg-white dark:bg-slate-800"
                >
                  +
                </button>
              </div>
              <button 
                onClick={() => loadReviews(false)}
                disabled={loading}
                className="w-full border border-slate-200 dark:border-slate-700/60 hover:border-[#d97706]/30 hover:bg-[#fef3c7]/50 dark:hover:bg-[#d97706]/5 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-[#d97706]" /> : null}
                {loading ? 'Fetching...' : 'Fetch Reviews'}
              </button>
            </div>
          </section>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 dark:border-slate-800/60 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 min-h-[220px] animate-fade-in-up">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900/40 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4 border border-slate-200/40 dark:border-slate-800/20">
            <Lock className="w-5 h-5 text-slate-400 dark:text-slate-600" />
          </div>
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Controls Locked</h4>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed">
            Please enter a valid Flipkart product URL above to unlock sorting and search.
          </p>
        </div>
      )}
    </div>
  );
});
