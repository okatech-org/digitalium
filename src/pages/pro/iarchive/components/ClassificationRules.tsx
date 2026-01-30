/**
 * ClassificationRules Component
 * 
 * Automatic document classification based on content, metadata, and rules.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Tag,
    Plus,
    Edit,
    Trash2,
    Play,
    Pause,
    FileText,
    Folder,
    Hash,
    Calendar,
    RefreshCw,
    CheckCircle2,
    Zap,
    Settings
} from 'lucide-react';

// Types
export type ClassificationCriteria = 'filename' | 'content' | 'extension' | 'size' | 'date' | 'metadata';
export type ClassificationAction = 'add_tag' | 'set_type' | 'move_folder' | 'set_retention';

export interface ClassificationCondition {
    id: string;
    criteria: ClassificationCriteria;
    operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'matches';
    value: string;
}

export interface ClassificationRuleAction {
    id: string;
    action: ClassificationAction;
    value: string;
}

export interface ClassificationRule {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    priority: number;
    conditions: ClassificationCondition[];
    conditionLogic: 'and' | 'or';
    actions: ClassificationRuleAction[];
    runOnUpload: boolean;
    lastRunAt?: Date;
    documentsClassified: number;
    createdAt: Date;
    updatedAt: Date;
}

interface ClassificationRulesProps {
    rules?: ClassificationRule[];
    onCreateRule?: (rule: Partial<ClassificationRule>) => Promise<void>;
    onUpdateRule?: (id: string, updates: Partial<ClassificationRule>) => Promise<void>;
    onDeleteRule?: (id: string) => Promise<void>;
    onRunRule?: (id: string) => Promise<number>;
}

const CRITERIA_LABELS: Record<ClassificationCriteria, string> = {
    filename: 'Nom de fichier',
    content: 'Contenu OCR',
    extension: 'Extension',
    size: 'Taille',
    date: 'Date',
    metadata: 'Métadonnées',
};

const ACTION_LABELS: Record<ClassificationAction, string> = {
    add_tag: 'Ajouter un tag',
    set_type: 'Définir le type',
    move_folder: 'Déplacer vers dossier',
    set_retention: 'Appliquer rétention',
};

// Demo rules
const DEMO_RULES: ClassificationRule[] = [
    {
        id: 'rule-1',
        name: 'Factures fournisseurs',
        description: 'Identifie et classe automatiquement les factures',
        isActive: true,
        priority: 1,
        conditions: [
            { id: 'cond-1', criteria: 'filename', operator: 'contains', value: 'facture' },
            { id: 'cond-2', criteria: 'extension', operator: 'equals', value: 'pdf' },
        ],
        conditionLogic: 'and',
        actions: [
            { id: 'act-1', action: 'set_type', value: 'invoice' },
            { id: 'act-2', action: 'add_tag', value: 'comptabilité' },
            { id: 'act-3', action: 'set_retention', value: 'FIS-01' },
        ],
        runOnUpload: true,
        lastRunAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        documentsClassified: 234,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: 'rule-2',
        name: 'Contrats signés',
        description: 'Détecte les contrats par reconnaissance de contenu',
        isActive: true,
        priority: 2,
        conditions: [
            { id: 'cond-3', criteria: 'content', operator: 'contains', value: 'entre les soussignés' },
        ],
        conditionLogic: 'and',
        actions: [
            { id: 'act-4', action: 'set_type', value: 'contract' },
            { id: 'act-5', action: 'move_folder', value: 'Contrats' },
        ],
        runOnUpload: true,
        lastRunAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        documentsClassified: 89,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
    },
    {
        id: 'rule-3',
        name: 'Documents RH',
        description: 'Classification des documents ressources humaines',
        isActive: false,
        priority: 3,
        conditions: [
            { id: 'cond-4', criteria: 'filename', operator: 'starts_with', value: 'RH_' },
        ],
        conditionLogic: 'or',
        actions: [
            { id: 'act-6', action: 'set_type', value: 'hr' },
            { id: 'act-7', action: 'add_tag', value: 'confidentiel' },
        ],
        runOnUpload: false,
        documentsClassified: 45,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
    },
];

export function ClassificationRules({
    rules = DEMO_RULES,
    onCreateRule,
    onUpdateRule,
    onDeleteRule,
    onRunRule,
}: ClassificationRulesProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [runningRuleId, setRunningRuleId] = useState<string | null>(null);

    const handleToggleActive = async (rule: ClassificationRule) => {
        if (onUpdateRule) {
            await onUpdateRule(rule.id, { isActive: !rule.isActive });
        }
    };

    const handleRunNow = async (ruleId: string) => {
        setRunningRuleId(ruleId);
        if (onRunRule) {
            await onRunRule(ruleId);
        } else {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        setRunningRuleId(null);
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (onDeleteRule) {
            await onDeleteRule(ruleId);
        }
    };

    const RuleCard = ({ rule }: { rule: ClassificationRule }) => (
        <Card className={`transition-opacity ${rule.isActive ? '' : 'opacity-60'}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{rule.name}</span>
                            <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                                {rule.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                            <Badge variant="outline">Priorité {rule.priority}</Badge>
                            {rule.runOnUpload && (
                                <Badge variant="outline" className="text-green-500 border-green-500/50">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Auto
                                </Badge>
                            )}
                        </div>

                        {rule.description && (
                            <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                        )}

                        {/* Conditions */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs text-muted-foreground">Si:</span>
                            {rule.conditions.map((cond, idx) => (
                                <span key={cond.id} className="flex items-center gap-1">
                                    {idx > 0 && (
                                        <span className="text-xs font-medium text-primary px-1">
                                            {rule.conditionLogic.toUpperCase()}
                                        </span>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                        {CRITERIA_LABELS[cond.criteria]} {cond.operator} "{cond.value}"
                                    </Badge>
                                </span>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="text-xs text-muted-foreground">Alors:</span>
                            {rule.actions.map((act) => (
                                <Badge key={act.id} variant="secondary" className="text-xs">
                                    {ACTION_LABELS[act.action]}: {act.value}
                                </Badge>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {rule.documentsClassified} documents traités
                            </span>
                            {rule.lastRunAt && (
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Dernière exéc.: {rule.lastRunAt.toLocaleDateString('fr-FR')}
                                </span>
                            )}
                        </div>
                    </div>

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
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary" />
                        Règles de Classification Automatique
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Classez automatiquement vos documents selon leur contenu et métadonnées
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle règle
                </Button>
            </div>

            {/* Rules list */}
            <ScrollArea className="h-[500px]">
                <div className="space-y-3 pr-4">
                    {rules.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Tag className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground">Aucune règle de classification</p>
                            </CardContent>
                        </Card>
                    ) : (
                        rules.map((rule) => <RuleCard key={rule.id} rule={rule} />)
                    )}
                </div>
            </ScrollArea>

            {/* Create Dialog Placeholder */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Nouvelle règle de classification</DialogTitle>
                        <DialogDescription>
                            Créez une règle pour classifier automatiquement vos documents
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-8 text-center text-muted-foreground">
                        <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                        <p>L'éditeur avancé de règles sera disponible prochainement.</p>
                        <p className="text-sm mt-2">
                            Utilisez l'API pour créer des règles personnalisées.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Fermer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ClassificationRules;
