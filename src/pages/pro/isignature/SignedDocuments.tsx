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

// Mock data
const MOCK_SIGNED = [
    {
        id: '1',
        title: 'Contrat CDI - Sophie Martin',
        signedAt: '22/01/2026',
        initiator: 'RH',
        signers: ['RH', 'Sophie M.', 'Direction'],
        certified: true,
        hash: 'a3f8c2d1',
    },
    {
        id: '2',
        title: 'Avenant Bail Commercial',
        signedAt: '20/01/2026',
        initiator: 'Juridique',
        signers: ['Juridique', 'Bailleur', 'Vous'],
        certified: true,
        hash: 'b7e4f5a2',
    },
    {
        id: '3',
        title: 'Bon de Commande #2024-089',
        signedAt: '18/01/2026',
        initiator: 'Achats',
        signers: ['Achats', 'Fournisseur'],
        certified: true,
        hash: 'c9d2e8b3',
    },
    {
        id: '4',
        title: 'NDA - Partenaire Tech',
        signedAt: '15/01/2026',
        initiator: 'Vous',
        signers: ['Vous', 'Partenaire', 'Juridique'],
        certified: true,
        hash: 'd1a3f7c4',
    },
    {
        id: '5',
        title: 'Procès-verbal Conseil d\'Administration',
        signedAt: '12/01/2026',
        initiator: 'Secrétariat',
        signers: ['Secrétariat', 'Président', 'Administrateurs'],
        certified: true,
        hash: 'e5b2c9d6',
    },
    {
        id: '6',
        title: 'Contrat Maintenance Annuelle',
        signedAt: '10/01/2026',
        initiator: 'IT',
        signers: ['IT', 'Prestataire', 'Finance'],
        certified: true,
        hash: 'f8a4d3e7',
    },
];

export default function SignedDocuments() {
    const [searchQuery, setSearchQuery] = useState('');
    const [periodFilter, setPeriodFilter] = useState('all');

    const filteredDocs = MOCK_SIGNED.filter(doc => {
        if (searchQuery) {
            return doc.title.toLowerCase().includes(searchQuery.toLowerCase());
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
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
