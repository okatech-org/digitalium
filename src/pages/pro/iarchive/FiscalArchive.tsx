/**
 * FiscalArchive - Default iArchive category page (Fiscal documents - 10 years)
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    CheckCircle2,
    Shield,
    Clock,
    Download,
    Eye,
    MoreVertical,
    Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

// Mock data
const MOCK_ARCHIVES = [
    {
        id: '1',
        reference: 'ARCH-2024-00145',
        title: 'Facture Client ABC - Janvier 2024',
        type: 'Facture',
        archivedAt: '15/01/2024',
        retentionEnd: '31/12/2034',
        hash: '8f3e9a2b...',
        verified: true,
        size: '245 KB',
    },
    {
        id: '2',
        reference: 'ARCH-2024-00144',
        title: 'Déclaration TVA Q4 2023',
        type: 'Déclaration',
        archivedAt: '10/01/2024',
        retentionEnd: '31/12/2033',
        hash: '7d2c8b1a...',
        verified: true,
        size: '128 KB',
    },
    {
        id: '3',
        reference: 'ARCH-2024-00143',
        title: 'Facture Fournisseur XYZ - Déc 2023',
        type: 'Facture',
        archivedAt: '05/01/2024',
        retentionEnd: '31/12/2033',
        hash: '6e1d7c0f...',
        verified: true,
        size: '312 KB',
    },
    {
        id: '4',
        reference: 'ARCH-2023-01234',
        title: 'Bilan Comptable 2023',
        type: 'Bilan',
        archivedAt: '20/12/2023',
        retentionEnd: '31/12/2033',
        hash: '5f0e6b9d...',
        verified: true,
        size: '1.2 MB',
    },
    {
        id: '5',
        reference: 'ARCH-2023-01233',
        title: 'Justificatifs Charges Q4 2023',
        type: 'Justificatif',
        archivedAt: '18/12/2023',
        retentionEnd: '31/12/2033',
        hash: '4a9f5c8e...',
        verified: true,
        size: '856 KB',
    },
];

export default function FiscalArchive() {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Archive Fiscale</h2>
                    <p className="text-sm text-muted-foreground">
                        2,847 documents • Conservation légale 10 ans
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        100% conforme
                    </Badge>
                </div>
            </div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border rounded-lg"
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[140px]">Référence</TableHead>
                            <TableHead>Document</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Archivé le</TableHead>
                            <TableHead>Expiration</TableHead>
                            <TableHead>Intégrité</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_ARCHIVES.map((doc, i) => (
                            <motion.tr
                                key={doc.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group"
                            >
                                <TableCell className="font-mono text-xs">
                                    {doc.reference}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{doc.title}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{doc.type}</Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {doc.archivedAt}
                                </TableCell>
                                <TableCell>
                                    <span className="flex items-center gap-1 text-sm">
                                        <Clock className="h-3 w-3" />
                                        {doc.retentionEnd}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {doc.verified ? (
                                            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Vérifiée
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                                                En attente
                                            </Badge>
                                        )}
                                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                            <Hash className="h-3 w-3" />
                                            {doc.hash}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
                                                Télécharger
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Shield className="h-4 w-4 mr-2" />
                                                Vérifier intégrité
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Certificat de dépôt
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
            </motion.div>
        </div>
    );
}
