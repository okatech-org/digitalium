import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { AIChatbot } from "@/components/chat/AIChatbot";

const Index = () => {
  return (
    <div className="h-screen overflow-hidden">
      <Header />
      <main className="h-full">
        <HeroSection />
      </main>
      <AIChatbot />
    </div>
  );
};

export default Index;