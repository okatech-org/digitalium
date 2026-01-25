import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { IAstedButtonFull, IAstedChatModal } from "@/components/iasted";
import { useAuth } from "@/contexts/FirebaseAuthContext";
import { useIAsted } from "@/hooks/useIAsted";

const Index = () => {
  const { user } = useAuth();
  const iasted = useIAsted({ autoAwaken: true });

  return (
    <div className="min-h-screen overflow-y-auto lg:h-screen lg:overflow-hidden">
      <Header />
      <main className="h-full">
        <HeroSection />
      </main>
      
      {/* iAsted Agent Button - Same as Pro Space */}
      <IAstedButtonFull
        onClick={() => iasted.toggleChat()}
        onDoubleClick={() => iasted.toggleChat()}
        voiceListening={iasted.isListening}
        voiceSpeaking={iasted.isSpeaking}
        voiceProcessing={iasted.isProcessing}
        isInterfaceOpen={iasted.isChatOpen}
        size="md"
        pulsing
      />
      
      {/* iAsted Chat Modal */}
      <IAstedChatModal
        isOpen={iasted.isChatOpen}
        onClose={() => iasted.closeChat()}
        userName={user?.displayName || undefined}
        userRole={iasted.persona.role}
      />
    </div>
  );
};

export default Index;
