/**
 * Trash - Deleted documents (recoverable within 30 days)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
    FileText,
    MoreVertical,
    RotateCcw,
    Trash2,
    Clock,
    AlertTriangle,
    Search,
    CheckSquare,
    Square,
    XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

// Mock deleted documents
const MOCK_TRASH_DOCUMENTS = [
    {
        id: '1',
        title: 'Brouillon - Proposition XYZ',
        type: 'document',
        deletedAt: 'Il y a 2 heures',
        deletedBy: 'Vous',
        expiresIn: '30 jours',
        size: '245 KB',
        isExpiringSoon: false,
    },
    {
        id: '2',
        title: 'Notes Réunion - 15 Jan 2026',
        type: 'note',
        deletedAt: 'Il y a 1 jour',
        deletedBy: 'Vous',
        expiresIn: '29 jours',
        size: '12 KB',
        isExpiringSoon: false,
    },
    {
        id: '3',
        title: 'Budget 2025 - v1 (obsolète)',
        type: 'spreadsheet',
        deletedAt: 'Il y a 1 semaine',
        deletedBy: 'Vous',
        expiresIn: '23 jours',
        size: '1.2 MB',
        isExpiringSoon: false,
    },
    {
        id: '4',
        title: 'Contrat Annulé - Client ABC',
        type: 'contract',
        deletedAt: 'Il y a 3 semaines',
        deletedBy: 'Marie D.',
        expiresIn: '9 jours',
        size: '567 KB',
        isExpiringSoon: true,
    },
    {
        id: '5',
        title: 'Logo ancien - v2',
        type: 'image',
        deletedAt: 'Il y a 25 jours',
        deletedBy: 'Vous',
        expiresIn: '5 jours',
        size: '2.1 MB',
        isExpiringSoon: true,
    },
    {
        id: '6',
        title: 'Rapport Test - Brouillon',
        type: 'report',
        deletedAt: 'Il y a 28 jours',
        deletedBy: 'Jean M.',
        expiresIn: '2 jours',
        size: '89 KB',
        isExpiringSoon: true,
    },
];

interface OutletContext {
    viewMode: 'grid' | 'list';
}

export default function Trash() {
    const { viewMode } = useOutletContext<OutletContext>();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDocuments = MOCK_TRASH_DOCUMENTS.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedItems.length === filteredDocuments.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredDocuments.map(d => d.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const expiringSoonCount = MOCK_TRASH_DOCUMENTS.filter(d => d.isExpiringSoon).length;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-500" />
                        Corbeille
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {MOCK_TRASH_DOCUMENTS.length} documents supprimés • Les éléments sont définitivement supprimés après 30 jours
                    </p>
                </div>
                <div className="flex gap-2">
                    {selectedItems.length > 0 && (
                        <>
                            <Button variant="outline" size="sm" className="gap-2">
                                <RotateCcw className="h-4 w-4" />
                                Restaurer ({selectedItems.length})
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        Supprimer définitivement
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Supprimer définitivement ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Cette action est irréversible. Les {selectedItems.length} document(s) sélectionné(s) seront définitivement supprimés.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction className="bg-red-500 hover:bg-red-600">
                                            Supprimer définitivement
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </div>

            {/* Warning for expiring items */}
            {expiringSoonCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10"
                >
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        <strong>{expiringSoonCount} document(s)</strong> seront définitivement supprimés dans moins de 10 jours.
                        Restaurez-les maintenant si nécessaire.
                    </p>
                </motion.div>
            )}

            {/* Search & Selection */}
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher dans la corbeille..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                    {selectedItems.length === filteredDocuments.length ? (
                        <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Désélectionner tout
                        </>
                    ) : (
                        <>
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Tout sélectionner
                        </>
                    )}
                </Button>
            </div>

            {/* Documents List */}
            <div className="space-y-2">
                {filteredDocuments.map((doc, i) => (
                    <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={cn(
                            'flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer group',
                            selectedItems.includes(doc.id) && 'border-primary bg-primary/5',
                            doc.isExpiringSoon && 'border-yellow-500/30 bg-yellow-500/5'
                        )}
                        onClick={() => toggleSelect(doc.id)}
                    >
                        <Checkbox
                            checked={selectedItems.includes(doc.id)}
                            onCheckedChange={() => toggleSelect(doc.id)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="p-2 rounded-lg bg-red-500/10">
                            <FileText className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{doc.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                Supprimé {doc.deletedAt} par {doc.deletedBy} • {doc.size}
                            </p>
                        </div>
                        <Badge
                            variant="secondary"
                            className={cn(
                                'text-xs',
                                doc.isExpiringSoon
                                    ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                                    : 'bg-muted'
                            )}
                        >
                            {doc.isExpiringSoon && <AlertTriangle className="h-3 w-3 mr-1" />}
                            Expire dans {doc.expiresIn}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Restaurer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer définitivement
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </motion.div>
                ))}
            </div>

            {filteredDocuments.length === 0 && (
                <div className="text-center py-12">
                    <Trash2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">La corbeille est vide</p>
                </div>
            )}
        </div>
    );
}
