"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GeoFast] Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 gradient-bg px-4">
      <div className="flex items-center gap-3 text-destructive">
        <AlertCircle size={32} />
        <h1 className="text-2xl font-bold">Something went wrong</h1>
      </div>
      <p className="max-w-md text-center text-muted-foreground">
        An unexpected error occurred. This might be a temporary issue — please
        try again.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          <RotateCcw size={16} className="mr-2" />
          Try again
        </Button>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
