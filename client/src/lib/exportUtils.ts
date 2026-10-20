import { Review } from '../types';

/**
 * Exports reviews to CSV format (RFC 4180 / Excel compatible with UTF-8 BOM)
 */
export function exportReviewsToCsv(reviews: Review[], productName: string) {
  const headers = [
    'Review ID',
    'Rating',
    'Title',
    'Review Text',
    'Author',
    'Certified Buyer',
    'Date',
    'Location',
    'Helpful Votes',
    'Downvotes',
    'Permalink',
    'Page',
  ];

  const rows = reviews.map(r => [
    `"${r.id.replace(/"/g, '""')}"`,
    r.rating,
    `"${(r.title || '').replace(/"/g, '""')}"`,
    `"${(r.text || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    `"${(r.author || '').replace(/"/g, '""')}"`,
    r.certifiedBuyer ? 'Yes' : 'No',
    `"${(r.created || '').replace(/"/g, '""')}"`,
    `"${(r.location || '').replace(/"/g, '""')}"`,
    r.upvotes || r.helpfulCount || 0,
    r.downvotes || 0,
    `"${(r.permalink || '').replace(/"/g, '""')}"`,
    r.page || 1,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cleanName = (productName || 'flipkart-reviews').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  a.href = url;
  a.download = `${cleanName}_reviews_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

