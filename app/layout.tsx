import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getSiteSettings } from "@/lib/settings";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/** The editorial voice: a serif with enough character to not read as a default. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: {
      default: `${settings.siteName} · ${settings.tagline}`,
      template: `%s · ${settings.siteName}`,
    },
    description: settings.description,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // public/theme.js writes data-theme before React hydrates.
      suppressHydrationWarning
      className={cn("h-full antialiased", geistSans.variable, geistMono.variable, fraunces.variable)}
    >
      <body className="flex min-h-screen flex-col bg-ground text-body">
        {/* Applies the visitor's stored theme before the page paints, so someone
            who chose dark never sees a flash of light. It lives in public/ rather
            than inline: React never executes an inline <script> it renders on the
            client, and warns about it. Light is the default; dark is opt-in via
            the toggle and sticky once chosen. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- blocking is the
            point: it must run before the first paint, and it's a few lines. */}
        <script src="/theme.js" />
        <ClerkProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
