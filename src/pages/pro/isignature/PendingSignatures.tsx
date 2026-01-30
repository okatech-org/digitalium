/**
 * PendingSignatures - Documents sent by user, awaiting signatures from others
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
const MOCK_PENDING: { id: string; title: string; sentAt: string; deadline: string; signers: { name: string; initials: string; signed: boolean; date?: string; lastReminder?: string }[] }[] = [];

export default function PendingSignatures() {
    const [docToCancel, setDocToCancel] = useState<string | null>(null);
    const docInfo = MOCK_PENDING.find(d => d.id === docToCancel);
    const { searchQuery } = useSignatureSearch();

    const filteredDocs = MOCK_PENDING.filter(doc => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return doc.title.toLowerCase().includes(query);
    });

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

            {/* Pending Queue */}
            <div className="space-y-3">
                {filteredDocs.map((doc, i) => {
                    const signedCount = doc.signers.filter(s => s.signed).length;
                    const totalSigners = doc.signers.length;
                    const progress = (signedCount / totalSigners) * 100;
                    const pendingSigners = doc.signers.filter(s => !s.signed);

                    return (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="group hover:border-purple-500/30 transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="p-2.5 rounded-xl bg-blue-500/10">
                                            <Clock className="h-5 w-5 text-blue-500" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold">{doc.title}</h3>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <span>Envoyé le {doc.sentAt}</span>
                                                        <span>•</span>
                                                        <span>Échéance: {doc.deadline}</span>
                                                    </p>
                                                </div>
                                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    {signedCount}/{totalSigners}
                                                </Badge>
                                            </div>

                                            {/* Progress */}
                                            <Progress value={progress} className="h-1.5 mb-3" />

                                            {/* Signers Status */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {doc.signers.map((signer, j) => (
                                                    <div
                                                        key={j}
                                                        className={cn(
                                                            'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
                                                            signer.signed
                                                                ? 'bg-green-500/10 text-green-500'
                                                                : 'bg-orange-500/10 text-orange-500'
                                                        )}
                                                    >
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarFallback className="text-[8px]">
                                                                {signer.initials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>{signer.name}</span>
                                                        {signer.signed ? (
                                                            <CheckCircle2 className="h-3 w-3" />
                                                        ) : (
                                                            <Clock className="h-3 w-3" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {pendingSigners.length > 0 && (
                                                <Button variant="outline" size="sm">
                                                    <Bell className="h-4 w-4 mr-1" />
                                                    Relancer
                                                </Button>
                                            )}
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
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

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
