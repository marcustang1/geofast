import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default function ContactPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Contact Us
      </h1>
      <p className="mt-4 text-muted-foreground">
        Have a question or need help? We&apos;re here for you.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Mail size={20} className="text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            General Support
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            For questions about GeoFast, scan results, or technical issues.
          </p>
          <a
            href="mailto:Marcus.tang@plaud.ai"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Marcus.tang@plaud.ai
          </a>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Clock size={20} className="text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Billing &amp; Subscriptions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            For subscription management, use the &quot;Manage Subscription&quot;
            button in your account menu. For billing inquiries:
          </p>
          <a
            href="mailto:Marcus.tang@plaud.ai"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Marcus.tang@plaud.ai
          </a>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-8">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <MapPin size={20} className="text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Location</h2>
        <p className="mt-2 text-sm text-muted-foreground">Shenzhen, China</p>
        <p className="mt-4 text-sm text-muted-foreground">
          We typically respond to emails within 48 hours on business days.
        </p>
      </div>
    </article>
  );
}
