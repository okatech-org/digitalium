/**
 * Workflows - Signature workflow templates management
 *
 * Connected to signatureService backend
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Workflow,
    Plus,
    MoreVertical,
    Edit,
    Copy,
    Trash2,
    Play,
    Clock,
    ChevronRight,
    Zap,
    Settings,
    Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import signatureService, {
    type SignatureWorkflow,
    type SignatureWorkflowStep,
} from '@/lib/signatureService';
import { useToast } from '@/hooks/use-toast';

export default function Workflows() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [workflows, setWorkflows] = useState<SignatureWorkflow[]>([]);
    const [steps, setSteps] = useState<SignatureWorkflowStep[]>([]);
    const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await signatureService.getWorkflows();
            setWorkflows(data.workflows);
            setSteps(data.steps);
        } catch (error) {
            console.error('Failed to load workflows:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les workflows.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getWorkflowSteps = (workflowId: string) =>
        steps.filter(s => s.workflow_id === workflowId).sort((a, b) => a.step_order - b.step_order);

    const handleDelete = async () => {
        if (!workflowToDelete) return;
        try {
            await signatureService.deleteWorkflow(workflowToDelete);
            toast({ title: 'Workflow supprim\u00E9', description: 'Le workflow a \u00E9t\u00E9 supprim\u00E9.' });
            setWorkflowToDelete(null);
            loadData();
        } catch (error) {
            console.error('Failed to delete workflow:', error);
            toast({ title: 'Erreur', description: 'Impossible de supprimer le workflow.', variant: 'destructive' });
        }
    };

    const handleToggleStatus = async (workflowId: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await signatureService.updateWorkflow(workflowId, { status: newStatus });
            toast({ title: newStatus === 'active' ? 'Workflow activ\u00E9' : 'Workflow d\u00E9sactiv\u00E9' });
            loadData();
        } catch (error) {
            console.error('Failed to toggle workflow:', error);
            toast({ title: 'Erreur', description: 'Impossible de modifier le workflow.', variant: 'destructive' });
        }
    };

    const activeWorkflows = workflows.filter(w => w.status === 'active');
    const inactiveWorkflows = workflows.filter(w => w.status === 'inactive');
    const totalUsage = workflows.reduce((acc, w) => acc + w.usage_count, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Workflows de signature</h2>
                    <p className="text-sm text-muted-foreground">
                        Mod\u00E8les de circuits de signature r\u00E9utilisables
                    </p>
                </div>
                <Button className="bg-purple-500 hover:bg-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau workflow
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Workflow className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{activeWorkflows.length}</p>
                                <p className="text-sm text-muted-foreground">Workflows actifs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Zap className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalUsage}</p>
                                <p className="text-sm text-muted-foreground">Utilisations totales</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Clock className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">-</p>
                                <p className="text-sm text-muted-foreground">Temps moyen</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Workflows */}
            {activeWorkflows.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Actifs ({activeWorkflows.length})
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {activeWorkflows.map((workflow, i) => {
                            const wfSteps = getWorkflowSteps(workflow.id);
                            return (
                                <motion.div key={workflow.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}>
                                    <Card className="group hover:border-purple-500/30 transition-all h-full">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                                        <Workflow className="h-5 w-5 text-purple-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">{workflow.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem><Play className="h-4 w-4 mr-2" />Lancer</DropdownMenuItem>
                                                        <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Modifier</DropdownMenuItem>
                                                        <DropdownMenuItem><Copy className="h-4 w-4 mr-2" />Dupliquer</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-500" onClick={() => setWorkflowToDelete(workflow.id)}>
                                                            <Trash2 className="h-4 w-4 mr-2" />Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center gap-1 mb-3 overflow-x-auto py-1">
                                                {wfSteps.map((step, j) => (
                                                    <React.Fragment key={j}>
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs whitespace-nowrap">
                                                            <Avatar className="h-4 w-4">
                                                                <AvatarFallback className="text-[8px]">
                                                                    {step.role.slice(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span>{step.role}</span>
                                                        </div>
                                                        {j < wfSteps.length - 1 && (
                                                            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{workflow.usage_count} utilisations</span>
                                                <span>
                                                    {workflow.last_used_at
                                                        ? `Derni\u00E8re: ${new Date(workflow.last_used_at).toLocaleDateString('fr-FR')}`
                                                        : 'Jamais utilis\u00E9'}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Inactive Workflows */}
            {inactiveWorkflows.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Inactifs ({inactiveWorkflows.length})
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {inactiveWorkflows.map((workflow) => (
                            <Card key={workflow.id} className="opacity-60">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <Workflow className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{workflow.name}</h4>
                                            <p className="text-sm text-muted-foreground">{workflow.description}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(workflow.id, workflow.status)}>
                                            <Settings className="h-4 w-4 mr-1" />
                                            Activer
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {workflows.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                        <div className="p-4 rounded-full bg-purple-500/10 w-fit mx-auto mb-4">
                            <Workflow className="h-10 w-10 text-purple-500/50" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Aucun workflow configur\u00E9</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                            Cr\u00E9ez des circuits de signature r\u00E9utilisables pour automatiser vos processus.
                        </p>
                        <Button className="bg-purple-500 hover:bg-purple-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Cr\u00E9er votre premier workflow
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!workflowToDelete} onOpenChange={() => setWorkflowToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce workflow ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irr\u00E9versible. Le workflow sera d\u00E9finitivement supprim\u00E9
                            et ne pourra plus \u00EAtre utilis\u00E9 pour de nouvelles signatures.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleDelete}>
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
