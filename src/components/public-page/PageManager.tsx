/**
 * PageManager - Manage pages for the public site
 */

import React, { useState } from 'react';
import {
    FileText,
    Plus,
    Trash2,
    GripVertical,
    Home,
    Eye,
    EyeOff,
    Settings,
    Palette,
    ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
    usePublicPageEditorStore,
    type PublicPage,
    type SectionType,
    type ThemeConfig,
} from '@/stores/publicPageEditorStore';

const AVAILABLE_SECTIONS: { id: SectionType; label: string }[] = [
    { id: 'hero', label: 'En-tête (Hero)' },
    { id: 'about', label: 'À propos' },
    { id: 'services', label: 'Services' },
    { id: 'team', label: 'Équipe' },
    { id: 'gallery', label: 'Galerie' },
    { id: 'documents', label: 'Documents' },
    { id: 'news', label: 'Actualités' },
    { id: 'contact', label: 'Contact' },
    { id: 'testimonials', label: 'Témoignages' },
    { id: 'partners', label: 'Partenaires' },
    { id: 'cta', label: 'Appel à l\'action' },
];

interface PageManagerProps {
    onEditPage?: (pageId: string) => void;
}

export default function PageManager({ onEditPage }: PageManagerProps) {
    const {
        config,
        activePageId,
        setActivePageId,
        addPage,
        removePage,
        updatePage,
        reorderPages,
        togglePageSection,
    } = usePublicPageEditorStore();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newPageTitle, setNewPageTitle] = useState('');
    const [newPageSlug, setNewPageSlug] = useState('');
    const [draggedId, setDraggedId] = useState<string | null>(null);

    if (!config) return null;

    const pages = [...config.pages].sort((a, b) => a.orderIndex - b.orderIndex);
    const publicUrl = `https://digitalium.ga/p/${config.slug}`;

    const handleAddPage = () => {
        if (!newPageTitle.trim()) return;

        const slug = newPageSlug.trim() || newPageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        addPage({
            slug,
            title: newPageTitle,
            isHome: false,
            orderIndex: pages.length,
            showInNav: true,
            sections: ['hero'],
            sectionConfigs: {
                hero: {
                    enabled: true,
                    layout: 'centered',
                    title: newPageTitle,
                    subtitle: '',
                    description: '',
                    backgroundImage: null,
                    logo: null,
                    height: 'sm',
                    showStats: false,
                },
            },
        });

        setNewPageTitle('');
        setNewPageSlug('');
        setIsAddDialogOpen(false);
    };

    const handleDragStart = (pageId: string) => {
        setDraggedId(pageId);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetId) return;

        const draggedIndex = pages.findIndex((p) => p.id === draggedId);
        const targetIndex = pages.findIndex((p) => p.id === targetId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            const newOrder = [...pages];
            const [removed] = newOrder.splice(draggedIndex, 1);
            newOrder.splice(targetIndex, 0, removed);
            reorderPages(newOrder.map((p) => p.id));
        }
    };

    const handleDragEnd = () => {
        setDraggedId(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Structure du Site
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {pages.length} page(s) • {publicUrl}
                    </p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle Page
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Créer une nouvelle page</DialogTitle>
                            <DialogDescription>
                                Ajoutez une page à votre site public
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Titre de la page</Label>
                                <Input
                                    value={newPageTitle}
                                    onChange={(e) => setNewPageTitle(e.target.value)}
                                    placeholder="À propos"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>URL (slug)</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        /{config.slug}/
                                    </span>
                                    <Input
                                        value={newPageSlug}
                                        onChange={(e) => setNewPageSlug(e.target.value)}
                                        placeholder="a-propos"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Annuler
                            </Button>
                            <Button onClick={handleAddPage} disabled={!newPageTitle.trim()}>
                                Créer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Pages List */}
            <ScrollArea className="h-[calc(100vh-300px)]">
                <Accordion type="single" collapsible className="space-y-2">
                    {pages.map((page) => (
                        <AccordionItem
                            key={page.id}
                            value={page.id}
                            className={cn(
                                'border rounded-lg overflow-hidden transition-all',
                                activePageId === page.id && 'ring-2 ring-primary',
                                draggedId === page.id && 'opacity-50'
                            )}
                            draggable={!page.isHome}
                            onDragStart={() => handleDragStart(page.id)}
                            onDragOver={(e) => handleDragOver(e, page.id)}
                            onDragEnd={handleDragEnd}
                        >
                            <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                                <div className="flex items-center gap-3 w-full">
                                    {!page.isHome && (
                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                    )}
                                    {page.isHome ? (
                                        <Home className="h-4 w-4 text-primary" />
                                    ) : (
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="font-medium flex-1 text-left">{page.title}</span>
                                    <div className="flex items-center gap-2 mr-2">
                                        {page.isHome && (
                                            <Badge variant="secondary" className="text-xs">
                                                Accueil
                                            </Badge>
                                        )}
                                        {!page.showInNav && (
                                            <Badge variant="outline" className="text-xs">
                                                <EyeOff className="h-3 w-3 mr-1" />
                                                Masquée
                                            </Badge>
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            /{page.slug || ''}
                                        </span>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                                <div className="space-y-4 pt-2">
                                    {/* Page Settings */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Titre</Label>
                                            <Input
                                                value={page.title}
                                                onChange={(e) =>
                                                    updatePage(page.id, { title: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>URL</Label>
                                            <Input
                                                value={page.slug}
                                                onChange={(e) =>
                                                    updatePage(page.id, { slug: e.target.value })
                                                }
                                                disabled={page.isHome}
                                            />
                                        </div>
                                    </div>

                                    {/* Visibility */}
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-2">
                                            {page.showInNav ? (
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span className="text-sm">Afficher dans le menu</span>
                                        </div>
                                        <Switch
                                            checked={page.showInNav}
                                            onCheckedChange={(checked) =>
                                                updatePage(page.id, { showInNav: checked })
                                            }
                                        />
                                    </div>

                                    {/* Sections */}
                                    <div className="space-y-2">
                                        <Label>Sections de la page</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_SECTIONS.map((section) => {
                                                const isEnabled = page.sections.includes(section.id);
                                                return (
                                                    <Button
                                                        key={section.id}
                                                        variant={isEnabled ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() =>
                                                            togglePageSection(page.id, section.id, !isEnabled)
                                                        }
                                                    >
                                                        {section.label}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setActivePageId(page.id);
                                                onEditPage?.(page.id);
                                            }}
                                        >
                                            <Settings className="h-4 w-4 mr-2" />
                                            Modifier les sections
                                        </Button>
                                        {!page.isHome && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => removePage(page.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Supprimer
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </ScrollArea>
        </div>
    );
}
