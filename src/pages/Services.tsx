import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Scan, 
  Brain, 
  Shield, 
  Users, 
  Wifi,
  Workflow,
} from "lucide-react";

const Services = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Scan,
      title: t("services.scan.title"),
      description: t("services.scan.description"),
    },
    {
      icon: Brain,
      title: t("services.ai.title"),
      description: t("services.ai.description"),
    },
    {
      icon: Shield,
      title: t("services.security.title"),
      description: t("services.security.description"),
    },
    {
      icon: Users,
      title: t("services.persona.title"),
      description: t("services.persona.description"),
    },
    {
      icon: Wifi,
      title: t("services.offline.title"),
      description: t("services.offline.description"),
    },
    {
      icon: Workflow,
      title: t("services.workflow.title"),
      description: t("services.workflow.description"),
    }
  ];

  return (
    <div className="h-screen overflow-hidden">
      <Header />
      <main className="h-full flex items-center">
        <section className="relative w-full py-12">
          <div className="absolute inset-0 cortex-grid opacity-30" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {t("services.title1")}{" "}
                <span className="gradient-text">{t("services.title2")}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("services.description")}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Services;
