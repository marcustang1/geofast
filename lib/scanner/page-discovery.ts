import axios from "axios";
import * as cheerio from "cheerio";

const DISCOVERY_TIMEOUT = 10_000;
const MAX_PAGES = 5;

const COMMON_PATHS = [
  "/about",
  "/about-us",
  "/faq",
  "/blog",
  "/products",
  "/pricing",
  "/contact",
  "/services",
  "/features",
  "/support",
  "/help",
  "/privacy",
  "/terms",
];

function getBaseUrl(url: string): string {
  const parsed = new URL(url);
  return `${parsed.protocol}//${parsed.host}`;
}

function isSameDomain(href: string, base: string): boolean {
  try {
    const parsed = new URL(href, base);
    const baseParsed = new URL(base);
    return parsed.hostname === baseParsed.hostname;
  } catch {
    return false;
  }
}

function normalizePageUrl(href: string, base: string): string | null {
  try {
    const parsed = new URL(href, base);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    parsed.hash = "";
    parsed.search = "";
    let pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    if (pathname !== "/") pathname = pathname.replace(/\/index\.(html?|php)$/i, "/");
    return `${parsed.protocol}//${parsed.host}${pathname}`;
  } catch {
    return null;
  }
}

function isContentPage(urlStr: string): boolean {
  const ext = urlStr.split(".").pop()?.toLowerCase() ?? "";
  const nonContent = ["jpg", "jpeg", "png", "gif", "svg", "webp", "pdf", "css", "js", "xml", "json", "ico", "woff", "woff2", "ttf", "mp4", "mp3", "zip"];
  return !nonContent.includes(ext);
}

async function discoverFromSitemap(baseUrl: string, signal: AbortSignal): Promise<string[]> {
  try {
    const { data } = await axios.get(`${baseUrl}/sitemap.xml`, {
      timeout: 5000,
      signal,
      responseType: "text",
      headers: { Accept: "application/xml, text/xml" },
    });
    const xml = typeof data === "string" ? data : "";
    const urls: string[] = [];
    const locRegex = /<loc>\s*(.*?)\s*<\/loc>/gi;
    let match;
    while ((match = locRegex.exec(xml)) !== null) {
      const loc = match[1];
      if (loc && isSameDomain(loc, baseUrl) && isContentPage(loc)) {
        const normalized = normalizePageUrl(loc, baseUrl);
        if (normalized) urls.push(normalized);
      }
    }
    return urls;
  } catch {
    return [];
  }
}

async function discoverFromNavLinks(pageUrl: string, signal: AbortSignal): Promise<string[]> {
  try {
    const { data: html } = await axios.get(pageUrl, {
      timeout: 5000,
      signal,
      responseType: "text",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GeoFastBot/1.0; +https://geofast.app)",
        Accept: "text/html",
      },
    });
    const $ = cheerio.load(html);
    const base = getBaseUrl(pageUrl);
    const urls: string[] = [];

    $("nav a[href], header a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      if (!isSameDomain(href, base)) return;
      const normalized = normalizePageUrl(href, base);
      if (normalized && isContentPage(normalized)) urls.push(normalized);
    });
    return urls;
  } catch {
    return [];
  }
}

async function discoverFromCommonPaths(baseUrl: string, signal: AbortSignal): Promise<string[]> {
  const found: string[] = [];
  const checks = COMMON_PATHS.map(async (path) => {
    try {
      const testUrl = `${baseUrl}${path}`;
      const res = await axios.head(testUrl, {
        timeout: 3000,
        signal,
        maxRedirects: 3,
        validateStatus: (s) => s >= 200 && s < 400,
      });
      if (res.status >= 200 && res.status < 400) found.push(testUrl);
    } catch {
      // skip
    }
  });
  await Promise.allSettled(checks);
  return found;
}

export async function discoverPages(inputUrl: string): Promise<string[]> {
  const base = getBaseUrl(inputUrl);
  const normalized = normalizePageUrl(inputUrl, base) ?? inputUrl;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DISCOVERY_TIMEOUT);

  try {
    const seen = new Set<string>([normalized]);
    const result: string[] = [normalized];

    const sitemapUrls = await discoverFromSitemap(base, controller.signal);
    for (const u of sitemapUrls) {
      if (!seen.has(u) && result.length < MAX_PAGES) {
        seen.add(u);
        result.push(u);
      }
    }

    if (result.length < MAX_PAGES) {
      const navUrls = await discoverFromNavLinks(normalized, controller.signal);
      for (const u of navUrls) {
        if (!seen.has(u) && result.length < MAX_PAGES) {
          seen.add(u);
          result.push(u);
        }
      }
    }

    if (result.length < MAX_PAGES) {
      const commonUrls = await discoverFromCommonPaths(base, controller.signal);
      for (const u of commonUrls) {
        if (!seen.has(u) && result.length < MAX_PAGES) {
          seen.add(u);
          result.push(u);
        }
      }
    }

    return result;
  } finally {
    clearTimeout(timeout);
  }
}
