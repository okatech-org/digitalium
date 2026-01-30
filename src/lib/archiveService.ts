/**
 * Archive Service - Complete Supabase Implementation
 * 
 * Full implementation of archive operations using Supabase backend.
 * Tables: archive_folders, archive_documents, document_versions, 
 *         document_shares, archive_audit_logs, retention_policies
 */

import { supabase } from '@/integrations/supabase/client';

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
// Helper Functions
// =============================================================================

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
}

async function generateSHA256(file: File): Promise<string> {
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
// Folder Operations
// =============================================================================

export async function getFolders(parentId?: string): Promise<ArchiveFolder[]> {
  const userId = await getCurrentUserId();
  
  let query = supabase
    .from('archive_folders')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('name');
    
  if (parentId) {
    query = query.eq('parent_id', parentId);
  } else {
    query = query.is('parent_id', null);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ArchiveFolder[];
}

export async function getFolder(id: string): Promise<ArchiveFolder | null> {
  const { data, error } = await supabase
    .from('archive_folders')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data as ArchiveFolder | null;
}

export async function getFolderByPath(path: string): Promise<ArchiveFolder | null> {
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('archive_folders')
    .select('*')
    .eq('user_id', userId)
    .eq('path', path)
    .is('deleted_at', null)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data as ArchiveFolder | null;
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
  const userId = await getCurrentUserId();
  
  const { data, error } = await supabase
    .from('archive_folders')
    .insert({
      user_id: userId,
      parent_id: options.parentId || null,
      level: options.level,
      name: options.name,
      description: options.description,
      icon: options.icon || '📁',
      color: options.color || 'bg-blue-500',
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Log audit
  await logAuditAction(null, data.id, 'create', { action: 'folder_created', name: options.name });
  
  return data as ArchiveFolder;
}

export async function updateFolder(id: string, updates: Partial<ArchiveFolder>): Promise<ArchiveFolder> {
  const { data, error } = await supabase
    .from('archive_folders')
    .update({
      name: updates.name,
      description: updates.description,
      icon: updates.icon,
      color: updates.color,
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  await logAuditAction(null, id, 'update', { action: 'folder_updated', updates });
  
  return data as ArchiveFolder;
}

export async function deleteFolder(id: string, permanent = false): Promise<void> {
  if (permanent) {
    const { error } = await supabase
      .from('archive_folders')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('archive_folders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }
  
  await logAuditAction(null, id, 'delete', { permanent });
}

// =============================================================================
// Document Operations
// =============================================================================

export async function getDocuments(folderId?: string): Promise<ArchiveDocument[]> {
  const userId = await getCurrentUserId();
  
  let query = supabase
    .from('archive_documents')
    .select('*')
    .eq('user_id', userId)
    .eq('is_latest_version', true)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });
    
  if (folderId) {
    query = query.eq('folder_id', folderId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ArchiveDocument[];
}

export async function getDocument(id: string): Promise<ArchiveDocument | null> {
  const { data, error } = await supabase
    .from('archive_documents')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  
  // Log access
  if (data) {
    await supabase
      .from('archive_documents')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', id);
    await logAuditAction(id, null, 'read', {});
  }
  
  return data as ArchiveDocument | null;
}

export async function searchDocuments(filters: SearchFilters | string): Promise<ArchiveDocument[]> {
  const userId = await getCurrentUserId();
  
  // If simple string query, use the search function
  if (typeof filters === 'string') {
    const { data, error } = await supabase
      .rpc('search_documents', {
        p_query: filters,
        p_user_id: userId,
        p_limit: 50
      });
    if (error) throw error;
    return (data || []) as ArchiveDocument[];
  }
  
  // Build complex query
  let query = supabase
    .from('archive_documents')
    .select('*')
    .eq('user_id', userId)
    .eq('is_latest_version', true)
    .is('deleted_at', null);
    
  if (filters.folderId) {
    query = query.eq('folder_id', filters.folderId);
  }
  if (filters.documentType) {
    query = query.eq('document_type', filters.documentType);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom.toISOString());
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo.toISOString());
  }
  if (filters.query) {
    query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,reference.ilike.%${filters.query}%`);
  }
  
  query = query.order('updated_at', { ascending: false }).limit(50);
  
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ArchiveDocument[];
}

export async function uploadDocument(
  fileOrOptions: File | UploadOptions,
  options?: { folderId?: string }
): Promise<ArchiveDocument> {
  const userId = await getCurrentUserId();
  
  // Normalize parameters
  const file = fileOrOptions instanceof File ? fileOrOptions : fileOrOptions.file;
  const uploadOpts = fileOrOptions instanceof File 
    ? { file, folderId: options?.folderId }
    : fileOrOptions;
  
  // Generate hash
  const hash = await generateSHA256(file);
  
  // Upload to storage
  const storagePath = `${userId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('archive-documents')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (uploadError) throw uploadError;
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('archive-documents')
    .getPublicUrl(storagePath);
  
  // Calculate expiration date based on retention
  const retentionYears = 10; // Default, can be from policy
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + retentionYears);
  
  // Create document record
  const { data, error } = await supabase
    .from('archive_documents')
    .insert({
      user_id: userId,
      folder_id: uploadOpts.folderId || null,
      filename: file.name,
      original_filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      storage_path: storagePath,
      storage_url: urlData.publicUrl,
      title: uploadOpts.title || file.name,
      description: uploadOpts.description || null,
      document_type: uploadOpts.documentType || 'other',
      tags: uploadOpts.tags || [],
      hash_sha256: hash,
      retention_years: retentionYears,
      expiration_date: expirationDate.toISOString(),
      metadata: uploadOpts.metadata || {},
    })
    .select()
    .single();
    
  if (error) throw error;
  
  await logAuditAction(data.id, uploadOpts.folderId || null, 'create', {
    filename: file.name,
    size: file.size,
    hash: hash
  });
  
  return data as ArchiveDocument;
}

export async function updateDocument(id: string, updates: Partial<ArchiveDocument>): Promise<ArchiveDocument> {
  const { data, error } = await supabase
    .from('archive_documents')
    .update({
      title: updates.title,
      description: updates.description,
      tags: updates.tags,
      document_type: updates.document_type,
      status: updates.status,
      metadata: updates.metadata,
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  await logAuditAction(id, null, 'update', { updates });
  
  return data as ArchiveDocument;
}

export async function deleteDocument(id: string, permanent = false): Promise<void> {
  const doc = await getDocument(id);
  if (!doc) throw new Error('Document not found');
  
  if (permanent) {
    // Delete from storage first
    await supabase.storage
      .from('archive-documents')
      .remove([doc.storage_path]);
      
    // Then delete record
    const { error } = await supabase
      .from('archive_documents')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('archive_documents')
      .update({ 
        deleted_at: new Date().toISOString(),
        status: 'deleted'
      })
      .eq('id', id);
    if (error) throw error;
  }
  
  await logAuditAction(id, null, 'delete', { permanent });
}

export async function restoreDocument(id: string): Promise<ArchiveDocument> {
  const { data, error } = await supabase
    .from('archive_documents')
    .update({ 
      deleted_at: null,
      status: 'draft'
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  await logAuditAction(id, null, 'restore', {});
  
  return data as ArchiveDocument;
}

export async function getDocumentUrl(id: string): Promise<string> {
  const doc = await getDocument(id);
  if (!doc) throw new Error('Document not found');
  
  // Get signed URL for private access
  const { data, error } = await supabase.storage
    .from('archive-documents')
    .createSignedUrl(doc.storage_path, 3600); // 1 hour
    
  if (error) throw error;
  
  await logAuditAction(id, null, 'download', {});
  
  return data.signedUrl;
}

// =============================================================================
// Version Operations
// =============================================================================

export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false });
    
  if (error) throw error;
  return (data || []) as DocumentVersion[];
}

export async function createVersion(
  documentId: string, 
  file: File, 
  changeDescription?: string
): Promise<DocumentVersion> {
  const userId = await getCurrentUserId();
  const doc = await getDocument(documentId);
  if (!doc) throw new Error('Document not found');
  
  const hash = await generateSHA256(file);
  const newVersionNumber = doc.version + 1;
  const storagePath = `${userId}/${Date.now()}_v${newVersionNumber}_${file.name}`;
  
  // Upload new version
  const { error: uploadError } = await supabase.storage
    .from('archive-documents')
    .upload(storagePath, file);
    
  if (uploadError) throw uploadError;
  
  const { data: urlData } = supabase.storage
    .from('archive-documents')
    .getPublicUrl(storagePath);
  
  // Save old version
  const { error: versionError } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      version_number: doc.version,
      storage_path: doc.storage_path,
      storage_url: doc.storage_url,
      hash_sha256: doc.hash_sha256,
      size_bytes: doc.size_bytes,
      change_description: changeDescription,
      changed_by: userId,
    });
    
  if (versionError) throw versionError;
  
  // Update document with new version
  const { data: updated, error: updateError } = await supabase
    .from('archive_documents')
    .update({
      storage_path: storagePath,
      storage_url: urlData.publicUrl,
      hash_sha256: hash,
      size_bytes: file.size,
      version: newVersionNumber,
    })
    .eq('id', documentId)
    .select()
    .single();
    
  if (updateError) throw updateError;
  
  await logAuditAction(documentId, null, 'version', { 
    newVersion: newVersionNumber,
    changeDescription 
  });
  
  return {
    id: '',
    document_id: documentId,
    version_number: doc.version,
    storage_path: doc.storage_path,
    storage_url: doc.storage_url,
    hash_sha256: doc.hash_sha256,
    size_bytes: doc.size_bytes,
    change_description: changeDescription,
    changed_by: userId,
    created_at: new Date().toISOString(),
  };
}

// =============================================================================
// Sharing Operations
// =============================================================================

export async function shareDocument(
  documentId: string, 
  options: ShareDocumentOptions
): Promise<DocumentShare> {
  const userId = await getCurrentUserId();
  const shareToken = generateShareToken();
  
  const { data, error } = await supabase
    .from('document_shares')
    .insert({
      document_id: documentId,
      shared_by: userId,
      share_token: shareToken,
      permission: options.permission,
      expires_at: options.expiresAt?.toISOString(),
      max_access_count: options.maxAccessCount,
      password_hash: options.password 
        ? await hashPassword(options.password) 
        : null,
    })
    .select()
    .single();
    
  if (error) throw error;
  
  await logAuditAction(documentId, null, 'share', {
    permission: options.permission,
    expiresAt: options.expiresAt
  });
  
  return data as DocumentShare;
}

async function hashPassword(password: string): Promise<string> {
  // Simple hash for demo - in production use bcrypt via Edge Function
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function getDocumentShares(documentId: string): Promise<DocumentShare[]> {
  const { data, error } = await supabase
    .from('document_shares')
    .select('*')
    .eq('document_id', documentId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return (data || []) as DocumentShare[];
}

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
    
  if (error) throw error;
  
  if (share) {
    await logAuditAction(share.document_id, null, 'unshare', { shareId });
  }
}

export async function accessSharedDocument(
  token: string,
  password?: string
): Promise<{ document: ArchiveDocument; url: string } | null> {
  const { data, error } = await supabase
    .rpc('validate_share_access', {
      p_share_token: token,
      p_password: password || null
    });
    
  if (error || !data || !data[0]?.is_valid) return null;
  
  const document = await getDocument(data[0].document_id);
  if (!document) return null;
  
  const url = await getDocumentUrl(document.id);
  
  return { document, url };
}

// =============================================================================
// Integrity Operations
// =============================================================================

export async function verifyDocumentIntegrity(id: string): Promise<boolean> {
  const doc = await getDocument(id);
  if (!doc) throw new Error('Document not found');
  
  // Get file from storage and compute hash
  const { data: fileData, error } = await supabase.storage
    .from('archive-documents')
    .download(doc.storage_path);
    
  if (error) throw error;
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', await fileData.arrayBuffer());
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const currentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  const isValid = currentHash === doc.hash_sha256;
  
  // Update verification timestamp
  await supabase
    .from('archive_documents')
    .update({ hash_verified_at: new Date().toISOString() })
    .eq('id', id);
  
  return isValid;
}

// =============================================================================
// Audit Operations
// =============================================================================

async function logAuditAction(
  documentId: string | null,
  folderId: string | null,
  action: AuditAction,
  details: Record<string, unknown>
): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    
    await supabase
      .from('archive_audit_logs')
      .insert({
        document_id: documentId,
        folder_id: folderId,
        user_id: userId,
        action,
        action_details: details,
      });
  } catch (e) {
    console.warn('Failed to log audit action:', e);
  }
}

export async function getAuditLogs(
  documentId?: string,
  limit = 100
): Promise<AuditLogEntry[]> {
  let query = supabase
    .from('archive_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (documentId) {
    query = query.eq('document_id', documentId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as AuditLogEntry[];
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
  const userId = await getCurrentUserId();
  
  // Get used storage
  const { data: storageData } = await supabase
    .rpc('get_user_storage_usage', { p_user_id: userId });
  
  // Get document count
  const { count: docCount } = await supabase
    .from('archive_documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_latest_version', true)
    .is('deleted_at', null);
    
  // Get folder count
  const { count: folderCount } = await supabase
    .from('archive_folders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null);
  
  return {
    totalBytes: 10 * 1024 * 1024 * 1024, // 10GB default quota
    usedBytes: storageData || 0,
    documentCount: docCount || 0,
    folderCount: folderCount || 0,
  };
}

export const getStorageUsage = getStorageStats;

// =============================================================================
// Retention Policies
// =============================================================================

export async function getRetentionPolicies(): Promise<RetentionPolicy[]> {
  const { data, error } = await supabase
    .from('retention_policies')
    .select('*')
    .order('document_type');
    
  if (error) throw error;
  return (data || []) as RetentionPolicy[];
}

export async function getExpiringDocuments(daysAhead = 30): Promise<ArchiveDocument[]> {
  const userId = await getCurrentUserId();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  const { data, error } = await supabase
    .from('archive_documents')
    .select('*')
    .eq('user_id', userId)
    .eq('is_latest_version', true)
    .is('deleted_at', null)
    .lte('expiration_date', futureDate.toISOString())
    .gte('expiration_date', new Date().toISOString())
    .order('expiration_date');
    
  if (error) throw error;
  return (data || []) as ArchiveDocument[];
}
