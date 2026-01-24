// =====================================================
// DIGITALIUM BILLING TYPES
// =====================================================

// Enums matching database types
export type PlanType = 'personal' | 'business' | 'government' | 'institution';
export type BillingCycle = 'monthly' | 'yearly' | 'perpetual';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired' | 'paused';
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'canceled' | 'refunded';
export type PaymentMethod = 'mobile_money_mtn' | 'mobile_money_airtel' | 'mobile_money_moov' | 'card' | 'bank_transfer' | 'cash';
export type LicenseStatus = 'active' | 'expired' | 'suspended' | 'pending_activation';
export type LicenseType = 'municipal' | 'ministerial' | 'national';
export type DeploymentType = 'cloud' | 'on_premise' | 'hybrid';

// =====================================================
// PLAN
// =====================================================

export interface Plan {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  type: PlanType;
  billing_cycle: BillingCycle;
  price_xaf: number;
  price_yearly_xaf: number | null;
  storage_bytes: number;
  max_documents: number;
  ai_requests_per_day: number;
  max_users: number;
  features: string[];
  is_active: boolean;
  is_public: boolean;
  sort_order: number;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PlanWithPricing extends Plan {
  monthly_price: number;
  yearly_price: number;
  yearly_savings: number;
  price_per_user?: number;
}

// =====================================================
// SUBSCRIPTION
// =====================================================

export interface Subscription {
  id: string;
  user_id: string;
  organization_id: string | null;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  canceled_at: string | null;
  cancel_at_period_end: boolean;
  seats: number | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  payment_method: PaymentMethod | null;
  payment_reference: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithPlan extends Subscription {
  plan: Plan;
}

// =====================================================
// INVOICE
// =====================================================

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
}

export interface Invoice {
  id: string;
  subscription_id: string | null;
  user_id: string;
  organization_id: string | null;
  number: string;
  status: InvoiceStatus;
  subtotal_xaf: number;
  tax_xaf: number;
  discount_xaf: number;
  total_xaf: number;
  tax_rate: number;
  issued_at: string | null;
  due_date: string | null;
  paid_at: string | null;
  payment_method: PaymentMethod | null;
  payment_reference: string | null;
  items: InvoiceItem[];
  pdf_url: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// =====================================================
// ORGANIZATION
// =====================================================

export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  type: PlanType;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  country: string;
  tax_id: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

// =====================================================
// LICENSE
// =====================================================

export interface License {
  id: string;
  organization_id: string;
  type: LicenseType;
  status: LicenseStatus;
  license_key: string;
  contract_number: string | null;
  purchase_date: string;
  activation_date: string | null;
  expiry_date: string | null;
  max_users: number;
  features: string[];
  deployment_type: DeploymentType;
  deployment_url: string | null;
  maintenance_included: boolean;
  maintenance_expiry_date: string | null;
  base_price_xaf: number | null;
  per_user_price_xaf: number | null;
  total_price_xaf: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// =====================================================
// USAGE
// =====================================================

export interface Usage {
  id: string;
  subscription_id: string | null;
  user_id: string;
  period: string;
  storage_bytes: number;
  documents_count: number;
  ai_requests_count: number;
  api_calls_count: number;
  created_at: string;
  updated_at: string;
}

export interface UsageWithLimits extends Usage {
  storage_limit: number;
  documents_limit: number;
  ai_requests_limit: number;
  storage_percentage: number;
  documents_percentage: number;
  ai_requests_percentage: number;
}

// =====================================================
// PAYMENT TRANSACTION
// =====================================================

export interface PaymentTransaction {
  id: string;
  invoice_id: string | null;
  subscription_id: string | null;
  user_id: string;
  amount_xaf: number;
  currency: string;
  payment_method: PaymentMethod;
  provider: string | null;
  provider_transaction_id: string | null;
  provider_reference: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  phone_number: string | null;
  provider_response: Record<string, unknown> | null;
  error_message: string | null;
  error_code: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
}

// =====================================================
// FEATURE FLAGS
// =====================================================

export type FeatureKey =
  | 'scan'
  | 'folders'
  | 'basic_search'
  | 'advanced_ocr'
  | 'export_pdf'
  | 'reminders'
  | 'compiled_folders'
  | 'sharing'
  | 'priority_support'
  | 'ai_assistant'
  | 'family_sharing'
  | 'team_workspaces'
  | 'basic_workflows'
  | 'advanced_workflows'
  | 'analytics'
  | 'api_access'
  | 'sso_saml'
  | 'dedicated_support'
  | 'all_features'
  | 'dedicated_deployment'
  | 'sla_guarantee'
  | 'onsite_training'
  | 'account_manager'
  | 'custom_integrations'
  | 'on_premise'
  | 'data_migration'
  | 'initial_training'
  | 'support_8x5'
  | 'high_availability'
  | 'si_integration'
  | 'support_24x7'
  | 'annual_audit'
  | 'ppp_partnership'
  | 'local_employment'
  | 'national_training';

export interface FeatureDefinition {
  key: FeatureKey;
  name: string;
  description: string;
  icon?: string;
  category: 'core' | 'ai' | 'collaboration' | 'enterprise' | 'support';
}

// =====================================================
// BILLING CONTEXT TYPES
// =====================================================

export interface BillingState {
  subscription: SubscriptionWithPlan | null;
  usage: UsageWithLimits | null;
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
}

export interface BillingContextType extends BillingState {
  // Subscription management
  subscribe: (planId: string, paymentMethod: PaymentMethod, billingCycle?: BillingCycle) => Promise<{ success: boolean; error?: string }>;
  cancelSubscription: (immediate?: boolean) => Promise<{ success: boolean; error?: string }>;
  changePlan: (newPlanId: string) => Promise<{ success: boolean; error?: string }>;
  reactivateSubscription: () => Promise<{ success: boolean; error?: string }>;

  // Feature access
  hasFeature: (feature: FeatureKey) => boolean;
  canUseAI: () => boolean;
  canUploadDocument: () => boolean;
  getStorageRemaining: () => number;

  // Usage tracking
  refreshUsage: () => Promise<void>;
  incrementAIUsage: () => Promise<void>;

  // Invoices
  refreshInvoices: () => Promise<void>;
  downloadInvoice: (invoiceId: string) => Promise<string | null>;

  // Plans
  plans: Plan[];
  refreshPlans: () => Promise<void>;
}

// =====================================================
// PRICING DISPLAY HELPERS
// =====================================================

export interface PricingTier {
  plan: Plan;
  isPopular?: boolean;
  isCurrent?: boolean;
  ctaText: string;
  ctaDisabled?: boolean;
}

export interface PricingPageProps {
  tiers: PricingTier[];
  billingCycle: BillingCycle;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  onSelectPlan: (planId: string) => void;
  currentPlanId?: string;
}

// =====================================================
// CHECKOUT TYPES
// =====================================================

export interface CheckoutFormData {
  planId: string;
  billingCycle: BillingCycle;
  paymentMethod: PaymentMethod;
  phoneNumber?: string; // For mobile money
  promoCode?: string;
}

export interface CheckoutResult {
  success: boolean;
  subscriptionId?: string;
  invoiceId?: string;
  paymentUrl?: string; // For redirect-based payments
  error?: string;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface BillingApiResponse<T> {
  data: T | null;
  error: string | null;
  status: 'success' | 'error';
}

export interface InitiatePaymentRequest {
  plan_id: string;
  billing_cycle: BillingCycle;
  payment_method: PaymentMethod;
  phone_number?: string;
  return_url?: string;
}

export interface InitiatePaymentResponse {
  transaction_id: string;
  payment_url?: string;
  status: 'pending' | 'requires_action';
  instructions?: string;
}

export interface VerifyPaymentRequest {
  transaction_id: string;
  provider_reference?: string;
}

export interface VerifyPaymentResponse {
  status: 'completed' | 'pending' | 'failed';
  subscription_id?: string;
  invoice_id?: string;
  error?: string;
}
