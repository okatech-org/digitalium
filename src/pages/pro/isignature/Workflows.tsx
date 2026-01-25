/**
 * Workflows - Signature workflow templates management
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Workflow,
    Plus,
    Users,
    FileText,
    MoreVertical,
    Edit,
    Copy,
    Trash2,
    Play,
    Clock,
    ChevronRight,
    Zap,
    Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';

// Mock data
const MOCK_WORKFLOWS = [
    {
        id: '1',
        name: 'Contrat Commercial Standard',
        description: 'Workflow pour les contrats clients avec validation juridique',
        steps: [
            { role: 'Commercial', action: 'Initie' },
            { role: 'Client', action: 'Signe' },
            { role: 'Juridique', action: 'Valide' },
            { role: 'Direction', action: 'Approuve' },
        ],
        usageCount: 45,
        lastUsed: '22/01/2026',
        active: true,
    },
    {
        id: '2',
        name: 'Contrat Employé',
        description: 'Recrutement et onboarding avec double validation RH',
        steps: [
            { role: 'RH', action: 'Initie' },
            { role: 'Candidat', action: 'Signe' },
            { role: 'Manager', action: 'Valide' },
            { role: 'RH', action: 'Finalise' },
        ],
        usageCount: 23,
        lastUsed: '20/01/2026',
        active: true,
    },
    {
        id: '3',
        name: 'Bon de Commande Rapide',
        description: 'Validation express pour commandes < 5000€',
        steps: [
            { role: 'Demandeur', action: 'Crée' },
            { role: 'Achats', action: 'Valide' },
            { role: 'Fournisseur', action: 'Confirme' },
        ],
        usageCount: 89,
        lastUsed: '24/01/2026',
        active: true,
    },
    {
        id: '4',
        name: 'NDA Partenaire',
        description: 'Accord de confidentialité bilatéral',
        steps: [
            { role: 'Initiateur', action: 'Propose' },
            { role: 'Juridique', action: 'Révise' },
            { role: 'Partenaire', action: 'Signe' },
            { role: 'Direction', action: 'Contresigne' },
        ],
        usageCount: 12,
        lastUsed: '15/01/2026',
        active: true,
    },
    {
        id: '5',
        name: 'Avenant Contrat',
        description: 'Modification de contrat existant',
        steps: [
            { role: 'Partie A', action: 'Propose' },
            { role: 'Partie B', action: 'Accepte' },
        ],
        usageCount: 8,
        lastUsed: '10/01/2026',
        active: false,
    },
];

export default function Workflows() {
    const [workflows] = useState(MOCK_WORKFLOWS);
    const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
    const activeWorkflows = workflows.filter(w => w.active);
    const inactiveWorkflows = workflows.filter(w => !w.active);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Workflows de signature</h2>
                    <p className="text-sm text-muted-foreground">
                        Modèles de circuits de signature réutilisables
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
                                <p className="text-2xl font-bold">
                                    {workflows.reduce((acc, w) => acc + w.usageCount, 0)}
                                </p>
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
                                <p className="text-2xl font-bold">2.3j</p>
                                <p className="text-sm text-muted-foreground">Temps moyen</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Workflows */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Actifs ({activeWorkflows.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {activeWorkflows.map((workflow, i) => (
                        <motion.div
                            key={workflow.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="group hover:border-purple-500/30 transition-all h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-purple-500/10">
                                                <Workflow className="h-5 w-5 text-purple-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{workflow.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {workflow.description}
                                                </p>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Play className="h-4 w-4 mr-2" />
                                                    Lancer
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Dupliquer
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-500"
                                                    onClick={() => setWorkflowToDelete(workflow.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Workflow Steps */}
                                    <div className="flex items-center gap-1 mb-3 overflow-x-auto py-1">
                                        {workflow.steps.map((step, j) => (
                                            <React.Fragment key={j}>
                                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs whitespace-nowrap">
                                                    <Avatar className="h-4 w-4">
                                                        <AvatarFallback className="text-[8px]">
                                                            {step.role.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{step.role}</span>
                                                </div>
                                                {j < workflow.steps.length - 1 && (
                                                    <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{workflow.usageCount} utilisations</span>
                                        <span>Dernière: {workflow.lastUsed}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

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
                                        <Button variant="ghost" size="sm">
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
                        <h3 className="text-lg font-medium mb-2">Aucun workflow configuré</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                            Créez des circuits de signature réutilisables pour automatiser vos processus.
                        </p>
                        <Button className="bg-purple-500 hover:bg-purple-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Créer votre premier workflow
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
                            Cette action est irréversible. Le workflow sera définitivement supprimé
                            et ne pourra plus être utilisé pour de nouvelles signatures.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => {
                                // Handle delete logic here
                                console.log('Deleting workflow:', workflowToDelete);
                                setWorkflowToDelete(null);
                            }}
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
