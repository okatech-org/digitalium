/**
 * DocumentPreviewDialog - Modal for viewing document content
 * Supports PDF preview via iframe and image preview
 */

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FileText,
    Download,
    X,
    ExternalLink,
    File,
    Image as ImageIcon,
    Sheet,
    Presentation,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document: {
        id: string;
        title: string;
        type: string;
        size?: string;
        dataUrl?: string;
        mimeType?: string;
    } | null;
}

// File type icons
const getFileIcon = (type: string) => {
    switch (type) {
        case 'pdf':
            return <FileText className="h-12 w-12 text-red-500" />;
        case 'image':
            return <ImageIcon className="h-12 w-12 text-blue-500" />;
        case 'spreadsheet':
            return <Sheet className="h-12 w-12 text-green-500" />;
        case 'presentation':
            return <Presentation className="h-12 w-12 text-orange-500" />;
        default:
            return <File className="h-12 w-12 text-gray-500" />;
    }
};

export function DocumentPreviewDialog({
    open,
    onOpenChange,
    document,
}: DocumentPreviewDialogProps) {
    if (!document) return null;

    const isPdf = document.type === 'pdf' || document.mimeType?.includes('pdf');
    const isImage = document.type === 'image' || document.mimeType?.startsWith('image/');
    const hasPreview = document.dataUrl && (isPdf || isImage);

    const handleDownload = () => {
        if (document.dataUrl) {
            const link = window.document.createElement('a');
            link.href = document.dataUrl;
            link.download = document.title;
            link.click();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
                {/* Header */}
                <DialogHeader className="p-4 border-b flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {getFileIcon(document.type)}
                            <div>
                                <DialogTitle className="text-lg font-semibold">
                                    {document.title}
                                </DialogTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                        {document.type.toUpperCase()}
                                    </Badge>
                                    {document.size && (
                                        <span className="text-xs text-muted-foreground">
                                            {document.size}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {document.dataUrl && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownload}
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        Télécharger
                                    </Button>
                                    {isPdf && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(document.dataUrl, '_blank')}
                                        >
                                            <ExternalLink className="h-4 w-4 mr-1" />
                                            Ouvrir
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Preview content */}
                <div className="flex-1 overflow-hidden bg-muted/30 p-4">
                    {hasPreview ? (
                        <div className="w-full h-full flex items-center justify-center">
                            {isPdf && (
                                <iframe
                                    src={document.dataUrl}
                                    className="w-full h-full rounded-lg border bg-white shadow-lg"
                                    title={document.title}
                                />
                            )}
                            {isImage && !isPdf && (
                                <img
                                    src={document.dataUrl}
                                    alt={document.title}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                            {getFileIcon(document.type)}
                            <p className="mt-4 text-lg font-medium">
                                Aperçu non disponible
                            </p>
                            <p className="text-sm mt-1">
                                Ce type de fichier ne peut pas être prévisualisé.
                            </p>
                            {document.dataUrl && (
                                <Button
                                    className="mt-4"
                                    onClick={handleDownload}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Télécharger pour visualiser
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default DocumentPreviewDialog;
