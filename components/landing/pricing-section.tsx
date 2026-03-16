"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface PricingSectionProps {
  productId: string;
}

const FREE_FEATURES = [
  "5 scans per month",
  "Multi-page scanning",
  "AI perspective analysis",
  "TXT report export",
  "5 recent scans history",
];

const PRO_FEATURES = [
  "300 scans per month",
  "Multi-page scanning",
  "AI perspective analysis",
  "TXT report export",
  "Unlimited scan history",
  "Priority support",
];

export function PricingSection({ productId }: PricingSectionProps) {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        try {
          const res = await fetch("/api/user/profile");
          if (res.ok) {
            const profile = await res.json();
            setPlan(profile.plan);
          }
        } catch {
          // fallback to free
        }
      }
      setIsLoading(false);
    }
    load();
  }, [supabase.auth]);

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  function handleCheckout() {
    if (!user) return;
    const params = new URLSearchParams({
      productId,
      referenceId: user.id,
      successUrl: "/success",
    });
    window.location.href = `/checkout?${params.toString()}`;
  }

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block text-sm font-semibold text-primary">
            Pricing
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free, upgrade when you need more power.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
          {/* Free Plan */}
          <div className="relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <h3 className="text-lg font-semibold text-foreground">Free</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-foreground">$0</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Perfect for getting started with GEO audits.
            </p>

            <ul className="mt-8 space-y-3">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {!isLoading && user ? (
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  disabled
                >
                  {plan === "free" ? "Current Plan" : "Free Plan"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={handleSignIn}
                >
                  Sign in to start
                </Button>
              )}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-lg shadow-primary/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/15">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3">
              <Sparkles size={12} className="mr-1" />
              Recommended
            </Badge>

            <h3 className="text-lg font-semibold text-foreground">Pro</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-foreground">$9.9</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              For professionals who need comprehensive GEO analysis.
            </p>

            <ul className="mt-8 space-y-3">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-primary"
                  />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {isLoading ? (
                <Button className="w-full rounded-full" disabled>
                  Loading...
                </Button>
              ) : plan === "pro" ? (
                <Button className="w-full rounded-full" disabled>
                  <Sparkles size={14} className="mr-1" />
                  Current Plan
                </Button>
              ) : user ? (
                <Button
                  className="w-full rounded-full"
                  onClick={handleCheckout}
                >
                  Upgrade to Pro
                </Button>
              ) : (
                <Button
                  className="w-full rounded-full"
                  onClick={handleSignIn}
                >
                  Sign in to upgrade
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
