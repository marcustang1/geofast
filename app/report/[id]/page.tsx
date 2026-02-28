"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Download,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
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
import { ScoreRing, scoreColor, dimensionBorderColor } from "@/components/report/score-ring";
import { CodeBlock } from "@/components/report/code-block";
import { cn } from "@/lib/utils";

const reportData = {
  domain: "www.plaud.ai",
  overallScore: 75,
  summary: { critical: 1, warnings: 5 },
  signals: [
    { label: "robots.txt", ok: true },
    { label: "llms.txt", ok: false },
    { label: "sitemap.xml", ok: true },
  ],
  dimensions: [
    { label: "AI Crawlability", short: "Crawl", score: 100 },
    { label: "AI Navigation", short: "Nav", score: 88 },
    { label: "Structured Data", short: "Structured", score: 90 },
    { label: "Citability", short: "Cite", score: 70 },
  ],
  issues: [
    {
      id: "1",
      severity: "critical" as const,
      dimension: "AI Crawlability",
      title: "Missing llms.txt file",
      pages: "llms.txt · 1/1 pages · ~1 page affected",
      description:
        "Your website does not have an llms.txt file. This is a standard file specifically designed to provide brand information to AI. Without it, AI systems struggle to obtain accurate brand facts, reducing the probability of being correctly cited.",
      steps: [
        "Create a /llms.txt file in your website root directory",
        "Add a brand summary (one sentence describing who you are)",
        "Add core facts (founding year, headquarters, business type)",
        "Add recommended page links (About, Products, FAQ)",
      ],
      code: `# Brand Name
> One-sentence brand positioning: what we do, who we serve, what value we provide

## Core Facts
- Founded: 2020
- Headquarters: Shenzhen
- Business: AI Recording Devices
- Website: https://example.com

## Recommended Pages
- [About Us](https://example.com/about)
- [Products](https://example.com/products)
- [FAQ](https://example.com/faq)`,
      affectedPage: "/llms.txt",
    },
    {
      id: "2",
      severity: "warning" as const,
      dimension: "Structured Data",
      title: "Incomplete multilingual content",
      pages: "Homepage · 1/1 pages · ~1 page affected",
      description:
        "Multilingual versions of content are incomplete, which may confuse AI when summarizing your brand for users in different languages.",
      steps: [
        "Ensure all key pages have complete translations",
        "Add hreflang tags for each language variant",
      ],
      code: null,
      affectedPage: null,
    },
    {
      id: "3",
      severity: "warning" as const,
      dimension: "Citability",
      title: "FAQ page exists",
      pages: "FAQ page · 8/10 pages · ~68 pages affected",
      description:
        "Your FAQ page is present but could be better structured with FAQ schema markup to improve AI answer extraction.",
      steps: [
        "Add FAQPage schema markup",
        "Ensure questions are in proper heading tags",
      ],
      code: null,
      affectedPage: null,
    },
    {
      id: "4",
      severity: "warning" as const,
      dimension: "Structured Data",
      title: "Organization.contactPoint",
      pages: "Homepage · 1/1 pages · ~1 page affected",
      description: "Missing contactPoint in Organization schema.",
      steps: ["Add contactPoint to your Organization JSON-LD"],
      code: null,
      affectedPage: null,
    },
    {
      id: "5",
      severity: "warning" as const,
      dimension: "Structured Data",
      title: "Organization.address",
      pages: "Homepage · 1/1 pages · ~1 page affected",
      description: "Missing address in Organization schema.",
      steps: ["Add PostalAddress to your Organization JSON-LD"],
      code: null,
      affectedPage: null,
    },
    {
      id: "6",
      severity: "warning" as const,
      dimension: "AI Navigation",
      title: "Low page structure score",
      pages: "Homepage · 1/1 pages · ~1 page affected",
      description:
        "Page heading hierarchy is not optimal for AI parsing.",
      steps: [
        "Use a single H1 per page",
        "Maintain proper heading hierarchy (H1 > H2 > H3)",
      ],
      code: null,
      affectedPage: null,
    },
  ],
  passed: [
    "Valid JSON-LD Schema detected",
    "robots.txt allows AI crawlers",
    "Open Graph meta tags present",
    "Canonical URL set",
    "Proper heading hierarchy on product pages",
    "sitemap.xml accessible",
    "Meta description present on all pages",
    "Alt text on hero images",
    "HTTPS enforced",
    "Fast page load time (<2s)",
    "Mobile responsive",
    "Structured breadcrumbs",
    "Language attribute set",
    "Viewport meta tag present",
    "No duplicate title tags",
    "No broken internal links",
    "Social media links present",
    "favicon.ico accessible",
    "Content-Type headers correct",
    "No noindex on key pages",
    "Clean URL structure",
    "Image optimization",
    "Proper 404 page",
    "XML sitemap valid format",
    "No mixed content warnings",
    "Server response < 500ms",
    "Compression enabled (gzip)",
  ],
  aiPerspective: {
    brandName: "PLAUD",
    businessType: "AI Recording Devices",
    citationScore: 7,
    understands: [
      "Core product offering — AI-powered voice recorders",
      "Key product features and differentiators",
      "Company's focus on AI transcription technology",
    ],
    confused: [
      "Target audience and ideal customer profile",
      "Differentiation from smartphone recording apps",
    ],
    missing: ["Customer success stories or case studies"],
  },
};

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
  issues: typeof reportData.issues;
  defaultOpen?: string;
}) {
  if (issues.length === 0) return null;
  return (
    <div>
      <h3 className={cn("mb-3 flex items-center gap-2 text-sm font-semibold", iconClass)}>
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
              <p className="mb-3 text-xs text-muted-foreground">
                {issue.pages}
              </p>
              <div className="mb-4 rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
                {issue.description}
              </div>
              {issue.steps.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    🔧 How to fix
                  </p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    {issue.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}
              {issue.code && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    &lt;&gt; Code example
                  </p>
                  <CodeBlock code={issue.code} />
                </div>
              )}
              {issue.affectedPage && (
                <div className="mt-4 text-xs text-muted-foreground">
                  <p className="mb-1 flex items-center gap-1 font-medium text-foreground">
                    <ExternalLink size={12} /> Affected page
                  </p>
                  <span className="text-primary">{issue.affectedPage}</span>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const d = reportData;

  const criticalIssues = d.issues.filter((i) => i.severity === "critical");
  const warningIssues = d.issues.filter((i) => i.severity === "warning");

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
              onClick={() => console.log("Export TXT for report", id)}
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
              {d.summary.critical} critical issue
            </span>
            ,{" "}
            <span className="font-semibold text-warning">
              {d.summary.warnings} warnings
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {d.signals.map((s) => (
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
                {s.label} {s.ok ? "✅" : "❌"}
              </Badge>
            ))}
          </div>
        </section>

        {/* Score Overview */}
        <section className="flex flex-col items-center gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:p-8">
          <ScoreRing score={d.overallScore} size={140} />
          <div className="grid w-full flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
            {d.dimensions.map((dim) => (
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
              <span className="ml-1 inline-block h-2 w-2 rounded-full bg-success" />
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
              defaultOpen="issue-1"
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
                  <CheckCircle size={16} className="shrink-0 text-success" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 3: AI Perspective */}
          <TabsContent value="ai" className="mt-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-bold text-foreground">
                  {d.aiPerspective.brandName}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {d.aiPerspective.businessType}
                </Badge>
              </div>
              <p className="mb-6 text-sm font-medium text-foreground">
                AI Citation Score:{" "}
                <span className="text-primary">
                  {d.aiPerspective.citationScore}/10
                </span>
              </p>

              <div className="space-y-6">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-success">
                    <CheckCircle size={14} /> AI clearly understands
                  </p>
                  <ul className="list-disc space-y-1.5 pl-6 text-sm text-muted-foreground">
                    {d.aiPerspective.understands.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning">
                    <AlertTriangle size={14} /> AI is confused about
                  </p>
                  <ul className="list-disc space-y-1.5 pl-6 text-sm text-muted-foreground">
                    {d.aiPerspective.confused.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive">
                    <XCircle size={14} /> AI cannot find
                  </p>
                  <ul className="list-disc space-y-1.5 pl-6 text-sm text-muted-foreground">
                    {d.aiPerspective.missing.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
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
