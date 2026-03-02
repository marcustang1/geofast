import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { ResultsPreview } from "@/components/landing/results-preview";
import { Testimonials } from "@/components/landing/testimonials";
import { ScanHistory } from "@/components/landing/scan-history";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <main>
        <Hero />
        <ScanHistory />
        <Features />
        <ResultsPreview />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
