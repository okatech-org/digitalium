/**
 * ArchiveSettings - Enterprise Admin page for customizing archive segmentation
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    Plus,
    ChevronRight,
    ChevronDown,
    Edit,
    Trash2,
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
    Clock,
    Save,
    RefreshCw,
    Workflow,
    Bell,
    AlertTriangle,
    Check,
    X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { DEFAULT_ARCHIVE_CONFIG } from '@/types/organization';

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    FileText,
    Users,
    Calculator,
    Scale,
    Briefcase,
    Shield,
    Archive,
    Award,
    FolderTree,
};

// Mock organization units
const MOCK_UNITS = [
    {
        id: 'unit-1',
        name: 'Comptabilité & Finance',
        code: 'FIN',
        icon: 'Calculator',
        color: 'emerald',
        documentCount: 2847,
        storageUsed: 512 * 1024 * 1024,
        storageQuota: 1024 * 1024 * 1024,
        retentionYears: 10,
        legalBasis: 'Code du Commerce - Art. L123-22',
        documentTypes: ['Facture', 'Bilan', 'Déclaration', 'Relevé', 'Justificatif'],
        autoArchive: true,
        requireApproval: false,
        pendingApprovals: 0,
        expiringSoon: 12,
    },
    {
        id: 'unit-2',
        name: 'Ressources Humaines',
        code: 'RH',
        icon: 'Users',
        color: 'blue',
        documentCount: 1523,
        storageUsed: 300 * 1024 * 1024,
        storageQuota: 512 * 1024 * 1024,
        retentionYears: 5,
        legalBasis: 'Code du Travail - Art. L3243-4',
        documentTypes: ['Bulletin de paie', 'Contrat', 'Attestation', 'Avenant', 'Certificat'],
        autoArchive: false,
        requireApproval: true,
        pendingApprovals: 5,
        expiringSoon: 3,
    },
    {
        id: 'unit-3',
        name: 'Juridique',
        code: 'JUR',
        icon: 'Scale',
        color: 'purple',
        documentCount: 456,
        storageUsed: 200 * 1024 * 1024,
        storageQuota: 512 * 1024 * 1024,
        retentionYears: 30,
        legalBasis: 'Code Civil - Art. 2224',
        documentTypes: ['Statuts', 'PV', 'Contrat', 'Acte notarié', 'Assignation'],
        autoArchive: false,
        requireApproval: true,
        pendingApprovals: 2,
        expiringSoon: 0,
    },
    {
        id: 'unit-4',
        name: 'Commercial',
        code: 'COM',
        icon: 'Briefcase',
        color: 'orange',
        documentCount: 892,
        storageUsed: 400 * 1024 * 1024,
        storageQuota: 1024 * 1024 * 1024,
        retentionYears: 10,
        legalBasis: 'Code de Commerce',
        documentTypes: ['Devis', 'Bon de commande', 'Contrat client', 'Facture', 'Correspondance'],
        autoArchive: true,
        requireApproval: false,
        pendingApprovals: 0,
        expiringSoon: 8,
    },
    {
        id: 'unit-5',
        name: 'Coffre-fort',
        code: 'COF',
        icon: 'Shield',
        color: 'red',
        documentCount: 34,
        storageUsed: 50 * 1024 * 1024,
        storageQuota: 256 * 1024 * 1024,
        retentionYears: 'permanent',
        legalBasis: 'Conservation volontaire',
        documentTypes: ['Titre de propriété', 'Brevet', 'Marque', 'Secret'],
        autoArchive: false,
        requireApproval: true,
        pendingApprovals: 0,
        expiringSoon: 0,
    },
];

// Mock workflows
const MOCK_WORKFLOWS = [
    {
        id: 'wf-1',
        name: 'Validation Factures',
        unitId: 'unit-1',
        trigger: 'upload',
        isActive: true,
        executions: 234,
    },
    {
        id: 'wf-2',
        name: 'Approbation Contrats RH',
        unitId: 'unit-2',
        trigger: 'approval',
        isActive: true,
        executions: 45,
    },
    {
        id: 'wf-3',
        name: 'Alerte Expiration',
        unitId: 'unit-3',
        trigger: 'expiration',
        isActive: true,
        executions: 12,
    },
];

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ArchiveSettings() {
    const [units] = useState(MOCK_UNITS);
    const [selectedUnit, setSelectedUnit] = useState(MOCK_UNITS[0]);
    const [isEditing, setIsEditing] = useState(false);
    const [newDocType, setNewDocType] = useState('');

    const totalDocuments = units.reduce((acc, u) => acc + u.documentCount, 0);
    const totalStorage = units.reduce((acc, u) => acc + u.storageUsed, 0);
    const totalPending = units.reduce((acc, u) => acc + u.pendingApprovals, 0);
    const totalExpiring = units.reduce((acc, u) => acc + u.expiringSoon, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Paramètres d'archivage</h1>
                    <p className="text-muted-foreground">
                        Personnalisez la configuration de vos archives par département
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualiser
                    </Button>
                    <Button>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer tout
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <Archive className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalDocuments.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">Documents</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <FolderTree className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{units.length}</p>
                                <p className="text-sm text-muted-foreground">Catégories</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Clock className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalPending}</p>
                                <p className="text-sm text-muted-foreground">En attente</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalExpiring}</p>
                                <p className="text-sm text-muted-foreground">Expirant bientôt</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Categories List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Catégories d'archive</CardTitle>
                        <CardDescription>
                            Sélectionnez une catégorie pour modifier sa configuration
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[500px]">
                            <div className="p-2 space-y-1">
                                {units.map(unit => {
                                    const Icon = ICON_MAP[unit.icon] || FileText;
                                    const storagePercent = (unit.storageUsed / unit.storageQuota) * 100;

                                    return (
                                        <motion.div
                                            key={unit.id}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            <div
                                                className={cn(
                                                    'p-3 rounded-lg cursor-pointer transition-colors',
                                                    selectedUnit?.id === unit.id
                                                        ? 'bg-primary/10 border border-primary/30'
                                                        : 'hover:bg-muted'
                                                )}
                                                onClick={() => setSelectedUnit(unit)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn('p-2 rounded-lg', `bg-${unit.color}-500/10`)}>
                                                        <Icon className={cn('h-4 w-4', `text-${unit.color}-500`)} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-medium text-sm truncate">{unit.name}</p>
                                                            <Badge variant="outline" className="text-[10px] ml-2">
                                                                {unit.code}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                            <span>{unit.documentCount.toLocaleString()} docs</span>
                                                            <span>•</span>
                                                            <span>
                                                                {unit.retentionYears === 'permanent' ? '∞' : `${unit.retentionYears} ans`}
                                                            </span>
                                                        </div>
                                                        <Progress value={storagePercent} className="h-1 mt-2" />
                                                    </div>
                                                </div>
                                                {(unit.pendingApprovals > 0 || unit.expiringSoon > 0) && (
                                                    <div className="flex gap-2 mt-2 ml-11">
                                                        {unit.pendingApprovals > 0 && (
                                                            <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 text-[10px]">
                                                                {unit.pendingApprovals} en attente
                                                            </Badge>
                                                        )}
                                                        {unit.expiringSoon > 0 && (
                                                            <Badge variant="secondary" className="bg-red-500/10 text-red-500 text-[10px]">
                                                                {unit.expiringSoon} expirant
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Configuration Panel */}
                <Card className="lg:col-span-2">
                    {selectedUnit && (
                        <>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn('p-3 rounded-xl', `bg-${selectedUnit.color}-500/10`)}>
                                            {React.createElement(
                                                ICON_MAP[selectedUnit.icon] || FileText,
                                                { className: cn('h-6 w-6', `text-${selectedUnit.color}-500`) }
                                            )}
                                        </div>
                                        <div>
                                            <CardTitle>{selectedUnit.name}</CardTitle>
                                            <CardDescription>
                                                {selectedUnit.documentCount.toLocaleString()} documents •
                                                {formatBytes(selectedUnit.storageUsed)} / {formatBytes(selectedUnit.storageQuota)}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        variant={isEditing ? 'default' : 'outline'}
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        {isEditing ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Enregistrer
                                            </>
                                        ) : (
                                            <>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Modifier
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full" defaultValue="retention">
                                    {/* Retention Settings */}
                                    <AccordionItem value="retention">
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Règles de conservation
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 pt-2">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Durée de conservation</Label>
                                                        <Select
                                                            disabled={!isEditing}
                                                            value={String(selectedUnit.retentionYears)}
                                                        >
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
                                                        <Label>Alerte expiration (jours avant)</Label>
                                                        <Input
                                                            type="number"
                                                            defaultValue={30}
                                                            disabled={!isEditing}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Base légale</Label>
                                                    <Input
                                                        value={selectedUnit.legalBasis}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Document Types */}
                                    <AccordionItem value="types">
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Types de documents ({selectedUnit.documentTypes.length})
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 pt-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedUnit.documentTypes.map(type => (
                                                        <Badge
                                                            key={type}
                                                            variant="secondary"
                                                            className="group"
                                                        >
                                                            {type}
                                                            {isEditing && (
                                                                <button className="ml-1 opacity-0 group-hover:opacity-100">
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            )}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                {isEditing && (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Nouveau type..."
                                                            value={newDocType}
                                                            onChange={(e) => setNewDocType(e.target.value)}
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            disabled={!newDocType}
                                                            onClick={() => setNewDocType('')}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Automation */}
                                    <AccordionItem value="automation">
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                <Workflow className="h-4 w-4" />
                                                Automatisation
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 pt-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">Archivage automatique</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Archiver automatiquement les documents uploadés
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={selectedUnit.autoArchive}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">Approbation requise</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Nécessite une validation avant archivage définitif
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={selectedUnit.requireApproval}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Notifications */}
                                    <AccordionItem value="notifications">
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                <Bell className="h-4 w-4" />
                                                Notifications
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 pt-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">Alerte expiration</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Notification avant expiration des documents
                                                        </p>
                                                    </div>
                                                    <Switch defaultChecked disabled={!isEditing} />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">Rapport hebdomadaire</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Résumé des activités de la catégorie
                                                        </p>
                                                    </div>
                                                    <Switch disabled={!isEditing} />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Storage */}
                                    <AccordionItem value="storage">
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                <Archive className="h-4 w-4" />
                                                Stockage
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 pt-2">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span>Utilisation</span>
                                                        <span>
                                                            {formatBytes(selectedUnit.storageUsed)} / {formatBytes(selectedUnit.storageQuota)}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={(selectedUnit.storageUsed / selectedUnit.storageQuota) * 100}
                                                        className="h-2"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Quota de stockage</Label>
                                                    <Select disabled={!isEditing} defaultValue="1">
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="0.5">512 MB</SelectItem>
                                                            <SelectItem value="1">1 GB</SelectItem>
                                                            <SelectItem value="5">5 GB</SelectItem>
                                                            <SelectItem value="10">10 GB</SelectItem>
                                                            <SelectItem value="unlimited">Illimité</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>

            {/* Workflows Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Workflows actifs</CardTitle>
                            <CardDescription>
                                Automatisations configurées pour vos archives
                            </CardDescription>
                        </div>
                        <Button variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Nouveau workflow
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {MOCK_WORKFLOWS.map(wf => {
                            const unit = units.find(u => u.id === wf.unitId);
                            return (
                                <Card key={wf.id} className="border-dashed">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Workflow className="h-5 w-5 text-muted-foreground" />
                                                <h4 className="font-medium">{wf.name}</h4>
                                            </div>
                                            <Badge variant={wf.isActive ? 'default' : 'secondary'} className="text-xs">
                                                {wf.isActive ? 'Actif' : 'Inactif'}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <span>Catégorie:</span>
                                                <Badge variant="outline">{unit?.name}</Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>Déclencheur:</span>
                                                <span className="capitalize">{wf.trigger}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>Exécutions:</span>
                                                <span>{wf.executions}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
