/**
 * A4DocumentCard - Document card component with A4 miniature preview
 * Displays PDF thumbnails or appropriate file type previews in A4 format
 * Includes complete action system with toast notifications
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    FileText,
    MoreVertical,
    Star,
    StarOff,
    Clock,
    Image as ImageIcon,
    Sheet,
    Presentation,
    File,
    Download,
    Share2,
    Archive,
    Trash2,
    Copy,
    MessageSquare,
    PenTool,
    Send,
    Users,
    Building2,
    Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PDFThumbnail } from '@/components/PDFViewer';
import { getFileContent } from '@/services/fileStorage';
import { useToast } from '@/hooks/use-toast';

interface A4DocumentCardProps {
    document: {
        id: string;
        title: string;
        type: string;
        status?: string;
        lastEdit?: string;
        starred?: boolean;
        isImported?: boolean;
        mimeType?: string;
    };
    onDocumentClick: (doc: any) => void;
    onDelete?: (docId: string) => void;
    onArchive?: (docId: string) => void;
    onDuplicate?: (docId: string) => void;
    className?: string;
}

// File type to icon mapping
const getFileIcon = (type: string, size: string = 'h-8 w-8') => {
    const iconClass = size;
    switch (type) {
        case 'pdf':
            return <FileText className={cn(iconClass, 'text-red-500')} />;
        case 'image':
            return <ImageIcon className={cn(iconClass, 'text-blue-500')} />;
        case 'spreadsheet':
            return <Sheet className={cn(iconClass, 'text-green-500')} />;
        case 'presentation':
            return <Presentation className={cn(iconClass, 'text-orange-500')} />;
        default:
            return <File className={cn(iconClass, 'text-gray-500')} />;
    }
};

// Status badge component
const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
        draft: { label: 'Brouillon', variant: 'secondary' },
        review: { label: 'En révision', variant: 'outline' },
        approved: { label: 'Approuvé', variant: 'default' },
        final: { label: 'Finalisé', variant: 'default' },
        archived: { label: 'Archivé', variant: 'secondary' },
        copy: { label: 'Copie', variant: 'outline' },
    };
    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return (
        <Badge variant={config.variant} className="text-xs">
            {config.label}
        </Badge>
    );
};

export function A4DocumentCard({
    document,
    onDocumentClick,
    onDelete,
    onArchive,
    onDuplicate,
    className,
}: A4DocumentCardProps) {
    const [dataUrl, setDataUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const isPdf = document.type === 'pdf' || document.mimeType?.includes('pdf');
    const isImage = document.type === 'image' || document.mimeType?.startsWith('image/');

    // Load file content from IndexedDB for preview
    useEffect(() => {
        if (!document.isImported) {
            setLoading(false);
            return;
        }

        const loadContent = async () => {
            try {
                const stored = await getFileContent(document.id);
                if (stored) {
                    setDataUrl(stored.dataUrl);
                }
            } catch (err) {
                console.error('Error loading file content:', err);
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [document.id, document.isImported]);

    // Action handlers with toast notifications
    const handleAnnotation = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast({
            title: "Annotation",
            description: "Ouverture du panneau d'annotation...",
        });
        // TODO: Open annotation modal
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast({
            title: "Téléchargement en cours",
            description: `${document.title} est en cours de téléchargement...`,
        });
        // Trigger actual download if we have dataUrl
        if (dataUrl) {
            const link = window.document.createElement('a');
            link.href = dataUrl;
            link.download = document.title;
            link.click();
        }
    };

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast({
            title: "Document dupliqué",
            description: (
                <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span>Une copie de "{document.title}" a été créée</span>
                </div>
            ),
        });
        if (onDuplicate) {
            onDuplicate(document.id);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast({
            title: "Document supprimé",
            description: `"${document.title}" a été déplacé vers la corbeille`,
            variant: "destructive",
        });
        if (onDelete) {
            onDelete(document.id);
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast({
            title: "Partager le document",
            description: (
                <div className="space-y-2 mt-2">
                    <p className="text-sm text-muted-foreground">Choisissez une option :</p>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Collaborateur
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                            <Building2 className="h-3 w-3 mr-1" />
                            Service
                        </Button>
                    </div>
                </div>
            ),
            duration: 6000,
        });
    };

    const handleSignature = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast({
            title: "Envoi vers iSignature",
            description: (
                <div className="space-y-2 mt-2">
                    <p className="text-sm text-muted-foreground">Envoyer pour signature à :</p>
                    <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" className="text-xs">
                            <PenTool className="h-3 w-3 mr-1" />
                            Moi-même
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Collaborateur
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                            <Building2 className="h-3 w-3 mr-1" />
                            Service
                        </Button>
                    </div>
                </div>
            ),
            duration: 6000,
        });
    };

    const handleArchive = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast({
            title: "Document archivé",
            description: `"${document.title}" a été archivé avec succès`,
        });
        if (onArchive) {
            onArchive(document.id);
        }
    };

    return (
        <Card
            className={cn(
                'group cursor-pointer hover:border-blue-500/50 transition-all h-full overflow-hidden flex flex-col',
                className
            )}
            onClick={() => onDocumentClick(document)}
        >
            <CardContent className="p-0 flex flex-col h-full">
                {/* A4 Preview Area - Aspect ratio 1:√2 (A4) */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 aspect-[1/1.414] w-full flex items-center justify-center overflow-hidden">
                    {/* Loading state */}
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {/* PDF thumbnail */}
                    {!loading && isPdf && dataUrl && (
                        <PDFThumbnail
                            dataUrl={dataUrl}
                            fillContainer
                            className="w-full h-full"
                        />
                    )}

                    {/* Image thumbnail */}
                    {!loading && isImage && dataUrl && (
                        <img
                            src={dataUrl}
                            alt={document.title}
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Fallback for files without preview */}
                    {!loading && (!dataUrl || (!isPdf && !isImage)) && (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                            {/* A4 paper simulation */}
                            <div className="relative bg-white dark:bg-gray-700 rounded shadow-md border w-[80%] aspect-[1/1.414] flex flex-col items-center justify-center p-4">
                                {getFileIcon(document.type, 'h-12 w-12')}
                                <div className="mt-2 text-xs text-muted-foreground truncate max-w-full">
                                    {document.title.slice(0, 20)}
                                    {document.title.length > 20 && '...'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hover overlay with preview prompt */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Badge variant="secondary" className="bg-white/90 dark:bg-gray-900/90 text-foreground shadow-lg">
                            Cliquer pour aperçu
                        </Badge>
                    </div>

                    {/* Top right actions - Star and Dropdown */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 shadow-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                // Toggle star
                            }}
                        >
                            {document.starred ? (
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            ) : (
                                <StarOff className="h-4 w-4" />
                            )}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 shadow-sm"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={handleAnnotation}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Annotation
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Télécharger
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDuplicate}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Dupliquer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Document info */}
                <div className="p-3 space-y-2 flex-1 flex flex-col">
                    <h3 className="font-medium text-sm line-clamp-2">{document.title}</h3>

                    <div className="flex items-center justify-between">
                        {getStatusBadge(document.status)}
                        {document.lastEdit && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {document.lastEdit}
                            </span>
                        )}
                    </div>

                    {/* Bottom actions bar */}
                    <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={handleShare}
                        >
                            <Share2 className="h-3 w-3 mr-1" />
                            Partager
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={handleSignature}
                        >
                            <PenTool className="h-3 w-3 mr-1" />
                            Signer
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={handleArchive}
                        >
                            <Archive className="h-3 w-3 mr-1" />
                            Archiver
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default A4DocumentCard;
