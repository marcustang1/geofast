export interface FixTemplate {
  description: string;
  steps: string[];
  codeExample?: string;
  referenceUrl?: string;
}

const TEMPLATES: Record<string, FixTemplate> = {
  "llms.txt": {
    description:
      "llms.txt is a standard file that provides brand information directly to AI systems. Without it, AI struggles to obtain accurate brand facts.",
    steps: [
      "Create a /llms.txt file in your website root directory",
      "Add a brand summary (one sentence describing who you are)",
      "Add core facts (founding year, headquarters, business type)",
      "Add recommended page links (About, Products, FAQ)",
    ],
    codeExample: `# Brand Name
> One-sentence brand positioning

## Core Facts
- Founded: 2020
- Headquarters: City, Country
- Business: Your industry
- Website: https://example.com

## Recommended Pages
- [About Us](https://example.com/about)
- [Products](https://example.com/products)
- [FAQ](https://example.com/faq)`,
    referenceUrl: "https://llmstxt.org/",
  },

  "structured data": {
    description:
      "Structured data (JSON-LD) helps AI understand the semantic meaning of your content, improving citation accuracy.",
    steps: [
      "Choose the appropriate Schema.org type for your page (Organization, Product, Article, etc.)",
      "Add a JSON-LD script block to the <head> of your page",
      "Include key properties: name, description, url, logo",
      "Validate with Google's Rich Results Test",
    ],
    codeExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Brand",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "One-sentence description",
  "sameAs": [
    "https://twitter.com/yourbrand",
    "https://linkedin.com/company/yourbrand"
  ]
}
</script>`,
    referenceUrl: "https://schema.org/docs/gs.html",
  },

  "schema completeness": {
    description:
      "Your Schema.org markup exists but is missing important fields that help AI understand your content.",
    steps: [
      "Review your existing JSON-LD markup",
      "Add missing properties recommended for your schema type",
      "For Organization: add contactPoint, address, foundingDate",
      "For Product: add offers, brand, review, aggregateRating",
    ],
    referenceUrl: "https://schema.org/Organization",
  },

  "heading hierarchy": {
    description:
      "A proper heading hierarchy (H1 > H2 > H3) helps AI parse and understand the content structure of your page.",
    steps: [
      "Use exactly one H1 per page as the main title",
      "Use H2 for major sections",
      "Use H3 for subsections within H2 blocks",
      "Never skip heading levels (e.g. H1 → H3 without H2)",
    ],
    referenceUrl: "https://web.dev/learn/html/headings-and-sections/",
  },

  "word count": {
    description:
      "Pages with very little content are harder for AI to extract meaningful information from. Aim for at least 300 words on key pages.",
    steps: [
      "Identify thin content pages (under 300 words)",
      "Expand content with relevant, factual information",
      "Add FAQ sections, use cases, or feature descriptions",
      "Ensure content is useful, not just filler text",
    ],
  },

  "author attribution": {
    description:
      "Author information signals expertise and trustworthiness (E-E-A-T). AI systems use this to evaluate content credibility.",
    steps: [
      "Add author name and bio to articles/blog posts",
      "Use Person schema markup for authors",
      'Include links to author credentials or "About" page',
    ],
    codeExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://example.com/about/author"
  }
}
</script>`,
    referenceUrl: "https://schema.org/author",
  },

  "publication date": {
    description:
      "Publication and modification dates help AI assess content freshness. Missing dates may cause AI to treat content as outdated.",
    steps: [
      "Add visible publication dates to articles and blog posts",
      'Use <time datetime="..."> HTML element',
      "Add datePublished and dateModified to Article schema",
      "Keep content updated and reflect modification dates",
    ],
    codeExample: `<time datetime="2026-01-15">January 15, 2026</time>`,
    referenceUrl: "https://schema.org/datePublished",
  },

  "faq": {
    description:
      "FAQ pages are highly citable by AI. Adding FAQPage schema markup makes your answers directly extractable.",
    steps: [
      "Structure your FAQ with clear question-answer pairs",
      "Add FAQPage schema markup",
      "Use proper heading tags for questions",
      "Keep answers concise and factual",
    ],
    codeExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is your product?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Our product is..."
    }
  }]
}
</script>`,
    referenceUrl: "https://schema.org/FAQPage",
  },

  "contact": {
    description:
      "Missing contact information reduces AI's ability to verify your organization's legitimacy and trustworthiness.",
    steps: [
      "Add a dedicated Contact page with email, phone, and address",
      "Include contactPoint in your Organization schema",
      "Add a physical address if applicable",
    ],
    codeExample: `"contactPoint": {
  "@type": "ContactPoint",
  "telephone": "+1-555-123-4567",
  "contactType": "customer service",
  "email": "support@example.com"
}`,
    referenceUrl: "https://schema.org/contactPoint",
  },

  "open graph": {
    description:
      "Open Graph meta tags help AI platforms understand and preview your content when generating responses.",
    steps: [
      "Add og:title, og:description, og:image, og:url to all key pages",
      "Use high-quality images (1200×630px recommended)",
      "Ensure og:description is concise and informative",
    ],
    codeExample: `<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Brief description" />
<meta property="og:image" content="https://example.com/image.jpg" />
<meta property="og:url" content="https://example.com/page" />`,
    referenceUrl: "https://ogp.me/",
  },

  "meta description": {
    description:
      "Meta descriptions provide a concise summary of your page that AI systems often use as a first-pass understanding of content.",
    steps: [
      "Add a unique meta description to every important page",
      "Keep it between 150–160 characters",
      "Include your primary value proposition or key facts",
    ],
    codeExample: `<meta name="description" content="Your concise page description here, 150-160 characters." />`,
    referenceUrl: "https://web.dev/learn/html/metadata/",
  },

  "image accessibility": {
    description:
      "Images without alt text are invisible to AI. Descriptive alt text helps AI understand visual content on your page.",
    steps: [
      "Add descriptive alt text to all meaningful images",
      "Describe what the image shows, not just the filename",
      "Skip alt text for purely decorative images (use alt=\"\")",
    ],
    referenceUrl:
      "https://web.dev/learn/accessibility/images/",
  },

  "external references": {
    description:
      "Citing external sources strengthens your content's credibility and gives AI grounding signals for fact-checking.",
    steps: [
      "Add references to authoritative sources (studies, reports, official docs)",
      "Use descriptive link text instead of 'click here'",
      "Cite data sources for any statistics or claims",
    ],
  },

  "readability": {
    description:
      "Content that is easy to read is easier for AI to compress and cite. Aim for clear, concise sentences.",
    steps: [
      "Keep average sentence length under 20 words",
      "Use simple language; avoid unnecessary jargon",
      "Break long paragraphs into shorter ones (3–5 sentences)",
      "Use transition words to improve flow",
    ],
  },

  "entity consistency": {
    description:
      "Referring to the same entity with different names confuses AI. Be consistent with brand names, product names, and terminology.",
    steps: [
      "Choose one canonical name for your brand/product and use it consistently",
      "Avoid alternating between abbreviations and full names without introduction",
      "Define acronyms on first use",
    ],
  },
};

const FACTOR_NAME_MAP: Record<string, string> = {
  "llms.txt presence": "llms.txt",
  "structured data": "structured data",
  "schema completeness": "schema completeness",
  "heading hierarchy": "heading hierarchy",
  "word count adequacy": "word count",
  "author attribution": "author attribution",
  "publication date": "publication date",
  "content freshness": "publication date",
  "q/a patterns": "faq",
  "contact/about links": "contact",
  "image accessibility": "image accessibility",
  "external references": "external references",
  "readability": "readability",
  "entity consistency": "entity consistency",
};

const KEYWORD_MAP: [string[], string][] = [
  [["llms.txt", "llms-full.txt", "llmstxt"], "llms.txt"],
  [["json-ld", "schema.org markup"], "structured data"],
  [["schema properties", "missing properties"], "schema completeness"],
  [["heading hierarchy", "h1 > h2"], "heading hierarchy"],
  [["word count", "thin content"], "word count"],
  [["author attribution", "byline"], "author attribution"],
  [["datepublished", "datemodified", "publication date"], "publication date"],
  [["faqpage", "question-answer pair"], "faq"],
  [["contactpoint"], "contact"],
  [["open graph", "og:title"], "open graph"],
  [["meta description"], "meta description"],
  [["alt text", "image alt"], "image accessibility"],
  [["readability", "flesch reading"], "readability"],
  [["entity consistency", "naming consistency"], "entity consistency"],
];

export function getFixTemplate(
  recommendationText: string,
  factorName?: string
): FixTemplate | undefined {
  if (factorName) {
    const key = FACTOR_NAME_MAP[factorName.toLowerCase()];
    if (key && TEMPLATES[key]) return TEMPLATES[key];
  }

  const lower = recommendationText.toLowerCase();
  for (const [keywords, templateKey] of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return TEMPLATES[templateKey];
    }
  }
  return undefined;
}
