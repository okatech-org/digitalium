
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    MoreVertical, FileText, Calendar, User, Eye, Trash2,
    RefreshCw, Ban, File as FileIcon, Paperclip
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { IFichier } from '../types';
import { STATUS_CONFIG, DOCUMENT_TYPES } from '../constants';

interface FichierListProps {
    fichiers: IFichier[];
    viewMode: 'list' | 'grid';
    selectedIds: string[];
    onToggleSelection: (id: string) => void;
    onToggleAll: (checked: boolean) => void;
    onSelectFichier: (fichier: IFichier) => void;
    onAction: (action: 'open' | 'delete' | 'restore' | 'permanent_delete', fichier: IFichier) => void;
    isTrash?: boolean;
}

// Simulated document content for preview
const getFichierPreviewContent = (fichier: IFichier): string[] => {
    const baseContent: Record<string, string[]> = {
        contrat: [
            "CONTRAT N° " + (fichier.reference || "XXX-2024"),
            "",
            "Entre les soussignés,",
            "",
            "D'une part, la société...",
            "Et d'autre part, le client...",
            "",
            "Il a été convenu ce qui suit:",
            "",
            "Article 1 - Objet",
            "Le présent contrat a pour objet...",
        ],
        facture: [
            "FACTURE N° " + (fichier.reference || "FAC-2024"),
            "",
            "Date: " + format(new Date(fichier.created_at), 'd MMMM yyyy', { locale: fr }),
            "",
            "Client: ...",
            "",
            "Désignation          Qté    Prix",
            "─────────────────────────────",
            "Service A              1    500€",
            "",
            "Total TTC:          1320€",
        ],
        devis: [
            "DEVIS N° " + (fichier.reference || "DEV-2024"),
            "",
            "Projet: " + fichier.name.substring(0, 25) + "...",
            "",
            "1. Description du projet",
            "...",
            "",
            "2. Prestations proposées",
            "...",
        ],
        rapport: [
            "RAPPORT",
            fichier.name.toUpperCase().substring(0, 30),
            "",
            "1. INTRODUCTION",
            "Le présent rapport...",
            "",
            "2. ANALYSE",
            "Les données montrent...",
        ],
        projet: [
            "CAHIER DES CHARGES",
            fichier.name.substring(0, 25),
            "",
            "Version 1.0",
            "Réf: " + (fichier.reference || "PRJ-2024"),
            "",
            "1. Contexte et objectifs",
            "...",
        ],
        other: [
            "DOCUMENT",
            "",
            fichier.name,
            "",
            "Référence: " + (fichier.reference || "N/A"),
            "",
            fichier.description || "...",
        ],
    };
    return baseContent[fichier.type] || baseContent.other;
};

export function FichierList({
    fichiers,
    viewMode,
    selectedIds,
    onToggleSelection,
    onToggleAll,
    onSelectFichier,
    onAction,
    isTrash = false
}: FichierListProps) {

    if (fichiers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border border-border/40">
                <div className="p-4 bg-card rounded-full mb-4 shadow-sm">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">Aucun fichier dans ce dossier</p>
                <p className="text-sm text-muted-foreground/70">Créez ou importez des fichiers pour commencer.</p>
            </div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    const ActionMenu = ({ fichier }: { fichier: IFichier }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {!isTrash && (
                    <>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAction('open', fichier); }}>
                            <Eye className="h-4 w-4 mr-2" /> Ouvrir
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); onAction('delete', fichier); }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                        </DropdownMenuItem>
                    </>
                )}
                {isTrash && (
                    <>
                        <DropdownMenuItem className="text-green-600 focus:text-green-600" onClick={(e) => { e.stopPropagation(); onAction('restore', fichier); }}>
                            <RefreshCw className="h-4 w-4 mr-2" /> Restaurer
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); onAction('permanent_delete', fichier); }}>
                            <Ban className="h-4 w-4 mr-2" /> Supprimer définitivement
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    // ========================================
    // GRID VIEW - A4 Document Thumbnails
    // ========================================
    if (viewMode === 'grid') {
        return (
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5"
            >
                {fichiers.map((fichier) => {
                    const DocIcon = DOCUMENT_TYPES[fichier.type]?.icon || FileText;
                    const typeConfig = DOCUMENT_TYPES[fichier.type] || DOCUMENT_TYPES['other'];
                    const statusConfig = STATUS_CONFIG[fichier.status] || STATUS_CONFIG['brouillon'];
                    const previewLines = getFichierPreviewContent(fichier);

                    return (
                        <motion.div
                            key={fichier.id}
                            variants={item}
                            layoutId={fichier.id}
                            className="group cursor-pointer"
                            onClick={() => onSelectFichier(fichier)}
                        >
                            {/* A4 Document Thumbnail */}
                            <div className={`
                                relative bg-white rounded-lg shadow-md overflow-hidden
                                aspect-[210/297]
                                border-2 transition-all duration-200
                                ${selectedIds.includes(fichier.id)
                                    ? 'border-primary ring-2 ring-primary/30'
                                    : 'border-gray-200 hover:border-primary/50 hover:shadow-xl'
                                }
                            `}>
                                {/* Selection Checkbox */}
                                <div className="absolute top-2 left-2 z-20" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedIds.includes(fichier.id)}
                                        onCheckedChange={() => onToggleSelection(fichier.id)}
                                        className="bg-white/90 backdrop-blur-sm shadow-sm data-[state=checked]:bg-primary"
                                    />
                                </div>

                                {/* Action Menu */}
                                <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu fichier={fichier} />
                                </div>

                                {/* Document Content Preview */}
                                <div className="absolute inset-0 p-3 overflow-hidden">
                                    <div className="text-[6px] leading-[8px] text-gray-700 font-mono select-none">
                                        {previewLines.map((line, i) => (
                                            <div key={i} className={`${i === 0 ? 'font-bold text-[7px] text-gray-900' : ''} truncate`}>
                                                {line || '\u00A0'}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Gradient Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/95 to-transparent" />

                                {/* File Type Badge */}
                                <div className="absolute bottom-2 right-2">
                                    <div className={`
                                        flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase
                                        ${typeConfig.color}
                                    `}>
                                        <DocIcon className="h-3 w-3" />
                                        {fichier.attachments[0]?.type || 'PDF'}
                                    </div>
                                </div>

                                {/* Attachments count */}
                                {fichier.attachments.length > 0 && (
                                    <div className="absolute bottom-2 left-2 bg-muted/90 px-1.5 py-0.5 rounded text-[9px] font-medium flex items-center gap-1">
                                        <Paperclip className="h-2.5 w-2.5" />
                                        {fichier.attachments.length}
                                    </div>
                                )}

                                {/* Corner Fold */}
                                <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-br from-gray-100 to-gray-200"
                                    style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
                            </div>

                            {/* File Info */}
                            <div className="mt-3 space-y-1.5 px-1">
                                <h4 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                    {fichier.name}
                                </h4>
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(fichier.created_at), 'd MMM yyyy', { locale: fr })}
                                    </span>
                                    <Badge variant="secondary" className={`${statusConfig.color} border-0 text-[9px] px-1.5 h-4`}>
                                        {statusConfig.label}
                                    </Badge>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        );
    }

    // ========================================
    // LIST VIEW
    // ========================================
    return (
        <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 p-4 border-b border-border/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="w-5 flex items-center justify-center">
                    <Checkbox
                        checked={selectedIds.length === fichiers.length && fichiers.length > 0}
                        onCheckedChange={(checked) => onToggleAll(!!checked)}
                    />
                </div>
                <div>Nom</div>
                <div>Référence</div>
                <div>Auteur</div>
                <div>Date</div>
                <div>Statut</div>
                <div className="w-10"></div>
            </div>

            <div className="divide-y divide-border/10">
                <AnimatePresence>
                    {fichiers.map((fichier) => {
                        const DocIcon = DOCUMENT_TYPES[fichier.type]?.icon || FileIcon;
                        const statusConfig = STATUS_CONFIG[fichier.status] || STATUS_CONFIG['brouillon'];

                        return (
                            <motion.div
                                key={fichier.id}
                                layoutId={fichier.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 p-3 items-center hover:bg-primary/5 transition-colors cursor-pointer group ${selectedIds.includes(fichier.id) ? 'bg-primary/10' : ''}`}
                                onClick={() => onSelectFichier(fichier)}
                            >
                                <div className="w-5 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedIds.includes(fichier.id)}
                                        onCheckedChange={() => onToggleSelection(fichier.id)}
                                    />
                                </div>

                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`p-2 rounded-lg ${DOCUMENT_TYPES[fichier.type]?.color || 'bg-muted text-muted-foreground'} bg-opacity-20`}>
                                        <DocIcon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-foreground truncate text-sm">{fichier.name}</p>
                                        <div className="flex gap-2 mt-0.5">
                                            {fichier.attachments.length > 0 && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-sm flex items-center gap-1">
                                                    <Paperclip className="h-2.5 w-2.5" />
                                                    {fichier.attachments.length}
                                                </span>
                                            )}
                                            {fichier.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded-sm truncate max-w-[80px]">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-sm font-mono text-muted-foreground">{fichier.reference}</div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-3.5 w-3.5" />
                                    <span className="truncate max-w-[120px]">{fichier.author}</span>
                                </div>

                                <div className="text-sm text-muted-foreground whitespace-nowrap">
                                    {format(new Date(fichier.created_at), 'd MMM yyyy', { locale: fr })}
                                </div>

                                <div>
                                    <Badge variant="secondary" className={`${statusConfig.color} border-0 text-[10px]`}>
                                        {statusConfig.label}
                                    </Badge>
                                </div>

                                <div onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu fichier={fichier} />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
