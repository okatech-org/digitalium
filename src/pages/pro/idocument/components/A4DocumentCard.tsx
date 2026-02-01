/**
 * A4DocumentCard - Document card component with A4 miniature preview
 * Enhanced UX with contextual popovers for actions
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
    Users,
    Building2,
    Link2,
    Mail,
    Check,
    X,
    ChevronRight,
    User,
    Loader2,
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
    onSendToSignature?: (docId: string, recipient: string) => void;
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
    onSendToSignature,
    className,
}: A4DocumentCardProps) {
    const [dataUrl, setDataUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [shareOpen, setShareOpen] = useState(false);
    const [signOpen, setSignOpen] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [sharing, setSharing] = useState(false);
    const [signing, setSigning] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
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

    // Action handlers
    const handleAnnotation = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast({
            title: "Annotation",
            description: "Ouverture du panneau d'annotation...",
        });
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (dataUrl) {
            const link = window.document.createElement('a');
            link.href = dataUrl;
            link.download = document.title;
            link.click();
            toast({
                title: "Téléchargement démarré",
                description: document.title,
            });
        } else {
            toast({
                title: "Téléchargement",
                description: "Préparation du fichier en cours...",
            });
        }
    };

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast({
            title: "✓ Document dupliqué",
            description: `Copie de "${document.title}" créée`,
        });
        if (onDuplicate) {
            onDuplicate(document.id);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(document.id);
        }
        toast({
            title: "Document supprimé",
            description: "Déplacé vers la corbeille",
            variant: "destructive",
        });
    };

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`https://digitalium.ga/doc/${document.id}`);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleShareByEmail = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!shareEmail) return;

        setSharing(true);
        // Simulate sharing
        setTimeout(() => {
            setSharing(false);
            setShareOpen(false);
            setShareEmail('');
            toast({
                title: "✓ Document partagé",
                description: `Envoyé à ${shareEmail}`,
            });
        }, 1000);
    };

    const handleShareWithService = (serviceName: string) => {
        setShareOpen(false);
        toast({
            title: "✓ Document partagé",
            description: `Partagé avec le service ${serviceName}`,
        });
    };

    const handleSignSelf = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSigning(true);
        setTimeout(() => {
            setSigning(false);
            setSignOpen(false);
            if (onSendToSignature) {
                onSendToSignature(document.id, 'self');
            }
        }, 800);
    };

    const handleSignRequest = (recipient: string) => {
        setSigning(true);
        setTimeout(() => {
            setSigning(false);
            setSignOpen(false);
            if (onSendToSignature) {
                onSendToSignature(document.id, recipient);
            }
        }, 800);
    };

    const handleArchive = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onArchive) {
            onArchive(document.id);
        }
        toast({
            title: "✓ Document archivé",
            description: document.title,
        });
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
                {/* A4 Preview Area */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 aspect-[1/1.414] w-full flex items-center justify-center overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {!loading && isPdf && dataUrl && (
                        <PDFThumbnail
                            dataUrl={dataUrl}
                            fillContainer
                            className="w-full h-full"
                        />
                    )}

                    {!loading && isImage && dataUrl && (
                        <img
                            src={dataUrl}
                            alt={document.title}
                            className="w-full h-full object-cover"
                        />
                    )}

                    {!loading && (!dataUrl || (!isPdf && !isImage)) && (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                            <div className="relative bg-white dark:bg-gray-700 rounded shadow-md border w-[80%] aspect-[1/1.414] flex flex-col items-center justify-center p-4">
                                {getFileIcon(document.type, 'h-12 w-12')}
                                <div className="mt-2 text-xs text-muted-foreground truncate max-w-full">
                                    {document.title.slice(0, 20)}
                                    {document.title.length > 20 && '...'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <Badge variant="secondary" className="bg-white/90 dark:bg-gray-900/90 text-foreground shadow-lg">
                            Aperçu
                        </Badge>
                    </div>

                    {/* Top right actions */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-sm"
                            onClick={(e) => {
                                e.stopPropagation();
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
                                    className="h-7 w-7 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-sm"
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
                                    className="text-red-500 focus:text-red-500"
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

                    {/* Bottom actions with Popovers */}
                    <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/50">
                        {/* Partager Popover */}
                        <Popover open={shareOpen} onOpenChange={setShareOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Share2 className="h-3.5 w-3.5 mr-1" />
                                    Partager
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-72 p-0"
                                align="start"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-3 border-b">
                                    <h4 className="font-medium text-sm">Partager le document</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">{document.title}</p>
                                </div>

                                {/* Copy link */}
                                <div className="p-3 border-b">
                                    <div className="flex gap-2">
                                        <Input
                                            value={`digitalium.ga/d/${document.id.slice(0, 8)}`}
                                            readOnly
                                            className="h-8 text-xs bg-muted"
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 px-2"
                                            onClick={handleCopyLink}
                                        >
                                            {linkCopied ? (
                                                <Check className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <Link2 className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Share by email */}
                                <div className="p-3 border-b">
                                    <Label className="text-xs text-muted-foreground">Par email</Label>
                                    <div className="flex gap-2 mt-1.5">
                                        <Input
                                            placeholder="email@exemple.com"
                                            value={shareEmail}
                                            onChange={(e) => setShareEmail(e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                        <Button
                                            size="sm"
                                            className="h-8 px-3"
                                            onClick={handleShareByEmail}
                                            disabled={!shareEmail || sharing}
                                        >
                                            {sharing ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Mail className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Quick share options */}
                                <div className="p-2">
                                    <p className="text-xs text-muted-foreground px-2 pb-1">Partage rapide</p>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-xs"
                                        onClick={() => handleShareWithService('Direction Générale')}
                                    >
                                        <Building2 className="h-3.5 w-3.5 mr-2" />
                                        Direction Générale
                                        <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-xs"
                                        onClick={() => handleShareWithService('Comptabilité')}
                                    >
                                        <Building2 className="h-3.5 w-3.5 mr-2" />
                                        Comptabilité
                                        <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-xs"
                                        onClick={() => handleShareWithService('Ressources Humaines')}
                                    >
                                        <Users className="h-3.5 w-3.5 mr-2" />
                                        Ressources Humaines
                                        <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Signer Popover */}
                        <Popover open={signOpen} onOpenChange={setSignOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <PenTool className="h-3.5 w-3.5 mr-1" />
                                    Signer
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-64 p-0"
                                align="center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-3 border-b bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                            <PenTool className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">iSignature</h4>
                                            <p className="text-xs text-muted-foreground">Signature électronique</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-9 text-xs"
                                        onClick={handleSignSelf}
                                        disabled={signing}
                                    >
                                        {signing ? (
                                            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                        ) : (
                                            <User className="h-3.5 w-3.5 mr-2" />
                                        )}
                                        Signer moi-même
                                        <Badge variant="outline" className="ml-auto text-[10px]">Rapide</Badge>
                                    </Button>

                                    <Separator className="my-1" />

                                    <p className="text-xs text-muted-foreground px-2 py-1">Demander une signature</p>

                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-xs"
                                        onClick={() => handleSignRequest('Directeur Général')}
                                    >
                                        <Users className="h-3.5 w-3.5 mr-2" />
                                        Directeur Général
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-xs"
                                        onClick={() => handleSignRequest('Chef de Service')}
                                    >
                                        <Users className="h-3.5 w-3.5 mr-2" />
                                        Chef de Service
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-xs"
                                        onClick={() => handleSignRequest('Comptable')}
                                    >
                                        <User className="h-3.5 w-3.5 mr-2" />
                                        Comptable
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Archiver Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            onClick={handleArchive}
                        >
                            <Archive className="h-3.5 w-3.5 mr-1" />
                            Archiver
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default A4DocumentCard;
