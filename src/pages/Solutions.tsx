import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  User, 
  Building2, 
  Landmark,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Solutions = () => {
  const { t } = useLanguage();

  const solutions = [
    {
      icon: User,
      title: t("solutions.citizen.title"),
      subtitle: t("solutions.citizen.subtitle"),
      description: t("solutions.citizen.description"),
      gradient: "from-primary to-secondary",
      features: [t("solutions.citizen.f1"), t("solutions.citizen.f2"), t("solutions.citizen.f3")],
      price: t("solutions.citizen.price"),
      popular: false,
    },
    {
      icon: Building2,
      title: t("solutions.business.title"),
      subtitle: t("solutions.business.subtitle"),
      description: t("solutions.business.description"),
      gradient: "from-secondary to-accent",
      features: [t("solutions.business.f1"), t("solutions.business.f2"), t("solutions.business.f3")],
      price: t("solutions.business.price"),
      popular: true,
    },
    {
      icon: Landmark,
      title: t("solutions.institution.title"),
      subtitle: t("solutions.institution.subtitle"),
      description: t("solutions.institution.description"),
      gradient: "from-accent to-orange-500",
      features: [t("solutions.institution.f1"), t("solutions.institution.f2"), t("solutions.institution.f3")],
      price: t("solutions.institution.price"),
      popular: false,
    },
  ];

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
                {t("solutions.title1")}{" "}
                <span className="gradient-text">{t("solutions.title2")}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("solutions.description")}
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
                        {t("solutions.popular")}
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
                      {t("solutions.choose")}
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
