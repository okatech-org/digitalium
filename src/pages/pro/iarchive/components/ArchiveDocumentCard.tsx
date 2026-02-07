/**
 * ArchiveDocumentCard - A4 card for archived documents
 * 
 * Conforms to NF Z42-013 / ISO 14641 archiving rules:
 * - No modification, no deletion, no sharing of originals
 * - Only: Consultation, Certified Copy, Integrity Check, Certificate, Audit Log
 * 
 * Documents are displayed with PDF/A badge and integrity seal.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Eye,
    Copy,
    Shield,
    ShieldCheck,
    Award,
    FileText,
    Clock,
    Hash,
    Lock,
    FileCheck,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PDFThumbnail } from '@/components/PDFViewer';
import { getFileContent } from '@/services/fileStorage';

// ========================================
// TYPES
// ========================================

export interface ArchiveDocumentData {
    id: string;
    title: string;
    mimeType?: string;
    hash: string;
    archivedAt: string;
    retentionEnd: string;
    verified: boolean;
    size: string;
    reference: string;
    isImported?: boolean;
    category?: string;
}

interface ArchiveDocumentCardProps {
    document: ArchiveDocumentData;
    /** Open document for read-only consultation */
    onConsult?: (doc: ArchiveDocumentData) => void;
    /** Generate and deliver a certified copy */
    onCertifiedCopy?: (doc: ArchiveDocumentData) => void;
    /** Run integrity check (hash verification) */
    onIntegrityCheck?: (doc: ArchiveDocumentData) => void;
    /** Download archive certificate */
    onCertificate?: (doc: ArchiveDocumentData) => void;
    /** View audit log for this document */
    onAuditLog?: (doc: ArchiveDocumentData) => void;
    className?: string;
}

// ========================================
// COMPONENT
// ========================================

export function ArchiveDocumentCard({
    document,
    onConsult,
    onCertifiedCopy,
    onIntegrityCheck,
    onCertificate,
    onAuditLog,
    className,
}: ArchiveDocumentCardProps) {
    const [dataUrl, setDataUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load PDF thumbnail for imported documents
    useEffect(() => {
        if (document.isImported && document.mimeType?.includes('pdf')) {
            const content = getFileContent(document.id);
            if (content) {
                setDataUrl(content);
            }
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [document.id, document.isImported, document.mimeType]);

    const isPdf = document.mimeType?.includes('pdf');
    const isImage = document.mimeType?.includes('image');

    // Determine file icon based on type
    const getFileIcon = () => {
        if (isPdf) return <FileCheck className="h-8 w-8 text-red-500" />;
        if (isImage) return <FileText className="h-8 w-8 text-blue-500" />;
        return <FileText className="h-8 w-8 text-emerald-500" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={cn(
                'group cursor-default transition-all hover:shadow-lg border-emerald-500/20 overflow-hidden',
                className
            )}>
                <CardContent className="p-0">
                    {/* ===== A4 PREVIEW AREA ===== */}
                    <div
                        className="relative bg-white dark:bg-zinc-900 border-b overflow-hidden"
                        style={{ aspectRatio: '210/180' }}
                    >
                        {/* PDF/A Badge - top-left */}
                        <div className="absolute top-2 left-2 z-10">
                            <Badge className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 shadow-md">
                                PDF/A
                            </Badge>
                        </div>

                        {/* Integrity Seal - top-right */}
                        <div className="absolute top-2 right-2 z-10">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'text-[10px] gap-1 shadow-sm',
                                                document.verified
                                                    ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20'
                                                    : 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                                            )}
                                        >
                                            {document.verified ? (
                                                <ShieldCheck className="h-3 w-3" />
                                            ) : (
                                                <Shield className="h-3 w-3" />
                                            )}
                                            {document.verified ? 'Intègre' : 'Non vérifié'}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">
                                            {document.verified
                                                ? 'L\'intégrité du document a été vérifiée'
                                                : 'Vérification d\'intégrité en attente'}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Lock overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center z-5">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white/90 dark:bg-zinc-800/90 rounded-full p-3 shadow-lg backdrop-blur-sm">
                                    <Lock className="h-5 w-5 text-emerald-600" />
                                </div>
                            </div>
                        </div>

                        {/* Document Preview */}
                        <div className="w-full h-full flex items-center justify-center p-4">
                            {loading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            ) : dataUrl && isPdf ? (
                                <div className="w-full h-full">
                                    <PDFThumbnail dataUrl={dataUrl} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    {getFileIcon()}
                                    <span className="text-xs uppercase tracking-wider font-medium">
                                        Document archivé
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ===== DOCUMENT INFO ===== */}
                    <div className="p-3 space-y-2">
                        {/* Title */}
                        <h3 className="font-medium text-sm line-clamp-2 leading-tight min-h-[2.5rem]">
                            {document.title}
                        </h3>

                        {/* Metadata Row */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {document.archivedAt}
                            </span>
                            <span>•</span>
                            <span>{document.size}</span>
                        </div>

                        {/* Hash */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 font-mono bg-muted/50 rounded px-1.5 py-0.5 w-fit">
                                        <Hash className="h-2.5 w-2.5" />
                                        {document.hash.length > 20
                                            ? `${document.hash.slice(0, 20)}...`
                                            : document.hash}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-mono text-xs max-w-[300px] break-all">{document.hash}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Retention badge */}
                        <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-600 border-emerald-500/30">
                                <Clock className="h-2.5 w-2.5 mr-0.5" />
                                Conservation: {document.retentionEnd}
                            </Badge>
                        </div>
                    </div>

                    {/* ===== COMPLIANT ACTIONS BAR ===== */}
                    <div className="border-t bg-muted/30 px-2 py-1.5 flex items-center justify-between gap-0.5">
                        {/* Consulter */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600"
                                        onClick={() => onConsult?.(document)}
                                    >
                                        <Eye className="h-3.5 w-3.5 mr-1" />
                                        Consulter
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Consultation en lecture seule</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Copie certifiée */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600"
                                        onClick={() => onCertifiedCopy?.(document)}
                                    >
                                        <Copy className="h-3.5 w-3.5 mr-1" />
                                        Copie
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Générer une copie certifiée conforme</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Vérifier intégrité */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600"
                                        onClick={() => onIntegrityCheck?.(document)}
                                    >
                                        <Shield className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Vérifier l'intégrité (SHA-256)</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Certificat */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600"
                                        onClick={() => onCertificate?.(document)}
                                    >
                                        <Award className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Télécharger le certificat d'archivage</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Journal d'audit */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600"
                                        onClick={() => onAuditLog?.(document)}
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Journal d'audit du document</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
