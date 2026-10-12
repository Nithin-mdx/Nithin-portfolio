import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import AskChat from "@/components/AskChat";
import { profile } from "@/data/portfolio";

const clash = localFont({
  src: [
    { path: "./fonts/ClashDisplay-500.woff2", weight: "500" },
    { path: "./fonts/ClashDisplay-600.woff2", weight: "600" },
  ],
  variable: "--font-clash",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// Explicit URL first, then the host's own: Netlify sets URL, Vercel sets VERCEL_PROJECT_PRODUCTION_URL.
const url =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
const description = `${profile.name} — ${profile.role}. ${profile.locations}.`;

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: { default: `${profile.name} — ${profile.role}`, template: `%s — ${profile.name}` },
  description,
  openGraph: { type: "website", title: profile.name, description, siteName: profile.name },
  twitter: { card: "summary_large_image", title: profile.name, description },
  authors: [{ name: profile.name }],
};

export const viewport: Viewport = { themeColor: "#0E0E0E" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${clash.variable} ${inter.variable}`} data-theme="light">
      <body>
        <a href="#main" className="label fixed left-4 top-4 z-[200] -translate-y-20 bg-acid px-3 py-2 text-ink focus:translate-y-0">
          Skip to content
        </a>
        <Providers>
          <Loader />
          <Nav />
          <AskChat />
          <main id="main" className="relative">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
