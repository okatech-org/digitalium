/**
 * Enterprise Archive Page
 * Professional document archiving with team collaboration features
 * Uses the new Supabase-backed archive system
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    Search,
    Filter,
    Grid3X3,
    List,
    FolderPlus,
    FileText,
    Folder,
    MoreVertical,
    Share2,
    Download,
    Trash2,
    Clock,
    Users,
    Shield,
    ChevronRight,
    Plus,
    RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

// Archive system imports
import { useArchiveManager, NavigationLevel } from '@/pages/idocument/hooks/useArchiveManager';
import { DocumentUploader } from '@/pages/idocument/components/DocumentUploader';
import { ShareDialog } from '@/pages/idocument/modals/ShareDialog';
import { StorageQuota } from '@/pages/idocument/components/StorageQuota';
import type { ArchiveFolder, ArchiveDocument } from '@/lib/archiveService';
import { formatFileSize } from '@/lib/storageUtils';

// Type config
const DOCUMENT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
    contract: { label: 'Contrat', color: 'bg-blue-500/20 text-blue-400' },
    invoice: { label: 'Facture', color: 'bg-green-500/20 text-green-400' },
    quote: { label: 'Devis', color: 'bg-yellow-500/20 text-yellow-400' },
    report: { label: 'Rapport', color: 'bg-purple-500/20 text-purple-400' },
    project: { label: 'Projet', color: 'bg-primary/20 text-primary' },
    hr: { label: 'RH', color: 'bg-orange-500/20 text-orange-400' },
    legal: { label: 'Juridique', color: 'bg-red-500/20 text-red-400' },
    fiscal: { label: 'Fiscal', color: 'bg-emerald-500/20 text-emerald-400' },
    other: { label: 'Autre', color: 'bg-muted text-muted-foreground' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    draft: { label: 'Brouillon', color: 'bg-yellow-500/20 text-yellow-400' },
    pending: { label: 'En révision', color: 'bg-blue-500/20 text-blue-400' },
    approved: { label: 'Approuvé', color: 'bg-green-500/20 text-green-400' },
    archived: { label: 'Archivé', color: 'bg-gray-500/20 text-gray-400' },
};

export default function EnterpriseArchive() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showUploader, setShowUploader] = useState(false);
    const [shareDoc, setShareDoc] = useState<ArchiveDocument | null>(null);
    const [filterType, setFilterType] = useState<string>('all');

    // Archive system hook
    const {
        isLoading,
        classeurs,
        dossiers,
        fichiers,
        filteredDocuments,
        selectedClasseur,
        selectedDossier,
        selectedDocument,
        navigationLevel,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        stats,
        storageStats,
        handleSelectClasseur,
        handleSelectDossier,
        handleSelectDocument,
        handleNavigateToClasseurs,
        handleNavigateToDossiers,
        handleCreateClasseur,
        handleCreateDossier,
        handleUploadDocument,
        handleDeleteDocument,
        refresh,
    } = useArchiveManager();

    // Handle upload
    const handleUpload = async (file: File, onProgress: (p: number) => void) => {
        await handleUploadDocument(file, { onProgress });
    };

    // Breadcrumb
    const breadcrumbs = useMemo(() => {
        const crumbs = [{ label: 'Archives', onClick: handleNavigateToClasseurs }];
        if (selectedClasseur) {
            crumbs.push({ label: selectedClasseur.name, onClick: handleNavigateToDossiers });
        }
        if (selectedDossier) {
            crumbs.push({ label: selectedDossier.name, onClick: () => { } });
        }
        return crumbs;
    }, [selectedClasseur, selectedDossier, handleNavigateToClasseurs, handleNavigateToDossiers]);

    // Filtered items by type
    const displayedDocuments = useMemo(() => {
        if (filterType === 'all') return filteredDocuments;
        return filteredDocuments.filter(d => d.document_type === filterType);
    }, [filteredDocuments, filterType]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center gap-4 px-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-xl font-semibold">Archives Entreprise</h1>
                        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                            {breadcrumbs.map((crumb, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && <ChevronRight className="h-3 w-3" />}
                                    <button
                                        onClick={crumb.onClick}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {crumb.label}
                                    </button>
                                </React.Fragment>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={refresh}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => setShowUploader(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Importer
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container px-4 py-6">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1 space-y-6">
                        {/* Storage Quota */}
                        <StorageQuota
                            usedBytes={storageStats.usedBytes}
                            totalBytes={107374182400} // 100GB for Business
                            documentCount={storageStats.documentCount}
                            folderCount={storageStats.folderCount}
                        />

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Statistiques</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Classeurs</span>
                                    <span className="font-medium">{stats.totalClasseurs}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Documents</span>
                                    <span className="font-medium">{stats.totalDocuments}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Brouillons</span>
                                    <span className="font-medium">{stats.brouillons}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Corbeille</span>
                                    <span className="font-medium text-red-400">{stats.trashCount}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Actions rapides</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        const name = prompt('Nom du classeur');
                                        if (name) handleCreateClasseur({ name });
                                    }}
                                >
                                    <FolderPlus className="h-4 w-4 mr-2" />
                                    Nouveau classeur
                                </Button>
                                {selectedClasseur && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            const name = prompt('Nom du dossier');
                                            if (name) handleCreateDossier(selectedClasseur.id, { name });
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nouveau dossier
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-4">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-[150px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les types</SelectItem>
                                    {Object.entries(DOCUMENT_TYPE_CONFIG).map(([key, { label }]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Trier par" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date_desc">Plus récent</SelectItem>
                                    <SelectItem value="date_asc">Plus ancien</SelectItem>
                                    <SelectItem value="name">Nom A-Z</SelectItem>
                                    <SelectItem value="type">Type</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex border rounded-lg">
                                <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-center py-20"
                                >
                                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                                </motion.div>
                            ) : navigationLevel === 'classeurs' ? (
                                <FolderGrid
                                    key="classeurs"
                                    folders={classeurs}
                                    onSelect={handleSelectClasseur}
                                    emptyMessage="Aucun classeur. Créez votre premier classeur pour commencer."
                                    viewMode={viewMode}
                                />
                            ) : navigationLevel === 'dossiers' ? (
                                <FolderGrid
                                    key="dossiers"
                                    folders={dossiers}
                                    onSelect={handleSelectDossier}
                                    emptyMessage="Ce classeur est vide. Ajoutez un dossier."
                                    viewMode={viewMode}
                                />
                            ) : (
                                <DocumentGrid
                                    key="documents"
                                    documents={displayedDocuments}
                                    onSelect={handleSelectDocument}
                                    onShare={setShareDoc}
                                    onDelete={handleDeleteDocument}
                                    viewMode={viewMode}
                                />
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploader && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                        onClick={() => setShowUploader(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-background rounded-xl p-6 max-w-lg w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg font-semibold mb-4">Importer des documents</h2>
                            <DocumentUploader
                                onUpload={handleUpload}
                                planType="business"
                            />
                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={() => setShowUploader(false)}
                            >
                                Fermer
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Share Dialog */}
            <ShareDialog
                document={shareDoc}
                open={!!shareDoc}
                onOpenChange={(open) => !open && setShareDoc(null)}
            />
        </div>
    );
}

// ============================================
// Sub-components
// ============================================

interface FolderGridProps {
    folders: ArchiveFolder[];
    onSelect: (folder: ArchiveFolder) => void;
    emptyMessage: string;
    viewMode: 'grid' | 'list';
}

function FolderGrid({ folders, onSelect, emptyMessage, viewMode }: FolderGridProps) {
    if (folders.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
            >
                <Folder className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">{emptyMessage}</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-2'
            }
        >
            {folders.map((folder, i) => (
                <motion.div
                    key={folder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    {viewMode === 'grid' ? (
                        <Card
                            className="cursor-pointer hover:border-primary/50 transition-all group"
                            onClick={() => onSelect(folder)}
                        >
                            <CardContent className="p-4">
                                <div className={`w-12 h-12 rounded-xl ${folder.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                    <span className="text-2xl">{folder.icon}</span>
                                </div>
                                <h3 className="font-medium truncate">{folder.name}</h3>
                                {folder.description && (
                                    <p className="text-sm text-muted-foreground truncate">{folder.description}</p>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div
                            className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer transition-all"
                            onClick={() => onSelect(folder)}
                        >
                            <div className={`w-10 h-10 rounded-lg ${folder.color} flex items-center justify-center`}>
                                <span className="text-xl">{folder.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{folder.name}</h3>
                                {folder.description && (
                                    <p className="text-sm text-muted-foreground truncate">{folder.description}</p>
                                )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )}
                </motion.div>
            ))}
        </motion.div>
    );
}

interface DocumentGridProps {
    documents: ArchiveDocument[];
    onSelect: (doc: ArchiveDocument) => void;
    onShare: (doc: ArchiveDocument) => void;
    onDelete: (id: string) => void;
    viewMode: 'grid' | 'list';
}

function DocumentGrid({ documents, onSelect, onShare, onDelete, viewMode }: DocumentGridProps) {
    if (documents.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
            >
                <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Aucun document dans ce dossier.</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-2'
            }
        >
            {documents.map((doc, i) => {
                const typeConfig = DOCUMENT_TYPE_CONFIG[doc.document_type] || DOCUMENT_TYPE_CONFIG.other;
                const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.draft;

                return (
                    <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                    >
                        {viewMode === 'grid' ? (
                            <Card
                                className="cursor-pointer hover:border-primary/50 transition-all group relative"
                                onClick={() => onSelect(doc)}
                            >
                                <CardContent className="p-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <FileText className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="font-medium truncate text-sm">{doc.title}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary" className={`text-xs ${typeConfig.color}`}>
                                            {typeConfig.label}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {formatFileSize(doc.size_bytes)}
                                    </p>

                                    {/* Actions */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(doc); }}>
                                                    <Share2 className="h-4 w-4 mr-2" />
                                                    Partager
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Télécharger
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-500"
                                                    onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div
                                className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer transition-all group"
                                onClick={() => onSelect(doc)}
                            >
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate">{doc.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{formatFileSize(doc.size_bytes)}</span>
                                        <span>•</span>
                                        <Badge variant="secondary" className={`text-xs ${typeConfig.color}`}>
                                            {typeConfig.label}
                                        </Badge>
                                    </div>
                                </div>
                                <Badge variant="outline" className={statusConfig.color}>
                                    {statusConfig.label}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(doc); }}>
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Partager
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Download className="h-4 w-4 mr-2" />
                                            Télécharger
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-red-500"
                                            onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
