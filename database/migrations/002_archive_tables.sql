-- ============================================================================
-- Migration 002: Archive Tables
-- iArchive module — Folders, Documents, Versions, Shares, Audit, Retention
-- ============================================================================

-- ==========================================================================
-- ENUM TYPES
-- ==========================================================================

DO $$ BEGIN
    CREATE TYPE folder_level AS ENUM ('classeur', 'dossier');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('draft', 'pending', 'approved', 'archived', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('contract', 'invoice', 'quote', 'report', 'project', 'hr', 'legal', 'fiscal', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE share_permission AS ENUM ('view', 'download', 'edit', 'full');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'download', 'share', 'unshare', 'restore', 'version', 'sign', 'export');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ==========================================================================
-- ARCHIVE FOLDERS
-- ==========================================================================

CREATE TABLE IF NOT EXISTS archive_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES archive_folders(id) ON DELETE CASCADE,
    level folder_level NOT NULL DEFAULT 'dossier',
    path TEXT NOT NULL DEFAULT '/',
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📁',
    color TEXT DEFAULT 'bg-blue-500',
    is_system BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archive_folders_user ON archive_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_archive_folders_org ON archive_folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_archive_folders_parent ON archive_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_archive_folders_path ON archive_folders(path);


-- ==========================================================================
-- ARCHIVE DOCUMENTS
-- ==========================================================================

CREATE TABLE IF NOT EXISTS archive_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(128) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES archive_folders(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    size_bytes BIGINT NOT NULL DEFAULT 0,
    storage_path TEXT NOT NULL,
    storage_url TEXT,
    thumbnail_url TEXT,
    title TEXT NOT NULL,
    description TEXT,
    document_type document_type NOT NULL DEFAULT 'other',
    reference TEXT,
    author TEXT,
    tags TEXT[] DEFAULT '{}',
    status document_status NOT NULL DEFAULT 'draft',

    -- Integrity
    hash_sha256 VARCHAR(64) NOT NULL,
    hash_verified_at TIMESTAMP WITH TIME ZONE,

    -- Versioning
    version INTEGER NOT NULL DEFAULT 1,
    is_latest_version BOOLEAN NOT NULL DEFAULT true,
    parent_document_id UUID REFERENCES archive_documents(id) ON DELETE SET NULL,

    -- Retention
    retention_years INTEGER NOT NULL DEFAULT 10,
    expiration_date TIMESTAMP WITH TIME ZONE,

    -- Encryption
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    encryption_method TEXT,
    access_level TEXT DEFAULT 'private',

    -- Signature
    is_signed BOOLEAN NOT NULL DEFAULT false,
    signature_data JSONB,
    signed_at TIMESTAMP WITH TIME ZONE,

    -- OCR & Compliance
    extracted_text TEXT,
    ocr_processed BOOLEAN NOT NULL DEFAULT false,
    pdf_a_compliant BOOLEAN NOT NULL DEFAULT false,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_archive_docs_user ON archive_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_archive_docs_org ON archive_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_archive_docs_folder ON archive_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_archive_docs_status ON archive_documents(status);
CREATE INDEX IF NOT EXISTS idx_archive_docs_type ON archive_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_archive_docs_hash ON archive_documents(hash_sha256);
CREATE INDEX IF NOT EXISTS idx_archive_docs_deleted ON archive_documents(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_archive_docs_expiration ON archive_documents(expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_archive_docs_tags ON archive_documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_archive_docs_search ON archive_documents USING GIN(
    to_tsvector('french', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(extracted_text, ''))
);


-- ==========================================================================
-- DOCUMENT VERSIONS
-- ==========================================================================

CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES archive_documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    storage_url TEXT,
    hash_sha256 VARCHAR(64) NOT NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    change_description TEXT,
    changed_by VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE(document_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_doc_versions_doc ON document_versions(document_id);


-- ==========================================================================
-- DOCUMENT SHARES
-- ==========================================================================

CREATE TABLE IF NOT EXISTS document_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES archive_documents(id) ON DELETE CASCADE,
    shared_by VARCHAR(128) NOT NULL,
    shared_with VARCHAR(128),
    share_token TEXT UNIQUE,
    password_hash TEXT,
    permission share_permission NOT NULL DEFAULT 'view',
    expires_at TIMESTAMP WITH TIME ZONE,
    max_access_count INTEGER,
    access_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_doc_shares_doc ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_shares_token ON document_shares(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_doc_shares_shared_with ON document_shares(shared_with) WHERE shared_with IS NOT NULL;


-- ==========================================================================
-- ARCHIVE AUDIT LOGS
-- ==========================================================================

CREATE TABLE IF NOT EXISTS archive_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES archive_documents(id) ON DELETE SET NULL,
    folder_id UUID REFERENCES archive_folders(id) ON DELETE SET NULL,
    user_id VARCHAR(128) NOT NULL,
    action audit_action NOT NULL,
    action_details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archive_audit_user ON archive_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_archive_audit_doc ON archive_audit_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_archive_audit_action ON archive_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_archive_audit_date ON archive_audit_logs(created_at DESC);


-- ==========================================================================
-- RETENTION POLICIES
-- ==========================================================================

CREATE TABLE IF NOT EXISTS retention_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    document_type document_type NOT NULL,
    retention_years INTEGER NOT NULL DEFAULT 10,
    auto_delete BOOLEAN NOT NULL DEFAULT false,
    legal_reference TEXT,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retention_org ON retention_policies(organization_id);


-- ==========================================================================
-- DEFAULT RETENTION POLICIES (Gabon legal standards)
-- ==========================================================================

INSERT INTO retention_policies (name, document_type, retention_years, legal_reference, description, is_default)
VALUES
    ('Contrats commerciaux', 'contract', 10, 'Code du Commerce OHADA - Art. 18', 'Durée de conservation des contrats commerciaux selon OHADA', true),
    ('Factures', 'invoice', 10, 'Code Général des Impôts - Art. L.13', 'Conservation des factures pour contrôle fiscal', true),
    ('Devis', 'quote', 5, 'Code du Commerce OHADA', 'Conservation des devis et propositions commerciales', true),
    ('Rapports', 'report', 10, 'Code du Commerce OHADA - Art. 13', 'Conservation des rapports internes et externes', true),
    ('Documents RH', 'hr', 50, 'Code du Travail gabonais - Art. 143', 'Conservation des dossiers du personnel', true),
    ('Documents juridiques', 'legal', 30, 'Code Civil gabonais - Art. 2224', 'Conservation des actes et documents juridiques', true),
    ('Documents fiscaux', 'fiscal', 10, 'Code Général des Impôts - Art. L.13', 'Conservation des déclarations et documents fiscaux', true),
    ('Documents projets', 'project', 10, 'Usage commercial', 'Conservation des documents de gestion de projets', true),
    ('Autres documents', 'other', 10, 'Conservation par défaut', 'Durée de conservation par défaut pour documents non classifiés', true)
ON CONFLICT DO NOTHING;


-- ==========================================================================
-- HELPER: Auto-build folder path on insert/update
-- ==========================================================================

CREATE OR REPLACE FUNCTION build_folder_path() RETURNS TRIGGER AS $$
DECLARE
    parent_path TEXT;
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.path := '/' || NEW.name;
    ELSE
        SELECT path INTO parent_path FROM archive_folders WHERE id = NEW.parent_id;
        IF parent_path IS NOT NULL THEN
            NEW.path := parent_path || '/' || NEW.name;
        ELSE
            NEW.path := '/' || NEW.name;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_build_folder_path ON archive_folders;
CREATE TRIGGER trg_build_folder_path
    BEFORE INSERT OR UPDATE OF name, parent_id ON archive_folders
    FOR EACH ROW
    EXECUTE FUNCTION build_folder_path();
