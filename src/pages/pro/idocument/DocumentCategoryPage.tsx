/**
 * DocumentCategoryPage - Dynamic iDocument category page
 * Adapts content based on route (my, shared, team, templates, trash)
 * Shows files from selected folder in SubAdmin backoffice mode
 */

import React, { useState, useMemo } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    MoreVertical,
    Share2,
    PenTool,
    Archive,
    Clock,
    Users,
    FolderOpen,
    Trash2,
    Copy,
    Download,
    Edit,
    Star,
    StarOff,
    RotateCcw,
    Search,
    Filter,
    Grid,
    List,
    Plus,
    FileSpreadsheet,
    FileImage,
    FilePen,
    Presentation,
    File,
    Lock,
    Globe,
    UserCheck,
    ChevronRight,
    Home,
    Upload,
    FolderPlus,
    FolderTree,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { cn } from '@/lib/utils';
import { useSpaceFromUrl } from '@/contexts/SpaceContext';
import { useToast } from '@/hooks/use-toast';
import {
    digitaliumDocuments,
    digitaliumFiles,
    getFilesInFolder,
    getFolderBreadcrumb,
    getFolderItemCount,
    DigitaliumFile,
    DigitaliumFolder
} from '@/data/digitaliumMockData';
import { IDocumentOutletContext, ImportedFile } from './IDocumentLayout';
import { DocumentPreviewDialog } from './components/DocumentPreviewDialog';
import { A4DocumentCard } from './components/A4DocumentCard';
import { getFileContent } from '@/services/fileStorage';

// Category configuration
interface CategoryConfig {
    key: string;
    title: string;
    description: string;
    icon: typeof FileText;
    color: string;
    emptyMessage: string;
    showOwner: boolean;
    showSharedWith: boolean;
    canRestore?: boolean;
    canDelete?: boolean;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
    my: {
        key: 'my',
        title: 'Mes Dossiers',
        description: 'Dossiers personnels et fichiers importés',
        icon: FileText,
        color: 'text-blue-500 bg-blue-500/10',
        emptyMessage: 'Créez votre premier dossier pour commencer',
        showOwner: false,
        showSharedWith: true,
        canDelete: true,
    },
    shared: {
        key: 'shared',
        title: 'Documents Partagés',
        description: 'Documents partagés avec vous',
        icon: Share2,
        color: 'text-purple-500 bg-purple-500/10',
        emptyMessage: 'Aucun document partagé avec vous',
        showOwner: true,
        showSharedWith: false,
    },
    team: {
        key: 'team',
        title: 'Documents Équipe',
        description: 'Documents de l\'espace d\'équipe',
        icon: Users,
        color: 'text-green-500 bg-green-500/10',
        emptyMessage: 'Votre équipe n\'a pas encore de documents',
        showOwner: true,
        showSharedWith: true,
    },
    templates: {
        key: 'templates',
        title: 'Modèles',
        description: 'Modèles de documents réutilisables',
        icon: Copy,
        color: 'text-amber-500 bg-amber-500/10',
        emptyMessage: 'Aucun modèle disponible',
        showOwner: true,
        showSharedWith: false,
    },
    trash: {
        key: 'trash',
        title: 'Corbeille',
        description: 'Documents supprimés (30 jours)',
        icon: Trash2,
        color: 'text-red-500 bg-red-500/10',
        emptyMessage: 'La corbeille est vide',
        showOwner: false,
        showSharedWith: false,
        canRestore: true,
        canDelete: true,
    },
};

// Document types with icons
const DOCUMENT_TYPES = {
    folder: { icon: FolderOpen, color: 'text-blue-500' },
    document: { icon: FileText, color: 'text-blue-500' },
    spreadsheet: { icon: FileSpreadsheet, color: 'text-green-500' },
    presentation: { icon: Presentation, color: 'text-orange-500' },
    image: { icon: FileImage, color: 'text-purple-500' },
    contract: { icon: FilePen, color: 'text-amber-500' },
    pdf: { icon: FilePen, color: 'text-red-500' },
    other: { icon: File, color: 'text-gray-500' },
};

// Map document types from mock data
const TYPE_MAP: Record<string, string> = {
    'contract': 'contract',
    'legal': 'document',
    'procedure': 'document',
    'technical': 'document',
    'hr': 'document',
    'marketing': 'presentation',
};

// Status configurations
const STATUS_CONFIG = {
    draft: { label: 'Brouillon', color: 'bg-gray-500/20 text-gray-500' },
    review: { label: 'En révision', color: 'bg-yellow-500/20 text-yellow-500' },
    approved: { label: 'Validé', color: 'bg-green-500/20 text-green-500' },
    published: { label: 'Publié', color: 'bg-blue-500/20 text-blue-500' },
    archived: { label: 'Archivé', color: 'bg-purple-500/20 text-purple-500' },
    deleted: { label: 'Supprimé', color: 'bg-red-500/20 text-red-500' },
};

// Generate documents based on context (SubAdmin = Digitalium, Pro = empty/client)
const generateContextualDocuments = (category: string, isBackoffice: boolean) => {
    if (!isBackoffice) {
        // Pro space - return empty for now (would come from database in production)
        return [];
    }

    // SubAdmin backoffice - return Digitalium documents
    return digitaliumDocuments
        .filter(doc => doc.category === category)
        .map(doc => ({
            id: doc.id,
            title: doc.title,
            type: TYPE_MAP[doc.type] || 'document',
            status: doc.status,
            lastEdit: doc.lastModified,
            collaborators: doc.collaborators.map(c => c.charAt(0)),
            starred: false,
            size: '1.2 MB',
            visibility: 'team',
            owner: doc.author,
            isTemplate: doc.category === 'templates',
        }));
};

const generateCollaborators = (_category: string) => {
    return [];
};

const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Il y a quelques minutes';
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return `Il y a ${Math.floor(days / 7)} sem.`;
};

// formatRelativeTime function removed, moved inline

export default function DocumentCategoryPage() {
    const location = useLocation();
    const { isBackoffice } = useSpaceFromUrl();
    const { toast } = useToast();

    // Get selected folder from parent layout context
    const {
        selectedFolder,
        setSelectedFolder,
        toggleFolders,
        folders,
        getSubfolders,
        openCreateFolderDialog,
        importedFiles,
        importFiles,
        deleteFile,
        moveToTrash,
    } = useOutletContext<IDocumentOutletContext>();

    // Local view mode state - fully managed by this component
    const [viewMode, setViewMode] = useState<'grid' | 'list' | '3d'>('grid');

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [starredOnly, setStarredOnly] = useState(false);

    // Document preview state
    const [previewDocument, setPreviewDocument] = useState<{
        id: string;
        title: string;
        type: string;
        size?: string;
        dataUrl?: string;
        mimeType?: string;
    } | null>(null);

    // Determine category from URL
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];

    const categoryMap: Record<string, string> = {
        'idocument': 'my',
        'shared': 'shared',
        'team': 'team',
        'templates': 'templates',
        'trash': 'trash',
    };

    const resolvedCategory = categoryMap[lastPart] || 'my';
    const config = CATEGORY_CONFIG[resolvedCategory];
    const CategoryIcon = config.icon;

    // Get breadcrumb for current folder
    const breadcrumb = useMemo(() => {
        if (!selectedFolder || !isBackoffice) return [];
        return getFolderBreadcrumb(selectedFolder.id);
    }, [selectedFolder, isBackoffice]);

    // Get files from selected folder - works for all spaces
    const documents = useMemo(() => {
        if (resolvedCategory === 'my' && selectedFolder) {
            // Get files from the selected folder (mock + imported)
            const mockFiles = getFilesInFolder(selectedFolder.id);
            const localFiles = importedFiles.filter(f => f.folderId === selectedFolder.id);
            const allFiles = [...mockFiles, ...localFiles];
            const subfolders = getSubfolders(selectedFolder.id);

            // Convert DigitaliumFile to display format
            const fileDocuments = allFiles.map(f => ({
                id: f.id,
                title: f.name,
                type: f.type === 'pdf' ? 'contract' : f.type,
                status: f.status,
                lastEdit: f.modifiedAt,
                collaborators: f.collaborators?.map(c => c.charAt(0)) || [],
                starred: f.starred || false,
                size: f.size,
                visibility: 'team',
                owner: f.author,
                isTemplate: false,
                isFolder: false,
            }));

            // Sous-dossiers comme cartes cliquables
            const folderItems = subfolders.map(sf => {
                const itemCount = getFolderItemCount(sf.id);
                const importedCount = importedFiles.filter(f => f.folderId === sf.id).length;
                return {
                    id: sf.id,
                    title: sf.name,
                    type: 'folder' as string,
                    status: 'approved' as const,
                    lastEdit: sf.modifiedAt,
                    collaborators: [],
                    starred: false,
                    size: `${itemCount.files + itemCount.folders + importedCount} éléments`,
                    visibility: 'team',
                    owner: '',
                    isTemplate: false,
                    isFolder: true,
                    folderData: sf,
                    color: sf.color,
                };
            });

            // Afficher dossiers en premier, puis fichiers
            return [...folderItems, ...fileDocuments];
        }

        // Fallback to legacy documents for other categories
        return generateContextualDocuments(resolvedCategory, isBackoffice);
    }, [resolvedCategory, isBackoffice, selectedFolder, folders, getSubfolders, importedFiles]);

    const filteredDocuments = documents.filter(doc => {
        if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
        if (starredOnly && !doc.starred) return false;
        if (searchQuery) {
            return doc.title.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const getDocIcon = (type: string) => {
        const typeConfig = DOCUMENT_TYPES[type as keyof typeof DOCUMENT_TYPES] || DOCUMENT_TYPES.other;
        const Icon = typeConfig.icon;
        return <Icon className={cn('h-5 w-5', typeConfig.color)} />;
    };

    const getStatusBadge = (status: string) => {
        const statusConf = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
        return (
            <Badge variant="secondary" className={cn('text-xs', statusConf.color)}>
                {statusConf.label}
            </Badge>
        );
    };

    const renderDocumentActions = (doc: any, isTrash: boolean) => (
        <DropdownMenuContent align="end">
            {isTrash ? (
                <>
                    <DropdownMenuItem>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restaurer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer définitivement
                    </DropdownMenuItem>
                </>
            ) : (
                <>
                    <DropdownMenuItem onClick={() => {
                        toast({
                            title: "Modifier le document",
                            description: `Ouverture de "${doc.title}" en mode édition...`,
                        });
                    }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        toast({
                            title: "Partager",
                            description: `Options de partage pour "${doc.title}"`,
                        });
                    }}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        toast({
                            title: "Téléchargement",
                            description: `Téléchargement de "${doc.title}" en cours...`,
                        });
                    }}>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        toast({
                            title: "Document dupliqué",
                            description: `Une copie de "${doc.title}" a été créée.`,
                        });
                    }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Dupliquer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                        toast({
                            title: "Signature électronique",
                            description: `"${doc.title}" envoyé pour signature via iSignature.`,
                        });
                    }}>
                        <PenTool className="h-4 w-4 mr-2" />
                        Envoyer à signature
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        toast({
                            title: "Archivage",
                            description: `"${doc.title}" archivé dans iArchive.`,
                        });
                    }}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archiver
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500" onClick={() => {
                        // Call moveToTrash for imported files
                        if ((doc as any).isImported) {
                            moveToTrash(doc.id);
                        } else {
                            toast({
                                title: "Document supprimé",
                                description: `"${doc.title}" a été déplacé vers la corbeille.`,
                                variant: "destructive",
                            });
                        }
                    }}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                    </DropdownMenuItem>
                </>
            )}
        </DropdownMenuContent>
    );

    // Handler for clicking on a folder item
    const handleFolderClick = (doc: any) => {
        if (doc.isFolder && doc.folderData) {
            setSelectedFolder(doc.folderData);
        }
    };

    // Handler for clicking on a document (opens preview)
    const handleDocumentClick = async (doc: any) => {
        if (doc.isFolder) {
            handleFolderClick(doc);
        } else {
            // Find the corresponding imported file if available
            const importedFile = importedFiles.find((f: ImportedFile) => f.id === doc.id);

            // Load file content from IndexedDB
            let dataUrl: string | undefined;
            let mimeType: string | undefined = importedFile?.mimeType;

            if (importedFile) {
                const storedContent = await getFileContent(doc.id);
                if (storedContent) {
                    dataUrl = storedContent.dataUrl;
                    mimeType = storedContent.mimeType;
                }
            }

            setPreviewDocument({
                id: doc.id,
                title: doc.title,
                type: doc.type,
                size: doc.size,
                dataUrl,
                mimeType,
            });
        }
    };

    return (
        <>
            <div className="space-y-4">
                {/* Breadcrumb Navigation - macOS Finder style */}
                {resolvedCategory === 'my' && selectedFolder && (
                    <nav className="flex items-center gap-0.5 text-sm bg-muted/30 rounded-lg px-2 py-1.5 border border-border/40">
                        {/* Always show root/home */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-7 px-2 gap-1.5 rounded-md",
                                selectedFolder.id === 'root' || breadcrumb.length === 0
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                            onClick={() => {
                                const rootFolder = folders.find(f => f.id === 'root');
                                if (rootFolder) setSelectedFolder(rootFolder);
                            }}
                        >
                            <Home className="h-3.5 w-3.5" />
                            <span>Mes Dossiers</span>
                        </Button>

                        {/* Breadcrumb segments */}
                        {breadcrumb.filter(f => f.id !== 'root').map((folder, index, arr) => (
                            <React.Fragment key={folder.id}>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-0.5" />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-7 px-2 gap-1.5 rounded-md max-w-[180px]",
                                        index === arr.length - 1
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    )}
                                    onClick={() => setSelectedFolder(folder)}
                                >
                                    {folder.icon && <span className="text-sm">{folder.icon}</span>}
                                    <span className="truncate">{folder.name}</span>
                                </Button>
                            </React.Fragment>
                        ))}
                    </nav>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg', config.color.split(' ')[1])}>
                            <CategoryIcon className={cn('h-5 w-5', config.color.split(' ')[0])} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">
                                {isBackoffice && resolvedCategory === 'my' && selectedFolder
                                    ? selectedFolder.name
                                    : config.title}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {filteredDocuments.length} élément{filteredDocuments.length !== 1 ? 's' : ''}
                                {isBackoffice && selectedFolder && selectedFolder.id !== 'root'
                                    ? ''
                                    : ''}
                            </p>
                        </div>
                    </div>
                    {resolvedCategory !== 'trash' && resolvedCategory !== 'shared' && (
                        <div className="flex gap-2">
                            {resolvedCategory === 'my' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={openCreateFolderDialog}
                                >
                                    <FolderPlus className="h-4 w-4 mr-2" />
                                    Dossier
                                </Button>
                            )}
                            <Button className="bg-blue-500 hover:bg-blue-600" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                {resolvedCategory === 'templates' ? 'Nouveau modèle' : 'Importer'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-3 items-center">
                    {/* View Toggle + Arborescence */}
                    <div className="flex border rounded-lg overflow-hidden bg-background">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="icon"
                            className={cn('h-9 w-9 rounded-none', viewMode === 'grid' && 'bg-primary')}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="icon"
                            className={cn('h-9 w-9 rounded-none', viewMode === 'list' && 'bg-primary')}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        {/* Arborescence button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none border-l"
                            onClick={toggleFolders}
                            title="Afficher l'arborescence"
                        >
                            <FolderTree className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                                <SelectItem key={key} value={key}>{val.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant={starredOnly ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setStarredOnly(!starredOnly)}
                        className={starredOnly ? 'bg-amber-500 hover:bg-amber-600' : ''}
                    >
                        <Star className={cn('h-4 w-4', starredOnly && 'fill-current')} />
                    </Button>
                </div>

                {/* Documents Grid / List */}
                <AnimatePresence mode="wait">
                    {viewMode === 'grid' ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        >
                            {filteredDocuments.map((doc, i) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    {/* Folder Card - Distinct macOS-style design */}
                                    {(doc as any).isFolder ? (
                                        <Card
                                            className="group cursor-pointer transition-all h-full border-2 border-transparent hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
                                            onClick={() => handleFolderClick(doc)}
                                            onDoubleClick={() => handleFolderClick(doc)}
                                        >
                                            <CardContent className="p-4 flex flex-col h-full">
                                                {/* Folder Icon - Large and prominent */}
                                                <div className="flex items-center justify-center py-4">
                                                    <div className="relative">
                                                        {/* Folder base with custom color */}
                                                        <div className={cn(
                                                            "w-16 h-14 rounded-lg relative",
                                                            (doc as any).color ? `bg-${(doc as any).color}-500` : 'bg-yellow-500'
                                                        )} style={{
                                                            background: `linear-gradient(145deg, 
                                                            ${(doc as any).color === 'blue' ? '#3b82f6' :
                                                                    (doc as any).color === 'emerald' ? '#10b981' :
                                                                        (doc as any).color === 'orange' ? '#f97316' :
                                                                            (doc as any).color === 'purple' ? '#8b5cf6' :
                                                                                (doc as any).color === 'pink' ? '#ec4899' :
                                                                                    (doc as any).color === 'red' ? '#ef4444' :
                                                                                        (doc as any).color === 'cyan' ? '#06b6d4' :
                                                                                            '#eab308'} 0%, 
                                                            ${(doc as any).color === 'blue' ? '#2563eb' :
                                                                    (doc as any).color === 'emerald' ? '#059669' :
                                                                        (doc as any).color === 'orange' ? '#ea580c' :
                                                                            (doc as any).color === 'purple' ? '#7c3aed' :
                                                                                (doc as any).color === 'pink' ? '#db2777' :
                                                                                    (doc as any).color === 'red' ? '#dc2626' :
                                                                                        (doc as any).color === 'cyan' ? '#0891b2' :
                                                                                            '#ca8a04'} 100%)`
                                                        }}>
                                                            {/* Folder tab */}
                                                            <div className="absolute -top-2 left-2 w-6 h-3 rounded-t-md" style={{
                                                                background: 'inherit',
                                                                filter: 'brightness(1.1)'
                                                            }} />
                                                            {/* Paper stack effect */}
                                                            <div className="absolute inset-x-2 top-2 bottom-1 bg-white/90 rounded-sm" />
                                                        </div>
                                                        {/* Emoji overlay if available */}
                                                        {(doc as any).folderData?.icon && (
                                                            <div className="absolute -bottom-1 -right-1 text-xl bg-background rounded-full w-7 h-7 flex items-center justify-center shadow-sm border">
                                                                {(doc as any).folderData.icon}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Folder Name */}
                                                <h3 className="font-medium text-sm text-center line-clamp-2 mb-2">{doc.title}</h3>

                                                {/* Item count */}
                                                <p className="text-xs text-muted-foreground text-center">
                                                    {doc.size}
                                                </p>

                                                {/* Hover action hint */}
                                                <div className="mt-auto pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Badge variant="secondary" className="w-full justify-center text-xs py-1">
                                                        <FolderOpen className="h-3 w-3 mr-1.5" />
                                                        Ouvrir
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        /* Document Card - A4 miniature design */
                                        <A4DocumentCard
                                            document={{
                                                id: doc.id,
                                                title: doc.title,
                                                type: doc.type,
                                                status: doc.status,
                                                lastEdit: doc.lastEdit,
                                                starred: doc.starred,
                                                isImported: (doc as any).isImported,
                                                mimeType: (doc as any).mimeType,
                                            }}
                                            onDocumentClick={handleDocumentClick}
                                            onDelete={(docId) => {
                                                if ((doc as any).isImported) {
                                                    moveToTrash(docId);
                                                }
                                            }}
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : ( // List View
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-2"
                        >
                            {filteredDocuments.map((doc, i) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className={cn(
                                        "flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer group",
                                        (doc as any).isFolder
                                            ? "hover:border-blue-500/50 hover:bg-blue-500/5"
                                            : "hover:border-primary/30"
                                    )}
                                    onClick={() => (doc as any).isFolder && handleFolderClick(doc)}
                                >
                                    {/* Icon - Different for folders vs files */}
                                    {(doc as any).isFolder ? (
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <div className="w-10 h-9 rounded relative" style={{
                                                    background: `linear-gradient(145deg, 
                                                    ${(doc as any).color === 'blue' ? '#3b82f6' :
                                                            (doc as any).color === 'emerald' ? '#10b981' :
                                                                (doc as any).color === 'orange' ? '#f97316' :
                                                                    (doc as any).color === 'purple' ? '#8b5cf6' :
                                                                        (doc as any).color === 'pink' ? '#ec4899' :
                                                                            '#eab308'} 0%, 
                                                    ${(doc as any).color === 'blue' ? '#2563eb' :
                                                            (doc as any).color === 'emerald' ? '#059669' :
                                                                (doc as any).color === 'orange' ? '#ea580c' :
                                                                    (doc as any).color === 'purple' ? '#7c3aed' :
                                                                        (doc as any).color === 'pink' ? '#db2777' :
                                                                            '#ca8a04'} 100%)`
                                                }}>
                                                    {/* Folder tab */}
                                                    <div className="absolute -top-1.5 left-1 w-4 h-2 rounded-t-sm" style={{
                                                        background: 'inherit',
                                                        filter: 'brightness(1.1)'
                                                    }} />
                                                    {/* Paper effect */}
                                                    <div className="absolute inset-x-1.5 top-1.5 bottom-0.5 bg-white/90 rounded-sm" />
                                                </div>
                                            </div>
                                            {(doc as any).folderData?.icon && (
                                                <span className="text-lg">{(doc as any).folderData.icon}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={cn('p-2 rounded-lg',
                                            DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES]?.color.replace('text-', 'bg-') + '/10'
                                        )}>
                                            {getDocIcon(doc.type)}
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{doc.title}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            {(doc as any).isFolder ? (
                                                <span className="flex items-center gap-1">
                                                    <FolderOpen className="h-3 w-3" />
                                                    {doc.size}
                                                </span>
                                            ) : (
                                                <>
                                                    <Clock className="h-3 w-3" />
                                                    {doc.lastEdit}
                                                </>
                                            )}
                                            {config.showOwner && (doc as any).owner && (
                                                <>
                                                    <span>•</span>
                                                    <span>{(doc as any).owner}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {/* Status badge - only for files */}
                                    {!(doc as any).isFolder && getStatusBadge(doc.status)}

                                    {/* Folder: Show chevron, File: Show collaborators */}
                                    {(doc as any).isFolder ? (
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                                    ) : (
                                        <>
                                            {config.showSharedWith && doc.collaborators?.length > 0 && (
                                                <div className="flex -space-x-2">
                                                    {doc.collaborators.slice(0, 3).map((c: string, idx: number) => (
                                                        <div
                                                            key={idx}
                                                            className="w-7 h-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium"
                                                        >
                                                            {c}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {doc.starred ? (
                                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                                ) : (
                                                    <StarOff className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                {renderDocumentActions(doc, resolvedCategory === 'trash')}
                                            </DropdownMenu>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {filteredDocuments.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-medium mb-2">
                            {selectedFolder && selectedFolder.id !== 'root'
                                ? 'Ce dossier est vide'
                                : 'Aucun document'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">{config.emptyMessage}</p>
                        {resolvedCategory === 'my' && (
                            <div className="flex flex-col items-center gap-2">
                                {/* Primary action: Import files */}
                                <Button
                                    className="bg-blue-500 hover:bg-blue-600"
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.multiple = true;
                                        input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp';
                                        input.onchange = (e) => {
                                            const files = (e.target as HTMLInputElement).files;
                                            if (files && files.length > 0 && selectedFolder) {
                                                importFiles(Array.from(files), selectedFolder.id);
                                            }
                                        };
                                        input.click();
                                    }}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Importer des fichiers
                                </Button>
                                {/* Secondary action: Create subfolder */}
                                <button
                                    onClick={openCreateFolderDialog}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    ou <span className="underline">créer un sous-dossier</span>
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </div >

            {/* Document Preview Dialog */}
            < DocumentPreviewDialog
                open={!!previewDocument
                }
                onOpenChange={(open) => !open && setPreviewDocument(null)}
                document={previewDocument}
            />
        </>
    );
}
