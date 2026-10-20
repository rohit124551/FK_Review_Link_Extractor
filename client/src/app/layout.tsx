import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#EDF2F7' },
    { media: '(prefers-color-scheme: dark)', color: '#0D0F12' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://fk-review.pages.dev'),
  title: {
    default: 'Flipkart Review Finder — Instant Review Search & Direct Links',
    template: '%s | FK Review Finder',
  },
  description:
    'Paste any Flipkart product link to search reviews by customer name, filter star ratings, analyze sentiments, and get direct permalinks to verified buyer feedback.',
  applicationName: 'Flipkart Review Finder',
  authors: [{ name: 'Rohit Kumar Ranjan', url: 'https://rohitkumarranjan.in' }],
  creator: 'Rohit Kumar Ranjan',
  publisher: 'Rohit Kumar Ranjan',
  keywords: [
    'Flipkart review finder',
    'Flipkart review search',
    'find Flipkart review by author',
    'Flipkart reviewer scanner',
    'Flipkart review permalink',
    'verified customer reviews',
    'Flipkart product feedback',
    'Flipkart reviews scraper',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://fk-review.pages.dev',
    siteName: 'Flipkart Review Finder',
    title: 'Flipkart Review Finder — Instant Review Search & Direct Links',
    description:
      'Search Flipkart product reviews by reviewer name, filter star ratings, and get direct permalinks to verified customer reviews.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flipkart Review Finder — Instant Review Search & Direct Links',
    description:
      'Find any Flipkart review instantly by reviewer name, rating, or product URL.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Flipkart Review Finder',
      url: 'https://fk-review.pages.dev',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      description:
        'Online tool to search, filter, and extract Flipkart customer reviews by author name or rating with direct permalinks.',
      author: {
        '@type': 'Person',
        name: 'Rohit Kumar Ranjan',
        url: 'https://rohitkumarranjan.in',
        sameAs: [
          'https://www.linkedin.com/in/rohitkumarranjan',
          'https://github.com/rohit124551',
        ],
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
    },
    {
      '@type': 'WebSite',
      name: 'Flipkart Review Finder',
      url: 'https://fk-review.pages.dev',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://fk-review.pages.dev/?url={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://rukminim1.flixcart.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://rukminim2.flixcart.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://rukminim1.flixcart.com" />
        <link rel="dns-prefetch" href="https://rukminim2.flixcart.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-screen relative font-sans transition-colors duration-200 selection:bg-[#FFE11B] selection:text-[#0D0F12]"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          storageKey="fk-review-finder-theme"
          disableTransitionOnChange
        >
          {/* Subtle Grain overlay */}
          <div className="fixed inset-0 pointer-events-none tactical-grain z-50 opacity-30 dark:opacity-40" />
          {children}
          <Toaster
            position="top-right"
            duration={2500}
            closeButton
            toastOptions={{
              className: 'font-mono text-xs',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
