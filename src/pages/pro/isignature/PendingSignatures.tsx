/**
 * PendingSignatures - Documents sent by user, awaiting signatures from others
 * A4 Miniature Grid Layout with actions below each document
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Clock,
    User,
    MoreVertical,
    RefreshCw,
    XCircle,
    Bell,
    Eye,
    Mail,
    Users,
    CheckCircle2,
    Download,
    Calendar,
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
    DropdownMenuSeparator,
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
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useSignatureSearch } from './ISignatureLayout';

// Mock data - REMOVED: Data now comes from database
const MOCK_PENDING: { id: string; title: string; sentAt: string; deadline: string; type: string; signers: { name: string; initials: string; signed: boolean; date?: string; lastReminder?: string }[] }[] = [];

// Generate document preview content
const getDocumentPreviewContent = (doc: { title: string; type?: string; sentAt: string }): string[] => {
    return [
        "DOCUMENT EN ATTENTE",
        "",
        doc.title,
        "",
        "Envoyé le " + doc.sentAt,
        "",
        "En attente de signatures",
        "des destinataires...",
        "",
        "Statut: En cours",
    ];
};

export default function PendingSignatures() {
    const [docToCancel, setDocToCancel] = useState<string | null>(null);
    const docInfo = MOCK_PENDING.find(d => d.id === docToCancel);
    const { searchQuery } = useSignatureSearch();

    const filteredDocs = MOCK_PENDING.filter(doc => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return doc.title.toLowerCase().includes(query);
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
                    <h2 className="text-lg font-semibold">En attente</h2>
                    <p className="text-sm text-muted-foreground">
                        {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} envoyé{filteredDocs.length !== 1 ? 's' : ''} en attente de signatures
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                </Button>
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
                    const pendingSigners = doc.signers.filter(s => !s.signed);
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
                                "border-blue-300 dark:border-blue-700 hover:border-blue-500 hover:shadow-xl"
                            )}>
                                {/* Status Badge */}
                                <div className="absolute top-2 left-2 z-20">
                                    <Badge variant="secondary" className="bg-blue-500/90 text-white text-[9px] px-1.5">
                                        <Clock className="h-2.5 w-2.5 mr-1" />
                                        En attente
                                    </Badge>
                                </div>

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
                                                <Mail className="h-4 w-4 mr-2" />
                                                Relancer tous
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-500"
                                                onClick={() => setDocToCancel(doc.id)}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Annuler la demande
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

                                {/* Signers Progress Indicator */}
                                <div className="absolute bottom-2 left-2 right-2">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        {doc.signers.slice(0, 3).map((signer, j) => (
                                            <Avatar key={j} className={cn(
                                                "h-4 w-4 border",
                                                signer.signed ? "border-green-500" : "border-orange-500"
                                            )}>
                                                <AvatarFallback className={cn(
                                                    "text-[6px]",
                                                    signer.signed ? "bg-green-500/20 text-green-600" : "bg-orange-500/20 text-orange-600"
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
                                <h4 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight group-hover:text-blue-500 transition-colors">
                                    {doc.title}
                                </h4>

                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>Envoyé le {doc.sentAt}</span>
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {doc.deadline}
                                    </span>
                                    <Badge variant="secondary" className="text-[9px] px-1.5 h-4 bg-blue-500/10 text-blue-500">
                                        <Users className="h-2.5 w-2.5 mr-1" />
                                        {signedCount}/{totalSigners}
                                    </Badge>
                                </div>

                                {/* Remind Button */}
                                {pendingSigners.length > 0 && (
                                    <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                                        <Bell className="h-3 w-3 mr-1.5" />
                                        Relancer ({pendingSigners.length})
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Empty state */}
            {filteredDocs.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-muted-foreground">Aucun document en attente</p>
                    </CardContent>
                </Card>
            )}

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={!!docToCancel} onOpenChange={() => setDocToCancel(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Annuler cette demande ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {docInfo && (
                                <>
                                    Vous êtes sur le point d'annuler la demande de signature pour
                                    "<strong>{docInfo.title}</strong>".
                                    Cette action notifiera tous les signataires.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Conserver</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => {
                                // TODO: Implement actual cancel API call
                                setDocToCancel(null);
                            }}
                        >
                            Annuler la demande
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
