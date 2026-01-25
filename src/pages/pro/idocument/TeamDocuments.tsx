/**
 * TeamDocuments - Documents shared within the team/organization
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
    FileText,
    MoreVertical,
    Download,
    Eye,
    Clock,
    Users,
    FolderOpen,
    Building2,
    Star,
    StarOff,
    Share2,
    Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock team folders
const TEAM_FOLDERS = [
    { id: 'f1', name: 'Direction Générale', count: 24, icon: Building2, color: 'text-purple-500 bg-purple-500/10' },
    { id: 'f2', name: 'Ressources Humaines', count: 45, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { id: 'f3', name: 'Finance & Comptabilité', count: 89, icon: FileText, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'f4', name: 'Commercial', count: 156, icon: Star, color: 'text-amber-500 bg-amber-500/10' },
];

// Mock team documents
const MOCK_TEAM_DOCUMENTS = [
    {
        id: '1',
        title: 'Organigramme Entreprise 2026',
        folder: 'Direction Générale',
        folderColor: 'text-purple-500',
        lastEdit: 'Il y a 1 jour',
        editedBy: 'Direction',
        starred: true,
        locked: false,
    },
    {
        id: '2',
        title: 'Grille Salariale - Confidentiel',
        folder: 'Ressources Humaines',
        folderColor: 'text-blue-500',
        lastEdit: 'Il y a 3 jours',
        editedBy: 'RH',
        starred: false,
        locked: true,
    },
    {
        id: '3',
        title: 'Rapport Financier Q4 2025',
        folder: 'Finance & Comptabilité',
        folderColor: 'text-emerald-500',
        lastEdit: 'Il y a 1 semaine',
        editedBy: 'Comptabilité',
        starred: true,
        locked: false,
    },
    {
        id: '4',
        title: 'Catalogue Produits 2026',
        folder: 'Commercial',
        folderColor: 'text-amber-500',
        lastEdit: 'Il y a 2 jours',
        editedBy: 'Marketing',
        starred: false,
        locked: false,
    },
    {
        id: '5',
        title: 'Procédure Onboarding Employés',
        folder: 'Ressources Humaines',
        folderColor: 'text-blue-500',
        lastEdit: 'Il y a 2 semaines',
        editedBy: 'RH',
        starred: true,
        locked: false,
    },
    {
        id: '6',
        title: 'Plan Stratégique 2026-2028',
        folder: 'Direction Générale',
        folderColor: 'text-purple-500',
        lastEdit: 'Il y a 5 jours',
        editedBy: 'Direction',
        starred: true,
        locked: true,
    },
];

interface OutletContext {
    viewMode: 'grid' | 'list';
}

export default function TeamDocuments() {
    const { viewMode } = useOutletContext<OutletContext>();

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-500" />
                        Documents de l'Équipe
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Accédez aux documents partagés par votre organisation
                    </p>
                </div>
            </div>

            {/* Team Folders */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {TEAM_FOLDERS.map((folder, i) => {
                    const FolderIcon = folder.icon;
                    return (
                        <motion.div
                            key={folder.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="cursor-pointer hover:border-primary/50 transition-all group">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className={cn('p-2 rounded-lg', folder.color.split(' ')[1])}>
                                        <FolderIcon className={cn('h-5 w-5', folder.color.split(' ')[0])} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{folder.name}</p>
                                        <p className="text-xs text-muted-foreground">{folder.count} documents</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Section Title */}
            <h3 className="font-medium mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Documents récents
            </h3>

            {/* Documents Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {MOCK_TEAM_DOCUMENTS.map((doc, i) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="group cursor-pointer hover:border-orange-500/50 transition-all">
                                <CardContent className="p-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 rounded-lg bg-orange-500/10">
                                            <FileText className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {doc.starred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                                            {doc.locked && <Lock className="h-4 w-4 text-red-500" />}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Ouvrir
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Télécharger
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Share2 className="h-4 w-4 mr-2" />
                                                        Partager
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        {doc.starred ? (
                                                            <>
                                                                <StarOff className="h-4 w-4 mr-2" />
                                                                Retirer des favoris
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Star className="h-4 w-4 mr-2" />
                                                                Ajouter aux favoris
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-medium text-sm mb-2 line-clamp-2">{doc.title}</h3>

                                    {/* Folder Badge */}
                                    <Badge variant="outline" className={cn('text-xs mb-3', doc.folderColor)}>
                                        <FolderOpen className="h-3 w-3 mr-1" />
                                        {doc.folder}
                                    </Badge>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {doc.lastEdit}
                                        </span>
                                        <span>par {doc.editedBy}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {MOCK_TEAM_DOCUMENTS.map((doc, i) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-center gap-4 p-4 rounded-lg border hover:border-orange-500/50 transition-all cursor-pointer group"
                        >
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <FileText className="h-5 w-5 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium truncate">{doc.title}</h3>
                                    {doc.starred && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                                    {doc.locked && <Lock className="h-3 w-3 text-red-500" />}
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    {doc.lastEdit} par {doc.editedBy}
                                </p>
                            </div>
                            <Badge variant="outline" className={cn('text-xs', doc.folderColor)}>
                                <FolderOpen className="h-3 w-3 mr-1" />
                                {doc.folder}
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Ouvrir
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Download className="h-4 w-4 mr-2" />
                                        Télécharger
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
