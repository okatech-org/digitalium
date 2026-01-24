/**
 * Storage Utilities for Digitalium Archive System
 * Handles file uploads, hash generation, and URL signing
 */

import { supabase } from '@/integrations/supabase/client';

const STORAGE_BUCKET = 'archive-documents';

/**
 * Generate SHA-256 hash of a file
 */
export async function generateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate storage path for a file
 * Format: {userId}/{year}/{month}/{uuid}_{filename}
 */
export function generateStoragePath(userId: string, filename: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uuid = crypto.randomUUID();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${userId}/${year}/${month}/${uuid}_${sanitizedFilename}`;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadToStorage(
    file: File,
    storagePath: string,
    onProgress?: (progress: number) => void
): Promise<{ path: string; url: string }> {
    // Supabase storage upload (no native progress support, simulate)
    if (onProgress) onProgress(10);

    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    if (onProgress) onProgress(90);

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

    if (onProgress) onProgress(100);

    return {
        path: data.path,
        url: urlData.publicUrl,
    };
}

/**
 * Get a signed URL for private file access
 */
export async function getSignedUrl(
    storagePath: string,
    expiresInSeconds: number = 3600
): Promise<string> {
    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(storagePath, expiresInSeconds);

    if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
}

/**
 * Delete file from storage
 */
export async function deleteFromStorage(storagePath: string): Promise<void> {
    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath]);

    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get MIME type category
 */
export function getMimeCategory(mimeType: string): 'pdf' | 'doc' | 'image' | 'spreadsheet' | 'other' {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'spreadsheet';
    return 'other';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Validate file type against allowed types
 */
export function validateFileType(
    file: File,
    allowedTypes: string[] = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt', 'xml', 'eml', 'msg']
): boolean {
    const extension = getFileExtension(file.name);
    return allowedTypes.includes(extension);
}

/**
 * Validate file size against maximum
 */
export function validateFileSize(file: File, maxSizeBytes: number): boolean {
    return file.size <= maxSizeBytes;
}

// Size limits by plan (in bytes)
export const PLAN_SIZE_LIMITS = {
    free: 2 * 1024 * 1024, // 2MB
    starter: 10 * 1024 * 1024, // 10MB
    premium: 50 * 1024 * 1024, // 50MB
    business: 100 * 1024 * 1024, // 100MB
    enterprise: 500 * 1024 * 1024, // 500MB
} as const;

export type PlanType = keyof typeof PLAN_SIZE_LIMITS;
