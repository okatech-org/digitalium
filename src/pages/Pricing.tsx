import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, Building2, Landmark, User, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useBilling, formatXAF, formatBytes } from "@/contexts/FirebaseBillingContext";
import { useAuth } from "@/contexts/FirebaseAuthContext";
import { CheckoutModal } from "@/components/billing/CheckoutModal";
import type { Plan, BillingCycle } from "@/types/billing";

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

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plans, subscription, isLoading } = useBilling();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Filter plans by type
  const personalPlans = plans.filter(p => p.type === "personal");
  const businessPlans = plans.filter(p => p.type === "business");

  const getPrice = (plan: Plan) => {
    if (plan.price_xaf === 0) return "Gratuit";
    if (billingCycle === "yearly" && plan.price_yearly_xaf) {
      return formatXAF(plan.price_yearly_xaf);
    }
    return formatXAF(plan.price_xaf);
  };

  const getPriceNote = (plan: Plan) => {
    if (plan.price_xaf === 0) return "Pour toujours";
    if (billingCycle === "yearly") {
      return "/an";
    }
    return "/mois";
  };

  const getYearlySavings = (plan: Plan) => {
    if (!plan.price_yearly_xaf || plan.price_xaf === 0) return null;
    const monthlyTotal = plan.price_xaf * 12;
    const savings = monthlyTotal - plan.price_yearly_xaf;
    if (savings <= 0) return null;
    return Math.round((savings / monthlyTotal) * 100);
  };

  const handleSelectPlan = (plan: Plan) => {
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
        className={`relative group ${isPopular ? "lg:-mt-4 lg:mb-4" : ""}`}
      >
        {isPopular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
              Le plus populaire
            </Badge>
          </div>
        )}

        {isCurrent && (
          <div className="absolute -top-4 right-4 z-10">
            <Badge variant="outline" className="bg-background">
              Plan actuel
            </Badge>
          </div>
        )}

        <div
          className={`h-full glass-card p-8 ${
            isPopular ? "border-primary/50 shadow-lg shadow-primary/10" : ""
          } ${isCurrent ? "border-green-500/50" : ""} hover:border-primary/30 transition-all duration-300`}
        >
          {/* Icon & Header */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{plan.display_name}</h3>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6 pb-6 border-b border-border/50">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{getPrice(plan)}</span>
              <span className="text-sm text-muted-foreground">{getPriceNote(plan)}</span>
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
          <div className="mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stockage</span>
              <span className="font-medium">{formatBytes(plan.storage_bytes)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Documents</span>
              <span className="font-medium">
                {plan.max_documents === -1 ? "Illimité" : plan.max_documents}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Requêtes IA/jour</span>
              <span className="font-medium">
                {plan.ai_requests_per_day === -1 ? "Illimité" : plan.ai_requests_per_day}
              </span>
            </div>
            {plan.max_users > 1 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Utilisateurs</span>
                <span className="font-medium">
                  {plan.max_users === -1 ? "Illimité" : `Jusqu'à ${plan.max_users}`}
                </span>
              </div>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {plan.features.slice(0, 6).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground/80 capitalize">
                  {feature.replace(/_/g, " ")}
                </span>
              </li>
            ))}
            {plan.features.length > 6 && (
              <li className="text-sm text-muted-foreground pl-8">
                + {plan.features.length - 6} autres fonctionnalités
              </li>
            )}
          </ul>

          {/* CTA */}
          <Button
            className={`w-full ${
              isPopular
                ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                : ""
            }`}
            variant={isPopular ? "default" : "secondary"}
            onClick={() => handleSelectPlan(plan)}
            disabled={isCurrent || isLoading}
          >
            {isCurrent ? (
              "Plan actuel"
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
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-1.5 rounded-full glass-card text-sm font-medium text-primary mb-4">
                Tarification
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Des prix{" "}
                <span className="gradient-text-accent">transparents</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Choisissez le plan qui correspond à vos besoins.
                Tous les plans incluent un essai gratuit de 14 jours.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4">
                <span
                  className={`text-sm ${
                    billingCycle === "monthly"
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
                  className={`text-sm ${
                    billingCycle === "yearly"
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  Annuel
                </span>
                <Badge variant="secondary" className="ml-2">
                  -17% économies
                </Badge>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Personal Plans */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl font-bold mb-2">Pour les Particuliers</h2>
              <p className="text-muted-foreground">
                Gérez vos documents personnels et familiaux
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {personalPlans.map((plan, index) =>
                renderPlanCard(plan, plan.name === "premium")
              )}
            </div>
          </div>
        </section>

        {/* Business Plans */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl font-bold mb-2">Pour les Entreprises</h2>
              <p className="text-muted-foreground">
                Solutions pour les équipes et les organisations
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {businessPlans.map((plan, index) =>
                renderPlanCard(plan, plan.name === "business")
              )}
            </div>
          </div>
        </section>

        {/* Enterprise CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center glass-card p-12 rounded-3xl"
            >
              <Landmark className="w-16 h-16 mx-auto mb-6 text-amber-500" />
              <h2 className="text-3xl font-bold mb-4">
                Institutions Gouvernementales
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Déploiement souverain, conformité totale aux réglementations gabonaises,
                formation et accompagnement inclus. Licence perpétuelle avec maintenance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90"
                  onClick={() => navigate("/contact")}
                >
                  Demander un devis
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/contact")}>
                  Nous contacter
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Questions Fréquentes</h2>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  q: "Puis-je changer de plan à tout moment ?",
                  a: "Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. Les changements prennent effet immédiatement et le prorata est calculé automatiquement.",
                },
                {
                  q: "Quels moyens de paiement acceptez-vous ?",
                  a: "Nous acceptons les paiements par Mobile Money (MTN, Airtel, Moov), cartes bancaires et virements bancaires pour les entreprises.",
                },
                {
                  q: "Y a-t-il un engagement minimum ?",
                  a: "Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment et continuer à utiliser le service jusqu'à la fin de votre période de facturation.",
                },
                {
                  q: "Mes données sont-elles sécurisées ?",
                  a: "Absolument. Toutes vos données sont chiffrées en transit et au repos. Pour les institutions, nous offrons des options de déploiement souverain au Gabon.",
                },
              ].map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card p-6 rounded-xl"
                >
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          open={showCheckout}
          onOpenChange={setShowCheckout}
          plan={selectedPlan}
          billingCycle={billingCycle}
        />
      )}
    </div>
  );
}
