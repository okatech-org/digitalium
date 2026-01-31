/**
 * useFolderManager - Hook for managing folders in iDocument
 * Provides state management for folders with add/delete/rename operations
 */

import { useState, useCallback, useMemo } from 'react';
import {
    digitaliumFolders as initialFolders,
    DigitaliumFolder,
    getSubfolders as getSubfoldersFromData,
    getFolderBreadcrumb as getBreadcrumbFromData,
    getFolderItemCount as getItemCountFromData,
} from '@/data/digitaliumMockData';

export interface FolderManagerState {
    folders: DigitaliumFolder[];
    addFolder: (folderData: {
        name: string;
        color: string;
        parentId: string;
        path: string;
    }) => DigitaliumFolder;
    deleteFolder: (folderId: string) => void;
    renameFolder: (folderId: string, newName: string) => void;
    getSubfolders: (parentId: string) => DigitaliumFolder[];
    getFolderBreadcrumb: (folderId: string) => DigitaliumFolder[];
    getFolderItemCount: (folderId: string) => { files: number; folders: number };
    findFolder: (folderId: string) => DigitaliumFolder | undefined;
}

export function useFolderManager(): FolderManagerState {
    const [folders, setFolders] = useState<DigitaliumFolder[]>([...initialFolders]);

    // Generate unique ID for new folders
    const generateFolderId = useCallback(() => {
        return `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    // Add a new folder
    const addFolder = useCallback((folderData: {
        name: string;
        color: string;
        parentId: string;
        path: string;
    }): DigitaliumFolder => {
        const now = new Date().toISOString().split('T')[0];
        const newFolder: DigitaliumFolder = {
            id: generateFolderId(),
            name: folderData.name,
            color: folderData.color,
            parentId: folderData.parentId,
            path: folderData.path,
            createdAt: now,
            modifiedAt: now,
        };

        setFolders(prev => [...prev, newFolder]);
        return newFolder;
    }, [generateFolderId]);

    // Delete a folder (and all its children)
    const deleteFolder = useCallback((folderId: string) => {
        setFolders(prev => {
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
        setFolders(prev => prev.map(f => {
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

    // Get subfolders of a parent
    const getSubfolders = useCallback((parentId: string): DigitaliumFolder[] => {
        return folders.filter(f => f.parentId === parentId);
    }, [folders]);

    // Get breadcrumb for a folder
    const getFolderBreadcrumb = useCallback((folderId: string): DigitaliumFolder[] => {
        const breadcrumb: DigitaliumFolder[] = [];
        let current = folders.find(f => f.id === folderId);
        while (current) {
            breadcrumb.unshift(current);
            current = current.parentId ? folders.find(f => f.id === current!.parentId) : undefined;
        }
        return breadcrumb;
    }, [folders]);

    // Get item count for a folder
    const getFolderItemCount = useCallback((folderId: string): { files: number; folders: number } => {
        // For files, we still use the original data (files are not managed by this hook)
        const originalCount = getItemCountFromData(folderId);
        const folderCount = folders.filter(f => f.parentId === folderId).length;
        return {
            files: originalCount.files,
            folders: folderCount,
        };
    }, [folders]);

    // Find a folder by ID
    const findFolder = useCallback((folderId: string): DigitaliumFolder | undefined => {
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
    };
}

export default useFolderManager;
