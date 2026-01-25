import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, LogIn, UserPlus, Volume2, VolumeX, Users, FileText, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/FirebaseAuthContext";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/auth/AuthModal";
import { useTheme } from "@/contexts/ThemeContext";

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000, startDelay: number = 0) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let startTime: number;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * end));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }, startDelay);
    
    return () => clearTimeout(timeout);
  }, [end, duration, startDelay]);
  
  return count;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  suffix?: string;
  label: string;
  delay: number;
}

function StatItem({ icon, value, suffix = "", label, delay }: StatItemProps) {
  const count = useAnimatedCounter(value, 2000, delay);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 + 0.3 }}
      className="flex items-center gap-3 glass-card px-4 py-3 rounded-xl"
    >
      <div className="p-2 rounded-lg bg-accent/10 text-accent">
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-foreground">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  );
}

export const HeroSection = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const isLightMode = theme === 'light';
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  // Parallax scroll setup
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms - different speeds for depth effect
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
      <section ref={sectionRef} id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-16 glass-section">
        {/* Background Effects with Parallax */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 cortex-grid opacity-20 z-[1]" />
        <motion.div 
          style={{ y: orb1Y }} 
          className="absolute top-1/3 left-0 w-64 h-64 bg-primary/15 rounded-full blur-3xl z-[1]" 
        />
        <motion.div 
          style={{ y: orb2Y }} 
          className="absolute bottom-1/3 right-0 w-64 h-64 bg-accent/15 rounded-full blur-3xl z-[1]" 
        />

        <motion.div style={{ y: contentY, opacity }} className="container mx-auto px-4 relative z-10">
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

            {/* Right Column - Video & Stats with Parallax */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ y: videoY }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative space-y-4"
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

              {/* Animated Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatItem 
                  icon={<Users className="w-4 h-4" />}
                  value={12500}
                  suffix="+"
                  label={t("hero.stats.users")}
                  delay={0}
                />
                <StatItem 
                  icon={<FileText className="w-4 h-4" />}
                  value={850000}
                  suffix="+"
                  label={t("hero.stats.documents")}
                  delay={200}
                />
                <StatItem 
                  icon={<Shield className="w-4 h-4" />}
                  value={99}
                  suffix=".9%"
                  label={t("hero.stats.uptime")}
                  delay={400}
                />
                <StatItem 
                  icon={<Clock className="w-4 h-4" />}
                  value={24}
                  suffix="/7"
                  label={t("hero.stats.support")}
                  delay={600}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
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
