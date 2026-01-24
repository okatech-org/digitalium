import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
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

// Feature definitions for display
export const FEATURE_DEFINITIONS: Record<FeatureKey, { name: string; description: string; icon?: string }> = {
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

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === -1) return 'Illimité';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format XAF currency
export function formatXAF(amount: number): string {
  if (amount === 0) return 'Gratuit';
  return new Intl.NumberFormat('fr-GA', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BillingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [usage, setUsage] = useState<UsageWithLimits | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's subscription
  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:plans(*)
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data && data.plan) {
        setSubscription({
          ...data,
          plan: data.plan as Plan,
        } as SubscriptionWithPlan);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Erreur lors du chargement de l\'abonnement');
    }
  }, [user]);

  // Fetch usage for current period
  const fetchUsage = useCallback(async () => {
    if (!user) {
      setUsage(null);
      return;
    }

    try {
      const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

      const { data, error } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', currentPeriod)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      const usageData = data || {
        id: '',
        subscription_id: subscription?.id || null,
        user_id: user.id,
        period: currentPeriod,
        storage_bytes: 0,
        documents_count: 0,
        ai_requests_count: 0,
        api_calls_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Calculate limits from subscription
      const limits = subscription?.plan || {
        storage_bytes: 524288000, // 500 MB default
        max_documents: 50,
        ai_requests_per_day: 5,
      };

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
    } catch (err) {
      console.error('Error fetching usage:', err);
    }
  }, [user, subscription]);

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setInvoices((data || []) as Invoice[]);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  }, [user]);

  // Fetch available plans
  const fetchPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPlans((data || []) as Plan[]);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  }, []);

  // Initialize billing data
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchPlans(),
        fetchSubscription(),
      ]);
      setIsLoading(false);
    };

    init();
  }, [fetchPlans, fetchSubscription]);

  // Fetch usage after subscription is loaded
  useEffect(() => {
    if (subscription !== undefined) {
      fetchUsage();
      fetchInvoices();
    }
  }, [subscription, fetchUsage, fetchInvoices]);

  // Subscribe to a plan
  const subscribe = async (
    planId: string,
    paymentMethod: PaymentMethod,
    billingCycle: BillingCycle = 'monthly'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Vous devez être connecté' };
    }

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        return { success: false, error: 'Plan non trouvé' };
      }

      // Calculate period end based on billing cycle
      const now = new Date();
      let periodEnd: Date;
      if (billingCycle === 'yearly') {
        periodEnd = new Date(now.setFullYear(now.getFullYear() + 1));
      } else if (billingCycle === 'monthly') {
        periodEnd = new Date(now.setMonth(now.getMonth() + 1));
      } else {
        periodEnd = new Date(now.setFullYear(now.getFullYear() + 100)); // Perpetual
      }

      // If user has existing subscription, cancel it first
      if (subscription) {
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled', canceled_at: new Date().toISOString() })
          .eq('id', subscription.id);
      }

      // Create new subscription
      const { data: newSub, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: plan.price_xaf === 0 ? 'active' : 'active', // For now, assume payment is processed
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (subError) throw subError;

      // Create invoice if plan is not free
      if (plan.price_xaf > 0) {
        const price = billingCycle === 'yearly' && plan.price_yearly_xaf
          ? plan.price_yearly_xaf
          : plan.price_xaf;

        const { error: invError } = await supabase
          .from('invoices')
          .insert({
            user_id: user.id,
            subscription_id: newSub.id,
            number: `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`,
            status: 'paid',
            subtotal_xaf: price,
            tax_xaf: 0,
            discount_xaf: 0,
            total_xaf: price,
            issued_at: new Date().toISOString(),
            paid_at: new Date().toISOString(),
            payment_method: paymentMethod,
            items: [{
              description: `Abonnement ${plan.display_name} (${billingCycle === 'yearly' ? 'annuel' : 'mensuel'})`,
              quantity: 1,
              unit_price: price,
            }],
          });

        if (invError) console.error('Error creating invoice:', invError);
      }

      // Refresh subscription data
      await fetchSubscription();
      await fetchInvoices();

      return { success: true };
    } catch (err) {
      console.error('Error subscribing:', err);
      return { success: false, error: 'Erreur lors de la souscription' };
    }
  };

  // Cancel subscription
  const cancelSubscription = async (immediate = false): Promise<{ success: boolean; error?: string }> => {
    if (!subscription) {
      return { success: false, error: 'Aucun abonnement actif' };
    }

    try {
      const updateData = immediate
        ? { status: 'canceled' as const, canceled_at: new Date().toISOString() }
        : { cancel_at_period_end: true };

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscription.id);

      if (error) throw error;

      await fetchSubscription();
      return { success: true };
    } catch (err) {
      console.error('Error canceling subscription:', err);
      return { success: false, error: 'Erreur lors de l\'annulation' };
    }
  };

  // Change plan
  const changePlan = async (newPlanId: string): Promise<{ success: boolean; error?: string }> => {
    // For now, just create a new subscription
    return subscribe(newPlanId, subscription?.payment_method || 'mobile_money_mtn');
  };

  // Reactivate canceled subscription
  const reactivateSubscription = async (): Promise<{ success: boolean; error?: string }> => {
    if (!subscription || !subscription.cancel_at_period_end) {
      return { success: false, error: 'Aucun abonnement à réactiver' };
    }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: false })
        .eq('id', subscription.id);

      if (error) throw error;

      await fetchSubscription();
      return { success: true };
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      return { success: false, error: 'Erreur lors de la réactivation' };
    }
  };

  // Check if user has a specific feature
  const hasFeature = (feature: FeatureKey): boolean => {
    if (!subscription?.plan) return false;
    const features = subscription.plan.features || [];
    return features.includes(feature) || features.includes('all_features');
  };

  // Check if user can use AI (based on daily limit)
  const canUseAI = (): boolean => {
    if (!subscription?.plan || !usage) return false;
    if (!hasFeature('ai_assistant') && !hasFeature('all_features')) return false;
    if (subscription.plan.ai_requests_per_day === -1) return true;
    return usage.ai_requests_count < subscription.plan.ai_requests_per_day;
  };

  // Check if user can upload a document
  const canUploadDocument = (): boolean => {
    if (!subscription?.plan || !usage) return false;
    if (subscription.plan.max_documents === -1) return true;
    return usage.documents_count < subscription.plan.max_documents;
  };

  // Get remaining storage in bytes
  const getStorageRemaining = (): number => {
    if (!subscription?.plan || !usage) return 0;
    if (subscription.plan.storage_bytes === -1) return Infinity;
    return Math.max(0, subscription.plan.storage_bytes - usage.storage_bytes);
  };

  // Increment AI usage
  const incrementAIUsage = async (): Promise<void> => {
    if (!user || !usage) return;

    try {
      const currentPeriod = new Date().toISOString().slice(0, 7);

      await supabase
        .from('usage')
        .upsert({
          user_id: user.id,
          period: currentPeriod,
          ai_requests_count: usage.ai_requests_count + 1,
          storage_bytes: usage.storage_bytes,
          documents_count: usage.documents_count,
          api_calls_count: usage.api_calls_count,
        }, {
          onConflict: 'user_id,period',
        });

      await fetchUsage();
    } catch (err) {
      console.error('Error incrementing AI usage:', err);
    }
  };

  // Download invoice PDF
  const downloadInvoice = async (invoiceId: string): Promise<string | null> => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice?.pdf_url) {
      return invoice.pdf_url;
    }
    // TODO: Generate PDF if not exists
    return null;
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

export function useBilling() {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
}
