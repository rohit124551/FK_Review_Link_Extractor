import { LinkNormalized } from '../types';

/**
 * Normalizes and cleans a Flipkart product or review URL according to the spec:
 * Accepts:
 *   - https://www.flipkart.com/{slug}/p/{itm}?pid={pid}&lid={lid}
 *   - https://www.flipkart.com/{slug}/product-reviews/{itm}?pid={pid}&lid={lid}
 *   - Short links: dl.flipkart.com/s/..., fkrt.it/...
 * Builds base review URI:
 *   /{slug}/product-reviews/{itm}?pid={pid}&lid={lid}&marketplace=FLIPKART
 */
export function normalizeFlipkartUrl(input: string): LinkNormalized {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      originalUrl: input,
      cleanedUri: '',
      errorReason: 'Please enter a Flipkart product link.',
    };
  }

  // Check domain / short links
  const isShortLink = /^(https?:\/\/)?(dl\.flipkart\.com|fkrt\.it)\/.+/i.test(trimmed);
  const isFlipkartDomain = /^(https?:\/\/)?(www\.|2\.rome\.api\.)?flipkart\.com\/.+/i.test(trimmed);

  if (!isShortLink && !isFlipkartDomain && !trimmed.startsWith('/')) {
    return {
      isValid: false,
      originalUrl: input,
      cleanedUri: '',
      errorReason: 'INVALID_PRODUCT: Link is not a recognized Flipkart URL',
    };
  }

  if (isShortLink) {
    // For short links in the UI preview, mark as valid pending server redirect
    return {
      isValid: true,
      originalUrl: input,
      cleanedUri: '/[short-link-resolving]...&marketplace=FLIPKART',
      slug: 'redirect-source',
    };
  }

  try {
    // Add dummy protocol if relative
    const parseableUrl = trimmed.startsWith('/')
      ? `https://www.flipkart.com${trimmed}`
      : trimmed.startsWith('http')
      ? trimmed
      : `https://${trimmed}`;

    const urlObj = new URL(parseableUrl);
    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;

    // Pattern 1: /{slug}/p/{itm}
    // Pattern 2: /{slug}/product-reviews/{itm}
    const productMatch = pathname.match(/^\/([^/]+)\/p\/(itm[a-zA-Z0-9]+)/i);
    const reviewsMatch = pathname.match(/^\/([^/]+)\/product-reviews\/(itm[a-zA-Z0-9]+)/i);

    let slug = '';
    let itm = '';

    if (productMatch) {
      slug = productMatch[1];
      itm = productMatch[2];
    } else if (reviewsMatch) {
      slug = reviewsMatch[1];
      itm = reviewsMatch[2];
    } else {
      // Fallback: check for itm anywhere in path
      const itmMatch = pathname.match(/(itm[a-zA-Z0-9]{8,20})/i);
      const segments = pathname.split('/').filter(Boolean);
      if (itmMatch && segments.length >= 2) {
        slug = segments[0] === 'product-reviews' ? 'item' : segments[0];
        itm = itmMatch[1];
      } else {
        return {
          isValid: false,
          originalUrl: input,
          cleanedUri: '',
          errorReason: 'INVALID_PRODUCT: Missing valid Flipkart item identifier (itmXXX)',
        };
      }
    }

    const pid = searchParams.get('pid') || '';
    const lid = searchParams.get('lid') || '';

    // Build the canonical review link
    const cleanedParams = new URLSearchParams();
    if (pid) cleanedParams.set('pid', pid);
    if (lid) cleanedParams.set('lid', lid);
    cleanedParams.set('marketplace', 'FLIPKART');

    const cleanedUri = `/${slug}/product-reviews/${itm}?${cleanedParams.toString()}`;

    return {
      isValid: true,
      originalUrl: input,
      cleanedUri,
      pid,
      lid,
      slug,
      itm,
    };
  } catch {
    return {
      isValid: false,
      originalUrl: input,
      cleanedUri: '',
      errorReason: 'INVALID_PRODUCT: Malformed URL',
    };
  }
}
