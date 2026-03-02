import type { ScanResult, StoredReport } from "@/lib/types";

const STORAGE_KEY = "geofast_reports";
const MAX_REPORTS = 20;

export function saveReport(scanResult: ScanResult): StoredReport {
  const report: StoredReport = {
    id: crypto.randomUUID(),
    url: scanResult.url,
    domain: scanResult.domain,
    overallScore: scanResult.overallScore,
    scanResult,
    createdAt: new Date().toISOString(),
  };

  const existing = getAllReports();
  existing.unshift(report);

  if (existing.length > MAX_REPORTS) {
    existing.splice(MAX_REPORTS);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }

  return report;
}

export function getReport(id: string): StoredReport | null {
  const reports = getAllReports();
  return reports.find((r) => r.id === id) ?? null;
}

export function getAllReports(): StoredReport[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredReport[];
  } catch {
    return [];
  }
}

export function deleteReport(id: string): void {
  const reports = getAllReports().filter((r) => r.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
}
