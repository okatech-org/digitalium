import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  MessageSquareText, 
  Scan, 
  FolderOpen, 
  Bell, 
  Share2, 
  Lock,
} from "lucide-react";

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: MessageSquareText,
      title: t("features.assistant.title"),
      description: t("features.assistant.description"),
    },
    {
      icon: Scan,
      title: t("features.scan.title"),
      description: t("features.scan.description"),
    },
    {
      icon: FolderOpen,
      title: t("features.organization.title"),
      description: t("features.organization.description"),
    },
    {
      icon: Bell,
      title: t("features.alerts.title"),
      description: t("features.alerts.description"),
    },
    {
      icon: Share2,
      title: t("features.share.title"),
      description: t("features.share.description"),
    },
    {
      icon: Lock,
      title: t("features.encryption.title"),
      description: t("features.encryption.description"),
    },
  ];

  return (
    <div className="h-screen overflow-hidden">
      <Header />
      <main className="h-full flex items-center">
        <section className="relative w-full py-12 glass-section">
          <div className="absolute inset-0 cortex-grid opacity-30" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {t("features.title1")}{" "}
                <span className="gradient-text">{t("features.title2")}</span>
                <br className="hidden sm:block" />
                {t("features.title3")}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("features.description")}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Features;
