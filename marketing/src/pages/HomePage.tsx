import { Hero } from "../components/Hero";
import { ScrollFeatureShowcase } from "../components/ScrollFeatureShowcase";
import { InteractiveSplitBillDemo } from "../components/InteractiveSplitBillDemo";
import { InteractiveBudgetDemo } from "../components/InteractiveBudgetDemo";
import { Features } from "../components/Features";
import { Faq } from "../components/Faq";
import { GetApp } from "../components/GetApp";

export function HomePage() {
  return (
    <main>
      <Hero />
      <ScrollFeatureShowcase />
      <InteractiveSplitBillDemo />
      <InteractiveBudgetDemo />
      <Features />
      <Faq />
      <GetApp />
    </main>
  );
}
