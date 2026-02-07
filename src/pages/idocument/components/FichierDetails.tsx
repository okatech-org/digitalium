
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ChevronLeft, FileText, Download, Eye, Calendar, User, Tag,
    Hash, File as FileIcon, Trash2, Paperclip, GitBranch, Shield,
    Clock, Scale, ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { IFichier, IAttachment, ArchivalStatus, IDocumentVersion } from '../types';
import { STATUS_CONFIG, FILE_TYPE_CONFIG, DOCUMENT_TYPES, ARCHIVAL_STATUS_CONFIG, isActionAllowed } from '../constants';
import { ArchivalStatusBadge } from './ArchivalStatusBadge';
import { DocumentVersionHistory } from './DocumentVersionHistory';
import { RetentionByStatusPanel } from './RetentionByStatusPanel';
import { ArchivalStatusTransitionDialog } from '../modals/ArchivalStatusTransitionDialog';

interface FichierDetailsProps {
    fichier: IFichier;
    onBack: () => void;
    onPreviewFile: (file: IAttachment) => void;
    onDelete: () => void;
    onChangeArchivalStatus?: (fichierId: string, newStatus: ArchivalStatus, reason: string) => void;
    onCreateVersion?: (fichierId: string, data: { changeDescription: string; changeType: 'major' | 'minor' | 'patch' }) => void;
}

export function FichierDetails({
    fichier,
    onBack,
    onPreviewFile,
    onDelete,
    onChangeArchivalStatus,
    onCreateVersion,
}: FichierDetailsProps) {
    const [showTransitionDialog, setShowTransitionDialog] = useState(false);

    const DocIcon = DOCUMENT_TYPES[fichier.type]?.icon || FileIcon;
    const statusConfig = STATUS_CONFIG[fichier.status] || STATUS_CONFIG['brouillon'];
    const archivalStatus = fichier.archivalStatus || 'actif';
    const canDelete = isActionAllowed(archivalStatus, 'delete');
    const canEdit = isActionAllowed(archivalStatus, 'edit');

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-full flex flex-col bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 border-b bg-muted/30">
                <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 text-muted-foreground hover:text-foreground -ml-2">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Retour aux fichiers
                </Button>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className={`p-4 rounded-xl ${DOCUMENT_TYPES[fichier.type]?.color || 'bg-muted'}`}>
                            <DocIcon className="h-8 w-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h2 className="text-2xl font-bold text-foreground">{fichier.name}</h2>
                                <Badge variant="secondary" className={`${statusConfig.color} border-0`}>
                                    {statusConfig.label}
                                </Badge>
                                <ArchivalStatusBadge status={archivalStatus} showDescription />
                                {fichier.currentVersionNumber && (
                                    <Badge variant="outline" className="text-xs font-mono bg-muted/50">
                                        <GitBranch className="h-3 w-3 mr-1" />
                                        v{fichier.currentVersionNumber}.0
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground max-w-2xl">{fichier.description}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                        {/* Change archival status */}
                        {isActionAllowed(archivalStatus, 'change_status') && onChangeArchivalStatus && (
                            <Button
                                variant="outline"
                                className="text-primary hover:text-primary hover:bg-primary/10 border-primary/20"
                                onClick={() => setShowTransitionDialog(true)}
                            >
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Cycle de vie
                            </Button>
                        )}
                        {canDelete && (
                            <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20" onClick={onDelete}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                            </Button>
                        )}
                        {!canDelete && (
                            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/30 px-3 py-1.5">
                                <Shield className="h-3 w-3 mr-1" />
                                Suppression bloquée
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="attachments" className="flex-1 flex flex-col">
                <div className="px-6 border-b">
                    <TabsList className="bg-transparent h-14 w-full justify-start gap-8">
                        <TabsTrigger value="attachments" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-medium">
                            <Paperclip className="h-4 w-4 mr-2" />
                            Pièces jointes ({fichier.attachments.length})
                        </TabsTrigger>
                        <TabsTrigger value="versions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-medium">
                            <GitBranch className="h-4 w-4 mr-2" />
                            Versions ({(fichier.versions || []).length})
                        </TabsTrigger>
                        <TabsTrigger value="lifecycle" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-medium">
                            <Shield className="h-4 w-4 mr-2" />
                            Cycle de vie
                        </TabsTrigger>
                        <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-medium">
                            Informations détaillées
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-auto p-6 bg-muted/20">
                    {/* TAB: Attachments */}
                    <TabsContent value="attachments" className="mt-0 h-full">
                        {fichier.attachments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <Paperclip className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                <p>Aucune pièce jointe</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {fichier.attachments.map((attachment) => {
                                    const fileConfig = FILE_TYPE_CONFIG[attachment.type] || FILE_TYPE_CONFIG['other'];
                                    const FileTypeIcon = fileConfig.icon;

                                    return (
                                        <div key={attachment.id} className="bg-card p-4 rounded-xl border border-border/40 hover:shadow-md transition-all group flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-lg ${attachment.type === 'pdf' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                    <FileTypeIcon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{attachment.name}</p>
                                                    <p className="text-xs text-muted-foreground">{attachment.size} • {format(new Date(attachment.created_at), 'dd MMM yyyy', { locale: fr })}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" onClick={() => onPreviewFile(attachment)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB: Versions */}
                    <TabsContent value="versions" className="mt-0">
                        <DocumentVersionHistory
                            fichier={fichier}
                            onCreateVersion={(data) => {
                                if (onCreateVersion) {
                                    onCreateVersion(fichier.id, data);
                                }
                            }}
                        />
                    </TabsContent>

                    {/* TAB: Lifecycle / Retention */}
                    <TabsContent value="lifecycle" className="mt-0 space-y-6">
                        {/* Archival Status Summary */}
                        <div className="bg-card rounded-xl border border-border/40 shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary" />
                                Statut archivistique
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut actuel</label>
                                    <div className="mt-1.5">
                                        <ArchivalStatusBadge status={archivalStatus} size="md" showDescription />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Modifié le</label>
                                    <div className="flex items-center gap-2 mt-1.5 text-sm text-foreground">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {fichier.archivalStatusChangedAt
                                            ? format(new Date(fichier.archivalStatusChangedAt), 'dd MMM yyyy à HH:mm', { locale: fr })
                                            : 'Non renseigné'
                                        }
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Modifié par</label>
                                    <div className="flex items-center gap-2 mt-1.5 text-sm text-foreground">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        {fichier.archivalStatusChangedBy || 'Système'}
                                    </div>
                                </div>
                            </div>
                            {fichier.finalDisposition && (
                                <div className="mt-3 pt-3 border-t border-border/30">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort final prévu</label>
                                    <div className="mt-1.5">
                                        <Badge variant="outline" className="text-sm capitalize">
                                            {fichier.finalDisposition === 'conservation' && '📦 Conservation définitive'}
                                            {fichier.finalDisposition === 'destruction' && '🔥 Destruction réglementaire'}
                                            {fichier.finalDisposition === 'tri' && '🔍 Tri sélectif'}
                                        </Badge>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Retention Policy Panel */}
                        <div className="bg-card rounded-xl border border-border/40 shadow-sm p-6">
                            <RetentionByStatusPanel
                                documentType={fichier.type}
                                currentArchivalStatus={archivalStatus}
                                retentionEndDate={fichier.retentionEndDate}
                            />
                        </div>
                    </TabsContent>

                    {/* TAB: Details */}
                    <TabsContent value="details" className="mt-0 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-card p-6 rounded-xl border border-border/40 shadow-sm space-y-6">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-primary" />
                                    Identification
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Référence interne</label>
                                        <p className="font-mono text-foreground mt-1 select-all bg-muted/50 p-2 rounded border border-border/40">{fichier.reference}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type de document</label>
                                        <p className="text-foreground mt-1 capitalize">{DOCUMENT_TYPES[fichier.type]?.label}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card p-6 rounded-xl border border-border/40 shadow-sm space-y-6">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <User className="h-4 w-4 text-purple-500" />
                                    Responsabilité
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Auteur</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-primary to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                                                {fichier.author.charAt(0)}
                                            </div>
                                            <span className="text-foreground">{fichier.author}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date de création</label>
                                        <div className="flex items-center gap-2 mt-1 text-foreground">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {format(new Date(fichier.created_at), 'PPPP', { locale: fr })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card p-6 rounded-xl border border-border/40 shadow-sm space-y-6 md:col-span-2">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-green-500" />
                                    Indexation
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {fichier.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="px-3 py-1 bg-muted/50">
                                            #{tag}
                                        </Badge>
                                    ))}
                                    {canEdit && (
                                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary rounded-full border border-dashed border-primary/30">
                                            + Ajouter
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            {/* Archival Status Transition Dialog */}
            <ArchivalStatusTransitionDialog
                open={showTransitionDialog}
                onClose={() => setShowTransitionDialog(false)}
                fichier={fichier}
                onTransition={(newStatus, reason) => {
                    if (onChangeArchivalStatus) {
                        onChangeArchivalStatus(fichier.id, newStatus, reason);
                    }
                }}
            />
        </motion.div>
    );
}

