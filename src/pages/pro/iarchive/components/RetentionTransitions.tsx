/**
 * RetentionTransitions Component
 * 
 * Manages automatic retention phase transitions:
 * Active → Semi-Active → Final Disposition
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
    ArrowRight,
    Clock,
    Archive,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Play,
    Pause,
    RefreshCw,
    FileText,
    Folder,
    Settings,
    Calendar,
    Layers
} from 'lucide-react';

// Types  
export type RetentionPhase = 'active' | 'semi_active' | 'final';

export interface TransitionQueue {
    id: string;
    documentId: string;
    documentTitle: string;
    documentReference?: string;
    folderPath: string;
    currentPhase: RetentionPhase;
    targetPhase: RetentionPhase;
    retentionCategory: string;
    scheduledFor: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    completedAt?: Date;
}

interface RetentionTransitionsProps {
    queuedTransitions?: TransitionQueue[];
    onProcessTransition?: (transitionId: string) => Promise<void>;
    onProcessAll?: () => Promise<void>;
    onCancelTransition?: (transitionId: string) => Promise<void>;
}

const PHASE_CONFIG: Record<RetentionPhase, { label: string; color: string; icon: React.ReactNode }> = {
    active: { label: 'Actif', color: 'bg-green-500', icon: <FileText className="h-4 w-4" /> },
    semi_active: { label: 'Semi-actif', color: 'bg-blue-500', icon: <Archive className="h-4 w-4" /> },
    final: { label: 'Sort final', color: 'bg-amber-500', icon: <Trash2 className="h-4 w-4" /> },
};

// Demo data
const DEMO_TRANSITIONS: TransitionQueue[] = [
    {
        id: 'trans-1',
        documentId: 'doc-1',
        documentTitle: 'Factures Q1 2023',
        documentReference: 'FAC-2023-Q1',
        folderPath: '/Documents/Comptabilité/2023',
        currentPhase: 'active',
        targetPhase: 'semi_active',
        retentionCategory: 'FIS-01',
        scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'pending',
    },
    {
        id: 'trans-2',
        documentId: 'doc-2',
        documentTitle: 'Rapports mensuels 2022',
        folderPath: '/Documents/Rapports/2022',
        currentPhase: 'active',
        targetPhase: 'semi_active',
        retentionCategory: 'PRJ-01',
        scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'pending',
    },
    {
        id: 'trans-3',
        documentId: 'doc-3',
        documentTitle: 'Contrats expirés 2018',
        documentReference: 'CTR-2018-BATCH',
        folderPath: '/Archives/Contrats/2018',
        currentPhase: 'semi_active',
        targetPhase: 'final',
        retentionCategory: 'CTR-01',
        scheduledFor: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'processing',
    },
    {
        id: 'trans-4',
        documentId: 'doc-4',
        documentTitle: 'Correspondance 2017',
        folderPath: '/Archives/Courrier/2017',
        currentPhase: 'semi_active',
        targetPhase: 'final',
        retentionCategory: 'COR-01',
        scheduledFor: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'completed',
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'trans-5',
        documentId: 'doc-5',
        documentTitle: 'Dossiers projet Alpha',
        folderPath: '/Archives/Projets/Alpha',
        currentPhase: 'active',
        targetPhase: 'semi_active',
        retentionCategory: 'PRJ-01',
        scheduledFor: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'failed',
        error: 'Document locked by user',
    },
];

export function RetentionTransitions({
    queuedTransitions = DEMO_TRANSITIONS,
    onProcessTransition,
    onProcessAll,
    onCancelTransition,
}: RetentionTransitionsProps) {
    const [isProcessingAll, setIsProcessingAll] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState<TransitionQueue | null>(null);

    // Group transitions by status
    const pendingTransitions = queuedTransitions.filter(t => t.status === 'pending');
    const processingTransitions = queuedTransitions.filter(t => t.status === 'processing');
    const completedTransitions = queuedTransitions.filter(t => t.status === 'completed');
    const failedTransitions = queuedTransitions.filter(t => t.status === 'failed');

    const handleProcessTransition = async (transitionId: string) => {
        setProcessingId(transitionId);
        if (onProcessTransition) {
            await onProcessTransition(transitionId);
        } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        setProcessingId(null);
    };

    const handleProcessAll = async () => {
        setIsProcessingAll(true);
        if (onProcessAll) {
            await onProcessAll();
        } else {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        setIsProcessingAll(false);
    };

    const TransitionCard = ({ transition }: { transition: TransitionQueue }) => {
        const fromPhase = PHASE_CONFIG[transition.currentPhase];
        const toPhase = PHASE_CONFIG[transition.targetPhase];
        const isOverdue = transition.scheduledFor < new Date() && transition.status === 'pending';

        return (
            <Card className={`${transition.status === 'failed' ? 'border-red-500/50' :
                    isOverdue ? 'border-amber-500/50' :
                        transition.status === 'completed' ? 'border-green-500/30 opacity-70' : ''
                }`}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium truncate">{transition.documentTitle}</span>
                                {transition.documentReference && (
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {transition.documentReference}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Folder className="h-3 w-3" />
                                <span className="truncate">{transition.folderPath}</span>
                            </div>

                            {/* Transition visualization */}
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className={`${fromPhase.color} text-white text-xs`}>
                                    {fromPhase.icon}
                                    <span className="ml-1">{fromPhase.label}</span>
                                </Badge>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <Badge className={`${toPhase.color} text-white text-xs`}>
                                    {toPhase.icon}
                                    <span className="ml-1">{toPhase.label}</span>
                                </Badge>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Layers className="h-3 w-3" />
                                    {transition.retentionCategory}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {transition.scheduledFor.toLocaleDateString('fr-FR')}
                                </span>
                                {transition.status === 'completed' && (
                                    <Badge variant="secondary" className="text-xs text-green-500">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Terminé
                                    </Badge>
                                )}
                                {transition.status === 'processing' && (
                                    <Badge variant="secondary" className="text-xs text-blue-500">
                                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                        En cours
                                    </Badge>
                                )}
                                {transition.status === 'failed' && (
                                    <Badge variant="destructive" className="text-xs">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Échec
                                    </Badge>
                                )}
                                {isOverdue && transition.status === 'pending' && (
                                    <Badge className="bg-amber-500 text-xs">
                                        En retard
                                    </Badge>
                                )}
                            </div>

                            {transition.status === 'failed' && transition.error && (
                                <p className="text-xs text-red-500 mt-2">
                                    Erreur: {transition.error}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            {transition.status === 'pending' && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleProcessTransition(transition.id)}
                                        disabled={processingId === transition.id}
                                    >
                                        {processingId === transition.id ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Play className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => onCancelTransition?.(transition.id)}
                                    >
                                        <Pause className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            {transition.status === 'failed' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleProcessTransition(transition.id)}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
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
                                <Settings className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Transitions de Rétention</CardTitle>
                                <CardDescription>
                                    Gestion automatique des phases de conservation
                                </CardDescription>
                            </div>
                        </div>
                        {pendingTransitions.length > 0 && (
                            <Button onClick={handleProcessAll} disabled={isProcessingAll}>
                                {isProcessingAll ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Traitement...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4 mr-2" />
                                        Traiter tout ({pendingTransitions.length})
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Pipeline visualization */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="p-3 rounded-full bg-green-500/10 w-fit mx-auto mb-2">
                            <FileText className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="text-sm font-medium">Phase Active</p>
                        <p className="text-xs text-muted-foreground">Documents en usage courant</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                            <Badge variant="outline">{DEMO_TRANSITIONS.filter(t => t.currentPhase === 'active').length} docs</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="p-3 rounded-full bg-blue-500/10 w-fit mx-auto mb-2">
                            <Archive className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-sm font-medium">Phase Semi-Active</p>
                        <p className="text-xs text-muted-foreground">Archivage intermédiaire</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                            <Badge variant="outline">{DEMO_TRANSITIONS.filter(t => t.currentPhase === 'semi_active').length} docs</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="p-3 rounded-full bg-amber-500/10 w-fit mx-auto mb-2">
                            <Trash2 className="h-6 w-6 text-amber-500" />
                        </div>
                        <p className="text-sm font-medium">Sort Final</p>
                        <p className="text-xs text-muted-foreground">Destruction ou conservation permanente</p>
                    </CardContent>
                </Card>
            </div>

            {/* Queue sections */}
            <div className="grid grid-cols-2 gap-4">
                {/* Pending & Processing */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            File d'attente ({pendingTransitions.length + processingTransitions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <div className="space-y-2 pr-4">
                                {processingTransitions.map(t => <TransitionCard key={t.id} transition={t} />)}
                                {pendingTransitions.map(t => <TransitionCard key={t.id} transition={t} />)}
                                {pendingTransitions.length === 0 && processingTransitions.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <CheckCircle2 className="h-8 w-8 text-green-500/30 mb-2" />
                                        <p className="text-sm text-muted-foreground">Aucune transition en attente</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Completed & Failed */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Historique ({completedTransitions.length + failedTransitions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px]">
                            <div className="space-y-2 pr-4">
                                {failedTransitions.map(t => <TransitionCard key={t.id} transition={t} />)}
                                {completedTransitions.map(t => <TransitionCard key={t.id} transition={t} />)}
                                {completedTransitions.length === 0 && failedTransitions.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <Archive className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-sm text-muted-foreground">Aucun historique</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default RetentionTransitions;
