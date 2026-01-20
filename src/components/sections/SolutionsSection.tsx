import { motion } from "framer-motion";
import { 
  User, 
  Building2, 
  Landmark, 
  Users,
  Check,
  ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const solutions = [
  {
    icon: User,
    title: "Citoyens",
    subtitle: "Pour vous et votre famille",
    description: "Centralisez tous vos documents personnels : identité, diplômes, factures, santé. L'IA vous rappelle les échéances et prépare vos dossiers administratifs.",
    features: [
      "Stockage sécurisé 10 Go",
      "Scan mobile intelligent",
      "Rappels d'expiration",
      "Dossiers automatiques",
      "Partage familial",
    ],
    price: "Gratuit",
    priceNote: "puis 2 000 XAF/mois",
    cta: "Créer mon compte",
    popular: false,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Building2,
    title: "Entreprises",
    subtitle: "PME & Startups",
    description: "Digitalisez votre gestion documentaire avec workflows automatisés, collaboration équipe et intégrations API pour une productivité maximale.",
    features: [
      "Multi-utilisateurs",
      "Workflows personnalisés",
      "Tableaux de bord analytics",
      "Intégrations tierces",
      "Support prioritaire",
    ],
    price: "15 000 XAF",
    priceNote: "/utilisateur/mois",
    cta: "Demander une démo",
    popular: true,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Landmark,
    title: "Institutions",
    subtitle: "Gouvernement & Collectivités",
    description: "Déploiement souverain on-premise ou cloud privé, conformité totale aux réglementations gabonaises, formation et accompagnement inclus.",
    features: [
      "Hébergement souverain",
      "Conformité légale",
      "Migration des archives",
      "Formation sur site",
      "SLA 99.9%",
    ],
    price: "Sur mesure",
    priceNote: "Appel d'offres",
    cta: "Nous contacter",
    popular: false,
    gradient: "from-amber-500 to-orange-500",
  },
];

export const SolutionsSection = () => {
  return (
    <section id="solutions" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
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
            Solutions
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Une Solution pour{" "}
            <span className="gradient-text-accent">Chaque Échelle</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Du citoyen individuel aux grandes institutions gouvernementales, 
            DIGITALIUM s'adapte à vos besoins.
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative group ${solution.popular ? "lg:-mt-4 lg:mb-4" : ""}`}
            >
              {/* Popular Badge */}
              {solution.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-medium">
                    Le plus populaire
                  </div>
                </div>
              )}

              <div className={`h-full glass-card p-8 ${solution.popular ? "border-primary/50 shadow-lg shadow-primary/10" : ""} hover:border-primary/30 transition-all duration-300`}>
                {/* Icon & Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${solution.gradient} flex items-center justify-center flex-shrink-0`}>
                    <solution.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{solution.title}</h3>
                    <p className="text-sm text-muted-foreground">{solution.subtitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {solution.description}
                </p>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-border/50">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{solution.price}</span>
                    <span className="text-sm text-muted-foreground">{solution.priceNote}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button 
                  className={`w-full ${
                    solution.popular 
                      ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  variant={solution.popular ? "default" : "secondary"}
                >
                  {solution.cta}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">Ils nous font confiance</p>
          <div className="flex items-center justify-center gap-8 flex-wrap opacity-50">
            {["Ministère de l'Économie", "Mairie de Libreville", "Total Energies", "Banque Gabonaise"].map((name, idx) => (
              <div key={idx} className="text-lg font-bold text-muted-foreground/70">
                {name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
