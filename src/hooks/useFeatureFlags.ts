import { useMemo } from 'react';
import { useBilling } from '@/contexts/FirebaseBillingContext';
import type { FeatureKey } from '@/types/billing';

/**
 * Hook for checking feature access based on subscription plan
 */
export function useFeatureFlags() {
  const { subscription, usage, hasFeature, canUseAI, canUploadDocument, getStorageRemaining } = useBilling();

  const flags = useMemo(() => {
    // Default flags for unauthenticated or free users
    const defaultFlags: Record<FeatureKey, boolean> = {
      scan: true,
      folders: true,
      basic_search: true,
      advanced_ocr: false,
      export_pdf: false,
      reminders: false,
      compiled_folders: false,
      sharing: false,
      priority_support: false,
      ai_assistant: false,
      family_sharing: false,
      team_workspaces: false,
      basic_workflows: false,
      advanced_workflows: false,
      analytics: false,
      api_access: false,
      sso_saml: false,
      dedicated_support: false,
      all_features: false,
      dedicated_deployment: false,
      sla_guarantee: false,
      onsite_training: false,
      account_manager: false,
      custom_integrations: false,
      on_premise: false,
      data_migration: false,
      initial_training: false,
      support_8x5: false,
      high_availability: false,
      si_integration: false,
      support_24x7: false,
      annual_audit: false,
      ppp_partnership: false,
      local_employment: false,
      national_training: false,
    };

    // If no subscription, return defaults
    if (!subscription?.plan?.features) {
      return defaultFlags;
    }

    // Check each feature
    const features = subscription.plan.features;
    const hasAllFeatures = features.includes('all_features');

    const computedFlags: Record<FeatureKey, boolean> = {} as Record<FeatureKey, boolean>;

    for (const key of Object.keys(defaultFlags) as FeatureKey[]) {
      computedFlags[key] = hasAllFeatures || features.includes(key) || defaultFlags[key];
    }

    return computedFlags;
  }, [subscription]);

  return {
    // Feature flags
    flags,

    // Helper methods
    hasFeature,
    canUseAI,
    canUploadDocument,
    getStorageRemaining,

    // Subscription info
    subscription,
    usage,

    // Plan info
    planName: subscription?.plan?.name || 'free',
    planDisplayName: subscription?.plan?.display_name || 'Gratuit',
    planType: subscription?.plan?.type || 'personal',

    // Quick checks
    isPremium: subscription?.plan?.name === 'premium' || subscription?.plan?.name === 'family',
    isBusiness: subscription?.plan?.type === 'business',
    isEnterprise: subscription?.plan?.name === 'enterprise',
    isFree: !subscription || subscription.plan?.name === 'free',
  };
}

/**
 * Higher-order component for feature-gated content
 */
export function withFeatureGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredFeature: FeatureKey,
  FallbackComponent?: React.ComponentType<P>
) {
  return function FeatureGatedComponent(props: P) {
    const { hasFeature } = useFeatureFlags();

    if (!hasFeature(requiredFeature)) {
      if (FallbackComponent) {
        return <FallbackComponent {...props} />;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
