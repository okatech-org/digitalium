/**
 * ArchiveCard - Display card for archived documents
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    MoreVertical,
    Download,
    Share2,
    Trash2,
    Eye,
    Shield,
    Clock,
    Hash,
    CheckCircle2,
    AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface ArchiveDocument {
    id: string;
    title: string;
    filename: string;
    category: string;
    subcategory?: string;
    mimeType: string;
    size: number;
    hashSHA256: string;
    status: 'active' | 'semi-active' | 'archived' | 'frozen';
    isVerified: boolean;
    lastVerifiedAt?: number;
    retentionEndDate: number;
    tags: string[];
    uploadedAt: number;
    viewCount: number;
}

interface ArchiveCardProps {
    document: ArchiveDocument;
    onView?: () => void;
    onDownload?: () => void;
    onShare?: () => void;
    onDelete?: () => void;
    onVerify?: () => void;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function getDaysUntilExpiration(retentionEndDate: number): number {
    const now = Date.now();
    const diff = retentionEndDate - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        fiscal: 'text-green-500 bg-green-500/10',
        social: 'text-blue-500 bg-blue-500/10',
        juridique: 'text-purple-500 bg-purple-500/10',
        client: 'text-orange-500 bg-orange-500/10',
        'coffre-fort': 'text-red-500 bg-red-500/10',
    };
    return colors[category] || 'text-gray-500 bg-gray-500/10';
}

export function ArchiveCard({
    document,
    onView,
    onDownload,
    onShare,
    onDelete,
    onVerify,
}: ArchiveCardProps) {
    const daysUntilExpiration = getDaysUntilExpiration(document.retentionEndDate);
    const isExpiringSoon = daysUntilExpiration <= 30 && daysUntilExpiration > 0;
    const isExpired = daysUntilExpiration <= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={cn(
                'group cursor-pointer transition-all hover:shadow-lg',
                isExpired && 'border-red-500/50',
                isExpiringSoon && 'border-orange-500/50'
            )}>
                <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={cn(
                                'p-2 rounded-lg transition-transform group-hover:scale-110',
                                getCategoryColor(document.category)
                            )}>
                                <FileText className="h-5 w-5" />
                            </div>

                            {/* Title & Meta */}
                            <div className="min-w-0">
                                <h3 className="font-medium text-sm line-clamp-2 mb-1">
                                    {document.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{formatBytes(document.size)}</span>
                                    <span>•</span>
                                    <span>{formatDate(document.uploadedAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onView}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Voir
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Télécharger
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onShare}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Partager
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onVerify}>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Vérifier intégrité
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={onDelete}
                                    className="text-red-500"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Category Badge */}
                    <div className="flex flex-wrap gap-1 mb-3">
                        <Badge
                            variant="secondary"
                            className={cn('text-xs', getCategoryColor(document.category))}
                        >
                            {document.category}
                        </Badge>
                        {document.tags.slice(0, 2).map(tag => (
                            <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                            >
                                {tag}
                            </Badge>
                        ))}
                        {document.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                                +{document.tags.length - 2}
                            </Badge>
                        )}
                    </div>

                    {/* Footer - Integrity & Retention */}
                    <div className="flex items-center justify-between pt-3 border-t">
                        {/* Integrity Status */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    'flex items-center gap-1.5 text-xs',
                                    document.isVerified ? 'text-emerald-500' : 'text-yellow-500'
                                )}>
                                    {document.isVerified ? (
                                        <>
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            <span>Vérifié</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            <span>Non vérifié</span>
                                        </>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-xs">
                                    <div className="font-medium mb-1">Intégrité SHA-256</div>
                                    <code className="text-[10px] font-mono">
                                        {document.hashSHA256.substring(0, 16)}...
                                    </code>
                                    {document.lastVerifiedAt && (
                                        <div className="mt-1 text-muted-foreground">
                                            Vérifié le {formatDate(document.lastVerifiedAt)}
                                        </div>
                                    )}
                                </div>
                            </TooltipContent>
                        </Tooltip>

                        {/* Retention */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    'flex items-center gap-1.5 text-xs',
                                    isExpired && 'text-red-500',
                                    isExpiringSoon && 'text-orange-500',
                                    !isExpired && !isExpiringSoon && 'text-muted-foreground'
                                )}>
                                    <Clock className="h-3.5 w-3.5" />
                                    {isExpired ? (
                                        <span>Expiré</span>
                                    ) : isExpiringSoon ? (
                                        <span>{daysUntilExpiration}j restants</span>
                                    ) : (
                                        <span>{formatDate(document.retentionEndDate)}</span>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-xs">
                                    <div className="font-medium">Conservation légale</div>
                                    <div>Expire le {formatDate(document.retentionEndDate)}</div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
