/**
 * DocumentCategoryPage - Dynamic iDocument category page
 * Adapts content based on route (my, shared, team, templates, trash)
 */

import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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
    Box, // Added for 3D view
    Plus,
    FileSpreadsheet,
    FileImage,
    FilePen,
    Presentation,
    File,
    Lock,
    Globe,
    UserCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookFolder3D } from '@/components/ui/BookFolder3D'; // Import new 3D component
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
        title: 'Mes Documents',
        description: 'Documents personnels et brouillons',
        icon: FileText,
        color: 'text-blue-500 bg-blue-500/10',
        emptyMessage: 'Créez votre premier document pour commencer',
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
    document: { icon: FileText, color: 'text-blue-500' },
    spreadsheet: { icon: FileSpreadsheet, color: 'text-green-500' },
    presentation: { icon: Presentation, color: 'text-orange-500' },
    image: { icon: FileImage, color: 'text-purple-500' },
    contract: { icon: FilePen, color: 'text-amber-500' },
    other: { icon: File, color: 'text-gray-500' },
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

// Mock data generator
const generateMockDocuments = (category: string) => {
    const docs = [];
    const now = Date.now();

    const templates = {
        my: [
            { title: 'Contrat Auto - Client Moussavou', type: 'contract', status: 'review' },
            { title: 'Police MRH - Villa Libreville N°4521', type: 'contract', status: 'approved' },
            { title: 'Attestation RC Pro - SARL Ndong', type: 'document', status: 'published' },
            { title: 'Proposition Flotte - Société ABC', type: 'document', status: 'draft' },
            { title: 'Déclaration Sinistre #2026-147', type: 'document', status: 'review' },
            { title: 'Avenant N°3 - Contrat 845621', type: 'contract', status: 'draft' },
        ],
        shared: [
            { title: 'Barème Indemnisation 2026', type: 'spreadsheet', status: 'published', owner: 'Direction' },
            { title: 'Procédure Expertise Auto', type: 'document', status: 'review', owner: 'Sinistres' },
            { title: 'Tableau Tarification MRH', type: 'spreadsheet', status: 'published', owner: 'Commercial' },
            { title: 'Modèle Attestation Assurance', type: 'document', status: 'approved', owner: 'Juridique' },
        ],
        team: [
            { title: 'Conditions Générales Auto v4.2', type: 'document', status: 'published', owner: 'Juridique' },
            { title: 'Manuel Gestion Sinistres', type: 'document', status: 'approved', owner: 'Formation' },
            { title: 'Planning Commerciaux Q1 2026', type: 'spreadsheet', status: 'published', owner: 'Direction' },
            { title: 'Grille Commissions Agents', type: 'spreadsheet', status: 'draft', owner: 'RH' },
            { title: 'Rapport Sinistralité Janvier', type: 'spreadsheet', status: 'review', owner: 'Actuariat' },
        ],
        templates: [
            { title: 'Modèle Contrat Auto Tiers', type: 'contract', status: 'published', owner: 'Juridique', isTemplate: true },
            { title: 'Modèle Police MRH Standard', type: 'contract', status: 'published', owner: 'Juridique', isTemplate: true },
            { title: 'Modèle Déclaration Sinistre', type: 'document', status: 'published', owner: 'Sinistres', isTemplate: true },
            { title: 'Modèle Attestation Assurance', type: 'document', status: 'published', owner: 'Juridique', isTemplate: true },
            { title: 'Modèle Lettre Résiliation', type: 'document', status: 'published', owner: 'Juridique', isTemplate: true },
        ],
        trash: [
            { title: 'Ancien Barème 2024', type: 'spreadsheet', status: 'deleted', deletedAt: now - 2 * 24 * 60 * 60 * 1000 },
            { title: 'Brouillon Police Annulée', type: 'contract', status: 'deleted', deletedAt: now - 5 * 24 * 60 * 60 * 1000 },
            { title: 'Test Modèle v1', type: 'document', status: 'deleted', deletedAt: now - 10 * 24 * 60 * 60 * 1000 },
        ],
    };

    const categoryDocs = templates[category as keyof typeof templates] || templates.my;

    return categoryDocs.map((doc, i) => ({
        id: `${category}-${i}`,
        ...doc,
        lastEdit: formatRelativeTime(now - Math.random() * 7 * 24 * 60 * 60 * 1000),
        collaborators: generateCollaborators(category),
        starred: Math.random() > 0.7,
        size: `${Math.floor(Math.random() * 2000 + 100)} KB`,
        visibility: Math.random() > 0.5 ? 'private' : 'shared',
    }));
};

const generateCollaborators = (category: string) => {
    const names = ['M', 'J', 'P', 'S', 'C', 'R', 'V'];
    const count = category === 'my' ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 1;
    return names.slice(0, count);
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
    // Local view mode state - fully managed by this component
    const [viewMode, setViewMode] = useState<'grid' | 'list' | '3d'>('grid');

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [starredOnly, setStarredOnly] = useState(false);

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

    // Generate and filter documents
    const documents = useMemo(() => generateMockDocuments(resolvedCategory), [resolvedCategory]);

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
                    <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Dupliquer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <PenTool className="h-4 w-4 mr-2" />
                        Envoyer à signature
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archiver
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                    </DropdownMenuItem>
                </>
            )}
        </DropdownMenuContent>
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', config.color.split(' ')[1])}>
                        <CategoryIcon className={cn('h-5 w-5', config.color.split(' ')[0])} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">{config.title}</h2>
                        <p className="text-sm text-muted-foreground">
                            {filteredDocuments.length} documents • {config.description}
                        </p>
                    </div>
                </div>
                {resolvedCategory !== 'trash' && resolvedCategory !== 'shared' && (
                    <Button className="bg-blue-500 hover:bg-blue-600">
                        <Plus className="h-4 w-4 mr-2" />
                        {resolvedCategory === 'templates' ? 'Nouveau modèle' : 'Nouveau document'}
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-3 items-center">
                {/* View Toggle */}
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
                    <Button
                        variant={viewMode === '3d' ? 'default' : 'ghost'}
                        size="icon"
                        className={cn('h-9 w-9 rounded-none', viewMode === '3d' && 'bg-primary')}
                        onClick={() => setViewMode('3d')}
                    >
                        <Box className="h-4 w-4" />
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

            {/* Documents Grid / List / 3D */}
            <AnimatePresence mode="wait">
                {viewMode === '3d' ? (
                    <motion.div
                        key="3d"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 px-4 py-8">
                            {filteredDocuments.map((doc, i) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <BookFolder3D
                                        title={doc.title}
                                        documentCount={Math.floor(Math.random() * 10) + 1} // Mock count
                                        color={DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES]?.color.replace('text-', '#').replace('-500', '') || '#3B82F6'} // Map color
                                        hasContent={doc.status !== 'draft'} // Mock content based on status
                                        isStarred={doc.starred}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : viewMode === 'grid' ? (
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
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="group cursor-pointer hover:border-blue-500/50 transition-all h-full">
                                    <CardContent className="p-4 flex flex-col h-full">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={cn('p-2 rounded-lg',
                                                DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES]?.color.replace('text-', 'bg-') + '/10'
                                            )}>
                                                {getDocIcon(doc.type)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
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
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    {renderDocumentActions(doc, resolvedCategory === 'trash')}
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-medium text-sm mb-2 line-clamp-2 flex-1">{doc.title}</h3>

                                        {/* Owner (for shared/team) */}
                                        {config.showOwner && (doc as any).owner && (
                                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                                <UserCheck className="h-3 w-3" />
                                                {(doc as any).owner}
                                            </p>
                                        )}

                                        {/* Status */}
                                        {getStatusBadge(doc.status)}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {doc.lastEdit}
                                            </span>
                                            {config.showSharedWith && doc.collaborators?.length > 0 && (
                                                <div className="flex -space-x-2">
                                                    {doc.collaborators.slice(0, 3).map((c: string, idx: number) => (
                                                        <div
                                                            key={idx}
                                                            className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium"
                                                        >
                                                            {c}
                                                        </div>
                                                    ))}
                                                    {doc.collaborators.length > 3 && (
                                                        <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                                                            +{doc.collaborators.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
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
                                transition={{ delay: i * 0.03 }}
                                className="flex items-center gap-4 p-4 rounded-lg border hover:border-blue-500/50 transition-all cursor-pointer group"
                            >
                                <div className={cn('p-2 rounded-lg',
                                    DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES]?.color.replace('text-', 'bg-') + '/10'
                                )}>
                                    {getDocIcon(doc.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate">{doc.title}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        {doc.lastEdit}
                                        {config.showOwner && (doc as any).owner && (
                                            <>
                                                <span>•</span>
                                                <span>{(doc as any).owner}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                                {getStatusBadge(doc.status)}
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
                    <h3 className="font-medium mb-2">Aucun document</h3>
                    <p className="text-sm text-muted-foreground">{config.emptyMessage}</p>
                    {resolvedCategory === 'my' && (
                        <Button className="mt-4 bg-blue-500 hover:bg-blue-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Créer un document
                        </Button>
                    )}
                </motion.div>
            )}
        </div>
    );
}
