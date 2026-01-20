import { motion } from "framer-motion";
import { 
  ScanLine, 
  FolderArchive, 
  Brain, 
  Shield, 
  Workflow, 
  Globe,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: ScanLine,
    title: "Numérisation Intelligente",
    description: "Scanner multimode avec détection automatique du type de document, correction de perspective et OCR avancé propulsé par l'IA.",
    features: ["Capture automatique", "OCR multilingue", "Amélioration d'image"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: FolderArchive,
    title: "Archivage Structuré",
    description: "Organisation automatique de vos documents avec catégorisation intelligente et système de dossiers visuels innovant.",
    features: ["Auto-catégorisation", "Dossiers 3D visuels", "Métadonnées enrichies"],
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Brain,
    title: "Assistant IA Conversationnel",
    description: "Un archiviste personnel disponible 24/7 qui comprend vos besoins et gère vos documents en langage naturel.",
    features: ["Recherche sémantique", "Suggestions proactives", "Création de dossiers"],
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Sécurité Souveraine",
    description: "Chiffrement de bout en bout, hébergement souverain au Gabon et conformité totale aux réglementations locales.",
    features: ["Chiffrement AES-256", "Données au Gabon", "Audit complet"],
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: Workflow,
    title: "Workflows Automatisés",
    description: "Créez des flux de validation, d'approbation et de traitement automatisés pour optimiser vos processus.",
    features: ["Circuits validation", "Notifications auto", "Intégrations API"],
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Globe,
    title: "Accès Universel",
    description: "Accédez à vos documents partout, même hors ligne. Application web et mobile avec synchronisation temps réel.",
    features: ["Mode hors-ligne", "Multi-appareils", "Sync instantanée"],
    gradient: "from-indigo-500 to-blue-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const ServicesSection = () => {
  return (
    <section id="services" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 cortex-grid opacity-20" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass-card text-sm font-medium text-primary mb-4">
            Nos Services
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Une Suite Complète pour{" "}
            <span className="gradient-text">Chaque Besoin</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            De la numérisation à l'archivage intelligent, découvrez comment DIGITALIUM 
            transforme votre gestion documentaire.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              <div className="h-full glass-card p-8 hover:border-primary/30 transition-all duration-300">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Link */}
                <button className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  En savoir plus
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            Découvrir tous nos services
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
