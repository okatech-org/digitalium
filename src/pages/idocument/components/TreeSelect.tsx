import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, FolderOpen, BookOpen, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IClasseur, IDossier, TreeLocation } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

interface TreeSelectProps {
    classeurs: IClasseur[];
    value: TreeLocation | null;
    onChange: (location: TreeLocation) => void;
    /** If true, only allow selecting classeurs (for dossier creation) */
    classeurOnly?: boolean;
    /** Label displayed above the tree */
    label?: string;
    /** Show error state */
    error?: boolean;
    errorMessage?: string;
}

export function TreeSelect({
    classeurs,
    value,
    onChange,
    classeurOnly = false,
    label = 'Emplacement *',
    error = false,
    errorMessage,
}: TreeSelectProps) {
    const [expandedClasseurs, setExpandedClasseurs] = useState<Set<string>>(
        new Set(value?.classeurId ? [value.classeurId] : [])
    );

    const toggleExpand = (classeurId: string) => {
        setExpandedClasseurs(prev => {
            const next = new Set(prev);
            if (next.has(classeurId)) {
                next.delete(classeurId);
            } else {
                next.add(classeurId);
            }
            return next;
        });
    };

    const handleSelectClasseur = (classeur: IClasseur) => {
        if (classeurOnly) {
            onChange({
                classeurId: classeur.id,
                classeurName: classeur.name,
            });
        } else {
            toggleExpand(classeur.id);
        }
    };

    const handleSelectDossier = (classeur: IClasseur, dossier: IDossier) => {
        onChange({
            classeurId: classeur.id,
            dossierId: dossier.id,
            classeurName: classeur.name,
            dossierName: dossier.name,
        });
    };

    const isClasseurSelected = (classeurId: string) =>
        value?.classeurId === classeurId && !value?.dossierId;

    const isDossierSelected = (dossierId: string) =>
        value?.dossierId === dossierId;

    return (
        <div className="space-y-2">
            <Label className={cn(error && 'text-destructive')}>{label}</Label>
            <div className={cn(
                'border rounded-lg overflow-hidden transition-colors',
                error ? 'border-destructive' : 'border-border/40',
            )}>
                <ScrollArea className="h-[200px]">
                    <div className="p-2 space-y-0.5">
                        {classeurs.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                Aucun classeur disponible.
                                <br />Créez un classeur d'abord.
                            </div>
                        ) : (
                            classeurs.map(classeur => (
                                <div key={classeur.id}>
                                    {/* Classeur Node */}
                                    <div
                                        className={cn(
                                            'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors group',
                                            isClasseurSelected(classeur.id)
                                                ? 'bg-primary/10 text-primary'
                                                : 'hover:bg-muted/50'
                                        )}
                                        onClick={() => handleSelectClasseur(classeur)}
                                    >
                                        {!classeurOnly && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleExpand(classeur.id);
                                                }}
                                                className="p-0.5 hover:bg-muted rounded shrink-0"
                                            >
                                                {expandedClasseurs.has(classeur.id) ? (
                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                ) : (
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                        )}
                                        <div className={cn(
                                            'w-6 h-6 rounded flex items-center justify-center text-xs shrink-0',
                                            classeur.color
                                        )}>
                                            <span>{classeur.icon}</span>
                                        </div>
                                        <span className="text-sm font-medium truncate flex-1">
                                            {classeur.name}
                                        </span>
                                        {!classeurOnly && (
                                            <span className="text-[10px] text-muted-foreground">
                                                {classeur.dossiers.length} dossier{classeur.dossiers.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        {isClasseurSelected(classeur.id) && (
                                            <Check className="h-4 w-4 text-primary shrink-0" />
                                        )}
                                    </div>

                                    {/* Dossier Children */}
                                    {!classeurOnly && expandedClasseurs.has(classeur.id) && (
                                        <div className="ml-4">
                                            {classeur.dossiers.length === 0 ? (
                                                <div className="text-xs text-muted-foreground py-1 pl-6 italic">
                                                    Aucun dossier
                                                </div>
                                            ) : (
                                                classeur.dossiers.map(dossier => (
                                                    <div
                                                        key={dossier.id}
                                                        className={cn(
                                                            'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ml-2',
                                                            isDossierSelected(dossier.id)
                                                                ? 'bg-primary/10 text-primary'
                                                                : 'hover:bg-muted/50'
                                                        )}
                                                        onClick={() => handleSelectDossier(classeur, dossier)}
                                                    >
                                                        <div className={cn(
                                                            'w-5 h-5 rounded flex items-center justify-center text-xs shrink-0',
                                                            dossier.color
                                                        )}>
                                                            <span className="text-[10px]">{dossier.icon}</span>
                                                        </div>
                                                        <span className="text-sm truncate flex-1">
                                                            {dossier.name}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {dossier.fichiers.filter(f => !f.deleted_at).length} fichier{dossier.fichiers.filter(f => !f.deleted_at).length !== 1 ? 's' : ''}
                                                        </span>
                                                        {isDossierSelected(dossier.id) && (
                                                            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
            {/* Selected path display */}
            {value && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                    <FolderOpen className="h-3 w-3" />
                    <span>{value.classeurName || 'Classeur'}</span>
                    {value.dossierName && (
                        <>
                            <ChevronRight className="h-3 w-3" />
                            <span>{value.dossierName}</span>
                        </>
                    )}
                </div>
            )}
            {error && errorMessage && (
                <p className="text-xs text-destructive">{errorMessage}</p>
            )}
        </div>
    );
}
