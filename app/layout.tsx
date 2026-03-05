import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GeoFast — AI Readiness Audit",
    template: "%s | GeoFast",
  },
  description:
    "Check how well your website is optimized for AI search engines. Analyze AI crawlability, structured data, content citability, and get actionable fix recommendations.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://geofast.app"
  ),
  openGraph: {
    type: "website",
    siteName: "GeoFast",
    title: "GeoFast — AI Readiness Audit",
    description:
      "Scan your website for AI search engine optimization. Get scores for crawlability, structured data, citability, and actionable fix recommendations in seconds.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GeoFast — AI Readiness Audit",
    description:
      "Scan your website for AI search engine optimization in seconds.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}
