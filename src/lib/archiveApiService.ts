/**
 * Archive API Service
 * 
 * REST API endpoints for iArchive integration.
 * NOTE: Uses 'as any' casts until archive tables are added to Supabase types.
 */

import { supabase } from '@/integrations/supabase/client';

// Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface DocumentMetadata {
    id: string;
    title: string;
    reference?: string;
    type: string;
    mimeType: string;
    size: number;
    hash: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    folderId?: string;
    folderPath?: string;
    retentionCategory?: string;
    tags?: string[];
}

export interface FolderMetadata {
    id: string;
    name: string;
    path: string;
    parentId?: string;
    documentCount: number;
    createdAt: string;
    updatedAt: string;
}

// API Configuration
const API_VERSION = 'v1';

// Helper functions
function createResponse<T>(data: T): ApiResponse<T> {
    return { success: true, data, timestamp: new Date().toISOString() };
}

function createErrorResponse(error: string): ApiResponse<never> {
    return { success: false, error, timestamp: new Date().toISOString() };
}

async function getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return user.id;
}

// ============================================
// DOCUMENT ENDPOINTS
// ============================================

export async function listDocuments(
    page = 1,
    pageSize = 20,
    folderId?: string,
    type?: string,
    status?: string
): Promise<PaginatedResponse<DocumentMetadata>> {
    try {
        const userId = await getCurrentUserId();

        let query = (supabase as any)
            .from('archive_documents')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1);

        if (folderId) query = query.eq('folder_id', folderId);
        if (type) query = query.eq('document_type', type);
        if (status) query = query.eq('status', status);

        const { data, count, error } = await query;
        if (error) throw error;

        return {
            success: true,
            data: (data || []).map(mapDocumentToMetadata),
            page,
            pageSize,
            totalCount: count || 0,
            totalPages: Math.ceil((count || 0) / pageSize),
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        return { ...createErrorResponse(error instanceof Error ? error.message : 'Unknown error'), page, pageSize, totalCount: 0, totalPages: 0 };
    }
}

export async function getDocument(id: string): Promise<ApiResponse<DocumentMetadata>> {
    try {
        const userId = await getCurrentUserId();
        const { data, error } = await (supabase as any)
            .from('archive_documents')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        if (!data) throw new Error('Document not found');
        return createResponse(mapDocumentToMetadata(data));
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

export async function uploadDocument(
    file: File,
    metadata: { title: string; folderId?: string; type?: string; tags?: string[] }
): Promise<ApiResponse<DocumentMetadata>> {
    try {
        const userId = await getCurrentUserId();

        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        const storagePath = `${userId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('archive-documents').upload(storagePath, file);
        if (uploadError) throw uploadError;

        const { data, error } = await (supabase as any)
            .from('archive_documents')
            .insert({
                user_id: userId,
                title: metadata.title,
                original_name: file.name,
                mime_type: file.type,
                size_bytes: file.size,
                storage_path: storagePath,
                hash_sha256: hash,
                folder_id: metadata.folderId || null,
                document_type: metadata.type || 'other',
                status: 'active',
            })
            .select()
            .single();

        if (error) throw error;
        return createResponse(mapDocumentToMetadata(data));
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

export async function deleteDocument(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
        const userId = await getCurrentUserId();
        const { error } = await (supabase as any)
            .from('archive_documents')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        return createResponse({ deleted: true });
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

export async function getDocumentDownloadUrl(id: string): Promise<ApiResponse<{ url: string; expiresAt: string }>> {
    try {
        const userId = await getCurrentUserId();
        const { data: doc, error: docError } = await (supabase as any)
            .from('archive_documents')
            .select('storage_path')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (docError || !doc) throw new Error('Document not found');

        const { data, error } = await supabase.storage
            .from('archive-documents')
            .createSignedUrl(doc.storage_path, 3600);

        if (error) throw error;
        return createResponse({ url: data.signedUrl, expiresAt: new Date(Date.now() + 3600 * 1000).toISOString() });
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

export async function verifyDocumentIntegrity(id: string): Promise<ApiResponse<{ valid: boolean; hash: string }>> {
    try {
        const userId = await getCurrentUserId();
        const { data: doc, error: docError } = await (supabase as any)
            .from('archive_documents')
            .select('storage_path, hash_sha256')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (docError || !doc) throw new Error('Document not found');

        const { data: fileData, error: downloadError } = await supabase.storage.from('archive-documents').download(doc.storage_path);
        if (downloadError) throw downloadError;

        const hashBuffer = await crypto.subtle.digest('SHA-256', await fileData.arrayBuffer());
        const currentHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        const isValid = currentHash === doc.hash_sha256;

        await (supabase as any).from('archive_documents').update({ hash_verified_at: new Date().toISOString() }).eq('id', id);

        return createResponse({ valid: isValid, hash: currentHash });
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

// ============================================
// FOLDER ENDPOINTS
// ============================================

export async function listFolders(parentId?: string): Promise<ApiResponse<FolderMetadata[]>> {
    try {
        const userId = await getCurrentUserId();
        let query = (supabase as any)
            .from('archive_folders')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('name');

        if (parentId) query = query.eq('parent_id', parentId);
        else query = query.is('parent_id', null);

        const { data, error } = await query;
        if (error) throw error;

        const folders = await Promise.all((data || []).map(async (folder: any) => {
            const { count } = await (supabase as any)
                .from('archive_documents')
                .select('*', { count: 'exact', head: true })
                .eq('folder_id', folder.id)
                .is('deleted_at', null);

            return {
                id: folder.id,
                name: folder.name,
                path: folder.path || `/${folder.name}`,
                parentId: folder.parent_id,
                documentCount: count || 0,
                createdAt: folder.created_at,
                updatedAt: folder.updated_at,
            };
        }));

        return createResponse(folders);
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

export async function createFolder(name: string, parentId?: string): Promise<ApiResponse<FolderMetadata>> {
    try {
        const userId = await getCurrentUserId();
        const { data, error } = await (supabase as any)
            .from('archive_folders')
            .insert({ user_id: userId, name, parent_id: parentId || null, path: parentId ? null : `/${name}` })
            .select()
            .single();

        if (error) throw error;
        return createResponse({
            id: data.id,
            name: data.name,
            path: data.path || `/${data.name}`,
            parentId: data.parent_id,
            documentCount: 0,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        });
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

// ============================================
// SHARE ENDPOINTS
// ============================================

export async function createShareLink(
    documentId: string,
    options: { permission: 'view' | 'download' | 'edit'; expiresIn?: number; password?: string; maxDownloads?: number }
): Promise<ApiResponse<{ shareUrl: string; expiresAt?: string }>> {
    try {
        const userId = await getCurrentUserId();
        const expiresAt = options.expiresIn ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000).toISOString() : null;

        const { data, error } = await (supabase as any)
            .from('document_shares')
            .insert({
                document_id: documentId,
                shared_by: userId,
                share_type: 'link',
                permission: options.permission,
                expires_at: expiresAt,
                password_hash: options.password ? await hashPassword(options.password) : null,
                max_downloads: options.maxDownloads || null,
                access_token: generateAccessToken(),
            })
            .select()
            .single();

        if (error) throw error;
        return createResponse({ shareUrl: `${window.location.origin}/shared/${data.access_token}`, expiresAt: expiresAt || undefined });
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

// ============================================
// AUDIT ENDPOINTS
// ============================================

export async function getAuditLog(documentId: string, page = 1, pageSize = 50) {
    try {
        await getCurrentUserId();
        const { data, count, error } = await (supabase as any)
            .from('archive_audit_logs')
            .select('*', { count: 'exact' })
            .eq('document_id', documentId)
            .order('created_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1);

        if (error) throw error;
        return {
            success: true,
            data: (data || []).map((log: any) => ({ action: log.action, actor: log.actor_id, timestamp: log.created_at, details: log.metadata })),
            page, pageSize, totalCount: count || 0, totalPages: Math.ceil((count || 0) / pageSize), timestamp: new Date().toISOString(),
        };
    } catch (error) {
        return { ...createErrorResponse(error instanceof Error ? error.message : 'Unknown error'), page, pageSize, totalCount: 0, totalPages: 0 };
    }
}

// ============================================
// HELPERS
// ============================================

function mapDocumentToMetadata(doc: any): DocumentMetadata {
    return {
        id: doc.id,
        title: doc.title,
        reference: doc.reference,
        type: doc.document_type,
        mimeType: doc.mime_type,
        size: doc.size_bytes,
        hash: doc.hash_sha256,
        status: doc.status,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        folderId: doc.folder_id,
        retentionCategory: doc.retention_category,
        tags: doc.tags,
    };
}

async function hashPassword(password: string): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateAccessToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const ARCHIVE_API_VERSION = API_VERSION;
