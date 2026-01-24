-- =====================================================
-- DIGITALIUM BILLING SYSTEM MIGRATION
-- =====================================================
-- This migration creates the complete billing infrastructure:
-- - Plans (subscription plans with features/limits)
-- - Subscriptions (user subscriptions)
-- - Invoices (payment records)
-- - Licenses (for institutional perpetual licenses)
-- - Usage tracking (for metered billing)
-- - Organizations (for B2B/B2G accounts)
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

-- Plan types: personal (B2C), business (B2B), government (B2G)
CREATE TYPE public.plan_type AS ENUM ('personal', 'business', 'government');

-- Billing cycles
CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'yearly', 'perpetual');

-- Subscription statuses
CREATE TYPE public.subscription_status AS ENUM (
    'active',
    'trialing',
    'past_due',
    'canceled',
    'expired',
    'paused'
);

-- Invoice statuses
CREATE TYPE public.invoice_status AS ENUM (
    'draft',
    'pending',
    'paid',
    'overdue',
    'canceled',
    'refunded'
);

-- Payment methods
CREATE TYPE public.payment_method AS ENUM (
    'mobile_money_mtn',
    'mobile_money_airtel',
    'mobile_money_moov',
    'card',
    'bank_transfer',
    'cash'
);

-- License statuses
CREATE TYPE public.license_status AS ENUM (
    'active',
    'expired',
    'suspended',
    'pending_activation'
);

-- License types for institutions
CREATE TYPE public.license_type AS ENUM (
    'municipal',
    'ministerial',
    'national'
);

-- Deployment types
CREATE TYPE public.deployment_type AS ENUM (
    'cloud',
    'on_premise',
    'hybrid'
);

-- =====================================================
-- ORGANIZATIONS TABLE (for B2B and B2G)
-- =====================================================

CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    type plan_type NOT NULL DEFAULT 'business',
    logo_url TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Gabon',
    tax_id TEXT, -- NIF/Numéro fiscal
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organization members junction table
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PLANS TABLE
-- =====================================================

CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- "free", "starter", "premium", "team", "business", etc.
    display_name TEXT NOT NULL, -- "Gratuit", "Starter", "Premium"
    description TEXT,
    type plan_type NOT NULL,
    billing_cycle billing_cycle NOT NULL,
    price_xaf INTEGER NOT NULL DEFAULT 0, -- Price in XAF (FCFA)
    price_yearly_xaf INTEGER, -- Annual price (if applicable)

    -- Feature limits
    storage_bytes BIGINT NOT NULL DEFAULT 524288000, -- 500 MB default
    max_documents INTEGER NOT NULL DEFAULT 50,
    ai_requests_per_day INTEGER NOT NULL DEFAULT 5,
    max_users INTEGER NOT NULL DEFAULT 1,

    -- Feature flags (JSON array of feature keys)
    features TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Visibility and status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_public BOOLEAN NOT NULL DEFAULT true, -- Show on pricing page
    sort_order INTEGER NOT NULL DEFAULT 0,

    -- Stripe/Payment provider IDs (for future integration)
    stripe_price_id TEXT,
    stripe_product_id TEXT,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.plans(id) NOT NULL,

    status subscription_status NOT NULL DEFAULT 'active',

    -- Billing period
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Trial information
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,

    -- Cancellation
    canceled_at TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,

    -- For team/business plans
    seats INTEGER DEFAULT 1,

    -- Payment provider references
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,

    -- Payment method used
    payment_method payment_method,
    payment_reference TEXT, -- Mobile money transaction ID, etc.

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Index for quick lookups
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_org_id ON public.subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- =====================================================
-- INVOICES TABLE
-- =====================================================

CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- Invoice details
    number TEXT NOT NULL UNIQUE, -- "INV-2026-00001"
    status invoice_status NOT NULL DEFAULT 'draft',

    -- Amounts (all in XAF)
    subtotal_xaf INTEGER NOT NULL DEFAULT 0,
    tax_xaf INTEGER NOT NULL DEFAULT 0,
    discount_xaf INTEGER NOT NULL DEFAULT 0,
    total_xaf INTEGER NOT NULL DEFAULT 0,

    -- Tax information
    tax_rate DECIMAL(5,2) DEFAULT 0, -- VAT percentage

    -- Dates
    issued_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,

    -- Payment details
    payment_method payment_method,
    payment_reference TEXT,

    -- Line items stored as JSON
    items JSONB NOT NULL DEFAULT '[]',
    -- Example: [{"description": "Abonnement Premium", "quantity": 1, "unit_price": 3500}]

    -- PDF storage
    pdf_url TEXT,

    -- Notes
    notes TEXT,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_org_id ON public.invoices(organization_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_number ON public.invoices(number);

-- =====================================================
-- LICENSES TABLE (for institutional perpetual licenses)
-- =====================================================

CREATE TABLE public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,

    type license_type NOT NULL,
    status license_status NOT NULL DEFAULT 'pending_activation',

    -- License details
    license_key TEXT UNIQUE NOT NULL,
    contract_number TEXT,

    -- Dates
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    activation_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE, -- null = perpetual

    -- Capacity
    max_users INTEGER NOT NULL DEFAULT 50,

    -- Features included
    features TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Deployment
    deployment_type deployment_type NOT NULL DEFAULT 'cloud',
    deployment_url TEXT, -- For on-premise installations

    -- Maintenance
    maintenance_included BOOLEAN NOT NULL DEFAULT true,
    maintenance_expiry_date TIMESTAMP WITH TIME ZONE,

    -- Pricing (for records)
    base_price_xaf INTEGER,
    per_user_price_xaf INTEGER,
    total_price_xaf INTEGER,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_licenses_org_id ON public.licenses(organization_id);
CREATE INDEX idx_licenses_status ON public.licenses(status);
CREATE INDEX idx_licenses_key ON public.licenses(license_key);

-- =====================================================
-- USAGE TRACKING TABLE
-- =====================================================

CREATE TABLE public.usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Period (YYYY-MM format)
    period TEXT NOT NULL,

    -- Usage metrics
    storage_bytes BIGINT NOT NULL DEFAULT 0,
    documents_count INTEGER NOT NULL DEFAULT 0,
    ai_requests_count INTEGER NOT NULL DEFAULT 0,
    api_calls_count INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    UNIQUE (user_id, period)
);

ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_usage_subscription ON public.usage(subscription_id);
CREATE INDEX idx_usage_user_period ON public.usage(user_id, period);

-- =====================================================
-- PAYMENT TRANSACTIONS TABLE (for audit trail)
-- =====================================================

CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Transaction details
    amount_xaf INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'XAF',

    -- Payment method
    payment_method payment_method NOT NULL,
    provider TEXT, -- "paydunya", "flutterwave", "cinetpay"
    provider_transaction_id TEXT,
    provider_reference TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded

    -- Phone number for mobile money
    phone_number TEXT,

    -- Response from provider
    provider_response JSONB,

    -- Error details if failed
    error_message TEXT,
    error_code TEXT,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_transactions_user ON public.payment_transactions(user_id);
CREATE INDEX idx_transactions_invoice ON public.payment_transactions(invoice_id);
CREATE INDEX idx_transactions_status ON public.payment_transactions(status);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Organizations policies
CREATE POLICY "Users can view their organizations"
ON public.organizations FOR SELECT
USING (
    id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Organization owners can update"
ON public.organizations FOR UPDATE
USING (
    id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "Admins can view all organizations"
ON public.organizations FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all organizations"
ON public.organizations FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Organization members policies
CREATE POLICY "Members can view their organization members"
ON public.organization_members FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage organization members"
ON public.organization_members FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Plans policies (public read, admin write)
CREATE POLICY "Anyone can view active public plans"
ON public.plans FOR SELECT
USING (is_active = true AND is_public = true);

CREATE POLICY "Admins can manage plans"
ON public.plans FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can view organization subscriptions"
ON public.subscriptions FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all subscriptions"
ON public.subscriptions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Invoices policies
CREATE POLICY "Users can view their own invoices"
ON public.invoices FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can view organization invoices"
ON public.invoices FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all invoices"
ON public.invoices FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Licenses policies
CREATE POLICY "Organization members can view their licenses"
ON public.licenses FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all licenses"
ON public.licenses FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Usage policies
CREATE POLICY "Users can view their own usage"
ON public.usage FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all usage"
ON public.usage FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Payment transactions policies
CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all transactions"
ON public.payment_transactions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
BEFORE UPDATE ON public.licenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usage_updated_at
BEFORE UPDATE ON public.usage
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    new_number TEXT;
BEGIN
    year_part := to_char(now(), 'YYYY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(number FROM 'INV-\d{4}-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM public.invoices
    WHERE number LIKE 'INV-' || year_part || '-%';

    new_number := 'INV-' || year_part || '-' || LPAD(sequence_num::TEXT, 5, '0');
    RETURN new_number;
END;
$$;

-- Generate license key
CREATE OR REPLACE FUNCTION public.generate_license_key()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    key_parts TEXT[];
    i INTEGER;
BEGIN
    FOR i IN 1..4 LOOP
        key_parts[i] := upper(substr(md5(random()::text), 1, 4));
    END LOOP;
    RETURN 'DIG-' || array_to_string(key_parts, '-');
END;
$$;

-- Get user's current subscription with plan details
CREATE OR REPLACE FUNCTION public.get_user_subscription(p_user_id UUID)
RETURNS TABLE (
    subscription_id UUID,
    plan_name TEXT,
    plan_display_name TEXT,
    plan_type plan_type,
    status subscription_status,
    current_period_end TIMESTAMP WITH TIME ZONE,
    storage_bytes BIGINT,
    max_documents INTEGER,
    ai_requests_per_day INTEGER,
    features TEXT[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        s.id as subscription_id,
        p.name as plan_name,
        p.display_name as plan_display_name,
        p.type as plan_type,
        s.status,
        s.current_period_end,
        p.storage_bytes,
        p.max_documents,
        p.ai_requests_per_day,
        p.features
    FROM public.subscriptions s
    JOIN public.plans p ON s.plan_id = p.id
    WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;
$$;

-- Get user's current period usage
CREATE OR REPLACE FUNCTION public.get_user_usage(p_user_id UUID)
RETURNS TABLE (
    storage_bytes BIGINT,
    documents_count INTEGER,
    ai_requests_count INTEGER,
    period TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        u.storage_bytes,
        u.documents_count,
        u.ai_requests_count,
        u.period
    FROM public.usage u
    WHERE u.user_id = p_user_id
    AND u.period = to_char(now(), 'YYYY-MM')
    LIMIT 1;
$$;

-- Check if user has feature access
CREATE OR REPLACE FUNCTION public.user_has_feature(p_user_id UUID, p_feature TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.subscriptions s
        JOIN public.plans p ON s.plan_id = p.id
        WHERE s.user_id = p_user_id
        AND s.status IN ('active', 'trialing')
        AND p_feature = ANY(p.features)
    );
$$;

-- =====================================================
-- SEED DEFAULT PLANS
-- =====================================================

-- Personal Plans (B2C)
INSERT INTO public.plans (name, display_name, description, type, billing_cycle, price_xaf, price_yearly_xaf, storage_bytes, max_documents, ai_requests_per_day, max_users, features, is_active, is_public, sort_order) VALUES
('free', 'Gratuit', 'Pour commencer avec DIGITALIUM', 'personal', 'monthly', 0, 0, 524288000, 50, 5, 1,
    ARRAY['scan', 'folders', 'basic_search'],
    true, true, 1),

('starter', 'Starter', 'Pour les utilisateurs actifs', 'personal', 'monthly', 1500, 15000, 5368709120, 500, 50, 1,
    ARRAY['scan', 'folders', 'basic_search', 'advanced_ocr', 'export_pdf', 'reminders'],
    true, true, 2),

('premium', 'Premium', 'La solution complète', 'personal', 'monthly', 3500, 35000, 26843545600, -1, -1, 1,
    ARRAY['scan', 'folders', 'basic_search', 'advanced_ocr', 'export_pdf', 'reminders', 'compiled_folders', 'sharing', 'priority_support', 'ai_assistant'],
    true, true, 3),

('family', 'Famille', 'Pour toute la famille', 'personal', 'monthly', 6000, 60000, 107374182400, -1, -1, 5,
    ARRAY['scan', 'folders', 'basic_search', 'advanced_ocr', 'export_pdf', 'reminders', 'compiled_folders', 'sharing', 'priority_support', 'ai_assistant', 'family_sharing'],
    true, true, 4);

-- Business Plans (B2B)
INSERT INTO public.plans (name, display_name, description, type, billing_cycle, price_xaf, price_yearly_xaf, storage_bytes, max_documents, ai_requests_per_day, max_users, features, is_active, is_public, sort_order) VALUES
('team', 'Team', 'Pour les petites équipes', 'business', 'monthly', 8000, 80000, 53687091200, -1, -1, 10,
    ARRAY['scan', 'folders', 'basic_search', 'advanced_ocr', 'export_pdf', 'reminders', 'compiled_folders', 'sharing', 'priority_support', 'ai_assistant', 'team_workspaces', 'basic_workflows', 'analytics'],
    true, true, 5),

('business', 'Business', 'Pour les PME', 'business', 'monthly', 12000, 120000, 107374182400, -1, -1, 50,
    ARRAY['scan', 'folders', 'basic_search', 'advanced_ocr', 'export_pdf', 'reminders', 'compiled_folders', 'sharing', 'priority_support', 'ai_assistant', 'team_workspaces', 'advanced_workflows', 'analytics', 'api_access', 'sso_saml', 'dedicated_support'],
    true, true, 6),

('enterprise', 'Enterprise', 'Solution sur mesure', 'business', 'yearly', 0, 0, -1, -1, -1, -1,
    ARRAY['all_features', 'dedicated_deployment', 'sla_guarantee', 'onsite_training', 'account_manager', 'custom_integrations'],
    true, true, 7);

-- Government Plans (B2G) - Perpetual licenses
INSERT INTO public.plans (name, display_name, description, type, billing_cycle, price_xaf, storage_bytes, max_documents, ai_requests_per_day, max_users, features, is_active, is_public, sort_order) VALUES
('municipal', 'Municipal', 'Pour les mairies et communes', 'government', 'perpetual', 5000000, -1, -1, -1, 100,
    ARRAY['all_features', 'on_premise', 'data_migration', 'initial_training', 'support_8x5'],
    true, false, 8),

('ministerial', 'Ministériel', 'Pour les ministères', 'government', 'perpetual', 25000000, -1, -1, -1, 500,
    ARRAY['all_features', 'on_premise', 'high_availability', 'si_integration', 'support_24x7', 'annual_audit'],
    true, false, 9),

('national', 'National', 'Programme national', 'government', 'perpetual', 0, -1, -1, -1, -1,
    ARRAY['all_features', 'ppp_partnership', 'local_employment', 'national_training'],
    true, false, 10);

-- =====================================================
-- AUTO-CREATE FREE SUBSCRIPTION FOR NEW USERS
-- =====================================================

-- Modify the handle_new_user function to also create a free subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    free_plan_id UUID;
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');

    -- Assign role
    IF NEW.email = 'admin@digitalium.ma' THEN
        INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
    ELSE
        INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
    END IF;

    -- Get free plan ID
    SELECT id INTO free_plan_id
    FROM public.plans
    WHERE name = 'free' AND type = 'personal' AND is_active = true
    LIMIT 1;

    -- Create free subscription if plan exists
    IF free_plan_id IS NOT NULL THEN
        INSERT INTO public.subscriptions (
            user_id,
            plan_id,
            status,
            current_period_start,
            current_period_end
        ) VALUES (
            NEW.id,
            free_plan_id,
            'active',
            now(),
            now() + interval '100 years' -- Free plan never expires
        );

        -- Initialize usage tracking
        INSERT INTO public.usage (user_id, period)
        VALUES (NEW.id, to_char(now(), 'YYYY-MM'));
    END IF;

    RETURN NEW;
END;
$$;
