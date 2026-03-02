"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Download,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ArrowLeft,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  ScoreRing,
  scoreColor,
  dimensionBorderColor,
} from "@/components/report/score-ring";
import { CodeBlock } from "@/components/report/code-block";
import { cn } from "@/lib/utils";
import { getReport } from "@/lib/storage/local-store";
import { downloadTxt } from "@/lib/storage/txt-export";
import type { StoredReport, Issue } from "@/lib/types";

function IssueGroup({
  title,
  icon: Icon,
  iconClass,
  badgeClass,
  badgeLabel,
  issues,
  defaultOpen,
}: {
  title: string;
  icon: typeof AlertCircle;
  iconClass: string;
  badgeClass: string;
  badgeLabel: string;
  issues: Issue[];
  defaultOpen?: string;
}) {
  if (issues.length === 0) return null;
  return (
    <div>
      <h3
        className={cn(
          "mb-3 flex items-center gap-2 text-sm font-semibold",
          iconClass
        )}
      >
        <Icon size={16} /> {title} ({issues.length})
      </h3>
      <Accordion type="single" collapsible defaultValue={defaultOpen}>
        {issues.map((issue) => (
          <AccordionItem
            key={issue.id}
            value={`issue-${issue.id}`}
            className="mb-3 overflow-hidden rounded-xl border px-4"
          >
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex flex-wrap items-center gap-2 text-left">
                <Icon size={16} className={cn("shrink-0", iconClass)} />
                <span className="font-medium text-foreground">
                  {issue.title}
                </span>
                <Badge className={cn("border-0 text-[10px]", badgeClass)}>
                  {badgeLabel}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {issue.dimension}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mb-4 rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
                {issue.description}
              </div>
              {issue.steps.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    How to fix
                  </p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    {issue.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}
              {issue.code && (
                <div className="mb-4">
                  <p className="mb-1 text-xs text-muted-foreground">
                    Code example
                  </p>
                  <CodeBlock code={issue.code} />
                </div>
              )}
              {issue.referenceUrl && (
                <a
                  href={issue.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink size={12} /> Reference
                </a>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function EEATBar({
  label,
  score,
  maxScore,
  evidence,
  gaps,
}: {
  label: string;
  score: number;
  maxScore: number;
  evidence: string;
  gaps: string;
}) {
  const pct = Math.round((score / maxScore) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground capitalize">
          {label}
        </span>
        <span className={cn("text-sm font-bold", scoreColor(pct))}>
          {score}/{maxScore}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 80
              ? "bg-success"
              : pct >= 50
                ? "bg-warning"
                : "bg-destructive"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        <p>
          <span className="font-medium text-success">Evidence:</span>{" "}
          {evidence}
        </p>
        <p>
          <span className="font-medium text-destructive">Gaps:</span> {gaps}
        </p>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<StoredReport | null | undefined>(
    undefined
  );

  useEffect(() => {
    setReport(getReport(id));
  }, [id]);

  if (report === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-bg">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (report === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 gradient-bg">
        <h1 className="text-2xl font-bold text-foreground">
          Report not found
        </h1>
        <p className="text-muted-foreground">
          This report may have expired or been deleted.
        </p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft size={16} className="mr-2" />
            Scan a new URL
          </Link>
        </Button>
      </div>
    );
  }

  const d = report.scanResult;
  const criticalIssues = d.issues.filter(
    (i) => i.severity === "critical"
  );
  const warningIssues = d.issues.filter(
    (i) => i.severity === "warning"
  );

  const dimensions = [
    { label: "AI Crawlability", score: d.scores.crawlability },
    { label: "AI Navigation", score: d.scores.navigation },
    { label: "Structured Data", score: d.scores.structured },
    { label: "Citability", score: d.scores.citability },
  ];

  const signals = [
    { label: "robots.txt", ok: d.domainSignals.robotsTxt },
    { label: "llms.txt", ok: d.domainSignals.llmsTxt },
    {
      label: d.domainSignals.sitemapPages
        ? `sitemap.xml (${d.domainSignals.sitemapPages} pages)`
        : "sitemap.xml",
      ok: d.domainSignals.sitemapXml,
    },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Top Bar */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            GeoFast
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadTxt(report)}
            >
              <Download size={16} />
              Export TXT
            </Button>
            <Button size="sm" asChild>
              <Link href="/">New Scan</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl space-y-10 py-10">
        {/* Report Header */}
        <section>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {d.domain}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Found{" "}
            <span className="font-semibold text-destructive">
              {criticalIssues.length} critical{" "}
              {criticalIssues.length === 1 ? "issue" : "issues"}
            </span>
            ,{" "}
            <span className="font-semibold text-warning">
              {warningIssues.length} warnings
            </span>
            ,{" "}
            <span className="font-semibold text-success">
              {d.passed.length} passed
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {signals.map((s) => (
              <Badge
                key={s.label}
                variant="outline"
                className={cn(
                  "text-xs",
                  s.ok
                    ? "border-success/40 text-success"
                    : "border-destructive/40 text-destructive"
                )}
              >
                {s.label} {s.ok ? "+" : "-"}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Scanned {new Date(d.scannedAt).toLocaleString()}
          </p>
        </section>

        {/* Score Overview */}
        <section className="flex flex-col items-center gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:p-8">
          <ScoreRing score={d.overallScore} size={140} />
          <div className="grid w-full flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
            {dimensions.map((dim) => (
              <div
                key={dim.label}
                className={cn(
                  "rounded-lg border-l-4 bg-secondary/50 px-4 py-3",
                  dimensionBorderColor(dim.score)
                )}
              >
                <p
                  className={cn(
                    "text-2xl font-bold sm:text-3xl",
                    scoreColor(dim.score)
                  )}
                >
                  {dim.score}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {dim.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="h-11 w-full justify-start bg-secondary/50">
            <TabsTrigger value="issues" className="gap-1.5">
              Issues
              <Badge
                variant="secondary"
                className="ml-1 h-5 px-1.5 text-[10px]"
              >
                {d.issues.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="passed" className="gap-1.5">
              Passed
              <Badge
                variant="secondary"
                className="ml-1 h-5 px-1.5 text-[10px]"
              >
                {d.passed.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5">
              AI Perspective
              {d.llmPerspective && (
                <span className="ml-1 inline-block h-2 w-2 rounded-full bg-success" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Issues */}
          <TabsContent value="issues" className="mt-6 space-y-8">
            <IssueGroup
              title="Needs Fix"
              icon={AlertCircle}
              iconClass="text-destructive"
              badgeClass="bg-destructive/10 text-destructive"
              badgeLabel="Critical"
              issues={criticalIssues}
              defaultOpen={
                criticalIssues[0] ? `issue-${criticalIssues[0].id}` : undefined
              }
            />
            <IssueGroup
              title="Suggested Improvements"
              icon={AlertTriangle}
              iconClass="text-warning"
              badgeClass="bg-warning/10 text-warning"
              badgeLabel="Warning"
              issues={warningIssues}
            />
          </TabsContent>

          {/* Tab 2: Passed */}
          <TabsContent value="passed" className="mt-6">
            <div className="space-y-2">
              {d.passed.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <CheckCircle
                    size={16}
                    className="shrink-0 text-success"
                  />
                  <span className="text-sm text-foreground">
                    {item.name}
                  </span>
                  <Badge variant="outline" className="ml-auto text-[10px]">
                    {item.category}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 3: AI Perspective */}
          <TabsContent value="ai" className="mt-6 space-y-6">
            {d.llmPerspective ? (
              <>
                {/* Brand Overview */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-foreground">
                      {d.llmPerspective.brandOverview.name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {d.llmPerspective.brandOverview.businessType}
                    </Badge>
                  </div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    {d.llmPerspective.brandOverview.targetUsers}
                  </p>
                  <p className="mb-6 text-sm font-medium text-foreground">
                    AI Citation Score:{" "}
                    <span className="text-primary">
                      {d.llmPerspective.citationScore}/10
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      — {d.llmPerspective.citationReasoning}
                    </span>
                  </p>

                  {/* Strengths & Weaknesses */}
                  <div className="mb-6 grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-success">
                        <CheckCircle size={14} /> Strengths
                      </p>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {d.llmPerspective.strengths.map((s, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-success">+</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive">
                        <AlertCircle size={14} /> Weaknesses
                      </p>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {d.llmPerspective.weaknesses.map((w, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-destructive">-</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* AI Understanding */}
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-success">
                        <CheckCircle size={14} /> AI clearly understands
                      </p>
                      <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                        {d.llmPerspective.aiUnderstanding.clearlyUnderstood.map(
                          (t, i) => (
                            <li key={i}>{t}</li>
                          )
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning">
                        <AlertTriangle size={14} /> AI is confused about
                      </p>
                      <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                        {d.llmPerspective.aiUnderstanding.confused.map(
                          (t, i) => (
                            <li key={i}>{t}</li>
                          )
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive">
                        <XCircle size={14} /> AI cannot find
                      </p>
                      <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                        {d.llmPerspective.aiUnderstanding.missing.map(
                          (t, i) => (
                            <li key={i}>{t}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {d.llmPerspective.recommendations.length > 0 && (
                    <div className="mt-6">
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                        <Star size={14} /> Recommendations
                      </p>
                      <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                        {d.llmPerspective.recommendations.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                {/* E-E-A-T Assessment */}
                {d.llmCitability && (
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-foreground">
                        E-E-A-T Assessment
                      </h3>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          Citability Score
                        </p>
                        <p
                          className={cn(
                            "text-2xl font-bold",
                            scoreColor(d.llmCitability.citabilityScore)
                          )}
                        >
                          {d.llmCitability.citabilityScore}/100
                        </p>
                      </div>
                    </div>
                    <div className="space-y-5">
                      <EEATBar
                        label="Experience"
                        score={d.llmCitability.eeat.experience.score}
                        maxScore={25}
                        evidence={
                          d.llmCitability.eeat.experience.evidence
                        }
                        gaps={d.llmCitability.eeat.experience.gaps}
                      />
                      <EEATBar
                        label="Expertise"
                        score={d.llmCitability.eeat.expertise.score}
                        maxScore={25}
                        evidence={
                          d.llmCitability.eeat.expertise.evidence
                        }
                        gaps={d.llmCitability.eeat.expertise.gaps}
                      />
                      <EEATBar
                        label="Authoritativeness"
                        score={d.llmCitability.eeat.authority.score}
                        maxScore={25}
                        evidence={
                          d.llmCitability.eeat.authority.evidence
                        }
                        gaps={d.llmCitability.eeat.authority.gaps}
                      />
                      <EEATBar
                        label="Trustworthiness"
                        score={d.llmCitability.eeat.trust.score}
                        maxScore={25}
                        evidence={d.llmCitability.eeat.trust.evidence}
                        gaps={d.llmCitability.eeat.trust.gaps}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">
                  AI perspective analysis was not available for this scan.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This can happen when the LLM service is temporarily
                  unavailable. Deterministic analysis results are still shown
                  in the Issues and Passed tabs.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <Link
            href="/"
            className="font-medium text-primary hover:underline"
          >
            GeoFast
          </Link>
        </footer>
      </main>
    </div>
  );
}
