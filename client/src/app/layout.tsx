import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ReviewLens — Flipkart Review Link Extractor",
  description: "Bypass the new Flipkart UI update restrictions. Instantly extract direct review permalink URLs, search reviews by author name, filter, and export reviews as CSV or JSON format.",
  keywords: "flipkart review link extractor, copy flipkart review link, flipkart review search, extract flipkart reviews, review permalinks, flipkart scraper",
  authors: [{ name: "Rohit Kumar Ranjan" }],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col transition-colors duration-300 bg-pattern" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          storageKey="reviewlens-theme"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
