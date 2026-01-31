/**
 * SignedDocuments - History of completed signatures
 * A4 Miniature Grid Layout with actions below each document
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    CheckCircle2,
    Download,
    Award,
    Eye,
    Clock,
    Calendar,
    Filter,
    Search,
    MoreVertical,
    Shield,
    User,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSignatureSearch } from './ISignatureLayout';

// Mock data - REMOVED: Data now comes from database
const MOCK_SIGNED: { id: string; title: string; signedAt: string; initiator: string; signers: string[]; certified: boolean; hash: string; type?: string }[] = [];

// Generate document preview content
const getDocumentPreviewContent = (doc: { title: string; signedAt: string; hash: string }): string[] => {
    return [
        "DOCUMENT SIGNÉ",
        "",
        doc.title,
        "",
        "Signé le " + doc.signedAt,
        "",
        "✓ Signature validée",
        "✓ Document certifié",
        "",
        "Hash: " + doc.hash.substring(0, 8) + "...",
    ];
};

export default function SignedDocuments() {
    const { searchQuery: globalSearchQuery } = useSignatureSearch();
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [periodFilter, setPeriodFilter] = useState('all');

    // Use global search if present, otherwise use local search
    const searchQuery = globalSearchQuery || localSearchQuery;

    // Parse DD/MM/YYYY date format
    const parseDate = (dateStr: string): Date => {
        const [day, month, year] = dateStr.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    };

    const filteredDocs = MOCK_SIGNED.filter(doc => {
        // Search filter
        if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Period filter
        if (periodFilter !== 'all') {
            const signedDate = parseDate(doc.signedAt);
            const now = new Date();

            switch (periodFilter) {
                case 'week': {
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (signedDate < weekAgo) return false;
                    break;
                }
                case 'month': {
                    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    if (signedDate < monthAgo) return false;
                    break;
                }
                case 'quarter': {
                    const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                    if (signedDate < quarterAgo) return false;
                    break;
                }
            }
        }

        return true;
    });

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.03 } }
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Documents signés</h2>
                    <p className="text-sm text-muted-foreground">
                        Historique de vos signatures électroniques
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                        <Shield className="h-3 w-3 mr-1" />
                        {MOCK_SIGNED.length} certifiés
                    </Badge>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher..."
                        value={globalSearchQuery || localSearchQuery}
                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                        className="pl-9"
                        aria-label="Rechercher dans les documents signés"
                    />
                </div>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="w-40">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tout</SelectItem>
                        <SelectItem value="week">Cette semaine</SelectItem>
                        <SelectItem value="month">Ce mois</SelectItem>
                        <SelectItem value="quarter">Ce trimestre</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* A4 Document Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
            >
                {filteredDocs.map((doc) => {
                    const previewLines = getDocumentPreviewContent(doc);

                    return (
                        <motion.div
                            key={doc.id}
                            variants={item}
                            className="group cursor-pointer"
                        >
                            {/* A4 Document Thumbnail */}
                            <div className={cn(
                                "relative bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden",
                                "aspect-[210/297]",
                                "border-2 transition-all duration-200",
                                "border-green-300 dark:border-green-700 hover:border-green-500 hover:shadow-xl"
                            )}>
                                {/* Certified Badge */}
                                {doc.certified && (
                                    <div className="absolute top-2 left-2 z-20">
                                        <Badge variant="secondary" className="bg-green-500/90 text-white text-[9px] px-1.5">
                                            <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                                            Certifié
                                        </Badge>
                                    </div>
                                )}

                                {/* Action Menu */}
                                <div className="absolute top-2 right-2 z-20">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Voir le document
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="h-4 w-4 mr-2" />
                                                Télécharger (PDF)
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Award className="h-4 w-4 mr-2" />
                                                Certificat de signature
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Document Content Preview */}
                                <div className="absolute inset-0 p-3 pt-8 overflow-hidden">
                                    <div className="text-[6px] leading-[8px] text-gray-700 dark:text-gray-300 font-mono select-none">
                                        {previewLines.map((line, i) => (
                                            <div key={i} className={`${i === 0 ? 'font-bold text-[7px] text-gray-900 dark:text-white' : ''} truncate`}>
                                                {line || '\u00A0'}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Gradient Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-zinc-900 via-white/95 dark:via-zinc-900/95 to-transparent" />

                                {/* Signers Avatars */}
                                <div className="absolute bottom-2 left-2 right-2">
                                    <div className="flex -space-x-1">
                                        {doc.signers.slice(0, 4).map((signer, j) => (
                                            <Avatar key={j} className="h-4 w-4 border border-white dark:border-zinc-900">
                                                <AvatarFallback className="text-[6px] bg-green-500/20 text-green-600">
                                                    {signer.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {doc.signers.length > 4 && (
                                            <div className="h-4 w-4 rounded-full bg-muted border border-white dark:border-zinc-900 flex items-center justify-center text-[6px]">
                                                +{doc.signers.length - 4}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Corner Fold */}
                                <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-700 dark:to-zinc-600"
                                    style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
                            </div>

                            {/* Document Info Below A4 */}
                            <div className="mt-3 space-y-2 px-1">
                                <h4 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight group-hover:text-green-500 transition-colors">
                                    {doc.title}
                                </h4>

                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span className="truncate">{doc.initiator}</span>
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {doc.signedAt}
                                    </span>
                                    {doc.certified && (
                                        <Badge variant="secondary" className="text-[9px] px-1.5 h-4 bg-green-500/10 text-green-500">
                                            <Award className="h-2.5 w-2.5 mr-1" />
                                            Certifié
                                        </Badge>
                                    )}
                                </div>

                                {/* Download Button */}
                                <Button variant="outline" size="sm" className="w-full h-8 text-xs border-green-500/30 text-green-600 hover:bg-green-500/10">
                                    <Download className="h-3 w-3 mr-1.5" />
                                    Télécharger
                                </Button>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Empty state */}
            {filteredDocs.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                        <div className="p-4 rounded-full bg-green-500/10 w-fit mx-auto mb-4">
                            <CheckCircle2 className="h-10 w-10 text-green-500/50" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Aucun document signé</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Vos documents signés apparaîtront ici.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {filteredDocs.length > 0 && (
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{filteredDocs.length} documents</span>
                    <Button variant="outline" size="sm">Voir plus</Button>
                </div>
            )}
        </div>
    );
}
