import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { SolutionsSection } from "@/components/sections/SolutionsSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { ContactSection } from "@/components/sections/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <SolutionsSection />
        <FeaturesSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
