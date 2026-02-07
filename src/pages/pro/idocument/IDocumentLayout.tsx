/**
 * iDocument Module Layout
 * Wrapper for all iDocument pages with sub-navigation
 * In SubAdmin context, shows folder hierarchy for Digitalium backoffice
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Share2,
    Users,
    FileStack,
    Trash2,
    Plus,
    Upload,
    FolderTree,
    PanelLeftClose,
    PanelLeft,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useSpaceFromUrl } from '@/contexts/SpaceContext';
import { FolderExplorer } from '@/components/idocument/FolderExplorer';
import { CreateFolderDialog } from '@/components/idocument/CreateFolderDialog';
import { useFolderManager } from '@/hooks/useFolderManager';
import { DigitaliumFolder, DigitaliumFile, FileType, FileStatus } from '@/data/digitaliumMockData';
import { useToast } from '@/hooks/use-toast';
import { storeFileContent, getFileContent } from '@/services/fileStorage';

// Imported file type with content for preview
export interface ImportedFile extends DigitaliumFile {
    isImported?: boolean;
    dataUrl?: string; // Base64 data URL for preview
    mimeType?: string;
}

// LocalStorage key for file persistence
const STORAGE_KEY = 'digitalium-imported-files';

// Context type for child routes
export interface IDocumentOutletContext {
    selectedFolder: DigitaliumFolder | null;
    setSelectedFolder: (folder: DigitaliumFolder) => void;
    showFolders: boolean;
    toggleFolders: () => void;
    folders: DigitaliumFolder[];
    getSubfolders: (parentId: string) => DigitaliumFolder[];
    openCreateFolderDialog: () => void;
    // File management
    importedFiles: ImportedFile[];
    importFiles: (files: File[], folderId: string) => void;
    deleteFile: (fileId: string) => void;
    moveToTrash: (fileId: string) => void;
    restoreFromTrash: (fileId: string) => void;
    archiveFile: (fileId: string) => void;
    sendToSignature: (fileId: string, recipient: string) => void;
    getTrashFiles: () => ImportedFile[];
    getArchivedFiles: () => ImportedFile[];
}

const NAV_ITEMS = [
    { label: 'Mes Dossiers', path: 'idocument', icon: FileText },
    { label: 'Partagés', path: 'idocument/shared', icon: Share2 },
    { label: 'Équipe', path: 'idocument/team', icon: Users },
    { label: 'Modèles', path: 'idocument/templates', icon: FileStack },
    { label: 'Corbeille', path: 'idocument/trash', icon: Trash2 },
];

// Helper to get base path from current location
function getBasePath(pathname: string): string {
    if (pathname.startsWith('/subadmin')) return '/subadmin';
    return '/pro';
}

export default function IDocumentLayout() {
    const location = useLocation();
    const { isBackoffice, organizationName } = useSpaceFromUrl();
    const { toast } = useToast();
    const [showFolders, setShowFolders] = useState(true);
    const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);

    // Use folder manager hook for reactive folder management
    const { folders, addFolder, getSubfolders, findFolder } = useFolderManager();

    // Initialize with root folder
    const rootFolder = folders.find(f => f.id === 'root') || null;
    const [selectedFolder, setSelectedFolder] = useState<DigitaliumFolder | null>(rootFolder);

    // Local file storage for imported files - metadata in localStorage, content in IndexedDB
    const [importedFiles, setImportedFiles] = useState<ImportedFile[]>(() => {
        // Load metadata from localStorage on mount (without dataUrl)
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored) as ImportedFile[];
            }
        } catch (e) {
            console.error('Failed to load imported files from localStorage:', e);
        }
        return [];
    });

    // Persist metadata to localStorage when importedFiles changes (without dataUrl)
    useEffect(() => {
        try {
            // Store only metadata (without dataUrl to avoid quota issues)
            const metadataOnly = importedFiles.map(({ dataUrl, ...rest }) => rest);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(metadataOnly));
        } catch (e) {
            console.error('Failed to save imported files to localStorage:', e);
        }
    }, [importedFiles]);

    const handleFolderSelect = (folder: DigitaliumFolder) => {
        setSelectedFolder(folder);
    };

    const toggleFolders = () => setShowFolders(!showFolders);

    // File import handler with base64 conversion for preview
    const importFiles = useCallback(async (files: File[], folderId: string) => {
        const newFiles: ImportedFile[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Read file as data URL for preview
            const dataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => resolve('');
                reader.readAsDataURL(file);
            });

            // Determine file type from extension
            const extension = file.name.split('.').pop()?.toLowerCase() || '';
            let fileType: FileType = 'other';
            if (['doc', 'docx'].includes(extension)) fileType = 'document';
            else if (['xls', 'xlsx'].includes(extension)) fileType = 'spreadsheet';
            else if (['ppt', 'pptx'].includes(extension)) fileType = 'presentation';
            else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) fileType = 'image';
            else if (['pdf'].includes(extension)) fileType = 'pdf';

            // Format file size
            const sizeKB = Math.round(file.size / 1024);
            const sizeStr = sizeKB > 1024
                ? `${(sizeKB / 1024).toFixed(1)} MB`
                : `${sizeKB} KB`;

            const now = new Date().toISOString().split('T')[0];

            const fileId = `imported-${Date.now()}-${i}`;

            // Store file content in IndexedDB
            await storeFileContent(fileId, dataUrl, file.type);

            newFiles.push({
                id: fileId,
                name: file.name,
                type: fileType,
                extension: extension,
                size: sizeStr,
                status: 'draft' as FileStatus,
                author: 'Moi',
                createdAt: now,
                modifiedAt: now,
                folderId: folderId,
                isImported: true,
                // dataUrl is stored in IndexedDB, not in state
                mimeType: file.type,
            });
        }

        setImportedFiles(prev => [...prev, ...newFiles]);

        toast({
            title: `${files.length} fichier${files.length > 1 ? 's' : ''} importé${files.length > 1 ? 's' : ''}`,
            description: `Les fichiers ont été ajoutés au dossier.`,
        });
    }, [toast]);

    const openCreateFolderDialog = () => setShowCreateFolderDialog(true);

    const handleCreateFolder = (folderData: {
        name: string;
        color: string;
        parentId: string;
        path: string;
    }) => {
        const newFolder = addFolder(folderData);
        toast({
            title: "Dossier créé",
            description: `Le dossier "${newFolder.name}" a été créé avec succès.`,
        });
    };

    // Delete a file permanently
    const deleteFile = useCallback((fileId: string) => {
        setImportedFiles(prev => prev.filter(f => f.id !== fileId));
        toast({
            title: "Fichier supprimé",
            description: "Le fichier a été supprimé définitivement.",
            variant: "destructive",
        });
    }, [toast]);

    // Move a file to trash (mark as deleted but keep in state)
    const moveToTrash = useCallback((fileId: string) => {
        setImportedFiles(prev => prev.map(f =>
            f.id === fileId
                ? { ...f, status: 'archived' as FileStatus, folderId: 'trash' }
                : f
        ));
        toast({
            title: "Fichier déplacé",
            description: "Le fichier a été déplacé vers la corbeille.",
        });
    }, [toast]);

    // Restore a file from trash
    const restoreFromTrash = useCallback((fileId: string) => {
        setImportedFiles(prev => prev.map(f =>
            f.id === fileId
                ? { ...f, status: 'draft' as FileStatus, folderId: 'root' }
                : f
        ));
        toast({
            title: "Fichier restauré",
            description: "Le fichier a été restauré dans Mes Dossiers.",
        });
    }, [toast]);

    // Archive a file (move to iArchive)
    const archiveFile = useCallback((fileId: string) => {
        setImportedFiles(prev => prev.map(f =>
            f.id === fileId
                ? { ...f, status: 'archived' as FileStatus, folderId: 'archive' }
                : f
        ));
        toast({
            title: "✓ Document archivé",
            description: "Le document a été envoyé vers iArchive.",
        });
    }, [toast]);

    // Send file to iSignature
    const sendToSignature = useCallback((fileId: string, recipient: string) => {
        setImportedFiles(prev => prev.map(f =>
            f.id === fileId
                ? { ...f, status: 'review' as FileStatus, signaturePending: true, signatureRecipient: recipient } as any
                : f
        ));
        toast({
            title: "✓ Envoyé vers iSignature",
            description: recipient === 'self'
                ? "Prêt pour votre signature"
                : `Demande envoyée à ${recipient}`,
        });
    }, [toast]);

    // Get files in trash
    const getTrashFiles = useCallback(() => {
        return importedFiles.filter(f => f.folderId === 'trash');
    }, [importedFiles]);

    // Get archived files
    const getArchivedFiles = useCallback(() => {
        return importedFiles.filter(f => f.folderId === 'archive');
    }, [importedFiles]);

    // Context to pass to child routes
    const outletContext: IDocumentOutletContext = {
        selectedFolder,
        setSelectedFolder,
        showFolders,
        toggleFolders,
        folders,
        getSubfolders,
        openCreateFolderDialog,
        // File management
        importedFiles,
        importFiles,
        deleteFile,
        moveToTrash,
        restoreFromTrash,
        archiveFile,
        sendToSignature,
        getTrashFiles,
        getArchivedFiles,
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <FileText className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">iDocument</h1>
                                <p className="text-sm text-muted-foreground">
                                    {isBackoffice
                                        ? `Documents internes ${organizationName}`
                                        : 'Documents collaboratifs'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => {
                                // Trigger file input click for import
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = true;
                                input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png';
                                input.onchange = (e) => {
                                    const files = (e.target as HTMLInputElement).files;
                                    if (files && files.length > 0) {
                                        toast({
                                            title: "Importation en cours",
                                            description: `${files.length} fichier(s) sélectionné(s) pour import.`,
                                        });
                                    }
                                };
                                input.click();
                            }}>
                                <Upload className="h-4 w-4 mr-2" />
                                Importer
                            </Button>
                            <Button
                                className="bg-blue-500 hover:bg-blue-600"
                                onClick={openCreateFolderDialog}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nouveau
                            </Button>
                        </div>
                    </div>

                    {/* Sub-navigation */}
                    <div className="flex items-center">
                        {(() => {
                            const basePath = getBasePath(location.pathname);
                            return (
                                <Tabs value={location.pathname} className="w-auto">
                                    <TabsList className="bg-muted/50">
                                        {NAV_ITEMS.map((item) => {
                                            const href = `${basePath}/${item.path}`;
                                            return (
                                                <TabsTrigger
                                                    key={href}
                                                    value={href}
                                                    asChild
                                                    className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500"
                                                >
                                                    <Link to={href} className="flex items-center gap-2">
                                                        <item.icon className="h-4 w-4" />
                                                        {item.label}
                                                    </Link>
                                                </TabsTrigger>
                                            );
                                        })}
                                    </TabsList>
                                </Tabs>
                            );
                        })()}
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Folder Explorer Modal - Floating overlay */}
                <AnimatePresence initial={false}>
                    {showFolders && (
                        <>
                            {/* Backdrop (no click to close) */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/20 z-40 pointer-events-none"
                            />

                            {/* Floating Modal */}
                            <motion.aside
                                initial={{ x: -320, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -320, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="absolute left-4 top-4 bottom-4 w-80 rounded-xl border bg-background shadow-2xl flex flex-col overflow-hidden z-50"
                            >
                                {/* Modal header */}
                                <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                                    <div className="flex items-center gap-2">
                                        <FolderTree className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium">Arborescence</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={openCreateFolderDialog}
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Dossier
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => setShowFolders(false)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Folder tree */}
                                <div className="flex-1 overflow-hidden">
                                    <FolderExplorer
                                        folders={folders}
                                        onFolderSelect={handleFolderSelect}
                                        selectedFolderId={selectedFolder?.id}
                                        className="h-full"
                                    />
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Main content */}
                <main className="flex-1 overflow-auto p-6">
                    <Outlet context={outletContext} />
                </main>
            </div>

            {/* Create Folder Dialog */}
            <CreateFolderDialog
                open={showCreateFolderDialog}
                onOpenChange={setShowCreateFolderDialog}
                parentFolderName={selectedFolder?.name || 'Mes Dossiers'}
                parentFolderId={selectedFolder?.id || 'root'}
                parentPath={selectedFolder?.path || '/'}
                onCreateFolder={handleCreateFolder}
            />
        </div>
    );
}
