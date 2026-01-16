import HeroSection from "@/components/sections/HeroSection";
import ProductShowcase from "@/components/sections/ProductShowcase";
import ComparisonSection from "@/components/sections/ComparisonSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProductShowcase />
      <ComparisonSection />
    </div>
  );
}
