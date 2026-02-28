import { Star } from "lucide-react";

const testimonials = [
  {
    initials: "JK",
    name: "James K.",
    role: "SEO Lead, TechCorp",
    quote:
      "GeoFast found 12 issues our traditional SEO tools completely missed. The AI perspective report was eye-opening.",
  },
  {
    initials: "SL",
    name: "Sarah L.",
    role: "Content Strategist, StartupXYZ",
    quote:
      "Finally a tool that tells me how AI actually sees our content. The llms.txt recommendation alone was worth it.",
  },
  {
    initials: "MR",
    name: "Mike R.",
    role: "Founder, IndieProduct",
    quote:
      "Simple, fast, and actionable. I fixed 3 issues and saw my brand mentioned more in Perplexity within a week.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block text-sm font-semibold text-primary">
            Testimonials
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by SEO professionals
          </h2>
          <p className="mt-4 text-muted-foreground">
            See what early users say about GeoFast.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="pointer-events-none absolute right-6 top-4 select-none font-serif text-6xl leading-none text-muted/60">
                &ldquo;
              </span>

              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-primary text-primary"
                  />
                ))}
              </div>

              <p className="relative z-10 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
