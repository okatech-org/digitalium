-- =====================================================
-- MIGRATION 001: RBAC Hiérarchique & Multi-Tenancy
-- Digitalium - Système de rôles à 6 niveaux
-- =====================================================

-- =====================================================
-- 1. NOUVEAU ENUM DE RÔLES HIÉRARCHIQUES
-- =====================================================

-- Créer le nouveau type de rôle (sans toucher l'ancien pour la rétrocompatibilité)
CREATE TYPE platform_role AS ENUM (
    'system_admin',      -- Niveau 0 : Admin Système (infrastructure, sécurité, maintenance)
    'platform_admin',    -- Niveau 1 : Admin Plateforme (Ornella - crée les clients, configure)
    'org_admin',         -- Niveau 2 : Admin Organisation (DG d'ASCOMA, Ministre)
    'org_manager',       -- Niveau 3 : Manager dans l'organisation (Chef de service)
    'org_member',        -- Niveau 4 : Membre standard (employé, agent)
    'org_viewer'         -- Niveau 5 : Lecture seule (auditeur, consultant)
);

-- =====================================================
-- 2. TABLE DE RÔLES ÉTENDUE (remplace user_roles)
-- =====================================================

CREATE TABLE user_platform_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) NOT NULL,
    role platform_role NOT NULL DEFAULT 'org_member',
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    -- system_admin et platform_admin n'ont PAS d'organization_id (rôles globaux)
    -- org_admin, org_manager, org_member, org_viewer DOIVENT avoir un organization_id
    granted_by VARCHAR(128),           -- UID de celui qui a attribué le rôle
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Null = permanent
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Un utilisateur ne peut avoir qu'un seul rôle par organisation
    UNIQUE (user_id, organization_id),

    -- Contrainte : les rôles org_* doivent avoir un organization_id
    CONSTRAINT chk_org_role_needs_org CHECK (
        (role IN ('system_admin', 'platform_admin') AND organization_id IS NULL)
        OR
        (role NOT IN ('system_admin', 'platform_admin') AND organization_id IS NOT NULL)
    )
);

CREATE INDEX idx_upr_user_id ON user_platform_roles(user_id);
CREATE INDEX idx_upr_org_id ON user_platform_roles(organization_id);
CREATE INDEX idx_upr_role ON user_platform_roles(role);
CREATE INDEX idx_upr_user_org ON user_platform_roles(user_id, organization_id);

-- =====================================================
-- 3. ENRICHIR LA TABLE ORGANIZATIONS
-- =====================================================

-- Ajouter les colonnes manquantes pour la gestion complète
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS sector TEXT; -- 'insurance', 'government', 'education', 'health', etc.
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS nif TEXT; -- Numéro d'Identification Fiscale
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS rccm TEXT; -- Registre Commerce
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS max_users INTEGER NOT NULL DEFAULT 10;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS storage_quota_bytes BIGINT NOT NULL DEFAULT 5368709120; -- 5GB default
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS modules_enabled TEXT[] DEFAULT ARRAY['idocument', 'iarchive']::TEXT[];
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS created_by VARCHAR(128); -- UID du platform_admin qui l'a créée
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id);

CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_created_by ON organizations(created_by);

-- =====================================================
-- 4. TABLE D'INVITATIONS
-- =====================================================

CREATE TABLE organization_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role platform_role NOT NULL DEFAULT 'org_member',
    invited_by VARCHAR(128) NOT NULL, -- UID de l'invitant
    token TEXT UNIQUE NOT NULL,       -- Token d'invitation unique
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired, revoked
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by VARCHAR(128),
    message TEXT,                      -- Message optionnel de l'invitant
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Un seul invitation active par email par org
    UNIQUE (organization_id, email, status)
);

CREATE INDEX idx_invitations_token ON organization_invitations(token);
CREATE INDEX idx_invitations_email ON organization_invitations(email);
CREATE INDEX idx_invitations_org ON organization_invitations(organization_id);

-- =====================================================
-- 5. TABLE D'AUDIT DES ACTIONS ADMIN
-- =====================================================

CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id VARCHAR(128) NOT NULL,    -- UID de l'utilisateur qui a fait l'action
    actor_role platform_role NOT NULL,
    action TEXT NOT NULL,               -- 'create_org', 'assign_role', 'invite_user', etc.
    target_type TEXT NOT NULL,          -- 'organization', 'user', 'role', 'invitation'
    target_id TEXT,                     -- ID de la cible
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_actor ON admin_audit_log(actor_id);
CREATE INDEX idx_admin_audit_org ON admin_audit_log(organization_id);
CREATE INDEX idx_admin_audit_action ON admin_audit_log(action);
CREATE INDEX idx_admin_audit_created ON admin_audit_log(created_at);

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

CREATE TRIGGER update_user_platform_roles_updated_at
    BEFORE UPDATE ON user_platform_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. MIGRATION DES RÔLES EXISTANTS
-- =====================================================

-- Migrer les anciens rôles admin vers system_admin
INSERT INTO user_platform_roles (user_id, role, granted_at, is_active)
SELECT user_id, 'system_admin'::platform_role, created_at, true
FROM user_roles
WHERE role = 'admin'
ON CONFLICT DO NOTHING;

-- Migrer les anciens rôles user (sans org pour l'instant)
-- Ces utilisateurs devront être assignés à une org plus tard
-- On ne les migre PAS car ils n'ont pas d'organization_id

-- =====================================================
-- 8. DONNÉES DE SEED - RÔLES DÉMO
-- =====================================================

-- Créer l'organisation démo ASCOMA
INSERT INTO organizations (name, slug, type, sector, address, city, country, contact_email, status, modules_enabled, max_users, storage_quota_bytes)
VALUES (
    'ASCOMA Assurances',
    'ascoma-ga',
    'business',
    'insurance',
    'Boulevard de l''Indépendance',
    'Libreville',
    'Gabon',
    'contact@ascoma.ga',
    'active',
    ARRAY['idocument', 'iarchive', 'isignature'],
    50,
    107374182400 -- 100GB
) ON CONFLICT (slug) DO NOTHING;

-- Créer l'organisation démo Ministère de la Pêche
INSERT INTO organizations (name, slug, type, sector, address, city, country, contact_email, status, modules_enabled, max_users, storage_quota_bytes)
VALUES (
    'Ministère de la Pêche et des Mers',
    'ministere-peche',
    'government',
    'government',
    'Boulevard Triomphal Omar Bongo',
    'Libreville',
    'Gabon',
    'contact@peche.gouv.ga',
    'active',
    ARRAY['idocument', 'iarchive', 'isignature'],
    500,
    -1 -- Illimité pour gouvernement
) ON CONFLICT (slug) DO NOTHING;

-- Note: Les assignations de rôles pour les comptes démo seront faites
-- par la Cloud Function onUserCreated lors de la première connexion
-- basée sur le domaine email (@ascoma.ga → ASCOMA, @digitalium.io → Ministère)

-- =====================================================
-- 9. FONCTION HELPER: Vérifier la hiérarchie de rôles
-- =====================================================

CREATE OR REPLACE FUNCTION role_level(r platform_role) RETURNS INTEGER AS $$
BEGIN
    RETURN CASE r
        WHEN 'system_admin' THEN 0
        WHEN 'platform_admin' THEN 1
        WHEN 'org_admin' THEN 2
        WHEN 'org_manager' THEN 3
        WHEN 'org_member' THEN 4
        WHEN 'org_viewer' THEN 5
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Un utilisateur peut assigner un rôle inférieur au sien uniquement
CREATE OR REPLACE FUNCTION can_assign_role(
    assigner_role platform_role,
    target_role platform_role
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN role_level(assigner_role) < role_level(target_role);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
