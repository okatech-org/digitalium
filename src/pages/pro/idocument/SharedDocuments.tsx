/**
 * SharedDocuments - Documents shared with the user
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
    FileText,
    MoreVertical,
    Share2,
    Download,
    Eye,
    Clock,
    User,
    Users,
    Link2,
    ExternalLink,
    UserPlus,
    Copy,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock data for shared documents
const MOCK_SHARED_DOCUMENTS = [
    {
        id: '1',
        title: 'Budget Marketing Q1 2026',
        type: 'spreadsheet',
        sharedBy: { name: 'Marie Dupont', avatar: '', initials: 'MD' },
        sharedAt: 'Il y a 2 heures',
        permission: 'Modification',
        permissionColor: 'bg-green-500/20 text-green-500',
        expiresAt: null,
    },
    {
        id: '2',
        title: 'Présentation Investisseurs',
        type: 'presentation',
        sharedBy: { name: 'Jean Martin', avatar: '', initials: 'JM' },
        sharedAt: 'Il y a 1 jour',
        permission: 'Lecture seule',
        permissionColor: 'bg-blue-500/20 text-blue-500',
        expiresAt: '15 Feb 2026',
    },
    {
        id: '3',
        title: 'Contrat Partenariat - XYZ Corp',
        type: 'contract',
        sharedBy: { name: 'Pierre Lefebvre', avatar: '', initials: 'PL' },
        sharedAt: 'Il y a 3 jours',
        permission: 'Commentaire',
        permissionColor: 'bg-yellow-500/20 text-yellow-500',
        expiresAt: null,
    },
    {
        id: '4',
        title: 'Rapport Technique - Audit Sécurité',
        type: 'report',
        sharedBy: { name: 'Sophie Bernard', avatar: '', initials: 'SB' },
        sharedAt: 'Il y a 1 semaine',
        permission: 'Lecture seule',
        permissionColor: 'bg-blue-500/20 text-blue-500',
        expiresAt: '01 Mar 2026',
    },
    {
        id: '5',
        title: 'Procédures RH - Télétravail',
        type: 'procedure',
        sharedBy: { name: 'RH Team', avatar: '', initials: 'RH' },
        sharedAt: 'Il y a 2 semaines',
        permission: 'Lecture seule',
        permissionColor: 'bg-blue-500/20 text-blue-500',
        expiresAt: null,
    },
];

interface OutletContext {
    viewMode: 'grid' | 'list';
}

export default function SharedDocuments() {
    const { viewMode } = useOutletContext<OutletContext>();

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-blue-500" />
                        Documents Partagés avec moi
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {MOCK_SHARED_DOCUMENTS.length} documents partagés par d'autres utilisateurs
                    </p>
                </div>
            </div>

            {/* Documents Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {MOCK_SHARED_DOCUMENTS.map((doc, i) => (
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
                                        <div className="p-2 rounded-lg bg-blue-500/10">
                                            <Share2 className="h-5 w-5 text-blue-500" />
                                        </div>
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
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Copier dans Mes Documents
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-500">
                                                    Retirer des partages
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-medium text-sm mb-2 line-clamp-2">{doc.title}</h3>

                                    {/* Permission Badge */}
                                    <Badge variant="secondary" className={cn('text-xs mb-3', doc.permissionColor)}>
                                        {doc.permission}
                                    </Badge>

                                    {/* Shared by */}
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Avatar className="h-5 w-5">
                                            <AvatarFallback className="text-[10px]">{doc.sharedBy.initials}</AvatarFallback>
                                        </Avatar>
                                        <span>Par {doc.sharedBy.name}</span>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {doc.sharedAt}
                                        </span>
                                        {doc.expiresAt && (
                                            <span className="text-yellow-500">
                                                Expire: {doc.expiresAt}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {MOCK_SHARED_DOCUMENTS.map((doc, i) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-center gap-4 p-4 rounded-lg border hover:border-blue-500/50 transition-all cursor-pointer group"
                        >
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Share2 className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{doc.title}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Avatar className="h-4 w-4">
                                        <AvatarFallback className="text-[8px]">{doc.sharedBy.initials}</AvatarFallback>
                                    </Avatar>
                                    Par {doc.sharedBy.name} • {doc.sharedAt}
                                </p>
                            </div>
                            <Badge variant="secondary" className={cn('text-xs', doc.permissionColor)}>
                                {doc.permission}
                            </Badge>
                            {doc.expiresAt && (
                                <span className="text-xs text-yellow-500">
                                    Expire: {doc.expiresAt}
                                </span>
                            )}
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
