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
