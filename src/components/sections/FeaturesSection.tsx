import { motion } from "framer-motion";
import { 
  MessageSquareText, 
  Scan, 
  FolderOpen, 
  Search, 
  Bell, 
  Share2,
  Smartphone,
  CloudOff
} from "lucide-react";

const features = [
  {
    icon: MessageSquareText,
    title: "Conversation Naturelle",
    description: "Demandez en langage naturel : \"Montre-moi mes diplômes\" ou \"Prépare mon dossier visa France\".",
  },
  {
    icon: Scan,
    title: "Scan Multi-Mode",
    description: "Mode batch pour scanner plusieurs documents, mode voix pour mains libres, correction auto de perspective.",
  },
  {
    icon: FolderOpen,
    title: "Dossiers Visuels 3D",
    description: "Interface révolutionnaire avec dossiers animés qui reflètent leur état : vide, non lu, ou consulté.",
  },
  {
    icon: Search,
    title: "Recherche Sémantique",
    description: "Trouvez n'importe quel document par son contenu, pas seulement son nom. L'IA comprend vos intentions.",
  },
  {
    icon: Bell,
    title: "Alertes Proactives",
    description: "Soyez notifié avant l'expiration de vos documents. L'IA anticipe vos besoins administratifs.",
  },
  {
    icon: Share2,
    title: "Partage Sécurisé",
    description: "Partagez des dossiers complets avec liens temporaires et traçabilité complète des accès.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Application native avec widgets iOS/Android, capture rapide depuis l'écran d'accueil.",
  },
  {
    icon: CloudOff,
    title: "Mode Hors-Ligne",
    description: "Accédez à vos documents même sans connexion. Synchronisation automatique au retour du réseau.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 cortex-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
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
            Fonctionnalités
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            L'IA qui{" "}
            <span className="gradient-text">Travaille pour Vous</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez comment l'intelligence artificielle de DIGITALIUM 
            simplifie chaque aspect de votre gestion documentaire.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-300">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20"
        >
          <div className="glass-card p-8 md:p-12 rounded-3xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Description */}
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Voyez l'IA en Action
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Notre assistant comprend vos demandes en langage naturel et exécute 
                  des actions complexes en quelques secondes.
                </p>
                
                {/* Example Conversation */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">👤</span>
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-2xl rounded-tl-md p-4">
                      <p className="text-sm">"Prépare un dossier pour ma demande de visa France"</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">🤖</span>
                    </div>
                    <div className="flex-1 bg-primary/10 rounded-2xl rounded-tl-md p-4 border border-primary/20">
                      <p className="text-sm mb-2">✓ Dossier "Visa France 2026" créé</p>
                      <p className="text-sm mb-2">✓ Documents ajoutés automatiquement :</p>
                      <ul className="text-xs text-muted-foreground ml-4 space-y-1">
                        <li>• Passeport (valide jusqu'en 2034) ✓</li>
                        <li>• Relevés bancaires (3 derniers mois) ✓</li>
                        <li>• Assurance voyage ⚠️ MANQUANT</li>
                      </ul>
                      <p className="text-sm mt-2 text-primary">📋 Checklist créée (2/4 complété)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center pulse-glow">
                      <MessageSquareText className="w-12 h-12 text-primary-foreground" />
                    </div>
                    <p className="text-lg font-medium">Assistant IA DIGITALIUM</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Disponible 24/7 pour vous aider
                    </p>
                  </div>
                </div>
                
                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 px-4 py-2 rounded-full glass-card text-sm font-medium"
                >
                  🧠 Gemini 2.0
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 px-4 py-2 rounded-full glass-card text-sm font-medium"
                >
                  ⚡ Temps réel
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
