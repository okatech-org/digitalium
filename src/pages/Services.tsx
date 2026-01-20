import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  Scan, 
  Brain, 
  Shield, 
  Users, 
  Wifi,
  Workflow,
  FileText,
  Search,
  Clock,
  CheckCircle,
  ArrowRight,
  Building2,
  User,
  Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Scan,
    title: "Scan Intelligent",
    description: "Numérisez vos documents en un instant avec notre technologie de capture avancée.",
    features: [
      "Détection automatique des contours",
      "Correction de perspective en temps réel",
      "OCR multilingue (Français, Anglais)",
      "Capture automatique quand conditions optimales",
      "Mode batch pour documents multiples",
      "Amélioration d'image automatique"
    ],
    useCases: [
      {
        persona: "Citoyen",
        example: "Scannez votre CNI avec votre smartphone et l'IA extrait automatiquement vos informations personnelles et la date d'expiration."
      },
      {
        persona: "Entreprise",
        example: "Numérisez 500 factures fournisseurs en une journée avec extraction automatique des montants et dates d'échéance."
      }
    ],
    color: "primary"
  },
  {
    icon: Brain,
    title: "Assistant IA",
    description: "Un archiviste intelligent disponible 24/7 pour organiser et retrouver vos documents.",
    features: [
      "Classification automatique par catégorie",
      "Extraction de métadonnées intelligente",
      "Recherche sémantique en langage naturel",
      "Suggestions proactives d'organisation",
      "Alertes d'expiration automatiques",
      "Génération de résumés de documents"
    ],
    useCases: [
      {
        persona: "Citoyen",
        example: "\"Montre-moi tous mes diplômes\" - l'IA affiche instantanément votre parcours éducatif en timeline visuelle."
      },
      {
        persona: "Entreprise",
        example: "\"Prépare le dossier pour l'audit comptable 2024\" - l'IA compile automatiquement tous les documents pertinents."
      }
    ],
    color: "secondary"
  },
  {
    icon: Shield,
    title: "Sécurité Souveraine",
    description: "Vos données sont protégées avec des standards de sécurité de niveau bancaire.",
    features: [
      "Chiffrement AES-256 au repos",
      "TLS 1.3 pour les données en transit",
      "Option chiffrement de bout en bout",
      "Hébergement souverain au Gabon",
      "Journal d'audit immutable",
      "Conformité RGPD et loi gabonaise"
    ],
    useCases: [
      {
        persona: "Institution",
        example: "La Mairie d'Owendo stocke 2 millions de documents d'état civil avec traçabilité complète de chaque accès."
      },
      {
        persona: "Entreprise",
        example: "Vos contrats confidentiels sont protégés même en cas de perte de l'appareil grâce au chiffrement distant."
      }
    ],
    color: "accent"
  },
  {
    icon: Users,
    title: "Multi-Persona",
    description: "Une interface qui s'adapte à votre profil : citoyen, PME ou institution.",
    features: [
      "Vue simplifiée pour particuliers",
      "Dashboard analytique pour entreprises",
      "Mode institutionnel avec workflows",
      "Personnalisation de l'interface",
      "Espaces de travail multiples",
      "Partage familial sécurisé"
    ],
    useCases: [
      {
        persona: "Famille",
        example: "Parents et enfants partagent un espace commun (maison, santé) tout en gardant des espaces privés."
      },
      {
        persona: "PME",
        example: "25 employés accèdent aux documents avec des permissions différentes selon leur rôle (RH, Commercial, Direction)."
      }
    ],
    color: "primary"
  },
  {
    icon: Wifi,
    title: "Mode Offline",
    description: "Travaillez sans connexion internet, synchronisation automatique au retour en ligne.",
    features: [
      "Stockage local intelligent",
      "Synchronisation en arrière-plan",
      "File d'attente d'actions hors ligne",
      "Détection automatique de connexion",
      "Compression optimisée",
      "Fonctionnalités complètes offline"
    ],
    useCases: [
      {
        persona: "Citoyen",
        example: "Consultez vos documents importants lors d'un voyage en zone sans réseau, tout reste accessible."
      },
      {
        persona: "Institution",
        example: "Les agents de terrain en zone rurale peuvent travailler toute la journée et synchroniser le soir."
      }
    ],
    color: "secondary"
  },
  {
    icon: Workflow,
    title: "Workflows Automatisés",
    description: "Automatisez vos processus documentaires pour gagner en productivité.",
    features: [
      "Circuits de validation personnalisables",
      "Routage intelligent selon le contenu",
      "Notifications multi-canaux",
      "Intégration comptabilité/ERP",
      "Signature électronique",
      "Rapports automatiques"
    ],
    useCases: [
      {
        persona: "Entreprise",
        example: "Facture reçue → IA extrait montant → Routage auto selon seuil → Validation manager → Export comptable."
      },
      {
        persona: "Institution",
        example: "Demande citoyen → Vérification éligibilité IA → Génération document → Signature maire → Notification SMS."
      }
    ],
    color: "accent"
  }
];

const personas = [
  {
    icon: User,
    title: "Citoyens",
    description: "Organisez votre vie administrative simplement",
    price: "À partir de 0 XAF/mois",
    features: ["CNI, passeport, diplômes", "Rappels d'expiration", "Dossiers compilés", "100 docs gratuits"]
  },
  {
    icon: Building2,
    title: "Entreprises",
    description: "Digitalisez votre gestion documentaire",
    price: "À partir de 15 000 XAF/mois",
    features: ["Multi-utilisateurs", "Workflows", "API & Intégrations", "Analytics avancés"]
  },
  {
    icon: Landmark,
    title: "Institutions",
    description: "Souveraineté et conformité garanties",
    price: "Sur devis",
    features: ["Déploiement on-premise", "Hébergement Gabon", "Support 24/7", "Formation incluse"]
  }
];

const Services = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 cortex-grid opacity-30" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <span className="inline-block px-4 py-1.5 rounded-full glass-card text-sm font-medium text-primary mb-6">
                Nos Services
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Des Solutions{" "}
                <span className="gradient-text">Complètes</span>
                <br />pour Votre Archivage
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Découvrez en détail comment DIGITALIUM transforme la gestion documentaire 
                du citoyen à l'institution, avec l'IA comme assistant personnel.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services Detail */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="space-y-24">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className={`w-14 h-14 rounded-2xl bg-${service.color}/20 flex items-center justify-center mb-6`}>
                      <service.icon className={`w-7 h-7 text-${service.color}`} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{service.title}</h2>
                    <p className="text-lg text-muted-foreground mb-8">{service.description}</p>
                    
                    {/* Features */}
                    <div className="grid sm:grid-cols-2 gap-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div className={`space-y-4 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                    <h3 className="text-lg font-semibold text-muted-foreground mb-4">Cas d'usage concrets</h3>
                    {service.useCases.map((useCase, idx) => (
                      <div key={idx} className="glass-card p-6 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                            {useCase.persona}
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{useCase.example}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Personas Section */}
        <section className="py-24 bg-muted/10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Une Offre pour <span className="gradient-text">Chaque Besoin</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Du particulier à l'administration publique, DIGITALIUM s'adapte à votre échelle.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {personas.map((persona, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-8 rounded-3xl hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <persona.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{persona.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{persona.description}</p>
                  <p className="text-2xl font-bold gradient-text mb-6">{persona.price}</p>
                  <ul className="space-y-3 mb-8">
                    {persona.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/#contact">
                    <Button className="w-full" variant="outline">
                      En savoir plus
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
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
                  Prêt à Transformer Votre Gestion Documentaire ?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Rejoignez les milliers de Gabonais qui font confiance à DIGITALIUM 
                  pour sécuriser et organiser leurs documents importants.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/#contact">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                      Demander une Démo
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button size="lg" variant="outline">
                      Retour à l'Accueil
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

export default Services;
