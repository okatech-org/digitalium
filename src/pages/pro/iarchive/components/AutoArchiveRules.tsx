/**
 * AutoArchiveRules Component
 * 
 * Manages automatic archiving rules that transition documents
 * based on age, type, status, or tags.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Settings,
    Plus,
    Play,
    Pause,
    Trash2,
    Edit,
    Clock,
    Folder,
    FileText,
    Tag,
    ArrowRight,
    Lock,
    Calendar,
    RefreshCw,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

// Types
export type Frequency = 'daily' | 'weekly' | 'monthly';
export type DocumentType = 'contract' | 'invoice' | 'quote' | 'report' | 'project' | 'hr' | 'legal' | 'fiscal' | 'other';
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'archived' | 'deleted';

export interface AutoArchiveRule {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    priority: number;
    // Source criteria
    sourceFolderId?: string;
    sourceFolderName?: string;
    sourceType?: DocumentType;
    sourceStatus?: DocumentStatus;
    sourceTags?: string[];
    sourceAgeDays?: number;
    // Target configuration
    targetFolderId?: string;
    targetFolderName?: string;
    targetStatus?: DocumentStatus;
    targetLocked?: boolean;
    // Schedule
    runFrequency: Frequency;
    lastRunAt?: Date;
    nextRunAt?: Date;
    // Stats
    documentsProcessed: number;
    createdAt: Date;
    updatedAt: Date;
}

interface AutoArchiveRulesProps {
    rules?: AutoArchiveRule[];
    onCreateRule?: (rule: Partial<AutoArchiveRule>) => Promise<void>;
    onUpdateRule?: (id: string, updates: Partial<AutoArchiveRule>) => Promise<void>;
    onDeleteRule?: (id: string) => Promise<void>;
    onRunRule?: (id: string) => Promise<number>;
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
    { value: 'contract', label: 'Contrats' },
    { value: 'invoice', label: 'Factures' },
    { value: 'quote', label: 'Devis' },
    { value: 'report', label: 'Rapports' },
    { value: 'project', label: 'Projets' },
    { value: 'hr', label: 'RH' },
    { value: 'legal', label: 'Juridique' },
    { value: 'fiscal', label: 'Fiscal' },
    { value: 'other', label: 'Autre' },
];

const DOCUMENT_STATUSES: { value: DocumentStatus; label: string }[] = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'pending', label: 'En révision' },
    { value: 'approved', label: 'Approuvé' },
    { value: 'archived', label: 'Archivé' },
];

const FREQUENCIES: { value: Frequency; label: string }[] = [
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
];

// Demo rules
const DEMO_RULES: AutoArchiveRule[] = [
    {
        id: 'rule-1',
        name: 'Archivage documents approuvés',
        description: 'Archive automatiquement les documents approuvés de plus de 90 jours',
        isActive: true,
        priority: 1,
        sourceStatus: 'approved',
        sourceAgeDays: 90,
        targetFolderId: 'folder-archive',
        targetFolderName: 'Archive Longue Durée',
        targetStatus: 'archived',
        targetLocked: true,
        runFrequency: 'weekly',
        lastRunAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        nextRunAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        documentsProcessed: 127,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: 'rule-2',
        name: 'Transfert factures fiscales',
        description: 'Transfère les factures vers l\'archive fiscale après 30 jours',
        isActive: true,
        priority: 2,
        sourceType: 'invoice',
        sourceAgeDays: 30,
        targetFolderId: 'folder-fiscal',
        targetFolderName: 'Archive Fiscale',
        targetStatus: 'archived',
        runFrequency: 'daily',
        lastRunAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        nextRunAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
        documentsProcessed: 456,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
    },
    {
        id: 'rule-3',
        name: 'Gel contrats expirés',
        description: 'Verrouille les contrats après leur transfert en archive',
        isActive: false,
        priority: 3,
        sourceType: 'contract',
        sourceStatus: 'archived',
        sourceTags: ['expiry-notified'],
        targetLocked: true,
        runFrequency: 'monthly',
        documentsProcessed: 23,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
    },
];

// Demo folders
const DEMO_FOLDERS = [
    { id: 'folder-inbox', name: 'Boîte de réception' },
    { id: 'folder-active', name: 'Documents Actifs' },
    { id: 'folder-archive', name: 'Archive Longue Durée' },
    { id: 'folder-fiscal', name: 'Archive Fiscale' },
    { id: 'folder-rh', name: 'Archive RH' },
    { id: 'folder-legal', name: 'Archive Juridique' },
];

export function AutoArchiveRules({
    rules = DEMO_RULES,
    onCreateRule,
    onUpdateRule,
    onDeleteRule,
    onRunRule,
}: AutoArchiveRulesProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingRule, setEditingRule] = useState<AutoArchiveRule | null>(null);
    const [runningRuleId, setRunningRuleId] = useState<string | null>(null);

    const [newRule, setNewRule] = useState<Partial<AutoArchiveRule>>({
        name: '',
        description: '',
        isActive: true,
        priority: rules.length + 1,
        runFrequency: 'weekly',
        targetLocked: false,
    });

    const handleToggleActive = async (rule: AutoArchiveRule) => {
        if (onUpdateRule) {
            await onUpdateRule(rule.id, { isActive: !rule.isActive });
        } else {
            console.log('Demo: Toggle rule', rule.id);
        }
    };

    const handleRunNow = async (ruleId: string) => {
        setRunningRuleId(ruleId);

        if (onRunRule) {
            await onRunRule(ruleId);
        } else {
            // Demo mode
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Demo: Run rule', ruleId);
        }

        setRunningRuleId(null);
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (onDeleteRule) {
            await onDeleteRule(ruleId);
        } else {
            console.log('Demo: Delete rule', ruleId);
        }
    };

    const handleCreateRule = async () => {
        if (onCreateRule) {
            await onCreateRule(newRule);
        } else {
            console.log('Demo: Create rule', newRule);
        }
        setShowCreateDialog(false);
        setNewRule({
            name: '',
            description: '',
            isActive: true,
            priority: rules.length + 1,
            runFrequency: 'weekly',
            targetLocked: false,
        });
    };

    const RuleCard = ({ rule }: { rule: AutoArchiveRule }) => (
        <Card className={`transition-opacity ${rule.isActive ? '' : 'opacity-60'}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium truncate">{rule.name}</span>
                            <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                                {rule.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                Priorité {rule.priority}
                            </Badge>
                        </div>

                        {rule.description && (
                            <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                        )}

                        {/* Criteria */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                            {rule.sourceType && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50">
                                    <FileText className="h-3 w-3" />
                                    {DOCUMENT_TYPES.find(t => t.value === rule.sourceType)?.label}
                                </span>
                            )}
                            {rule.sourceStatus && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50">
                                    Status: {DOCUMENT_STATUSES.find(s => s.value === rule.sourceStatus)?.label}
                                </span>
                            )}
                            {rule.sourceAgeDays && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50">
                                    <Clock className="h-3 w-3" />
                                    &gt; {rule.sourceAgeDays} jours
                                </span>
                            )}
                            {rule.sourceTags && rule.sourceTags.length > 0 && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50">
                                    <Tag className="h-3 w-3" />
                                    {rule.sourceTags.join(', ')}
                                </span>
                            )}

                            <ArrowRight className="h-4 w-4 mx-1" />

                            {rule.targetFolderName && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary">
                                    <Folder className="h-3 w-3" />
                                    {rule.targetFolderName}
                                </span>
                            )}
                            {rule.targetStatus && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary">
                                    → {DOCUMENT_STATUSES.find(s => s.value === rule.targetStatus)?.label}
                                </span>
                            )}
                            {rule.targetLocked && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 text-amber-500">
                                    <Lock className="h-3 w-3" />
                                    Verrouillé
                                </span>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <RefreshCw className="h-3 w-3" />
                                {FREQUENCIES.find(f => f.value === rule.runFrequency)?.label}
                            </span>
                            {rule.lastRunAt && (
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    Dernière: {rule.lastRunAt.toLocaleDateString('fr-FR')}
                                </span>
                            )}
                            {rule.nextRunAt && rule.isActive && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Prochaine: {rule.nextRunAt.toLocaleDateString('fr-FR')}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {rule.documentsProcessed} traités
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => handleToggleActive(rule)}
                        />
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRunNow(rule.id)}
                                disabled={!rule.isActive || runningRuleId === rule.id}
                            >
                                {runningRuleId === rule.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingRule(rule)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteRule(rule.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        Règles d'Archivage Automatique
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Configurez des règles pour archiver automatiquement vos documents
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle règle
                </Button>
            </div>

            {/* Rules list */}
            <div className="space-y-3">
                {rules.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Settings className="h-12 w-12 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground text-center">
                                Aucune règle d'archivage configurée.
                                <br />
                                <span className="text-sm">
                                    Créez une règle pour automatiser l'archivage de vos documents.
                                </span>
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    rules.map((rule) => <RuleCard key={rule.id} rule={rule} />)
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showCreateDialog || !!editingRule} onOpenChange={(open) => {
                if (!open) {
                    setShowCreateDialog(false);
                    setEditingRule(null);
                }
            }}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRule ? 'Modifier la règle' : 'Nouvelle règle d\'archivage'}
                        </DialogTitle>
                        <DialogDescription>
                            Configurez les critères de sélection et les actions à appliquer
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Basic info */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nom de la règle *</Label>
                                <Input
                                    value={editingRule?.name || newRule.name}
                                    onChange={(e) => editingRule
                                        ? setEditingRule({ ...editingRule, name: e.target.value })
                                        : setNewRule({ ...newRule, name: e.target.value })}
                                    placeholder="Ex: Archivage factures mensuelles"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editingRule?.description || newRule.description}
                                    onChange={(e) => editingRule
                                        ? setEditingRule({ ...editingRule, description: e.target.value })
                                        : setNewRule({ ...newRule, description: e.target.value })}
                                    placeholder="Description de la règle..."
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Source criteria */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm">Critères de sélection (Source)</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type de document</Label>
                                    <Select
                                        value={editingRule?.sourceType || newRule.sourceType || ''}
                                        onValueChange={(value: DocumentType) => editingRule
                                            ? setEditingRule({ ...editingRule, sourceType: value })
                                            : setNewRule({ ...newRule, sourceType: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tous types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DOCUMENT_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Statut actuel</Label>
                                    <Select
                                        value={editingRule?.sourceStatus || newRule.sourceStatus || ''}
                                        onValueChange={(value: DocumentStatus) => editingRule
                                            ? setEditingRule({ ...editingRule, sourceStatus: value })
                                            : setNewRule({ ...newRule, sourceStatus: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tous statuts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DOCUMENT_STATUSES.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Âge minimum (jours)</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={editingRule?.sourceAgeDays || newRule.sourceAgeDays || ''}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value) || undefined;
                                            editingRule
                                                ? setEditingRule({ ...editingRule, sourceAgeDays: value })
                                                : setNewRule({ ...newRule, sourceAgeDays: value });
                                        }}
                                        placeholder="Ex: 30"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Dossier source</Label>
                                    <Select
                                        value={editingRule?.sourceFolderId || newRule.sourceFolderId || ''}
                                        onValueChange={(value) => editingRule
                                            ? setEditingRule({ ...editingRule, sourceFolderId: value })
                                            : setNewRule({ ...newRule, sourceFolderId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tous dossiers" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DEMO_FOLDERS.map((folder) => (
                                                <SelectItem key={folder.id} value={folder.id}>
                                                    {folder.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Target configuration */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm">Actions à appliquer (Destination)</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Dossier de destination</Label>
                                    <Select
                                        value={editingRule?.targetFolderId || newRule.targetFolderId || ''}
                                        onValueChange={(value) => editingRule
                                            ? setEditingRule({ ...editingRule, targetFolderId: value })
                                            : setNewRule({ ...newRule, targetFolderId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Conserver dans le même dossier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DEMO_FOLDERS.map((folder) => (
                                                <SelectItem key={folder.id} value={folder.id}>
                                                    {folder.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Nouveau statut</Label>
                                    <Select
                                        value={editingRule?.targetStatus || newRule.targetStatus || ''}
                                        onValueChange={(value: DocumentStatus) => editingRule
                                            ? setEditingRule({ ...editingRule, targetStatus: value })
                                            : setNewRule({ ...newRule, targetStatus: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Ne pas changer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DOCUMENT_STATUSES.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                <div>
                                    <p className="font-medium text-sm">Verrouiller après traitement</p>
                                    <p className="text-xs text-muted-foreground">
                                        Empêche toute modification des documents traités
                                    </p>
                                </div>
                                <Switch
                                    checked={editingRule?.targetLocked || newRule.targetLocked || false}
                                    onCheckedChange={(checked) => editingRule
                                        ? setEditingRule({ ...editingRule, targetLocked: checked })
                                        : setNewRule({ ...newRule, targetLocked: checked })}
                                />
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm">Planification</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fréquence d'exécution</Label>
                                    <Select
                                        value={editingRule?.runFrequency || newRule.runFrequency || 'weekly'}
                                        onValueChange={(value: Frequency) => editingRule
                                            ? setEditingRule({ ...editingRule, runFrequency: value })
                                            : setNewRule({ ...newRule, runFrequency: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FREQUENCIES.map((freq) => (
                                                <SelectItem key={freq.value} value={freq.value}>
                                                    {freq.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Priorité</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={editingRule?.priority || newRule.priority || 1}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value) || 1;
                                            editingRule
                                                ? setEditingRule({ ...editingRule, priority: value })
                                                : setNewRule({ ...newRule, priority: value });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowCreateDialog(false);
                            setEditingRule(null);
                        }}>
                            Annuler
                        </Button>
                        <Button onClick={handleCreateRule}>
                            {editingRule ? 'Enregistrer' : 'Créer la règle'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AutoArchiveRules;
