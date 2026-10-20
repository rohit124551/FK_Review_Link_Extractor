import React from 'react';

/**
 * Highlights matches of query within text with Flipkart tactical yellow (#FFE11B)
 */
export function HighlightText({ text, query }: { text: string; query?: string }) {
  if (!query || !query.trim() || !text) {
    return <span>{text}</span>;
  }

  const cleanQuery = query.trim();
  const regex = new RegExp(`(${cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-[#FFE11B] text-[#0D0F12] font-semibold px-1 py-0.5 rounded-xs"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
