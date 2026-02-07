/**
 * Archive API Service
 *
 * REST-style API wrapper around archiveService.ts.
 * Migrated from Supabase to Firebase Cloud Functions.
 * Provides standardized API responses (success/error/pagination).
 */

import { auth } from '@/config/firebase';
import {
  getDocuments as getArchiveDocuments,
  getDocument as getArchiveDocument,
  uploadDocument as archiveUpload,
  deleteDocument as archiveDelete,
  getDocumentUrl,
  verifyDocumentIntegrity,
  getFolders as getArchiveFolders,
  createFolder as archiveCreateFolder,
  getAuditLogs,
  shareDocument as archiveShare,
  type ArchiveDocument,
} from './archiveService';

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

function getCurrentUserId(): string {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return user.uid;
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
        getCurrentUserId();
        const allDocs = await getArchiveDocuments(folderId);

        let filtered = allDocs;
        if (type) filtered = filtered.filter(d => d.document_type === type);
        if (status) filtered = filtered.filter(d => d.status === status);

        const totalCount = filtered.length;
        const startIndex = (page - 1) * pageSize;
        const paginatedDocs = filtered.slice(startIndex, startIndex + pageSize);

        return {
            success: true,
            data: paginatedDocs.map(mapDocumentToMetadata),
            page,
            pageSize,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        return { ...createErrorResponse(error instanceof Error ? error.message : 'Unknown error'), page, pageSize, totalCount: 0, totalPages: 0 };
    }
}

export async function getDocument(id: string): Promise<ApiResponse<DocumentMetadata>> {
    try {
        getCurrentUserId();
        const doc = await getArchiveDocument(id);
        if (!doc) throw new Error('Document not found');
        return createResponse(mapDocumentToMetadata(doc));
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

export async function uploadDocument(
    file: File,
    metadata: { title: string; folderId?: string; type?: string; tags?: string[] }
): Promise<ApiResponse<DocumentMetadata>> {
    try {
        const doc = await archiveUpload({
            file,
            folderId: metadata.folderId,
            title: metadata.title,
            documentType: (metadata.type as any) || 'other',
            tags: metadata.tags,
        });
        return createResponse(mapDocumentToMetadata(doc));
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

export async function deleteDocument(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    try {
        getCurrentUserId();
        await archiveDelete(id, false);
        return createResponse({ deleted: true });
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

export async function getDocumentDownloadUrl(id: string): Promise<ApiResponse<{ url: string; expiresAt: string }>> {
    try {
        getCurrentUserId();
        const url = await getDocumentUrl(id);
        return createResponse({
            url,
            expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        });
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

export async function verifyDocumentIntegrityApi(id: string): Promise<ApiResponse<{ valid: boolean; hash: string }>> {
    try {
        getCurrentUserId();
        const isValid = await verifyDocumentIntegrity(id);
        const doc = await getArchiveDocument(id);
        return createResponse({
            valid: isValid,
            hash: doc?.hash_sha256 || '',
        });
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

// ============================================
// FOLDER ENDPOINTS
// ============================================

export async function listFolders(parentId?: string): Promise<ApiResponse<FolderMetadata[]>> {
    try {
        getCurrentUserId();
        const folders = await getArchiveFolders(parentId);

        const folderMetadata: FolderMetadata[] = folders.map(folder => ({
            id: folder.id,
            name: folder.name,
            path: folder.path || `/${folder.name}`,
            parentId: folder.parent_id,
            documentCount: 0,
            createdAt: folder.created_at,
            updatedAt: folder.updated_at,
        }));

        return createResponse(folderMetadata);
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

export async function createFolder(name: string, parentId?: string): Promise<ApiResponse<FolderMetadata>> {
    try {
        getCurrentUserId();
        const folder = await archiveCreateFolder({
            name,
            parentId: parentId || undefined,
            level: parentId ? 'dossier' : 'classeur',
        });

        return createResponse({
            id: folder.id,
            name: folder.name,
            path: folder.path || `/${folder.name}`,
            parentId: folder.parent_id,
            documentCount: 0,
            createdAt: folder.created_at,
            updatedAt: folder.updated_at,
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
        getCurrentUserId();
        const expiresAt = options.expiresIn ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000) : undefined;

        const share = await archiveShare(documentId, {
            permission: options.permission,
            expiresAt,
            password: options.password,
            maxAccessCount: options.maxDownloads,
        });

        return createResponse({
            shareUrl: `${window.location.origin}/shared/${share.share_token}`,
            expiresAt: expiresAt?.toISOString(),
        });
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
}

// ============================================
// AUDIT ENDPOINTS
// ============================================

export async function getAuditLog(documentId: string, page = 1, pageSize = 50) {
    try {
        getCurrentUserId();
        const logs = await getAuditLogs(documentId, pageSize);

        return {
            success: true,
            data: logs.map((log) => ({
                action: log.action,
                actor: log.user_id,
                timestamp: log.created_at,
                details: log.action_details,
            })),
            page,
            pageSize,
            totalCount: logs.length,
            totalPages: 1,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        return { ...createErrorResponse(error instanceof Error ? error.message : 'Unknown error'), page, pageSize, totalCount: 0, totalPages: 0 };
    }
}

// ============================================
// HELPERS
// ============================================

function mapDocumentToMetadata(doc: ArchiveDocument): DocumentMetadata {
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
