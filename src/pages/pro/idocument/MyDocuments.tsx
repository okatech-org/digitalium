/**
 * MyDocuments - Main iDocument page showing user's documents
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
    FileText,
    MoreVertical,
    Share2,
    PenTool,
    Archive,
    Clock,
    User,
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

// Mock data
const MOCK_DOCUMENTS = [
    {
        id: '1',
        title: 'Contrat Commercial - Client ABC',
        type: 'contract',
        status: 'En révision',
        statusColor: 'bg-yellow-500/20 text-yellow-500',
        lastEdit: 'Il y a 2h par Marie',
        collaborators: ['M', 'J', 'P'],
    },
    {
        id: '2',
        title: 'Budget Prévisionnel Q1 2026',
        type: 'spreadsheet',
        status: 'Brouillon',
        statusColor: 'bg-gray-500/20 text-gray-500',
        lastEdit: 'Il y a 1j par Vous',
        collaborators: ['V'],
    },
    {
        id: '3',
        title: 'Rapport Annuel 2025',
        type: 'report',
        status: 'Validé',
        statusColor: 'bg-green-500/20 text-green-500',
        lastEdit: 'Il y a 3j par Jean',
        collaborators: ['J', 'S', 'M', 'P'],
    },
    {
        id: '4',
        title: 'Proposition Commerciale - Projet XYZ',
        type: 'proposal',
        status: 'Brouillon',
        statusColor: 'bg-gray-500/20 text-gray-500',
        lastEdit: 'Il y a 5h par Vous',
        collaborators: ['V', 'M'],
    },
    {
        id: '5',
        title: 'Procédure Interne - Onboarding',
        type: 'procedure',
        status: 'Publié',
        statusColor: 'bg-blue-500/20 text-blue-500',
        lastEdit: 'Il y a 2 semaines par RH',
        collaborators: ['R'],
    },
    {
        id: '6',
        title: 'Note de Frais - Janvier 2026',
        type: 'expense',
        status: 'En révision',
        statusColor: 'bg-yellow-500/20 text-yellow-500',
        lastEdit: 'Il y a 1h par Comptabilité',
        collaborators: ['V', 'C'],
    },
];

interface OutletContext {
    viewMode: 'grid' | 'list';
}

export default function MyDocuments() {
    const { viewMode } = useOutletContext<OutletContext>();

    return (
        <div>
            {/* Stats bar */}
            <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                <span>{MOCK_DOCUMENTS.length} documents</span>
                <span>•</span>
                <span>3 en cours d'édition</span>
                <span>•</span>
                <span>2 partagés</span>
            </div>

            {/* Documents */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {MOCK_DOCUMENTS.map((doc, i) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="group cursor-pointer hover:border-blue-500/50 transition-all">
                                <CardContent className="p-4">
                                    {/* Icon & Actions */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 rounded-lg bg-blue-500/10 group-hover:scale-110 transition-transform">
                                            <FileText className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Share2 className="h-4 w-4 mr-2" />
                                                    Partager
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <PenTool className="h-4 w-4 mr-2" />
                                                    Envoyer à signature
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Archive className="h-4 w-4 mr-2" />
                                                    Archiver
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-500">
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-medium text-sm mb-2 line-clamp-2">{doc.title}</h3>

                                    {/* Status */}
                                    <Badge variant="secondary" className={cn('text-xs mb-3', doc.statusColor)}>
                                        {doc.status}
                                    </Badge>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {doc.lastEdit}
                                        </span>
                                        <div className="flex -space-x-2">
                                            {doc.collaborators.slice(0, 3).map((c, i) => (
                                                <div
                                                    key={i}
                                                    className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium"
                                                >
                                                    {c}
                                                </div>
                                            ))}
                                            {doc.collaborators.length > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                                                    +{doc.collaborators.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {MOCK_DOCUMENTS.map((doc, i) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-center gap-4 p-4 rounded-lg border hover:border-blue-500/50 transition-all cursor-pointer group"
                        >
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <FileText className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{doc.title}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    {doc.lastEdit}
                                </p>
                            </div>
                            <Badge variant="secondary" className={cn('text-xs', doc.statusColor)}>
                                {doc.status}
                            </Badge>
                            <div className="flex -space-x-2">
                                {doc.collaborators.slice(0, 3).map((c, i) => (
                                    <div
                                        key={i}
                                        className="w-7 h-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium"
                                    >
                                        {c}
                                    </div>
                                ))}
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Partager
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <PenTool className="h-4 w-4 mr-2" />
                                        Envoyer à signature
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Archive className="h-4 w-4 mr-2" />
                                        Archiver
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
