/**
 * ToSign - Documents awaiting user's signature
 * A4 Miniature Grid Layout with actions below each document
 *
 * Connected to signatureService backend
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    PenTool,
    Clock,
    User,
    AlertCircle,
    MoreVertical,
    Eye,
    Download,
    Loader2,
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
import signatureService, {
    type SignatureRequest,
    type SignatureSignatory,
    type UserProfile,
} from '@/lib/signatureService';
import { useToast } from '@/hooks/use-toast';

// Generate document preview content
const getDocumentPreviewContent = (doc: { title: string; priority: string; createdAt: string }): string[] => {
    const isContract = doc.title.toLowerCase().includes('contrat');
    const isNda = doc.title.toLowerCase().includes('confidential') || doc.title.toLowerCase().includes('nda');

    if (isNda) {
        return [
            "ACCORD DE CONFIDENTIALIT\u00C9",
            "",
            doc.title,
            "",
            "Les parties conviennent de:",
            "",
            "1. D\u00E9finition des informations",
            "2. Obligations de confidentialit\u00E9",
            "3. Dur\u00E9e de l'engagement",
        ];
    }

    if (isContract) {
        return [
            "CONTRAT DE PRESTATION",
            "",
            doc.title,
            "",
            "Entre les soussign\u00E9s,",
            "",
            "D'une part, la soci\u00E9t\u00E9...",
            "Et d'autre part, le client...",
            "",
            "Il a \u00E9t\u00E9 convenu ce qui suit:",
            "",
            "Article 1 - Objet",
        ];
    }

    return [
        "DOCUMENT \u00C0 SIGNER",
        "",
        doc.title,
        "",
        "Date: " + new Date(doc.createdAt).toLocaleDateString('fr-FR'),
        "",
        "En attente de votre signature",
        "",
        "Veuillez prendre connaissance",
        "du document ci-joint...",
    ];
};

export default function ToSign() {
    const { searchQuery } = useSignatureSearch();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<SignatureRequest[]>([]);
    const [signatories, setSignatories] = useState<SignatureSignatory[]>([]);
    const [profiles, setProfiles] = useState<UserProfile[]>([]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await signatureService.getRequests('to_sign');
            setRequests(data.requests);
            setSignatories(data.signatories);
            setProfiles(data.profiles);
        } catch (error) {
            console.error('Failed to load documents to sign:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les documents \u00E0 signer.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getRequestSignatories = (requestId: string) =>
        signatories.filter(s => s.request_id === requestId);

    const getCreatorName = (createdBy: string) => {
        const profile = profiles.find(p => p.user_id === createdBy);
        return profile?.display_name || profile?.email || 'Utilisateur';
    };

    const filteredDocs = requests.filter(doc => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            doc.document_title.toLowerCase().includes(query) ||
            getCreatorName(doc.created_by).toLowerCase().includes(query)
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">\u00C0 signer</h2>
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
                    const reqSignatories = getRequestSignatories(doc.id);
                    const signedCount = reqSignatories.filter(s => s.status === 'signed').length;
                    const totalSigners = reqSignatories.length;
                    const progress = totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0;
                    const isUrgent = doc.priority === 'urgent' || doc.priority === 'high';
                    const previewLines = getDocumentPreviewContent({
                        title: doc.document_title,
                        priority: doc.priority,
                        createdAt: doc.created_at,
                    });
                    const deadline = doc.expires_at
                        ? new Date(doc.expires_at).toLocaleDateString('fr-FR')
                        : 'Pas de limite';

                    return (
                        <motion.div key={doc.id} variants={item} className="group cursor-pointer">
                            {/* A4 Document Thumbnail */}
                            <div className={cn(
                                "relative bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden",
                                "aspect-[210/297]",
                                "border-2 transition-all duration-200",
                                isUrgent
                                    ? "border-orange-500/50 ring-2 ring-orange-500/20"
                                    : "border-gray-200 dark:border-zinc-700 hover:border-purple-500/50 hover:shadow-xl"
                            )}>
                                {isUrgent && (
                                    <div className="absolute top-2 left-2 z-20">
                                        <Badge variant="secondary" className="bg-orange-500/90 text-white text-[9px] px-1.5">
                                            <AlertCircle className="h-2.5 w-2.5 mr-1" />
                                            Urgent
                                        </Badge>
                                    </div>
                                )}

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
                                                Aper\u00E7u
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="h-4 w-4 mr-2" />
                                                T\u00E9l\u00E9charger
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="absolute inset-0 p-3 overflow-hidden">
                                    <div className="text-[6px] leading-[8px] text-gray-700 dark:text-gray-300 font-mono select-none">
                                        {previewLines.map((line, i) => (
                                            <div key={i} className={`${i === 0 ? 'font-bold text-[7px] text-gray-900 dark:text-white' : ''} truncate`}>
                                                {line || '\u00A0'}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-zinc-900 via-white/95 dark:via-zinc-900/95 to-transparent" />

                                <div className="absolute bottom-2 left-2 right-2">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        {reqSignatories.slice(0, 3).map((signer, j) => (
                                            <Avatar key={j} className={cn(
                                                "h-4 w-4 border",
                                                signer.status === 'signed' ? "border-green-500"
                                                    : signer.status === 'pending' ? "border-purple-500"
                                                    : "border-gray-300"
                                            )}>
                                                <AvatarFallback className={cn(
                                                    "text-[6px]",
                                                    signer.status === 'signed' ? "bg-green-500/20 text-green-600"
                                                        : signer.status === 'pending' ? "bg-purple-500/20 text-purple-600"
                                                        : "bg-muted text-muted-foreground"
                                                )}>
                                                    {signer.user_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {reqSignatories.length > 3 && (
                                            <span className="text-[8px] text-muted-foreground">+{reqSignatories.length - 3}</span>
                                        )}
                                    </div>
                                    <Progress value={progress} className="h-1" />
                                </div>

                                <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-700 dark:to-zinc-600"
                                    style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
                            </div>

                            {/* Document Info Below A4 */}
                            <div className="mt-3 space-y-2 px-1">
                                <h4 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight group-hover:text-purple-500 transition-colors">
                                    {doc.document_title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span className="truncate">{getCreatorName(doc.created_by)}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {deadline}
                                    </span>
                                    <Badge variant="outline" className="text-[9px] px-1.5 h-4 text-purple-500 border-purple-500/30">
                                        {signedCount}/{totalSigners}
                                    </Badge>
                                </div>
                                <Button size="sm" className="w-full bg-purple-500 hover:bg-purple-600 h-8 text-xs">
                                    <PenTool className="h-3 w-3 mr-1.5" />
                                    Signer
                                </Button>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {filteredDocs.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                        <div className="p-4 rounded-full bg-purple-500/10 w-fit mx-auto mb-4">
                            <PenTool className="h-10 w-10 text-purple-500/50" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Aucun document \u00E0 signer</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Vous n'avez aucun document en attente de votre signature.
                            Les nouveaux documents appara\u00EEtront ici.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
