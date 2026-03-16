import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to GeoFast
          </Link>
        </div>
      </header>
      <main className="container max-w-3xl py-12 sm:py-16">{children}</main>
      <footer className="border-t border-border py-8">
        <div className="container flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/refund" className="transition-colors hover:text-foreground">
            Refund Policy
          </Link>
          <Link href="/contact" className="transition-colors hover:text-foreground">
            Contact Us
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} GeoFast. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
