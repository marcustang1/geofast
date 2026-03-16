import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default function RefundPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Refund Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last Updated: March 2026
      </p>

      <Section title="1. Digital Subscription Refund">
        <p>
          GeoFast Pro is a digital subscription service. Refund eligibility is
          determined as follows:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Within 7 days of purchase</strong> and fewer than 5 scans
            used: eligible for a <strong>full refund</strong>.
          </li>
          <li>
            <strong>After 7 days</strong> or more than 5 scans used: refunds are
            not available.
          </li>
          <li>
            Partial billing periods are not eligible for prorated refunds.
          </li>
        </ul>
      </Section>

      <Section title="2. How to Request a Refund">
        <p>
          To request a refund, please send an email to{" "}
          <a href="mailto:Marcus.tang@plaud.ai" className="text-primary hover:underline">
            Marcus.tang@plaud.ai
          </a>{" "}
          with the following information:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Your registered email address (Google account)</li>
          <li>Approximate date of subscription purchase</li>
          <li>Reason for the refund request</li>
        </ul>
      </Section>

      <Section title="3. Refund Processing">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Refund requests are reviewed within 2 business days.
          </li>
          <li>
            Approved refunds are processed within 5–10 business days and
            returned to the original payment method.
          </li>
          <li>
            Refunds are processed through our payment provider, Creem.
          </li>
        </ul>
      </Section>

      <Section title="4. Subscription Cancellation">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            You can cancel your subscription at any time through the
            &quot;Manage Subscription&quot; option in your account menu.
          </li>
          <li>
            After cancellation, your Pro access remains active until the end of
            the current billing period.
          </li>
          <li>
            Cancellation does not automatically trigger a refund. If you need a
            refund, please submit a separate request.
          </li>
        </ul>
      </Section>

      <Section title="5. Exceptions">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Service technical failure:</strong> If our service is
            unavailable for an extended period due to technical issues on our
            end, a full refund will be provided.
          </li>
          <li>
            <strong>User error or network issues:</strong> Refunds are not
            provided for issues caused by user actions or third-party network
            problems.
          </li>
        </ul>
      </Section>

      <Section title="6. Contact Us">
        <p>For any billing or refund inquiries, contact us at:</p>
        <p className="mt-2">
          <strong>Email:</strong>{" "}
          <a href="mailto:Marcus.tang@plaud.ai" className="text-primary hover:underline">
            Marcus.tang@plaud.ai
          </a>
        </p>
        <p>
          <strong>Location:</strong> Shenzhen, China
        </p>
      </Section>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
