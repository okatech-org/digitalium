/**
 * ArchiveCategoryPage - Dynamic archive category page
 * Adapts content based on route parameter (fiscal, social, legal, clients, vault, certificates)
 */

import React, { useState, useMemo, Suspense, lazy } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
    Calendar,
    Building2,
    LayoutGrid,
    List,
    Box,
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

// Mock data generator per category
const generateMockDocuments = (category: string, count: number) => {
    const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.fiscal;
    const docs = [];

    for (let i = 0; i < count; i++) {
        const typeIdx = i % config.documentTypes.length;
        const year = 2024 - Math.floor(i / 10);
        const month = 12 - (i % 12);
        const day = 28 - (i % 20);

        docs.push({
            id: `${category}-${i}`,
            reference: `ARCH-${year}-${String(i + 100).padStart(5, '0')}`,
            title: `${config.documentTypes[typeIdx]} ${category === 'clients' ? 'Client ' + String.fromCharCode(65 + (i % 26)) : ''} - ${String(month).padStart(2, '0')}/${year}`,
            type: config.documentTypes[typeIdx],
            archivedAt: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
            retentionEnd: config.retentionYears === 'permanent'
                ? 'Permanent'
                : `31/12/${year + config.retentionYears}`,
            hash: Math.random().toString(16).substr(2, 8) + '...',
            verified: Math.random() > 0.05,
            size: `${Math.floor(Math.random() * 2000 + 100)} KB`,
        });
    }

    return docs;
};

export default function ArchiveCategoryPage() {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

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

    // Generate mock data based on category
    const documentCounts: Record<string, number> = {
        fiscal: 2847,
        social: 1523,
        legal: 456,
        clients: 892,
        vault: 34,
        certificates: 156,
    };

    const documents = useMemo(() =>
        generateMockDocuments(resolvedCategory, Math.min(documentCounts[resolvedCategory] || 50, 20)),
        [resolvedCategory]
    );

    // Filter documents
    const filteredDocuments = documents.filter(doc => {
        if (typeFilter !== 'all' && doc.type !== typeFilter) return false;
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', config.color.split(' ')[1])}>
                        <CategoryIcon className={cn('h-5 w-5', config.color.split(' ')[0])} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">{config.title}</h2>
                        <p className="text-sm text-muted-foreground">
                            {documentCounts[resolvedCategory]?.toLocaleString() || 0} documents •
                            Conservation {config.retentionYears === 'permanent'
                                ? 'permanente'
                                : `légale ${config.retentionYears} ans`}
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
                            className={cn(
                                'rounded-none',
                                viewMode === '2d' && 'bg-primary'
                            )}
                        >
                            <List className="h-4 w-4 mr-1" />
                            2D
                        </Button>
                        <Button
                            variant={viewMode === '3d' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('3d')}
                            className={cn(
                                'rounded-none',
                                viewMode === '3d' && 'bg-primary'
                            )}
                        >
                            <Box className="h-4 w-4 mr-1" />
                            3D
                        </Button>
                    </div>
                    <Badge variant="secondary" className={cn(
                        complianceRate === 100
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                    )}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {complianceRate}% conforme
                    </Badge>
                </div>
            </div>

            {/* Legal basis info */}
            <div className="text-xs text-muted-foreground flex items-center gap-2 px-1">
                <Scale className="h-3 w-3" />
                Base légale: {config.legalBasis}
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par titre ou référence..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        {config.documentTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
                                    <p className="text-sm text-muted-foreground">Chargement de la vue 3D...</p>
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
                        className="border rounded-lg"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[140px]">Référence</TableHead>
                                    <TableHead>Document</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Archivé le</TableHead>
                                    <TableHead>Expiration</TableHead>
                                    <TableHead>Intégrité</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDocuments.map((doc, i) => (
                                    <motion.tr
                                        key={doc.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="group"
                                    >
                                        <TableCell className="font-mono text-xs">
                                            {doc.reference}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium truncate max-w-[250px]">
                                                    {doc.title}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{doc.type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {doc.archivedAt}
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                'flex items-center gap-1 text-sm',
                                                doc.retentionEnd === 'Permanent' && 'text-amber-500'
                                            )}>
                                                {doc.retentionEnd === 'Permanent' ? (
                                                    <Lock className="h-3 w-3" />
                                                ) : (
                                                    <Clock className="h-3 w-3" />
                                                )}
                                                {doc.retentionEnd}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {doc.verified ? (
                                                    <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                                                        <Shield className="h-3 w-3 mr-1" />
                                                        Vérifiée
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        En attente
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                                    <Hash className="h-3 w-3" />
                                                    {doc.hash}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Voir le document
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Télécharger
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        Vérifier intégrité
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Award className="h-4 w-4 mr-2" />
                                                        Certificat de dépôt
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                                {filteredDocuments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            Aucun document trouvé
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pagination info */}
            <div className="flex justify-between items-center text-sm text-muted-foreground px-1">
                <span>
                    Affichage de {filteredDocuments.length} sur {documentCounts[resolvedCategory]?.toLocaleString() || 0} documents
                </span>
                <Button variant="outline" size="sm">
                    Voir plus
                </Button>
            </div>
        </div>
    );
}
