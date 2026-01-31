/**
 * EditorAboutPage - About section configuration
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Type,
    Layout,
    FileText,
    Award,
    Plus,
    Trash2,
    GripVertical,
    Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { usePublicPageEditorStore } from '@/stores/publicPageEditorStore';
import ImageUploader from '@/components/public-page/ImageUploader';

export default function EditorAboutPage() {
    const { config, updateSection, toggleSection } = usePublicPageEditorStore();

    if (!config) return <div className="p-6">Chargement...</div>;

    const { about, theme } = config;

    const updateAbout = (updates: Partial<typeof about>) => {
        updateSection('about', updates);
    };

    const addFeature = () => {
        updateAbout({
            features: [...(about.features || []), { icon: '✨', title: '', description: '' }],
        });
    };

    const removeFeature = (index: number) => {
        updateAbout({ features: about.features?.filter((_, i) => i !== index) });
    };

    const updateFeature = (index: number, field: string, value: string) => {
        updateAbout({
            features: about.features?.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
        });
    };

    const addCertification = () => {
        updateAbout({ certifications: [...(about.certifications || []), ''] });
    };

    const removeCertification = (index: number) => {
        updateAbout({ certifications: about.certifications?.filter((_, i) => i !== index) });
    };

    const updateCertification = (index: number, value: string) => {
        updateAbout({
            certifications: about.certifications?.map((c, i) => (i === index ? value : c)),
        });
    };

    return (
        <div className="flex gap-6 h-full">
            <div className="flex-1 overflow-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            À Propos
                        </h1>
                        <p className="text-muted-foreground">
                            Présentez votre organisation
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Label>Activer</Label>
                        <Switch
                            checked={about.enabled}
                            onCheckedChange={(checked) => toggleSection('about', checked)}
                        />
                    </div>
                </div>

                {!about.enabled ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                Cette section est désactivée.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Layout */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Layout className="h-5 w-5" />
                                    Disposition
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { id: 'text-only', label: 'Texte seul' },
                                        { id: 'text-image', label: 'Texte + Image' },
                                        { id: 'image-text', label: 'Image + Texte' },
                                        { id: 'cards', label: 'Cartes Features' },
                                    ].map((l) => (
                                        <button
                                            key={l.id}
                                            onClick={() => updateAbout({ layout: l.id as any })}
                                            className={cn(
                                                'p-4 rounded-xl border-2 transition-all',
                                                about.layout === l.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                            )}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Type className="h-5 w-5" />
                                    Contenu
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Titre</Label>
                                        <Input
                                            value={about.title}
                                            onChange={(e) => updateAbout({ title: e.target.value })}
                                            placeholder="À propos de nous"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sous-titre</Label>
                                        <Input
                                            value={about.subtitle}
                                            onChange={(e) => updateAbout({ subtitle: e.target.value })}
                                            placeholder="Notre histoire"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={about.content}
                                        onChange={(e) => updateAbout({ content: e.target.value })}
                                        placeholder="Présentez votre organisation..."
                                        rows={6}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Image */}
                        {(about.layout === 'text-image' || about.layout === 'image-text') && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Image</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ImageUploader
                                        value={about.image}
                                        onChange={(image) => updateAbout({ image })}
                                        aspectRatio="video"
                                        maxHeight="250px"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Features */}
                        {about.layout === 'cards' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Points Forts</CardTitle>
                                    <CardDescription>
                                        Ajoutez vos avantages ou valeurs
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {about.features?.map((feature, index) => (
                                        <div key={index} className="flex gap-2 items-start p-3 rounded-lg border">
                                            <Input
                                                value={feature.icon}
                                                onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                                                className="w-16 text-center"
                                                placeholder="🎯"
                                            />
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    value={feature.title}
                                                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                                                    placeholder="Titre"
                                                />
                                                <Input
                                                    value={feature.description}
                                                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                                    placeholder="Description"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFeature(index)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" onClick={addFeature} className="w-full">
                                        <Plus className="h-4 w-4 mr-2" /> Ajouter
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Certifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Certifications & Agréments
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {about.certifications?.map((cert, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={cert}
                                            onChange={(e) => updateCertification(index, e.target.value)}
                                            placeholder="Ex: ISO 9001"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeCertification(index)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" onClick={addCertification} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" /> Ajouter
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
                <div className="p-4">
                    <div className="rounded-xl p-6" style={{ backgroundColor: theme.colors.card }}>
                        <h2 className="text-xl font-bold mb-2" style={{ color: theme.colors.primary }}>
                            {about.title || 'À propos'}
                        </h2>
                        {about.subtitle && (
                            <p className="text-sm text-muted-foreground mb-4">{about.subtitle}</p>
                        )}
                        <p className="text-sm" style={{ color: theme.colors.cardForeground }}>
                            {about.content || 'Votre description apparaîtra ici...'}
                        </p>
                        {about.certifications && about.certifications.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {about.certifications.filter(Boolean).map((cert, i) => (
                                    <span
                                        key={i}
                                        className="text-xs px-2 py-1 rounded-full"
                                        style={{ backgroundColor: `${theme.colors.primary}20`, color: theme.colors.primary }}
                                    >
                                        {cert}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
