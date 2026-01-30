/**
 * DocumentManagementTable Component (Tableau de Gestion)
 * 
 * Displays and manages the organization's document retention calendar,
 * showing categories, retention periods, and disposition rules.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Table2,
    Plus,
    Edit,
    Trash2,
    Archive,
    Clock,
    Scale,
    FileText,
    Info,
    Filter,
    Download,
    Search
} from 'lucide-react';

// Types
export type FinalDisposition = 'destroy' | 'archive_permanent' | 'sample';

export interface ManagementCategory {
    id: string;
    organizationId?: string;
    categoryCode: string;
    categoryName: string;
    description?: string;
    activePhaseYears: number;
    semiActivePhaseYears: number;
    finalDisposition: FinalDisposition;
    legalReference?: string;
    regulationReference?: string;
    samplePercentage?: number;
    sampleCriteria?: string;
    documentExamples?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface DocumentManagementTableProps {
    categories?: ManagementCategory[];
    onCreateCategory?: (category: Partial<ManagementCategory>) => Promise<void>;
    onUpdateCategory?: (id: string, updates: Partial<ManagementCategory>) => Promise<void>;
    onDeleteCategory?: (id: string) => Promise<void>;
    isReadOnly?: boolean;
}

const DISPOSITION_LABELS: Record<FinalDisposition, { label: string; color: string }> = {
    destroy: { label: 'Destruction', color: 'bg-red-500/10 text-red-500' },
    archive_permanent: { label: 'Conservation permanente', color: 'bg-green-500/10 text-green-500' },
    sample: { label: 'Échantillonnage', color: 'bg-amber-500/10 text-amber-500' },
};

// Default Gabonese retention categories
const DEFAULT_CATEGORIES: ManagementCategory[] = [
    {
        id: 'cat-1',
        categoryCode: 'FIS-01',
        categoryName: 'Documents fiscaux et comptables',
        description: 'Tous les documents relatifs aux impôts et à la comptabilité',
        activePhaseYears: 1,
        semiActivePhaseYears: 9,
        finalDisposition: 'destroy',
        legalReference: 'Code Général des Impôts du Gabon',
        documentExamples: ['Déclarations fiscales', 'Bilans', 'Grand livre', 'Journaux comptables'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'cat-2',
        categoryCode: 'SOC-01',
        categoryName: 'Documents du personnel',
        description: 'Dossiers individuels des employés',
        activePhaseYears: 5,
        semiActivePhaseYears: 45,
        finalDisposition: 'archive_permanent',
        legalReference: 'Code du Travail gabonais Art. 180',
        documentExamples: ['Contrats de travail', 'Bulletins de paie', 'Certificats de travail'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'cat-3',
        categoryCode: 'JUR-01',
        categoryName: 'Actes juridiques',
        description: 'Documents ayant valeur juridique permanente',
        activePhaseYears: 5,
        semiActivePhaseYears: 25,
        finalDisposition: 'archive_permanent',
        legalReference: 'Code Civil gabonais',
        documentExamples: ['Statuts', 'Actes notariés', 'Procès-verbaux AG'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'cat-4',
        categoryCode: 'CTR-01',
        categoryName: 'Contrats commerciaux',
        description: 'Accords commerciaux et partenariats',
        activePhaseYears: 2,
        semiActivePhaseYears: 8,
        finalDisposition: 'destroy',
        legalReference: 'Code de Commerce gabonais',
        documentExamples: ['Contrats clients', 'Contrats fournisseurs', 'Conventions'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'cat-5',
        categoryCode: 'PRJ-01',
        categoryName: 'Documentation projets',
        description: 'Livrables et documentation technique',
        activePhaseYears: 2,
        semiActivePhaseYears: 8,
        finalDisposition: 'sample',
        legalReference: 'Bonnes pratiques',
        samplePercentage: 10,
        sampleCriteria: 'Projets stratégiques et innovations',
        documentExamples: ['Cahiers des charges', 'Rapports', 'Livrables techniques'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: 'cat-6',
        categoryCode: 'COR-01',
        categoryName: 'Correspondance officielle',
        description: 'Courriers et communications officielles',
        activePhaseYears: 1,
        semiActivePhaseYears: 4,
        finalDisposition: 'sample',
        samplePercentage: 5,
        sampleCriteria: 'Correspondance stratégique uniquement',
        documentExamples: ['Courriers signés', 'Décisions', 'Notes de service'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
];

export function DocumentManagementTable({
    categories = DEFAULT_CATEGORIES,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    isReadOnly = false,
}: DocumentManagementTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDisposition, setFilterDisposition] = useState<FinalDisposition | 'all'>('all');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ManagementCategory | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState<ManagementCategory | null>(null);

    const [newCategory, setNewCategory] = useState<Partial<ManagementCategory>>({
        categoryCode: '',
        categoryName: '',
        description: '',
        activePhaseYears: 1,
        semiActivePhaseYears: 5,
        finalDisposition: 'destroy',
        isActive: true,
    });

    // Filter categories
    const filteredCategories = categories.filter(cat => {
        const matchesSearch =
            cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterDisposition === 'all' || cat.finalDisposition === filterDisposition;

        return matchesSearch && matchesFilter;
    });

    const handleSaveCategory = async () => {
        if (editingCategory) {
            if (onUpdateCategory) {
                await onUpdateCategory(editingCategory.id, newCategory);
            }
        } else {
            if (onCreateCategory) {
                await onCreateCategory(newCategory);
            }
        }

        setShowCreateDialog(false);
        setEditingCategory(null);
        setNewCategory({
            categoryCode: '',
            categoryName: '',
            description: '',
            activePhaseYears: 1,
            semiActivePhaseYears: 5,
            finalDisposition: 'destroy',
            isActive: true,
        });
    };

    const handleEditCategory = (category: ManagementCategory) => {
        setEditingCategory(category);
        setNewCategory({
            categoryCode: category.categoryCode,
            categoryName: category.categoryName,
            description: category.description,
            activePhaseYears: category.activePhaseYears,
            semiActivePhaseYears: category.semiActivePhaseYears,
            finalDisposition: category.finalDisposition,
            legalReference: category.legalReference,
            samplePercentage: category.samplePercentage,
            sampleCriteria: category.sampleCriteria,
            documentExamples: category.documentExamples,
        });
        setShowCreateDialog(true);
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (onDeleteCategory) {
            await onDeleteCategory(categoryId);
        } else {
            console.log('Demo: Delete category', categoryId);
        }
    };

    const getTotalRetention = (cat: ManagementCategory) =>
        cat.activePhaseYears + cat.semiActivePhaseYears;

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Table2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Tableau de Gestion Documentaire</CardTitle>
                                <CardDescription>
                                    Calendrier de conservation selon la réglementation gabonaise
                                </CardDescription>
                            </div>
                        </div>
                        {!isReadOnly && (
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nouvelle catégorie
                            </Button>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="py-3">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher une catégorie..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select
                            value={filterDisposition}
                            onValueChange={(v) => setFilterDisposition(v as FinalDisposition | 'all')}
                        >
                            <SelectTrigger className="w-[200px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filtrer par sort final" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les sorts</SelectItem>
                                <SelectItem value="destroy">Destruction</SelectItem>
                                <SelectItem value="archive_permanent">Conservation permanente</SelectItem>
                                <SelectItem value="sample">Échantillonnage</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Code</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead className="text-center">Phase Active</TableHead>
                                <TableHead className="text-center">Phase Semi-Active</TableHead>
                                <TableHead className="text-center">Total</TableHead>
                                <TableHead>Sort Final</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((category) => {
                                const dispositionInfo = DISPOSITION_LABELS[category.finalDisposition];
                                return (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono">
                                                {category.categoryCode}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{category.categoryName}</p>
                                                {category.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                                        {category.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">
                                                {category.activePhaseYears} an{category.activePhaseYears > 1 ? 's' : ''}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">
                                                {category.semiActivePhaseYears} an{category.semiActivePhaseYears > 1 ? 's' : ''}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge>
                                                {getTotalRetention(category)} ans
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={dispositionInfo.color}>
                                                {dispositionInfo.label}
                                                {category.finalDisposition === 'sample' && category.samplePercentage && (
                                                    <span className="ml-1">({category.samplePercentage}%)</span>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setShowDetailsDialog(category)}
                                                >
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                                {!isReadOnly && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleEditCategory(category)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive"
                                                            onClick={() => handleDeleteCategory(category.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {filteredCategories.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Table2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">Aucune catégorie trouvée</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Legend */}
            <Card>
                <CardContent className="py-3">
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Phase Active:</span>
                            <span>Usage courant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Phase Semi-Active:</span>
                            <span>Archivage intermédiaire</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Sort Final:</span>
                            <span>Destination définitive</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={(open) => {
                setShowCreateDialog(open);
                if (!open) setEditingCategory(null);
            }}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                        </DialogTitle>
                        <DialogDescription>
                            Définissez les règles de conservation pour cette catégorie de documents
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Code *</Label>
                                <Input
                                    value={newCategory.categoryCode}
                                    onChange={(e) => setNewCategory(c => ({ ...c, categoryCode: e.target.value }))}
                                    placeholder="FIS-01"
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Nom de la catégorie *</Label>
                                <Input
                                    value={newCategory.categoryName}
                                    onChange={(e) => setNewCategory(c => ({ ...c, categoryName: e.target.value }))}
                                    placeholder="Documents fiscaux"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={newCategory.description}
                                onChange={(e) => setNewCategory(c => ({ ...c, description: e.target.value }))}
                                placeholder="Décrivez les types de documents inclus..."
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Phase Active (années)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={newCategory.activePhaseYears}
                                    onChange={(e) => setNewCategory(c => ({
                                        ...c,
                                        activePhaseYears: parseInt(e.target.value) || 0
                                    }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phase Semi-Active (années)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={newCategory.semiActivePhaseYears}
                                    onChange={(e) => setNewCategory(c => ({
                                        ...c,
                                        semiActivePhaseYears: parseInt(e.target.value) || 0
                                    }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sort Final</Label>
                                <Select
                                    value={newCategory.finalDisposition}
                                    onValueChange={(v: FinalDisposition) => setNewCategory(c => ({
                                        ...c,
                                        finalDisposition: v
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="destroy">Destruction</SelectItem>
                                        <SelectItem value="archive_permanent">Conservation permanente</SelectItem>
                                        <SelectItem value="sample">Échantillonnage</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {newCategory.finalDisposition === 'sample' && (
                            <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                <div className="space-y-2">
                                    <Label>Pourcentage à conserver (%)</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={newCategory.samplePercentage}
                                        onChange={(e) => setNewCategory(c => ({
                                            ...c,
                                            samplePercentage: parseInt(e.target.value) || 0
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Critères de sélection</Label>
                                    <Input
                                        value={newCategory.sampleCriteria}
                                        onChange={(e) => setNewCategory(c => ({
                                            ...c,
                                            sampleCriteria: e.target.value
                                        }))}
                                        placeholder="Ex: Documents stratégiques"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Référence légale</Label>
                            <Input
                                value={newCategory.legalReference}
                                onChange={(e) => setNewCategory(c => ({ ...c, legalReference: e.target.value }))}
                                placeholder="Code, loi ou règlement applicable"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowCreateDialog(false);
                            setEditingCategory(null);
                        }}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSaveCategory}
                            disabled={!newCategory.categoryCode || !newCategory.categoryName}
                        >
                            {editingCategory ? 'Enregistrer' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={!!showDetailsDialog} onOpenChange={() => setShowDetailsDialog(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                                {showDetailsDialog?.categoryCode}
                            </Badge>
                            {showDetailsDialog?.categoryName}
                        </DialogTitle>
                    </DialogHeader>

                    {showDetailsDialog && (
                        <div className="space-y-4 py-4">
                            {showDetailsDialog.description && (
                                <div>
                                    <Label className="text-muted-foreground">Description</Label>
                                    <p className="mt-1">{showDetailsDialog.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/50">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{showDetailsDialog.activePhaseYears}</p>
                                    <p className="text-xs text-muted-foreground">Années actives</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{showDetailsDialog.semiActivePhaseYears}</p>
                                    <p className="text-xs text-muted-foreground">Années semi-actives</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{getTotalRetention(showDetailsDialog)}</p>
                                    <p className="text-xs text-muted-foreground">Total conservation</p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Sort final</Label>
                                <div className="mt-1">
                                    <Badge className={DISPOSITION_LABELS[showDetailsDialog.finalDisposition].color}>
                                        {DISPOSITION_LABELS[showDetailsDialog.finalDisposition].label}
                                    </Badge>
                                    {showDetailsDialog.finalDisposition === 'sample' && (
                                        <p className="text-sm mt-1">
                                            {showDetailsDialog.samplePercentage}% conservé
                                            {showDetailsDialog.sampleCriteria && (
                                                <span className="text-muted-foreground"> ({showDetailsDialog.sampleCriteria})</span>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {showDetailsDialog.legalReference && (
                                <div>
                                    <Label className="text-muted-foreground flex items-center gap-1">
                                        <Scale className="h-3 w-3" />
                                        Référence légale
                                    </Label>
                                    <p className="mt-1 text-sm">{showDetailsDialog.legalReference}</p>
                                </div>
                            )}

                            {showDetailsDialog.documentExamples && showDetailsDialog.documentExamples.length > 0 && (
                                <div>
                                    <Label className="text-muted-foreground flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        Exemples de documents
                                    </Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {showDetailsDialog.documentExamples.map((example, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {example}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default DocumentManagementTable;
