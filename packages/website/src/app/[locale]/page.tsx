import HeroSection from "@/components/sections/HeroSection";
import AboutUsSection from "@/components/sections/AboutUsSection";
import ComparisonSection from "@/components/sections/ComparisonSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutUsSection />
      <ComparisonSection />
    </div>
  );
}
