/**
 * iArchive Module Layout - With Folder Hierarchy
 * Full-width layout with horizontal category tabs and folder tree modal
 */

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArchiveCategoryTabs } from './components/ArchiveCategoryTabs';
import { ArchiveFolderExplorer } from './components/ArchiveFolderExplorer';
import { CreateArchiveFolderDialog } from './components/CreateArchiveFolderDialog';
import { useArchiveFolderManager } from '@/hooks/useArchiveFolderManager';
import { useSpaceFromUrl } from '@/contexts/SpaceContext';
import { useToast } from '@/hooks/use-toast';
import {
    DigitaliumArchiveFolder,
    ArchiveCategory,
    ARCHIVE_RETENTION_DEFAULTS,
} from '@/data/digitaliumMockData';

// Context type for child routes
export interface IArchiveOutletContext {
    selectedFolder: DigitaliumArchiveFolder | null;
    setSelectedFolder: (folder: DigitaliumArchiveFolder) => void;
    showFolders: boolean;
    toggleFolders: () => void;
    currentCategory: ArchiveCategory;
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
    const [parentFolderForCreate, setParentFolderForCreate] = useState<DigitaliumArchiveFolder | null>(null);

    // Storage stats
    const storageUsed = 156;
    const storageTotal = 200;
    const storagePercent = (storageUsed / storageTotal) * 100;

    const handleFolderSelect = (folder: DigitaliumArchiveFolder) => {
        setSelectedFolder(folder);
    };

    const toggleFolders = () => setShowFolders(!showFolders);

    const openCreateFolderDialog = (parentFolder?: DigitaliumArchiveFolder) => {
        const parent = parentFolder || getRootFolder() || null;
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

    // Context to pass to child routes
    const outletContext: IArchiveOutletContext = {
        selectedFolder,
        setSelectedFolder,
        showFolders,
        toggleFolders,
        currentCategory,
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
                        <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-1" />
                            Filtres
                        </Button>
                        <Button variant="outline" size="sm">
                            <Award className="h-4 w-4 mr-1" />
                            Certificat
                        </Button>
                        <Button
                            className="bg-emerald-500 hover:bg-emerald-600"
                            size="sm"
                            onClick={() => toast({ title: "Archiver", description: "Fonctionnalité d'archivage en cours de développement." })}
                        >
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
                    <Outlet context={outletContext} />
                </main>
            </div>

            {/* Create Folder Dialog */}
            {parentFolderForCreate && (
                <CreateArchiveFolderDialog
                    open={showCreateFolderDialog}
                    onOpenChange={setShowCreateFolderDialog}
                    parentFolderName={parentFolderForCreate.name}
                    parentFolderId={parentFolderForCreate.id}
                    parentPath={parentFolderForCreate.path}
                    category={currentCategory}
                    defaultRetentionYears={ARCHIVE_RETENTION_DEFAULTS[currentCategory]}
                    onCreateFolder={handleCreateFolder}
                />
            )}
        </div>
    );
}
