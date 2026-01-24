-- =====================================================
-- DIGITALIUM DATABASE SCHEMA
-- For Google Cloud SQL PostgreSQL
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- App roles
CREATE TYPE app_role AS ENUM ('admin', 'user');

-- Plan types
CREATE TYPE plan_type AS ENUM ('personal', 'business', 'government');

-- Billing cycles
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly', 'perpetual');

-- Subscription statuses
CREATE TYPE subscription_status AS ENUM (
    'active',
    'trialing',
    'past_due',
    'canceled',
    'expired',
    'paused'
);

-- Invoice statuses
CREATE TYPE invoice_status AS ENUM (
    'draft',
    'pending',
    'paid',
    'overdue',
    'canceled',
    'refunded'
);

-- Payment methods
CREATE TYPE payment_method AS ENUM (
    'mobile_money_mtn',
    'mobile_money_airtel',
    'mobile_money_moov',
    'card',
    'bank_transfer',
    'cash'
);

-- License statuses
CREATE TYPE license_status AS ENUM (
    'active',
    'expired',
    'suspended',
    'pending_activation'
);

-- License types
CREATE TYPE license_type AS ENUM (
    'municipal',
    'ministerial',
    'national'
);

-- Deployment types
CREATE TYPE deployment_type AS ENUM (
    'cloud',
    'on_premise',
    'hybrid'
);

-- =====================================================
-- TABLES
-- =====================================================

-- User profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) UNIQUE NOT NULL, -- Firebase UID
    display_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- User roles
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    type plan_type NOT NULL DEFAULT 'business',
    logo_url TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Gabon',
    tax_id TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Organization members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id VARCHAR(128) NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, user_id)
);

-- Plans
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    type plan_type NOT NULL,
    billing_cycle billing_cycle NOT NULL,
    price_xaf INTEGER NOT NULL DEFAULT 0,
    price_yearly_xaf INTEGER,
    storage_bytes BIGINT NOT NULL DEFAULT 524288000,
    max_documents INTEGER NOT NULL DEFAULT 50,
    ai_requests_per_day INTEGER NOT NULL DEFAULT 5,
    max_users INTEGER NOT NULL DEFAULT 1,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_public BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    stripe_price_id TEXT,
    stripe_product_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    seats INTEGER DEFAULT 1,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    payment_method payment_method,
    payment_reference TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    user_id VARCHAR(128) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    number TEXT NOT NULL UNIQUE,
    status invoice_status NOT NULL DEFAULT 'draft',
    subtotal_xaf INTEGER NOT NULL DEFAULT 0,
    tax_xaf INTEGER NOT NULL DEFAULT 0,
    discount_xaf INTEGER NOT NULL DEFAULT 0,
    total_xaf INTEGER NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    issued_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_method payment_method,
    payment_reference TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    pdf_url TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_number ON invoices(number);

-- Licenses
CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    type license_type NOT NULL,
    status license_status NOT NULL DEFAULT 'pending_activation',
    license_key TEXT UNIQUE NOT NULL,
    contract_number TEXT,
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    activation_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    max_users INTEGER NOT NULL DEFAULT 50,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    deployment_type deployment_type NOT NULL DEFAULT 'cloud',
    deployment_url TEXT,
    maintenance_included BOOLEAN NOT NULL DEFAULT true,
    maintenance_expiry_date TIMESTAMP WITH TIME ZONE,
    base_price_xaf INTEGER,
    per_user_price_xaf INTEGER,
    total_price_xaf INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_licenses_org_id ON licenses(organization_id);

-- Usage tracking
CREATE TABLE usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id VARCHAR(128) NOT NULL,
    period TEXT NOT NULL,
    storage_bytes BIGINT NOT NULL DEFAULT 0,
    documents_count INTEGER NOT NULL DEFAULT 0,
    ai_requests_count INTEGER NOT NULL DEFAULT 0,
    api_calls_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, period)
);

CREATE INDEX idx_usage_user_period ON usage(user_id, period);

-- Payment transactions
CREATE TABLE payment_transactions (
    id VARCHAR(64) PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    user_id VARCHAR(128) NOT NULL,
    amount_xaf INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'XAF',
    payment_method payment_method NOT NULL,
    provider TEXT,
    provider_transaction_id TEXT,
    provider_reference TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    phone_number TEXT,
    provider_response JSONB,
    error_message TEXT,
    error_code TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_transactions_user ON payment_transactions(user_id);
CREATE INDEX idx_transactions_status ON payment_transactions(status);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'autre',
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_user_id ON documents(user_id);

-- Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    source TEXT DEFAULT 'contact_form',
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_updated_at BEFORE UPDATE ON usage
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA - DEFAULT PLANS
-- =====================================================

-- Personal Plans (B2C)
INSERT INTO plans (name, display_name, description, type, billing_cycle, price_xaf, price_yearly_xaf, storage_bytes, max_documents, ai_requests_per_day, max_users, features, is_active, is_public, sort_order) VALUES
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
INSERT INTO plans (name, display_name, description, type, billing_cycle, price_xaf, price_yearly_xaf, storage_bytes, max_documents, ai_requests_per_day, max_users, features, is_active, is_public, sort_order) VALUES
('team', 'Team', 'Pour les petites équipes', 'business', 'monthly', 8000, 80000, 53687091200, -1, -1, 10,
    ARRAY['scan', 'folders', 'basic_search', 'advanced_ocr', 'export_pdf', 'reminders', 'compiled_folders', 'sharing', 'priority_support', 'ai_assistant', 'team_workspaces', 'basic_workflows', 'analytics'],
    true, true, 5),

('business', 'Business', 'Pour les PME', 'business', 'monthly', 12000, 120000, 107374182400, -1, -1, 50,
    ARRAY['scan', 'folders', 'basic_search', 'advanced_ocr', 'export_pdf', 'reminders', 'compiled_folders', 'sharing', 'priority_support', 'ai_assistant', 'team_workspaces', 'advanced_workflows', 'analytics', 'api_access', 'sso_saml', 'dedicated_support'],
    true, true, 6),

('enterprise', 'Enterprise', 'Solution sur mesure', 'business', 'yearly', 0, 0, -1, -1, -1, -1,
    ARRAY['all_features', 'dedicated_deployment', 'sla_guarantee', 'onsite_training', 'account_manager', 'custom_integrations'],
    true, true, 7);

-- Government Plans (B2G)
INSERT INTO plans (name, display_name, description, type, billing_cycle, price_xaf, storage_bytes, max_documents, ai_requests_per_day, max_users, features, is_active, is_public, sort_order) VALUES
('municipal', 'Municipal', 'Pour les mairies et communes', 'government', 'perpetual', 5000000, -1, -1, -1, 100,
    ARRAY['all_features', 'on_premise', 'data_migration', 'initial_training', 'support_8x5'],
    true, false, 8),

('ministerial', 'Ministériel', 'Pour les ministères', 'government', 'perpetual', 25000000, -1, -1, -1, 500,
    ARRAY['all_features', 'on_premise', 'high_availability', 'si_integration', 'support_24x7', 'annual_audit'],
    true, false, 9),

('national', 'National', 'Programme national', 'government', 'perpetual', 0, -1, -1, -1, -1,
    ARRAY['all_features', 'ppp_partnership', 'local_employment', 'national_training'],
    true, false, 10);
