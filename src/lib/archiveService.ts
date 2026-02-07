/**
 * Archive Service - Cloud Functions Implementation
 *
 * Migrated from Supabase to Firebase Cloud Functions + Cloud SQL.
 * All database operations go through Cloud Functions.
 * File storage uses Firebase Storage.
 *
 * Tables: archive_folders, archive_documents, document_versions,
 *         document_shares, archive_audit_logs, retention_policies
 */

import { functions, storage, auth } from '@/config/firebase';
import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// =============================================================================
// Types
// =============================================================================

export type FolderLevel = 'classeur' | 'dossier';
export type SharePermission = 'view' | 'download' | 'edit' | 'full';
export type DocumentType = 'contract' | 'invoice' | 'quote' | 'report' | 'project' | 'hr' | 'legal' | 'fiscal' | 'other';
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'archived' | 'deleted';
export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'download' | 'share' | 'unshare' | 'restore' | 'version' | 'sign' | 'export';

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
  encryption_method?: string;
  access_level: string;
  is_signed: boolean;
  signature_data?: Record<string, unknown>;
  signed_at?: string;
  extracted_text?: string;
  ocr_processed: boolean;
  pdf_a_compliant: boolean;
  metadata?: Record<string, unknown>;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  storage_path: string;
  storage_url?: string;
  hash_sha256: string;
  size_bytes: number;
  change_description?: string;
  changed_by?: string;
  created_at: string;
}

export interface DocumentShare {
  id: string;
  document_id: string;
  shared_by: string;
  shared_with?: string;
  share_token?: string;
  password_hash?: string;
  permission: SharePermission;
  expires_at?: string;
  max_access_count?: number;
  access_count: number;
  is_active: boolean;
  created_at: string;
  last_accessed_at?: string;
}

export interface AuditLogEntry {
  id: string;
  document_id?: string;
  folder_id?: string;
  user_id: string;
  action: AuditAction;
  action_details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface RetentionPolicy {
  id: string;
  organization_id?: string;
  name: string;
  document_type: DocumentType;
  retention_years: number;
  auto_delete: boolean;
  legal_reference?: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFolderOptions {
  name: string;
  description?: string;
  parentId?: string;
  level: FolderLevel;
  icon?: string;
  color?: string;
}

export interface UploadOptions {
  file: File;
  folderId?: string;
  title?: string;
  description?: string;
  tags?: string[];
  documentType?: DocumentType;
  metadata?: Record<string, unknown>;
  onProgress?: (progress: number) => void;
}

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
  documentType?: DocumentType;
  dateFrom?: Date;
  dateTo?: Date;
  status?: DocumentStatus;
}

// =============================================================================
// Cloud Functions Callables
// =============================================================================

const archiveGetFolders = httpsCallable(functions, 'archiveGetFolders');
const archiveGetFolder = httpsCallable(functions, 'archiveGetFolder');
const archiveCreateFolder = httpsCallable(functions, 'archiveCreateFolder');
const archiveUpdateFolder = httpsCallable(functions, 'archiveUpdateFolder');
const archiveDeleteFolder = httpsCallable(functions, 'archiveDeleteFolder');

const archiveGetDocuments = httpsCallable(functions, 'archiveGetDocuments');
const archiveGetDocument = httpsCallable(functions, 'archiveGetDocument');
const archiveCreateDocument = httpsCallable(functions, 'archiveCreateDocument');
const archiveUpdateDocument = httpsCallable(functions, 'archiveUpdateDocument');
const archiveDeleteDocument = httpsCallable(functions, 'archiveDeleteDocument');
const archiveRestoreDocument = httpsCallable(functions, 'archiveRestoreDocument');
const archiveSearchDocuments = httpsCallable(functions, 'archiveSearchDocuments');

const archiveGetVersions = httpsCallable(functions, 'archiveGetVersions');
const archiveCreateVersion = httpsCallable(functions, 'archiveCreateVersion');

const archiveShareDocument = httpsCallable(functions, 'archiveShareDocument');
const archiveGetShares = httpsCallable(functions, 'archiveGetShares');
const archiveRevokeShare = httpsCallable(functions, 'archiveRevokeShare');
const archiveAccessShared = httpsCallable(functions, 'archiveAccessShared');

const archiveVerifyIntegrity = httpsCallable(functions, 'archiveVerifyIntegrity');

const archiveLogAudit = httpsCallable(functions, 'archiveLogAudit');
const archiveGetAuditLogs = httpsCallable(functions, 'archiveGetAuditLogs');

const archiveGetStatsFn = httpsCallable(functions, 'archiveGetStats');
const archiveGetRetentionPoliciesFn = httpsCallable(functions, 'archiveGetRetentionPolicies');
const archiveGetExpiringDocumentsFn = httpsCallable(functions, 'archiveGetExpiringDocuments');

// =============================================================================
// Helper Functions
// =============================================================================

function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
}

export async function generateSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateShareToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// =============================================================================
// Firebase Storage Helpers
// =============================================================================

async function uploadToFirebaseStorage(
  file: File,
  storagePath: string,
  onProgress?: (progress: number) => void
): Promise<{ path: string; url: string }> {
  const storageRef = ref(storage, `archive-documents/${storagePath}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
      },
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ path: storagePath, url });
      }
    );
  });
}

async function deleteFromFirebaseStorage(storagePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, `archive-documents/${storagePath}`);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Failed to delete from storage:', error);
  }
}

async function getFileDownloadUrl(storagePath: string): Promise<string> {
  const storageRef = ref(storage, `archive-documents/${storagePath}`);
  return getDownloadURL(storageRef);
}

// =============================================================================
// Folder Operations
// =============================================================================

export async function getFolders(parentId?: string): Promise<ArchiveFolder[]> {
  const result = await archiveGetFolders({ parentId });
  return (result.data as { folders: ArchiveFolder[] }).folders || [];
}

export async function getFolder(id: string): Promise<ArchiveFolder | null> {
  try {
    const result = await archiveGetFolder({ id });
    return (result.data as { folder: ArchiveFolder | null }).folder;
  } catch {
    return null;
  }
}

export async function getFolderByPath(path: string): Promise<ArchiveFolder | null> {
  const result = await archiveGetFolders({ path });
  const folders = (result.data as { folders: ArchiveFolder[] }).folders || [];
  return folders[0] || null;
}

export async function getFolderWithAncestors(id: string): Promise<ArchiveFolder[]> {
  const ancestors: ArchiveFolder[] = [];
  let currentId: string | null = id;

  while (currentId) {
    const folder = await getFolder(currentId);
    if (!folder) break;
    ancestors.unshift(folder);
    currentId = folder.parent_id || null;
  }

  return ancestors;
}

export async function createFolder(options: CreateFolderOptions): Promise<ArchiveFolder> {
  const result = await archiveCreateFolder({
    name: options.name,
    description: options.description,
    parentId: options.parentId || null,
    level: options.level,
    icon: options.icon || '📁',
    color: options.color || 'bg-blue-500',
  });
  return (result.data as { folder: ArchiveFolder }).folder;
}

export async function updateFolder(id: string, updates: Partial<ArchiveFolder>): Promise<ArchiveFolder> {
  const result = await archiveUpdateFolder({
    id,
    name: updates.name,
    description: updates.description,
    icon: updates.icon,
    color: updates.color,
  });
  return (result.data as { folder: ArchiveFolder }).folder;
}

export async function deleteFolder(id: string, permanent = false): Promise<void> {
  await archiveDeleteFolder({ id, permanent });
}

// =============================================================================
// Document Operations
// =============================================================================

export async function getDocuments(folderId?: string): Promise<ArchiveDocument[]> {
  const result = await archiveGetDocuments({ folderId });
  return (result.data as { documents: ArchiveDocument[] }).documents || [];
}

export async function getDocument(id: string): Promise<ArchiveDocument | null> {
  try {
    const result = await archiveGetDocument({ id });
    return (result.data as { document: ArchiveDocument | null }).document;
  } catch {
    return null;
  }
}

export async function searchDocuments(filters: SearchFilters | string): Promise<ArchiveDocument[]> {
  const payload = typeof filters === 'string'
    ? { query: filters }
    : {
        query: filters.query,
        folderId: filters.folderId,
        tags: filters.tags,
        mimeTypes: filters.mimeTypes,
        documentType: filters.documentType,
        dateFrom: filters.dateFrom?.toISOString(),
        dateTo: filters.dateTo?.toISOString(),
        status: filters.status,
      };

  const result = await archiveSearchDocuments(payload);
  return (result.data as { documents: ArchiveDocument[] }).documents || [];
}

export async function uploadDocument(
  fileOrOptions: File | UploadOptions,
  options?: { folderId?: string }
): Promise<ArchiveDocument> {
  const userId = getCurrentUserId();

  // Normalize parameters
  const file = fileOrOptions instanceof File ? fileOrOptions : fileOrOptions.file;
  const uploadOpts = fileOrOptions instanceof File
    ? { file, folderId: options?.folderId }
    : fileOrOptions;

  // Generate hash client-side
  const hash = await generateSHA256(file);

  // Upload to Firebase Storage
  const storagePath = `${userId}/${Date.now()}_${file.name}`;
  const { url: storageUrl } = await uploadToFirebaseStorage(
    file,
    storagePath,
    uploadOpts.onProgress
  );

  // Calculate expiration date based on retention
  const retentionYears = 10; // Default
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + retentionYears);

  // Create document record via Cloud Function
  const result = await archiveCreateDocument({
    folderId: uploadOpts.folderId || null,
    filename: file.name,
    originalFilename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    storagePath,
    storageUrl,
    title: uploadOpts.title || file.name,
    description: uploadOpts.description || null,
    documentType: uploadOpts.documentType || 'other',
    tags: uploadOpts.tags || [],
    hashSha256: hash,
    retentionYears,
    expirationDate: expirationDate.toISOString(),
    metadata: uploadOpts.metadata || {},
  });

  return (result.data as { document: ArchiveDocument }).document;
}

export async function updateDocument(id: string, updates: Partial<ArchiveDocument>): Promise<ArchiveDocument> {
  const result = await archiveUpdateDocument({
    id,
    title: updates.title,
    description: updates.description,
    tags: updates.tags,
    documentType: updates.document_type,
    status: updates.status,
    metadata: updates.metadata,
  });
  return (result.data as { document: ArchiveDocument }).document;
}

export async function deleteDocument(id: string, permanent = false): Promise<void> {
  if (permanent) {
    // Get document to find storage path
    const doc = await getDocument(id);
    if (doc) {
      await deleteFromFirebaseStorage(doc.storage_path);
    }
  }
  await archiveDeleteDocument({ id, permanent });
}

export async function restoreDocument(id: string): Promise<ArchiveDocument> {
  const result = await archiveRestoreDocument({ id });
  return (result.data as { document: ArchiveDocument }).document;
}

export async function getDocumentUrl(id: string): Promise<string> {
  const doc = await getDocument(id);
  if (!doc) throw new Error('Document not found');

  // Get download URL from Firebase Storage
  const url = await getFileDownloadUrl(doc.storage_path);

  // Log access audit (non-blocking)
  archiveLogAudit({
    documentId: id,
    action: 'download',
    details: {},
  }).catch(() => {});

  return url;
}

// =============================================================================
// Version Operations
// =============================================================================

export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const result = await archiveGetVersions({ documentId });
  return (result.data as { versions: DocumentVersion[] }).versions || [];
}

export async function createVersion(
  documentId: string,
  file: File,
  changeDescription?: string
): Promise<DocumentVersion> {
  const userId = getCurrentUserId();
  const doc = await getDocument(documentId);
  if (!doc) throw new Error('Document not found');

  const hash = await generateSHA256(file);
  const newVersionNumber = doc.version + 1;
  const storagePath = `${userId}/${Date.now()}_v${newVersionNumber}_${file.name}`;

  // Upload new version to Firebase Storage
  const { url: storageUrl } = await uploadToFirebaseStorage(file, storagePath);

  // Create version record via Cloud Function
  const result = await archiveCreateVersion({
    documentId,
    storagePath,
    storageUrl,
    hashSha256: hash,
    sizeBytes: file.size,
    changeDescription,
  });

  return (result.data as { version: DocumentVersion }).version;
}

// =============================================================================
// Sharing Operations
// =============================================================================

export async function shareDocument(
  documentId: string,
  options: ShareDocumentOptions
): Promise<DocumentShare> {
  const shareToken = generateShareToken();

  const result = await archiveShareDocument({
    documentId,
    shareToken,
    permission: options.permission,
    expiresAt: options.expiresAt?.toISOString(),
    maxAccessCount: options.maxAccessCount,
    password: options.password,
    sharedWithEmail: options.sharedWithEmail,
  });

  return (result.data as { share: DocumentShare }).share;
}

export async function getDocumentShares(documentId: string): Promise<DocumentShare[]> {
  const result = await archiveGetShares({ documentId });
  return (result.data as { shares: DocumentShare[] }).shares || [];
}

export async function revokeShare(shareId: string): Promise<void> {
  await archiveRevokeShare({ shareId });
}

export async function accessSharedDocument(
  token: string,
  password?: string
): Promise<{ document: ArchiveDocument; url: string } | null> {
  try {
    const result = await archiveAccessShared({ token, password });
    const data = result.data as { document: ArchiveDocument; url: string } | null;
    return data;
  } catch {
    return null;
  }
}

// =============================================================================
// Integrity Operations
// =============================================================================

export async function verifyDocumentIntegrity(id: string): Promise<boolean> {
  const doc = await getDocument(id);
  if (!doc) throw new Error('Document not found');

  // Download file from Firebase Storage and compute hash client-side
  const url = await getFileDownloadUrl(doc.storage_path);

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const currentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const isValid = currentHash === doc.hash_sha256;

  // Update verification timestamp via Cloud Function (non-blocking)
  archiveVerifyIntegrity({ id, isValid, currentHash }).catch(() => {});

  return isValid;
}

// =============================================================================
// Audit Operations
// =============================================================================

export async function getAuditLogs(
  documentId?: string,
  limit = 100
): Promise<AuditLogEntry[]> {
  const result = await archiveGetAuditLogs({ documentId, limit });
  return (result.data as { logs: AuditLogEntry[] }).logs || [];
}

// =============================================================================
// Storage Stats
// =============================================================================

export async function getStorageStats(): Promise<{
  totalBytes: number;
  usedBytes: number;
  documentCount: number;
  folderCount: number;
}> {
  const result = await archiveGetStatsFn({});
  return result.data as {
    totalBytes: number;
    usedBytes: number;
    documentCount: number;
    folderCount: number;
  };
}

export const getStorageUsage = getStorageStats;

// =============================================================================
// Retention Policies
// =============================================================================

export async function getRetentionPolicies(): Promise<RetentionPolicy[]> {
  const result = await archiveGetRetentionPoliciesFn({});
  return (result.data as { policies: RetentionPolicy[] }).policies || [];
}

export async function getExpiringDocuments(daysAhead = 30): Promise<ArchiveDocument[]> {
  const result = await archiveGetExpiringDocumentsFn({ daysAhead });
  return (result.data as { documents: ArchiveDocument[] }).documents || [];
}
