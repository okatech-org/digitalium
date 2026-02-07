-- =============================================================================
-- Migration 003: Signature Tables
-- Electronic signature workflows, requests, signatories, and certificates
-- =============================================================================

-- ==============================
-- ENUMS
-- ==============================

CREATE TYPE signature_request_status AS ENUM (
    'draft',        -- Brouillon, pas encore envoyé
    'pending',      -- En attente de signatures
    'completed',    -- Toutes les signatures recueillies
    'cancelled',    -- Annulé par le créateur
    'expired'       -- Délai dépassé
);

CREATE TYPE signatory_status AS ENUM (
    'pending',      -- En attente de signature
    'signed',       -- A signé
    'declined',     -- A refusé
    'expired'       -- Délai dépassé pour ce signataire
);

CREATE TYPE signature_method AS ENUM (
    'draw',         -- Signature dessinée (canvas)
    'type',         -- Signature tapée
    'upload'        -- Image de signature téléversée
);

CREATE TYPE workflow_status AS ENUM (
    'active',
    'inactive',
    'archived'
);

-- ==============================
-- TABLE: signature_requests
-- Core table for signature workflows
-- ==============================

CREATE TABLE IF NOT EXISTS signature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Document reference (links to archive_documents or external)
    document_id UUID REFERENCES archive_documents(id) ON DELETE SET NULL,
    document_title VARCHAR(500) NOT NULL,
    document_hash VARCHAR(128),          -- SHA-256 of original document

    -- Request metadata
    status signature_request_status NOT NULL DEFAULT 'draft',
    message TEXT,                         -- Message aux signataires
    priority VARCHAR(20) DEFAULT 'normal', -- normal, high, urgent

    -- Ownership
    created_by VARCHAR(128) NOT NULL,    -- Firebase UID
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Expiration
    expires_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Certificate
    certificate_url TEXT,                -- URL du certificat de signature
    certificate_hash VARCHAR(128),       -- Hash du certificat

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    cancelled_reason TEXT
);

-- ==============================
-- TABLE: signature_signatories
-- Each signatory for a signature request
-- ==============================

CREATE TABLE IF NOT EXISTS signature_signatories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent request
    request_id UUID NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,

    -- Signatory identity
    user_id VARCHAR(128),                -- Firebase UID (null if external)
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_avatar TEXT,
    role VARCHAR(100),                   -- Rôle affiché (ex: "Directeur Général")

    -- Order & status
    sign_order INTEGER NOT NULL DEFAULT 1,  -- Ordre séquentiel
    status signatory_status NOT NULL DEFAULT 'pending',

    -- Signature data
    signature_method signature_method,
    signature_data TEXT,                 -- Base64 encoded signature image or typed name
    signed_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,

    -- Decline
    decline_reason TEXT,
    declined_at TIMESTAMPTZ,

    -- Reminders
    last_reminder_at TIMESTAMPTZ,
    reminder_count INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================
-- TABLE: signature_workflows
-- Reusable workflow templates
-- ==============================

CREATE TABLE IF NOT EXISTS signature_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Ownership
    user_id VARCHAR(128) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Workflow metadata
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status workflow_status NOT NULL DEFAULT 'active',

    -- Stats
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ               -- Soft delete
);

-- ==============================
-- TABLE: signature_workflow_steps
-- Steps within a workflow template
-- ==============================

CREATE TABLE IF NOT EXISTS signature_workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workflow_id UUID NOT NULL REFERENCES signature_workflows(id) ON DELETE CASCADE,

    -- Step definition
    step_order INTEGER NOT NULL,
    role VARCHAR(100) NOT NULL,          -- Rôle requis (ex: "Chef de Service")
    action VARCHAR(50) NOT NULL DEFAULT 'sign', -- sign, approve, review
    is_required BOOLEAN NOT NULL DEFAULT true,

    -- Optional: pre-assign a specific user
    default_user_id VARCHAR(128),
    default_user_name VARCHAR(255),
    default_user_email VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================
-- TABLE: signature_audit_logs
-- Audit trail for all signature events
-- ==============================

CREATE TABLE IF NOT EXISTS signature_audit_logs (
    id BIGSERIAL PRIMARY KEY,

    -- Actor
    user_id VARCHAR(128),
    ip_address INET,

    -- Target
    request_id UUID REFERENCES signature_requests(id) ON DELETE SET NULL,
    signatory_id UUID REFERENCES signature_signatories(id) ON DELETE SET NULL,
    workflow_id UUID REFERENCES signature_workflows(id) ON DELETE SET NULL,

    -- Event
    action VARCHAR(50) NOT NULL,         -- created, sent, signed, declined, cancelled, reminded, expired, completed
    action_details JSONB DEFAULT '{}',

    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================
-- TABLE: signature_certificates
-- Digital signature certificates/proofs
-- ==============================

CREATE TABLE IF NOT EXISTS signature_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    request_id UUID NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,

    -- Certificate data
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    document_hash VARCHAR(128) NOT NULL,  -- Hash original
    signed_document_hash VARCHAR(128),    -- Hash après signatures

    -- All signatories snapshot at completion
    signatories_snapshot JSONB NOT NULL,  -- Array of signatory info + signature details

    -- Verification
    verification_token VARCHAR(255) UNIQUE NOT NULL,
    is_valid BOOLEAN NOT NULL DEFAULT true,
    invalidated_at TIMESTAMPTZ,
    invalidated_reason TEXT,

    -- Timestamps
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ                -- Durée de validité du certificat
);

-- ==============================
-- INDEXES
-- ==============================

-- signature_requests
CREATE INDEX idx_sig_requests_created_by ON signature_requests(created_by);
CREATE INDEX idx_sig_requests_org ON signature_requests(organization_id);
CREATE INDEX idx_sig_requests_status ON signature_requests(status);
CREATE INDEX idx_sig_requests_document ON signature_requests(document_id);
CREATE INDEX idx_sig_requests_expires ON signature_requests(expires_at) WHERE expires_at IS NOT NULL;

-- signature_signatories
CREATE INDEX idx_sig_signatories_request ON signature_signatories(request_id);
CREATE INDEX idx_sig_signatories_user ON signature_signatories(user_id);
CREATE INDEX idx_sig_signatories_email ON signature_signatories(user_email);
CREATE INDEX idx_sig_signatories_status ON signature_signatories(status);

-- signature_workflows
CREATE INDEX idx_sig_workflows_user ON signature_workflows(user_id);
CREATE INDEX idx_sig_workflows_org ON signature_workflows(organization_id);

-- signature_workflow_steps
CREATE INDEX idx_sig_wf_steps_workflow ON signature_workflow_steps(workflow_id);

-- signature_audit_logs
CREATE INDEX idx_sig_audit_user ON signature_audit_logs(user_id);
CREATE INDEX idx_sig_audit_request ON signature_audit_logs(request_id);
CREATE INDEX idx_sig_audit_created ON signature_audit_logs(created_at);

-- signature_certificates
CREATE INDEX idx_sig_certs_request ON signature_certificates(request_id);
CREATE INDEX idx_sig_certs_token ON signature_certificates(verification_token);

-- ==============================
-- TRIGGERS
-- ==============================

-- Auto-update updated_at on signature_requests
CREATE OR REPLACE FUNCTION update_sig_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sig_request_updated
    BEFORE UPDATE ON signature_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_sig_request_timestamp();

-- Auto-update updated_at on signature_signatories
CREATE TRIGGER trg_sig_signatory_updated
    BEFORE UPDATE ON signature_signatories
    FOR EACH ROW
    EXECUTE FUNCTION update_sig_request_timestamp();

-- Auto-update updated_at on signature_workflows
CREATE TRIGGER trg_sig_workflow_updated
    BEFORE UPDATE ON signature_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_sig_request_timestamp();

-- ==============================
-- Auto-complete request when all signatories have signed
-- ==============================

CREATE OR REPLACE FUNCTION check_signature_completion()
RETURNS TRIGGER AS $$
DECLARE
    total_required INTEGER;
    total_signed INTEGER;
    req_status signature_request_status;
BEGIN
    -- Only fire when signatory status changes to 'signed'
    IF NEW.status = 'signed' AND (OLD.status IS NULL OR OLD.status != 'signed') THEN
        -- Count required and signed signatories
        SELECT COUNT(*) INTO total_required
        FROM signature_signatories
        WHERE request_id = NEW.request_id;

        SELECT COUNT(*) INTO total_signed
        FROM signature_signatories
        WHERE request_id = NEW.request_id AND status = 'signed';

        -- Check current request status
        SELECT status INTO req_status
        FROM signature_requests
        WHERE id = NEW.request_id;

        -- If all required signatories have signed, mark request as completed
        IF total_signed >= total_required AND req_status = 'pending' THEN
            UPDATE signature_requests
            SET status = 'completed', completed_at = NOW()
            WHERE id = NEW.request_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_signature_completion
    AFTER UPDATE ON signature_signatories
    FOR EACH ROW
    EXECUTE FUNCTION check_signature_completion();
