import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  CreditCard,
  Building2,
  Loader2,
  Check,
  Shield,
  Sparkles,
} from "lucide-react";
import { useBilling, formatXAF } from "@/contexts/FirebaseBillingContext";
import type { Plan, BillingCycle, PaymentMethod } from "@/types/billing";
import { toast } from "sonner";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan;
  billingCycle: BillingCycle;
}

const paymentMethods = [
  {
    id: "mobile_money_mtn" as PaymentMethod,
    name: "MTN Mobile Money",
    icon: Phone,
    color: "bg-yellow-500",
    description: "Paiement instantané via MTN MoMo",
  },
  {
    id: "mobile_money_airtel" as PaymentMethod,
    name: "Airtel Money",
    icon: Phone,
    color: "bg-red-500",
    description: "Paiement instantané via Airtel Money",
  },
  {
    id: "mobile_money_moov" as PaymentMethod,
    name: "Moov Money",
    icon: Phone,
    color: "bg-blue-500",
    description: "Paiement instantané via Moov Money",
  },
  {
    id: "card" as PaymentMethod,
    name: "Carte bancaire",
    icon: CreditCard,
    color: "bg-slate-700",
    description: "Visa, Mastercard",
  },
];

export function CheckoutModal({
  open,
  onOpenChange,
  plan,
  billingCycle,
}: CheckoutModalProps) {
  const navigate = useNavigate();
  const { subscribe } = useBilling();
  const [step, setStep] = useState<"payment" | "confirm" | "success">("payment");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("mobile_money_mtn");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const price =
    billingCycle === "yearly" && plan.price_yearly_xaf
      ? plan.price_yearly_xaf
      : plan.price_xaf;

  const handleSubmit = async () => {
    if (selectedMethod.startsWith("mobile_money") && !phoneNumber) {
      toast.error("Veuillez entrer votre numéro de téléphone");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await subscribe(plan.id, selectedMethod, billingCycle);

      if (result.success) {
        setStep("success");
        toast.success("Abonnement activé avec succès !");
      } else {
        toast.error(result.error || "Erreur lors du paiement");
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (step === "success") {
      navigate("/dashboard");
    }
    onOpenChange(false);
    // Reset state after close
    setTimeout(() => {
      setStep("payment");
      setPhoneNumber("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === "success" ? "Paiement réussi" : "Finaliser votre abonnement"}
          </DialogTitle>
          <DialogDescription>
            {step === "success"
              ? "Votre abonnement est maintenant actif"
              : `Abonnement ${plan.display_name} - ${billingCycle === "yearly" ? "Annuel" : "Mensuel"}`}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 py-4"
            >
              {/* Order Summary */}
              <div className="glass-card p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <Badge>{plan.display_name}</Badge>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Période</span>
                  <span className="text-sm">
                    {billingCycle === "yearly" ? "1 an" : "1 mois"}
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold">{formatXAF(price)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <Label>Méthode de paiement</Label>
                <RadioGroup
                  value={selectedMethod}
                  onValueChange={(v) => setSelectedMethod(v as PaymentMethod)}
                  className="grid grid-cols-2 gap-3"
                >
                  {paymentMethods.map((method) => (
                    <Label
                      key={method.id}
                      htmlFor={method.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                      <div
                        className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <method.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{method.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {method.description}
                        </p>
                      </div>
                      {selectedMethod === method.id && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Phone Number Input for Mobile Money */}
              {selectedMethod.startsWith("mobile_money") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ex: 077 12 34 56"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Vous recevrez une demande de paiement sur ce numéro
                  </p>
                </motion.div>
              )}

              {/* Security Note */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Paiement sécurisé et données protégées</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>Payer {formatXAF(price)}</>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>

              <h3 className="text-2xl font-bold mb-2">Bienvenue !</h3>
              <p className="text-muted-foreground mb-6">
                Votre abonnement {plan.display_name} est maintenant actif.
                Profitez de toutes les fonctionnalités.
              </p>

              <div className="glass-card p-4 rounded-lg mb-6 text-left">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Ce qui vous attend
                </h4>
                <ul className="space-y-2">
                  {plan.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="capitalize">{feature.replace(/_/g, " ")}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                Accéder à mon espace
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
