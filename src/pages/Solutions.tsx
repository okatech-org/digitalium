import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBilling, formatXAF, formatBytes } from "@/contexts/FirebaseBillingContext";
import { useAuth } from "@/contexts/FirebaseAuthContext";
import { CheckoutModal } from "@/components/billing/CheckoutModal";
import type { Plan, BillingCycle } from "@/types/billing";
import {
  User,
  Building2,
  Landmark,
  CheckCircle,
  ArrowRight,
  ScanLine,
  FolderArchive,
  Brain,
  Shield,
  Workflow,
  Globe,
  Check,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Services/Features data
const features = [
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

const planIcons: Record<string, React.ElementType> = {
  free: User,
  starter: User,
  premium: Sparkles,
  family: Users,
  team: Building2,
  business: Building2,
  enterprise: Building2,
  municipal: Landmark,
  ministerial: Landmark,
  national: Landmark,
};

const planGradients: Record<string, string> = {
  free: "from-gray-400 to-gray-500",
  starter: "from-cyan-500 to-blue-500",
  premium: "from-violet-500 to-purple-500",
  family: "from-pink-500 to-rose-500",
  team: "from-emerald-500 to-green-500",
  business: "from-orange-500 to-amber-500",
  enterprise: "from-slate-600 to-slate-700",
};

const Solutions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { plans, subscription, isLoading } = useBilling();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeTab, setActiveTab] = useState("features");
  const [idnToken, setIdnToken] = useState<string | null>(null);

  // Handle incoming URL parameters from idn.ga
  useEffect(() => {
    const planParam = searchParams.get("plan");
    const tokenParam = searchParams.get("idn_token");
    const tabParam = searchParams.get("tab");

    // If coming from idn.ga with a plan, switch to Particuliers tab
    if (planParam) {
      setActiveTab("personal");

      // Find and pre-select the plan
      const plan = plans.find(p => p.id === planParam || p.name === planParam);
      if (plan && plan.type === "personal") {
        setSelectedPlan(plan);
        // Auto-open checkout if token is provided
        if (tokenParam) {
          setIdnToken(tokenParam);
          setShowCheckout(true);
        }
      }
    }

    // Allow direct tab navigation via URL
    if (tabParam && ["features", "personal", "business", "institution"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, plans]);

  // Filter plans by type
  const personalPlans = plans.filter(p => p.type === "personal");
  const businessPlans = plans.filter(p => p.type === "business");
  const institutionPlans = plans.filter(p => p.type === "institution" || p.name === "municipal" || p.name === "ministerial" || p.name === "national");

  const getPrice = (plan: Plan) => {
    if (plan.name === 'enterprise' || plan.name === 'municipal' || plan.name === 'ministerial' || plan.name === 'national') return "Sur Devis";
    if (plan.price_xaf === 0) return "Gratuit";
    if (billingCycle === "yearly" && plan.price_yearly_xaf) {
      return formatXAF(plan.price_yearly_xaf);
    }
    return formatXAF(plan.price_xaf);
  };

  const getPriceNote = (plan: Plan) => {
    if (plan.name === 'enterprise' || plan.name === 'municipal' || plan.name === 'ministerial' || plan.name === 'national') return "Contactez-nous";
    if (plan.price_xaf === 0) return "Pour toujours";
    if (billingCycle === "yearly") {
      return "/an";
    }
    return "/mois";
  };

  const getYearlySavings = (plan: Plan) => {
    if (plan.name === 'enterprise' || plan.name === 'municipal' || plan.name === 'ministerial' || plan.name === 'national') return null;
    if (!plan.price_yearly_xaf || plan.price_xaf === 0) return null;
    const monthlyTotal = plan.price_xaf * 12;
    const savings = monthlyTotal - plan.price_yearly_xaf;
    if (savings <= 0) return null;
    return Math.round((savings / monthlyTotal) * 100);
  };

  const handleSelectPlan = (plan: Plan) => {
    // For personal plans, redirect to IDN.ga (identite.ga)
    // Personal subscriptions are managed entirely in idn.ga
    if (plan.type === "personal") {
      const idnUrl = import.meta.env.VITE_IDN_OAUTH_URL || "https://identite.ga";
      window.location.href = `${idnUrl}/solutions?plan=${plan.id}`;
      return;
    }

    if (!user) {
      navigate("/auth");
      return;
    }
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const isCurrentPlan = (plan: Plan) => {
    return subscription?.plan?.id === plan.id;
  };

  const renderPlanCard = (plan: Plan, isPopular = false) => {
    const Icon = planIcons[plan.name] || User;
    const gradient = planGradients[plan.name] || "from-primary to-secondary";
    const savings = getYearlySavings(plan);
    const isCurrent = isCurrentPlan(plan);

    return (
      <motion.div
        key={plan.id}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative group"
      >
        {isCurrent && (
          <div className="absolute -top-2 right-4 z-10">
            <Badge variant="outline" className="bg-background text-xs">
              Plan actuel
            </Badge>
          </div>
        )}

        <div
          className={`h-full glass-card p-5 flex flex-col ${isPopular ? "border-primary/50 shadow-lg shadow-primary/10 ring-1 ring-primary/30" : ""
            } ${isCurrent ? "border-green-500/50" : ""} hover:border-primary/30 transition-all duration-300`}
        >
          {/* Popular Badge - Inside card */}
          {isPopular && (
            <div className="flex justify-center -mt-2 mb-2">
              <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md text-xs px-3 py-0.5">
                Le plus populaire
              </Badge>
            </div>
          )}
          {/* Icon & Header */}
          <div className="flex items-start gap-3 mb-4">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">{plan.display_name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
            </div>
          </div>

          {/* Price */}
          <div className="mb-4 pb-4 border-b border-border/50">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{getPrice(plan)}</span>
              <span className="text-xs text-muted-foreground">{getPriceNote(plan)}</span>
            </div>
            {billingCycle === "yearly" && savings && (
              <p className="text-sm text-green-500 mt-1">
                Économisez {savings}% par an
              </p>
            )}
            {plan.type === "business" && (
              <p className="text-xs text-muted-foreground mt-1">par utilisateur</p>
            )}
          </div>

          {/* Limits */}
          <div className="mb-4 space-y-1.5 text-xs">
            <div className="flex justify-between items-center gap-2">
              <span className="text-muted-foreground truncate">Stockage</span>
              <span className="font-medium text-right whitespace-nowrap">
                {plan.name === 'enterprise' || plan.name === 'municipal' || plan.name === 'ministerial' || plan.name === 'national'
                  ? "Sur mesure"
                  : formatBytes(plan.storage_bytes)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-muted-foreground truncate">Documents</span>
              <span className="font-medium text-right whitespace-nowrap">
                {plan.max_documents === -1 ? "Illimité" : plan.max_documents.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-muted-foreground truncate">Requêtes IA/jour</span>
              <span className="font-medium text-right whitespace-nowrap">
                {plan.ai_requests_per_day === -1 ? "Illimité" : plan.ai_requests_per_day.toLocaleString()}
              </span>
            </div>
            {plan.max_users > 1 && (
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground truncate">Utilisateurs</span>
                <span className="font-medium text-right whitespace-nowrap">
                  {plan.max_users === -1 ? "Illimité" : `Jusqu'à ${plan.max_users}`}
                </span>
              </div>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-1.5 mb-4 flex-grow">
            {plan.features.slice(0, 6).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-primary" />
                </div>
                <span className="text-xs text-foreground/80 capitalize truncate">
                  {feature.replace(/_/g, " ")}
                </span>
              </li>
            ))}
            {plan.features.length > 6 && (
              <li className="text-xs text-muted-foreground pl-6">
                + {plan.features.length - 6} autres fonctionnalités
              </li>
            )}
          </ul>

          {/* CTA */}
          <div className="mt-auto">
            <Button
              className={`w-full ${isPopular
                ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                : ""
                } ${(plan.name === 'enterprise' || plan.name === 'municipal' || plan.name === 'ministerial' || plan.name === 'national') ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
              variant={isPopular ? "default" : (plan.name === 'enterprise' || plan.name === 'municipal' || plan.name === 'ministerial' || plan.name === 'national') ? "default" : "secondary"}
              onClick={() => handleSelectPlan(plan)}
              disabled={isCurrent || isLoading}
            >
              {isCurrent ? (
                "Plan actuel"
              ) : (plan.name === 'enterprise' || plan.name === 'municipal' || plan.name === 'ministerial' || plan.name === 'national') ? (
                "Demander un devis"
              ) : plan.price_xaf === 0 ? (
                "Commencer gratuitement"
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Choisir ce plan
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="py-3 relative overflow-hidden">
          <div className="absolute inset-0 cortex-grid opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-2"
            >
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {t("solutions.title1")}{" "}
                <span className="gradient-text-accent">{t("solutions.title2")}</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                Découvrez nos fonctionnalités et choisissez le plan qui correspond à vos besoins.
              </p>
            </motion.div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-[1400px] mx-auto">
              <div className="flex justify-center mb-3">
                <TabsList className="inline-flex h-10 p-1 bg-background/50 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg">
                  <TabsTrigger
                    value="features"
                    className="gap-1.5 px-3 py-2 rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    <Brain className="w-4 h-4" />
                    <span className="hidden sm:inline">Fonctionnalités</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="personal"
                    className="gap-1.5 px-3 py-2 rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Particuliers</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="business"
                    className="gap-1.5 px-3 py-2 rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Entreprises</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="institution"
                    className="gap-1.5 px-3 py-2 rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                  >
                    <Landmark className="w-4 h-4" />
                    <span className="hidden sm:inline">Secteur Public</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Features Tab */}
              <TabsContent value="features">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-10 pb-4"
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative"
                    >
                      <div className="h-full glass-card p-8 hover:border-primary/30 transition-all duration-300">
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                            <feature.icon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-2">
                              {feature.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {feature.features.map((feat, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA to see pricing */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mt-4"
                >
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("personal")}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    Voir les tarifs
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              </TabsContent>

              {/* Personal Plans Tab */}
              <TabsContent value="personal">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Billing Toggle */}
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span
                      className={`text-xs ${billingCycle === "monthly"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                        }`}
                    >
                      Mensuel
                    </span>
                    <Switch
                      checked={billingCycle === "yearly"}
                      onCheckedChange={(checked) =>
                        setBillingCycle(checked ? "yearly" : "monthly")
                      }
                    />
                    <span
                      className={`text-xs ${billingCycle === "yearly"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                        }`}
                    >
                      Annuel
                    </span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      -17%
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto items-stretch mt-10 pb-4">
                    {personalPlans.map((plan) =>
                      renderPlanCard(plan, plan.name === "premium")
                    )}
                  </div>
                </motion.div>
              </TabsContent>

              {/* Business Plans Tab */}
              <TabsContent value="business">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Billing Toggle */}
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span
                      className={`text-xs ${billingCycle === "monthly"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                        }`}
                    >
                      Mensuel
                    </span>
                    <Switch
                      checked={billingCycle === "yearly"}
                      onCheckedChange={(checked) =>
                        setBillingCycle(checked ? "yearly" : "monthly")
                      }
                    />
                    <span
                      className={`text-xs ${billingCycle === "yearly"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                        }`}
                    >
                      Annuel
                    </span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      -17%
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto items-stretch mt-10 pt-2 pb-4">
                    {businessPlans.map((plan) =>
                      renderPlanCard(plan, plan.name === "business")
                    )}
                  </div>


                </motion.div>
              </TabsContent>

              {/* Institution Plans Tab */}
              <TabsContent value="institution">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Institutional Header - Compact */}
                  <div className="flex items-center justify-center gap-3 mb-6 pt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                      <Landmark className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs text-amber-500 font-medium">Solutions Souveraines</span>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      Hébergement souverain · Conformité RGPD · Accompagnement dédié
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto items-stretch mt-10 pt-2 pb-4">
                    {institutionPlans.length > 0 ? (
                      institutionPlans.map((plan) =>
                        renderPlanCard(plan, plan.name === "ministerial")
                      )
                    ) : (
                      <>
                        {/* Municipal Plan Fallback */}
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="relative group"
                        >
                          <div className="h-full glass-card p-5 flex flex-col hover:border-primary/30 transition-all duration-300">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                                <Landmark className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold leading-tight">Municipal</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Mairies et communes</p>
                              </div>
                            </div>
                            <div className="mb-4 pb-4 border-b border-border/50">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">Sur Devis</span>
                                <span className="text-xs text-muted-foreground">personnalisé</span>
                              </div>
                            </div>
                            <div className="mb-4 space-y-1.5 text-xs">
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-muted-foreground">Stockage</span>
                                <span className="font-medium whitespace-nowrap">Sur mesure</span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-muted-foreground">Utilisateurs</span>
                                <span className="font-medium whitespace-nowrap">Jusqu'à 50</span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-muted-foreground">Déploiement</span>
                                <span className="font-medium whitespace-nowrap">Cloud / Hybride</span>
                              </div>
                            </div>
                            <ul className="space-y-1.5 mb-4 flex-grow">
                              <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-primary" /></div><span className="text-xs">Toutes fonctionnalités</span></li>
                              <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-primary" /></div><span className="text-xs">Migration des données</span></li>
                              <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-primary" /></div><span className="text-xs">Formation initiale</span></li>
                              <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-primary" /></div><span className="text-xs">Support 8/5</span></li>
                            </ul>
                            <div className="mt-auto">
                              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => navigate("/contact?type=municipal")}>
                                Demander un devis
                              </Button>
                            </div>
                          </div>
                        </motion.div>

                        {/* Ministerial Plan Fallback */}
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 }}
                          className="relative group lg:-mt-4 lg:mb-4"
                        >
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg text-xs px-3 py-1">
                              Recommandé
                            </Badge>
                          </div>
                          <div className="h-full glass-card p-5 flex flex-col border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                <Landmark className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold leading-tight">Ministériel</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Ministères et directions</p>
                              </div>
                            </div>
                            <div className="mb-4 pb-4 border-b border-border/50">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">Sur Devis</span>
                                <span className="text-xs text-muted-foreground">personnalisé</span>
                              </div>
                            </div>
                            <div className="mb-4 space-y-1.5 text-xs">
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-muted-foreground">Stockage</span>
                                <span className="font-medium whitespace-nowrap">Illimité</span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-muted-foreground">Utilisateurs</span>
                                <span className="font-medium whitespace-nowrap">Jusqu'à 500</span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-muted-foreground">Déploiement</span>
                                <span className="font-medium whitespace-nowrap">On-Premise / Hybride</span>
                              </div>
                            </div>
                            <ul className="space-y-1.5 mb-4 flex-grow">
                              <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-primary" /></div><span className="text-xs">Haute disponibilité</span></li>
                              <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-primary" /></div><span className="text-xs">Intégration SI existant</span></li>
                              <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-primary" /></div><span className="text-xs">Support 24/7</span></li>
                              <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-primary" /></div><span className="text-xs">Audit annuel sécurité</span></li>
                            </ul>
                            <div className="mt-auto">
                              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white" onClick={() => navigate("/contact?type=ministerial")}>
                                Demander un devis
                              </Button>
                            </div>
                          </div>
                        </motion.div>

                        {/* National Plan Fallback */}
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 }}
                          className="relative group"
                        >
                          <div className="h-full glass-card p-5 flex flex-col hover:border-primary/30 transition-all duration-300">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
                                <Globe className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold leading-tight">National</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Projets d'envergure nationale</p>
                              </div>
                            </div>
                            <div className="mb-4 pb-4 border-b border-border/50">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">Partenariat</span>
                                <span className="text-xs text-muted-foreground">PPP</span>
                              </div>
                            </div>
                            <div className="mb-4 space-y-1.5 text-xs">
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-muted-foreground">Stockage</span>
                                <span className="font-medium whitespace-nowrap">Datacenter dédié</span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-muted-foreground">Utilisateurs</span>
                                <span className="font-medium whitespace-nowrap">Illimité</span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-muted-foreground">Déploiement</span>
                                <span className="font-medium whitespace-nowrap">Souverain exclusif</span>
                              </div>
                            </div>
                            <ul className="space-y-1.5 mb-4 flex-grow">
                              <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-primary" /></div><span className="text-xs">Partenariat Public-Privé</span></li>
                              <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-primary" /></div><span className="text-xs">Création d'emplois locaux</span></li>
                              <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-primary" /></div><span className="text-xs">Programme de formation</span></li>
                              <li className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-primary" /></div><span className="text-xs">Roadmap personnalisée</span></li>
                            </ul>
                            <div className="mt-auto">
                              <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white" onClick={() => navigate("/contact?type=national")}>
                                Nous contacter
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </section >
      </main >

      {/* Checkout Modal */}
      {
        selectedPlan && (
          <CheckoutModal
            open={showCheckout}
            onOpenChange={setShowCheckout}
            plan={selectedPlan}
            billingCycle={billingCycle}
          />
        )
      }
    </div >
  );
};

export default Solutions;
