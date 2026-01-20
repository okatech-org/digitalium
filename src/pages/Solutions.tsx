import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { 
  User, 
  Building2, 
  Landmark,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const solutions = [
  {
    icon: User,
    title: "Citoyens",
    subtitle: "DIGITALIUM Personnel",
    description: "Organisez tous vos documents administratifs simplement.",
    gradient: "from-primary to-secondary",
    features: ["CNI, passeport, diplômes", "Rappels d'expiration", "100 docs gratuits"],
    price: "Gratuit",
    popular: false,
  },
  {
    icon: Building2,
    title: "Entreprises",
    subtitle: "DIGITALIUM Business",
    description: "Digitalisez votre gestion documentaire.",
    gradient: "from-secondary to-accent",
    features: ["Multi-utilisateurs", "Workflows automatisés", "API & Intégrations"],
    price: "15 000 XAF/mois",
    popular: true,
  },
  {
    icon: Landmark,
    title: "Institutions",
    subtitle: "DIGITALIUM Souverain",
    description: "Solution souveraine pour les administrations.",
    gradient: "from-accent to-orange-500",
    features: ["Hébergement Gabon", "Support 24/7", "Formation incluse"],
    price: "Sur devis",
    popular: false,
  },
];

const Solutions = () => {
  return (
    <div className="h-screen overflow-hidden">
      <Header />
      <main className="h-full flex items-center">
        <section className="relative w-full py-12">
          <div className="absolute inset-0 cortex-grid opacity-30" />
          <div className="absolute top-1/3 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Une Solution{" "}
                <span className="gradient-text">Adaptée</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Du particulier à l'administration publique, DIGITALIUM s'adapte à votre échelle.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card p-6 rounded-3xl relative ${
                    solution.popular ? 'border-primary/50 ring-2 ring-primary/20' : ''
                  }`}
                >
                  {solution.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-medium">
                        Plus populaire
                      </span>
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${solution.gradient} flex items-center justify-center mb-4`}>
                    <solution.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <span className="text-xs text-muted-foreground">{solution.subtitle}</span>
                  <h2 className="text-xl font-bold mb-2">{solution.title}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{solution.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-2xl font-bold gradient-text">{solution.price}</span>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/contact">
                    <Button 
                      className={`w-full ${solution.popular ? 'bg-gradient-to-r from-primary to-secondary' : ''}`}
                      variant={solution.popular ? 'default' : 'outline'}
                      size="sm"
                    >
                      Choisir
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Solutions;