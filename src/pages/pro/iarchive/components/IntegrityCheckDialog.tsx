/**
 * IntegrityCheckDialog - Visual integrity verification for archived documents
 * 
 * Performs SHA-256 hash comparison between the stored hash and the current hash.
 * Displays animated verification steps and a clear pass/fail result.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Shield,
    ShieldCheck,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    Loader2,
    Hash,
    FileText,
    Clock,
    ArrowDownUp,
    Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { verifyDocumentIntegrity } from '@/services/archiveAuditService';
import type { ArchiveDocumentData } from './ArchiveDocumentCard';

interface IntegrityCheckDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document: ArchiveDocumentData | null;
}

type VerificationStep = 'loading_doc' | 'computing_hash' | 'comparing' | 'result';

export function IntegrityCheckDialog({
    open,
    onOpenChange,
    document,
}: IntegrityCheckDialogProps) {
    const [currentStep, setCurrentStep] = useState<VerificationStep | null>(null);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [currentHash, setCurrentHash] = useState<string>('');
    const [verifiedAt, setVerifiedAt] = useState<string>('');

    const runVerification = useCallback(async () => {
        if (!document) return;

        setCurrentStep('loading_doc');
        await new Promise(r => setTimeout(r, 800));

        setCurrentStep('computing_hash');
        await new Promise(r => setTimeout(r, 1200));

        setCurrentStep('comparing');
        await new Promise(r => setTimeout(r, 600));

        // Perform verification
        const result = verifyDocumentIntegrity(document.id, document.hash);
        setIsValid(result.isValid);
        setCurrentHash(result.currentHash);
        setVerifiedAt(result.verifiedAt);

        setCurrentStep('result');
    }, [document]);

    useEffect(() => {
        if (open && document) {
            setCurrentStep(null);
            setIsValid(null);
            setCurrentHash('');
            // Start verification after a brief delay
            const timer = setTimeout(() => runVerification(), 300);
            return () => clearTimeout(timer);
        }
    }, [open, document, runVerification]);

    const steps: { key: VerificationStep; label: string }[] = [
        { key: 'loading_doc', label: 'Chargement du document' },
        { key: 'computing_hash', label: 'Calcul de l\'empreinte SHA-256' },
        { key: 'comparing', label: 'Comparaison des empreintes' },
        { key: 'result', label: 'Résultat' },
    ];

    const getStepIndex = (step: VerificationStep | null) => {
        if (!step) return -1;
        return steps.findIndex(s => s.key === step);
    };

    if (!document) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
                {/* Header */}
                <div className={cn(
                    'px-6 py-4 transition-colors duration-500',
                    currentStep === 'result' && isValid
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                        : currentStep === 'result' && !isValid
                            ? 'bg-gradient-to-r from-red-600 to-rose-600'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600'
                )}>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            {currentStep === 'result' ? (
                                isValid ? (
                                    <ShieldCheck className="h-5 w-5 text-white" />
                                ) : (
                                    <ShieldAlert className="h-5 w-5 text-white" />
                                )
                            ) : (
                                <Shield className="h-5 w-5 text-white" />
                            )}
                        </div>
                        <div>
                            <DialogHeader>
                                <DialogTitle className="text-white text-lg font-semibold">
                                    Vérification d'Intégrité
                                </DialogTitle>
                            </DialogHeader>
                            <p className="text-white/80 text-sm">
                                Contrôle SHA-256 du document archivé
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 space-y-5 pt-4">
                    {/* Document info */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                        <FileText className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{document.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Réf: {document.reference} • {document.size}
                            </p>
                        </div>
                        <Badge className="bg-red-600 text-white text-[10px] shrink-0">PDF/A</Badge>
                    </div>

                    {/* Verification Steps */}
                    <div className="space-y-3">
                        {steps.map((step, i) => {
                            const stepIdx = getStepIndex(currentStep);
                            const isActive = stepIdx === i;
                            const isDone = stepIdx > i;
                            const isPending = stepIdx < i;

                            return (
                                <motion.div
                                    key={step.key}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: isPending ? 0.4 : 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={cn(
                                        'flex items-center gap-3 p-2.5 rounded-lg border transition-colors',
                                        isActive && 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/10',
                                        isDone && 'border-green-200 bg-green-50/30 dark:bg-green-900/5',
                                        isPending && 'border-transparent'
                                    )}
                                >
                                    {/* Step indicator */}
                                    <div className={cn(
                                        'h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
                                        isActive && 'bg-emerald-500',
                                        isDone && 'bg-green-500',
                                        isPending && 'bg-gray-200 dark:bg-gray-700'
                                    )}>
                                        {isActive ? (
                                            <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                                        ) : isDone ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                        ) : (
                                            <span className="text-xs text-gray-500 font-medium">{i + 1}</span>
                                        )}
                                    </div>

                                    {/* Step label */}
                                    <span className={cn(
                                        'text-sm',
                                        isActive && 'font-medium text-emerald-700 dark:text-emerald-400',
                                        isDone && 'text-green-600 dark:text-green-400',
                                        isPending && 'text-muted-foreground'
                                    )}>
                                        {step.label}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Result */}
                    <AnimatePresence>
                        {currentStep === 'result' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                {/* Status banner */}
                                <div className={cn(
                                    'flex items-center gap-3 p-4 rounded-xl border-2',
                                    isValid
                                        ? 'bg-green-50 dark:bg-green-900/10 border-green-500'
                                        : 'bg-red-50 dark:bg-red-900/10 border-red-500'
                                )}>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', bounce: 0.5 }}
                                    >
                                        {isValid ? (
                                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                                        ) : (
                                            <XCircle className="h-8 w-8 text-red-600" />
                                        )}
                                    </motion.div>
                                    <div>
                                        <h3 className={cn(
                                            'font-semibold',
                                            isValid ? 'text-green-700' : 'text-red-700'
                                        )}>
                                            {isValid ? 'Intégrité confirmée' : 'ALERTE : Intégrité compromise'}
                                        </h3>
                                        <p className={cn(
                                            'text-sm',
                                            isValid ? 'text-green-600' : 'text-red-600'
                                        )}>
                                            {isValid
                                                ? 'Le document n\'a subi aucune altération depuis son archivage.'
                                                : 'Le document a été modifié. Contactez l\'administrateur.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Hash comparison */}
                                <div className="space-y-3 bg-muted/50 rounded-lg p-3 border">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Lock className="h-3 w-3" />
                                            Empreinte d'origine (archivage)
                                        </p>
                                        <p className="font-mono text-[11px] bg-background p-2 rounded border break-all">
                                            {document.hash}
                                        </p>
                                    </div>

                                    <div className="flex justify-center">
                                        <ArrowDownUp className={cn(
                                            'h-4 w-4',
                                            isValid ? 'text-green-500' : 'text-red-500'
                                        )} />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Hash className="h-3 w-3" />
                                            Empreinte actuelle (recalculée)
                                        </p>
                                        <p className={cn(
                                            'font-mono text-[11px] p-2 rounded border break-all',
                                            isValid ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'
                                        )}>
                                            {currentHash}
                                        </p>
                                    </div>
                                </div>

                                {/* Verification timestamp */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Vérifié le {new Date(verifiedAt).toLocaleDateString('fr-FR', {
                                            day: '2-digit', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit', second: '2-digit',
                                        })}
                                    </span>
                                    <Badge variant="outline" className="text-[10px]">
                                        SHA-256
                                    </Badge>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Close button */}
                    {currentStep === 'result' && (
                        <div className="flex justify-end pt-2">
                            <Button onClick={() => onOpenChange(false)}>
                                Fermer
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
