-- =====================================================
-- DIGITALIUM ARCHIVE SYSTEM - NOTES ROUGES EXTENSION
-- =====================================================
-- Phase 2: Advanced features for complete legal archiving
-- - Negative permissions (block specific users/groups)
-- - Document redaction tracking
-- - Batch operations logging
-- - Destruction certificates
-- - Auto-archiving rules
-- - Renewal reminders
-- =====================================================

-- =====================================================
-- NEGATIVE PERMISSIONS
-- =====================================================

CREATE TYPE public.permission_type AS ENUM (
    'positive',     -- Grant access
    'negative'      -- Deny access (overrides positive)
);

CREATE TABLE public.document_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Target (document or folder)
    document_id UUID REFERENCES public.archive_documents(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.archive_folders(id) ON DELETE CASCADE,
    
    -- Principal (user or group)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_name TEXT, -- For group-based permissions
    
    -- Permission type
    permission_type permission_type NOT NULL DEFAULT 'positive',
    permission_level share_permission NOT NULL DEFAULT 'view',
    
    -- Inheritance
    is_inherited BOOLEAN NOT NULL DEFAULT false,
    inherited_from UUID REFERENCES public.document_permissions(id) ON DELETE CASCADE,
    
    -- Metadata
    reason TEXT, -- Why this permission was set
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Ensure at least one target
    CONSTRAINT permission_target_check CHECK (
        (document_id IS NOT NULL AND folder_id IS NULL) OR
        (document_id IS NULL AND folder_id IS NOT NULL)
    ),
    -- Ensure at least one principal
    CONSTRAINT permission_principal_check CHECK (
        user_id IS NOT NULL OR group_name IS NOT NULL
    )
);

ALTER TABLE public.document_permissions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_doc_permissions_document ON public.document_permissions(document_id);
CREATE INDEX idx_doc_permissions_folder ON public.document_permissions(folder_id);
CREATE INDEX idx_doc_permissions_user ON public.document_permissions(user_id);
CREATE INDEX idx_doc_permissions_type ON public.document_permissions(permission_type);

-- =====================================================
-- DOCUMENT REDACTION (CAVIARDAGE)
-- =====================================================

CREATE TABLE public.document_redactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.archive_documents(id) ON DELETE CASCADE NOT NULL,
    
    -- Page and location
    page_number INTEGER NOT NULL,
    x_position DECIMAL NOT NULL,
    y_position DECIMAL NOT NULL,
    width DECIMAL NOT NULL,
    height DECIMAL NOT NULL,
    
    -- Redaction metadata
    redaction_type TEXT NOT NULL DEFAULT 'rectangle', -- rectangle, text
    redaction_color TEXT NOT NULL DEFAULT '#000000',
    redaction_reason TEXT,
    
    -- For word-level redaction
    original_text TEXT, -- Encrypted or null
    replacement_text TEXT,
    
    -- Status
    is_permanent BOOLEAN NOT NULL DEFAULT false,
    applied_at TIMESTAMP WITH TIME ZONE,
    
    -- Author
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_redactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_redactions_document ON public.document_redactions(document_id);
CREATE INDEX idx_redactions_page ON public.document_redactions(document_id, page_number);

-- =====================================================
-- BATCH OPERATIONS TRACKING
-- =====================================================

CREATE TYPE public.batch_operation_type AS ENUM (
    'lock',           -- Gel/verrouillage
    'unlock',         -- Déverrouillage
    'block_sharing',  -- Bloquer partage
    'unblock_sharing',-- Débloquer partage
    'apply_redaction',-- Appliquer caviardage
    'apply_permissions',-- Appliquer permissions
    'delete',         -- Suppression en lot
    'restore',        -- Restauration en lot
    'move',           -- Déplacement en lot
    'change_status',  -- Changement statut
    'apply_retention' -- Appliquer politique rétention
);

CREATE TABLE public.batch_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Operation details
    operation_type batch_operation_type NOT NULL,
    operation_params JSONB DEFAULT '{}',
    
    -- Targets
    document_ids UUID[] DEFAULT '{}',
    folder_ids UUID[] DEFAULT '{}',
    
    -- Selection criteria (for audit)
    selection_criteria JSONB, -- Tags, dates, etc.
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    progress_percent INTEGER DEFAULT 0,
    items_processed INTEGER DEFAULT 0,
    items_total INTEGER,
    error_message TEXT,
    
    -- Author
    initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.batch_operations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_batch_ops_status ON public.batch_operations(status);
CREATE INDEX idx_batch_ops_initiated_by ON public.batch_operations(initiated_by);

-- =====================================================
-- DOCUMENT LOCKING (GEL)
-- =====================================================

ALTER TABLE public.archive_documents 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lock_reason TEXT,
ADD COLUMN IF NOT EXISTS sharing_blocked BOOLEAN NOT NULL DEFAULT false;

-- =====================================================
-- DESTRUCTION CERTIFICATES
-- =====================================================

CREATE TABLE public.destruction_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number TEXT UNIQUE NOT NULL,
    
    -- Document info (preserved after destruction)
    document_id UUID, -- Will be null after document is deleted
    document_title TEXT NOT NULL,
    document_reference TEXT,
    document_hash TEXT NOT NULL,
    document_type document_type NOT NULL,
    document_size_bytes BIGINT NOT NULL,
    document_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Retention info
    retention_policy_id UUID,
    retention_years INTEGER NOT NULL,
    retention_expired_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Destruction details
    destruction_reason TEXT NOT NULL,
    destruction_method TEXT NOT NULL DEFAULT 'secure_delete', -- secure_delete, shred, etc.
    destruction_authorized_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    
    -- Verification
    verification_hash TEXT NOT NULL, -- Hash of all certificate data
    qr_verification_code TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Organization
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL
);

ALTER TABLE public.destruction_certificates ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_destruction_certs_number ON public.destruction_certificates(certificate_number);
CREATE INDEX idx_destruction_certs_document ON public.destruction_certificates(document_id);

-- =====================================================
-- AUTO-ARCHIVING RULES
-- =====================================================

CREATE TABLE public.auto_archive_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Rule definition
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,
    
    -- Source criteria
    source_folder_id UUID REFERENCES public.archive_folders(id) ON DELETE CASCADE,
    source_type document_type,
    source_status document_status,
    source_tags TEXT[],
    source_age_days INTEGER, -- Documents older than X days
    
    -- Target configuration
    target_folder_id UUID REFERENCES public.archive_folders(id) ON DELETE SET NULL,
    target_status document_status,
    target_locked BOOLEAN DEFAULT false,
    
    -- Execution schedule
    run_frequency TEXT NOT NULL DEFAULT 'daily', -- daily, weekly, monthly
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    
    -- Statistics
    documents_processed INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.auto_archive_rules ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_auto_archive_active ON public.auto_archive_rules(is_active, next_run_at);

-- =====================================================
-- RENEWAL REMINDERS
-- =====================================================

CREATE TYPE public.reminder_type AS ENUM (
    'contract_renewal',    -- Renouvellement contrat
    'license_expiry',      -- Expiration licence
    'certification_renewal', -- Renouvellement certification
    'document_review',     -- Révision document
    'retention_expiry',    -- Fin période rétention
    'custom'              -- Personnalisé
);

CREATE TABLE public.document_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.archive_documents(id) ON DELETE CASCADE NOT NULL,
    
    -- Reminder details
    reminder_type reminder_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Timing
    reminder_date DATE NOT NULL,
    days_before_alert INTEGER NOT NULL DEFAULT 30, -- Alert X days before
    repeat_interval_days INTEGER, -- Null = one-time
    
    -- Notification
    notify_email BOOLEAN NOT NULL DEFAULT true,
    notify_in_app BOOLEAN NOT NULL DEFAULT true,
    notify_users UUID[] DEFAULT '{}', -- Additional users to notify
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_notified_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Author
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_reminders ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_reminders_date ON public.document_reminders(reminder_date) WHERE is_active = true;
CREATE INDEX idx_reminders_document ON public.document_reminders(document_id);

-- =====================================================
-- DOCUMENT ANNOTATIONS (persisted)
-- =====================================================

CREATE TYPE public.annotation_type AS ENUM (
    'comment',      -- Commentaire
    'highlight',    -- Surlignage
    'note',         -- Note post-it
    'flag',         -- Drapeau
    'stamp'         -- Tampon
);

CREATE TABLE public.document_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.archive_documents(id) ON DELETE CASCADE NOT NULL,
    
    -- Type and content
    annotation_type annotation_type NOT NULL,
    content TEXT,
    
    -- Position
    page_number INTEGER,
    x_position DECIMAL,
    y_position DECIMAL,
    width DECIMAL,
    height DECIMAL,
    
    -- Styling
    color TEXT DEFAULT '#FFEB3B',
    priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
    
    -- For text selection
    selected_text TEXT,
    
    -- Reply threading
    parent_annotation_id UUID REFERENCES public.document_annotations(id) ON DELETE CASCADE,
    
    -- Visibility
    is_private BOOLEAN NOT NULL DEFAULT false,
    
    -- Author
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_annotations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_annotations_document ON public.document_annotations(document_id);
CREATE INDEX idx_annotations_parent ON public.document_annotations(parent_annotation_id);

-- =====================================================
-- DOCUMENT MANAGEMENT TABLE (Tableau de gestion)
-- =====================================================

CREATE TABLE public.document_management_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Category definition
    category_code TEXT NOT NULL,
    category_name TEXT NOT NULL,
    description TEXT,
    
    -- Lifecycle phases (in years)
    active_phase_years INTEGER NOT NULL DEFAULT 1,
    semi_active_phase_years INTEGER NOT NULL DEFAULT 5,
    final_disposition TEXT NOT NULL DEFAULT 'destroy', -- destroy, archive_permanent, sample
    
    -- Legal basis
    legal_reference TEXT,
    regulation_reference TEXT,
    
    -- Sample rules (for 'sample' disposition)
    sample_percentage INTEGER,
    sample_criteria TEXT,
    
    -- Document examples
    document_examples TEXT[],
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_management_table ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_doc_mgmt_org ON public.document_management_table(organization_id);
CREATE INDEX idx_doc_mgmt_category ON public.document_management_table(category_code);

-- =====================================================
-- RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Document Permissions
CREATE POLICY "Users can view permissions on their documents"
ON public.document_permissions FOR SELECT
USING (
    document_id IN (SELECT id FROM public.archive_documents WHERE user_id = auth.uid())
    OR folder_id IN (SELECT id FROM public.archive_folders WHERE user_id = auth.uid())
    OR user_id = auth.uid()
);

CREATE POLICY "Users can manage permissions on their documents"
ON public.document_permissions FOR ALL
USING (
    document_id IN (SELECT id FROM public.archive_documents WHERE user_id = auth.uid())
    OR folder_id IN (SELECT id FROM public.archive_folders WHERE user_id = auth.uid())
);

-- Redactions
CREATE POLICY "Users can view redactions on their documents"
ON public.document_redactions FOR SELECT
USING (document_id IN (SELECT id FROM public.archive_documents WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage redactions on their documents"
ON public.document_redactions FOR ALL
USING (document_id IN (SELECT id FROM public.archive_documents WHERE user_id = auth.uid()));

-- Batch Operations
CREATE POLICY "Users can view their batch operations"
ON public.batch_operations FOR SELECT
USING (initiated_by = auth.uid());

CREATE POLICY "Users can create batch operations"
ON public.batch_operations FOR INSERT
WITH CHECK (initiated_by = auth.uid());

-- Destruction Certificates
CREATE POLICY "Users can view their destruction certificates"
ON public.destruction_certificates FOR SELECT
USING (destruction_authorized_by = auth.uid() OR public.has_role('admin', auth.uid()));

CREATE POLICY "Admins can create destruction certificates"
ON public.destruction_certificates FOR INSERT
WITH CHECK (public.has_role('admin', auth.uid()));

-- Auto-Archive Rules
CREATE POLICY "Users can view their auto-archive rules"
ON public.auto_archive_rules FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their auto-archive rules"
ON public.auto_archive_rules FOR ALL
USING (user_id = auth.uid());

-- Reminders
CREATE POLICY "Users can view reminders on their documents"
ON public.document_reminders FOR SELECT
USING (
    document_id IN (SELECT id FROM public.archive_documents WHERE user_id = auth.uid())
    OR created_by = auth.uid()
    OR auth.uid() = ANY(notify_users)
);

CREATE POLICY "Users can manage their reminders"
ON public.document_reminders FOR ALL
USING (created_by = auth.uid());

-- Annotations
CREATE POLICY "Users can view annotations on their documents"
ON public.document_annotations FOR SELECT
USING (
    document_id IN (SELECT id FROM public.archive_documents WHERE user_id = auth.uid())
    OR (is_private = false AND document_id IN (
        SELECT document_id FROM public.document_shares WHERE shared_with = auth.uid()
    ))
);

CREATE POLICY "Users can manage their annotations"
ON public.document_annotations FOR ALL
USING (created_by = auth.uid());

-- Document Management Table
CREATE POLICY "Anyone can view active management categories"
ON public.document_management_table FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage document management table"
ON public.document_management_table FOR ALL
USING (public.has_role('admin', auth.uid()));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check effective permission (considering negative permissions)
CREATE OR REPLACE FUNCTION public.get_effective_permission(
    p_user_id UUID,
    p_document_id UUID
)
RETURNS share_permission
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_positive_permission share_permission;
    v_has_negative BOOLEAN;
BEGIN
    -- Check for negative permission first (they override)
    SELECT EXISTS (
        SELECT 1 FROM public.document_permissions
        WHERE document_id = p_document_id
        AND user_id = p_user_id
        AND permission_type = 'negative'
        AND (expires_at IS NULL OR expires_at > now())
    ) INTO v_has_negative;
    
    IF v_has_negative THEN
        RETURN NULL; -- Access denied
    END IF;
    
    -- Get highest positive permission
    SELECT permission_level INTO v_positive_permission
    FROM public.document_permissions
    WHERE document_id = p_document_id
    AND user_id = p_user_id
    AND permission_type = 'positive'
    AND (expires_at IS NULL OR expires_at > now())
    ORDER BY 
        CASE permission_level
            WHEN 'full' THEN 4
            WHEN 'edit' THEN 3
            WHEN 'download' THEN 2
            WHEN 'view' THEN 1
        END DESC
    LIMIT 1;
    
    RETURN v_positive_permission;
END;
$$;

-- Generate destruction certificate
CREATE OR REPLACE FUNCTION public.create_destruction_certificate(
    p_document_id UUID,
    p_reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_doc RECORD;
    v_cert_id UUID;
    v_cert_number TEXT;
    v_verification_code TEXT;
BEGIN
    -- Get document info before deletion
    SELECT * INTO v_doc FROM public.archive_documents WHERE id = p_document_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Document not found';
    END IF;
    
    -- Generate certificate number
    v_cert_number := 'DC-' || to_char(now(), 'YYYYMMDD') || '-' || 
                     substring(gen_random_uuid()::text from 1 for 8);
    
    -- Generate verification code
    v_verification_code := encode(gen_random_bytes(16), 'hex');
    
    -- Create certificate
    INSERT INTO public.destruction_certificates (
        certificate_number,
        document_id,
        document_title,
        document_reference,
        document_hash,
        document_type,
        document_size_bytes,
        document_created_at,
        retention_years,
        retention_expired_at,
        destruction_reason,
        destruction_authorized_by,
        verification_hash,
        qr_verification_code
    ) VALUES (
        v_cert_number,
        p_document_id,
        v_doc.title,
        v_doc.reference,
        v_doc.hash_sha256,
        v_doc.document_type,
        v_doc.size_bytes,
        v_doc.created_at,
        v_doc.retention_years,
        COALESCE(v_doc.expiration_date, now()),
        p_reason,
        auth.uid(),
        encode(gen_random_bytes(32), 'hex'),
        v_verification_code
    )
    RETURNING id INTO v_cert_id;
    
    RETURN v_cert_id;
END;
$$;

-- Get upcoming reminders
CREATE OR REPLACE FUNCTION public.get_upcoming_reminders(
    p_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
    reminder_id UUID,
    document_id UUID,
    document_title TEXT,
    reminder_type reminder_type,
    title TEXT,
    reminder_date DATE,
    days_until INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        r.id as reminder_id,
        r.document_id,
        d.title as document_title,
        r.reminder_type,
        r.title,
        r.reminder_date,
        (r.reminder_date - CURRENT_DATE) as days_until
    FROM public.document_reminders r
    JOIN public.archive_documents d ON d.id = r.document_id
    WHERE r.is_active = true
    AND r.acknowledged_at IS NULL
    AND r.reminder_date <= (CURRENT_DATE + p_days_ahead)
    AND r.reminder_date >= CURRENT_DATE
    AND (d.user_id = auth.uid() OR auth.uid() = ANY(r.notify_users))
    ORDER BY r.reminder_date;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_auto_archive_rules_updated_at
BEFORE UPDATE ON public.auto_archive_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_reminders_updated_at
BEFORE UPDATE ON public.document_reminders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_annotations_updated_at
BEFORE UPDATE ON public.document_annotations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_management_table_updated_at
BEFORE UPDATE ON public.document_management_table
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SEED DEFAULT DOCUMENT MANAGEMENT TABLE (Gabonese)
-- =====================================================

INSERT INTO public.document_management_table (
    category_code, category_name, description,
    active_phase_years, semi_active_phase_years, final_disposition,
    legal_reference, document_examples
) VALUES
('FIS-01', 'Documents fiscaux et comptables', 'Tous les documents relatifs aux impôts et à la comptabilité', 
 1, 9, 'destroy', 'Code Général des Impôts du Gabon', 
 ARRAY['Déclarations fiscales', 'Bilans', 'Grand livre', 'Journaux comptables']),
 
('SOC-01', 'Documents du personnel', 'Dossiers individuels des employés',
 5, 45, 'archive_permanent', 'Code du Travail gabonais Art. 180',
 ARRAY['Contrats de travail', 'Bulletins de paie', 'Certificats de travail']),
 
('JUR-01', 'Actes juridiques', 'Documents ayant valeur juridique permanente',
 5, 25, 'archive_permanent', 'Code Civil gabonais',
 ARRAY['Statuts', 'Actes notariés', 'Procès-verbaux AG']),
 
('CTR-01', 'Contrats commerciaux', 'Accords commerciaux et partenariats',
 2, 8, 'destroy', 'Code de Commerce gabonais',
 ARRAY['Contrats clients', 'Contrats fournisseurs', 'Conventions']),
 
('PRJ-01', 'Documentation projets', 'Livrables et documentation technique',
 2, 8, 'sample', 'Bonnes pratiques',
 ARRAY['Cahiers des charges', 'Rapports', 'Livrables techniques']);
