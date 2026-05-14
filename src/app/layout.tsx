import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

// ── Fonts ──────────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

// ── Metadata ───────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL("https://sikkimverse.in"),
  title: {
    default: "SIKKIMVERSE — Indigenous Language Learning Platform",
    template: "%s | SIKKIMVERSE",
  },
  description:
    "AI-assisted platform for learning, preserving, and celebrating the indigenous languages of Sikkim — Nepali, Sikkimese, Lepcha, Bhutia, Limbu and more.",
  keywords: [
    "Sikkim languages",
    "indigenous language learning",
    "Lepcha language",
    "Bhutia language",
    "Limbu language",
    "Nepali language",
    "Sikkimese culture",
    "language preservation",
    "Himalayan languages",
    "AI language learning",
    "cultural heritage",
    "northeast India",
  ],
  authors: [{ name: "SIKKIMVERSE Team" }],
  creator: "SIKKIMVERSE",
  publisher: "SIKKIMVERSE",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://sikkimverse.in",
    siteName: "SIKKIMVERSE",
    title: "SIKKIMVERSE — Indigenous Language Learning Platform",
    description:
      "Learn and preserve the indigenous languages of Sikkim with AI-powered lessons, community archives, and cultural immersion.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SIKKIMVERSE — Language Heritage Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sikkimverse",
    creator: "@sikkimverse",
    title: "SIKKIMVERSE — Indigenous Language Learning Platform",
    description:
      "AI-assisted learning for Sikkim's indigenous languages. Join thousands preserving the Himalayan linguistic heritage.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://sikkimverse.in",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
    { media: "(prefers-color-scheme: light)", color: "#f8f6f1" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ── Root layout ────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Inline script to apply theme class before first paint,
          preventing flash of wrong theme.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('sikkimverse-theme');
                  var theme = (t === 'light' || t === 'dark') ? t : 'dark';
                  document.documentElement.classList.add(theme);
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={[
          "min-h-full flex flex-col",
          "font-sans antialiased",
          "bg-background text-foreground",
          "transition-colors duration-300",
          /* bottom padding so MobileNav doesn't overlap content on mobile */
          "pb-20 md:pb-0",
        ].join(" ")}
      >
        <SessionProvider>
          <ThemeProvider defaultTheme="dark" storageKey="sikkimverse-theme">
            {/* Skip-to-content link for accessibility */}
            <a
              href="#main-content"
              className={[
                "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100",
                "focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2",
                "focus:text-sm focus:font-medium focus:text-primary-foreground",
                "focus:shadow-lg focus:outline-none",
              ].join(" ")}
            >
              Skip to main content
            </a>

            {/* Site header */}
            <Header />

            {/* Main content */}
            <main
              id="main-content"
              className="flex flex-col flex-1 min-h-0"
              tabIndex={-1}
            >
              {children}
            </main>

            {/* Site footer (hidden on mobile — nav bar replaces it) */}
            <div className="hidden md:block">
              <Footer />
            </div>

            {/* Mobile bottom navigation */}
            <MobileNav />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
