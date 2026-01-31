/**
 * EditorThemePage - Theme and colors customization
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Palette,
    Type,
    Circle,
    Square,
    RectangleHorizontal,
    Sparkles,
    Sun,
    Moon,
    Check,
    RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { usePublicPageEditorStore, defaultTheme } from '@/stores/publicPageEditorStore';

// Preset color palettes
const COLOR_PRESETS = [
    { name: 'Océan', primary: '#0ea5e9', secondary: '#06b6d4', accent: '#14b8a6' },
    { name: 'Forêt', primary: '#22c55e', secondary: '#10b981', accent: '#059669' },
    { name: 'Coucher de soleil', primary: '#f97316', secondary: '#ef4444', accent: '#ec4899' },
    { name: 'Royal', primary: '#8b5cf6', secondary: '#6366f1', accent: '#3b82f6' },
    { name: 'Monochrome', primary: '#374151', secondary: '#6b7280', accent: '#111827' },
    { name: 'Émeraude', primary: '#10b981', secondary: '#059669', accent: '#047857' },
];

const FONT_OPTIONS = [
    { value: 'Inter', label: 'Inter (Moderne)' },
    { value: 'Roboto', label: 'Roboto (Clean)' },
    { value: 'Playfair Display', label: 'Playfair (Élégant)' },
    { value: 'Poppins', label: 'Poppins (Friendly)' },
    { value: 'Montserrat', label: 'Montserrat (Bold)' },
    { value: 'Lato', label: 'Lato (Classique)' },
];

export default function EditorThemePage() {
    const { config, updateTheme } = usePublicPageEditorStore();

    if (!config) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    const { theme } = config;

    const handleColorChange = (colorKey: keyof typeof theme.colors, value: string) => {
        updateTheme({
            colors: { ...theme.colors, [colorKey]: value },
        });
    };

    const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
        updateTheme({
            colors: {
                ...theme.colors,
                primary: preset.primary,
                secondary: preset.secondary,
                accent: preset.accent,
            },
        });
    };

    const resetToDefault = () => {
        updateTheme(defaultTheme);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Palette className="h-6 w-6 text-primary" />
                        Thème & Couleurs
                    </h1>
                    <p className="text-muted-foreground">
                        Personnalisez l'apparence de votre page publique
                    </p>
                </div>
                <Button variant="outline" onClick={resetToDefault}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Réinitialiser
                </Button>
            </div>

            {/* Color Presets */}
            <Card>
                <CardHeader>
                    <CardTitle>Palettes Prédéfinies</CardTitle>
                    <CardDescription>
                        Sélectionnez une palette ou personnalisez les couleurs ci-dessous
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {COLOR_PRESETS.map((preset) => (
                            <motion.button
                                key={preset.name}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => applyColorPreset(preset)}
                                className={cn(
                                    'p-4 rounded-xl border-2 transition-all text-left',
                                    theme.colors.primary === preset.primary
                                        ? 'border-primary ring-4 ring-primary/20'
                                        : 'border-border hover:border-primary/50'
                                )}
                            >
                                <div className="flex gap-2 mb-3">
                                    <div
                                        className="w-8 h-8 rounded-full"
                                        style={{ backgroundColor: preset.primary }}
                                    />
                                    <div
                                        className="w-8 h-8 rounded-full"
                                        style={{ backgroundColor: preset.secondary }}
                                    />
                                    <div
                                        className="w-8 h-8 rounded-full"
                                        style={{ backgroundColor: preset.accent }}
                                    />
                                </div>
                                <p className="font-medium">{preset.name}</p>
                            </motion.button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Custom Colors */}
            <Card>
                <CardHeader>
                    <CardTitle>Couleurs Personnalisées</CardTitle>
                    <CardDescription>
                        Affinez chaque couleur selon votre identité visuelle
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                            { key: 'primary', label: 'Couleur Principale' },
                            { key: 'secondary', label: 'Couleur Secondaire' },
                            { key: 'accent', label: 'Couleur d\'Accent' },
                            { key: 'background', label: 'Arrière-plan' },
                            { key: 'foreground', label: 'Texte Principal' },
                            { key: 'card', label: 'Fond des Cartes' },
                        ].map((color) => (
                            <div key={color.key} className="space-y-2">
                                <Label className="text-sm">{color.label}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={theme.colors[color.key as keyof typeof theme.colors]}
                                        onChange={(e) =>
                                            handleColorChange(
                                                color.key as keyof typeof theme.colors,
                                                e.target.value
                                            )
                                        }
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={theme.colors[color.key as keyof typeof theme.colors]}
                                        onChange={(e) =>
                                            handleColorChange(
                                                color.key as keyof typeof theme.colors,
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 font-mono text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Typography */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        Typographie
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label>Police des Titres</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {FONT_OPTIONS.map((font) => (
                                    <button
                                        key={font.value}
                                        onClick={() => updateTheme({ fonts: { ...theme.fonts, heading: font.value } })}
                                        className={cn(
                                            'p-3 rounded-lg border text-left transition-all',
                                            theme.fonts.heading === font.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        <p className="font-medium text-sm" style={{ fontFamily: font.value }}>
                                            {font.label}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label>Police du Corps</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {FONT_OPTIONS.map((font) => (
                                    <button
                                        key={font.value}
                                        onClick={() => updateTheme({ fonts: { ...theme.fonts, body: font.value } })}
                                        className={cn(
                                            'p-3 rounded-lg border text-left transition-all',
                                            theme.fonts.body === font.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        <p className="text-sm" style={{ fontFamily: font.value }}>
                                            {font.label}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Style Options */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Options de Style
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Border Radius */}
                    <div className="space-y-3">
                        <Label>Arrondis des Coins</Label>
                        <div className="flex gap-2">
                            {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((radius) => (
                                <button
                                    key={radius}
                                    onClick={() => updateTheme({ borderRadius: radius })}
                                    className={cn(
                                        'flex-1 p-3 border transition-all flex items-center justify-center',
                                        theme.borderRadius === radius
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50',
                                        radius === 'none' && 'rounded-none',
                                        radius === 'sm' && 'rounded-sm',
                                        radius === 'md' && 'rounded-md',
                                        radius === 'lg' && 'rounded-lg',
                                        radius === 'xl' && 'rounded-xl'
                                    )}
                                >
                                    <span className="text-xs font-medium uppercase">{radius}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Shadows */}
                    <div className="space-y-3">
                        <Label>Ombres</Label>
                        <div className="flex gap-2">
                            {(['none', 'sm', 'md', 'lg'] as const).map((shadow) => (
                                <button
                                    key={shadow}
                                    onClick={() => updateTheme({ shadows: shadow })}
                                    className={cn(
                                        'flex-1 p-4 rounded-lg border transition-all',
                                        theme.shadows === shadow
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50',
                                        shadow === 'sm' && 'shadow-sm',
                                        shadow === 'md' && 'shadow-md',
                                        shadow === 'lg' && 'shadow-lg'
                                    )}
                                >
                                    <span className="text-xs font-medium uppercase">{shadow}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Animations */}
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                            <p className="font-medium">Animations</p>
                            <p className="text-sm text-muted-foreground">
                                Activer les effets de transition et animations
                            </p>
                        </div>
                        <Switch
                            checked={theme.animations}
                            onCheckedChange={(checked) => updateTheme({ animations: checked })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Live Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Aperçu en Direct</CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="p-6 rounded-xl"
                        style={{ backgroundColor: theme.colors.background }}
                    >
                        <div
                            className={cn(
                                'p-6',
                                theme.borderRadius === 'none' && 'rounded-none',
                                theme.borderRadius === 'sm' && 'rounded-sm',
                                theme.borderRadius === 'md' && 'rounded-md',
                                theme.borderRadius === 'lg' && 'rounded-lg',
                                theme.borderRadius === 'xl' && 'rounded-xl',
                                theme.shadows === 'sm' && 'shadow-sm',
                                theme.shadows === 'md' && 'shadow-md',
                                theme.shadows === 'lg' && 'shadow-lg'
                            )}
                            style={{ backgroundColor: theme.colors.card }}
                        >
                            <h2
                                className="text-xl font-bold mb-2"
                                style={{ color: theme.colors.primary, fontFamily: theme.fonts.heading }}
                            >
                                Titre de Section
                            </h2>
                            <p
                                className="text-sm mb-4"
                                style={{ color: theme.colors.cardForeground, fontFamily: theme.fonts.body }}
                            >
                                Ceci est un exemple de texte pour montrer comment votre contenu
                                apparaîtra avec les paramètres actuels.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    className={cn(
                                        'px-4 py-2 font-medium text-white text-sm transition-transform',
                                        theme.animations && 'hover:scale-105',
                                        theme.borderRadius === 'xl' ? 'rounded-xl' : `rounded-${theme.borderRadius}`
                                    )}
                                    style={{ backgroundColor: theme.colors.primary }}
                                >
                                    Bouton Principal
                                </button>
                                <button
                                    className={cn(
                                        'px-4 py-2 font-medium text-sm border transition-transform',
                                        theme.animations && 'hover:scale-105',
                                        theme.borderRadius === 'xl' ? 'rounded-xl' : `rounded-${theme.borderRadius}`
                                    )}
                                    style={{
                                        color: theme.colors.primary,
                                        borderColor: theme.colors.primary,
                                    }}
                                >
                                    Bouton Secondaire
                                </button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
