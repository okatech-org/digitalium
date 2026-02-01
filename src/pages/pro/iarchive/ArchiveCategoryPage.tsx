/**
 * ArchiveCategoryPage - Card-based archive display (aligned with iDocument)
 * Grid/List view layout with folder navigation support
 */

import React, { useState, useMemo } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    CheckCircle2,
    Shield,
    Clock,
    Download,
    Eye,
    MoreVertical,
    Search,
    Filter,
    Users,
    Briefcase,
    Scale,
    Lock,
    Award,
    AlertTriangle,
    Building2,
    List,
    Grid,
    ChevronRight,
    FolderTree,
    Folder,
    Home,
    Hash,
    Sparkles,
    FolderOpen,
    Star,
    StarOff,
    Upload,
    Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSpaceFromUrl } from '@/contexts/SpaceContext';
import { digitaliumArchives, digitaliumArchiveFolders, ArchiveCategory } from '@/data/digitaliumMockData';
import { IArchiveOutletContext } from './IArchiveLayout';
import { getArchivedFilesFromStorage } from '@/services/documentFilesService';

// Category configuration
interface CategoryConfig {
    key: string;
    title: string;
    description: string;
    retentionYears: number | 'permanent';
    icon: typeof FileText;
    color: string;
    documentTypes: string[];
    legalBasis: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
    fiscal: {
        key: 'fiscal',
        title: 'Archive Fiscale',
        description: 'Factures, déclarations TVA, bilans comptables',
        retentionYears: 10,
        icon: Briefcase,
        color: 'text-emerald-500 bg-emerald-500/10',
        documentTypes: ['Facture', 'Déclaration', 'Bilan', 'Justificatif', 'Relevé'],
        legalBasis: 'Code du Commerce - Art. L123-22',
    },
    social: {
        key: 'social',
        title: 'Archive Sociale',
        description: 'Contrats de travail, bulletins de paie, déclarations sociales',
        retentionYears: 5,
        icon: Users,
        color: 'text-blue-500 bg-blue-500/10',
        documentTypes: ['Contrat', 'Bulletin de paie', 'DSN', 'DPAE', 'Attestation'],
        legalBasis: 'Code du Travail - Art. D3243-4',
    },
    legal: {
        key: 'legal',
        title: 'Archive Juridique',
        description: 'Statuts, PV, contrats commerciaux, actes juridiques',
        retentionYears: 30,
        icon: Scale,
        color: 'text-purple-500 bg-purple-500/10',
        documentTypes: ['Statuts', 'PV Assemblée', 'Contrat', 'Acte notarié', 'Décision'],
        legalBasis: 'Code Civil - Art. 2224',
    },
    clients: {
        key: 'clients',
        title: 'Archive Clients',
        description: 'Contrats clients, factures émises, correspondances',
        retentionYears: 10,
        icon: Building2,
        color: 'text-orange-500 bg-orange-500/10',
        documentTypes: ['Contrat client', 'Facture', 'Devis', 'Avenant', 'Correspondance'],
        legalBasis: 'Code du Commerce - Art. L123-22',
    },
    vault: {
        key: 'vault',
        title: 'Coffre-fort',
        description: 'Documents sensibles, secrets commerciaux, clés de chiffrement',
        retentionYears: 'permanent',
        icon: Lock,
        color: 'text-red-500 bg-red-500/10',
        documentTypes: ['Secret', 'Clé', 'Certificat', 'Credentials', 'Backup'],
        legalBasis: 'Conservation permanente',
    },
    certificates: {
        key: 'certificates',
        title: 'Certificats',
        description: 'Certificats SSL, signatures électroniques, attestations',
        retentionYears: 'permanent',
        icon: Award,
        color: 'text-amber-500 bg-amber-500/10',
        documentTypes: ['Certificat SSL', 'Signature électronique', 'Attestation', 'Label'],
        legalBasis: 'Règlement eIDAS',
    },
};

// Quick filter chips
const QUICK_FILTERS = [
    { id: 'today', label: "Aujourd'hui", icon: Sparkles },
    { id: 'unverified', label: 'Non vérifiés', icon: AlertTriangle },
    { id: 'expiring', label: 'Expirant bientôt', icon: Clock },
];

// Generate contextual archives (SubAdmin = Digitalium data, Pro = empty)
const generateContextualArchives = (category: string, isBackoffice: boolean) => {
    if (!isBackoffice) return [];

    return digitaliumArchives
        .filter(a => a.category === category)
        .map(a => ({
            id: a.id,
            title: a.title,
            type: 'archive',
            reference: a.id.toUpperCase(),
            archivedAt: a.archivedDate,
            retentionEnd: a.retentionYears >= 99 ? 'Permanent' : a.expirationDate,
            verified: a.certified,
            hash: a.hash || `SHA256:${a.id.slice(-8)}...`,
            size: a.size,
            starred: false,
            folderId: a.folderId,
        }));
};

export default function ArchiveCategoryPage() {
    const location = useLocation();
    const { isBackoffice } = useSpaceFromUrl();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [quickFilter, setQuickFilter] = useState<string | null>(null);

    // Get folder context from IArchiveLayout
    const outletContext = useOutletContext<IArchiveOutletContext | undefined>();
    const selectedFolder = outletContext?.selectedFolder;
    const toggleFolders = outletContext?.toggleFolders;

    // Determine category from URL path
    const pathParts = location.pathname.split('/');
    const categoryKey = pathParts[pathParts.length - 1] || 'fiscal';

    const categoryMap: Record<string, string> = {
        'fiscal': 'fiscal',
        'social': 'social',
        'legal': 'legal',
        'juridique': 'legal',
        'clients': 'clients',
        'vault': 'vault',
        'coffre-fort': 'vault',
        'certificates': 'certificates',
        'certificats': 'certificates',
        'iarchive': 'fiscal',
    };

    const resolvedCategory = categoryMap[categoryKey] || 'fiscal';
    const config = CATEGORY_CONFIG[resolvedCategory];
    const CategoryIcon = config.icon;

    // Generate documents with folder filtering
    const documents = useMemo(() => {
        const allDocs = generateContextualArchives(resolvedCategory, isBackoffice);

        // Add imported archived files from iDocument
        const importedArchived = getArchivedFilesFromStorage().map(f => ({
            id: f.id,
            title: f.name,
            type: 'archive',
            reference: `ARCH-${f.id.slice(0, 8).toUpperCase()}`,
            archivedAt: f.modifiedAt || new Date().toISOString().split('T')[0],
            retentionEnd: 'Permanent',
            verified: true,
            hash: `SHA256:${f.id.slice(-8)}...`,
            size: f.size,
            starred: false,
            folderId: 'archive',
            isImported: true,
            mimeType: f.mimeType,
        }));

        const combined = [...importedArchived, ...allDocs];

        if (selectedFolder) {
            return combined.filter(doc => doc.folderId === selectedFolder.id);
        }

        return combined;
    }, [resolvedCategory, isBackoffice, selectedFolder]);

    // Document counts
    const documentCounts: Record<string, number> = useMemo(() => {
        if (!isBackoffice) return {};
        return {
            fiscal: digitaliumArchives.filter(a => a.category === 'fiscal').length,
            social: digitaliumArchives.filter(a => a.category === 'social').length,
            legal: digitaliumArchives.filter(a => a.category === 'legal').length,
            clients: digitaliumArchives.filter(a => a.category === 'clients').length,
            vault: digitaliumArchives.filter(a => a.category === 'vault').length,
            certificates: digitaliumArchives.filter(a => a.category === 'certificates').length,
        };
    }, [isBackoffice]);

    // Filter documents
    const filteredDocuments = documents.filter(doc => {
        if (quickFilter === 'unverified' && doc.verified) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return doc.title.toLowerCase().includes(q) ||
                doc.reference.toLowerCase().includes(q);
        }
        return true;
    });

    // Stats
    const verifiedCount = documents.filter(d => d.verified).length;
    const complianceRate = documents.length > 0 ? Math.round((verifiedCount / documents.length) * 100) : 100;

    const renderDocumentActions = (doc: any) => (
        <DropdownMenuContent align="end">
            <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                Voir
            </DropdownMenuItem>
            <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
                <Shield className="h-4 w-4 mr-2" />
                Vérifier l'intégrité
            </DropdownMenuItem>
            <DropdownMenuItem>
                <Award className="h-4 w-4 mr-2" />
                Générer certificat
            </DropdownMenuItem>
        </DropdownMenuContent>
    );

    return (
        <div className="space-y-4">
            {/* Breadcrumb Navigation - macOS Finder style (matching iDocument) */}
            {selectedFolder && isBackoffice && (
                <nav className="flex items-center gap-0.5 text-sm bg-muted/30 rounded-lg px-2 py-1.5 border border-border/40">
                    {/* Root/Home button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-7 px-2 gap-1.5 rounded-md",
                            !selectedFolder
                                ? "bg-emerald-500/10 text-emerald-600 font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                        onClick={() => outletContext?.setSelectedFolder(null as any)}
                    >
                        <Home className="h-3.5 w-3.5" />
                        <span>Archives</span>
                    </Button>

                    {/* Selected folder */}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-0.5" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 gap-1.5 rounded-md bg-emerald-500/10 text-emerald-600 font-medium max-w-[180px]"
                        disabled
                    >
                        <Folder className="h-3.5 w-3.5" />
                        <span className="truncate">{selectedFolder.name}</span>
                    </Button>

                    {/* Item count badge */}
                    <Badge variant="secondary" className="text-[10px] ml-2 bg-emerald-500/10 text-emerald-600">
                        {documents.length} archive{documents.length !== 1 ? 's' : ''}
                    </Badge>
                </nav>
            )}

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', config.color.split(' ')[1])}>
                        <CategoryIcon className={cn('h-5 w-5', config.color.split(' ')[0])} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold">{config.title}</h2>
                            <Badge variant="secondary" className="text-xs">
                                {documentCounts[resolvedCategory]?.toLocaleString() || 0} docs
                            </Badge>
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {config.retentionYears === 'permanent' ? '∞' : `${config.retentionYears} ans`}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            <Scale className="h-3 w-3 inline mr-1" />
                            {config.legalBasis}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    <Badge variant="secondary" className={cn(
                        'h-8 px-2',
                        complianceRate === 100
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                    )}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {complianceRate}%
                    </Badge>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex gap-3 items-center flex-wrap">
                {/* View Toggle + Arborescence */}
                <div className="flex border rounded-lg overflow-hidden bg-background">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="icon"
                        className={cn('h-9 w-9 rounded-none', viewMode === 'grid' && 'bg-emerald-500 hover:bg-emerald-600')}
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="icon"
                        className={cn('h-9 w-9 rounded-none', viewMode === 'list' && 'bg-emerald-500 hover:bg-emerald-600')}
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

                {/* Quick Filter Chips */}
                <div className="flex gap-1">
                    {QUICK_FILTERS.map(f => (
                        <Button
                            key={f.id}
                            variant={quickFilter === f.id ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                                'h-8 text-xs',
                                quickFilter === f.id && 'bg-emerald-500 hover:bg-emerald-600'
                            )}
                            onClick={() => setQuickFilter(quickFilter === f.id ? null : f.id)}
                        >
                            <f.icon className="h-3 w-3 mr-1" />
                            {f.label}
                        </Button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
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
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="group cursor-pointer hover:border-emerald-500/50 transition-all h-full">
                                    <CardContent className="p-4 flex flex-col h-full">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={cn('p-2 rounded-lg bg-emerald-500/10')}>
                                                <FileText className="h-5 w-5 text-emerald-500" />
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
                                                    {renderDocumentActions(doc)}
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-medium text-sm mb-2 line-clamp-2 flex-1">{doc.title}</h3>

                                        {/* Reference */}
                                        <p className="text-xs text-muted-foreground mb-2 font-mono">
                                            {doc.reference}
                                        </p>

                                        {/* Status */}
                                        {doc.verified ? (
                                            <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-xs w-fit">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Vérifié
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 text-xs w-fit">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                En attente
                                            </Badge>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {doc.archivedAt}
                                            </span>
                                            <span>{doc.size}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    // List View
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
                                className="flex items-center gap-4 p-4 rounded-lg border hover:border-emerald-500/50 transition-all cursor-pointer group"
                            >
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <FileText className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate">{doc.title}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        {doc.archivedAt}
                                        <span>•</span>
                                        <span className="font-mono text-xs">{doc.reference}</span>
                                        <span>•</span>
                                        <span>{doc.size}</span>
                                    </p>
                                </div>
                                {doc.verified ? (
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-xs">
                                        <Shield className="h-3 w-3 mr-1" />
                                        Vérifié
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 text-xs">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Attente
                                    </Badge>
                                )}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                <Hash className="h-3 w-3 inline mr-1" />
                                                {doc.hash.slice(0, 16)}...
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-mono text-xs">{doc.hash}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
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
                                    {renderDocumentActions(doc)}
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
                    <h3 className="font-medium mb-2">
                        {selectedFolder
                            ? 'Ce dossier est vide'
                            : 'Aucune archive'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {selectedFolder
                            ? `Aucune archive dans "${selectedFolder.name}"`
                            : 'Aucune archive trouvée dans cette catégorie'
                        }
                    </p>
                    <div className="flex flex-col items-center gap-2">
                        {/* Primary action: Import files */}
                        <Button
                            className="bg-emerald-500 hover:bg-emerald-600"
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = true;
                                input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp';
                                input.click();
                            }}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Archiver des fichiers
                        </Button>
                        {/* Secondary action: Create subfolder */}
                        <button
                            onClick={() => {
                                // Would trigger create folder dialog
                            }}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            ou <span className="underline">créer un dossier</span>
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Pagination */}
            {filteredDocuments.length > 0 && (
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>
                        {filteredDocuments.length} sur {documentCounts[resolvedCategory]?.toLocaleString() || 0}
                    </span>
                    <Button variant="outline" size="sm">
                        Voir plus
                    </Button>
                </div>
            )}
        </div>
    );
}
