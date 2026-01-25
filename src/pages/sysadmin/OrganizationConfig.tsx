/**
 * OrganizationConfig - SysAdmin page for configuring organizational structure
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Plus,
    ChevronRight,
    ChevronDown,
    Settings,
    Trash2,
    Edit,
    Copy,
    MoreVertical,
    FolderTree,
    FileText,
    Users,
    Calculator,
    Scale,
    Briefcase,
    Shield,
    Archive,
    Award,
    Layers,
    Download,
    Upload,
    Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
    OrganizationUnit,
    OrganizationUnitType,
    ORGANIZATION_TEMPLATES,
    DEFAULT_ARCHIVE_CONFIG,
} from '@/types/organization';

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Building2,
    FileText,
    Users,
    Calculator,
    Scale,
    Briefcase,
    Shield,
    Archive,
    Award,
    FolderTree,
    Layers,
};

// Color options
const COLOR_OPTIONS = [
    { value: 'emerald', label: 'Vert', class: 'bg-emerald-500' },
    { value: 'blue', label: 'Bleu', class: 'bg-blue-500' },
    { value: 'purple', label: 'Violet', class: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'red', label: 'Rouge', class: 'bg-red-500' },
    { value: 'amber', label: 'Ambre', class: 'bg-amber-500' },
    { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
    { value: 'pink', label: 'Rose', class: 'bg-pink-500' },
];

// Mock data for demo
const MOCK_UNITS: OrganizationUnit[] = [
    {
        id: 'unit-1',
        organization_id: 'org-1',
        parent_id: null,
        type: 'department',
        name: 'Comptabilité & Finance',
        code: 'FIN',
        icon: 'Calculator',
        color: 'emerald',
        archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        managers: [],
        members: [],
        is_active: true,
        sort_order: 0,
        created_by: 'system',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
    {
        id: 'unit-2',
        organization_id: 'org-1',
        parent_id: null,
        type: 'department',
        name: 'Ressources Humaines',
        code: 'RH',
        icon: 'Users',
        color: 'blue',
        archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 5 },
        managers: [],
        members: [],
        is_active: true,
        sort_order: 1,
        created_by: 'system',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
    {
        id: 'unit-3',
        organization_id: 'org-1',
        parent_id: null,
        type: 'department',
        name: 'Juridique',
        code: 'JUR',
        icon: 'Scale',
        color: 'purple',
        archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 },
        managers: [],
        members: [],
        is_active: true,
        sort_order: 2,
        created_by: 'system',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
];

// Tree Node Component
interface TreeNodeProps {
    unit: OrganizationUnit;
    level: number;
    children: OrganizationUnit[];
    allUnits: OrganizationUnit[];
    onSelect: (unit: OrganizationUnit) => void;
    onDelete: (id: string) => void;
    selectedId: string | null;
}

function TreeNode({ unit, level, children, allUnits, onSelect, onDelete, selectedId }: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const Icon = ICON_MAP[unit.icon || 'FileText'] || FileText;
    const hasChildren = children.length > 0;

    return (
        <div>
            <div
                className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors',
                    selectedId === unit.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                )}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => onSelect(unit)}
            >
                {hasChildren ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                        className="p-0.5 hover:bg-muted rounded"
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>
                ) : (
                    <div className="w-5" />
                )}
                <div className={cn('p-1.5 rounded', `bg-${unit.color}-500/10`)}>
                    <Icon className={cn('h-4 w-4', `text-${unit.color}-500`)} />
                </div>
                <span className="flex-1 text-sm font-medium truncate">{unit.name}</span>
                <Badge variant="outline" className="text-[10px]">{unit.code}</Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onSelect(unit)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500" onClick={() => onDelete(unit.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {isExpanded && hasChildren && (
                <div>
                    {children.map(child => (
                        <TreeNode
                            key={child.id}
                            unit={child}
                            level={level + 1}
                            children={allUnits.filter(u => u.parent_id === child.id)}
                            allUnits={allUnits}
                            onSelect={onSelect}
                            onDelete={onDelete}
                            selectedId={selectedId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function OrganizationConfig() {
    const [units, setUnits] = useState<OrganizationUnit[]>(MOCK_UNITS);
    const [selectedUnit, setSelectedUnit] = useState<OrganizationUnit | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

    // New unit form state
    const [newUnit, setNewUnit] = useState({
        name: '',
        code: '',
        type: 'department' as OrganizationUnitType,
        icon: 'FileText',
        color: 'blue',
        parent_id: null as string | null,
    });

    const rootUnits = units.filter(u => u.parent_id === null);

    const handleCreateUnit = () => {
        const unit: OrganizationUnit = {
            id: `unit-${Date.now()}`,
            organization_id: 'org-1',
            parent_id: newUnit.parent_id,
            type: newUnit.type,
            name: newUnit.name,
            code: newUnit.code.toUpperCase(),
            icon: newUnit.icon,
            color: newUnit.color,
            archive_config: DEFAULT_ARCHIVE_CONFIG,
            managers: [],
            members: [],
            is_active: true,
            sort_order: units.length,
            created_by: 'system',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setUnits([...units, unit]);
        setIsCreateDialogOpen(false);
        setNewUnit({ name: '', code: '', type: 'department', icon: 'FileText', color: 'blue', parent_id: null });
    };

    const handleDeleteUnit = (id: string) => {
        setUnits(units.filter(u => u.id !== id));
        if (selectedUnit?.id === id) {
            setSelectedUnit(null);
        }
    };

    const handleApplyTemplate = (templateId: string) => {
        const template = ORGANIZATION_TEMPLATES.find(t => t.id === templateId);
        if (template) {
            const newUnits = template.units.map((u, i) => ({
                ...u,
                id: `unit-${Date.now()}-${i}`,
                organization_id: 'org-1',
                created_by: 'system',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })) as OrganizationUnit[];
            setUnits([...units, ...newUnits]);
        }
        setIsTemplateDialogOpen(false);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Configuration Organisation</h1>
                    <p className="text-muted-foreground">
                        Définir la structure organisationnelle et les règles d'archivage
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsTemplateDialogOpen(true)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Appliquer un modèle
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                    </Button>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle unité
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tree View */}
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FolderTree className="h-5 w-5" />
                            Structure
                        </CardTitle>
                        <CardDescription>
                            {units.length} unités organisationnelles
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[500px]">
                            <div className="space-y-1">
                                {rootUnits.map(unit => (
                                    <TreeNode
                                        key={unit.id}
                                        unit={unit}
                                        level={0}
                                        children={units.filter(u => u.parent_id === unit.id)}
                                        allUnits={units}
                                        onSelect={setSelectedUnit}
                                        onDelete={handleDeleteUnit}
                                        selectedId={selectedUnit?.id || null}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Detail Panel */}
                <Card className="lg:col-span-2">
                    {selectedUnit ? (
                        <>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn('p-3 rounded-xl', `bg-${selectedUnit.color}-500/10`)}>
                                            {React.createElement(
                                                ICON_MAP[selectedUnit.icon || 'FileText'],
                                                { className: cn('h-6 w-6', `text-${selectedUnit.color}-500`) }
                                            )}
                                        </div>
                                        <div>
                                            <CardTitle>{selectedUnit.name}</CardTitle>
                                            <CardDescription>
                                                Code: {selectedUnit.code} • Type: {selectedUnit.type}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant={selectedUnit.is_active ? 'default' : 'secondary'}>
                                        {selectedUnit.is_active ? 'Actif' : 'Inactif'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="general">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="general">Général</TabsTrigger>
                                        <TabsTrigger value="archive">Archivage</TabsTrigger>
                                        <TabsTrigger value="permissions">Permissions</TabsTrigger>
                                        <TabsTrigger value="workflows">Workflows</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="general" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nom</Label>
                                                <Input value={selectedUnit.name} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Code</Label>
                                                <Input value={selectedUnit.code} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea value={selectedUnit.description || ''} rows={3} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Type</Label>
                                                <Select value={selectedUnit.type}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="department">Département</SelectItem>
                                                        <SelectItem value="service">Service</SelectItem>
                                                        <SelectItem value="sector">Secteur</SelectItem>
                                                        <SelectItem value="folder">Dossier</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Couleur</Label>
                                                <div className="flex gap-2">
                                                    {COLOR_OPTIONS.map(c => (
                                                        <button
                                                            key={c.value}
                                                            className={cn(
                                                                'w-6 h-6 rounded-full transition-transform',
                                                                c.class,
                                                                selectedUnit.color === c.value && 'ring-2 ring-offset-2 ring-primary scale-110'
                                                            )}
                                                            title={c.label}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="archive" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Durée de conservation</Label>
                                                <Select value={String(selectedUnit.archive_config.retention_years)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="5">5 ans</SelectItem>
                                                        <SelectItem value="10">10 ans</SelectItem>
                                                        <SelectItem value="30">30 ans</SelectItem>
                                                        <SelectItem value="50">50 ans</SelectItem>
                                                        <SelectItem value="permanent">Permanente</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Base légale</Label>
                                                <Input
                                                    value={selectedUnit.archive_config.legal_basis || ''}
                                                    placeholder="Ex: Code du Commerce - Art. L123-22"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Types de documents autorisés</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedUnit.archive_config.document_types.map(type => (
                                                    <Badge key={type} variant="secondary">{type}</Badge>
                                                ))}
                                                <Button variant="outline" size="sm">
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Ajouter
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Archivage automatique</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Archiver automatiquement les documents uploadés
                                                    </p>
                                                </div>
                                                <Switch checked={selectedUnit.archive_config.auto_archive} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Approbation requise</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Nécessite une validation avant archivage
                                                    </p>
                                                </div>
                                                <Switch checked={selectedUnit.archive_config.require_approval} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Hériter de la configuration parent</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Utiliser les paramètres du niveau supérieur
                                                    </p>
                                                </div>
                                                <Switch checked={selectedUnit.archive_config.inherit_from_parent} />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="permissions" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Managers</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Utilisateurs pouvant gérer cette unité
                                            </p>
                                            <Button variant="outline" size="sm">
                                                <Plus className="h-3 w-3 mr-1" />
                                                Ajouter un manager
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Membres</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Utilisateurs pouvant archiver dans cette unité
                                            </p>
                                            <Button variant="outline" size="sm">
                                                <Plus className="h-3 w-3 mr-1" />
                                                Ajouter un membre
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="workflows" className="space-y-4">
                                        <p className="text-muted-foreground">
                                            Configurez les workflows automatiques pour cette unité.
                                        </p>
                                        <Button variant="outline">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Créer un workflow
                                        </Button>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                                    <Button variant="outline">Annuler</Button>
                                    <Button>Enregistrer</Button>
                                </div>
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="flex flex-col items-center justify-center h-[600px] text-muted-foreground">
                            <Settings className="h-12 w-12 mb-4 opacity-50" />
                            <p>Sélectionnez une unité pour voir ses détails</p>
                        </CardContent>
                    )}
                </Card>
            </div>

            {/* Create Unit Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouvelle unité organisationnelle</DialogTitle>
                        <DialogDescription>
                            Créer un nouveau département, service ou dossier
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nom *</Label>
                                <Input
                                    value={newUnit.name}
                                    onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                                    placeholder="Ex: Direction Financière"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Code *</Label>
                                <Input
                                    value={newUnit.code}
                                    onChange={(e) => setNewUnit({ ...newUnit, code: e.target.value.toUpperCase() })}
                                    placeholder="Ex: FIN"
                                    maxLength={6}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={newUnit.type}
                                    onValueChange={(v) => setNewUnit({ ...newUnit, type: v as OrganizationUnitType })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="department">Département</SelectItem>
                                        <SelectItem value="service">Service</SelectItem>
                                        <SelectItem value="sector">Secteur</SelectItem>
                                        <SelectItem value="folder">Dossier</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Parent</Label>
                                <Select
                                    value={newUnit.parent_id || 'none'}
                                    onValueChange={(v) => setNewUnit({ ...newUnit, parent_id: v === 'none' ? null : v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Racine" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Racine (niveau 1)</SelectItem>
                                        {units.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Couleur</Label>
                            <div className="flex gap-2">
                                {COLOR_OPTIONS.map(c => (
                                    <button
                                        key={c.value}
                                        onClick={() => setNewUnit({ ...newUnit, color: c.value })}
                                        className={cn(
                                            'w-8 h-8 rounded-full transition-transform',
                                            c.class,
                                            newUnit.color === c.value && 'ring-2 ring-offset-2 ring-primary scale-110'
                                        )}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleCreateUnit} disabled={!newUnit.name || !newUnit.code}>
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Template Dialog */}
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Appliquer un modèle</DialogTitle>
                        <DialogDescription>
                            Utilisez un modèle prédéfini pour démarrer rapidement
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        {ORGANIZATION_TEMPLATES.map(template => (
                            <Card
                                key={template.id}
                                className="cursor-pointer hover:border-primary/50 transition-colors"
                                onClick={() => handleApplyTemplate(template.id)}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Building2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{template.name}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {template.units.length} unités
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {template.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
