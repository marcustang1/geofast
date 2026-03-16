"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllReports, deleteReport } from "@/lib/storage/local-store";
import { scoreColor } from "@/components/report/score-ring";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { StoredReport } from "@/lib/types";

export function ScanHistory() {
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [plan, setPlan] = useState<string>("trial");
  const supabase = createClient();

  useEffect(() => {
    setReports(getAllReports());

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetch("/api/user/profile")
          .then((r) => (r.ok ? r.json() : null))
          .then((p) => {
            if (p?.plan) setPlan(p.plan);
          })
          .catch(() => {});
      }
    });
  }, [supabase.auth]);

  if (reports.length === 0) return null;

  const maxDisplay = plan === "pro" ? reports.length : 5;
  const visible = reports.slice(0, maxDisplay);

  function handleDelete(id: string) {
    deleteReport(id);
    setReports(getAllReports());
  }

  return (
    <section className="container max-w-3xl py-16">
      <div className="mb-6 flex items-center gap-2">
        <Clock size={18} className="text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Recent Scans
        </h2>
        {plan !== "pro" && reports.length > maxDisplay && (
          <span className="ml-auto text-xs text-muted-foreground">
            Showing {maxDisplay} of {reports.length} · Upgrade for full history
          </span>
        )}
      </div>
      <div className="space-y-3">
        {visible.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-shadow hover:shadow-md"
          >
            <div
              className={cn(
                "text-2xl font-bold tabular-nums",
                scoreColor(r.overallScore)
              )}
            >
              {r.overallScore}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">
                {r.domain}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {r.scanResult.issues.length} issues
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(r.id);
                }}
              >
                <Trash2 size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href={`/report/${r.id}`}>
                  <ArrowRight size={14} />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
