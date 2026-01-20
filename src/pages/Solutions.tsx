import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  User, 
  Building2, 
  Landmark,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const solutions = [
  {
    icon: User,
    title: "Pour les Citoyens",
    subtitle: "DIGITALIUM Personnel",
    description: "Votre assistant personnel pour organiser tous vos documents administratifs, de la naissance à aujourd'hui.",
    gradient: "from-primary to-secondary",
    features: [
      "CNI, passeport, permis de conduire",
      "Diplômes et certificats",
      "Factures et contrats",
      "Documents médicaux",
      "Rappels d'expiration automatiques",
      "Partage familial sécurisé"
    ],
    price: "Gratuit",
    priceNote: "jusqu'à 100 documents",
    cta: "Commencer Gratuitement",
    popular: false,
  },
  {
    icon: Building2,
    title: "Pour les Entreprises",
    subtitle: "DIGITALIUM Business",
    description: "Digitalisez votre gestion documentaire et automatisez vos processus pour gagner en productivité.",
    gradient: "from-secondary to-accent",
    features: [
      "Multi-utilisateurs avec permissions",
      "Workflows automatisés",
      "Intégration comptabilité/ERP",
      "Signature électronique",
      "Analytics et rapports",
      "API & Webhooks"
    ],
    price: "15 000 XAF",
    priceNote: "/mois - jusqu'à 10 utilisateurs",
    cta: "Essai Gratuit 30 jours",
    popular: true,
  },
  {
    icon: Landmark,
    title: "Pour les Institutions",
    subtitle: "DIGITALIUM Souverain",
    description: "Solution souveraine pour les administrations publiques avec hébergement local et conformité garantie.",
    gradient: "from-accent to-orange-500",
    features: [
      "Hébergement souverain au Gabon",
      "Conformité RGPD et loi gabonaise",
      "Déploiement on-premise possible",
      "Support 24/7 dédié",
      "Formation et accompagnement",
      "Audit et traçabilité complète"
    ],
    price: "Sur devis",
    priceNote: "selon vos besoins",
    cta: "Demander un Devis",
    popular: false,
  },
];

const benefits = [
  {
    icon: Sparkles,
    title: "IA Intelligente",
    description: "Classification et recherche automatiques de vos documents"
  },
  {
    icon: Shield,
    title: "Sécurité Maximale",
    description: "Chiffrement de niveau bancaire pour vos données"
  },
  {
    icon: Clock,
    title: "Gain de Temps",
    description: "Retrouvez n'importe quel document en quelques secondes"
  },
  {
    icon: TrendingUp,
    title: "Évolutif",
    description: "Une solution qui grandit avec vos besoins"
  },
];

const Solutions = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 cortex-grid opacity-30" />
          <div className="absolute top-1/3 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <span className="inline-block px-4 py-1.5 rounded-full glass-card text-sm font-medium text-secondary mb-6">
                Nos Solutions
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Une Solution{" "}
                <span className="gradient-text">Adaptée</span>
                <br />à Chaque Besoin
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Du particulier à l'administration publique, DIGITALIUM s'adapte 
                à votre échelle avec des offres sur mesure.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Solutions Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card p-8 rounded-3xl relative ${
                    solution.popular ? 'border-primary/50 ring-2 ring-primary/20' : ''
                  }`}
                >
                  {solution.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium">
                        Plus populaire
                      </span>
                    </div>
                  )}
                  
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${solution.gradient} flex items-center justify-center mb-6`}>
                    <solution.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <span className="text-sm text-muted-foreground">{solution.subtitle}</span>
                  <h2 className="text-2xl font-bold mb-3">{solution.title}</h2>
                  <p className="text-muted-foreground mb-6">{solution.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold gradient-text">{solution.price}</span>
                    <span className="text-sm text-muted-foreground block">{solution.priceNote}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/contact">
                    <Button 
                      className={`w-full ${solution.popular ? 'bg-gradient-to-r from-primary to-secondary' : ''}`}
                      variant={solution.popular ? 'default' : 'outline'}
                    >
                      {solution.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 bg-muted/10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pourquoi Choisir <span className="gradient-text">DIGITALIUM</span> ?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Des avantages concrets pour tous nos utilisateurs.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
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
                  Besoin d'une Solution Personnalisée ?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Notre équipe est à votre disposition pour créer une offre 
                  adaptée à vos besoins spécifiques.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                      Nous Contacter
                      <ArrowRight className="w-5 h-5 ml-2" />
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

export default Solutions;
