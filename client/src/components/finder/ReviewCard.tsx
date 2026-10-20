'use client';

import React, { useState } from 'react';
import {
  Star,
  CheckCircle,
  MapPin,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  ExternalLink,
  Tag,
  Sparkles,
  Bookmark,
} from 'lucide-react';
import { TEST_IDS } from '@/constants/testIds';
import { Review } from '@/types';
import { HighlightText } from '@/lib/highlight';
import { isReviewSaved, toggleSavedReview } from '@/lib/storage';
import { toast } from 'sonner';

interface ReviewCardProps {
  review: Review;
  index: number;
  searchQuery?: string;
  productName?: string;
  productUrl?: string;
  onPreviewImage: (url: string) => void;
  onSavedChange?: () => void;
}

export function ReviewCard({
  review,
  index,
  searchQuery,
  productName,
  productUrl,
  onPreviewImage,
  onSavedChange,
}: ReviewCardProps) {
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(() => isReviewSaved(review.id));

  const handleToggleSaveReview = () => {
    const nowSaved = toggleSavedReview(productName || 'Flipkart Product', productUrl, review);
    setIsSaved(nowSaved);
    if (nowSaved) {
      toast.success('Review saved to drawer');
    } else {
      toast.info('Review removed from saved');
    }
    onSavedChange?.();
  };

  // Rating badge styling
  const getRatingStyle = (rating: number) => {
    if (rating >= 4) return 'bg-emerald-600 text-white';
    if (rating === 3) return 'bg-amber-600 text-white';
    return 'bg-rose-600 text-white';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(review.permalink);
    setCopied(true);
    toast.success('Direct review link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-testid={TEST_IDS.REVIEW_CARD}
      className="w-full max-w-4xl mx-auto rounded-xl bg-[#F5F7FA] dark:bg-[#14171D] border border-slate-300 dark:border-[#272D37] p-4 sm:p-6 transition-all hover:border-slate-400 dark:hover:border-[#374151] hover:bg-[#EBF0F7] dark:hover:bg-[#181c23] shadow-sm dark:shadow-md animate-slide-up"
      style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
    >
      {/* ── CARD TOP ROW: RATING, TITLE & BADGES ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Coloured Rating Chip */}
          <div
            data-testid={TEST_IDS.REVIEW_RATING_CHIP}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-xs font-bold shadow-xs ${getRatingStyle(
              review.rating
            )}`}
          >
            <span>{review.rating}</span>
            <Star className="w-3 h-3 fill-current" />
          </div>

          {/* Review Title */}
          {review.title && (
            <h3
              data-testid={TEST_IDS.REVIEW_TITLE}
              className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-[#F3F4F6]"
            >
              {review.title}
            </h3>
          )}
        </div>

        {/* Search Tags: EXACT MATCH & PAGE N */}
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          {review.exactMatch && (
            <span
              data-testid={TEST_IDS.REVIEW_EXACT_MATCH_TAG}
              className="px-2 py-0.5 rounded-full bg-[#FFE11B] text-[#0D0F12] font-black uppercase tracking-wider shadow-[0_0_8px_rgba(255,225,27,0.3)] flex items-center gap-1"
            >
              <Sparkles className="w-2.5 h-2.5 fill-current" />
              EXACT MATCH
            </span>
          )}
          {review.page && (
            <span
              data-testid={TEST_IDS.REVIEW_PAGE_TAG}
              className="px-2 py-0.5 rounded bg-[#E5EBF2] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] text-slate-700 dark:text-[#9CA3AF] font-bold"
            >
              PAGE {review.page}
            </span>
          )}
        </div>
      </div>

      {/* ── PRODUCT ATTRIBUTES & VARIANT TAGS ── */}
      {review.productAttributes && review.productAttributes.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 font-mono text-[11px]">
          {review.productAttributes.map((attr, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#E5EBF2] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] text-slate-700 dark:text-[#9CA3AF]"
            >
              <Tag className="w-2.5 h-2.5 text-slate-500 dark:text-[#6B7280]" />
              {attr}
            </span>
          ))}
        </div>
      )}

      {/* ── REVIEW BODY TEXT ── */}
      <p className="text-xs sm:text-sm text-slate-800 dark:text-[#D1D5DB] leading-relaxed mb-4 whitespace-pre-line font-sans">
        <HighlightText text={review.text} query={searchQuery} />
      </p>

      {/* ── IMAGE THUMBNAILS ── */}
      {review.images && review.images.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {review.images.map((imgUrl, imgIdx) => (
            <button
              key={imgIdx}
              type="button"
              data-testid={`${TEST_IDS.REVIEW_THUMBNAIL_PREFIX}${imgIdx}`}
              onClick={() => onPreviewImage(imgUrl)}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-slate-300 dark:border-[#272D37] hover:border-[#FFE11B] transition-all group cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={`Customer review upload ${imgIdx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── METADATA ROW: AUTHOR, CERTIFIED BUYER, LOCATION, DATE, VOTES ── */}
      <div className="pt-3 border-t border-slate-300 dark:border-[#272D37] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-600 dark:text-[#9CA3AF]">
        {/* Author Details */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            data-testid={TEST_IDS.REVIEW_AUTHOR}
            className="font-bold text-slate-900 dark:text-[#F3F4F6]"
          >
            <HighlightText text={review.author} query={searchQuery} />
          </span>

          {review.certifiedBuyer && (
            <span
              data-testid={TEST_IDS.REVIEW_CERTIFIED_BUYER}
              className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold"
            >
              <CheckCircle className="w-3.5 h-3.5 fill-emerald-500/20" />
              Certified Buyer
            </span>
          )}

          {review.location && (
            <span
              data-testid={TEST_IDS.REVIEW_LOCATION}
              className="inline-flex items-center gap-1 text-slate-500 dark:text-[#6B7280] text-[11px]"
            >
              <MapPin className="w-3 h-3 text-slate-500 dark:text-[#4B5563]" />
              {review.location}
            </span>
          )}

          {review.created && (
            <span
              data-testid={TEST_IDS.REVIEW_DATE}
              className="inline-flex items-center gap-1 text-slate-500 dark:text-[#6B7280] text-[11px]"
            >
              <Calendar className="w-3 h-3 text-slate-500 dark:text-[#4B5563]" />
              {review.created}
            </span>
          )}
        </div>

        {/* Votes Count */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
            <ThumbsUp className="w-3 h-3" />
            <span>{review.upvotes || review.helpfulCount || 0}</span>
          </span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-[#6B7280]">
            <ThumbsDown className="w-3 h-3" />
            <span>{review.downvotes || 0}</span>
          </span>
        </div>
      </div>

      {/* ── CARD ACTIONS FOOTER: SAVE REVIEW, COPY LINK & OPEN IN FLIPKART ── */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#272D37]/50 flex flex-wrap items-center justify-end gap-2 sm:gap-2.5 font-mono text-xs">
        {/* Save / Bookmark Review button */}
        <button
          type="button"
          onClick={handleToggleSaveReview}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            isSaved
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-[#FFE11B] font-bold'
              : 'bg-[#E5EBF2] dark:bg-[#0D0F12] border-slate-300 dark:border-[#272D37] text-slate-700 dark:text-[#9CA3AF] hover:text-amber-600 dark:hover:text-[#FFE11B] hover:border-amber-400 dark:hover:border-[#FFE11B]/40'
          }`}
          title={isSaved ? 'Remove from saved reviews' : 'Save this review to drawer'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          <span>{isSaved ? 'SAVED' : 'SAVE'}</span>
        </button>

        {/* Copy link button */}
        <button
          type="button"
          data-testid={TEST_IDS.REVIEW_COPY_LINK_BTN}
          onClick={handleCopyLink}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E5EBF2] dark:bg-[#0D0F12] border border-slate-300 dark:border-[#272D37] text-slate-700 dark:text-[#9CA3AF] hover:text-amber-600 dark:hover:text-[#FFE11B] hover:border-amber-400 dark:hover:border-[#FFE11B]/40 transition-colors cursor-pointer"
          title="Copy Flipkart permalink"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>COPY LINK</span>
            </>
          )}
        </button>

        {/* Open review link button in Flipkart Blue (#2874F0) */}
        <a
          href={review.permalink}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={TEST_IDS.REVIEW_OPEN_FLIPKART_BTN}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2874F0] hover:bg-[#1f62d1] text-white font-bold tracking-wider transition-colors shadow-xs cursor-pointer text-center"
        >
          <span>OPEN REVIEW</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
