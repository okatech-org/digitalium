-- =====================================================
-- DIGITALIUM ARCHIVE SYSTEM MIGRATION
-- =====================================================
-- Phase 1 MVP: Complete document archiving infrastructure
-- - Hierarchical folders (classeurs + dossiers)
-- - Documents with integrity hashing
-- - Version history
-- - Secure sharing
-- - Audit logging
-- - Retention policies
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

-- Document status lifecycle
CREATE TYPE public.document_status AS ENUM (
    'draft',        -- brouillon
    'pending',      -- en_revision
    'approved',     -- approuve
    'archived',     -- archive
    'deleted'       -- supprimé (soft delete)
);

-- Document type categories
CREATE TYPE public.document_type AS ENUM (
    'contract',     -- contrat
    'invoice',      -- facture
    'quote',        -- devis
    'report',       -- rapport
    'project',      -- projet
    'hr',           -- ressources humaines
    'legal',        -- juridique
    'fiscal',       -- fiscal
    'other'         -- autre
);

-- Folder level (for hierarchy)
CREATE TYPE public.folder_level AS ENUM (
    'classeur',     -- Top level binder
    'dossier'       -- Subfolder
);

-- Share permission levels
CREATE TYPE public.share_permission AS ENUM (
    'view',         -- Can only view
    'download',     -- Can view and download
    'edit',         -- Can edit metadata
    'full'          -- Full access including delete
);

-- Audit action types
CREATE TYPE public.audit_action AS ENUM (
    'create',
    'read',
    'update',
    'delete',
    'download',
    'share',
    'unshare',
    'restore',
    'version',
    'sign',
    'export'
);

-- =====================================================
-- ARCHIVE FOLDERS TABLE (Unified: Classeurs + Dossiers)
-- =====================================================

CREATE TABLE public.archive_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Hierarchy
    parent_id UUID REFERENCES public.archive_folders(id) ON DELETE CASCADE,
    level folder_level NOT NULL DEFAULT 'classeur',
    path TEXT NOT NULL DEFAULT '/', -- Full path like /Entreprise/Contrats
    
    -- Metadata
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📁',
    color TEXT DEFAULT 'bg-blue-500',
    
    -- System folders can't be deleted
    is_system BOOLEAN NOT NULL DEFAULT false,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.archive_folders ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_archive_folders_user ON public.archive_folders(user_id);
CREATE INDEX idx_archive_folders_parent ON public.archive_folders(parent_id);
CREATE INDEX idx_archive_folders_path ON public.archive_folders(path);
CREATE INDEX idx_archive_folders_level ON public.archive_folders(level);

-- =====================================================
-- ARCHIVE DOCUMENTS TABLE
-- =====================================================

CREATE TABLE public.archive_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.archive_folders(id) ON DELETE SET NULL,
    
    -- File information
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL, -- Path in Supabase Storage
    storage_url TEXT, -- Public or signed URL
    thumbnail_url TEXT,
    
    -- Document metadata
    title TEXT NOT NULL,
    description TEXT,
    document_type document_type NOT NULL DEFAULT 'other',
    reference TEXT, -- External reference code (CTR-2024-001)
    author TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Status and lifecycle
    status document_status NOT NULL DEFAULT 'draft',
    
    -- Integrity
    hash_sha256 TEXT NOT NULL, -- SHA-256 hash for integrity
    hash_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Versioning
    version INTEGER NOT NULL DEFAULT 1,
    is_latest_version BOOLEAN NOT NULL DEFAULT true,
    parent_document_id UUID REFERENCES public.archive_documents(id),
    
    -- Retention
    retention_years INTEGER DEFAULT 10,
    expiration_date TIMESTAMP WITH TIME ZONE,
    
    -- Security
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    encryption_method TEXT,
    access_level TEXT NOT NULL DEFAULT 'private',
    
    -- Signature
    is_signed BOOLEAN NOT NULL DEFAULT false,
    signature_data JSONB,
    signed_at TIMESTAMP WITH TIME ZONE,
    
    -- OCR and search
    extracted_text TEXT, -- For full-text search
    ocr_processed BOOLEAN NOT NULL DEFAULT false,
    pdf_a_compliant BOOLEAN NOT NULL DEFAULT false,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_accessed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.archive_documents ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_archive_docs_user ON public.archive_documents(user_id);
CREATE INDEX idx_archive_docs_folder ON public.archive_documents(folder_id);
CREATE INDEX idx_archive_docs_type ON public.archive_documents(document_type);
CREATE INDEX idx_archive_docs_status ON public.archive_documents(status);
CREATE INDEX idx_archive_docs_hash ON public.archive_documents(hash_sha256);
CREATE INDEX idx_archive_docs_deleted ON public.archive_documents(deleted_at) WHERE deleted_at IS NULL;

-- Full-text search index
CREATE INDEX idx_archive_docs_search ON public.archive_documents 
    USING gin(to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(extracted_text, '')));

-- =====================================================
-- DOCUMENT VERSIONS TABLE
-- =====================================================

CREATE TABLE public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.archive_documents(id) ON DELETE CASCADE NOT NULL,
    
    -- Version info
    version_number INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    storage_url TEXT,
    hash_sha256 TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    
    -- Change tracking
    change_description TEXT,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE (document_id, version_number)
);

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_doc_versions_doc ON public.document_versions(document_id);

-- =====================================================
-- DOCUMENT SHARES TABLE
-- =====================================================

CREATE TABLE public.document_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.archive_documents(id) ON DELETE CASCADE NOT NULL,
    shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for public links
    
    -- Share link (for public/anonymous access)
    share_token TEXT UNIQUE,
    password_hash TEXT, -- For password-protected links
    
    -- Permissions
    permission share_permission NOT NULL DEFAULT 'view',
    
    -- Limits
    expires_at TIMESTAMP WITH TIME ZONE,
    max_access_count INTEGER,
    access_count INTEGER NOT NULL DEFAULT 0,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_accessed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_doc_shares_document ON public.document_shares(document_id);
CREATE INDEX idx_doc_shares_token ON public.document_shares(share_token);
CREATE INDEX idx_doc_shares_user ON public.document_shares(shared_with);

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE public.archive_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Target
    document_id UUID REFERENCES public.archive_documents(id) ON DELETE SET NULL,
    folder_id UUID REFERENCES public.archive_folders(id) ON DELETE SET NULL,
    
    -- Actor
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    
    -- Action
    action audit_action NOT NULL,
    action_details JSONB DEFAULT '{}',
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.archive_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_audit_logs_document ON public.archive_audit_logs(document_id);
CREATE INDEX idx_audit_logs_folder ON public.archive_audit_logs(folder_id);
CREATE INDEX idx_audit_logs_user ON public.archive_audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.archive_audit_logs(action);
CREATE INDEX idx_audit_logs_created ON public.archive_audit_logs(created_at);

-- =====================================================
-- RETENTION POLICIES TABLE
-- =====================================================

CREATE TABLE public.retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Policy definition
    name TEXT NOT NULL,
    document_type document_type NOT NULL,
    retention_years INTEGER NOT NULL,
    auto_delete BOOLEAN NOT NULL DEFAULT false,
    
    -- Legal basis
    legal_reference TEXT, -- Law or regulation reference
    description TEXT,
    
    -- Applicability
    is_default BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.retention_policies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Archive Folders
CREATE POLICY "Users can view their own folders"
ON public.archive_folders FOR SELECT
USING (user_id = auth.uid() OR organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create folders"
ON public.archive_folders FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own folders"
ON public.archive_folders FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own folders"
ON public.archive_folders FOR DELETE
USING (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Admins can manage all folders"
ON public.archive_folders FOR ALL
USING (public.has_role('admin', auth.uid()));

-- Archive Documents
CREATE POLICY "Users can view their own documents"
ON public.archive_documents FOR SELECT
USING (user_id = auth.uid() OR organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can view shared documents"
ON public.archive_documents FOR SELECT
USING (id IN (
    SELECT document_id FROM public.document_shares 
    WHERE (shared_with = auth.uid() OR share_token IS NOT NULL)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
));

CREATE POLICY "Users can create documents"
ON public.archive_documents FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own documents"
ON public.archive_documents FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own documents"
ON public.archive_documents FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all documents"
ON public.archive_documents FOR ALL
USING (public.has_role('admin', auth.uid()));

-- Document Versions
CREATE POLICY "Users can view versions of their documents"
ON public.document_versions FOR SELECT
USING (document_id IN (
    SELECT id FROM public.archive_documents WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create versions of their documents"
ON public.document_versions FOR INSERT
WITH CHECK (document_id IN (
    SELECT id FROM public.archive_documents WHERE user_id = auth.uid()
));

-- Document Shares
CREATE POLICY "Users can view shares they created or received"
ON public.document_shares FOR SELECT
USING (shared_by = auth.uid() OR shared_with = auth.uid());

CREATE POLICY "Users can create shares for their documents"
ON public.document_shares FOR INSERT
WITH CHECK (document_id IN (
    SELECT id FROM public.archive_documents WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their shares"
ON public.document_shares FOR UPDATE
USING (shared_by = auth.uid());

CREATE POLICY "Users can delete their shares"
ON public.document_shares FOR DELETE
USING (shared_by = auth.uid());

-- Audit Logs (read-only for users, insert via functions)
CREATE POLICY "Users can view their own audit logs"
ON public.archive_audit_logs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all audit logs"
ON public.archive_audit_logs FOR SELECT
USING (public.has_role('admin', auth.uid()));

-- Retention Policies
CREATE POLICY "Anyone can view default policies"
ON public.retention_policies FOR SELECT
USING (is_default = true OR organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage retention policies"
ON public.retention_policies FOR ALL
USING (public.has_role('admin', auth.uid()));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Generate share token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Log audit action
CREATE OR REPLACE FUNCTION public.log_audit_action(
    p_document_id UUID,
    p_folder_id UUID,
    p_action audit_action,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.archive_audit_logs (document_id, folder_id, user_id, action, action_details)
    VALUES (p_document_id, p_folder_id, auth.uid(), p_action, p_details)
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$;

-- Calculate folder path
CREATE OR REPLACE FUNCTION public.update_folder_path()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    parent_path TEXT;
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.path := '/' || NEW.name;
    ELSE
        SELECT path INTO parent_path FROM public.archive_folders WHERE id = NEW.parent_id;
        NEW.path := parent_path || '/' || NEW.name;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_folder_path
BEFORE INSERT OR UPDATE OF name, parent_id ON public.archive_folders
FOR EACH ROW EXECUTE FUNCTION public.update_folder_path();

-- Get storage usage for user
CREATE OR REPLACE FUNCTION public.get_user_storage_usage(p_user_id UUID)
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(SUM(size_bytes), 0)
    FROM public.archive_documents
    WHERE user_id = p_user_id
    AND deleted_at IS NULL
    AND is_latest_version = true;
$$;

-- Search documents with full-text
CREATE OR REPLACE FUNCTION public.search_documents(
    p_query TEXT,
    p_user_id UUID DEFAULT auth.uid(),
    p_folder_id UUID DEFAULT NULL,
    p_document_type document_type DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    document_type document_type,
    status document_status,
    folder_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    rank REAL
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        d.id,
        d.title,
        d.description,
        d.document_type,
        d.status,
        d.folder_id,
        d.created_at,
        ts_rank(
            to_tsvector('french', coalesce(d.title, '') || ' ' || coalesce(d.description, '') || ' ' || coalesce(d.extracted_text, '')),
            plainto_tsquery('french', p_query)
        ) as rank
    FROM public.archive_documents d
    WHERE d.user_id = p_user_id
    AND d.deleted_at IS NULL
    AND d.is_latest_version = true
    AND (p_folder_id IS NULL OR d.folder_id = p_folder_id)
    AND (p_document_type IS NULL OR d.document_type = p_document_type)
    AND (
        to_tsvector('french', coalesce(d.title, '') || ' ' || coalesce(d.description, '') || ' ' || coalesce(d.extracted_text, ''))
        @@ plainto_tsquery('french', p_query)
        OR d.title ILIKE '%' || p_query || '%'
        OR d.reference ILIKE '%' || p_query || '%'
        OR p_query = ANY(d.tags)
    )
    ORDER BY rank DESC, d.created_at DESC
    LIMIT p_limit;
$$;

-- Validate share access
CREATE OR REPLACE FUNCTION public.validate_share_access(
    p_share_token TEXT,
    p_password TEXT DEFAULT NULL
)
RETURNS TABLE (
    document_id UUID,
    permission share_permission,
    is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    share_record RECORD;
BEGIN
    SELECT * INTO share_record
    FROM public.document_shares
    WHERE share_token = p_share_token
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_access_count IS NULL OR access_count < max_access_count);
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, NULL::share_permission, false;
        RETURN;
    END IF;
    
    -- Check password if required
    IF share_record.password_hash IS NOT NULL THEN
        IF p_password IS NULL OR crypt(p_password, share_record.password_hash) != share_record.password_hash THEN
            RETURN QUERY SELECT NULL::UUID, NULL::share_permission, false;
            RETURN;
        END IF;
    END IF;
    
    -- Increment access count
    UPDATE public.document_shares
    SET access_count = access_count + 1, last_accessed_at = now()
    WHERE id = share_record.id;
    
    RETURN QUERY SELECT share_record.document_id, share_record.permission, true;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER update_archive_folders_updated_at
BEFORE UPDATE ON public.archive_folders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_archive_documents_updated_at
BEFORE UPDATE ON public.archive_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retention_policies_updated_at
BEFORE UPDATE ON public.retention_policies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SEED DEFAULT RETENTION POLICIES (Gabonese Law)
-- =====================================================

INSERT INTO public.retention_policies (name, document_type, retention_years, legal_reference, description, is_default) VALUES
('Documents fiscaux', 'fiscal', 10, 'Code Général des Impôts du Gabon', 'Conservation obligatoire 10 ans pour documents fiscaux', true),
('Contrats commerciaux', 'contract', 10, 'Code Civil gabonais', 'Durée de prescription commerciale', true),
('Documents RH', 'hr', 5, 'Code du Travail gabonais', 'Conservation des documents du personnel', true),
('Factures', 'invoice', 10, 'Code Général des Impôts', 'Pièces justificatives comptables', true),
('Devis', 'quote', 3, 'Code de Commerce', 'Conservation courte pour propositions', true),
('Documents juridiques', 'legal', 30, 'Code Civil gabonais', 'Conservation longue pour actes juridiques', true),
('Rapports', 'report', 5, 'Bonnes pratiques', 'Conservation standard pour rapports internes', true),
('Projets', 'project', 10, 'Bonnes pratiques', 'Documentation projet et livrables', true),
('Autres documents', 'other', 5, 'Bonnes pratiques', 'Durée par défaut', true);

-- =====================================================
-- STORAGE BUCKET CONFIGURATION (run in Supabase dashboard)
-- =====================================================
-- Note: Create bucket 'archive-documents' in Supabase Storage dashboard
-- with the following RLS policies:
-- 
-- SELECT: Allow users to read their own files
--   (bucket_id = 'archive-documents' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- INSERT: Allow users to upload to their own folder
--   (bucket_id = 'archive-documents' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- DELETE: Allow users to delete their own files
--   (bucket_id = 'archive-documents' AND auth.uid()::text = (storage.foldername(name))[1])
