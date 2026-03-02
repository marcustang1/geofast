import axios from "axios";
import type { DomainSignals } from "@/lib/types";

function getBaseUrl(url: string): string {
  const parsed = new URL(url);
  return `${parsed.protocol}//${parsed.host}`;
}

async function checkFileExists(fileUrl: string): Promise<boolean> {
  try {
    const res = await axios.head(fileUrl, {
      timeout: 5000,
      maxRedirects: 3,
      validateStatus: (s) => s < 400,
    });
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

async function countSitemapPages(sitemapUrl: string): Promise<number> {
  try {
    const res = await axios.get(sitemapUrl, {
      timeout: 8000,
      maxRedirects: 3,
      responseType: "text",
      headers: { Accept: "application/xml, text/xml" },
    });
    const xml = typeof res.data === "string" ? res.data : "";
    const matches = xml.match(/<loc>/gi);
    return matches ? matches.length : 0;
  } catch {
    return 0;
  }
}

export async function detectDomainSignals(
  url: string
): Promise<DomainSignals> {
  const base = getBaseUrl(url);

  const [robotsTxt, llmsTxt, sitemapXml] = await Promise.all([
    checkFileExists(`${base}/robots.txt`),
    checkFileExists(`${base}/llms.txt`),
    checkFileExists(`${base}/sitemap.xml`),
  ]);

  let sitemapPages: number | undefined;
  if (sitemapXml) {
    sitemapPages = await countSitemapPages(`${base}/sitemap.xml`);
  }

  return { robotsTxt, llmsTxt, sitemapXml, sitemapPages };
}
