import axios from "axios";
import * as cheerio from "cheerio";

const MAX_TEXT_LENGTH = 15000;

export interface ExtractedContent {
  rawHtml: string;
  textContent: string;
  metaTags: Record<string, string>;
  jsonLd: object[];
  title: string;
  headings: string[];
}

export async function extractContent(url: string): Promise<ExtractedContent> {
  const { data: rawHtml } = await axios.get<string>(url, {
    timeout: 15000,
    maxRedirects: 5,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; GeoFastBot/1.0; +https://geofast.app)",
      Accept: "text/html,application/xhtml+xml",
    },
    responseType: "text",
  });

  const $ = cheerio.load(rawHtml);

  const title = $("title").first().text().trim();

  const metaTags: Record<string, string> = {};
  $("meta").each((_, el) => {
    const name =
      $(el).attr("name") ||
      $(el).attr("property") ||
      $(el).attr("http-equiv");
    const content = $(el).attr("content");
    if (name && content) {
      metaTags[name.toLowerCase()] = content;
    }
  });

  const jsonLd: object[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html() || "");
      jsonLd.push(parsed);
    } catch {
      // skip malformed JSON-LD
    }
  });

  const headings: string[] = [];
  $("h1, h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    if (text) headings.push(text);
  });

  $("script, style, nav, footer, header, aside, iframe, noscript").remove();

  let textContent = $("body").text();
  textContent = textContent
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (textContent.length > MAX_TEXT_LENGTH) {
    textContent = textContent.slice(0, MAX_TEXT_LENGTH) + "…[truncated]";
  }

  return { rawHtml, textContent, metaTags, jsonLd, title, headings };
}
