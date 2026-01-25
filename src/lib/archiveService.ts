/**
 * Archive Service - Stub Implementation
 * 
 * This service will be fully implemented when the archive_folders and archive_documents
 * tables are created in the database. For now, it exports the types and stub functions
 * to prevent build errors.
 */

// =============================================================================
// Types
// =============================================================================

export type FolderLevel = 'classeur' | 'dossier' | 'sous_dossier';
export type SharePermission = 'view' | 'download' | 'edit' | 'full';
export type DocumentType = 'contract' | 'invoice' | 'quote' | 'report' | 'project' | 'hr' | 'legal' | 'fiscal' | 'other';
export type DocumentStatus = 'pending' | 'validated' | 'archived' | 'expired' | 'draft';

export interface ArchiveFolder {
  id: string;
  user_id: string;
  organization_id?: string;
  parent_id?: string;
  level: FolderLevel;
  path: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
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
  title?: string;
  description?: string;
  tags?: string[];
  ocr_text?: string;
  ocr_processed: boolean;
  classification?: string;
  classification_confidence?: number;
  metadata?: Record<string, unknown>;
  version: number;
  checksum?: string;
  integrity_verified: boolean;
  last_integrity_check?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  last_accessed_at?: string;
  // Additional fields used by useArchiveManager
  document_type?: DocumentType;
  status?: DocumentStatus;
  reference?: string;
}

export interface DocumentShare {
  id: string;
  document_id: string;
  shared_by: string;
  shared_with_email?: string;
  share_token: string;
  permission: SharePermission;
  expires_at?: string;
  password_hash?: string;
  max_access_count?: number;
  access_count: number;
  created_at: string;
  last_accessed_at?: string;
}

export interface CreateFolderOptions {
  name: string;
  description?: string;
  parentId?: string;
  level: FolderLevel;
  icon?: string;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface UploadOptions {
  file: File;
  folderId?: string;
  title?: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  onProgress?: (progress: number) => void;
}

// Alias for backward compatibility
export type UploadDocumentOptions = UploadOptions;

export interface ShareDocumentOptions {
  permission: SharePermission;
  expiresAt?: Date;
  password?: string;
  maxAccessCount?: number;
  sharedWithEmail?: string;
}

export interface SearchFilters {
  query?: string;
  folderId?: string;
  tags?: string[];
  mimeTypes?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  classification?: string;
}

// =============================================================================
// Stub Functions - These will be implemented when database tables are created
// =============================================================================

export async function getFolders(_parentId?: string): Promise<ArchiveFolder[]> {
  console.warn('archiveService.getFolders: Tables not yet created');
  return [];
}

export async function getFolder(_id: string): Promise<ArchiveFolder | null> {
  console.warn('archiveService.getFolder: Tables not yet created');
  return null;
}

export async function getFolderByPath(_path: string): Promise<ArchiveFolder | null> {
  console.warn('archiveService.getFolderByPath: Tables not yet created');
  return null;
}

export async function getFolderWithAncestors(_id: string): Promise<ArchiveFolder | null> {
  console.warn('archiveService.getFolderWithAncestors: Tables not yet created');
  return null;
}

export async function createFolder(_options: CreateFolderOptions): Promise<ArchiveFolder> {
  console.warn('archiveService.createFolder: Tables not yet created');
  throw new Error('Archive tables not yet created. Please create the archive_folders table first.');
}

export async function updateFolder(_id: string, _updates: Partial<ArchiveFolder>): Promise<ArchiveFolder> {
  console.warn('archiveService.updateFolder: Tables not yet created');
  throw new Error('Archive tables not yet created.');
}

export async function deleteFolder(_id: string, _permanent?: boolean): Promise<void> {
  console.warn('archiveService.deleteFolder: Tables not yet created');
}

export async function getDocuments(_folderId?: string): Promise<ArchiveDocument[]> {
  console.warn('archiveService.getDocuments: Tables not yet created');
  return [];
}

export async function getDocument(_id: string): Promise<ArchiveDocument | null> {
  console.warn('archiveService.getDocument: Tables not yet created');
  return null;
}

export async function searchDocuments(_filters: SearchFilters | string): Promise<ArchiveDocument[]> {
  console.warn('archiveService.searchDocuments: Tables not yet created');
  return [];
}

export async function uploadDocument(_fileOrOptions: File | UploadOptions, _options?: UploadOptions | { folderId?: string }): Promise<ArchiveDocument> {
  console.warn('archiveService.uploadDocument: Tables not yet created');
  throw new Error('Archive tables not yet created. Please create the archive_documents table first.');
}

export async function updateDocument(_id: string, _updates: Partial<ArchiveDocument>): Promise<ArchiveDocument> {
  console.warn('archiveService.updateDocument: Tables not yet created');
  throw new Error('Archive tables not yet created.');
}

export async function deleteDocument(_id: string, _permanent?: boolean): Promise<void> {
  console.warn('archiveService.deleteDocument: Tables not yet created');
}

export async function restoreDocument(_id: string): Promise<ArchiveDocument> {
  console.warn('archiveService.restoreDocument: Tables not yet created');
  throw new Error('Archive tables not yet created.');
}

export async function getDocumentUrl(_id: string): Promise<string> {
  console.warn('archiveService.getDocumentUrl: Tables not yet created');
  return '';
}

export async function shareDocument(_documentId: string, _options: ShareDocumentOptions): Promise<DocumentShare> {
  console.warn('archiveService.shareDocument: Tables not yet created');
  throw new Error('Archive tables not yet created.');
}

export async function getDocumentShares(_documentId: string): Promise<DocumentShare[]> {
  console.warn('archiveService.getDocumentShares: Tables not yet created');
  return [];
}

export async function revokeShare(_shareId: string): Promise<void> {
  console.warn('archiveService.revokeShare: Tables not yet created');
}

export async function accessSharedDocument(
  _token: string,
  _password?: string
): Promise<{ document: ArchiveDocument; url: string } | null> {
  console.warn('archiveService.accessSharedDocument: Tables not yet created');
  return null;
}

export async function verifyDocumentIntegrity(_id: string): Promise<boolean> {
  console.warn('archiveService.verifyDocumentIntegrity: Tables not yet created');
  return true;
}

export async function getStorageStats(): Promise<{
  totalBytes: number;
  usedBytes: number;
  documentCount: number;
  folderCount: number;
}> {
  return {
    totalBytes: 0,
    usedBytes: 0,
    documentCount: 0,
    folderCount: 0,
  };
}

// Alias for backward compatibility
export const getStorageUsage = getStorageStats;
