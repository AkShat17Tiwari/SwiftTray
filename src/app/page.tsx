import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturedOutlets } from "@/components/landing/featured-outlets";
import { TopMealsCarousel } from "@/components/landing/top-meals-carousel";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturedOutlets />
        <TopMealsCarousel />
        <HowItWorks />
        <Testimonials />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
