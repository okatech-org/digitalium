import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  MessageSquareText, 
  Scan, 
  FolderOpen, 
  Bell, 
  Share2, 
  Lock,
  Zap,
  Globe,
  Smartphone,
  Cloud,
  Search,
  FileStack
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const mainFeatures = [
  {
    icon: MessageSquareText,
    title: "Assistant IA Conversationnel",
    description: "Parlez naturellement à votre archiviste IA. Demandez-lui de trouver, organiser ou préparer des dossiers complets.",
    demo: {
      user: "Prépare un dossier pour ma demande de visa France",
      ai: "Je compile : passeport valide, 3 dernières fiches de paie, attestation de domicile, relevés bancaires. Voulez-vous que je vérifie les dates d'expiration ?"
    }
  },
  {
    icon: Scan,
    title: "Scan Intelligent",
    description: "Numérisez avec votre smartphone. L'IA détecte automatiquement les bords, corrige la perspective et extrait le texte.",
    demo: {
      user: "Je scanne ma CNI",
      ai: "Document détecté : CNI gabonaise. Nom extrait, date de naissance, date d'expiration dans 2 ans. Classé dans Identité."
    }
  },
  {
    icon: FolderOpen,
    title: "Organisation Automatique",
    description: "Plus besoin de créer des dossiers. L'IA classe automatiquement vos documents par catégorie et par date.",
    demo: {
      user: "J'ajoute une facture Orange",
      ai: "Facture classée dans Télécommunications > 2024 > Janvier. Montant 35,000 XAF détecté et indexé."
    }
  },
  {
    icon: Bell,
    title: "Alertes Intelligentes",
    description: "Ne ratez plus jamais une échéance. L'IA vous prévient avant l'expiration de vos documents importants.",
    demo: {
      user: "Quels documents expirent bientôt ?",
      ai: "⚠️ Passeport dans 3 mois, CNI dans 8 mois, Assurance auto dans 45 jours. Voulez-vous commencer les renouvellements ?"
    }
  },
  {
    icon: Share2,
    title: "Partage Sécurisé",
    description: "Partagez des documents avec votre famille ou vos collaborateurs, avec contrôle total des permissions.",
    demo: {
      user: "Partage mon attestation avec l'ambassade",
      ai: "Lien sécurisé créé, valide 7 jours, lecture seule. L'ambassade a consulté le document le 15/01 à 14h32."
    }
  },
  {
    icon: Lock,
    title: "Chiffrement de Bout en Bout",
    description: "Vos documents les plus sensibles peuvent être chiffrés. Même nous ne pouvons pas les lire.",
    demo: {
      user: "Sécurise mon dossier médical",
      ai: "Dossier Santé chiffré avec votre clé personnelle. Seul vous pouvez y accéder, même hors ligne."
    }
  },
];

const additionalFeatures = [
  {
    icon: Zap,
    title: "Performance Ultra-Rapide",
    description: "Recherche instantanée dans des milliers de documents"
  },
  {
    icon: Globe,
    title: "Accessibilité Globale",
    description: "Accédez à vos documents de n'importe où dans le monde"
  },
  {
    icon: Smartphone,
    title: "Application Mobile",
    description: "iOS et Android avec mode hors ligne complet"
  },
  {
    icon: Cloud,
    title: "Synchronisation Cloud",
    description: "Vos documents synchronisés sur tous vos appareils"
  },
  {
    icon: Search,
    title: "Recherche Sémantique",
    description: "Trouvez par contenu, pas seulement par nom de fichier"
  },
  {
    icon: FileStack,
    title: "Versions Multiples",
    description: "Historique complet des modifications de vos documents"
  },
];

const Features = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 cortex-grid opacity-30" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <span className="inline-block px-4 py-1.5 rounded-full glass-card text-sm font-medium text-accent mb-6">
                Fonctionnalités
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                L'IA qui{" "}
                <span className="gradient-text">Travaille</span>
                <br />pour Vous
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Découvrez comment notre intelligence artificielle transforme 
                la gestion documentaire en une expérience fluide et intuitive.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="space-y-24">
              {mainFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? "" : ""
                  }`}
                >
                  {/* Content */}
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{feature.title}</h2>
                    <p className="text-lg text-muted-foreground">{feature.description}</p>
                  </div>

                  {/* Demo */}
                  <div className={`glass-card p-8 rounded-3xl ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-secondary">Vous</span>
                        </div>
                        <div className="glass-card p-4 rounded-2xl rounded-tl-none flex-1">
                          <p className="text-sm">{feature.demo.user}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">IA</span>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-2xl rounded-tl-none flex-1 border border-primary/20">
                          <p className="text-sm">{feature.demo.ai}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-24 bg-muted/10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Et Bien <span className="gradient-text">Plus Encore</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Des fonctionnalités pensées pour votre productivité au quotidien.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {additionalFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-12 rounded-3xl text-center max-w-4xl mx-auto relative overflow-hidden"
            >
              <div className="absolute inset-0 cortex-grid opacity-20" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Prêt à Essayer ?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Commencez gratuitement et découvrez la puissance de l'IA 
                  pour votre gestion documentaire.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                      Créer un Compte Gratuit
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline">
                      Demander une Démo
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
