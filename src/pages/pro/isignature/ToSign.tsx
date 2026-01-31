/**
 * ToSign - Documents awaiting user's signature
 * A4 Miniature Grid Layout with actions below each document
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    PenTool,
    Clock,
    User,
    AlertCircle,
    MoreVertical,
    Eye,
    Download,
    Calendar,
    CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useSignatureSearch } from './ISignatureLayout';
import { useSpaceFromUrl } from '@/contexts/SpaceContext';
import { digitaliumSignatures } from '@/data/digitaliumMockData';

// Generate signature data based on context
const generateContextualSignatures = (isBackoffice: boolean) => {
    if (!isBackoffice) {
        return []; // Pro space - empty (would come from database)
    }

    // SubAdmin backoffice - Digitalium pending signatures
    return digitaliumSignatures
        .filter(sig => sig.status === 'pending')
        .map(sig => ({
            id: sig.id,
            title: sig.title,
            initiatedBy: {
                name: sig.signers[0]?.name || 'Digitalium',
                initials: (sig.signers[0]?.name || 'DG').split(' ').map(n => n[0]).join(''),
            },
            createdAt: sig.createdAt,
            deadline: sig.deadline || 'Pas de limite',
            urgent: sig.type === 'contract',
            type: sig.type,
            signers: sig.signers.map(s => ({
                name: s.name,
                initials: s.name.split(' ').map(n => n[0]).join(''),
                signed: s.status === 'signed',
                date: s.signedAt,
                current: s.status === 'pending',
            })),
        }));
};

// Generate document preview content based on type
const getDocumentPreviewContent = (doc: { title: string; type: string; deadline: string; createdAt: string }): string[] => {
    const baseContent: Record<string, string[]> = {
        contract: [
            "CONTRAT DE PRESTATION",
            "",
            doc.title,
            "",
            "Entre les soussignés,",
            "",
            "D'une part, la société...",
            "Et d'autre part, le client...",
            "",
            "Il a été convenu ce qui suit:",
            "",
            "Article 1 - Objet",
        ],
        nda: [
            "ACCORD DE CONFIDENTIALITÉ",
            "",
            doc.title,
            "",
            "Les parties conviennent de:",
            "",
            "1. Définition des informations",
            "2. Obligations de confidentialité",
            "3. Durée de l'engagement",
        ],
        amendment: [
            "AVENANT AU CONTRAT",
            "",
            doc.title,
            "",
            "Les parties au contrat initial",
            "conviennent de modifier:",
            "",
            "Article 1 - Modifications",
        ],
        invoice: [
            "FACTURE",
            doc.title,
            "",
            "Date: " + doc.createdAt,
            "",
            "Montant TTC: ...",
        ],
    };
    return baseContent[doc.type] || baseContent.contract;
};

export default function ToSign() {
    const { searchQuery } = useSignatureSearch();
    const { isBackoffice } = useSpaceFromUrl();

    const documents = generateContextualSignatures(isBackoffice);

    const filteredDocs = documents.filter(doc => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            doc.title.toLowerCase().includes(query) ||
            doc.initiatedBy.name.toLowerCase().includes(query)
        );
    });

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
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
                    <h2 className="text-lg font-semibold">À signer</h2>
                    <p className="text-sm text-muted-foreground">
                        {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} en attente de votre signature
                    </p>
                </div>
            </div>

            {/* A4 Document Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
            >
                {filteredDocs.map((doc) => {
                    const signedCount = doc.signers.filter(s => s.signed).length;
                    const totalSigners = doc.signers.length;
                    const progress = (signedCount / totalSigners) * 100;
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
                                doc.urgent
                                    ? "border-orange-500/50 ring-2 ring-orange-500/20"
                                    : "border-gray-200 dark:border-zinc-700 hover:border-purple-500/50 hover:shadow-xl"
                            )}>
                                {/* Urgent Badge */}
                                {doc.urgent && (
                                    <div className="absolute top-2 left-2 z-20">
                                        <Badge variant="secondary" className="bg-orange-500/90 text-white text-[9px] px-1.5">
                                            <AlertCircle className="h-2.5 w-2.5 mr-1" />
                                            Urgent
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
                                                Aperçu
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="h-4 w-4 mr-2" />
                                                Télécharger
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Document Content Preview */}
                                <div className="absolute inset-0 p-3 overflow-hidden">
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

                                {/* Progress Indicator */}
                                <div className="absolute bottom-2 left-2 right-2">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        {doc.signers.slice(0, 3).map((signer, j) => (
                                            <Avatar key={j} className={cn(
                                                "h-4 w-4 border",
                                                signer.signed ? "border-green-500" : signer.current ? "border-purple-500" : "border-gray-300"
                                            )}>
                                                <AvatarFallback className={cn(
                                                    "text-[6px]",
                                                    signer.signed ? "bg-green-500/20 text-green-600" : signer.current ? "bg-purple-500/20 text-purple-600" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {signer.initials}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {doc.signers.length > 3 && (
                                            <span className="text-[8px] text-muted-foreground">+{doc.signers.length - 3}</span>
                                        )}
                                    </div>
                                    <Progress value={progress} className="h-1" />
                                </div>

                                {/* Corner Fold */}
                                <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-700 dark:to-zinc-600"
                                    style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
                            </div>

                            {/* Document Info Below A4 */}
                            <div className="mt-3 space-y-2 px-1">
                                <h4 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight group-hover:text-purple-500 transition-colors">
                                    {doc.title}
                                </h4>

                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span className="truncate">{doc.initiatedBy.name}</span>
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {doc.deadline}
                                    </span>
                                    <Badge variant="outline" className="text-[9px] px-1.5 h-4 text-purple-500 border-purple-500/30">
                                        {signedCount}/{totalSigners}
                                    </Badge>
                                </div>

                                {/* Sign Button */}
                                <Button size="sm" className="w-full bg-purple-500 hover:bg-purple-600 h-8 text-xs">
                                    <PenTool className="h-3 w-3 mr-1.5" />
                                    Signer
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
                        <div className="p-4 rounded-full bg-purple-500/10 w-fit mx-auto mb-4">
                            <PenTool className="h-10 w-10 text-purple-500/50" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Aucun document à signer</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Vous n'avez aucun document en attente de votre signature.
                            Les nouveaux documents apparaîtront ici.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
