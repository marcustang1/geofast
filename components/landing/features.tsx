import { Shield, Compass, Code, Quote } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "AI Crawlability",
    desc: "Can AI bots access and extract your content? We check robots.txt, llms.txt, meta tags, and content extractability.",
  },
  {
    icon: Compass,
    title: "AI Navigation",
    desc: "Is your site structure easy for AI to understand? We evaluate headings, internal links, and content organization.",
  },
  {
    icon: Code,
    title: "Structured Data",
    desc: "Does your site speak AI's language? We validate Schema.org markup, JSON-LD, Open Graph, and semantic HTML.",
  },
  {
    icon: Quote,
    title: "Citability",
    desc: "Is your content worth citing? We assess E-E-A-T signals, factual density, and answer-readiness for AI queries.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block text-sm font-semibold text-primary">
            What we analyze
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Four dimensions of AI readiness
          </h2>
          <p className="mt-4 text-muted-foreground">
            Powered by 30+ automated checks and LLM deep analysis.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon size={22} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
