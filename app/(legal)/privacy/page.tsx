import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <article className="prose-legal">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last Updated: March 2026
      </p>

      <p className="mt-6 text-muted-foreground">
        GeoFast (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is operated from Shenzhen, China.
        This Privacy Policy explains how we collect, use, and protect your
        information when you use our AI-powered GEO (Generative Engine
        Optimization) audit service at geofast.site.
      </p>

      <Section title="1. What Data Do We Collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Account Information:</strong> When you sign in with Google
            OAuth, we receive your email address, display name, and profile
            picture from Google.
          </li>
          <li>
            <strong>Usage Information:</strong> URLs you submit for scanning,
            scan frequency, timestamps, and basic analytics data.
          </li>
          <li>
            <strong>Payment Information:</strong> Payments are processed by
            Creem. We do not directly store credit card numbers or payment
            credentials. We store your subscription status and Creem customer ID.
          </li>
          <li>
            <strong>Cookies:</strong> We use cookies for session management
            (Supabase authentication) and to track free trial scan usage for
            unauthenticated visitors.
          </li>
        </ul>
      </Section>

      <Section title="2. How Do We Use Your Data">
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide and improve our GEO scanning and audit services</li>
          <li>Manage your account, subscription, and scan credits</li>
          <li>Process payments through our payment provider (Creem)</li>
          <li>Send service-related notifications (e.g., subscription confirmations)</li>
          <li>Analyze usage patterns to improve service quality</li>
        </ul>
      </Section>

      <Section title="3. Third-Party Services">
        <p>We use the following third-party services to operate GeoFast:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Supabase</strong> — User authentication and profile data
            storage.{" "}
            <a href="https://supabase.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </li>
          <li>
            <strong>OpenRouter</strong> — AI/LLM analysis processing. Scanned
            website content is sent to AI models for analysis.
          </li>
          <li>
            <strong>Creem</strong> — Payment and subscription processing.{" "}
            <a href="https://www.creem.io/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </li>
          <li>
            <strong>Vercel</strong> — Website hosting and analytics.{" "}
            <a href="https://vercel.com/legal/privacy-policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </li>
          <li>
            <strong>Google OAuth</strong> — User login authentication via Google
            accounts.
          </li>
        </ul>
      </Section>

      <Section title="4. Data Retention">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Scan reports are stored in your browser&apos;s localStorage and are
            fully under your control.
          </li>
          <li>
            Account data (email, subscription status, scan credits) is retained
            in our database while your account is active.
          </li>
          <li>
            Upon account deletion request, your data will be removed within 30
            days.
          </li>
        </ul>
      </Section>

      <Section title="5. Your Rights (GDPR)">
        <p>
          If you are located in the European Union, you have the right to:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Data portability</li>
          <li>Object to processing of your data</li>
        </ul>
        <p className="mt-3">
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:Marcus.tang@plaud.ai" className="text-primary hover:underline">
            Marcus.tang@plaud.ai
          </a>
          .
        </p>
      </Section>

      <Section title="6. Data Security">
        <ul className="list-disc space-y-2 pl-5">
          <li>All data is transmitted over HTTPS encryption</li>
          <li>
            Database access is protected by Supabase Row Level Security (RLS)
          </li>
          <li>
            We do not store sensitive payment information — all payment data is
            handled by Creem
          </li>
          <li>API keys and secrets are stored securely as environment variables</li>
        </ul>
      </Section>

      <Section title="7. Children&apos;s Privacy">
        <p>
          GeoFast is not intended for use by individuals under the age of 16. We
          do not knowingly collect personal data from children.
        </p>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes
          will be communicated via email or a notice on our website at least 30
          days before they take effect.
        </p>
      </Section>

      <Section title="9. Contact Us">
        <p>
          If you have questions about this Privacy Policy, contact us at:
        </p>
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
