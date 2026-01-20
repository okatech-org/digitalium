import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Zap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const floatingIcons = [
  { Icon: FileText, delay: 0, x: -120, y: -80 },
  { Icon: Shield, delay: 0.5, x: 150, y: -60 },
  { Icon: Zap, delay: 1, x: -100, y: 100 },
  { Icon: Sparkles, delay: 1.5, x: 130, y: 80 },
];

export const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
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
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      </div>
      
      {/* Background Effects */}
      <div className="absolute inset-0 cortex-grid opacity-30 z-[1]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl z-[1]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl z-[1]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-hero-pattern z-[1]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">
              Propulsé par l'Intelligence Artificielle
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-foreground">Votre </span>
            <span className="gradient-text">Archiviste</span>
            <br />
            <span className="text-foreground">Intelligent</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            De votre poche à la Nation — La première plateforme d'archivage intelligent 
            multi-échelle. Numérisez, organisez et sécurisez vos documents avec l'IA.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg px-8 py-6 glow-border"
            >
              Essayer Gratuitement
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-border/50 hover:bg-muted/50 text-lg px-8 py-6"
            >
              Voir la Démo
            </Button>
          </motion.div>

          {/* Hero Visual - AI Brain with floating documents */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative w-72 h-72 mx-auto"
          >
            {/* Central Brain/Core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-sm border border-primary/30 flex items-center justify-center pulse-glow">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-16 h-16 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 2a9 9 0 0 1 9 9c0 3.1-1.6 5.8-4 7.4V21a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-2.6A9 9 0 0 1 12 2z" />
                      <path d="M9 21v-1M15 21v-1M9 10h.01M15 10h.01M12 14h.01" />
                      <path d="M7 11a5 5 0 0 1 10 0" />
                    </svg>
                  </div>
                </div>
                
                {/* Orbiting rings */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: "20s" }}>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent" />
                </div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }}>
                  <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                </div>
              </div>
            </div>

            {/* Floating Icons */}
            {floatingIcons.map(({ Icon, delay, x, y }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + delay }}
                className="absolute top-1/2 left-1/2"
                style={{ x, y }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, delay: delay, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-xl glass-card flex items-center justify-center"
                >
                  <Icon className="w-6 h-6 text-primary" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto"
          >
            {[
              { value: "99.9%", label: "Précision IA" },
              { value: "< 2s", label: "Traitement" },
              { value: "256-bit", label: "Chiffrement" },
              { value: "24/7", label: "Disponibilité" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};
