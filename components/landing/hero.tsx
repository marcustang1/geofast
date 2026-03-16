"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { canScanTrial, incrementTrialCount, getRemainingTrials } from "@/lib/rate-limit/cookie";
import { saveReport } from "@/lib/storage/local-store";
import { UpgradeModal } from "@/components/upgrade-modal";
import { createClient } from "@/lib/supabase/client";
import type { ScanResult } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

interface ProgressState {
  step: string;
  message: string;
  progress: number;
}

interface ProfileData {
  plan: string;
  creditsRemaining: number;
  creditsTotal: number;
  canScan: boolean;
}

function validateUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return "Please enter a URL";

  let withProtocol = trimmed;
  if (!/^https?:\/\//i.test(withProtocol)) {
    withProtocol = `https://${withProtocol}`;
  }

  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname.includes(".")) {
      return "Please enter a valid domain (e.g. example.com)";
    }
    if (/^[0-9.]+$/.test(parsed.hostname)) {
      return "IP addresses are not supported. Please enter a domain name.";
    }
    return null;
  } catch {
    return "Invalid URL format. Try something like example.com";
  }
}

export function Hero() {
  const router = useRouter();
  const supabase = createClient();
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [trialRemaining, setTrialRemaining] = useState<number>(3);

  useEffect(() => {
    setTrialRemaining(getRemainingTrials());

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchProfile();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile();
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        setProfile(await res.json());
      }
    } catch {
      // silent
    }
  }

  function canUserScan(): boolean {
    if (user && profile) return profile.canScan;
    return canScanTrial();
  }

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  function handleUpgrade() {
    const productId = (document.querySelector("[data-product-id]") as HTMLElement)?.dataset.productId;
    if (!user || !productId) return;
    const params = new URLSearchParams({
      productId,
      referenceId: user.id,
      successUrl: "/success",
    });
    window.location.href = `/checkout?${params.toString()}`;
  }

  const handleScan = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const validationError = validateUrl(url);
      if (validationError) {
        setError(validationError);
        return;
      }

      if (!canUserScan()) {
        setShowUpgradeModal(true);
        return;
      }

      const trimmed = url.trim();
      setIsScanning(true);
      setProgress({ step: "init", message: "Starting scan...", progress: 5 });

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        });

        if (!res.ok || !res.body) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error ?? `Scan failed (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7);
            } else if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));

              if (currentEvent === "progress") {
                setProgress(data as ProgressState);
              } else if (currentEvent === "complete") {
                const scanResult = data.scanResult as ScanResult;

                if (!user) {
                  incrementTrialCount();
                  setTrialRemaining(getRemainingTrials());
                }

                const report = saveReport(scanResult, profile?.plan);
                if (user) await fetchProfile();
                router.push(`/report/${report.id}`);
                return;
              } else if (currentEvent === "error") {
                throw new Error(data.error);
              }
            }
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setIsScanning(false);
        setProgress(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, router, user, profile]
  );

  function getCreditText(): string {
    if (user && profile) {
      return `${profile.creditsRemaining}/${profile.creditsTotal} scans remaining this month`;
    }
    return `${trialRemaining} free trial${trialRemaining !== 1 ? "s" : ""} remaining`;
  }

  function getSubtext(): string {
    if (user && profile) {
      if (profile.plan === "pro") return "Pro Plan";
      return "Free Plan · Upgrade for 300 scans/month";
    }
    return "No login required · Sign in for more scans";
  }

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-12 sm:py-24"
    >
      <div className="gradient-orb pointer-events-none absolute inset-0 animate-pulse-soft" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl animate-float" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground sm:mb-6">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Track Your Brand Across 5+ AI Platforms
        </div>

        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Get your brand{" "}
          <span className="text-primary">mentioned by AI</span>
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:mt-6 sm:max-w-2xl sm:text-xl">
          Analyze your site&apos;s AI readiness — crawlability, structured data,
          citability — and get actionable fixes in seconds.
        </p>

        <form
          onSubmit={handleScan}
          className="mx-auto mt-6 flex max-w-xl items-center gap-0 rounded-full border border-border bg-card p-1.5 shadow-lg shadow-primary/5 transition-shadow focus-within:shadow-xl focus-within:shadow-primary/10 sm:mt-10"
        >
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="example.com"
            disabled={isScanning}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 sm:px-5"
          />
          <Button
            type="submit"
            className="rounded-full px-5 sm:px-6"
            disabled={isScanning || !url.trim()}
          >
            {isScanning ? (
              <>
                <Loader2 size={16} className="mr-1 animate-spin" />
                <span className="hidden sm:inline">Scanning...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                Scan <ArrowRight size={16} className="ml-1" />
              </>
            )}
          </Button>
        </form>

        {isScanning && progress && (
          <div className="mx-auto mt-4 max-w-xl sm:mt-6">
            <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {progress.message}
            </p>
          </div>
        )}

        {error && (
          <div className="mx-auto mt-3 flex max-w-xl items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive sm:mt-4">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {!isScanning && !error && (
          <div className="mt-3 sm:mt-4">
            <p className="text-xs text-muted-foreground">
              {getCreditText()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {getSubtext()}
            </p>
          </div>
        )}

        <div className="mt-10 flex items-center justify-center gap-10 sm:mt-16 sm:gap-16">
          {[
            { value: "30+", label: "Audit Checks" },
            { value: "4", label: "AI Dimensions" },
            { value: "<30s", label: "Scan Time" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-foreground sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        plan={profile?.plan ?? "trial"}
        isLoggedIn={!!user}
        onUpgrade={handleUpgrade}
        onSignIn={handleSignIn}
      />
    </section>
  );
}
