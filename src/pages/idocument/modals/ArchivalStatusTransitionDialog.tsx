/**
 * ArchivalStatusTransitionDialog - Dialog for changing archival status
 * Shows available transitions with business rules and approval requirements
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    ArrowRight,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Lock,
    User,
    Scale,
} from 'lucide-react';
import { ArchivalStatus, ArchivalTransitionRule, IFichier } from '../types';
import { ARCHIVAL_STATUS_CONFIG, getAvailableTransitions, RETENTION_RULES_BY_STATUS, needsPdfConversion } from '../constants';

interface ArchivalStatusTransitionDialogProps {
    open: boolean;
    onClose: () => void;
    fichier: IFichier;
    onTransition: (newStatus: ArchivalStatus, reason: string) => void;
}

export function ArchivalStatusTransitionDialog({
    open,
    onClose,
    fichier,
    onTransition,
}: ArchivalStatusTransitionDialogProps) {
    const [selectedTransition, setSelectedTransition] = useState<ArchivalTransitionRule | null>(null);
    const [reason, setReason] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);

    const currentStatus = fichier.archivalStatus || 'actif';
    const currentConfig = ARCHIVAL_STATUS_CONFIG[currentStatus];
    const transitions = getAvailableTransitions(currentStatus);

    // Get retention info for the document type
    const retentionRules = RETENTION_RULES_BY_STATUS[fichier.type] || RETENTION_RULES_BY_STATUS['other'];

    const handleConfirm = () => {
        if (!selectedTransition) return;
        setIsConfirming(true);

        // Simulate slight delay for UX
        setTimeout(() => {
            onTransition(selectedTransition.to, reason);
            setIsConfirming(false);
            setSelectedTransition(null);
            setReason('');
            onClose();
        }, 500);
    };

    const handleClose = () => {
        setSelectedTransition(null);
        setReason('');
        setIsConfirming(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Scale className="h-5 w-5 text-primary" />
                        Gestion du cycle de vie archivistique
                    </DialogTitle>
                    <DialogDescription>
                        Modifier le statut archivistique de <strong>{fichier.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                {/* Current Status */}
                <div className="bg-muted/30 rounded-xl p-4 border border-border/40">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                Statut actuel
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{currentConfig.icon}</span>
                                <div>
                                    <p className="font-bold text-foreground">{currentConfig.label}</p>
                                    <p className="text-xs text-muted-foreground">{currentConfig.description}</p>
                                </div>
                            </div>
                        </div>
                        {fichier.retentionEndDate && (
                            <div className="text-right">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                    Fin de rétention
                                </p>
                                <div className="flex items-center gap-1 text-sm text-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    {new Date(fichier.retentionEndDate).toLocaleDateString('fr-FR')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Transitions */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        Transitions disponibles
                    </h4>

                    {transitions.length === 0 ? (
                        <div className="bg-muted/30 rounded-xl p-6 text-center">
                            <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Aucune transition disponible depuis le statut "{currentConfig.label}".
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <AnimatePresence>
                                {transitions.map((transition, index) => {
                                    const targetConfig = ARCHIVAL_STATUS_CONFIG[transition.to];
                                    const isSelected = selectedTransition?.to === transition.to;
                                    const targetRetention = retentionRules.find(r => r.archivalStatus === transition.to);

                                    return (
                                        <motion.div
                                            key={transition.to}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setSelectedTransition(isSelected ? null : transition)}
                                                className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${isSelected
                                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                        : 'border-border/40 bg-card hover:bg-muted/30 hover:border-border'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-2xl mt-0.5">{targetConfig.icon}</span>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-foreground">
                                                                    {targetConfig.label}
                                                                </span>
                                                                {transition.requiresApproval && (
                                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-700 border-amber-500/30">
                                                                        <ShieldCheck className="h-3 w-3 mr-1" />
                                                                        Approbation requise
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                {transition.businessRule}
                                                            </p>
                                                            {targetRetention && (
                                                                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/30">
                                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                        <Clock className="h-3 w-3" />
                                                                        Rétention : {targetRetention.retentionYears === 'permanent' ? 'Permanente' : `${targetRetention.retentionYears} an(s)`}
                                                                    </div>
                                                                    {targetRetention.legalBasis && (
                                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                            <Scale className="h-3 w-3" />
                                                                            {targetRetention.legalBasis}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                                                        }`}>
                                                        {isSelected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                                                    </div>
                                                </div>
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Reason / Justification */}
                {selectedTransition && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                    >
                        <label className="text-sm font-medium text-foreground">
                            {selectedTransition.requiresApproval ? (
                                <span className="flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    Justification requise
                                </span>
                            ) : (
                                'Motif (optionnel)'
                            )}
                        </label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={
                                selectedTransition.requiresApproval
                                    ? 'Précisez la raison de cette transition (obligatoire pour les transitions avec approbation)...'
                                    : 'Ajoutez un commentaire pour le journal d\'audit...'
                            }
                            className="min-h-[80px] resize-none"
                        />
                        {selectedTransition.requiresApproval && selectedTransition.approverRole && (
                            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                                <User className="h-3.5 w-3.5" />
                                Rôle approbateur : <strong>{selectedTransition.approverRole}</strong>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* PDF Conversion Warning */}
                {selectedTransition && (selectedTransition.to === 'archive' || selectedTransition.to === 'semi_actif') && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        {fichier.attachments.some(att => needsPdfConversion(att)) ? (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-1">
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                        <path d="M9 13h6"/>
                                        <path d="M9 17h6"/>
                                    </svg>
                                    Conversion PDF/A automatique
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    {fichier.attachments.filter(att => needsPdfConversion(att)).length} pièce(s) jointe(s)
                                    {fichier.attachments.filter(att => needsPdfConversion(att)).length > 1 ? ' seront converties' : ' sera convertie'}
                                    {' '}au format PDF/A-2b pour conformité NF Z42-013.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Toutes les pièces jointes sont déjà au format PDF – aucune conversion nécessaire.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleClose}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={
                            !selectedTransition ||
                            isConfirming ||
                            (selectedTransition?.requiresApproval && !reason.trim())
                        }
                        className="min-w-[140px]"
                    >
                        {isConfirming ? (
                            <span className="flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                    <Clock className="h-4 w-4" />
                                </motion.div>
                                Transition...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4" />
                                Appliquer la transition
                            </span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
