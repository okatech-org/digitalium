/**
 * SignedDocuments - History of completed signatures
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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
const MOCK_SIGNED: { id: string; title: string; signedAt: string; initiator: string; signers: string[]; certified: boolean; hash: string }[] = [];

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

            {/* Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead>Document</TableHead>
                            <TableHead>Signé le</TableHead>
                            <TableHead>Signataires</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDocs.map((doc, i) => (
                            <motion.tr
                                key={doc.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                className="group"
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-500/10">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{doc.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Initié par {doc.initiator}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {doc.signedAt}
                                </TableCell>
                                <TableCell>
                                    <div className="flex -space-x-2">
                                        {doc.signers.slice(0, 3).map((signer, j) => (
                                            <Avatar key={j} className="h-6 w-6 border-2 border-background">
                                                <AvatarFallback className="text-[8px] bg-purple-500/20 text-purple-500">
                                                    {signer.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {doc.signers.length > 3 && (
                                            <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px]">
                                                +{doc.signers.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {doc.certified && (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                                            <Award className="h-3 w-3 mr-1" />
                                            Certifié
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                <MoreVertical className="h-4 w-4" />
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
                                </TableCell>
                            </motion.tr>
                        ))}
                        {filteredDocs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    Aucun document trouvé
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Pagination */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{filteredDocs.length} documents</span>
                <Button variant="outline" size="sm">Voir plus</Button>
            </div>
        </div>
    );
}
