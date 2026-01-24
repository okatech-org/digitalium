import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/FirebaseAuthContext";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/auth/AuthModal";
import { useTheme } from "@/contexts/ThemeContext";

export const HeroSection = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const isLightMode = theme === 'light';
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  const openLoginModal = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthModalTab('signup');
    setAuthModalOpen(true);
  };

  return (
    <>
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 glass-section">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/hero-background.mov" type="video/quicktime" />
            <source src="/videos/hero-background.mov" type="video/mp4" />
          </video>
          {/* Overlay for better text readability - only in dark mode */}
          {!isLightMode && <div className="absolute inset-0 bg-background/30" />}
        </div>
        
        {/* Background Effects */}
        <div className="absolute inset-0 cortex-grid opacity-30 z-[1]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl z-[1]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl z-[1]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-hero-pattern z-[1]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            >
              <span className="text-foreground">{t("hero.title1")} </span>
              <span className="gradient-text">{t("hero.title2")}</span>
              <br />
              <span className="gradient-text-accent">{t("hero.title3")}</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              {t("hero.description")}
            </motion.p>

            {/* Floating Auth Buttons - Show only when not logged in */}
            {!user ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                {/* Login Button */}
                <motion.button
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openLoginModal}
                  className="group flex items-center gap-2 px-6 py-3 glass-card border border-primary/20 rounded-xl hover:border-primary/40 transition-all duration-300"
                  style={{ boxShadow: '0 4px 16px hsla(217, 91%, 60%, 0.15)' }}
                >
                  <LogIn className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">{t("nav.login")}</span>
                </motion.button>

                {/* Signup Button */}
                <motion.button
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openSignupModal}
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
                  style={{ 
                    background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(250 60% 50%) 100%)',
                    boxShadow: '0 4px 16px hsla(217, 91%, 60%, 0.35)' 
                  }}
                >
                  <UserPlus className="w-5 h-5 text-white" />
                  <span className="font-medium text-white">{t("nav.start")}</span>
                </motion.button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg px-8 py-6 glow-border"
                  onClick={() => navigate('/dashboard')}
                >
                  {t("nav.dashboard")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Shared Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        defaultTab={authModalTab}
      />
    </>
  );
};
