import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, LogIn, UserPlus, Volume2, VolumeX } from "lucide-react";
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

  const [isMuted, setIsMuted] = useState(true);

  const toggleSound = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-16 glass-section">
        {/* Background Effects */}
        <div className="absolute inset-0 cortex-grid opacity-20 z-[1]" />
        <div className="absolute top-1/3 left-0 w-64 h-64 bg-primary/15 rounded-full blur-3xl z-[1]" />
        <div className="absolute bottom-1/3 right-0 w-64 h-64 bg-accent/15 rounded-full blur-3xl z-[1]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Content */}
            <div className="text-left space-y-6">
              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
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
                className="text-base sm:text-lg text-muted-foreground max-w-lg"
              >
                {t("hero.description")}
              </motion.p>

              {/* Auth Buttons */}
              {!user ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-start gap-4"
                >
                  {/* Login Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openLoginModal}
                    className="group flex items-center gap-2 px-5 py-2.5 glass-card border border-primary/20 rounded-xl hover:border-primary/40 transition-all duration-300"
                    style={{ boxShadow: '0 4px 16px hsla(217, 91%, 60%, 0.15)' }}
                  >
                    <LogIn className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground text-sm">{t("nav.login")}</span>
                  </motion.button>

                  {/* Signup Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openSignupModal}
                    className="group flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300"
                    style={{ 
                      background: 'linear-gradient(135deg, hsl(38 92% 50%) 0%, hsl(28 95% 55%) 100%)',
                      boxShadow: '0 4px 16px hsla(38, 92%, 50%, 0.35)' 
                    }}
                  >
                    <UserPlus className="w-4 h-4 text-white" />
                    <span className="font-medium text-white text-sm">{t("nav.start")}</span>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-accent to-orange-500 hover:opacity-90 transition-opacity text-base px-6 py-5 glow-border"
                    onClick={() => navigate('/dashboard')}
                  >
                    {t("nav.dashboard")}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Right Column - Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden glass-card p-1">
                <video
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full aspect-video object-cover rounded-xl"
                >
                  <source src="/videos/hero-background.mov" type="video/quicktime" />
                  <source src="/videos/hero-background.mov" type="video/mp4" />
                </video>
                
                {/* Sound Toggle Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSound}
                  className="absolute bottom-3 right-3 p-2 rounded-full glass-card border border-white/20 hover:border-accent/40 transition-all duration-300"
                  aria-label={isMuted ? "Activer le son" : "Couper le son"}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-accent" />
                  )}
                </motion.button>

                {/* Video Overlay Gradient */}
                {!isLightMode && (
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none rounded-xl" />
                )}
              </div>
            </motion.div>
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
