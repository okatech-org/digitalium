/**
 * EditorHeroPage - Hero section configuration
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Image as ImageIcon,
    Type,
    Layout,
    Sparkles,
    BarChart3,
    Plus,
    Trash2,
    GripVertical,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { usePublicPageEditorStore } from '@/stores/publicPageEditorStore';
import ImageUploader from '@/components/public-page/ImageUploader';

export default function EditorHeroPage() {
    const { config, updateSection, toggleSection } = usePublicPageEditorStore();

    if (!config) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    const { hero, theme } = config;

    const updateHero = (updates: Partial<typeof hero>) => {
        updateSection('hero', updates);
    };

    const addStat = () => {
        updateHero({
            stats: [...(hero.stats || []), { label: 'Nouveau', value: '0' }],
        });
    };

    const removeStat = (index: number) => {
        updateHero({
            stats: hero.stats?.filter((_, i) => i !== index),
        });
    };

    const updateStat = (index: number, field: 'label' | 'value', value: string) => {
        updateHero({
            stats: hero.stats?.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
        });
    };

    return (
        <div className="flex gap-6 h-full">
            {/* Configuration Panel */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <ImageIcon className="h-6 w-6 text-primary" />
                            En-tête (Hero)
                        </h1>
                        <p className="text-muted-foreground">
                            La première section visible de votre page
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Label>Activer</Label>
                        <Switch
                            checked={hero.enabled}
                            onCheckedChange={(checked) => toggleSection('hero', checked)}
                        />
                    </div>
                </div>

                {!hero.enabled ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                Cette section est désactivée. Activez-la pour la configurer.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Layout Selection */}
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
                                        { id: 'centered', label: 'Centré', desc: 'Contenu au centre' },
                                        { id: 'left', label: 'Gauche', desc: 'Contenu à gauche' },
                                        { id: 'right', label: 'Droite', desc: 'Contenu à droite' },
                                        { id: 'split', label: 'Divisé', desc: 'Image + Contenu' },
                                    ].map((layout) => (
                                        <button
                                            key={layout.id}
                                            onClick={() => updateHero({ layout: layout.id as any })}
                                            className={cn(
                                                'p-4 rounded-xl border-2 text-left transition-all',
                                                hero.layout === layout.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                            )}
                                        >
                                            <p className="font-medium">{layout.label}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {layout.desc}
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                <Separator className="my-6" />

                                {/* Height */}
                                <div className="space-y-3">
                                    <Label>Hauteur</Label>
                                    <div className="flex gap-2">
                                        {(['sm', 'md', 'lg', 'xl', 'screen'] as const).map((h) => (
                                            <button
                                                key={h}
                                                onClick={() => updateHero({ height: h })}
                                                className={cn(
                                                    'flex-1 py-2 px-3 rounded-lg border transition-all text-sm',
                                                    hero.height === h
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                )}
                                            >
                                                {h === 'screen' ? 'Plein écran' : h.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
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
                                <div className="space-y-2">
                                    <Label>Badge (optionnel)</Label>
                                    <Input
                                        value={hero.badge || ''}
                                        onChange={(e) => updateHero({ badge: e.target.value })}
                                        placeholder="Ex: République Gabonaise"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Titre Principal</Label>
                                    <Input
                                        value={hero.title}
                                        onChange={(e) => updateHero({ title: e.target.value })}
                                        placeholder="Nom de votre organisation"
                                        className="text-lg font-semibold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Sous-titre</Label>
                                    <Input
                                        value={hero.subtitle}
                                        onChange={(e) => updateHero({ subtitle: e.target.value })}
                                        placeholder="Slogan ou tagline"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={hero.description}
                                        onChange={(e) => updateHero({ description: e.target.value })}
                                        placeholder="Brève description de votre activité"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5" />
                                    Images
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <ImageUploader
                                    value={hero.logo}
                                    onChange={(logo) => updateHero({ logo })}
                                    label="Logo"
                                    description="Votre logo d'entreprise (recommandé: 200x200px)"
                                    aspectRatio="square"
                                    maxHeight="150px"
                                />

                                <Separator />

                                <ImageUploader
                                    value={hero.backgroundImage}
                                    onChange={(backgroundImage) => updateHero({ backgroundImage })}
                                    label="Image de Fond"
                                    description="Image d'arrière-plan du hero (recommandé: 1920x1080px)"
                                    aspectRatio="video"
                                    showOverlayOptions
                                    maxHeight="250px"
                                />
                            </CardContent>
                        </Card>

                        {/* Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Statistiques
                                </CardTitle>
                                <CardDescription>
                                    Chiffres clés affichés dans le hero
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Afficher les statistiques</Label>
                                    <Switch
                                        checked={hero.showStats}
                                        onCheckedChange={(checked) => updateHero({ showStats: checked })}
                                    />
                                </div>

                                {hero.showStats && (
                                    <div className="space-y-3">
                                        {hero.stats?.map((stat, index) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                                <Input
                                                    value={stat.value}
                                                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                                                    placeholder="Valeur"
                                                    className="w-24"
                                                />
                                                <Input
                                                    value={stat.label}
                                                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                                                    placeholder="Label"
                                                    className="flex-1"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeStat(index)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" onClick={addStat} className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Ajouter une statistique
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Live Preview */}
            <div className="w-[400px] border-l bg-muted/30 overflow-auto">
                <div className="sticky top-0 p-4 bg-background border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Aperçu en Direct
                    </h3>
                </div>
                <div className="p-4">
                    <div
                        className={cn(
                            'rounded-xl overflow-hidden',
                            hero.height === 'sm' && 'h-32',
                            hero.height === 'md' && 'h-48',
                            hero.height === 'lg' && 'h-64',
                            hero.height === 'xl' && 'h-80',
                            hero.height === 'screen' && 'h-96'
                        )}
                        style={{
                            background: hero.backgroundImage?.url
                                ? `url(${hero.backgroundImage.url})`
                                : `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div
                            className={cn(
                                'h-full flex flex-col justify-center p-6',
                                hero.layout === 'centered' && 'items-center text-center',
                                hero.layout === 'left' && 'items-start',
                                hero.layout === 'right' && 'items-end text-right'
                            )}
                            style={{
                                backgroundColor: hero.backgroundImage?.overlay?.enabled
                                    ? `${hero.backgroundImage.overlay.color}${Math.round(hero.backgroundImage.overlay.opacity * 2.55).toString(16).padStart(2, '0')}`
                                    : 'rgba(0,0,0,0.4)',
                            }}
                        >
                            {hero.logo?.url && (
                                <img
                                    src={hero.logo.url}
                                    alt="Logo"
                                    className="h-12 w-12 rounded-lg mb-3 object-contain bg-white/10"
                                />
                            )}
                            {hero.badge && (
                                <span
                                    className="text-xs px-2 py-1 rounded-full mb-2"
                                    style={{ backgroundColor: `${theme.colors.accent}40`, color: theme.colors.accent }}
                                >
                                    {hero.badge}
                                </span>
                            )}
                            <h1 className="text-xl font-bold text-white mb-1">{hero.title || 'Titre'}</h1>
                            {hero.subtitle && (
                                <p className="text-sm text-white/80">{hero.subtitle}</p>
                            )}
                            {hero.description && (
                                <p className="text-xs text-white/60 mt-2 max-w-xs">{hero.description}</p>
                            )}
                            {hero.showStats && hero.stats && hero.stats.length > 0 && (
                                <div className="flex gap-4 mt-4">
                                    {hero.stats.map((stat, i) => (
                                        <div key={i} className="text-center">
                                            <p className="text-lg font-bold text-white">{stat.value}</p>
                                            <p className="text-xs text-white/60">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
