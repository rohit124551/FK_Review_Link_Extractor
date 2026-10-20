'use client';

import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0F12]/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl max-h-[90vh] bg-[#14171D] border border-[#272D37] rounded-xl overflow-hidden p-2 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-[#0D0F12]/80 text-[#F3F4F6] hover:bg-[#1D222A] border border-[#272D37] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Customer attachment preview"
            className="max-h-[80vh] w-auto object-contain rounded-lg"
          />
        </div>

        <div className="p-3 border-t border-[#272D37] bg-[#0D0F12] flex items-center justify-between text-xs font-mono text-[#9CA3AF]">
          <span>FLIPKART ATTACHMENT INSPECT</span>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FFE11B] hover:underline flex items-center gap-1"
          >
            <span>FULL RESOLUTION</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
