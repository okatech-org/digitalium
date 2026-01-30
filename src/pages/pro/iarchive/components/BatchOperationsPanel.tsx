/**
 * BatchOperationsPanel Component
 * 
 * Allows performing batch operations on multiple documents/folders:
 * - Lock/Unlock (Gel/Dégel)
 * - Block/Unblock sharing
 * - Apply redaction
 * - Apply permissions
 * - Delete/Restore
 * - Move to folder
 * - Change status
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Lock,
    Unlock,
    Share2,
    ShareOff,
    Trash2,
    RotateCcw,
    FolderInput,
    CheckCircle2,
    XCircle,
    Loader2,
    FileText,
    PlayCircle,
    AlertTriangle,
    ChevronRight,
    Eye,
    EyeOff
} from 'lucide-react';

// Types
export type BatchOperationType =
    | 'lock'
    | 'unlock'
    | 'block_sharing'
    | 'unblock_sharing'
    | 'apply_redaction'
    | 'apply_permissions'
    | 'delete'
    | 'restore'
    | 'move'
    | 'change_status';

export interface BatchOperationConfig {
    type: BatchOperationType;
    label: string;
    description: string;
    icon: React.ReactNode;
    variant: 'default' | 'destructive' | 'warning';
    requiresConfirmation: boolean;
}

export interface SelectedDocument {
    id: string;
    title: string;
    type: string;
    isLocked?: boolean;
    sharingBlocked?: boolean;
}

export interface BatchOperationResult {
    documentId: string;
    success: boolean;
    error?: string;
}

interface BatchOperationsPanelProps {
    selectedDocuments: SelectedDocument[];
    onOperationComplete?: (operation: BatchOperationType, results: BatchOperationResult[]) => void;
    onClearSelection?: () => void;
}

const BATCH_OPERATIONS: BatchOperationConfig[] = [
    {
        type: 'lock',
        label: 'Verrouiller (Gel)',
        description: 'Empêcher toute modification des documents sélectionnés',
        icon: <Lock className="h-4 w-4" />,
        variant: 'warning',
        requiresConfirmation: true,
    },
    {
        type: 'unlock',
        label: 'Déverrouiller',
        description: 'Permettre à nouveau les modifications',
        icon: <Unlock className="h-4 w-4" />,
        variant: 'default',
        requiresConfirmation: false,
    },
    {
        type: 'block_sharing',
        label: 'Bloquer le partage',
        description: 'Empêcher tout partage de ces documents',
        icon: <ShareOff className="h-4 w-4" />,
        variant: 'warning',
        requiresConfirmation: true,
    },
    {
        type: 'unblock_sharing',
        label: 'Autoriser le partage',
        description: 'Rétablir la possibilité de partager',
        icon: <Share2 className="h-4 w-4" />,
        variant: 'default',
        requiresConfirmation: false,
    },
    {
        type: 'delete',
        label: 'Supprimer',
        description: 'Déplacer vers la corbeille',
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'destructive',
        requiresConfirmation: true,
    },
    {
        type: 'restore',
        label: 'Restaurer',
        description: 'Récupérer depuis la corbeille',
        icon: <RotateCcw className="h-4 w-4" />,
        variant: 'default',
        requiresConfirmation: false,
    },
    {
        type: 'move',
        label: 'Déplacer',
        description: 'Transférer vers un autre dossier',
        icon: <FolderInput className="h-4 w-4" />,
        variant: 'default',
        requiresConfirmation: false,
    },
];

// Demo folders for move operation
const DEMO_FOLDERS = [
    { id: 'folder-1', name: 'Archive Fiscale', path: '/Archive/Fiscal' },
    { id: 'folder-2', name: 'Archive RH', path: '/Archive/RH' },
    { id: 'folder-3', name: 'Archive Juridique', path: '/Archive/Juridique' },
    { id: 'folder-4', name: 'Documents Actifs', path: '/Documents/Actifs' },
];

export function BatchOperationsPanel({
    selectedDocuments,
    onOperationComplete,
    onClearSelection,
}: BatchOperationsPanelProps) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [currentOperation, setCurrentOperation] = useState<BatchOperationType | null>(null);
    const [operationStatus, setOperationStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<BatchOperationResult[]>([]);
    const [operationReason, setOperationReason] = useState('');
    const [targetFolderId, setTargetFolderId] = useState('');

    const handleOperationClick = (operation: BatchOperationConfig) => {
        if (selectedDocuments.length === 0) return;

        setCurrentOperation(operation.type);
        if (operation.requiresConfirmation) {
            setShowConfirmDialog(true);
        } else if (operation.type === 'move') {
            setShowConfirmDialog(true);
        } else {
            executeOperation(operation.type);
        }
    };

    const executeOperation = async (operationType: BatchOperationType) => {
        setOperationStatus('running');
        setProgress(0);
        setResults([]);

        const operationResults: BatchOperationResult[] = [];
        const total = selectedDocuments.length;

        for (let i = 0; i < total; i++) {
            const doc = selectedDocuments[i];

            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

            // Simulate success/failure (95% success rate for demo)
            const success = Math.random() > 0.05;

            operationResults.push({
                documentId: doc.id,
                success,
                error: success ? undefined : 'Erreur de permission',
            });

            setProgress(((i + 1) / total) * 100);
            setResults([...operationResults]);
        }

        setOperationStatus(operationResults.every(r => r.success) ? 'completed' : 'error');

        if (onOperationComplete) {
            onOperationComplete(operationType, operationResults);
        }
    };

    const handleConfirmOperation = () => {
        if (!currentOperation) return;
        setShowConfirmDialog(false);
        executeOperation(currentOperation);
    };

    const resetOperation = () => {
        setOperationStatus('idle');
        setProgress(0);
        setResults([]);
        setCurrentOperation(null);
        setOperationReason('');
        setTargetFolderId('');
    };

    const getOperationConfig = (type: BatchOperationType | null): BatchOperationConfig | undefined => {
        if (!type) return undefined;
        return BATCH_OPERATIONS.find(op => op.type === type);
    };

    const currentConfig = getOperationConfig(currentOperation);
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    if (selectedDocuments.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-center">
                        Sélectionnez des documents pour effectuer des opérations en lot.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Selection summary */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Opérations en Lot</CardTitle>
                            <CardDescription>
                                {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} sélectionné{selectedDocuments.length > 1 ? 's' : ''}
                            </CardDescription>
                        </div>
                        {onClearSelection && (
                            <Button variant="ghost" size="sm" onClick={onClearSelection}>
                                Effacer la sélection
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-24">
                        <div className="space-y-1">
                            {selectedDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-muted/50"
                                >
                                    <span className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        {doc.title}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {doc.isLocked && (
                                            <Lock className="h-3 w-3 text-amber-500" />
                                        )}
                                        {doc.sharingBlocked && (
                                            <EyeOff className="h-3 w-3 text-red-500" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Operation buttons */}
            {operationStatus === 'idle' && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Actions disponibles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                            {BATCH_OPERATIONS.map((operation) => (
                                <Button
                                    key={operation.type}
                                    variant={operation.variant === 'destructive' ? 'destructive' :
                                        operation.variant === 'warning' ? 'outline' : 'secondary'}
                                    className={`justify-start ${operation.variant === 'warning' ? 'border-amber-500/50 text-amber-500 hover:bg-amber-500/10' : ''
                                        }`}
                                    onClick={() => handleOperationClick(operation)}
                                >
                                    {operation.icon}
                                    <span className="ml-2">{operation.label}</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Progress indicator */}
            {operationStatus === 'running' && currentConfig && (
                <Card>
                    <CardContent className="py-8">
                        <div className="space-y-4 text-center">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                            <div>
                                <p className="font-medium">{currentConfig.label} en cours...</p>
                                <p className="text-sm text-muted-foreground">
                                    {results.length} / {selectedDocuments.length} documents traités
                                </p>
                            </div>
                            <Progress value={progress} className="w-full" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {(operationStatus === 'completed' || operationStatus === 'error') && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            {operationStatus === 'completed' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                            )}
                            <CardTitle className="text-lg">
                                {operationStatus === 'completed' ? 'Opération terminée' : 'Opération terminée avec erreurs'}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Badge variant="default" className="bg-green-500">
                                    {successCount} succès
                                </Badge>
                                {errorCount > 0 && (
                                    <Badge variant="destructive">
                                        {errorCount} erreur{errorCount > 1 ? 's' : ''}
                                    </Badge>
                                )}
                            </div>

                            <ScrollArea className="h-32">
                                <div className="space-y-1">
                                    {results.map((result, index) => {
                                        const doc = selectedDocuments.find(d => d.id === result.documentId);
                                        return (
                                            <div
                                                key={result.documentId}
                                                className={`flex items-center justify-between text-sm py-1 px-2 rounded ${result.success ? 'bg-green-500/10' : 'bg-red-500/10'
                                                    }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {result.success ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                    {doc?.title || `Document ${index + 1}`}
                                                </span>
                                                {result.error && (
                                                    <span className="text-xs text-red-500">{result.error}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>

                            <div className="flex gap-2">
                                <Button onClick={resetOperation} className="flex-1">
                                    Nouvelle opération
                                </Button>
                                {onClearSelection && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            resetOperation();
                                            onClearSelection();
                                        }}
                                    >
                                        Terminer
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {currentConfig?.icon}
                            Confirmer: {currentConfig?.label}
                        </DialogTitle>
                        <DialogDescription>
                            {currentConfig?.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm">
                                <span className="font-medium">{selectedDocuments.length}</span> document{selectedDocuments.length > 1 ? 's' : ''} sera{selectedDocuments.length > 1 ? 'ont' : ''} affecté{selectedDocuments.length > 1 ? 's' : ''}
                            </p>
                        </div>

                        {currentOperation === 'move' && (
                            <div className="space-y-2">
                                <Label>Dossier de destination</Label>
                                <Select value={targetFolderId} onValueChange={setTargetFolderId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un dossier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DEMO_FOLDERS.map((folder) => (
                                            <SelectItem key={folder.id} value={folder.id}>
                                                <span className="flex items-center gap-2">
                                                    <FolderInput className="h-4 w-4" />
                                                    {folder.name}
                                                    <span className="text-xs text-muted-foreground">
                                                        {folder.path}
                                                    </span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(currentOperation === 'lock' || currentOperation === 'block_sharing' || currentOperation === 'delete') && (
                            <div className="space-y-2">
                                <Label>Raison (recommandé)</Label>
                                <Textarea
                                    placeholder="Précisez la raison de cette action..."
                                    value={operationReason}
                                    onChange={(e) => setOperationReason(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        )}

                        {currentConfig?.variant === 'destructive' && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-500">
                                    Cette action peut être irréversible. Assurez-vous de vouloir continuer.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            variant={currentConfig?.variant === 'destructive' ? 'destructive' : 'default'}
                            onClick={handleConfirmOperation}
                            disabled={currentOperation === 'move' && !targetFolderId}
                        >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Exécuter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default BatchOperationsPanel;
