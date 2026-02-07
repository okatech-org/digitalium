/**
 * CertifiedCopyDialog - Generates a certified copy of an archived document
 * 
 * Replaces the old "unarchive" concept. A document never leaves the archive.
 * Instead, a certified copy is generated with:
 *  - "COPIE CERTIFIÉE CONFORME" watermark
 *  - Unique copy reference number
 *  - Date of extraction
 *  - Original archive reference
 * 
 * The copy can optionally be sent to iDocument for further use.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Copy,
    FileText,
    CheckCircle2,
    ArrowRight,
    Shield,
    Stamp,
    Download,
    FolderInput,
    Loader2,
    Hash,
    Calendar,
    User,
    Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generateCertifiedCopyMetadata } from '@/services/archiveAuditService';
import type { ArchiveDocumentData } from './ArchiveDocumentCard';

interface CertifiedCopyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document: ArchiveDocumentData | null;
    onCopyGenerated?: (copyRef: string, destination: 'download' | 'idocument') => void;
}

export function CertifiedCopyDialog({
    open,
    onOpenChange,
    document,
    onCopyGenerated,
}: CertifiedCopyDialogProps) {
    const [step, setStep] = useState<'form' | 'generating' | 'complete'>('form');
    const [reason, setReason] = useState('');
    const [destination, setDestination] = useState<'download' | 'idocument'>('idocument');
    const [copyResult, setCopyResult] = useState<{
        copyReference: string;
        generatedAt: string;
        watermark: string;
        certifiedBy: string;
        originalRef: string;
    } | null>(null);
    const { toast } = useToast();

    const handleReset = () => {
        setStep('form');
        setReason('');
        setDestination('idocument');
        setCopyResult(null);
    };

    const handleGenerate = async () => {
        if (!document) return;

        setStep('generating');

        // Simulate generation delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const result = generateCertifiedCopyMetadata(document.id, document.title);
        setCopyResult(result);
        setStep('complete');

        onCopyGenerated?.(result.copyReference, destination);
    };

    const handleClose = (open: boolean) => {
        if (!open) handleReset();
        onOpenChange(open);
    };

    if (!document) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Copy className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogHeader>
                                <DialogTitle className="text-white text-lg font-semibold">
                                    Copie Certifiée Conforme
                                </DialogTitle>
                            </DialogHeader>
                            <p className="text-white/80 text-sm">
                                Génération d'une copie traçable
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress indicator */}
                <div className="px-6 pt-4 pb-2">
                    <div className="flex items-center gap-2">
                        {['form', 'generating', 'complete'].map((s, i) => (
                            <React.Fragment key={s}>
                                <div className={cn(
                                    'h-2 flex-1 rounded-full transition-colors',
                                    step === s ? 'bg-purple-500' :
                                        ['form', 'generating', 'complete'].indexOf(step) > i
                                            ? 'bg-purple-300' : 'bg-gray-200'
                                )} />
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'form' && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="px-6 pb-6 space-y-4"
                        >
                            {/* Document info */}
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                                <FileText className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-medium text-sm line-clamp-2">{document.title}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <span className="font-mono flex items-center gap-1">
                                            <Hash className="h-3 w-3" />
                                            {document.reference}
                                        </span>
                                        <span>•</span>
                                        <span>{document.size}</span>
                                    </div>
                                </div>
                                <Badge className="bg-red-600 text-white text-[10px] shrink-0">PDF/A</Badge>
                            </div>

                            {/* Notice */}
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                                <Stamp className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                <p className="text-xs text-amber-800 dark:text-amber-200">
                                    La copie portera la mention <strong>"COPIE CERTIFIÉE CONFORME"</strong> avec
                                    un numéro de référence unique et la date d'extraction. L'original reste
                                    inaltérable dans les archives.
                                </p>
                            </div>

                            {/* Reason */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Motif de la copie <span className="text-muted-foreground">(optionnel)</span>
                                </Label>
                                <Textarea
                                    placeholder="Ex: Demande de la direction pour dossier de subvention..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={2}
                                    className="resize-none"
                                />
                            </div>

                            {/* Destination */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Destination de la copie</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDestination('idocument')}
                                        className={cn(
                                            'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all text-center',
                                            destination === 'idocument'
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                : 'border-border hover:border-purple-300'
                                        )}
                                    >
                                        <FolderInput className={cn(
                                            'h-5 w-5',
                                            destination === 'idocument' ? 'text-purple-600' : 'text-muted-foreground'
                                        )} />
                                        <div>
                                            <p className="text-xs font-medium">Envoyer vers iDocument</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                Copie disponible dans votre espace
                                            </p>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDestination('download')}
                                        className={cn(
                                            'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all text-center',
                                            destination === 'download'
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                : 'border-border hover:border-purple-300'
                                        )}
                                    >
                                        <Download className={cn(
                                            'h-5 w-5',
                                            destination === 'download' ? 'text-purple-600' : 'text-muted-foreground'
                                        )} />
                                        <div>
                                            <p className="text-xs font-medium">Télécharger</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                Téléchargement direct
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => handleClose(false)}>
                                    Annuler
                                </Button>
                                <Button
                                    className="bg-purple-600 hover:bg-purple-700"
                                    onClick={handleGenerate}
                                >
                                    Générer la copie
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'generating' && (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-6 pb-6 flex flex-col items-center gap-4 py-8"
                        >
                            <div className="relative">
                                <div className="h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                                </div>
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="font-semibold text-lg">Génération en cours...</h3>
                                <p className="text-sm text-muted-foreground">
                                    Conversion PDF/A et application du filigrane
                                </p>
                            </div>
                            <div className="w-full max-w-xs space-y-1">
                                <motion.div
                                    className="h-1.5 bg-purple-200 rounded-full overflow-hidden"
                                >
                                    <motion.div
                                        className="h-full bg-purple-500 rounded-full"
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                                    />
                                </motion.div>
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>Vérification intégrité</span>
                                    <span>Filigrane</span>
                                    <span>Finalisation</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'complete' && copyResult && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-6 pb-6 space-y-4"
                        >
                            {/* Success indicator */}
                            <div className="flex flex-col items-center gap-3 py-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                                >
                                    <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <CheckCircle2 className="h-7 w-7 text-green-600" />
                                    </div>
                                </motion.div>
                                <h3 className="font-semibold text-lg">Copie générée avec succès</h3>
                            </div>

                            {/* Copy details */}
                            <div className="space-y-2 bg-muted/50 border rounded-lg p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Hash className="h-3.5 w-3.5" />
                                        Référence copie
                                    </span>
                                    <span className="font-mono font-medium text-purple-600">
                                        {copyResult.copyReference}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Date d'extraction
                                    </span>
                                    <span className="text-sm">
                                        {new Date(copyResult.generatedAt).toLocaleDateString('fr-FR', {
                                            day: '2-digit', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5" />
                                        Certifiée par
                                    </span>
                                    <span className="text-sm font-medium">{copyResult.certifiedBy}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5" />
                                        Réf. originale
                                    </span>
                                    <span className="font-mono text-sm">{copyResult.originalRef}</span>
                                </div>
                            </div>

                            {/* Watermark preview */}
                            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                                <p className="text-[10px] text-purple-600 font-mono text-center font-bold tracking-wider">
                                    {copyResult.watermark}
                                </p>
                            </div>

                            {/* Destination info */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {destination === 'idocument' ? (
                                    <>
                                        <FolderInput className="h-4 w-4 text-purple-600" />
                                        <span>Copie envoyée vers <strong className="text-foreground">iDocument</strong></span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 text-purple-600" />
                                        <span>Copie prête au téléchargement</span>
                                    </>
                                )}
                            </div>

                            {/* Close button */}
                            <div className="flex justify-end pt-2">
                                <Button onClick={() => handleClose(false)}>
                                    Fermer
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
