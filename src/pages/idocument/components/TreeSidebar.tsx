import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FolderOpen, BookOpen, FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IClasseur, IDossier } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface TreeSidebarProps {
    classeurs: IClasseur[];
    selectedClasseurId?: string | null;
    selectedDossierId?: string | null;
    onSelectClasseur: (classeur: IClasseur) => void;
    onSelectDossier: (dossier: IDossier, classeur: IClasseur) => void;
    onCreateClasseur?: () => void;
    onCreateDossier?: (classeurId: string) => void;
}

export function TreeSidebar({
    classeurs,
    selectedClasseurId,
    selectedDossierId,
    onSelectClasseur,
    onSelectDossier,
    onCreateClasseur,
    onCreateDossier,
}: TreeSidebarProps) {
    const [expandedClasseurs, setExpandedClasseurs] = useState<Set<string>>(
        new Set(selectedClasseurId ? [selectedClasseurId] : classeurs.map(c => c.id))
    );

    const toggleExpand = (classeurId: string, e: React.MouseEvent) => {
        e.stopPropagation();
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

    return (
        <div className="flex flex-col h-full border-r border-border/40 bg-muted/20">
            {/* Header */}
            <div className="px-3 py-3 border-b border-border/30 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Arborescence
                </h3>
                {onCreateClasseur && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onCreateClasseur}
                        title="Nouveau classeur"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {/* Tree */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                    {classeurs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-xs">
                            Aucun classeur.
                            <br />
                            <button
                                onClick={onCreateClasseur}
                                className="text-primary hover:underline mt-1 inline-block"
                            >
                                Créer un classeur
                            </button>
                        </div>
                    ) : (
                        classeurs.map(classeur => {
                            const isExpanded = expandedClasseurs.has(classeur.id);
                            const isSelected = selectedClasseurId === classeur.id && !selectedDossierId;
                            const fichierCount = classeur.dossiers.reduce(
                                (sum, d) => sum + d.fichiers.filter(f => !f.deleted_at).length, 0
                            );

                            return (
                                <div key={classeur.id}>
                                    {/* Classeur */}
                                    <div
                                        className={cn(
                                            'flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors group text-sm',
                                            isSelected
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'hover:bg-muted/60'
                                        )}
                                        onClick={() => onSelectClasseur(classeur)}
                                    >
                                        <button
                                            onClick={(e) => toggleExpand(classeur.id, e)}
                                            className="p-0.5 hover:bg-muted rounded shrink-0"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="h-3.5 w-3.5" />
                                            ) : (
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                        <span className="text-base shrink-0">{classeur.icon}</span>
                                        <span className="truncate flex-1">{classeur.name}</span>
                                        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                            {fichierCount}
                                        </span>
                                        {onCreateDossier && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCreateDossier(classeur.id);
                                                }}
                                                className="p-0.5 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Nouveau dossier"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Dossiers */}
                                    {isExpanded && (
                                        <div className="ml-3">
                                            {classeur.dossiers.length === 0 ? (
                                                <div className="text-[10px] text-muted-foreground py-1 pl-5 italic">
                                                    Vide
                                                </div>
                                            ) : (
                                                classeur.dossiers.map(dossier => {
                                                    const isDossierSelected = selectedDossierId === dossier.id;
                                                    const dossierFichierCount = dossier.fichiers.filter(f => !f.deleted_at).length;

                                                    return (
                                                        <div
                                                            key={dossier.id}
                                                            className={cn(
                                                                'flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-colors group text-sm ml-2',
                                                                isDossierSelected
                                                                    ? 'bg-primary/10 text-primary font-medium'
                                                                    : 'hover:bg-muted/60'
                                                            )}
                                                            onClick={() => onSelectDossier(dossier, classeur)}
                                                        >
                                                            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                            <span className="truncate flex-1">{dossier.name}</span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {dossierFichierCount}
                                                            </span>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
