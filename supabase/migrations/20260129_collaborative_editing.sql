-- =====================================================
-- COLLABORATIVE EDITING SYSTEM MIGRATION
-- =====================================================
-- Real-time co-editing infrastructure for iDocument
-- - Collaborative documents with Yjs state storage
-- - Real-time presence tracking
-- - Edit history for audit trail
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

-- Collaborative document status
CREATE TYPE public.collaborative_document_status AS ENUM (
    'draft',      -- Initial creation
    'editing',    -- Active editing session
    'review',     -- Under review
    'archived'    -- Transferred to iArchive
);

-- Collaborator role
CREATE TYPE public.collaborator_role AS ENUM (
    'editor',     -- Can edit content
    'commenter',  -- Can comment only
    'viewer'      -- Read-only access
);

-- Edit action types
CREATE TYPE public.edit_action AS ENUM (
    'created',
    'edited',
    'commented',
    'archived',
    'restored'
);

-- =====================================================
-- COLLABORATIVE DOCUMENTS TABLE
-- =====================================================

CREATE TABLE public.collaborative_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ownership
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    team_id UUID, -- Optional team association
    
    -- Content
    title TEXT NOT NULL DEFAULT 'Sans titre',
    content TEXT DEFAULT '', -- Yjs state encoded in base64
    
    -- Status
    status collaborative_document_status NOT NULL DEFAULT 'draft',
    
    -- Collaborators (JSONB array)
    collaborators JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- Format: [{ "userId": "uuid", "role": "editor|viewer|commenter", "addedAt": timestamp }]
    
    -- Tracking
    last_edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.collaborative_documents ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_collab_docs_owner ON public.collaborative_documents(owner_id);
CREATE INDEX idx_collab_docs_org ON public.collaborative_documents(organization_id);
CREATE INDEX idx_collab_docs_status ON public.collaborative_documents(status);
CREATE INDEX idx_collab_docs_updated ON public.collaborative_documents(updated_at DESC);

-- =====================================================
-- DOCUMENT PRESENCE TABLE (Real-time tracking)
-- =====================================================

CREATE TABLE public.document_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.collaborative_documents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- User display info (cached for performance)
    user_name TEXT NOT NULL DEFAULT 'Anonyme',
    user_color TEXT NOT NULL DEFAULT '#4ECDC4',
    
    -- Cursor position
    cursor_position JSONB, -- { "from": number, "to": number }
    
    -- Activity tracking
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Unique constraint: one presence per user per document
    UNIQUE (document_id, user_id)
);

ALTER TABLE public.document_presence ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_doc_presence_document ON public.document_presence(document_id);
CREATE INDEX idx_doc_presence_user ON public.document_presence(user_id);
CREATE INDEX idx_doc_presence_last_seen ON public.document_presence(last_seen);

-- =====================================================
-- DOCUMENT EDIT HISTORY TABLE
-- =====================================================

CREATE TABLE public.document_edit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.collaborative_documents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    
    -- Action details
    action edit_action NOT NULL,
    snapshot TEXT, -- Optional Yjs snapshot for version recovery
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.document_edit_history ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_edit_history_document ON public.document_edit_history(document_id);
CREATE INDEX idx_edit_history_user ON public.document_edit_history(user_id);
CREATE INDEX idx_edit_history_created ON public.document_edit_history(created_at DESC);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Collaborative Documents: Owner and collaborators can access
CREATE POLICY "Owner can manage their documents"
ON public.collaborative_documents FOR ALL
USING (owner_id = auth.uid());

CREATE POLICY "Collaborators can view documents"
ON public.collaborative_documents FOR SELECT
USING (
    collaborators @> jsonb_build_array(jsonb_build_object('userId', auth.uid()::text))
    OR owner_id = auth.uid()
);

CREATE POLICY "Editors can update documents"
ON public.collaborative_documents FOR UPDATE
USING (
    owner_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(collaborators) AS c
        WHERE (c->>'userId')::uuid = auth.uid()
        AND c->>'role' IN ('editor')
    )
);

-- Document Presence: Anyone on the document can see/update presence
CREATE POLICY "Users can manage their own presence"
ON public.document_presence FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users can view presence on accessible documents"
ON public.document_presence FOR SELECT
USING (
    document_id IN (
        SELECT id FROM public.collaborative_documents
        WHERE owner_id = auth.uid()
        OR collaborators @> jsonb_build_array(jsonb_build_object('userId', auth.uid()::text))
    )
);

-- Edit History: Read-only for document participants
CREATE POLICY "Participants can view edit history"
ON public.document_edit_history FOR SELECT
USING (
    document_id IN (
        SELECT id FROM public.collaborative_documents
        WHERE owner_id = auth.uid()
        OR collaborators @> jsonb_build_array(jsonb_build_object('userId', auth.uid()::text))
    )
);

CREATE POLICY "System can insert edit history"
ON public.document_edit_history FOR INSERT
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Clean up stale presence records (older than 5 minutes)
CREATE OR REPLACE FUNCTION public.cleanup_stale_presence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.document_presence
    WHERE last_seen < now() - INTERVAL '5 minutes';
END;
$$;

-- Get active collaborators for a document
CREATE OR REPLACE FUNCTION public.get_active_collaborators(p_document_id UUID)
RETURNS TABLE (
    user_id UUID,
    user_name TEXT,
    user_color TEXT,
    cursor_position JSONB,
    last_seen TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT user_id, user_name, user_color, cursor_position, last_seen
    FROM public.document_presence
    WHERE document_id = p_document_id
    AND last_seen > now() - INTERVAL '5 minutes'
    ORDER BY last_seen DESC;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at
CREATE TRIGGER update_collab_docs_updated_at
BEFORE UPDATE ON public.collaborative_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- REALTIME CONFIGURATION
-- =====================================================

-- Enable realtime for presence tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborative_documents;
