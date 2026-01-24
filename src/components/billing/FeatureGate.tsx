import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { FEATURE_DEFINITIONS } from '@/contexts/FirebaseBillingContext';
import type { FeatureKey } from '@/types/billing';

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  /**
   * What to show when the feature is locked
   * - 'hide': Don't render anything
   * - 'blur': Show blurred content with upgrade prompt
   * - 'card': Show a card with upgrade prompt
   * - 'inline': Show inline upgrade prompt
   */
  fallback?: 'hide' | 'blur' | 'card' | 'inline';
  /**
   * Custom fallback component
   */
  customFallback?: ReactNode;
  /**
   * Additional class names
   */
  className?: string;
}

export function FeatureGate({
  feature,
  children,
  fallback = 'hide',
  customFallback,
  className,
}: FeatureGateProps) {
  const navigate = useNavigate();
  const { hasFeature, planDisplayName } = useFeatureFlags();
  const featureInfo = FEATURE_DEFINITIONS[feature];

  // If feature is available, render children
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // Custom fallback
  if (customFallback) {
    return <>{customFallback}</>;
  }

  // Fallback based on type
  switch (fallback) {
    case 'hide':
      return null;

    case 'blur':
      return (
        <div className={`relative ${className || ''}`}>
          <div className="blur-sm pointer-events-none select-none">{children}</div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <div className="text-center p-4">
              <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                {featureInfo?.name || feature}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Non disponible avec le plan {planDisplayName}
              </p>
              <Button size="sm" onClick={() => navigate('/pricing')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Mettre à niveau
              </Button>
            </div>
          </div>
        </div>
      );

    case 'card':
      return (
        <Card className={`border-dashed ${className || ''}`}>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-medium mb-1">{featureInfo?.name || feature}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {featureInfo?.description ||
                'Cette fonctionnalité nécessite un abonnement supérieur'}
            </p>
            <Button onClick={() => navigate('/pricing')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Voir les plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      );

    case 'inline':
      return (
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm ${className || ''}`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{featureInfo?.name || feature}</span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-primary"
            onClick={() => navigate('/pricing')}
          >
            Débloquer
          </Button>
        </div>
      );

    default:
      return null;
  }
}

/**
 * Badge component to show feature availability
 */
export function FeatureBadge({ feature }: { feature: FeatureKey }) {
  const { hasFeature } = useFeatureFlags();
  const featureInfo = FEATURE_DEFINITIONS[feature];
  const available = hasFeature(feature);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        available
          ? 'bg-green-500/10 text-green-500'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {available ? (
        <Sparkles className="w-3 h-3" />
      ) : (
        <Lock className="w-3 h-3" />
      )}
      {featureInfo?.name || feature}
    </span>
  );
}

/**
 * Wrapper to check AI usage limits
 */
interface AIGateProps {
  children: ReactNode;
  onLimitReached?: () => void;
}

export function AIGate({ children, onLimitReached }: AIGateProps) {
  const navigate = useNavigate();
  const { canUseAI, hasFeature, usage } = useFeatureFlags();

  // Check if user has AI feature
  if (!hasFeature('ai_assistant')) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-medium mb-1">Assistant IA</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            Accédez à l'assistant IA intelligent pour vous aider avec vos documents
          </p>
          <Button onClick={() => navigate('/pricing')}>
            <Sparkles className="w-4 h-4 mr-2" />
            Activer l'IA
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check if user has reached daily limit
  if (!canUseAI()) {
    return (
      <Card className="border-dashed border-yellow-500/50">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <h3 className="font-medium mb-1">Limite atteinte</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            Vous avez atteint votre limite de {usage?.ai_requests_limit} requêtes IA par jour.
            Revenez demain ou passez à un plan supérieur.
          </p>
          <Button onClick={() => navigate('/pricing')}>
            <Sparkles className="w-4 h-4 mr-2" />
            Plus de requêtes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

/**
 * Usage limit indicator
 */
export function UsageLimitIndicator() {
  const { usage, subscription } = useFeatureFlags();

  if (!usage || !subscription?.plan) return null;

  const { ai_requests_count, ai_requests_limit } = usage;

  if (ai_requests_limit === -1) {
    return (
      <span className="text-xs text-muted-foreground">
        Requêtes IA illimitées
      </span>
    );
  }

  const remaining = ai_requests_limit - ai_requests_count;
  const percentage = (ai_requests_count / ai_requests_limit) * 100;

  return (
    <span
      className={`text-xs ${
        percentage > 80 ? 'text-yellow-500' : 'text-muted-foreground'
      }`}
    >
      {remaining} requêtes IA restantes aujourd'hui
    </span>
  );
}
