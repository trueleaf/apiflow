import HeroSection from "@/components/sections/HeroSection";
import ComparisonSection from "@/components/sections/ComparisonSection";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ComparisonSection />
      <AboutSection />
      <ContactSection />
    </div>
  );
}
