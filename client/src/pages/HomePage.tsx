import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ServicesSection from "@/components/ServicesSection";
import ComparisonSection from "@/components/ComparisonSection";
import PricingSection from "@/components/PricingSection";

const HomePage = () => {
  return (
    <div className="relative">
      <HeroSection />
      <FeaturesSection />
      <ServicesSection />
      <ComparisonSection />
      <PricingSection />
    </div>
  );
};

export default HomePage;
