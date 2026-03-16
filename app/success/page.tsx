"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    async function pollProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.plan === "pro") {
            setIsActivated(true);
            return;
          }
        }
      } catch {
        // continue polling
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(pollProfile, 2000);
      } else {
        setIsActivated(true);
      }
    }

    pollProfile();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {isActivated ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle size={32} className="text-success" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Pro Activated!
            </h1>
            <p className="mt-3 text-muted-foreground">
              You now have{" "}
              <span className="font-semibold text-primary">
                300 scans/month
              </span>{" "}
              and unlimited scan history.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles size={14} />
              Pro Plan Active
            </div>
          </>
        ) : (
          <>
            <Loader2 size={32} className="mx-auto mb-6 animate-spin text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Activating your Pro plan...
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              This usually takes just a few seconds.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-full">
            <Link href="/">Start Scanning</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
