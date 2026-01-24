
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreVertical, FolderOpen, Trash2, Edit } from "lucide-react";
import { IClasseur } from '../types';

interface ClasseurListProps {
    classeurs: IClasseur[];
    onSelectClasseur: (classeur: IClasseur) => void;
    onEditClasseur?: (classeur: IClasseur) => void;
    onDeleteClasseur?: (classeur: IClasseur) => void;
}

// High-fidelity 3D Folder SVG Component
function Folder3D({ color = '#F59E0B', hasDocuments = true }: { color?: string; hasDocuments?: boolean }) {
    // Convert Tailwind color class to hex
    const colorMap: Record<string, string> = {
        'bg-blue-500': '#3B82F6',
        'bg-green-500': '#22C55E',
        'bg-purple-500': '#A855F7',
        'bg-orange-500': '#F97316',
        'bg-red-500': '#EF4444',
        'bg-pink-500': '#EC4899',
        'bg-yellow-500': '#EAB308',
        'bg-gray-500': '#6B7280',
        'bg-amber-500': '#F59E0B',
    };

    const folderColor = colorMap[color] || color.startsWith('#') ? color : '#F59E0B';
    const darkerColor = `${folderColor}CC`;
    const lighterColor = `${folderColor}`;

    return (
        <svg viewBox="0 0 120 100" className="w-full h-full drop-shadow-xl">
            <defs>
                {/* Folder gradient */}
                <linearGradient id={`folderGrad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={lighterColor} />
                    <stop offset="100%" stopColor={darkerColor} />
                </linearGradient>
                {/* Paper gradient */}
                <linearGradient id="paperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#F3F4F6" />
                </linearGradient>
                {/* Blue accent paper */}
                <linearGradient id="bluePaperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                {/* Shadow filter */}
                <filter id="folderShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2" />
                </filter>
            </defs>

            {/* Back of folder */}
            <path
                d="M10 25 L10 85 C10 90 15 95 20 95 L100 95 C105 95 110 90 110 85 L110 25 L10 25"
                fill={`url(#folderGrad-${color})`}
                filter="url(#folderShadow)"
            />

            {/* Papers inside (only if has documents) */}
            {hasDocuments && (
                <>
                    {/* White paper 1 (back) */}
                    <rect x="22" y="18" width="70" height="45" rx="2" fill="url(#paperGrad)" transform="rotate(-2, 57, 40)">
                        <animate attributeName="transform" values="rotate(-2, 57, 40);rotate(-1, 57, 40);rotate(-2, 57, 40)" dur="3s" repeatCount="indefinite" />
                    </rect>
                    {/* Blue paper (middle) */}
                    <rect x="25" y="22" width="65" height="40" rx="2" fill="url(#bluePaperGrad)" transform="rotate(1, 57, 42)" />
                    {/* White paper 2 (front) */}
                    <rect x="28" y="26" width="60" height="35" rx="2" fill="url(#paperGrad)" transform="rotate(-1, 58, 43)" />
                </>
            )}

            {/* Tab of folder */}
            <path
                d="M10 25 L10 15 C10 10 15 5 20 5 L45 5 C50 5 52 8 55 12 L60 20 L60 25 L10 25"
                fill={`url(#folderGrad-${color})`}
            />

            {/* Front of folder */}
            <path
                d="M10 35 L10 85 C10 90 15 95 20 95 L100 95 C105 95 110 90 110 85 L110 35 C110 30 105 28 100 28 L20 28 C15 28 10 30 10 35"
                fill={`url(#folderGrad-${color})`}
                opacity="0.95"
            />

            {/* Highlight line on front */}
            <path
                d="M15 40 L105 40"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
                strokeLinecap="round"
            />

            {/* Bottom edge shadow */}
            <path
                d="M15 90 L105 90"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function ClasseurList({
    classeurs,
    onSelectClasseur,
    onEditClasseur,
    onDeleteClasseur
}: ClasseurListProps) {

    if (classeurs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border border-border/40">
                <div className="w-32 h-32 mb-4">
                    <Folder3D hasDocuments={false} />
                </div>
                <p className="text-muted-foreground font-medium">Aucun classeur</p>
                <p className="text-sm text-muted-foreground/70">Créez votre premier classeur pour organiser vos documents.</p>
            </div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
        >
            {classeurs.map((classeur) => {
                const totalDossiers = classeur.dossiers.length;
                const totalFichiers = classeur.dossiers.reduce((acc, d) => acc + d.fichiers.filter(f => !f.deleted_at).length, 0);
                const hasDocuments = totalFichiers > 0;

                return (
                    <motion.div
                        key={classeur.id}
                        variants={item}
                        layoutId={classeur.id}
                        className="group cursor-pointer"
                        onClick={() => onSelectClasseur(classeur)}
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* 3D Folder Visual */}
                        <div className="relative aspect-square">
                            <Folder3D color={classeur.color} hasDocuments={hasDocuments} />

                            {/* Icon overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-3xl drop-shadow-lg opacity-90 translate-y-4">
                                    {classeur.icon}
                                </span>
                            </div>

                            {/* Action Menu */}
                            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-7 w-7 bg-white/90 hover:bg-white shadow-lg">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => onSelectClasseur(classeur)}>
                                            <FolderOpen className="h-4 w-4 mr-2" /> Ouvrir
                                        </DropdownMenuItem>
                                        {onEditClasseur && (
                                            <DropdownMenuItem onClick={() => onEditClasseur(classeur)}>
                                                <Edit className="h-4 w-4 mr-2" /> Renommer
                                            </DropdownMenuItem>
                                        )}
                                        {onDeleteClasseur && !classeur.is_system && (
                                            <DropdownMenuItem className="text-destructive" onClick={() => onDeleteClasseur(classeur)}>
                                                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Stats badge */}
                            <div className="absolute -bottom-1 right-0 left-0 flex justify-center">
                                <div className="bg-card/95 text-foreground px-3 py-1 rounded-full text-[10px] font-bold shadow-lg border border-border/40 flex items-center gap-1.5">
                                    <span className="text-primary">{totalDossiers}</span> dossier{totalDossiers !== 1 ? 's' : ''}
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-primary">{totalFichiers}</span> fichier{totalFichiers !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>

                        {/* Classeur Info */}
                        <div className="mt-4 space-y-1 px-1 text-center">
                            <h4 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                {classeur.name}
                            </h4>
                            {classeur.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {classeur.description}
                                </p>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
