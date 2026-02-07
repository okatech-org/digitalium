/**
 * Shared Document Files Service
 * Provides access to imported files from iDocument across all modules
 */

import { ImportedFile } from '@/pages/pro/idocument/IDocumentLayout';

const STORAGE_KEY = 'digitalium-imported-files';

/**
 * Get all imported files from localStorage
 */
export function getAllImportedFiles(): ImportedFile[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as ImportedFile[];
        }
    } catch (e) {
        console.error('Failed to load imported files:', e);
    }
    return [];
}

/**
 * Get files that are in the trash (folderId === 'trash')
 */
export function getTrashedFiles(): ImportedFile[] {
    return getAllImportedFiles().filter(f => f.folderId === 'trash');
}

/**
 * Get files that are archived (folderId === 'archive')
 */
export function getArchivedFilesFromStorage(): ImportedFile[] {
    return getAllImportedFiles().filter(f => f.folderId === 'archive');
}

/**
 * Get files pending signature
 */
export function getPendingSignatureFiles(): (ImportedFile & { signaturePending?: boolean; signatureRecipient?: string })[] {
    return getAllImportedFiles().filter((f: any) => f.signaturePending === true);
}

/**
 * Update a file in storage
 */
export function updateFileInStorage(fileId: string, updates: Partial<ImportedFile>): void {
    const files = getAllImportedFiles();
    const updatedFiles = files.map(f =>
        f.id === fileId ? { ...f, ...updates } : f
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
}

/**
 * Move a file to a specific folder
 */
export function moveFileToFolder(fileId: string, folderId: string): void {
    updateFileInStorage(fileId, { folderId } as any);
}

/**
 * Unarchive a document - move it from 'archive' back to a specified folder
 * Returns true if the document was found and unarchived successfully
 */
export function unarchiveDocument(fileId: string, targetFolderId: string = 'root'): boolean {
    const files = getAllImportedFiles();
    const file = files.find(f => f.id === fileId);
    if (!file || file.folderId !== 'archive') return false;

    updateFileInStorage(fileId, { folderId: targetFolderId } as any);
    return true;
}
