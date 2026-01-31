/**
 * EditorGalleryPage - Gallery section configuration
 */

import React from 'react';
import { Images, Plus, Trash2, GripVertical, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { usePublicPageEditorStore, defaultImageConfig } from '@/stores/publicPageEditorStore';
import ImageUploader from '@/components/public-page/ImageUploader';

export default function EditorGalleryPage() {
    const { config, updateSection, toggleSection } = usePublicPageEditorStore();

    if (!config) return <div className="p-6">Chargement...</div>;

    const { gallery, theme } = config;

    const updateGallery = (updates: Partial<typeof gallery>) => {
        updateSection('gallery', updates);
    };

    const addImage = () => {
        updateGallery({
            images: [...gallery.images, { ...defaultImageConfig, url: '', alt: '', caption: '' }],
        });
    };

    const removeImage = (index: number) => {
        updateGallery({ images: gallery.images.filter((_, i) => i !== index) });
    };

    const updateImage = (index: number, updates: any) => {
        updateGallery({
            images: gallery.images.map((img, i) => (i === index ? { ...img, ...updates } : img)),
        });
    };

    return (
        <div className="flex gap-6 h-full">
            <div className="flex-1 overflow-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Images className="h-6 w-6 text-primary" />
                            Galerie
                        </h1>
                        <p className="text-muted-foreground">
                            Présentez vos réalisations en images
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Label>Activer</Label>
                        <Switch
                            checked={gallery.enabled}
                            onCheckedChange={(checked) => toggleSection('gallery', checked)}
                        />
                    </div>
                </div>

                {!gallery.enabled ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Section désactivée.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Titre</Label>
                                        <Input
                                            value={gallery.title}
                                            onChange={(e) => updateGallery({ title: e.target.value })}
                                            placeholder="Galerie"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sous-titre</Label>
                                        <Input
                                            value={gallery.subtitle}
                                            onChange={(e) => updateGallery({ subtitle: e.target.value })}
                                            placeholder="Nos réalisations"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Disposition</Label>
                                    <div className="flex gap-2">
                                        {(['grid', 'masonry', 'carousel'] as const).map((l) => (
                                            <button
                                                key={l}
                                                onClick={() => updateGallery({ layout: l })}
                                                className={cn(
                                                    'flex-1 py-2 px-3 rounded-lg border transition-all text-sm capitalize',
                                                    gallery.layout === l
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                )}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Images</CardTitle>
                                <CardDescription>
                                    {gallery.images.length} image(s) dans la galerie
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {gallery.images.map((image, index) => (
                                        <div key={index} className="p-3 rounded-xl border space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                                    <span className="text-sm text-muted-foreground">
                                                        Image {index + 1}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeImage(index)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <ImageUploader
                                                value={image.url ? image : null}
                                                onChange={(img) => img && updateImage(index, img)}
                                                aspectRatio="video"
                                                maxHeight="150px"
                                            />

                                            <Input
                                                value={image.caption || ''}
                                                onChange={(e) => updateImage(index, { caption: e.target.value })}
                                                placeholder="Légende (optionnel)"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <Button variant="outline" onClick={addImage} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" /> Ajouter une image
                                </Button>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Preview */}
            <div className="w-[400px] border-l bg-muted/30 overflow-auto">
                <div className="sticky top-0 p-4 bg-background border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Aperçu
                    </h3>
                </div>
                <div className="p-4 space-y-4">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold" style={{ color: theme.colors.primary }}>
                            {gallery.title || 'Galerie'}
                        </h2>
                        {gallery.subtitle && (
                            <p className="text-sm text-muted-foreground">{gallery.subtitle}</p>
                        )}
                    </div>

                    <div className={cn(
                        'gap-2',
                        gallery.layout === 'grid' && 'grid grid-cols-2',
                        gallery.layout === 'masonry' && 'columns-2 space-y-2'
                    )}>
                        {gallery.images.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center col-span-2">
                                Aucune image ajoutée
                            </p>
                        ) : (
                            gallery.images.map((img, i) => (
                                <div
                                    key={i}
                                    className="rounded-lg overflow-hidden"
                                    style={{ backgroundColor: theme.colors.card }}
                                >
                                    {img.url ? (
                                        <img
                                            src={img.url}
                                            alt={img.alt}
                                            className="w-full h-24 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-24 bg-muted flex items-center justify-center">
                                            <Images className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    {img.caption && (
                                        <p className="text-xs p-2 text-center">{img.caption}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
