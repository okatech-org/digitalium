
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreVertical, FolderOpen, Trash2, Edit, Files } from "lucide-react";
import { IDossier } from '../types';

interface DossierListProps {
    dossiers: IDossier[];
    onSelectDossier: (dossier: IDossier) => void;
    onEditDossier?: (dossier: IDossier) => void;
    onDeleteDossier?: (dossier: IDossier) => void;
}

export function DossierList({
    dossiers,
    onSelectDossier,
    onEditDossier,
    onDeleteDossier
}: DossierListProps) {

    if (dossiers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border border-border/40">
                <div className="p-4 bg-card rounded-full mb-4 shadow-sm">
                    <span className="text-4xl">📁</span>
                </div>
                <p className="text-muted-foreground font-medium">Aucun dossier dans ce classeur</p>
                <p className="text-sm text-muted-foreground/70">Créez un dossier pour commencer à organiser vos fichiers.</p>
            </div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.06 }
        }
    };

    const item = {
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120 } }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5"
        >
            {dossiers.map((dossier) => {
                const fichierCount = dossier.fichiers.filter(f => !f.deleted_at).length;
                const hasFiles = fichierCount > 0;

                return (
                    <motion.div
                        key={dossier.id}
                        variants={item}
                        layoutId={dossier.id}
                        className="group cursor-pointer"
                        onClick={() => onSelectDossier(dossier)}
                    >
                        {/* Manila Folder Visual */}
                        <div className="relative aspect-square">
                            {/* Folder back */}
                            <div className={`
                                absolute inset-x-0 top-4 bottom-0
                                rounded-lg
                                ${dossier.color || 'bg-amber-400'}
                                shadow-md
                                group-hover:shadow-xl
                                transition-all duration-300
                            `} />

                            {/* Folder tab */}
                            <div className={`
                                absolute left-4 top-0 w-16 h-6
                                rounded-t-lg
                                ${dossier.color || 'bg-amber-400'}
                                shadow-sm
                            `} />

                            {/* Folder front */}
                            <div className={`
                                absolute inset-x-0 top-6 bottom-0
                                rounded-lg
                                ${dossier.color || 'bg-amber-400'}
                                brightness-105
                                shadow-lg
                                group-hover:shadow-2xl
                                transition-all duration-300
                                group-hover:-translate-y-1
                                flex items-center justify-center
                            `}>
                                {/* Icon */}
                                <span className="text-4xl drop-shadow group-hover:scale-110 transition-transform">
                                    {dossier.icon}
                                </span>

                                {/* Paper stack effect */}
                                {hasFiles && (
                                    <div className="absolute bottom-2 right-2 left-2">
                                        <div className="bg-white/90 h-1 rounded-sm shadow-sm" />
                                        <div className="bg-white/70 h-1 rounded-sm shadow-sm mt-0.5 mx-1" />
                                        <div className="bg-white/50 h-1 rounded-sm shadow-sm mt-0.5 mx-2" />
                                    </div>
                                )}
                            </div>

                            {/* Action Menu */}
                            <div className="absolute top-6 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-6 w-6 bg-white/80 hover:bg-white shadow">
                                            <MoreVertical className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuItem onClick={() => onSelectDossier(dossier)}>
                                            <FolderOpen className="h-4 w-4 mr-2" /> Ouvrir
                                        </DropdownMenuItem>
                                        {onEditDossier && (
                                            <DropdownMenuItem onClick={() => onEditDossier(dossier)}>
                                                <Edit className="h-4 w-4 mr-2" /> Renommer
                                            </DropdownMenuItem>
                                        )}
                                        {onDeleteDossier && (
                                            <DropdownMenuItem className="text-destructive" onClick={() => onDeleteDossier(dossier)}>
                                                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* File count badge */}
                            <div className="absolute bottom-1 right-1 bg-background/95 text-foreground px-2 py-0.5 rounded-md text-[10px] font-bold shadow border border-border/40 flex items-center gap-1">
                                <Files className="h-3 w-3" />
                                {fichierCount}
                            </div>
                        </div>

                        {/* Dossier Info */}
                        <div className="mt-3 space-y-1 px-1">
                            <h4 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                {dossier.name}
                            </h4>
                            {dossier.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {dossier.description}
                                </p>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
