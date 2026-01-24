import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useFirebaseAuth } from './FirebaseAuthContext';
import type {
  Plan,
  Subscription,
  SubscriptionWithPlan,
  Invoice,
  Usage,
  UsageWithLimits,
  PaymentMethod,
  BillingCycle,
  FeatureKey,
  BillingContextType,
} from '@/types/billing';

const BillingContext = createContext<BillingContextType | undefined>(undefined);

// Get Cloud Functions instance (europe-west1 region)
const functions = getFunctions(undefined, 'europe-west1');

// Cloud Functions callable references
const getPlansFunc = httpsCallable<unknown, { plans: Plan[] }>(functions, 'getPlans');
const getSubscriptionFunc = httpsCallable<unknown, { subscription: SubscriptionWithPlan | null }>(functions, 'getSubscription');
const getUsageFunc = httpsCallable<unknown, { usage: Usage | null }>(functions, 'getUsage');
const getInvoicesFunc = httpsCallable<unknown, { invoices: Invoice[] }>(functions, 'getInvoices');
const createSubscriptionFunc = httpsCallable<{
  planId: string;
  billingCycle: BillingCycle;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}, { success: boolean; subscriptionId?: string }>(functions, 'createSubscription');
const cancelSubscriptionFunc = httpsCallable<{ immediate?: boolean }, { success: boolean }>(functions, 'cancelSubscription');
const reactivateSubscriptionFunc = httpsCallable<unknown, { success: boolean }>(functions, 'reactivateSubscription');
const incrementAIUsageFunc = httpsCallable<unknown, { success: boolean }>(functions, 'incrementAIUsage');
const hasFeatureFunc = httpsCallable<{ feature: string }, { hasFeature: boolean }>(functions, 'hasFeature');

// Payment providers
const initPayDunyaPaymentFunc = httpsCallable<{
  planId: string;
  billingCycle: BillingCycle;
  returnUrl?: string;
  cancelUrl?: string;
}, { success: boolean; transactionId: string; paymentUrl: string; demoMode?: boolean }>(functions, 'initPayDunyaPayment');

const initFlutterwavePaymentFunc = httpsCallable<{
  planId: string;
  billingCycle: BillingCycle;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
  email?: string;
  returnUrl?: string;
}, { success: boolean; transactionId: string; paymentUrl: string; demoMode?: boolean }>(functions, 'initFlutterwavePayment');

const initCinetPayPaymentFunc = httpsCallable<{
  planId: string;
  billingCycle: BillingCycle;
  phoneNumber?: string;
  returnUrl?: string;
}, { success: boolean; transactionId: string; paymentUrl: string; paymentToken?: string; demoMode?: boolean }>(functions, 'initCinetPayPayment');

// Demo payment completion
const completePayDunyaDemoPaymentFunc = httpsCallable<{
  transactionId: string;
  planId: string;
  billingCycle: BillingCycle;
}, { success: boolean; subscriptionId?: string }>(functions, 'completePayDunyaDemoPayment');

const completeFlutterwaveDemoPaymentFunc = httpsCallable<{
  planId: string;
  billingCycle: BillingCycle;
}, { success: boolean; subscriptionId?: string }>(functions, 'completeFlutterwaveDemoPayment');

const completeCinetPayDemoPaymentFunc = httpsCallable<{
  planId: string;
  billingCycle: BillingCycle;
}, { success: boolean; subscriptionId?: string }>(functions, 'completeCinetPayDemoPayment');

// Feature definitions for display
export const FEATURE_DEFINITIONS: Record<FeatureKey, { name: string; description: string }> = {
  scan: { name: 'Numérisation', description: 'Scanner vos documents' },
  folders: { name: 'Dossiers', description: 'Organisation en dossiers' },
  basic_search: { name: 'Recherche', description: 'Recherche dans vos documents' },
  advanced_ocr: { name: 'OCR Avancé', description: 'Reconnaissance de texte avancée' },
  export_pdf: { name: 'Export PDF', description: 'Exporter en PDF' },
  reminders: { name: 'Rappels', description: 'Rappels pour vos documents' },
  compiled_folders: { name: 'Dossiers compilés', description: 'Regrouper des documents' },
  sharing: { name: 'Partage', description: 'Partager vos documents' },
  priority_support: { name: 'Support prioritaire', description: 'Assistance prioritaire' },
  ai_assistant: { name: 'Assistant IA', description: 'Assistant intelligent' },
  family_sharing: { name: 'Partage famille', description: 'Partage avec la famille' },
  team_workspaces: { name: 'Espaces équipe', description: 'Espaces de travail collaboratifs' },
  basic_workflows: { name: 'Workflows', description: 'Automatisation basique' },
  advanced_workflows: { name: 'Workflows avancés', description: 'Automatisation avancée' },
  analytics: { name: 'Analytics', description: 'Statistiques et rapports' },
  api_access: { name: 'Accès API', description: 'Intégration par API' },
  sso_saml: { name: 'SSO/SAML', description: 'Authentification entreprise' },
  dedicated_support: { name: 'Support dédié', description: 'Gestionnaire de compte' },
  all_features: { name: 'Toutes fonctionnalités', description: 'Accès complet' },
  dedicated_deployment: { name: 'Déploiement dédié', description: 'Instance dédiée' },
  sla_guarantee: { name: 'SLA garanti', description: 'Garantie de disponibilité' },
  onsite_training: { name: 'Formation sur site', description: 'Formation en personne' },
  account_manager: { name: 'Account manager', description: 'Gestionnaire dédié' },
  custom_integrations: { name: 'Intégrations', description: 'Intégrations personnalisées' },
  on_premise: { name: 'On-Premise', description: 'Déploiement local' },
  data_migration: { name: 'Migration données', description: 'Migration assistée' },
  initial_training: { name: 'Formation initiale', description: 'Formation de démarrage' },
  support_8x5: { name: 'Support 8/5', description: 'Support heures ouvrées' },
  high_availability: { name: 'Haute disponibilité', description: 'Cluster HA' },
  si_integration: { name: 'Intégration SI', description: 'Intégration système' },
  support_24x7: { name: 'Support 24/7', description: 'Support permanent' },
  annual_audit: { name: 'Audit annuel', description: 'Audit de sécurité' },
  ppp_partnership: { name: 'Partenariat PPP', description: 'Partenariat public-privé' },
  local_employment: { name: 'Emplois locaux', description: 'Création d\'emplois' },
  national_training: { name: 'Programme national', description: 'Formation nationale' },
};

export function formatBytes(bytes: number | undefined | null): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return 'Sur mesure';
  if (bytes === -1) return 'Illimité';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatXAF(amount: number): string {
  if (amount === 0) return 'Gratuit';
  return new Intl.NumberFormat('fr-GA', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FirebaseBillingProvider({ children }: { children: ReactNode }) {
  const { user } = useFirebaseAuth();
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [usage, setUsage] = useState<UsageWithLimits | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const result = await getPlansFunc({});
      setPlans(result.data.plans);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    try {
      const result = await getSubscriptionFunc({});
      setSubscription(result.data.subscription);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Erreur lors du chargement de l\'abonnement');
    }
  }, [user]);

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setUsage(null);
      return;
    }

    try {
      const result = await getUsageFunc({});
      const usageData = result.data.usage;

      if (usageData && subscription?.plan) {
        const limits = subscription.plan;
        const usageWithLimits: UsageWithLimits = {
          ...usageData,
          storage_limit: limits.storage_bytes,
          documents_limit: limits.max_documents,
          ai_requests_limit: limits.ai_requests_per_day,
          storage_percentage: limits.storage_bytes === -1 ? 0 : (usageData.storage_bytes / limits.storage_bytes) * 100,
          documents_percentage: limits.max_documents === -1 ? 0 : (usageData.documents_count / limits.max_documents) * 100,
          ai_requests_percentage: limits.ai_requests_per_day === -1 ? 0 : (usageData.ai_requests_count / limits.ai_requests_per_day) * 100,
        };
        setUsage(usageWithLimits);
      }
    } catch (err) {
      console.error('Error fetching usage:', err);
    }
  }, [user, subscription]);

  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      return;
    }

    try {
      const result = await getInvoicesFunc({});
      setInvoices(result.data.invoices);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchPlans(), fetchSubscription()]);
      setIsLoading(false);
    };
    init();
  }, [fetchPlans, fetchSubscription]);

  useEffect(() => {
    if (subscription !== undefined) {
      fetchUsage();
      fetchInvoices();
    }
  }, [subscription, fetchUsage, fetchInvoices]);

  const subscribe = async (
    planId: string,
    paymentMethod: PaymentMethod,
    billingCycle: BillingCycle = 'monthly'
  ): Promise<{ success: boolean; error?: string; paymentUrl?: string }> => {
    if (!user) {
      return { success: false, error: 'Vous devez être connecté' };
    }

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        return { success: false, error: 'Plan non trouvé' };
      }

      // If free plan, create subscription directly
      if (plan.price_xaf === 0) {
        const result = await createSubscriptionFunc({ planId, billingCycle, paymentMethod });
        if (result.data.success) {
          await fetchSubscription();
          return { success: true };
        }
        return { success: false, error: 'Erreur lors de la création de l\'abonnement' };
      }

      // For paid plans, initiate payment based on method
      let paymentResult;

      if (paymentMethod.startsWith('mobile_money')) {
        // Use PayDunya for mobile money
        paymentResult = await initPayDunyaPaymentFunc({
          planId,
          billingCycle,
          returnUrl: `${window.location.origin}/billing?status=success`,
          cancelUrl: `${window.location.origin}/billing?status=canceled`,
        });

        // Handle demo mode for PayDunya
        if (paymentResult.data.success && paymentResult.data.demoMode) {
          console.log('PayDunya Demo mode detected - completing payment automatically');
          const demoResult = await completePayDunyaDemoPaymentFunc({
            transactionId: paymentResult.data.transactionId,
            planId,
            billingCycle,
          });

          if (demoResult.data.success) {
            await fetchSubscription();
            return { success: true };
          }
          return { success: false, error: 'Erreur lors de la validation du paiement démo PayDunya' };
        }
      } else {
        // Use Flutterwave for cards (default fallback)
        // Use Flutterwave for cards
        paymentResult = await initFlutterwavePaymentFunc({
          planId,
          billingCycle,
          paymentMethod,
          email: user.email || undefined,
          returnUrl: `${window.location.origin}/billing?status=success`,
        });

        // Handle demo mode for Flutterwave
        if (paymentResult.data.success && paymentResult.data.demoMode) {
          console.log('Flutterwave Demo mode detected - completing payment automatically');
          const demoResult = await completeFlutterwaveDemoPaymentFunc({
            planId,
            billingCycle,
          });

          if (demoResult.data.success) {
            await fetchSubscription();
            return { success: true };
          }
          return { success: false, error: 'Erreur lors de la validation du paiement démo Flutterwave' };
        }
      }

      if (paymentResult && paymentResult.data.success) {
        return {
          success: true,
          paymentUrl: paymentResult.data.paymentUrl,
        };
      }

      return { success: false, error: 'Erreur lors de l\'initialisation du paiement' };
    } catch (err) {
      console.error('Error subscribing:', err);
      return { success: false, error: 'Erreur lors de la souscription' };
    }
  };

  const cancelSubscription = async (immediate = false): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await cancelSubscriptionFunc({ immediate });
      if (result.data.success) {
        await fetchSubscription();
        return { success: true };
      }
      return { success: false, error: 'Erreur lors de l\'annulation' };
    } catch (err) {
      console.error('Error canceling subscription:', err);
      return { success: false, error: 'Erreur lors de l\'annulation' };
    }
  };

  const changePlan = async (newPlanId: string): Promise<{ success: boolean; error?: string }> => {
    return subscribe(newPlanId, subscription?.payment_method || 'mobile_money_mtn');
  };

  const reactivateSubscription = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await reactivateSubscriptionFunc({});
      if (result.data.success) {
        await fetchSubscription();
        return { success: true };
      }
      return { success: false, error: 'Erreur lors de la réactivation' };
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      return { success: false, error: 'Erreur lors de la réactivation' };
    }
  };

  const hasFeature = (feature: FeatureKey): boolean => {
    if (!subscription?.plan) return false;
    const features = subscription.plan.features || [];
    return features.includes(feature) || features.includes('all_features');
  };

  const canUseAI = (): boolean => {
    if (!subscription?.plan || !usage) return false;
    if (!hasFeature('ai_assistant') && !hasFeature('all_features')) return false;
    if (subscription.plan.ai_requests_per_day === -1) return true;
    return usage.ai_requests_count < subscription.plan.ai_requests_per_day;
  };

  const canUploadDocument = (): boolean => {
    if (!subscription?.plan || !usage) return false;
    if (subscription.plan.max_documents === -1) return true;
    return usage.documents_count < subscription.plan.max_documents;
  };

  const getStorageRemaining = (): number => {
    if (!subscription?.plan || !usage) return 0;
    if (subscription.plan.storage_bytes === -1) return Infinity;
    return Math.max(0, subscription.plan.storage_bytes - usage.storage_bytes);
  };

  const incrementAIUsage = async (): Promise<void> => {
    try {
      await incrementAIUsageFunc({});
      await fetchUsage();
    } catch (err) {
      console.error('Error incrementing AI usage:', err);
    }
  };

  const downloadInvoice = async (invoiceId: string): Promise<string | null> => {
    const invoice = invoices.find(i => i.id === invoiceId);
    return invoice?.pdf_url || null;
  };

  const value: BillingContextType = {
    subscription,
    usage,
    invoices,
    plans,
    isLoading,
    error,
    subscribe,
    cancelSubscription,
    changePlan,
    reactivateSubscription,
    hasFeature,
    canUseAI,
    canUploadDocument,
    getStorageRemaining,
    refreshUsage: fetchUsage,
    incrementAIUsage,
    refreshInvoices: fetchInvoices,
    downloadInvoice,
    refreshPlans: fetchPlans,
  };

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
}

export function useFirebaseBilling() {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useFirebaseBilling must be used within a FirebaseBillingProvider');
  }
  return context;
}

// Export as useBilling for compatibility
export const useBilling = useFirebaseBilling;
