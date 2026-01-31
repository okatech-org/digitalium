/**
 * MediaLibrary - Centralized media gallery for the public page editor
 */

import React, { useState, useCallback } from 'react';
import {
    Images,
    Upload,
    Trash2,
    Search,
    Grid3X3,
    List,
    X,
    Check,
    FileImage,
    Film,
    FileText,
    Plus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { usePublicPageEditorStore, type MediaItem, type ImageConfig, defaultImageConfig } from '@/stores/publicPageEditorStore';

interface MediaLibraryProps {
    onSelect?: (media: MediaItem) => void;
    selectionMode?: boolean;
    filterType?: 'image' | 'video' | 'document' | 'all';
}

export default function MediaLibrary({
    onSelect,
    selectionMode = false,
    filterType = 'all',
}: MediaLibraryProps) {
    const { config, addMedia, removeMedia } = usePublicPageEditorStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const mediaItems = config?.mediaLibrary || [];

    const filteredItems = mediaItems.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleFileUpload = useCallback(
        async (files: FileList | null) => {
            if (!files) return;
            setIsUploading(true);

            for (const file of Array.from(files)) {
                // Create object URL for preview (in production, upload to cloud storage)
                const url = URL.createObjectURL(file);
                const type = file.type.startsWith('image/')
                    ? 'image'
                    : file.type.startsWith('video/')
                        ? 'video'
                        : 'document';

                addMedia({
                    url,
                    name: file.name,
                    type,
                    mimeType: file.type,
                    size: file.size,
                    thumbnailUrl: type === 'image' ? url : undefined,
                });
            }

            setIsUploading(false);
        },
        [addMedia]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
        },
        [handleFileUpload]
    );

    const handleSelect = (item: MediaItem) => {
        if (selectionMode) {
            setSelectedId(item.id);
            onSelect?.(item);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getTypeIcon = (type: MediaItem['type']) => {
        switch (type) {
            case 'image':
                return <FileImage className="h-4 w-4" />;
            case 'video':
                return <Film className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher..."
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Upload Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={cn(
                    'border-2 border-dashed rounded-xl p-6 text-center transition-colors',
                    'hover:border-primary hover:bg-primary/5',
                    isUploading && 'border-primary bg-primary/5'
                )}
            >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                    Glissez vos fichiers ici ou
                </p>
                <Label htmlFor="media-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                        <span>
                            <Plus className="h-4 w-4 mr-2" />
                            Parcourir
                        </span>
                    </Button>
                </Label>
                <input
                    id="media-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                />
            </div>

            {/* Media Grid/List */}
            <ScrollArea className="h-[400px]">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucun média</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-3 gap-3">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className={cn(
                                    'relative group rounded-lg overflow-hidden border cursor-pointer transition-all',
                                    selectedId === item.id
                                        ? 'ring-2 ring-primary border-primary'
                                        : 'hover:border-primary/50'
                                )}
                            >
                                {item.type === 'image' ? (
                                    <img
                                        src={item.thumbnailUrl || item.url}
                                        alt={item.name}
                                        className="w-full h-24 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-24 bg-muted flex items-center justify-center">
                                        {getTypeIcon(item.type)}
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {selectionMode ? (
                                        <Button size="sm" variant="secondary">
                                            <Check className="h-4 w-4 mr-1" />
                                            Sélectionner
                                        </Button>
                                    ) : (
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeMedia(item.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                {/* Selected indicator */}
                                {selectedId === item.id && (
                                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                        <Check className="h-3 w-3" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                                    selectedId === item.id
                                        ? 'ring-2 ring-primary border-primary'
                                        : 'hover:border-primary/50'
                                )}
                            >
                                {item.type === 'image' ? (
                                    <img
                                        src={item.thumbnailUrl || item.url}
                                        alt={item.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                        {getTypeIcon(item.type)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(item.size)}
                                    </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {item.type}
                                </Badge>
                                {!selectionMode && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeMedia(item.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                <span>{filteredItems.length} éléments</span>
                <span>
                    {formatFileSize(filteredItems.reduce((acc, item) => acc + item.size, 0))} utilisés
                </span>
            </div>
        </div>
    );
}

// =============================================================================
// MEDIA LIBRARY MODAL (for selection)
// =============================================================================

interface MediaLibraryModalProps {
    trigger: React.ReactNode;
    onSelect: (config: ImageConfig) => void;
    filterType?: 'image' | 'video' | 'document' | 'all';
}

export function MediaLibraryModal({ trigger, onSelect, filterType = 'image' }: MediaLibraryModalProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (media: MediaItem) => {
        const imageConfig: ImageConfig = {
            ...defaultImageConfig,
            url: media.url,
            alt: media.name,
        };
        onSelect(imageConfig);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Images className="h-5 w-5" />
                        Médiathèque
                    </DialogTitle>
                    <DialogDescription>
                        Sélectionnez une image ou uploadez-en une nouvelle
                    </DialogDescription>
                </DialogHeader>
                <MediaLibrary selectionMode onSelect={handleSelect} filterType={filterType} />
            </DialogContent>
        </Dialog>
    );
}
