/**
 * ApprovalWorkflow Component
 * 
 * Multi-level approval workflow for documents.
 * Supports sequential and parallel approval chains.
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Users,
    GitBranch,
    ArrowRight,
    Plus,
    Trash2,
    Play,
    Pause,
    RotateCcw,
    MessageSquare,
    FileText,
    Settings,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

// Types
export type ApprovalStepType = 'sequential' | 'parallel' | 'any';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'skipped';
export type WorkflowStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface Approver {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar?: string;
    role?: string;
    status: ApprovalStatus;
    decidedAt?: Date;
    comment?: string;
}

export interface ApprovalStep {
    id: string;
    stepNumber: number;
    name: string;
    description?: string;
    type: ApprovalStepType;
    approvers: Approver[];
    requiredApprovals?: number; // For 'any' type
    deadline?: Date;
    isActive: boolean;
    completedAt?: Date;
}

export interface ApprovalWorkflowData {
    id: string;
    documentId: string;
    documentTitle: string;
    name: string;
    description?: string;
    status: WorkflowStatus;
    steps: ApprovalStep[];
    currentStepIndex: number;
    initiatedBy: string;
    initiatedByName: string;
    initiatedAt: Date;
    completedAt?: Date;
    dueDate?: Date;
}

interface ApprovalWorkflowProps {
    workflow?: ApprovalWorkflowData;
    documentId?: string;
    documentTitle?: string;
    currentUserId?: string;
    onApprove?: (stepId: string, comment?: string) => Promise<void>;
    onReject?: (stepId: string, comment: string) => Promise<void>;
    onCreateWorkflow?: (workflow: Partial<ApprovalWorkflowData>) => Promise<void>;
    onCancelWorkflow?: (workflowId: string) => Promise<void>;
}

const STATUS_CONFIG: Record<ApprovalStatus, { icon: React.ReactNode; label: string; color: string }> = {
    pending: { icon: <Clock className="h-4 w-4" />, label: 'En attente', color: 'text-amber-500' },
    approved: { icon: <CheckCircle2 className="h-4 w-4" />, label: 'Approuvé', color: 'text-green-500' },
    rejected: { icon: <XCircle className="h-4 w-4" />, label: 'Rejeté', color: 'text-red-500' },
    skipped: { icon: <ArrowRight className="h-4 w-4" />, label: 'Ignoré', color: 'text-muted-foreground' },
};

const WORKFLOW_STATUS_CONFIG: Record<WorkflowStatus, { label: string; color: string }> = {
    draft: { label: 'Brouillon', color: 'bg-gray-500/10 text-gray-500' },
    active: { label: 'En cours', color: 'bg-blue-500/10 text-blue-500' },
    completed: { label: 'Terminé', color: 'bg-green-500/10 text-green-500' },
    cancelled: { label: 'Annulé', color: 'bg-red-500/10 text-red-500' },
};

// Demo data
const DEMO_WORKFLOW: ApprovalWorkflowData = {
    id: 'wf-1',
    documentId: 'doc-1',
    documentTitle: 'Contrat de partenariat 2026',
    name: 'Validation contrat standard',
    description: 'Circuit de validation pour les contrats de partenariat',
    status: 'active',
    currentStepIndex: 1,
    initiatedBy: 'user-1',
    initiatedByName: 'Jean Dupont',
    initiatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    steps: [
        {
            id: 'step-1',
            stepNumber: 1,
            name: 'Validation juridique',
            description: 'Vérification de la conformité légale',
            type: 'sequential',
            isActive: false,
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            approvers: [
                {
                    id: 'app-1',
                    userId: 'user-legal',
                    userName: 'Marie Legal',
                    userEmail: 'marie.legal@company.com',
                    role: 'Responsable Juridique',
                    status: 'approved',
                    decidedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    comment: 'Conforme aux normes en vigueur',
                },
            ],
        },
        {
            id: 'step-2',
            stepNumber: 2,
            name: 'Validation finance',
            description: 'Vérification budgétaire',
            type: 'parallel',
            isActive: true,
            approvers: [
                {
                    id: 'app-2',
                    userId: 'user-finance-1',
                    userName: 'Pierre Finance',
                    userEmail: 'pierre.finance@company.com',
                    role: 'Contrôleur de gestion',
                    status: 'approved',
                    decidedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                    comment: 'Budget validé',
                },
                {
                    id: 'app-3',
                    userId: 'user-finance-2',
                    userName: 'Sophie Compta',
                    userEmail: 'sophie.compta@company.com',
                    role: 'Comptable',
                    status: 'pending',
                },
            ],
        },
        {
            id: 'step-3',
            stepNumber: 3,
            name: 'Signature Direction',
            description: 'Approbation finale par la direction',
            type: 'any',
            requiredApprovals: 1,
            isActive: false,
            approvers: [
                {
                    id: 'app-4',
                    userId: 'user-dir-1',
                    userName: 'Paul Directeur',
                    userEmail: 'paul.directeur@company.com',
                    role: 'Directeur Général',
                    status: 'pending',
                },
                {
                    id: 'app-5',
                    userId: 'user-dir-2',
                    userName: 'Anne Sous-Dir',
                    userEmail: 'anne.sousdir@company.com',
                    role: 'Directrice Adjointe',
                    status: 'pending',
                },
            ],
        },
    ],
};

export function ApprovalWorkflow({
    workflow = DEMO_WORKFLOW,
    documentId,
    documentTitle,
    currentUserId = 'user-finance-2',
    onApprove,
    onReject,
    onCreateWorkflow,
    onCancelWorkflow,
}: ApprovalWorkflowProps) {
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [selectedStep, setSelectedStep] = useState<ApprovalStep | null>(null);
    const [comment, setComment] = useState('');
    const [expandedSteps, setExpandedSteps] = useState<string[]>(
        workflow.steps.filter(s => s.isActive).map(s => s.id)
    );

    const statusConfig = WORKFLOW_STATUS_CONFIG[workflow.status];

    const toggleStep = (stepId: string) => {
        setExpandedSteps(prev =>
            prev.includes(stepId)
                ? prev.filter(id => id !== stepId)
                : [...prev, stepId]
        );
    };

    const handleApprove = async () => {
        if (selectedStep && onApprove) {
            await onApprove(selectedStep.id, comment);
        }
        setShowApproveDialog(false);
        setComment('');
        setSelectedStep(null);
    };

    const handleReject = async () => {
        if (selectedStep && onReject && comment) {
            await onReject(selectedStep.id, comment);
        }
        setShowRejectDialog(false);
        setComment('');
        setSelectedStep(null);
    };

    const canUserApprove = (step: ApprovalStep): boolean => {
        if (!step.isActive) return false;
        return step.approvers.some(
            a => a.userId === currentUserId && a.status === 'pending'
        );
    };

    const getStepProgress = (step: ApprovalStep): { approved: number; total: number } => {
        const approved = step.approvers.filter(a => a.status === 'approved').length;
        return { approved, total: step.approvers.length };
    };

    const ApproverCard = ({ approver }: { approver: Approver }) => {
        const config = STATUS_CONFIG[approver.status];
        return (
            <div className={`flex items-center justify-between p-3 rounded-lg border ${approver.status === 'approved' ? 'bg-green-500/5 border-green-500/30' :
                    approver.status === 'rejected' ? 'bg-red-500/5 border-red-500/30' :
                        'bg-muted/50'
                }`}>
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={approver.userAvatar} />
                        <AvatarFallback>
                            {approver.userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-sm">{approver.userName}</p>
                        <p className="text-xs text-muted-foreground">{approver.role || approver.userEmail}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-sm ${config.color}`}>
                        {config.icon}
                        {config.label}
                    </span>
                    {approver.decidedAt && (
                        <span className="text-xs text-muted-foreground">
                            {approver.decidedAt.toLocaleDateString('fr-FR')}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <GitBranch className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{workflow.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <FileText className="h-3 w-3" />
                                    {workflow.documentTitle}
                                </CardDescription>
                            </div>
                        </div>
                        <Badge className={statusConfig.color}>
                            {statusConfig.label}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Initié par {workflow.initiatedByName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {workflow.initiatedAt.toLocaleDateString('fr-FR')}
                        </span>
                        {workflow.dueDate && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Échéance: {workflow.dueDate.toLocaleDateString('fr-FR')}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Workflow Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Progression du circuit</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mb-6">
                        {workflow.steps.map((step, idx) => {
                            const progress = getStepProgress(step);
                            const isComplete = step.completedAt ||
                                (step.type === 'any' && progress.approved >= (step.requiredApprovals || 1)) ||
                                (step.type !== 'any' && progress.approved === progress.total);
                            const isRejected = step.approvers.some(a => a.status === 'rejected');

                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className={`flex-1 h-2 rounded-full ${isComplete ? 'bg-green-500' :
                                            isRejected ? 'bg-red-500' :
                                                step.isActive ? 'bg-primary' :
                                                    'bg-muted'
                                        }`} />
                                    {idx < workflow.steps.length - 1 && (
                                        <ArrowRight className="h-4 w-4 mx-1 text-muted-foreground" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Steps list */}
                    <ScrollArea className="h-[400px]">
                        <div className="space-y-3">
                            {workflow.steps.map((step) => {
                                const progress = getStepProgress(step);
                                const isExpanded = expandedSteps.includes(step.id);
                                const canApprove = canUserApprove(step);

                                return (
                                    <div key={step.id} className={`border rounded-lg ${step.isActive ? 'border-primary' : ''
                                        }`}>
                                        <div
                                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30"
                                            onClick={() => toggleStep(step.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                {isExpanded ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completedAt ? 'bg-green-500 text-white' :
                                                        step.isActive ? 'bg-primary text-primary-foreground' :
                                                            'bg-muted'
                                                    }`}>
                                                    {step.stepNumber}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{step.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {step.type === 'sequential' ? 'Séquentiel' :
                                                                step.type === 'parallel' ? 'Parallèle' :
                                                                    `${step.requiredApprovals || 1} sur ${step.approvers.length}`}
                                                        </Badge>
                                                        <span>{progress.approved}/{progress.total} approbations</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {step.isActive && canApprove && (
                                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                                                        onClick={() => {
                                                            setSelectedStep(step);
                                                            setShowRejectDialog(true);
                                                        }}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Rejeter
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-500 hover:bg-green-600"
                                                        onClick={() => {
                                                            setSelectedStep(step);
                                                            setShowApproveDialog(true);
                                                        }}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Approuver
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div className="px-4 pb-4 space-y-2">
                                                {step.description && (
                                                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                                                )}
                                                {step.approvers.map((approver) => (
                                                    <ApproverCard key={approver.id} approver={approver} />
                                                ))}
                                                {step.approvers.some(a => a.comment) && (
                                                    <div className="mt-3 space-y-2">
                                                        {step.approvers.filter(a => a.comment).map((approver) => (
                                                            <div key={`comment-${approver.id}`} className="text-sm p-2 rounded bg-muted/30">
                                                                <span className="font-medium">{approver.userName}:</span>
                                                                <span className="ml-1 text-muted-foreground">{approver.comment}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Approve Dialog */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-500">
                            <CheckCircle2 className="h-5 w-5" />
                            Approuver
                        </DialogTitle>
                        <DialogDescription>
                            Confirmez votre approbation pour l'étape "{selectedStep?.name}"
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Commentaire (optionnel)</Label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Ajoutez un commentaire..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                            Annuler
                        </Button>
                        <Button className="bg-green-500 hover:bg-green-600" onClick={handleApprove}>
                            Confirmer l'approbation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <XCircle className="h-5 w-5" />
                            Rejeter
                        </DialogTitle>
                        <DialogDescription>
                            Indiquez la raison du rejet pour l'étape "{selectedStep?.name}"
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Raison du rejet *</Label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Expliquez pourquoi vous rejetez ce document..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!comment.trim()}
                        >
                            Confirmer le rejet
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ApprovalWorkflow;
