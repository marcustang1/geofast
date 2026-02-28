import { Rocket } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="bg-primary/5 py-4">
        <p className="text-center text-sm font-medium text-foreground">
          <Rocket size={14} className="mr-1.5 inline text-primary" />
          Unlimited scans, competitor analysis, and more.{" "}
          <span className="font-semibold text-primary">
            Pro plan coming soon.
          </span>
        </p>
      </div>

      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-foreground">GeoFast</p>
            <p className="mt-2 text-sm text-muted-foreground">
              AI-readiness audit for modern websites
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </p>
            <ul className="space-y-2 text-sm">
              {["Features", "Pricing", "Blog", "Docs"].map((l) => (
                <li key={l}>
                  <a
                    href={`#${l.toLowerCase()}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </p>
            <ul className="space-y-2 text-sm">
              {["GitHub", "Twitter", "Privacy Policy", "Terms"].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} GeoFast. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
