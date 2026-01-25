import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { IAstedButtonFull, IAstedChatModal } from "@/components/iasted";
import { useAuth } from "@/contexts/FirebaseAuthContext";

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen overflow-y-auto lg:h-screen lg:overflow-hidden">
      <Header />
      <main className="h-full">
        <HeroSection />
      </main>
      
      {/* iAsted Agent Button */}
      <IAstedButtonFull
        onClick={() => setIsChatOpen(true)}
        size="md"
        pulsing
      />
      
      {/* iAsted Chat Modal */}
      <IAstedChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userName={user?.displayName || undefined}
      />
    </div>
  );
};

export default Index;
