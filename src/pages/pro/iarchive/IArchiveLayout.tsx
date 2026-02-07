/**
 * iArchive Module Layout - With Folder Hierarchy
 * Full-width layout with horizontal category tabs and folder tree modal
 * Supports unarchiving with optional workflow validation
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Archive,
    Upload,
    Search,
    Filter,
    Award,
    HardDrive,
    AlertTriangle,
    FolderTree,
    Plus,
    X,
    ArchiveRestore,
    GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArchiveCategoryTabs } from './components/ArchiveCategoryTabs';
import { ArchiveFolderExplorer } from './components/ArchiveFolderExplorer';
import { CreateArchiveFolderDialog } from './components/CreateArchiveFolderDialog';
import { UnarchiveDialog } from './components/UnarchiveDialog';
import { UnarchiveRequestsPanel } from './components/UnarchiveRequestsPanel';
import { useArchiveFolderManager } from '@/hooks/useArchiveFolderManager';
import { useSpaceFromUrl } from '@/contexts/SpaceContext';
import { useToast } from '@/hooks/use-toast';
import { unarchiveDocument } from '@/services/documentFilesService';
import { getPendingUnarchiveRequests, type UnarchiveRequest } from '@/services/unarchiveService';
import {
    DigitaliumArchiveFolder,
    ArchiveCategory,
    ARCHIVE_RETENTION_DEFAULTS,
} from '@/data/digitaliumMockData';

// Imported Archive File type (similar to ImportedFile in iDocument)
export interface ImportedArchive {
    id: string;
    name: string;
    type: string;
    size: string;
    folderId: string;
    category: ArchiveCategory;
    status: 'draft' | 'review' | 'approved' | 'final' | 'archived';
    author: string;
    createdAt: string;
    modifiedAt: string;
    isImported?: boolean;
    dataUrl?: string;
    mimeType?: string;
    retentionYears?: number;
    certified?: boolean;
    hash?: string;
}

const ARCHIVE_STORAGE_KEY = 'digitalium-imported-archives';

// Context type for child routes
export interface IArchiveOutletContext {
    selectedFolder: DigitaliumArchiveFolder | null;
    setSelectedFolder: (folder: DigitaliumArchiveFolder | null) => void;
    showFolders: boolean;
    toggleFolders: () => void;
    currentCategory: ArchiveCategory;
    // Folder management (similar to iDocument)
    folders: DigitaliumArchiveFolder[];
    getSubfolders: (parentId: string) => DigitaliumArchiveFolder[];
    openCreateFolderDialog: () => void;
    // File management
    importedArchives: ImportedArchive[];
    importArchive: (files: File[], folderId: string) => void;
    deleteArchive: (fileId: string) => void;
    moveToTrash: (fileId: string) => void;
    getArchivesInFolder: (folderId: string) => ImportedArchive[];
    // Unarchive management
    onUnarchive: (doc: { id: string; title: string; category: string }) => void;
}

// Map URL paths to categories
const getCategoryFromPath = (pathname: string): ArchiveCategory => {
    const pathParts = pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    const categoryMap: Record<string, ArchiveCategory> = {
        'fiscal': 'fiscal',
        'social': 'social',
        'legal': 'legal',
        'juridique': 'legal',
        'clients': 'clients',
        'vault': 'vault',
        'coffre-fort': 'vault',
        'certificates': 'certificates',
        'certificats': 'certificates',
        'iarchive': 'fiscal', // Default
    };
    return categoryMap[lastPart] || 'fiscal';
};

export default function IArchiveLayout() {
    const location = useLocation();
    const { isBackoffice } = useSpaceFromUrl();
    const { toast } = useToast();

    // Determine current category from URL
    const currentCategory = useMemo(() => getCategoryFromPath(location.pathname), [location.pathname]);

    // Folder management hook (filtered by current category)
    const { folders, addFolder, getSubfolders, findFolder, getRootFolder } = useArchiveFolderManager(currentCategory);

    // UI state
    const [showFolders, setShowFolders] = useState(false);
    const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<DigitaliumArchiveFolder | null>(null);
    const [showUnarchiveDialog, setShowUnarchiveDialog] = useState(false);
    const [unarchiveTarget, setUnarchiveTarget] = useState<{ id: string; title: string; category: string } | null>(null);
    const [showUnarchiveRequests, setShowUnarchiveRequests] = useState(false);
    const pendingUnarchiveCount = useMemo(() => getPendingUnarchiveRequests().length, []);
    const [parentFolderForCreate, setParentFolderForCreate] = useState<DigitaliumArchiveFolder | null>(null);

    // Imported archives state (similar to importedFiles in iDocument)
    const [importedArchives, setImportedArchives] = useState<ImportedArchive[]>(() => {
        try {
            const stored = localStorage.getItem(ARCHIVE_STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored) as ImportedArchive[];
            }
        } catch (e) {
            console.error('Failed to load imported archives:', e);
        }
        return [];
    });

    // Persist importedArchives to localStorage
    React.useEffect(() => {
        try {
            localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(importedArchives));
        } catch (e) {
            console.error('Failed to save imported archives:', e);
        }
    }, [importedArchives]);

    // Storage stats
    const storageUsed = 156;
    const storageTotal = 200;
    const storagePercent = (storageUsed / storageTotal) * 100;

    const handleFolderSelect = (folder: DigitaliumArchiveFolder) => {
        setSelectedFolder(folder);
    };

    const toggleFolders = () => setShowFolders(!showFolders);

    const openCreateFolderDialog = (parentFolder?: DigitaliumArchiveFolder) => {
        // If no parent provided and no root folder exists, create at root level
        const root = getRootFolder();
        const parent = parentFolder || root || {
            id: 'root-' + currentCategory,
            name: 'Racine ' + currentCategory,
            category: currentCategory,
            parentId: null,
            path: '/',
            retentionYears: ARCHIVE_RETENTION_DEFAULTS[currentCategory],
            createdAt: new Date().toISOString().split('T')[0],
            modifiedAt: new Date().toISOString().split('T')[0],
        } as DigitaliumArchiveFolder;
        setParentFolderForCreate(parent);
        setShowCreateFolderDialog(true);
    };

    const handleCreateFolder = (folderData: {
        name: string;
        color: string;
        parentId: string;
        path: string;
        category: ArchiveCategory;
        retentionYears?: number;
    }) => {
        const newFolder = addFolder(folderData);
        toast({
            title: "Dossier créé",
            description: `Le dossier "${newFolder.name}" a été créé avec succès.`,
        });
    };

    // Import archive files (similar to importFiles in iDocument)
    const importArchive = useCallback((files: File[], folderId: string) => {
        const newArchives: ImportedArchive[] = files.map(file => ({
            id: `archive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.name.split('.').pop() || 'document',
            size: file.size < 1024 * 1024
                ? `${Math.round(file.size / 1024)} KB`
                : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            folderId,
            category: currentCategory,
            status: 'archived',
            author: 'Utilisateur',
            createdAt: new Date().toISOString().split('T')[0],
            modifiedAt: new Date().toISOString().split('T')[0],
            isImported: true,
            mimeType: file.type,
            retentionYears: ARCHIVE_RETENTION_DEFAULTS[currentCategory] as number,
            certified: true,
            hash: `SHA256:${Math.random().toString(36).substr(2, 16)}`,
        }));

        setImportedArchives(prev => [...prev, ...newArchives]);
        toast({
            title: "✓ Archives importées",
            description: `${files.length} fichier(s) archivé(s) avec succès`,
        });
    }, [currentCategory, toast]);

    // Delete archive permanently
    const deleteArchive = useCallback((fileId: string) => {
        setImportedArchives(prev => prev.filter(f => f.id !== fileId));
        toast({
            title: "Archive supprimée",
            description: "L'archive a été définitivement supprimée.",
            variant: "destructive",
        });
    }, [toast]);

    // Move archive to trash
    const moveToTrash = useCallback((fileId: string) => {
        setImportedArchives(prev => prev.map(f =>
            f.id === fileId
                ? { ...f, status: 'archived' as const, folderId: 'trash' }
                : f
        ));
        toast({
            title: "Archive déplacée",
            description: "L'archive a été déplacée vers la corbeille.",
        });
    }, [toast]);

    // Get archives in a specific folder
    const getArchivesInFolder = useCallback((folderId: string) => {
        return importedArchives.filter(a => a.folderId === folderId && a.category === currentCategory);
    }, [importedArchives, currentCategory]);

    // Unarchive handler - opens the UnarchiveDialog
    const onUnarchive = useCallback((doc: { id: string; title: string; category: string }) => {
        setUnarchiveTarget(doc);
        setShowUnarchiveDialog(true);
    }, []);

    // Called when unarchive is completed (direct or workflow approved)
    const handleUnarchiveComplete = useCallback((requestId: string, mode: 'direct' | 'workflow') => {
        if (mode === 'direct' && unarchiveTarget) {
            // Direct unarchive: move the document out of archive
            unarchiveDocument(unarchiveTarget.id);
            // Also remove from imported archives if it exists there
            setImportedArchives(prev => prev.filter(a => a.id !== unarchiveTarget.id));
            toast({
                title: "✓ Document désarchivé",
                description: `"${unarchiveTarget.title}" a été restauré dans iDocument.`,
            });
        } else {
            toast({
                title: "📋 Demande soumise",
                description: `La demande de désarchivage pour "${unarchiveTarget?.title}" a été envoyée aux approbateurs.`,
            });
        }
        setUnarchiveTarget(null);
    }, [unarchiveTarget, toast]);

    // Handle completed unarchive request from the requests panel
    const handleRequestCompleted = useCallback((request: UnarchiveRequest) => {
        // When a workflow is fully approved, actually unarchive the document
        unarchiveDocument(request.documentId);
        setImportedArchives(prev => prev.filter(a => a.id !== request.documentId));
        toast({
            title: "✓ Désarchivage approuvé",
            description: `"${request.documentTitle}" a été restauré dans iDocument.`,
        });
    }, [toast]);

    // Context to pass to child routes
    const outletContext: IArchiveOutletContext = {
        selectedFolder,
        setSelectedFolder,
        showFolders,
        toggleFolders,
        currentCategory,
        // Folder management
        folders,
        getSubfolders,
        openCreateFolderDialog: () => openCreateFolderDialog(),
        // File management
        importedArchives,
        importArchive,
        deleteArchive,
        moveToTrash,
        getArchivesInFolder,
        // Unarchive
        onUnarchive,
    };

    return (
        <div className="h-full flex flex-col">
            {/* Compact Header Bar */}
            <header className="border-b px-6 py-3 space-y-3">
                {/* Top row: Branding + Search + Actions */}
                <div className="flex items-center gap-4">
                    {/* Module identity */}
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10">
                            <Archive className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">iArchive</h1>
                            <p className="text-[10px] text-muted-foreground">Archivage légal</p>
                        </div>
                    </div>

                    {/* Arborescence button */}
                    <Button
                        variant={showFolders ? 'default' : 'outline'}
                        size="sm"
                        onClick={toggleFolders}
                        className={cn(
                            showFolders && 'bg-emerald-500 hover:bg-emerald-600'
                        )}
                    >
                        <FolderTree className="h-4 w-4 mr-1" />
                        Arborescence
                    </Button>

                    {/* Global search */}
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Recherche dans les archives... (⌘K)"
                            className="pl-9 h-9"
                        />
                    </div>

                    {/* Storage indicator - compact */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <div className="w-20">
                            <Progress value={storagePercent} className="h-1.5" />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {storageUsed}/{storageTotal} GB
                        </span>
                    </div>

                    {/* Expiration alert */}
                    <Badge variant="outline" className="border-orange-500/50 text-orange-500 hidden sm:flex">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        12 expirations
                    </Badge>

                    {/* Actions */}
                    <div className="flex gap-2">
                        {/* Unarchive Requests Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                'relative',
                                showUnarchiveRequests && 'bg-amber-500/10 border-amber-500/50 text-amber-600'
                            )}
                            onClick={() => setShowUnarchiveRequests(!showUnarchiveRequests)}
                        >
                            <GitBranch className="h-4 w-4 mr-1" />
                            Demandes
                            {pendingUnarchiveCount > 0 && (
                                <Badge className="ml-1.5 h-4 px-1.5 text-[10px] bg-amber-500 text-white">
                                    {pendingUnarchiveCount}
                                </Badge>
                            )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                            toast({
                                title: "Filtres",
                                description: "Panneau de filtres avancés (à implémenter)",
                            });
                        }}>
                            <Filter className="h-4 w-4 mr-1" />
                            Filtres
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                            toast({
                                title: "Certificat",
                                description: "Génération de certificat d'archivage (à implémenter)",
                            });
                        }}>
                            <Award className="h-4 w-4 mr-1" />
                            Certificat
                        </Button>
                        <Button className="bg-emerald-500 hover:bg-emerald-600" size="sm" onClick={() => {
                            // Trigger file input click for archive
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.multiple = true;
                            input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
                            input.onchange = (e) => {
                                const files = (e.target as HTMLInputElement).files;
                                if (files && files.length > 0) {
                                    toast({
                                        title: "Archivage en cours",
                                        description: `${files.length} fichier(s) sélectionné(s) pour archivage.`,
                                    });
                                }
                            };
                            input.click();
                        }}>
                            <Upload className="h-4 w-4 mr-1" />
                            Archiver
                        </Button>
                    </div>
                </div>

                {/* Category Tabs */}
                <ArchiveCategoryTabs />
            </header>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Folder Explorer Modal - Floating overlay */}
                <AnimatePresence initial={false}>
                    {showFolders && (
                        <>
                            {/* Backdrop */}
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
                                <div className="p-4 border-b flex items-center justify-between bg-emerald-500/5">
                                    <div className="flex items-center gap-2">
                                        <FolderTree className="h-4 w-4 text-emerald-500" />
                                        <span className="text-sm font-medium">Arborescence</span>
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                            {currentCategory}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => openCreateFolderDialog()}
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
                                    <ArchiveFolderExplorer
                                        folders={folders}
                                        onFolderSelect={handleFolderSelect}
                                        selectedFolderId={selectedFolder?.id}
                                        className="h-full"
                                        onCreateFolder={(parentFolder) => openCreateFolderDialog(parentFolder)}
                                    />
                                </div>

                                {/* Selected folder info */}
                                {selectedFolder && (
                                    <div className="p-3 border-t bg-muted/30">
                                        <p className="text-xs text-muted-foreground">Dossier sélectionné:</p>
                                        <p className="text-sm font-medium truncate">{selectedFolder.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                                            {selectedFolder.path}
                                        </p>
                                    </div>
                                )}
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Main content */}
                <main className="flex-1 overflow-auto p-6">
                    {showUnarchiveRequests ? (
                        <UnarchiveRequestsPanel
                            onRequestCompleted={handleRequestCompleted}
                        />
                    ) : (
                        <Outlet context={outletContext} />
                    )}
                </main>
            </div>

            {/* Create Folder Dialog */}
            <CreateArchiveFolderDialog
                open={showCreateFolderDialog}
                onOpenChange={setShowCreateFolderDialog}
                parentFolderName={parentFolderForCreate?.name || 'Racine'}
                parentFolderId={parentFolderForCreate?.id || null}
                parentPath={parentFolderForCreate?.path || '/'}
                category={currentCategory}
                defaultRetentionYears={ARCHIVE_RETENTION_DEFAULTS[currentCategory]}
                onCreateFolder={handleCreateFolder}
            />

            {/* Unarchive Dialog */}
            <UnarchiveDialog
                open={showUnarchiveDialog}
                onOpenChange={setShowUnarchiveDialog}
                document={unarchiveTarget}
                onUnarchiveComplete={handleUnarchiveComplete}
            />
        </div>
    );
}
