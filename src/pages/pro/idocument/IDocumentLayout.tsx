/**
 * iDocument Module Layout
 * Wrapper for all iDocument pages with sub-navigation
 * In SubAdmin context, shows folder hierarchy for Digitalium backoffice
 */

import React, { useState } from 'react';
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
import { DigitaliumFolder } from '@/data/digitaliumMockData';
import { useToast } from '@/hooks/use-toast';

// Context type for child routes
export interface IDocumentOutletContext {
    selectedFolder: DigitaliumFolder | null;
    setSelectedFolder: (folder: DigitaliumFolder) => void;
    showFolders: boolean;
    toggleFolders: () => void;
    folders: DigitaliumFolder[];
    getSubfolders: (parentId: string) => DigitaliumFolder[];
    openCreateFolderDialog: () => void;
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
    const [showFolders, setShowFolders] = useState(false);
    const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);

    // Use folder manager hook for reactive folder management
    const { folders, addFolder, getSubfolders, findFolder } = useFolderManager();

    // Initialize with root folder
    const rootFolder = folders.find(f => f.id === 'root') || null;
    const [selectedFolder, setSelectedFolder] = useState<DigitaliumFolder | null>(rootFolder);

    const handleFolderSelect = (folder: DigitaliumFolder) => {
        setSelectedFolder(folder);
    };

    const toggleFolders = () => setShowFolders(!showFolders);

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

    // Context to pass to child routes
    const outletContext: IDocumentOutletContext = {
        selectedFolder,
        setSelectedFolder,
        showFolders,
        toggleFolders,
        folders,
        getSubfolders,
        openCreateFolderDialog,
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
                            <Button variant="outline" onClick={() => toast({ title: "Importer", description: "Fonctionnalité d'import en cours de développement." })}>
                                <Upload className="h-4 w-4 mr-2" />
                                Importer
                            </Button>
                            <Button className="bg-blue-500 hover:bg-blue-600" onClick={openCreateFolderDialog}>
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
