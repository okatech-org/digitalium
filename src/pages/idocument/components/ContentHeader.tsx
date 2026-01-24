
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, LayoutGrid, List, SlidersHorizontal, Plus, ChevronRight } from "lucide-react";
import { IClasseur, IDossier, IFichier, SortType, NavigationLevel } from '../types';

interface ContentHeaderProps {
    navigationLevel: NavigationLevel;
    selectedClasseur: IClasseur | null;
    selectedDossier: IDossier | null;
    selectedFichier: IFichier | null;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    viewMode: 'list' | 'grid';
    onToggleViewMode: (mode: 'list' | 'grid') => void;
    sortBy: SortType;
    onSortChange: (sort: SortType) => void;
    onImport: () => void;
    onNew: () => void;
    onNavigateToClasseurs: () => void;
    onNavigateToDossiers: () => void;
    onNavigateToFichiers: () => void;
}

export function ContentHeader({
    navigationLevel,
    selectedClasseur,
    selectedDossier,
    selectedFichier,
    searchQuery,
    onSearchChange,
    viewMode,
    onToggleViewMode,
    sortBy,
    onSortChange,
    onImport,
    onNew,
    onNavigateToClasseurs,
    onNavigateToDossiers,
    onNavigateToFichiers
}: ContentHeaderProps) {

    // Dynamic button label based on level
    const getNewButtonLabel = () => {
        switch (navigationLevel) {
            case 'classeurs': return 'Nouveau Classeur';
            case 'dossiers': return 'Nouveau Dossier';
            case 'fichiers': return 'Nouveau Fichier';
            default: return 'Nouveau';
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground overflow-hidden flex-wrap">
                <button
                    onClick={onNavigateToClasseurs}
                    className={`hover:text-primary transition-colors font-medium flex items-center gap-1 ${navigationLevel === 'classeurs' ? 'text-foreground' : ''}`}
                >
                    <span>📚</span>
                    <span>Classeurs</span>
                </button>

                {selectedClasseur && (
                    <>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        <button
                            onClick={onNavigateToDossiers}
                            disabled={navigationLevel === 'dossiers' && !selectedDossier}
                            className={`flex items-center gap-1 transition-colors max-w-[180px] ${navigationLevel === 'dossiers' && !selectedDossier
                                    ? 'text-foreground font-semibold cursor-default'
                                    : 'hover:text-primary cursor-pointer'
                                }`}
                        >
                            <span>{selectedClasseur.icon}</span>
                            <span className="truncate">{selectedClasseur.name}</span>
                        </button>
                    </>
                )}

                {selectedDossier && (
                    <>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        <button
                            onClick={onNavigateToFichiers}
                            disabled={navigationLevel === 'fichiers' && !selectedFichier}
                            className={`flex items-center gap-1 transition-colors max-w-[180px] ${navigationLevel === 'fichiers' && !selectedFichier
                                    ? 'text-foreground font-semibold cursor-default'
                                    : 'hover:text-primary cursor-pointer'
                                }`}
                        >
                            <span>{selectedDossier.icon}</span>
                            <span className="truncate">{selectedDossier.name}</span>
                        </button>
                    </>
                )}

                {selectedFichier && (
                    <>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        <span className="text-foreground font-semibold truncate max-w-[200px] flex items-center gap-1">
                            📄 {selectedFichier.name}
                        </span>
                    </>
                )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-3 flex-wrap w-full xl:w-auto xl:justify-end">

                {/* Search */}
                {navigationLevel !== 'details' && (
                    <div className="relative flex-1 min-w-[200px] md:max-w-xs group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-9 rounded-xl border-border/40 bg-card h-11"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                )}

                {/* View Toggle */}
                {navigationLevel !== 'details' && (
                    <div className="bg-card border border-border/40 p-1 rounded-xl flex items-center shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-9 w-9 p-0 rounded-lg ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => onToggleViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-9 w-9 p-0 rounded-lg ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => onToggleViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Sort */}
                {navigationLevel !== 'details' && (
                    <Select value={sortBy} onValueChange={(val: SortType) => onSortChange(val)}>
                        <SelectTrigger className="w-[160px] h-11 border-border/40 rounded-xl shrink-0">
                            <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue>
                                {sortBy === 'date_desc' && 'Plus récents'}
                                {sortBy === 'date_asc' && 'Plus anciens'}
                                {sortBy === 'name' && 'Nom (A-Z)'}
                                {sortBy === 'type' && 'Type'}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="date_desc">Plus récents</SelectItem>
                            <SelectItem value="date_asc">Plus anciens</SelectItem>
                            <SelectItem value="name">Nom (A-Z)</SelectItem>
                            <SelectItem value="type">Type</SelectItem>
                        </SelectContent>
                    </Select>
                )}

                {navigationLevel !== 'details' && (
                    <>
                        <div className="h-8 w-px bg-border/40 mx-1 hidden xl:block"></div>

                        {navigationLevel === 'fichiers' && (
                            <Button variant="outline" onClick={onImport} className="h-11 hidden sm:flex shrink-0">
                                Import
                            </Button>
                        )}
                        <Button onClick={onNew} className="bg-primary hover:bg-primary/90 text-white shadow-lg h-11 rounded-xl px-5 shrink-0">
                            <Plus className="h-4 w-4 mr-2" />
                            {getNewButtonLabel()}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
