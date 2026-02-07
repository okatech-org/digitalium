/**
 * SignedDocuments - History of completed signatures
 * A4 Miniature Grid Layout with actions below each document
 *
 * Connected to signatureService backend
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Download,
    Award,
    Eye,
    Calendar,
    Search,
    MoreVertical,
    Shield,
    User,
    Loader2,
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
import signatureService, {
    type SignatureRequest,
    type SignatureSignatory,
    type UserProfile,
} from '@/lib/signatureService';
import { useToast } from '@/hooks/use-toast';

// Generate document preview content
const getDocumentPreviewContent = (doc: { title: string; signedAt: string; hash?: string }): string[] => {
    return [
        "DOCUMENT SIGN\u00C9",
        "",
        doc.title,
        "",
        "Sign\u00E9 le " + doc.signedAt,
        "",
        "\u2713 Signature valid\u00E9e",
        "\u2713 Document certifi\u00E9",
        "",
        doc.hash ? "Hash: " + doc.hash.substring(0, 8) + "..." : "",
    ];
};

export default function SignedDocuments() {
    const { searchQuery: globalSearchQuery } = useSignatureSearch();
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [periodFilter, setPeriodFilter] = useState('all');
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<SignatureRequest[]>([]);
    const [signatories, setSignatories] = useState<SignatureSignatory[]>([]);
    const [profiles, setProfiles] = useState<UserProfile[]>([]);

    const searchQuery = globalSearchQuery || localSearchQuery;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await signatureService.getRequests('completed');
            setRequests(data.requests);
            setSignatories(data.signatories);
            setProfiles(data.profiles);
        } catch (error) {
            console.error('Failed to load signed documents:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les documents sign\u00E9s.',
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
        if (searchQuery && !doc.document_title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (periodFilter !== 'all' && doc.completed_at) {
            const completedDate = new Date(doc.completed_at);
            const now = new Date();
            switch (periodFilter) {
                case 'week': {
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (completedDate < weekAgo) return false;
                    break;
                }
                case 'month': {
                    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    if (completedDate < monthAgo) return false;
                    break;
                }
                case 'quarter': {
                    const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                    if (completedDate < quarterAgo) return false;
                    break;
                }
            }
        }
        return true;
    });

    const certifiedCount = filteredDocs.filter(d => d.certificate_url).length;

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.03 } }
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Documents sign\u00E9s</h2>
                    <p className="text-sm text-muted-foreground">Historique de vos signatures \u00E9lectroniques</p>
                </div>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    <Shield className="h-3 w-3 mr-1" />
                    {certifiedCount} certifi\u00E9s
                </Badge>
            </div>

            <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher..."
                        value={globalSearchQuery || localSearchQuery}
                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                        className="pl-9"
                        aria-label="Rechercher dans les documents sign\u00E9s"
                    />
                </div>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="w-40">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="P\u00E9riode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tout</SelectItem>
                        <SelectItem value="week">Cette semaine</SelectItem>
                        <SelectItem value="month">Ce mois</SelectItem>
                        <SelectItem value="quarter">Ce trimestre</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <motion.div variants={container} initial="hidden" animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {filteredDocs.map((doc) => {
                    const reqSignatories = getRequestSignatories(doc.id);
                    const signedAt = doc.completed_at
                        ? new Date(doc.completed_at).toLocaleDateString('fr-FR')
                        : new Date(doc.updated_at).toLocaleDateString('fr-FR');
                    const hasCertificate = !!doc.certificate_url;
                    const previewLines = getDocumentPreviewContent({
                        title: doc.document_title, signedAt, hash: doc.document_hash,
                    });

                    return (
                        <motion.div key={doc.id} variants={item} className="group cursor-pointer">
                            <div className={cn(
                                "relative bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden",
                                "aspect-[210/297] border-2 transition-all duration-200",
                                "border-green-300 dark:border-green-700 hover:border-green-500 hover:shadow-xl"
                            )}>
                                {hasCertificate && (
                                    <div className="absolute top-2 left-2 z-20">
                                        <Badge variant="secondary" className="bg-green-500/90 text-white text-[9px] px-1.5">
                                            <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                                            Certifi\u00E9
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
                                            <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />Voir le document</DropdownMenuItem>
                                            <DropdownMenuItem><Download className="h-4 w-4 mr-2" />T\u00E9l\u00E9charger (PDF)</DropdownMenuItem>
                                            {hasCertificate && <DropdownMenuItem><Award className="h-4 w-4 mr-2" />Certificat de signature</DropdownMenuItem>}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="absolute inset-0 p-3 pt-8 overflow-hidden">
                                    <div className="text-[6px] leading-[8px] text-gray-700 dark:text-gray-300 font-mono select-none">
                                        {previewLines.map((line, i) => (
                                            <div key={i} className={`${i === 0 ? 'font-bold text-[7px] text-gray-900 dark:text-white' : ''} truncate`}>{line || '\u00A0'}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-zinc-900 via-white/95 dark:via-zinc-900/95 to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2">
                                    <div className="flex -space-x-1">
                                        {reqSignatories.slice(0, 4).map((signer, j) => (
                                            <Avatar key={j} className="h-4 w-4 border border-white dark:border-zinc-900">
                                                <AvatarFallback className="text-[6px] bg-green-500/20 text-green-600">
                                                    {signer.user_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {reqSignatories.length > 4 && (
                                            <div className="h-4 w-4 rounded-full bg-muted border border-white dark:border-zinc-900 flex items-center justify-center text-[6px]">
                                                +{reqSignatories.length - 4}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-700 dark:to-zinc-600"
                                    style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
                            </div>
                            <div className="mt-3 space-y-2 px-1">
                                <h4 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight group-hover:text-green-500 transition-colors">{doc.document_title}</h4>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <User className="h-3 w-3" /><span className="truncate">{getCreatorName(doc.created_by)}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{signedAt}</span>
                                    {hasCertificate && (
                                        <Badge variant="secondary" className="text-[9px] px-1.5 h-4 bg-green-500/10 text-green-500">
                                            <Award className="h-2.5 w-2.5 mr-1" />Certifi\u00E9
                                        </Badge>
                                    )}
                                </div>
                                <Button variant="outline" size="sm" className="w-full h-8 text-xs border-green-500/30 text-green-600 hover:bg-green-500/10">
                                    <Download className="h-3 w-3 mr-1.5" />T\u00E9l\u00E9charger
                                </Button>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {filteredDocs.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                        <div className="p-4 rounded-full bg-green-500/10 w-fit mx-auto mb-4">
                            <CheckCircle2 className="h-10 w-10 text-green-500/50" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Aucun document sign\u00E9</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">Vos documents sign\u00E9s appara\u00EEtront ici.</p>
                    </CardContent>
                </Card>
            )}

            {filteredDocs.length > 0 && (
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{filteredDocs.length} documents</span>
                    <Button variant="outline" size="sm">Voir plus</Button>
                </div>
            )}
        </div>
    );
}
