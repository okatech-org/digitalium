-- =====================================================
-- iArchive Database Schema for Google Cloud SQL
-- Project: DIGITALIUM Gabon (digitalium-ga)
-- Instance: digitalium-db
-- =====================================================

-- Drop existing types if recreating
DO $$ BEGIN
    CREATE TYPE permission_type AS ENUM ('positive', 'negative');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE share_permission AS ENUM ('view', 'download', 'edit', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('active', 'semi_active', 'archived', 'destroyed', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE final_disposition AS ENUM ('destroy', 'permanent', 'transfer', 'review');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- CORE ARCHIVE TABLES
-- =====================================================

-- Archive Folders
CREATE TABLE IF NOT EXISTS archive_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES archive_folders(id) ON DELETE CASCADE,
    path TEXT,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Archive Documents
CREATE TABLE IF NOT EXISTS archive_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    folder_id UUID REFERENCES archive_folders(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    original_name VARCHAR(500),
    description TEXT,
    mime_type VARCHAR(255),
    size_bytes BIGINT,
    storage_path TEXT NOT NULL,
    hash_sha256 VARCHAR(64) NOT NULL,
    hash_verified_at TIMESTAMPTZ,
    document_type VARCHAR(100) DEFAULT 'other',
    status document_status DEFAULT 'active',
    reference VARCHAR(100),
    retention_category VARCHAR(50),
    retention_years INTEGER,
    retention_expires_at TIMESTAMPTZ,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_by TEXT,
    locked_at TIMESTAMPTZ,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Document Versions
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES archive_documents(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    hash_sha256 VARCHAR(64) NOT NULL,
    size_bytes BIGINT,
    comment TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, version_number)
);

-- Document Shares
CREATE TABLE IF NOT EXISTS document_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES archive_documents(id) ON DELETE CASCADE NOT NULL,
    shared_by TEXT NOT NULL,
    shared_with TEXT,
    shared_with_email VARCHAR(255),
    share_type VARCHAR(50) DEFAULT 'link',
    permission share_permission DEFAULT 'view',
    access_token VARCHAR(64) UNIQUE,
    password_hash VARCHAR(64),
    expires_at TIMESTAMPTZ,
    max_downloads INTEGER,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS archive_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES archive_documents(id) ON DELETE SET NULL,
    folder_id UUID REFERENCES archive_folders(id) ON DELETE SET NULL,
    actor_id TEXT NOT NULL,
    actor_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retention Policies
CREATE TABLE IF NOT EXISTS retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    active_years INTEGER NOT NULL,
    semi_active_years INTEGER DEFAULT 0,
    final_disposition final_disposition NOT NULL,
    legal_basis TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RED NOTES ADVANCED FEATURES
-- =====================================================

-- Document Permissions (Negative Permissions)
CREATE TABLE IF NOT EXISTS document_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES archive_documents(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES archive_folders(id) ON DELETE CASCADE,
    user_id TEXT,
    group_name VARCHAR(100),
    permission_type permission_type NOT NULL DEFAULT 'positive',
    permission_level share_permission NOT NULL DEFAULT 'view',
    granted_by TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_target CHECK (document_id IS NOT NULL OR folder_id IS NOT NULL),
    CONSTRAINT valid_principal CHECK (user_id IS NOT NULL OR group_name IS NOT NULL)
);

-- Document Redactions (Caviardage)
CREATE TABLE IF NOT EXISTS document_redactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES archive_documents(id) ON DELETE CASCADE NOT NULL,
    page_number INTEGER NOT NULL,
    x_position DECIMAL NOT NULL,
    y_position DECIMAL NOT NULL,
    width DECIMAL NOT NULL,
    height DECIMAL NOT NULL,
    reason VARCHAR(255),
    reason_code VARCHAR(50),
    is_permanent BOOLEAN DEFAULT FALSE,
    created_by TEXT NOT NULL,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batch Operations
CREATE TABLE IF NOT EXISTS batch_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_items INTEGER NOT NULL,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    document_ids UUID[] NOT NULL,
    parameters JSONB DEFAULT '{}',
    results JSONB DEFAULT '{}',
    error_log TEXT[],
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Destruction Certificates
CREATE TABLE IF NOT EXISTS destruction_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    document_id UUID NOT NULL,
    document_title TEXT NOT NULL,
    document_reference VARCHAR(100),
    document_hash VARCHAR(64) NOT NULL,
    document_type VARCHAR(100),
    document_size_bytes BIGINT,
    document_created_at TIMESTAMPTZ,
    retention_years INTEGER,
    retention_expired_at TIMESTAMPTZ,
    destruction_reason TEXT NOT NULL,
    destruction_method VARCHAR(100) NOT NULL,
    destruction_authorized_by TEXT NOT NULL,
    destruction_authorized_by_name VARCHAR(255),
    verification_hash VARCHAR(64) NOT NULL,
    qr_verification_code VARCHAR(100) NOT NULL UNIQUE,
    organization_name VARCHAR(255),
    legal_basis TEXT,
    witness_name VARCHAR(255),
    witness_signature_hash VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto Archive Rules
CREATE TABLE IF NOT EXISTS auto_archive_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    source_folder_id UUID REFERENCES archive_folders(id) ON DELETE SET NULL,
    source_document_type VARCHAR(100),
    source_status document_status,
    source_tags TEXT[],
    source_age_days INTEGER,
    target_folder_id UUID REFERENCES archive_folders(id) ON DELETE SET NULL,
    target_status document_status,
    target_locked BOOLEAN,
    run_frequency VARCHAR(50) DEFAULT 'daily',
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    documents_processed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Reminders
CREATE TABLE IF NOT EXISTS document_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES archive_documents(id) ON DELETE CASCADE NOT NULL,
    user_id TEXT NOT NULL,
    reminder_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_date DATE NOT NULL,
    days_before_alert INTEGER DEFAULT 7,
    repeat_interval_days INTEGER,
    notify_email BOOLEAN DEFAULT TRUE,
    notify_in_app BOOLEAN DEFAULT TRUE,
    notify_users TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    last_notified_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Annotations
CREATE TABLE IF NOT EXISTS document_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES archive_documents(id) ON DELETE CASCADE NOT NULL,
    user_id TEXT NOT NULL,
    annotation_type VARCHAR(50) NOT NULL,
    page_number INTEGER,
    x_position DECIMAL,
    y_position DECIMAL,
    width DECIMAL,
    height DECIMAL,
    content TEXT,
    color VARCHAR(7) DEFAULT '#ffff00',
    priority VARCHAR(20) DEFAULT 'normal',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by TEXT,
    resolved_at TIMESTAMPTZ,
    mentions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Management Table (Tableau de Gestion)
CREATE TABLE IF NOT EXISTS document_management_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    category_code VARCHAR(50) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    description TEXT,
    document_types TEXT[],
    active_retention_years INTEGER NOT NULL,
    semi_active_retention_years INTEGER DEFAULT 0,
    final_disposition final_disposition NOT NULL,
    legal_basis TEXT,
    responsible_service VARCHAR(255),
    special_instructions TEXT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category_code)
);

-- =====================================================
-- WORKFLOW TABLES
-- =====================================================

-- Approval Workflows
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES archive_documents(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    workflow_type VARCHAR(50) DEFAULT 'sequential',
    status VARCHAR(50) DEFAULT 'pending',
    created_by TEXT NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval Steps
CREATE TABLE IF NOT EXISTS approval_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE NOT NULL,
    step_order INTEGER NOT NULL,
    approver_id TEXT NOT NULL,
    approver_name VARCHAR(255),
    approver_role VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    decision VARCHAR(50),
    comment TEXT,
    decided_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Electronic Signatures
CREATE TABLE IF NOT EXISTS electronic_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES archive_documents(id) ON DELETE CASCADE NOT NULL,
    signer_id TEXT NOT NULL,
    signer_name VARCHAR(255) NOT NULL,
    signer_email VARCHAR(255),
    signer_role VARCHAR(100),
    signature_data TEXT,
    signature_method VARCHAR(50),
    signature_hash VARCHAR(64),
    ip_address INET,
    user_agent TEXT,
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    certificate_id VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_archive_folders_user ON archive_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_archive_folders_parent ON archive_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_archive_documents_user ON archive_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_archive_documents_folder ON archive_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_archive_documents_status ON archive_documents(status);
CREATE INDEX IF NOT EXISTS idx_archive_documents_type ON archive_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_archive_documents_retention ON archive_documents(retention_expires_at);
CREATE INDEX IF NOT EXISTS idx_document_versions_doc ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_doc ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_token ON document_shares(access_token);
CREATE INDEX IF NOT EXISTS idx_audit_logs_doc ON archive_audit_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON archive_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON archive_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_permissions_doc ON document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_permissions_user ON document_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_document_redactions_doc ON document_redactions(document_id);
CREATE INDEX IF NOT EXISTS idx_batch_operations_user ON batch_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_destruction_certs_number ON destruction_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_auto_archive_rules_user ON auto_archive_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_document_reminders_doc ON document_reminders(document_id);
CREATE INDEX IF NOT EXISTS idx_document_reminders_date ON document_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_doc ON approval_workflows(document_id);
CREATE INDEX IF NOT EXISTS idx_approval_steps_workflow ON approval_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_electronic_signatures_doc ON electronic_signatures(document_id);

-- =====================================================
-- DEFAULT RETENTION POLICIES (GABONESE LAW)
-- =====================================================

INSERT INTO retention_policies (code, name, description, category, active_years, semi_active_years, final_disposition, legal_basis, is_system)
VALUES 
    ('FIS-01', 'Documents fiscaux', 'Déclarations fiscales, factures, comptabilité', 'Fiscal', 10, 0, 'destroy', 'Code Général des Impôts du Gabon', true),
    ('SOC-01', 'Dossiers du personnel', 'Contrats de travail, fiches de paie, congés', 'Social', 5, 50, 'permanent', 'Code du Travail gabonais', true),
    ('CTR-01', 'Contrats commerciaux', 'Contrats clients et fournisseurs', 'Juridique', 10, 5, 'destroy', 'Code Civil gabonais', true),
    ('ADM-01', 'Correspondance administrative', 'Courriers officiels, notes de service', 'Administratif', 5, 5, 'review', 'Pratiques archivistiques', true),
    ('JUR-01', 'Documents juridiques', 'Statuts, procès-verbaux, actes notariés', 'Juridique', 30, 0, 'permanent', 'OHADA et droit gabonais', true),
    ('BNQ-01', 'Relevés bancaires', 'Relevés de compte, bordereaux', 'Financier', 10, 0, 'destroy', 'Réglementation BEAC', true),
    ('PRJ-01', 'Documentation projet', 'Plans, spécifications, rapports', 'Technique', 5, 10, 'review', 'Pratiques sectorielles', true),
    ('COR-01', 'Correspondance générale', 'Emails archivés, courriers', 'Administratif', 3, 2, 'destroy', 'Pratiques archivistiques', true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$ BEGIN
    RAISE NOTICE 'iArchive schema created successfully on Google Cloud SQL';
END $$;
