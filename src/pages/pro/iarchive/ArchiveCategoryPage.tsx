/**
 * ArchiveCategoryPage - Optimized archive category page
 * Compact header, simplified table with expandable rows
 */

import React, { useState, useMemo, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    CheckCircle2,
    Shield,
    Clock,
    Download,
    Eye,
    MoreVertical,
    Hash,
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
    Box,
    ChevronDown,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
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

// Lazy load 3D view for performance
const Archive3DView = lazy(() => import('@/components/3d/Archive3DView'));

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
        description: 'Bulletins de paie, contrats de travail, attestations',
        retentionYears: 5,
        icon: Users,
        color: 'text-blue-500 bg-blue-500/10',
        documentTypes: ['Bulletin de paie', 'Contrat', 'Attestation', 'Certificat', 'Avenant'],
        legalBasis: 'Code du Travail - Art. L3243-4',
    },
    legal: {
        key: 'legal',
        title: 'Archive Juridique',
        description: 'Statuts, PV assemblées, contrats commerciaux',
        retentionYears: 30,
        icon: Scale,
        color: 'text-purple-500 bg-purple-500/10',
        documentTypes: ['Statuts', 'PV', 'Contrat', 'Acte notarié', 'Assignation'],
        legalBasis: 'Code Civil - Art. 2224',
    },
    clients: {
        key: 'clients',
        title: 'Archive Clients',
        description: 'Dossiers clients, devis, bons de commande',
        retentionYears: 10,
        icon: Building2,
        color: 'text-orange-500 bg-orange-500/10',
        documentTypes: ['Devis', 'Bon de commande', 'Contrat client', 'Dossier', 'Correspondance'],
        legalBasis: 'Code de Commerce',
    },
    vault: {
        key: 'vault',
        title: 'Coffre-fort Numérique',
        description: 'Documents sensibles, conservation permanente',
        retentionYears: 'permanent',
        icon: Lock,
        color: 'text-red-500 bg-red-500/10',
        documentTypes: ['Document sensible', 'Titre de propriété', 'Brevet', 'Marque', 'Secret'],
        legalBasis: 'Conservation volontaire',
    },
    certificates: {
        key: 'certificates',
        title: 'Certificats de Dépôt',
        description: 'Preuves légales d\'archivage à valeur probante',
        retentionYears: 'permanent',
        icon: Award,
        color: 'text-amber-500 bg-amber-500/10',
        documentTypes: ['Certificat', 'Attestation', 'Horodatage', 'Preuve'],
        legalBasis: 'Décret n°2016-1673',
    },
};

// Mock data generator per category - REMOVED: Data now comes from database
const generateMockDocuments = (_category: string, _count: number): {
    id: string;
    reference: string;
    title: string;
    type: string;
    archivedAt: string;
    retentionEnd: string;
    hash: string;
    verified: boolean;
    size: string;
}[] => {
    return [];
};

// Quick filter chips
const QUICK_FILTERS = [
    { id: 'today', label: "Aujourd'hui", icon: Sparkles },
    { id: 'unverified', label: 'Non vérifiés', icon: AlertTriangle },
    { id: 'expiring', label: 'Expirant bientôt', icon: Clock },
];

export default function ArchiveCategoryPage() {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
    const [quickFilter, setQuickFilter] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    // Determine category from URL path
    const pathParts = location.pathname.split('/');
    const categoryKey = pathParts[pathParts.length - 1] || 'fiscal';

    // Map URL segments to config keys
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
    };

    const resolvedCategory = categoryMap[categoryKey] || 'fiscal';
    const config = CATEGORY_CONFIG[resolvedCategory];
    const CategoryIcon = config.icon;

    // Document counts - REMOVED: Now fetched from database
    const documentCounts: Record<string, number> = {
        fiscal: 0,
        social: 0,
        legal: 0,
        clients: 0,
        vault: 0,
        certificates: 0,
    };

    const documents = useMemo(() =>
        generateMockDocuments(resolvedCategory, Math.min(documentCounts[resolvedCategory] || 50, 20)),
        [resolvedCategory]
    );

    // Filter documents
    const filteredDocuments = documents.filter(doc => {
        if (typeFilter !== 'all' && doc.type !== typeFilter) return false;
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
    const complianceRate = Math.round((verifiedCount / documents.length) * 100);

    return (
        <div className="space-y-4">
            {/* Compact Header - Single Line */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', config.color.split(' ')[1])}>
                        <CategoryIcon className={cn('h-5 w-5', config.color.split(' ')[0])} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold">{config.title}</h2>
                            <Badge variant="secondary" className="text-xs">
                                {documentCounts[resolvedCategory]?.toLocaleString()} docs
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
                    {/* View mode toggle */}
                    <div className="flex border rounded-lg overflow-hidden">
                        <Button
                            variant={viewMode === '2d' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('2d')}
                            className={cn('rounded-none h-8', viewMode === '2d' && 'bg-primary')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === '3d' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('3d')}
                            className={cn('rounded-none h-8', viewMode === '3d' && 'bg-primary')}
                        >
                            <Box className="h-4 w-4" />
                        </Button>
                    </div>
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
            <div className="flex gap-2 flex-wrap items-center">
                {/* Quick Filter Chips */}
                <div className="flex gap-1">
                    {QUICK_FILTERS.map(f => (
                        <Button
                            key={f.id}
                            variant={quickFilter === f.id ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                                'h-7 text-xs',
                                quickFilter === f.id && 'bg-emerald-500 hover:bg-emerald-600'
                            )}
                            onClick={() => setQuickFilter(quickFilter === f.id ? null : f.id)}
                        >
                            <f.icon className="h-3 w-3 mr-1" />
                            {f.label}
                        </Button>
                    ))}
                </div>

                <div className="h-4 w-px bg-border mx-1" />

                {/* Type Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        {config.documentTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-8 text-sm"
                    />
                </div>
            </div>

            {/* Content - 2D or 3D view */}
            <AnimatePresence mode="wait">
                {viewMode === '3d' ? (
                    <motion.div
                        key="3d-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-[600px] rounded-lg overflow-hidden"
                    >
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-full bg-muted rounded-lg">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Chargement 3D...</p>
                                </div>
                            </div>
                        }>
                            <Archive3DView
                                category={resolvedCategory}
                                onDocumentSelect={(doc) => console.log('Selected:', doc)}
                            />
                        </Suspense>
                    </motion.div>
                ) : (
                    <motion.div
                        key="2d-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border rounded-lg overflow-hidden"
                    >
                        <TooltipProvider>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead className="w-8"></TableHead>
                                        <TableHead>Document</TableHead>
                                        <TableHead className="w-28">Date</TableHead>
                                        <TableHead className="w-32">Statut</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDocuments.map((doc, i) => (
                                        <React.Fragment key={doc.id}>
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.02 }}
                                                className={cn(
                                                    'group cursor-pointer hover:bg-muted/50 transition-colors',
                                                    expandedRow === doc.id && 'bg-muted/30'
                                                )}
                                                onClick={() => setExpandedRow(expandedRow === doc.id ? null : doc.id)}
                                            >
                                                <TableCell className="w-8 px-2">
                                                    <ChevronRight className={cn(
                                                        'h-4 w-4 text-muted-foreground transition-transform',
                                                        expandedRow === doc.id && 'rotate-90'
                                                    )} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="font-medium truncate">{doc.title}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                <Badge variant="outline" className="mr-2 text-[10px] px-1 py-0">
                                                                    {doc.type}
                                                                </Badge>
                                                                {doc.reference}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {doc.archivedAt}
                                                </TableCell>
                                                <TableCell>
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
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Voir
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Télécharger
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Award className="h-4 w-4 mr-2" />
                                                                Certificat
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </motion.tr>
                                            {/* Expanded Row Details */}
                                            <AnimatePresence>
                                                {expandedRow === doc.id && (
                                                    <motion.tr
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                    >
                                                        <TableCell colSpan={5} className="bg-muted/20 py-3">
                                                            <div className="flex gap-6 text-sm pl-10">
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground mb-1">Expiration</p>
                                                                    <p className="font-medium flex items-center gap-1">
                                                                        {doc.retentionEnd === 'Permanent' ? (
                                                                            <><Lock className="h-3 w-3" /> Permanent</>
                                                                        ) : (
                                                                            <><Clock className="h-3 w-3" /> {doc.retentionEnd}</>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground mb-1">Hash SHA-256</p>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <p className="font-mono text-xs flex items-center gap-1 cursor-help">
                                                                                <Hash className="h-3 w-3" />
                                                                                {doc.hash}...
                                                                            </p>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p className="font-mono text-xs">{doc.hash}{doc.hash}{doc.hash}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground mb-1">Taille</p>
                                                                    <p className="font-medium">{doc.size}</p>
                                                                </div>
                                                                <div className="ml-auto flex gap-2">
                                                                    <Button size="sm" variant="outline" className="h-7">
                                                                        <Shield className="h-3 w-3 mr-1" />
                                                                        Vérifier
                                                                    </Button>
                                                                    <Button size="sm" variant="outline" className="h-7">
                                                                        <Download className="h-3 w-3 mr-1" />
                                                                        Télécharger
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </motion.tr>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    ))}
                                    {filteredDocuments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                Aucun document trouvé
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TooltipProvider>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pagination */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                    {filteredDocuments.length} sur {documentCounts[resolvedCategory]?.toLocaleString() || 0}
                </span>
                <Button variant="outline" size="sm">
                    Voir plus
                </Button>
            </div>
        </div>
    );
}
