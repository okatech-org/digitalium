/**
 * UnarchiveDialog - Modal dialog for initiating document unarchiving
 * 
 * Supports two modes:
 * 1. Direct unarchive - Immediate, no approval needed
 * 2. Workflow unarchive - Requires approval from designated roles
 * 
 * Premium design with smooth animations and clear UX.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    ArchiveRestore,
    Zap,
    GitBranch,
    CheckCircle2,
    Clock,
    Users,
    FileText,
    AlertTriangle,
    ArrowRight,
    Shield,
    User,
    ChevronRight,
    Loader2,
    Sparkles,
    Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    type UnarchiveMode,
    type UnarchiveWorkflowTemplate,
    UNARCHIVE_WORKFLOW_TEMPLATES,
    createUnarchiveRequest,
} from '@/services/unarchiveService';

interface UnarchiveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document: {
        id: string;
        title: string;
        category: string;
    } | null;
    onUnarchiveComplete?: (requestId: string, mode: UnarchiveMode) => void;
}

const APPROVAL_TYPE_LABELS: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
    any: {
        label: '1 approbation suffit',
        description: 'Un seul approbateur doit valider',
        icon: <User className="h-3.5 w-3.5" />,
    },
    all: {
        label: 'Tous doivent approuver',
        description: 'Chaque approbateur doit valider',
        icon: <Users className="h-3.5 w-3.5" />,
    },
    majority: {
        label: 'Majorité requise',
        description: 'La majorité des approbateurs doit valider',
        icon: <Users className="h-3.5 w-3.5" />,
    },
};

export function UnarchiveDialog({
    open,
    onOpenChange,
    document,
    onUnarchiveComplete,
}: UnarchiveDialogProps) {
    const [step, setStep] = useState<'mode' | 'workflow' | 'confirm'>('mode');
    const [mode, setMode] = useState<UnarchiveMode>('direct');
    const [selectedTemplate, setSelectedTemplate] = useState<UnarchiveWorkflowTemplate | null>(null);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetState = () => {
        setStep('mode');
        setMode('direct');
        setSelectedTemplate(null);
        setReason('');
        setIsSubmitting(false);
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            resetState();
        }
        onOpenChange(newOpen);
    };

    const handleModeSelect = (selectedMode: UnarchiveMode) => {
        setMode(selectedMode);
        if (selectedMode === 'workflow') {
            setStep('workflow');
        } else {
            setStep('confirm');
        }
    };

    const handleTemplateSelect = (template: UnarchiveWorkflowTemplate) => {
        setSelectedTemplate(template);
        setStep('confirm');
    };

    const handleSubmit = async () => {
        if (!document) return;
        setIsSubmitting(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const request = createUnarchiveRequest({
            documentId: document.id,
            documentTitle: document.title,
            documentCategory: document.category,
            mode,
            reason,
            workflowTemplateId: selectedTemplate?.id,
            targetModule: 'idocument',
        });

        setIsSubmitting(false);
        onUnarchiveComplete?.(request.id, mode);
        handleOpenChange(false);
    };

    if (!document) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-emerald-500/10 p-6 pb-4">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <ArchiveRestore className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg">Désarchiver</DialogTitle>
                                <DialogDescription className="flex items-center gap-1.5 mt-0.5">
                                    <FileText className="h-3 w-3" />
                                    {document.title}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mt-4">
                        {[
                            { key: 'mode', label: 'Mode' },
                            ...(mode === 'workflow' ? [{ key: 'workflow', label: 'Circuit' }] : []),
                            { key: 'confirm', label: 'Confirmer' },
                        ].map((s, i, arr) => (
                            <div key={s.key} className="flex items-center gap-2">
                                <div className={cn(
                                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                                    step === s.key
                                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                                        : (arr.findIndex(x => x.key === step) > i)
                                            ? 'bg-emerald-500/20 text-emerald-600'
                                            : 'bg-muted text-muted-foreground'
                                )}>
                                    {arr.findIndex(x => x.key === step) > i ? (
                                        <CheckCircle2 className="h-3 w-3" />
                                    ) : (
                                        <span className="w-4 text-center">{i + 1}</span>
                                    )}
                                    {s.label}
                                </div>
                                {i < arr.length - 1 && (
                                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Choose mode */}
                        {step === 'mode' && (
                            <motion.div
                                key="mode"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-3 pt-2"
                            >
                                <p className="text-sm text-muted-foreground">
                                    Choisissez comment désarchiver ce document :
                                </p>

                                {/* Direct mode */}
                                <Card
                                    className="cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition-all group"
                                    onClick={() => handleModeSelect('direct')}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 group-hover:from-emerald-500/30 group-hover:to-emerald-600/20 transition-colors">
                                                <Zap className="h-5 w-5 text-emerald-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-sm">Désarchivage Direct</h3>
                                                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">
                                                        Instantané
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Le document est immédiatement restauré dans iDocument.
                                                    Aucune validation requise.
                                                </p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Workflow mode */}
                                <Card
                                    className="cursor-pointer hover:border-amber-500/50 hover:shadow-md transition-all group"
                                    onClick={() => handleModeSelect('workflow')}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 group-hover:from-amber-500/30 group-hover:to-orange-600/20 transition-colors">
                                                <GitBranch className="h-5 w-5 text-amber-500" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-sm">Avec Circuit de Validation</h3>
                                                    <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600">
                                                        Processus
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Soumet une demande de désarchivage qui doit être approuvée
                                                    par les responsables ou collaborateurs désignés.
                                                </p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Shield className="h-3 w-3" />
                                                        Traçabilité complète
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        Multi-approbateur
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Info notice */}
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-muted-foreground">
                                        Les documents sensibles (juridiques, fiscaux) nécessitent généralement
                                        un circuit de validation pour le désarchivage.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Choose workflow template */}
                        {step === 'workflow' && (
                            <motion.div
                                key="workflow"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-3 pt-2"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Sélectionnez un circuit de validation :
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-7"
                                        onClick={() => setStep('mode')}
                                    >
                                        ← Retour
                                    </Button>
                                </div>

                                <ScrollArea className="h-[320px] pr-2">
                                    <div className="space-y-2">
                                        {UNARCHIVE_WORKFLOW_TEMPLATES.map((template) => {
                                            const approvalInfo = APPROVAL_TYPE_LABELS[template.approvalType];
                                            return (
                                                <Card
                                                    key={template.id}
                                                    className={cn(
                                                        'cursor-pointer transition-all group',
                                                        selectedTemplate?.id === template.id
                                                            ? 'border-amber-500 shadow-md shadow-amber-500/10 bg-amber-500/5'
                                                            : 'hover:border-amber-500/40 hover:shadow-sm'
                                                    )}
                                                    onClick={() => handleTemplateSelect(template)}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h4 className="font-semibold text-sm">{template.name}</h4>
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    {template.description}
                                                                </p>
                                                            </div>
                                                            <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {template.defaultDueDays}j
                                                            </Badge>
                                                        </div>

                                                        {/* Approvers list */}
                                                        <div className="space-y-1.5 mt-3">
                                                            {template.approvers.map((approver, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-center gap-2 text-xs"
                                                                >
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarFallback className="text-[10px] bg-amber-500/10 text-amber-600">
                                                                            {approver.userName.split(' ').map(n => n[0]).join('')}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className="font-medium">{approver.userName}</span>
                                                                        <span className="text-muted-foreground ml-1.5">
                                                                            • {approver.role}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Approval type */}
                                                        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t text-xs text-muted-foreground">
                                                            {approvalInfo.icon}
                                                            <span>{approvalInfo.label}</span>
                                                            <span className="text-muted-foreground/50">—</span>
                                                            <span>{approvalInfo.description}</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </motion.div>
                        )}

                        {/* Step 3: Confirm */}
                        {step === 'confirm' && (
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4 pt-2"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Confirmez le désarchivage :
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-7"
                                        onClick={() => setStep(mode === 'workflow' ? 'workflow' : 'mode')}
                                    >
                                        ← Retour
                                    </Button>
                                </div>

                                {/* Summary card */}
                                <Card className="bg-muted/30">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            {mode === 'direct' ? (
                                                <div className="p-2 rounded-lg bg-emerald-500/15">
                                                    <Zap className="h-4 w-4 text-emerald-500" />
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded-lg bg-amber-500/15">
                                                    <GitBranch className="h-4 w-4 text-amber-500" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {mode === 'direct' ? 'Désarchivage Direct' : selectedTemplate?.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {mode === 'direct'
                                                        ? 'Restauration immédiate dans iDocument'
                                                        : `${selectedTemplate?.approvers.length} approbateur(s) requis`
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {mode === 'workflow' && selectedTemplate && (
                                            <>
                                                <Separator />
                                                <div className="space-y-1.5">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                        Circuit d'approbation
                                                    </p>
                                                    {selectedTemplate.approvers.map((approver, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                                            <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-[10px] font-bold">
                                                                {idx + 1}
                                                            </div>
                                                            <span>{approver.userName}</span>
                                                            <span className="text-muted-foreground">({approver.role})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        <Separator />
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {document.title}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Badge variant="outline" className="text-[10px]">
                                                    {document.category}
                                                </Badge>
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Reason */}
                                <div className="space-y-2">
                                    <Label className="text-sm">
                                        Motif du désarchivage
                                        {mode === 'workflow' && <span className="text-red-500 ml-0.5">*</span>}
                                    </Label>
                                    <Textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder={
                                            mode === 'direct'
                                                ? 'Raison du désarchivage (optionnel)...'
                                                : 'Expliquez pourquoi ce document doit être désarchivé...'
                                        }
                                        rows={3}
                                        className="resize-none"
                                    />
                                </div>

                                {mode === 'workflow' && (
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-muted-foreground">
                                            Une notification sera envoyée aux approbateurs. Le document sera
                                            restauré uniquement après validation du circuit.
                                        </p>
                                    </div>
                                )}

                                {/* Submit */}
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || (mode === 'workflow' && !reason.trim())}
                                        className={cn(
                                            mode === 'direct'
                                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                                : 'bg-amber-500 hover:bg-amber-600'
                                        )}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Traitement...
                                            </>
                                        ) : mode === 'direct' ? (
                                            <>
                                                <ArchiveRestore className="h-4 w-4 mr-2" />
                                                Désarchiver maintenant
                                            </>
                                        ) : (
                                            <>
                                                <GitBranch className="h-4 w-4 mr-2" />
                                                Soumettre la demande
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default UnarchiveDialog;
