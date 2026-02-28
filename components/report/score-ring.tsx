"use client";

import { cn } from "@/lib/utils";

function scoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
}

function strokeColor(score: number) {
  if (score >= 80) return "stroke-success";
  if (score >= 50) return "stroke-warning";
  return "stroke-destructive";
}

export function ScoreRing({
  score,
  size = 120,
}: {
  score: number;
  size?: number;
}) {
  const r = 45;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="rotate-[-90deg]"
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={strokeColor(score)}
        />
      </svg>
      <span className={cn("absolute text-4xl font-bold", scoreColor(score))}>
        {score}
      </span>
    </div>
  );
}

export function dimensionBorderColor(score: number) {
  if (score >= 80) return "border-l-success";
  if (score >= 50) return "border-l-warning";
  return "border-l-destructive";
}

export { scoreColor };
