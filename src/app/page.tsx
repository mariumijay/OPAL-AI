import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { LiveStats } from "@/components/landing/LiveStats";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PublicStats } from "@/components/landing/PublicStats";
import { DonorTypes } from "@/components/landing/DonorTypes";
import { CTASection } from "@/components/landing/CTASection";
import { RegistrationToast } from "@/components/shared/RegistrationToast";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <RegistrationToast />
      </Suspense>
      <Navbar />
      <main className="bg-background">
        <Hero />
        <LiveStats />
        <DonorTypes />
        <Features />
        <HowItWorks />
        <PublicStats />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
