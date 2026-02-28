"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const [url, setUrl] = useState("");

  function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    // TODO: Phase 3 — call /api/scan via SSE, save to localStorage, redirect
    console.log("Scanning URL:", url);
  }

  return (
    <section
      id="hero"
      className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-24"
    >
      <div className="gradient-orb pointer-events-none absolute inset-0 animate-pulse-soft" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl animate-float" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Track Your Brand Across 5+ AI Platforms
        </div>

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Get your brand{" "}
          <span className="text-primary">mentioned by AI</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Check how well your website is optimized for AI search engines.
          Analyze AI crawlability, structured data, content citability, and get
          actionable fix recommendations — in seconds.
        </p>

        <form
          onSubmit={handleScan}
          className="mx-auto mt-10 flex max-w-xl items-center gap-0 rounded-full border border-border bg-card p-1.5 shadow-lg shadow-primary/5 transition-shadow focus-within:shadow-xl focus-within:shadow-primary/10"
        >
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your website URL, e.g. https://example.com"
            className="flex-1 bg-transparent px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button type="submit" className="rounded-full px-6">
            Scan <ArrowRight size={16} className="ml-1" />
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Free · No login required · 3 scans per day
        </p>

        <div className="mt-16 flex items-center justify-center gap-12 sm:gap-16">
          {[
            { value: "30+", label: "Audit Checks" },
            { value: "4", label: "AI Dimensions" },
            { value: "<30s", label: "Scan Time" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-foreground sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
