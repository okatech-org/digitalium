/**
 * Storage Utilities for Digitalium Archive System
 * Handles file uploads, hash generation, and URL signing
 *
 * Migrated from Supabase Storage to Firebase Storage
 */

import { storage } from '@/config/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

const STORAGE_BUCKET_PATH = 'archive-documents';

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
 * Upload file to Firebase Storage
 */
export async function uploadToStorage(
    file: File,
    storagePath: string,
    onProgress?: (progress: number) => void
): Promise<{ path: string; url: string }> {
    const storageRef = ref(storage, `${STORAGE_BUCKET_PATH}/${storagePath}`);

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
                onProgress?.(Math.round(progress));
            },
            (error) => reject(new Error(`Upload failed: ${error.message}`)),
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({
                    path: storagePath,
                    url,
                });
            }
        );
    });
}

/**
 * Get a download URL for file access
 * Firebase Storage URLs are already signed/authenticated
 */
export async function getSignedUrl(
    storagePath: string,
    _expiresInSeconds: number = 3600
): Promise<string> {
    const storageRef = ref(storage, `${STORAGE_BUCKET_PATH}/${storagePath}`);
    return getDownloadURL(storageRef);
}

/**
 * Delete file from storage
 */
export async function deleteFromStorage(storagePath: string): Promise<void> {
    const storageRef = ref(storage, `${STORAGE_BUCKET_PATH}/${storagePath}`);
    await deleteObject(storageRef);
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
