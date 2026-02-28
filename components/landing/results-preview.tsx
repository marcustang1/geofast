import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

function MiniScoreRing({ score, label }: { score: number; label: string }) {
  const c = 283;
  const offset = c - (score / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width="48"
        height="48"
        viewBox="0 0 100 100"
        className="rotate-[-90deg]"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="stroke-primary"
        />
      </svg>
      <span className="text-xs font-semibold text-foreground">{score}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

export function ResultsPreview() {
  return (
    <section className="bg-secondary/30 py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block text-sm font-semibold text-primary">
            Results Preview
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Understand how AI sees your brand
          </h2>
          <p className="mt-4 text-muted-foreground">
            Get a detailed AI perspective analysis — what AI clearly
            understands, what confuses it, and what&apos;s missing from your
            site.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-2">
          {/* Report Card */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm lg:translate-y-2 lg:rotate-[-1deg]">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Audit Report</p>
                <p className="text-sm font-semibold text-foreground">
                  www.example.com
                </p>
              </div>
              <div className="relative flex items-center justify-center">
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 100 100"
                  className="rotate-[-90deg]"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                    className="stroke-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                    strokeDasharray={283}
                    strokeDashoffset={283 - (78 / 100) * 283}
                    strokeLinecap="round"
                    className="stroke-primary"
                  />
                </svg>
                <span className="absolute text-lg font-bold text-foreground">
                  78
                </span>
              </div>
            </div>

            <div className="mb-8 flex justify-between">
              <MiniScoreRing score={95} label="Crawl" />
              <MiniScoreRing score={82} label="Nav" />
              <MiniScoreRing score={71} label="Schema" />
              <MiniScoreRing score={64} label="Cite" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3">
                <AlertCircle size={16} className="shrink-0 text-destructive" />
                <span className="text-sm text-foreground">
                  Missing llms.txt file
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-success/10 px-4 py-3">
                <CheckCircle size={16} className="shrink-0 text-success" />
                <span className="text-sm text-foreground">
                  Valid JSON-LD Schema detected
                </span>
              </div>
            </div>
          </div>

          {/* AI Perspective Card */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm lg:-translate-y-2 lg:rotate-[1deg]">
            <div className="mb-6">
              <p className="text-xs text-muted-foreground">AI Perspective</p>
              <div className="mt-1 flex items-center gap-3">
                <p className="text-sm font-semibold text-foreground">
                  Example Corp
                </p>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                  SaaS / Technology
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                AI Citation Score:{" "}
                <span className="text-primary">7/10</span>
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-success">
                  <CheckCircle size={14} /> AI clearly understands
                </p>
                <ul className="space-y-1.5 pl-6 text-sm text-muted-foreground">
                  <li>Core product offering and value proposition</li>
                  <li>Pricing structure and plan differences</li>
                  <li>Company founding year and team size</li>
                </ul>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-warning">
                  <AlertTriangle size={14} /> AI is confused about
                </p>
                <ul className="space-y-1.5 pl-6 text-sm text-muted-foreground">
                  <li>Target audience and ideal customer profile</li>
                  <li>Differentiation from competitors</li>
                </ul>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-destructive">
                  <XCircle size={14} /> AI cannot find
                </p>
                <ul className="space-y-1.5 pl-6 text-sm text-muted-foreground">
                  <li>Customer success stories or case studies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
