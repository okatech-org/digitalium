/**
 * DocumentAnnotations - Add notes, comments, and highlights to documents
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Highlighter,
    StickyNote,
    Flag,
    Reply,
    Edit,
    Trash2,
    MoreVertical,
    Send,
    Plus,
    Pin,
    Check,
    X,
    Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type AnnotationType = 'comment' | 'highlight' | 'note' | 'flag';

export type AnnotationPriority = 'low' | 'medium' | 'high';

export interface Annotation {
    id: string;
    documentId: string;
    type: AnnotationType;
    content: string;
    pageNumber?: number;
    position?: { x: number; y: number };
    highlightColor?: string;
    priority?: AnnotationPriority;
    isPinned?: boolean;
    isResolved?: boolean;
    createdAt: number;
    updatedAt?: number;
    createdBy: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    };
    replies?: Array<{
        id: string;
        content: string;
        createdAt: number;
        createdBy: {
            id: string;
            name: string;
            avatarUrl?: string;
        };
    }>;
}

const ANNOTATION_COLORS: Record<AnnotationType, { icon: typeof MessageSquare; color: string; bg: string }> = {
    comment: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    highlight: { icon: Highlighter, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    note: { icon: StickyNote, color: 'text-green-500', bg: 'bg-green-500/10' },
    flag: { icon: Flag, color: 'text-red-500', bg: 'bg-red-500/10' },
};

const HIGHLIGHT_COLORS = [
    { name: 'Jaune', value: '#FEF3C7' },
    { name: 'Vert', value: '#D1FAE5' },
    { name: 'Bleu', value: '#DBEAFE' },
    { name: 'Rose', value: '#FCE7F3' },
    { name: 'Orange', value: '#FFEDD5' },
];

interface AnnotationPanelProps {
    documentId: string;
    annotations: Annotation[];
    currentUserId: string;
    onAdd: (annotation: Partial<Annotation>) => Promise<void>;
    onUpdate: (id: string, updates: Partial<Annotation>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onReply: (annotationId: string, content: string) => Promise<void>;
}

export function AnnotationPanel({
    documentId,
    annotations,
    currentUserId,
    onAdd,
    onUpdate,
    onDelete,
    onReply,
}: AnnotationPanelProps) {
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [newType, setNewType] = useState<AnnotationType>('comment');
    const [filter, setFilter] = useState<'all' | 'comments' | 'flags' | 'unresolved'>('all');

    // Filter annotations
    const filteredAnnotations = annotations.filter(a => {
        if (filter === 'comments') return a.type === 'comment';
        if (filter === 'flags') return a.type === 'flag';
        if (filter === 'unresolved') return !a.isResolved;
        return true;
    }).sort((a, b) => {
        // Pinned first, then by date
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt - a.createdAt;
    });

    const handleAdd = async () => {
        if (!newContent.trim()) return;

        await onAdd({
            documentId,
            type: newType,
            content: newContent.trim(),
        });

        setNewContent('');
        setIsAddingNew(false);
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Annotations
                        <Badge variant="secondary" className="ml-1">
                            {annotations.length}
                        </Badge>
                    </CardTitle>
                    <Button size="sm" onClick={() => setIsAddingNew(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-1 mt-2">
                    {(['all', 'comments', 'flags', 'unresolved'] as const).map(f => (
                        <Button
                            key={f}
                            variant={filter === f ? 'secondary' : 'ghost'}
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setFilter(f)}
                        >
                            {f === 'all' && 'Tout'}
                            {f === 'comments' && 'Commentaires'}
                            {f === 'flags' && 'Signalements'}
                            {f === 'unresolved' && 'Non résolus'}
                        </Button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[400px]">
                    <div className="p-4 space-y-3">
                        {/* New annotation form */}
                        <AnimatePresence>
                            {isAddingNew && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                                        {/* Type selector */}
                                        <div className="flex gap-2">
                                            {(Object.keys(ANNOTATION_COLORS) as AnnotationType[]).map(type => {
                                                const config = ANNOTATION_COLORS[type];
                                                const Icon = config.icon;
                                                return (
                                                    <button
                                                        key={type}
                                                        onClick={() => setNewType(type)}
                                                        className={cn(
                                                            'p-2 rounded-lg transition-colors',
                                                            newType === type ? config.bg : 'hover:bg-muted'
                                                        )}
                                                    >
                                                        <Icon className={cn('h-4 w-4', config.color)} />
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Content */}
                                        <Textarea
                                            value={newContent}
                                            onChange={(e) => setNewContent(e.target.value)}
                                            placeholder="Votre commentaire..."
                                            rows={3}
                                            autoFocus
                                        />

                                        {/* Actions */}
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setIsAddingNew(false);
                                                    setNewContent('');
                                                }}
                                            >
                                                Annuler
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleAdd}
                                                disabled={!newContent.trim()}
                                            >
                                                <Send className="h-4 w-4 mr-1" />
                                                Ajouter
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Annotations list */}
                        {filteredAnnotations.map(annotation => (
                            <AnnotationItem
                                key={annotation.id}
                                annotation={annotation}
                                isOwner={annotation.createdBy.id === currentUserId}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                onReply={onReply}
                            />
                        ))}

                        {filteredAnnotations.length === 0 && !isAddingNew && (
                            <div className="text-center py-8 text-muted-foreground">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Aucune annotation</p>
                                <p className="text-xs">Cliquez sur "Ajouter" pour commencer</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function AnnotationItem({
    annotation,
    isOwner,
    onUpdate,
    onDelete,
    onReply,
}: {
    annotation: Annotation;
    isOwner: boolean;
    onUpdate: (id: string, updates: Partial<Annotation>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onReply: (annotationId: string, content: string) => Promise<void>;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(annotation.content);
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const config = ANNOTATION_COLORS[annotation.type];
    const Icon = config.icon;

    const handleSaveEdit = async () => {
        await onUpdate(annotation.id, { content: editContent });
        setIsEditing(false);
    };

    const handleReply = async () => {
        if (!replyContent.trim()) return;
        await onReply(annotation.id, replyContent);
        setReplyContent('');
        setIsReplying(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'border rounded-lg p-3',
                annotation.isResolved && 'opacity-60',
                annotation.isPinned && 'border-primary/50 bg-primary/5'
            )}
        >
            {/* Header */}
            <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={annotation.createdBy.avatarUrl} />
                    <AvatarFallback className={cn('text-xs', config.bg, config.color)}>
                        {annotation.createdBy.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{annotation.createdBy.name}</span>
                        <Badge variant="outline" className={cn('text-[10px] px-1', config.color)}>
                            <Icon className="h-2.5 w-2.5 mr-0.5" />
                            {annotation.type}
                        </Badge>
                        {annotation.isPinned && <Pin className="h-3 w-3 text-primary" />}
                        {annotation.isResolved && (
                            <Badge variant="secondary" className="text-[10px]">
                                <Check className="h-2.5 w-2.5 mr-0.5" />
                                Résolu
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(annotation.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </div>

                {/* Actions menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onUpdate(annotation.id, { isPinned: !annotation.isPinned })}>
                            <Pin className="h-4 w-4 mr-2" />
                            {annotation.isPinned ? 'Désépingler' : 'Épingler'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdate(annotation.id, { isResolved: !annotation.isResolved })}>
                            <Check className="h-4 w-4 mr-2" />
                            {annotation.isResolved ? 'Rouvrir' : 'Marquer résolu'}
                        </DropdownMenuItem>
                        {isOwner && (
                            <>
                                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => onDelete(annotation.id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Content */}
            <div className="mt-2 ml-11">
                {isEditing ? (
                    <div className="space-y-2">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={2}
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>Enregistrer</Button>
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                                Annuler
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm whitespace-pre-wrap">{annotation.content}</p>
                )}

                {/* Replies */}
                {annotation.replies && annotation.replies.length > 0 && (
                    <div className="mt-3 space-y-2 border-l-2 border-muted pl-3">
                        {annotation.replies.map(reply => (
                            <div key={reply.id} className="text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{reply.createdBy.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(reply.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <p className="text-muted-foreground">{reply.content}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reply button/form */}
                {!isEditing && (
                    <div className="mt-2">
                        {isReplying ? (
                            <div className="space-y-2">
                                <Textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Votre réponse..."
                                    rows={2}
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={handleReply}>Répondre</Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsReplying(false)}
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setIsReplying(true)}
                            >
                                <Reply className="h-3 w-3 mr-1" />
                                Répondre
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

/**
 * HighlightColorPicker - Color picker for highlights
 */
export function HighlightColorPicker({
    selectedColor,
    onSelect,
}: {
    selectedColor?: string;
    onSelect: (color: string) => void;
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: selectedColor || HIGHLIGHT_COLORS[0].value }}
                    />
                    <Highlighter className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
                <div className="flex gap-2">
                    {HIGHLIGHT_COLORS.map(color => (
                        <button
                            key={color.value}
                            className={cn(
                                'w-8 h-8 rounded-lg border-2 transition-transform',
                                selectedColor === color.value
                                    ? 'border-primary scale-110'
                                    : 'border-transparent hover:scale-105'
                            )}
                            style={{ backgroundColor: color.value }}
                            onClick={() => onSelect(color.value)}
                            title={color.name}
                        />
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default AnnotationPanel;
