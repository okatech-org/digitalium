/**
 * WorkflowTemplates - SysAdmin page for managing archiving workflow templates
 * Allows viewing, creating, editing, and deleting workflow templates
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    GitBranch,
    Plus,
    Search,
    Settings2,
    Play,
    Pause,
    Trash2,
    Edit,
    Copy,
    ChevronRight,
    ArrowRight,
    Bell,
    CheckCircle,
    Archive,
    FolderOpen,
    Tag,
    Link as LinkIcon,
    Clock,
    Upload,
    Calendar,
    Hand,
    AlertTriangle,
} from 'lucide-react';
import {
    DEFAULT_WORKFLOW_TEMPLATES,
    WORKFLOW_STEP_TYPE_LABELS,
    WORKFLOW_TRIGGER_LABELS,
    WORKFLOW_CATEGORY_LABELS,
    type WorkflowTemplate,
    type WorkflowStepConfig,
} from '@/data/workflowTemplatesData';

// Icons for step types
const StepTypeIcons: Record<string, typeof Bell> = {
    notify: Bell,
    approve: CheckCircle,
    archive: Archive,
    move: FolderOpen,
    tag: Tag,
    webhook: LinkIcon,
};

// Icons for triggers
const TriggerIcons: Record<string, typeof Upload> = {
    upload: Upload,
    approval: CheckCircle,
    expiration: Clock,
    schedule: Calendar,
    manual: Hand,
};

export default function WorkflowTemplates() {
    const [workflows, setWorkflows] = useState<WorkflowTemplate[]>(DEFAULT_WORKFLOW_TEMPLATES);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [workflowToDelete, setWorkflowToDelete] = useState<WorkflowTemplate | null>(null);

    // Create/Edit modal states
    const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState<WorkflowTemplate | null>(null);
    const [formData, setFormData] = useState<Partial<WorkflowTemplate>>({
        name: '',
        description: '',
        trigger: 'manual',
        category: 'archivage',
        steps: [],
    });
    const [newStepType, setNewStepType] = useState<string>('notify');

    // Empty workflow template
    const createEmptyWorkflow = (): Partial<WorkflowTemplate> => ({
        name: '',
        description: '',
        trigger: 'manual',
        category: 'archivage',
        steps: [],
    });

    // Open create modal
    const handleOpenCreateModal = () => {
        setEditingWorkflow(null);
        setFormData(createEmptyWorkflow());
        setIsCreateEditOpen(true);
    };

    // Open edit modal
    const handleOpenEditModal = (workflow: WorkflowTemplate) => {
        setEditingWorkflow(workflow);
        setFormData({ ...workflow });
        setIsDetailsOpen(false);
        setIsCreateEditOpen(true);
    };

    // Add step to workflow
    const handleAddStep = () => {
        const newStep: WorkflowStepConfig = {
            id: `step-${Date.now()}`,
            order: (formData.steps?.length || 0) + 1,
            type: newStepType as any,
            name: WORKFLOW_STEP_TYPE_LABELS[newStepType]?.label || 'Nouvelle étape',
            description: '',
            config: {},
        };
        setFormData(prev => ({
            ...prev,
            steps: [...(prev.steps || []), newStep],
        }));
    };

    // Remove step from workflow
    const handleRemoveStep = (stepId: string) => {
        setFormData(prev => ({
            ...prev,
            steps: (prev.steps || []).filter(s => s.id !== stepId).map((s, i) => ({ ...s, order: i + 1 })),
        }));
    };

    // Save workflow (create or update)
    const handleSaveWorkflow = () => {
        if (!formData.name || !formData.description || (formData.steps?.length || 0) === 0) {
            return; // Validation failed
        }

        if (editingWorkflow) {
            // Update existing
            setWorkflows(prev => prev.map(wf =>
                wf.id === editingWorkflow.id
                    ? { ...wf, ...formData, updated_at: new Date().toISOString() } as WorkflowTemplate
                    : wf
            ));
        } else {
            // Create new
            const newWorkflow: WorkflowTemplate = {
                id: `wf-${Date.now()}`,
                name: formData.name!,
                description: formData.description!,
                trigger: formData.trigger as any || 'manual',
                category: formData.category as any || 'archivage',
                steps: formData.steps as WorkflowStepConfig[] || [],
                is_active: true,
                is_system: false,
                created_by: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setWorkflows(prev => [...prev, newWorkflow]);
        }

        setIsCreateEditOpen(false);
        setEditingWorkflow(null);
    };

    // Filter workflows
    const filteredWorkflows = workflows.filter(wf => {
        const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            wf.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || wf.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Toggle workflow active status
    const toggleWorkflowStatus = (workflowId: string) => {
        setWorkflows(prev => prev.map(wf =>
            wf.id === workflowId ? { ...wf, is_active: !wf.is_active } : wf
        ));
    };

    // Delete workflow
    const handleDeleteWorkflow = () => {
        if (!workflowToDelete) return;
        setWorkflows(prev => prev.filter(wf => wf.id !== workflowToDelete.id));
        setIsDeleteConfirmOpen(false);
        setWorkflowToDelete(null);
    };

    // Duplicate workflow
    const handleDuplicateWorkflow = (workflow: WorkflowTemplate) => {
        const duplicate: WorkflowTemplate = {
            ...workflow,
            id: `wf-${Date.now()}`,
            name: `${workflow.name} (Copie)`,
            is_system: false,
            created_by: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setWorkflows(prev => [...prev, duplicate]);
    };

    // View workflow details
    const handleViewDetails = (workflow: WorkflowTemplate) => {
        setSelectedWorkflow(workflow);
        setIsDetailsOpen(true);
    };

    return (
        <div className="h-full flex flex-col overflow-hidden p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <GitBranch className="w-6 h-6 text-primary" />
                        Modèles de Workflow
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Gérez les workflows d'archivage et de validation configurables
                    </p>
                </div>
                <Button className="gap-2" onClick={handleOpenCreateModal}>
                    <Plus className="w-4 h-4" />
                    Nouveau Workflow
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un workflow..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList>
                        <TabsTrigger value="all">Tous</TabsTrigger>
                        <TabsTrigger value="archivage">Archivage</TabsTrigger>
                        <TabsTrigger value="signature">Signature</TabsTrigger>
                        <TabsTrigger value="validation">Validation</TabsTrigger>
                        <TabsTrigger value="custom">Personnalisé</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-foreground">{workflows.length}</p>
                            <p className="text-xs text-muted-foreground">Total Workflows</p>
                        </div>
                        <GitBranch className="w-8 h-8 text-primary opacity-50" />
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-green-600">{workflows.filter(w => w.is_active).length}</p>
                            <p className="text-xs text-muted-foreground">Actifs</p>
                        </div>
                        <Play className="w-8 h-8 text-green-500 opacity-50" />
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{workflows.filter(w => w.is_system).length}</p>
                            <p className="text-xs text-muted-foreground">Système</p>
                        </div>
                        <Settings2 className="w-8 h-8 text-amber-500 opacity-50" />
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-purple-600">{workflows.filter(w => w.category === 'archivage').length}</p>
                            <p className="text-xs text-muted-foreground">Archivage</p>
                        </div>
                        <Archive className="w-8 h-8 text-purple-500 opacity-50" />
                    </CardContent>
                </Card>
            </div>

            {/* Workflow List */}
            <div className="flex-1 overflow-auto">
                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredWorkflows.map((workflow, index) => {
                            const categoryConfig = WORKFLOW_CATEGORY_LABELS[workflow.category];
                            const triggerConfig = WORKFLOW_TRIGGER_LABELS[workflow.trigger];
                            const TriggerIcon = TriggerIcons[workflow.trigger] || Clock;

                            return (
                                <motion.div
                                    key={workflow.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className={`bg-card border-border hover:border-primary/30 transition-colors ${!workflow.is_active ? 'opacity-60' : ''}`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                {/* Left: Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${workflow.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                                                            <GitBranch className={`w-5 h-5 ${workflow.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                                                {workflow.name}
                                                                {workflow.is_system && (
                                                                    <Badge variant="outline" className="text-xs">Système</Badge>
                                                                )}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                                {workflow.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Steps Preview */}
                                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                        {workflow.steps.map((step, stepIndex) => {
                                                            const StepIcon = StepTypeIcons[step.type] || Bell;
                                                            const stepConfig = WORKFLOW_STEP_TYPE_LABELS[step.type];
                                                            return (
                                                                <div key={step.id} className="flex items-center gap-1">
                                                                    <div
                                                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs ${stepConfig?.color || 'bg-gray-500'}`}
                                                                        title={step.name}
                                                                    >
                                                                        <StepIcon className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    {stepIndex < workflow.steps.length - 1 && (
                                                                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Middle: Badges */}
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge className={categoryConfig?.color || 'bg-gray-100'}>
                                                        {categoryConfig?.label}
                                                    </Badge>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <TriggerIcon className="w-3.5 h-3.5" />
                                                        {triggerConfig?.label}
                                                    </div>
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {workflow.is_active ? 'Actif' : 'Inactif'}
                                                        </span>
                                                        <Switch
                                                            checked={workflow.is_active}
                                                            onCheckedChange={() => toggleWorkflowStatus(workflow.id)}
                                                        />
                                                    </div>
                                                    <div className="h-6 w-px bg-border mx-2" />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleViewDetails(workflow)}
                                                    >
                                                        <Settings2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDuplicateWorkflow(workflow)}
                                                        title="Dupliquer"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                    {!workflow.is_system && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => {
                                                                setWorkflowToDelete(workflow);
                                                                setIsDeleteConfirmOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {filteredWorkflows.length === 0 && (
                        <div className="text-center py-12">
                            <GitBranch className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">Aucun workflow trouvé</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    {selectedWorkflow && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <GitBranch className="w-5 h-5 text-primary" />
                                    {selectedWorkflow.name}
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedWorkflow.description}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {/* Metadata */}
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground mb-1">Catégorie</p>
                                        <Badge className={WORKFLOW_CATEGORY_LABELS[selectedWorkflow.category]?.color}>
                                            {WORKFLOW_CATEGORY_LABELS[selectedWorkflow.category]?.label}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-1">Déclencheur</p>
                                        <p className="font-medium text-foreground">
                                            {WORKFLOW_TRIGGER_LABELS[selectedWorkflow.trigger]?.label}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-1">Créé par</p>
                                        <p className="font-medium text-foreground capitalize">
                                            {selectedWorkflow.created_by}
                                        </p>
                                    </div>
                                </div>

                                {/* Steps */}
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                                            {selectedWorkflow.steps.length}
                                        </span>
                                        Étapes du workflow
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedWorkflow.steps.map((step, index) => {
                                            const StepIcon = StepTypeIcons[step.type] || Bell;
                                            const stepConfig = WORKFLOW_STEP_TYPE_LABELS[step.type];
                                            return (
                                                <div key={step.id} className="flex items-start gap-3 relative">
                                                    {index < selectedWorkflow.steps.length - 1 && (
                                                        <div className="absolute left-[18px] top-10 w-0.5 h-[calc(100%+4px)] bg-border" />
                                                    )}
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 z-10 ${stepConfig?.color || 'bg-gray-500'}`}>
                                                        <StepIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 bg-muted/50 rounded-lg p-3">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-medium text-foreground">{step.name}</p>
                                                            <Badge variant="outline" className="text-xs">
                                                                {stepConfig?.label}
                                                            </Badge>
                                                        </div>
                                                        {step.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {step.description}
                                                            </p>
                                                        )}
                                                        {/* Step Config Details */}
                                                        <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                                            {step.config.approval_type && (
                                                                <p>• Type d'approbation: {step.config.approval_type}</p>
                                                            )}
                                                            {step.config.timeout_days && (
                                                                <p>• Délai: {step.config.timeout_days} jours</p>
                                                            )}
                                                            {step.config.retention_years && (
                                                                <p>• Conservation: {step.config.retention_years} ans</p>
                                                            )}
                                                            {step.config.tags && step.config.tags.length > 0 && (
                                                                <p>• Tags: {step.config.tags.join(', ')}</p>
                                                            )}
                                                            {step.config.notify_roles && step.config.notify_roles.length > 0 && (
                                                                <p>• Notifier: {step.config.notify_roles.join(', ')}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                                    Fermer
                                </Button>
                                <Button className="gap-2" onClick={() => selectedWorkflow && handleOpenEditModal(selectedWorkflow)}>
                                    <Edit className="w-4 h-4" />
                                    Modifier
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Supprimer le workflow
                        </DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer le workflow "{workflowToDelete?.name}" ?
                            Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteWorkflow}>
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create/Edit Modal */}
            <Dialog open={isCreateEditOpen} onOpenChange={setIsCreateEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <GitBranch className="w-5 h-5 text-primary" />
                            {editingWorkflow ? 'Modifier le workflow' : 'Nouveau workflow'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingWorkflow
                                ? 'Modifiez les paramètres de ce workflow'
                                : 'Créez un nouveau workflow d\'archivage personnalisé'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Name & Description */}
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="wf-name">Nom du workflow *</Label>
                                <Input
                                    id="wf-name"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Archivage Documents Comptables"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="wf-desc">Description *</Label>
                                <Textarea
                                    id="wf-desc"
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Décrivez le but de ce workflow..."
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Category & Trigger */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Catégorie</Label>
                                <Select
                                    value={formData.category || 'archivage'}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="archivage">Archivage</SelectItem>
                                        <SelectItem value="signature">Signature</SelectItem>
                                        <SelectItem value="validation">Validation</SelectItem>
                                        <SelectItem value="notification">Notification</SelectItem>
                                        <SelectItem value="custom">Personnalisé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Déclencheur</Label>
                                <Select
                                    value={formData.trigger || 'manual'}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, trigger: value as any }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manual">Manuel</SelectItem>
                                        <SelectItem value="upload">Téléchargement</SelectItem>
                                        <SelectItem value="schedule">Planifié</SelectItem>
                                        <SelectItem value="approval">Approbation</SelectItem>
                                        <SelectItem value="expiration">Expiration</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Steps Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Étapes du workflow *</Label>
                                <div className="flex items-center gap-2">
                                    <Select value={newStepType} onValueChange={setNewStepType}>
                                        <SelectTrigger className="w-[140px] h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="notify">Notifier</SelectItem>
                                            <SelectItem value="approve">Approuver</SelectItem>
                                            <SelectItem value="tag">Taguer</SelectItem>
                                            <SelectItem value="archive">Archiver</SelectItem>
                                            <SelectItem value="move">Déplacer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button type="button" size="sm" variant="outline" onClick={handleAddStep}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Steps list */}
                            <div className="space-y-2">
                                {(formData.steps || []).length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                                        Aucune étape définie. Ajoutez au moins une étape.
                                    </div>
                                ) : (
                                    (formData.steps || []).map((step, index) => {
                                        const StepIcon = StepTypeIcons[step.type] || Bell;
                                        const stepConfig = WORKFLOW_STEP_TYPE_LABELS[step.type];
                                        return (
                                            <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${stepConfig?.color || 'bg-gray-500'}`}>
                                                    <StepIcon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <Input
                                                        value={step.name}
                                                        onChange={(e) => {
                                                            const newSteps = [...(formData.steps || [])];
                                                            newSteps[index] = { ...step, name: e.target.value };
                                                            setFormData(prev => ({ ...prev, steps: newSteps }));
                                                        }}
                                                        className="h-8 text-sm"
                                                        placeholder="Nom de l'étape"
                                                    />
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {stepConfig?.label}
                                                </Badge>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => handleRemoveStep(step.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateEditOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSaveWorkflow}
                            disabled={!formData.name || !formData.description || (formData.steps?.length || 0) === 0}
                        >
                            {editingWorkflow ? 'Enregistrer' : 'Créer le workflow'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
