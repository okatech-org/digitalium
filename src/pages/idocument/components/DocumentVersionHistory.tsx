/**
 * DocumentVersionHistory - Complete version history panel for a document
 * Shows version timeline, diffs, and allows creating new versions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    GitBranch,
    GitCommit,
    Plus,
    Lock,
    Unlock,
    ChevronDown,
    ChevronRight,
    Clock,
    User,
    FileText,
    CheckCircle2,
    Paperclip,
    Download,
    Eye,
    Award,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { IFichier, IDocumentVersion, ArchivalStatus } from '../types';
import { ARCHIVAL_STATUS_CONFIG, isActionAllowed } from '../constants';

interface DocumentVersionHistoryProps {
    fichier: IFichier;
    onCreateVersion: (data: { changeDescription: string; changeType: 'major' | 'minor' | 'patch' }) => void;
    className?: string;
}

export function DocumentVersionHistory({
    fichier,
    onCreateVersion,
    className = '',
}: DocumentVersionHistoryProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

    const versions = (fichier.versions || []).sort((a, b) => b.versionNumber - a.versionNumber);
    const canAddVersion = isActionAllowed(fichier.archivalStatus || 'actif', 'add_version');

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                        Historique des versions
                    </h3>
                    <Badge variant="outline" className="text-xs">
                        {versions.length} version{versions.length > 1 ? 's' : ''}
                    </Badge>
                </div>
                {canAddVersion && (
                    <Button
                        size="sm"
                        onClick={() => setIsCreateOpen(true)}
                        className="gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Nouvelle version
                    </Button>
                )}
                {!canAddVersion && (
                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/30">
                        <Lock className="h-3 w-3 mr-1" />
                        Versionnage bloqué ({ARCHIVAL_STATUS_CONFIG[fichier.archivalStatus || 'actif'].label})
                    </Badge>
                )}
            </div>

            {/* Version Timeline */}
            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border/60" />

                <AnimatePresence>
                    {versions.map((version, index) => {
                        const isExpanded = expandedVersion === version.id;
                        const isLatest = index === 0;

                        return (
                            <motion.div
                                key={version.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative pl-12 pb-4"
                            >
                                {/* Timeline node */}
                                <div className={`absolute left-3 top-2 h-5 w-5 rounded-full border-2 flex items-center justify-center z-10 ${version.isCurrent
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : version.isLocked
                                            ? 'bg-muted border-muted-foreground/30 text-muted-foreground'
                                            : 'bg-card border-border text-muted-foreground'
                                    }`}>
                                    {version.isCurrent ? (
                                        <CheckCircle2 className="h-3 w-3" />
                                    ) : version.isLocked ? (
                                        <Lock className="h-2.5 w-2.5" />
                                    ) : (
                                        <GitCommit className="h-3 w-3" />
                                    )}
                                </div>

                                {/* Version Card */}
                                <button
                                    type="button"
                                    onClick={() => setExpandedVersion(isExpanded ? null : version.id)}
                                    className={`w-full text-left rounded-xl border p-3 transition-all duration-200 ${isExpanded
                                            ? 'border-primary/30 bg-primary/5 shadow-sm'
                                            : 'border-border/40 bg-card hover:bg-muted/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant={isLatest ? 'default' : 'outline'}
                                                className={`text-xs font-mono ${isLatest ? '' : 'bg-muted/50'}`}
                                            >
                                                {version.label}
                                            </Badge>
                                            <span className="text-sm text-foreground font-medium">
                                                {version.changeDescription}
                                            </span>
                                            {version.isCurrent && (
                                                <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/15 text-emerald-700 border-emerald-500/30" variant="outline">
                                                    Courante
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <ChangeTypeBadge type={version.changeType} />
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {version.author}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(version.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                        </span>
                                        {version.attachments.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Paperclip className="h-3 w-3" />
                                                {version.attachments.length} fichier{version.attachments.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {version.isLocked && (
                                            <span className="flex items-center gap-1 text-amber-600">
                                                <Lock className="h-3 w-3" />
                                                Verrouillée
                                            </span>
                                        )}
                                    </div>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-3 pt-3 border-t border-border/30 space-y-3"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {/* Version details */}
                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                                                            Type de changement
                                                        </span>
                                                        <p className="mt-1 text-foreground capitalize">
                                                            {version.changeType === 'major' ? 'Majeur' : version.changeType === 'minor' ? 'Mineur' : 'Correctif'}
                                                        </p>
                                                    </div>
                                                    {version.hash_sha256 && (
                                                        <div>
                                                            <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                                                                Empreinte SHA-256
                                                            </span>
                                                            <p className="mt-1 text-foreground font-mono text-[10px] truncate">
                                                                {version.hash_sha256}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Attachments in this version */}
                                                {version.attachments.length > 0 && (
                                                    <div>
                                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                            Pièces jointes (snapshot)
                                                        </span>
                                                        <div className="mt-1.5 space-y-1">
                                                            {version.attachments.map(att => (
                                                                <div key={att.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-1.5">
                                                                    <div className="flex items-center gap-2 text-xs text-foreground">
                                                                        <FileText className="h-3 w-3 text-muted-foreground" />
                                                                        {att.name}
                                                                        <span className="text-muted-foreground">{att.size}</span>
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                            <Eye className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                            <Download className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {versions.length === 0 && (
                    <div className="pl-12 py-6 text-center text-muted-foreground">
                        <GitBranch className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm">Aucune version enregistrée</p>
                    </div>
                )}
            </div>

            {/* Create Version Dialog */}
            <CreateVersionDialog
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onConfirm={onCreateVersion}
                fichierName={fichier.name}
                currentVersion={fichier.currentVersionNumber || 1}
            />
        </div>
    );
}

// ========================================
// Sub-components
// ========================================

function ChangeTypeBadge({ type }: { type: 'major' | 'minor' | 'patch' }) {
    const config = {
        major: { label: 'Majeur', color: 'bg-red-500/10 text-red-700 border-red-500/30' },
        minor: { label: 'Mineur', color: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
        patch: { label: 'Correctif', color: 'bg-green-500/10 text-green-700 border-green-500/30' },
    };

    return (
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config[type].color}`}>
            {config[type].label}
        </Badge>
    );
}

interface CreateVersionDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: { changeDescription: string; changeType: 'major' | 'minor' | 'patch' }) => void;
    fichierName: string;
    currentVersion: number;
}

function CreateVersionDialog({
    open,
    onClose,
    onConfirm,
    fichierName,
    currentVersion,
}: CreateVersionDialogProps) {
    const [changeDescription, setChangeDescription] = useState('');
    const [changeType, setChangeType] = useState<'major' | 'minor' | 'patch'>('minor');

    const handleConfirm = () => {
        if (!changeDescription.trim()) return;
        onConfirm({ changeDescription, changeType });
        setChangeDescription('');
        setChangeType('minor');
        onClose();
    };

    const handleClose = () => {
        setChangeDescription('');
        setChangeType('minor');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" />
                        Créer une nouvelle version
                    </DialogTitle>
                    <DialogDescription>
                        Version actuelle : <strong>v{currentVersion}.0</strong> — {fichierName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Change Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Type de changement</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['major', 'minor', 'patch'] as const).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setChangeType(type)}
                                    className={`p-3 rounded-xl border text-center transition-all ${changeType === type
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                            : 'border-border/40 bg-card hover:bg-muted/30'
                                        }`}
                                >
                                    <ChangeTypeBadge type={type} />
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {type === 'major' && 'Refonte ou restructuration complète'}
                                        {type === 'minor' && 'Ajouts ou modifications significatifs'}
                                        {type === 'patch' && 'Corrections mineures ou typos'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Description des changements *
                        </label>
                        <Textarea
                            value={changeDescription}
                            onChange={(e) => setChangeDescription(e.target.value)}
                            placeholder="Ex: Mise à jour des clauses contractuelles suite à la nouvelle réglementation..."
                            className="min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Preview */}
                    <div className="bg-muted/30 rounded-xl p-3 border border-border/40">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                            Aperçu de la version
                        </p>
                        <div className="flex items-center gap-2">
                            <Badge className="font-mono">
                                v{currentVersion + 1}.0
                            </Badge>
                            <span className="text-sm text-foreground">
                                {changeDescription || '(description requise)'}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!changeDescription.trim()}
                    >
                        <Award className="h-4 w-4 mr-2" />
                        Créer la version
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DocumentVersionHistory;
