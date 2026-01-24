/**
 * Archive Service for Digitalium
 * Centralised API for all document management operations
 */

import { supabase } from '@/integrations/supabase/client';
import {
    generateFileHash,
    generateStoragePath,
    uploadToStorage,
    deleteFromStorage,
    getSignedUrl,
    formatFileSize,
} from './storageUtils';

// =====================================================
// TYPES
// =====================================================

export type DocumentType = 'contract' | 'invoice' | 'quote' | 'report' | 'project' | 'hr' | 'legal' | 'fiscal' | 'other';
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'archived' | 'deleted';
export type FolderLevel = 'classeur' | 'dossier';
export type SharePermission = 'view' | 'download' | 'edit' | 'full';

export interface ArchiveFolder {
    id: string;
    user_id: string;
    organization_id?: string;
    parent_id?: string;
    level: FolderLevel;
    path: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    is_system: boolean;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
}

export interface ArchiveDocument {
    id: string;
    user_id: string;
    organization_id?: string;
    folder_id?: string;
    filename: string;
    original_filename: string;
    mime_type: string;
    size_bytes: number;
    storage_path: string;
    storage_url?: string;
    thumbnail_url?: string;
    title: string;
    description?: string;
    document_type: DocumentType;
    reference?: string;
    author?: string;
    tags: string[];
    status: DocumentStatus;
    hash_sha256: string;
    hash_verified_at?: string;
    version: number;
    is_latest_version: boolean;
    parent_document_id?: string;
    retention_years: number;
    expiration_date?: string;
    is_encrypted: boolean;
    is_signed: boolean;
    ocr_processed: boolean;
    pdf_a_compliant: boolean;
    metadata: Record<string, unknown>;
    deleted_at?: string;
    created_at: string;
    updated_at: string;
    last_accessed_at?: string;
}

export interface DocumentShare {
    id: string;
    document_id: string;
    shared_by: string;
    shared_with?: string;
    share_token?: string;
    permission: SharePermission;
    expires_at?: string;
    max_access_count?: number;
    access_count: number;
    is_active: boolean;
    created_at: string;
    last_accessed_at?: string;
}

export interface UploadOptions {
    folderId?: string;
    title?: string;
    description?: string;
    documentType?: DocumentType;
    tags?: string[];
    onProgress?: (progress: number) => void;
}

export interface SearchOptions {
    folderId?: string;
    documentType?: DocumentType;
    status?: DocumentStatus;
    limit?: number;
}

// =====================================================
// FOLDER OPERATIONS
// =====================================================

/**
 * Get all folders for the current user
 */
export async function getFolders(parentId?: string): Promise<ArchiveFolder[]> {
    let query = supabase
        .from('archive_folders')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

    if (parentId === undefined) {
        query = query.is('parent_id', null);
    } else {
        query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch folders: ${error.message}`);
    return data as ArchiveFolder[];
}

/**
 * Get folder by ID
 */
export async function getFolder(id: string): Promise<ArchiveFolder | null> {
    const { data, error } = await supabase
        .from('archive_folders')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Failed to fetch folder: ${error.message}`);
    }
    return data as ArchiveFolder;
}

/**
 * Create a new folder
 */
export async function createFolder(data: {
    name: string;
    description?: string;
    parentId?: string;
    level?: FolderLevel;
    icon?: string;
    color?: string;
}): Promise<ArchiveFolder> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: folder, error } = await supabase
        .from('archive_folders')
        .insert({
            user_id: user.user.id,
            name: data.name,
            description: data.description,
            parent_id: data.parentId,
            level: data.level || (data.parentId ? 'dossier' : 'classeur'),
            icon: data.icon || '📁',
            color: data.color || 'bg-blue-500',
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create folder: ${error.message}`);

    // Log audit
    await logAudit(null, folder.id, 'create', { name: data.name });

    return folder as ArchiveFolder;
}

/**
 * Update folder
 */
export async function updateFolder(
    id: string,
    data: Partial<Pick<ArchiveFolder, 'name' | 'description' | 'icon' | 'color'>>
): Promise<ArchiveFolder> {
    const { data: folder, error } = await supabase
        .from('archive_folders')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Failed to update folder: ${error.message}`);

    await logAudit(null, id, 'update', data);

    return folder as ArchiveFolder;
}

/**
 * Delete folder (soft delete)
 */
export async function deleteFolder(id: string): Promise<void> {
    const { error } = await supabase
        .from('archive_folders')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(`Failed to delete folder: ${error.message}`);

    await logAudit(null, id, 'delete', {});
}

// =====================================================
// DOCUMENT OPERATIONS
// =====================================================

/**
 * Get documents in a folder
 */
export async function getDocuments(folderId?: string): Promise<ArchiveDocument[]> {
    let query = supabase
        .from('archive_documents')
        .select('*')
        .eq('is_latest_version', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (folderId) {
        query = query.eq('folder_id', folderId);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch documents: ${error.message}`);
    return data as ArchiveDocument[];
}

/**
 * Get document by ID
 */
export async function getDocument(id: string): Promise<ArchiveDocument | null> {
    const { data, error } = await supabase
        .from('archive_documents')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Failed to fetch document: ${error.message}`);
    }

    // Update last accessed
    await supabase
        .from('archive_documents')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', id);

    await logAudit(id, null, 'read', {});

    return data as ArchiveDocument;
}

/**
 * Upload and create a new document
 */
export async function uploadDocument(
    file: File,
    options: UploadOptions = {}
): Promise<ArchiveDocument> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const userId = user.user.id;

    // Generate hash
    options.onProgress?.(5);
    const hash = await generateFileHash(file);
    options.onProgress?.(15);

    // Check for duplicate hash
    const { data: existing } = await supabase
        .from('archive_documents')
        .select('id, title')
        .eq('hash_sha256', hash)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

    if (existing) {
        throw new Error(`Document identique déjà existant: "${existing.title}"`);
    }

    // Upload to storage
    const storagePath = generateStoragePath(userId, file.name);
    options.onProgress?.(20);

    const { path, url } = await uploadToStorage(file, storagePath, (p) => {
        options.onProgress?.(20 + (p * 0.6)); // 20-80%
    });

    options.onProgress?.(85);

    // Determine document type from filename/extension
    const documentType = options.documentType || inferDocumentType(file.name);

    // Create document record
    const { data: document, error } = await supabase
        .from('archive_documents')
        .insert({
            user_id: userId,
            folder_id: options.folderId,
            filename: path.split('/').pop() || file.name,
            original_filename: file.name,
            mime_type: file.type,
            size_bytes: file.size,
            storage_path: path,
            storage_url: url,
            title: options.title || file.name.replace(/\.[^/.]+$/, ''),
            description: options.description,
            document_type: documentType,
            tags: options.tags || [],
            hash_sha256: hash,
            hash_verified_at: new Date().toISOString(),
            author: user.user.user_metadata?.display_name || user.user.email,
        })
        .select()
        .single();

    if (error) {
        // Cleanup uploaded file on error
        await deleteFromStorage(path);
        throw new Error(`Failed to create document: ${error.message}`);
    }

    options.onProgress?.(95);

    // Log audit
    await logAudit(document.id, options.folderId, 'create', {
        filename: file.name,
        size: formatFileSize(file.size),
        hash: hash,
    });

    options.onProgress?.(100);

    return document as ArchiveDocument;
}

/**
 * Update document metadata
 */
export async function updateDocument(
    id: string,
    data: Partial<Pick<ArchiveDocument, 'title' | 'description' | 'document_type' | 'tags' | 'status' | 'folder_id'>>
): Promise<ArchiveDocument> {
    const { data: document, error } = await supabase
        .from('archive_documents')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Failed to update document: ${error.message}`);

    await logAudit(id, null, 'update', data);

    return document as ArchiveDocument;
}

/**
 * Delete document (soft delete)
 */
export async function deleteDocument(id: string, permanent: boolean = false): Promise<void> {
    if (permanent) {
        const { data: doc } = await supabase
            .from('archive_documents')
            .select('storage_path')
            .eq('id', id)
            .single();

        if (doc?.storage_path) {
            await deleteFromStorage(doc.storage_path);
        }

        const { error } = await supabase
            .from('archive_documents')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete document: ${error.message}`);
    } else {
        const { error } = await supabase
            .from('archive_documents')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw new Error(`Failed to delete document: ${error.message}`);
    }

    await logAudit(id, null, 'delete', { permanent });
}

/**
 * Restore deleted document
 */
export async function restoreDocument(id: string): Promise<ArchiveDocument> {
    const { data: document, error } = await supabase
        .from('archive_documents')
        .update({ deleted_at: null })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Failed to restore document: ${error.message}`);

    await logAudit(id, null, 'restore', {});

    return document as ArchiveDocument;
}

/**
 * Get download URL for document
 */
export async function getDocumentDownloadUrl(id: string): Promise<string> {
    const document = await getDocument(id);
    if (!document) throw new Error('Document not found');

    await logAudit(id, null, 'download', {});

    return getSignedUrl(document.storage_path);
}

// =====================================================
// SEARCH
// =====================================================

/**
 * Search documents
 */
export async function searchDocuments(
    query: string,
    options: SearchOptions = {}
): Promise<ArchiveDocument[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Use the database search function
    const { data, error } = await supabase.rpc('search_documents', {
        p_query: query,
        p_user_id: user.user.id,
        p_folder_id: options.folderId || null,
        p_document_type: options.documentType || null,
        p_limit: options.limit || 50,
    });

    if (error) throw new Error(`Search failed: ${error.message}`);

    // Fetch full documents for the results
    if (!data || data.length === 0) return [];

    const ids = data.map((r: { id: string }) => r.id);
    const { data: documents, error: docError } = await supabase
        .from('archive_documents')
        .select('*')
        .in('id', ids);

    if (docError) throw new Error(`Failed to fetch search results: ${docError.message}`);

    return documents as ArchiveDocument[];
}

// =====================================================
// SHARING
// =====================================================

/**
 * Create share link for document
 */
export async function shareDocument(
    documentId: string,
    options: {
        sharedWith?: string;
        permission?: SharePermission;
        expiresAt?: Date;
        maxAccessCount?: number;
        password?: string;
    } = {}
): Promise<DocumentShare> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Generate share token
    const { data: token } = await supabase.rpc('generate_share_token');

    const { data: share, error } = await supabase
        .from('document_shares')
        .insert({
            document_id: documentId,
            shared_by: user.user.id,
            shared_with: options.sharedWith,
            share_token: token,
            permission: options.permission || 'view',
            expires_at: options.expiresAt?.toISOString(),
            max_access_count: options.maxAccessCount,
            // Note: password hashing should be done server-side via RPC
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to share document: ${error.message}`);

    await logAudit(documentId, null, 'share', {
        permission: options.permission,
        expires: options.expiresAt?.toISOString(),
    });

    return share as DocumentShare;
}

/**
 * Get shares for a document
 */
export async function getDocumentShares(documentId: string): Promise<DocumentShare[]> {
    const { data, error } = await supabase
        .from('document_shares')
        .select('*')
        .eq('document_id', documentId)
        .eq('is_active', true);

    if (error) throw new Error(`Failed to fetch shares: ${error.message}`);
    return data as DocumentShare[];
}

/**
 * Revoke a share
 */
export async function revokeShare(shareId: string): Promise<void> {
    const { data: share } = await supabase
        .from('document_shares')
        .select('document_id')
        .eq('id', shareId)
        .single();

    const { error } = await supabase
        .from('document_shares')
        .update({ is_active: false })
        .eq('id', shareId);

    if (error) throw new Error(`Failed to revoke share: ${error.message}`);

    if (share) {
        await logAudit(share.document_id, null, 'unshare', { share_id: shareId });
    }
}

// =====================================================
// STATISTICS
// =====================================================

/**
 * Get storage usage for current user
 */
export async function getStorageUsage(): Promise<{
    usedBytes: number;
    usedFormatted: string;
    documentCount: number;
    folderCount: number;
}> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Get storage bytes via RPC
    const { data: usedBytes } = await supabase.rpc('get_user_storage_usage', {
        p_user_id: user.user.id,
    });

    // Count documents
    const { count: docCount } = await supabase
        .from('archive_documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user.id)
        .is('deleted_at', null)
        .eq('is_latest_version', true);

    // Count folders
    const { count: folderCount } = await supabase
        .from('archive_folders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user.id)
        .is('deleted_at', null);

    return {
        usedBytes: usedBytes || 0,
        usedFormatted: formatFileSize(usedBytes || 0),
        documentCount: docCount || 0,
        folderCount: folderCount || 0,
    };
}

// =====================================================
// AUDIT LOGGING
// =====================================================

async function logAudit(
    documentId: string | null,
    folderId: string | null,
    action: string,
    details: Record<string, unknown>
): Promise<void> {
    try {
        await supabase.rpc('log_audit_action', {
            p_document_id: documentId,
            p_folder_id: folderId,
            p_action: action,
            p_details: details,
        });
    } catch (err) {
        console.error('Failed to log audit action:', err);
    }
}

// =====================================================
// UTILITIES
// =====================================================

function inferDocumentType(filename: string): DocumentType {
    const lower = filename.toLowerCase();
    if (lower.includes('contrat') || lower.includes('contract')) return 'contract';
    if (lower.includes('facture') || lower.includes('invoice')) return 'invoice';
    if (lower.includes('devis') || lower.includes('quote')) return 'quote';
    if (lower.includes('rapport') || lower.includes('report')) return 'report';
    if (lower.includes('projet') || lower.includes('project')) return 'project';
    if (lower.includes('rh') || lower.includes('paie') || lower.includes('salaire')) return 'hr';
    if (lower.includes('juridique') || lower.includes('legal')) return 'legal';
    if (lower.includes('fiscal') || lower.includes('impot') || lower.includes('tax')) return 'fiscal';
    return 'other';
}
