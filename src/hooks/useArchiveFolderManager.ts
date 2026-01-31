/**
 * useArchiveFolderManager - Hook for managing archive folders
 * Provides state management for archive folders with add/delete/rename operations
 * Filters by archive category and handles retention periods
 */

import { useState, useCallback, useMemo } from 'react';
import {
    digitaliumArchiveFolders as initialFolders,
    digitaliumArchives,
    DigitaliumArchiveFolder,
    ArchiveCategory,
    ARCHIVE_RETENTION_DEFAULTS,
} from '@/data/digitaliumMockData';

export interface ArchiveFolderManagerState {
    folders: DigitaliumArchiveFolder[];
    addFolder: (folderData: {
        name: string;
        color: string;
        parentId: string;
        path: string;
        category: ArchiveCategory;
        retentionYears?: number;
    }) => DigitaliumArchiveFolder;
    deleteFolder: (folderId: string) => void;
    renameFolder: (folderId: string, newName: string) => void;
    getSubfolders: (parentId: string | null) => DigitaliumArchiveFolder[];
    getFolderBreadcrumb: (folderId: string) => DigitaliumArchiveFolder[];
    getFolderItemCount: (folderId: string) => { archives: number; folders: number };
    findFolder: (folderId: string) => DigitaliumArchiveFolder | undefined;
    getRootFolder: () => DigitaliumArchiveFolder | undefined;
}

export function useArchiveFolderManager(category: ArchiveCategory): ArchiveFolderManagerState {
    const [allFolders, setAllFolders] = useState<DigitaliumArchiveFolder[]>([...initialFolders]);

    // Filter folders for the current category
    const folders = useMemo(() =>
        allFolders.filter(f => f.category === category),
        [allFolders, category]
    );

    // Generate unique ID for new folders
    const generateFolderId = useCallback(() => {
        return `arch-folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    // Get root folder for the category
    const getRootFolder = useCallback((): DigitaliumArchiveFolder | undefined => {
        return folders.find(f => f.parentId === null);
    }, [folders]);

    // Add a new folder
    const addFolder = useCallback((folderData: {
        name: string;
        color: string;
        parentId: string;
        path: string;
        category: ArchiveCategory;
        retentionYears?: number;
    }): DigitaliumArchiveFolder => {
        const now = new Date().toISOString().split('T')[0];
        const defaultRetention = ARCHIVE_RETENTION_DEFAULTS[folderData.category];

        const newFolder: DigitaliumArchiveFolder = {
            id: generateFolderId(),
            name: folderData.name,
            color: folderData.color,
            parentId: folderData.parentId,
            category: folderData.category,
            retentionYears: folderData.retentionYears ?? defaultRetention,
            path: folderData.path,
            createdAt: now,
            modifiedAt: now,
        };

        setAllFolders(prev => [...prev, newFolder]);
        return newFolder;
    }, [generateFolderId]);

    // Delete a folder (and all its children)
    const deleteFolder = useCallback((folderId: string) => {
        setAllFolders(prev => {
            // Recursively find all child folder IDs
            const getChildIds = (parentId: string): string[] => {
                const children = prev.filter(f => f.parentId === parentId);
                return children.flatMap(child => [child.id, ...getChildIds(child.id)]);
            };

            const idsToDelete = [folderId, ...getChildIds(folderId)];
            return prev.filter(f => !idsToDelete.includes(f.id));
        });
    }, []);

    // Rename a folder
    const renameFolder = useCallback((folderId: string, newName: string) => {
        setAllFolders(prev => prev.map(f => {
            if (f.id === folderId) {
                const parentPath = f.path.substring(0, f.path.lastIndexOf('/'));
                return {
                    ...f,
                    name: newName,
                    path: `${parentPath}/${newName}`,
                    modifiedAt: new Date().toISOString().split('T')[0],
                };
            }
            return f;
        }));
    }, []);

    // Get subfolders of a parent (within the same category)
    const getSubfolders = useCallback((parentId: string | null): DigitaliumArchiveFolder[] => {
        return folders.filter(f => f.parentId === parentId);
    }, [folders]);

    // Get breadcrumb for a folder
    const getFolderBreadcrumb = useCallback((folderId: string): DigitaliumArchiveFolder[] => {
        const breadcrumb: DigitaliumArchiveFolder[] = [];
        let current = folders.find(f => f.id === folderId);
        while (current) {
            breadcrumb.unshift(current);
            current = current.parentId ? folders.find(f => f.id === current!.parentId) : undefined;
        }
        return breadcrumb;
    }, [folders]);

    // Get item count for a folder
    const getFolderItemCount = useCallback((folderId: string): { archives: number; folders: number } => {
        const archiveCount = digitaliumArchives.filter(a => a.folderId === folderId).length;
        const folderCount = folders.filter(f => f.parentId === folderId).length;
        return {
            archives: archiveCount,
            folders: folderCount,
        };
    }, [folders]);

    // Find a folder by ID
    const findFolder = useCallback((folderId: string): DigitaliumArchiveFolder | undefined => {
        return folders.find(f => f.id === folderId);
    }, [folders]);

    return {
        folders,
        addFolder,
        deleteFolder,
        renameFolder,
        getSubfolders,
        getFolderBreadcrumb,
        getFolderItemCount,
        findFolder,
        getRootFolder,
    };
}

export default useArchiveFolderManager;
