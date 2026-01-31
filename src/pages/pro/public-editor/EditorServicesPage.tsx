/**
 * EditorServicesPage - Services section configuration
 */

import React from 'react';
import {
    Briefcase,
    Layout,
    Plus,
    Trash2,
    GripVertical,
    Sparkles,
    Image as ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { usePublicPageEditorStore } from '@/stores/publicPageEditorStore';
import ImageUploader from '@/components/public-page/ImageUploader';

// Common emojis for services
const SERVICE_ICONS = ['📋', '📊', '🔒', '📁', '✍️', '🔍', '📤', '🤝', '💡', '🎯', '⚙️', '📈'];

export default function EditorServicesPage() {
    const { config, updateSection, toggleSection } = usePublicPageEditorStore();

    if (!config) return <div className="p-6">Chargement...</div>;

    const { services, theme } = config;

    const updateServices = (updates: Partial<typeof services>) => {
        updateSection('services', updates);
    };

    const addService = () => {
        updateServices({
            services: [
                ...services.services,
                { id: crypto.randomUUID(), icon: '📋', title: '', description: '' },
            ],
        });
    };

    const removeService = (id: string) => {
        updateServices({
            services: services.services.filter((s) => s.id !== id),
        });
    };

    const updateService = (id: string, field: string, value: any) => {
        updateServices({
            services: services.services.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
        });
    };

    return (
        <div className="flex gap-6 h-full">
            <div className="flex-1 overflow-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Briefcase className="h-6 w-6 text-primary" />
                            Services
                        </h1>
                        <p className="text-muted-foreground">
                            Présentez vos services ou activités
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Label>Activer</Label>
                        <Switch
                            checked={services.enabled}
                            onCheckedChange={(checked) => toggleSection('services', checked)}
                        />
                    </div>
                </div>

                {!services.enabled ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Section désactivée.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Layout & Title */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Titre</Label>
                                        <Input
                                            value={services.title}
                                            onChange={(e) => updateServices({ title: e.target.value })}
                                            placeholder="Nos Services"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sous-titre</Label>
                                        <Input
                                            value={services.subtitle}
                                            onChange={(e) => updateServices({ subtitle: e.target.value })}
                                            placeholder="Ce que nous proposons"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Disposition</Label>
                                    <div className="flex gap-2">
                                        {(['grid', 'list', 'cards', 'tabs'] as const).map((l) => (
                                            <button
                                                key={l}
                                                onClick={() => updateServices({ layout: l })}
                                                className={cn(
                                                    'flex-1 py-2 px-3 rounded-lg border transition-all text-sm capitalize',
                                                    services.layout === l
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

                        {/* Services List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Liste des Services</CardTitle>
                                <CardDescription>
                                    {services.services.length} service(s) configuré(s)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {services.services.map((service, index) => (
                                    <div key={service.id} className="p-4 rounded-xl border space-y-3">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                            <span className="text-sm text-muted-foreground">
                                                Service {index + 1}
                                            </span>
                                            <div className="flex-1" />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeService(service.id)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid gap-3">
                                            {/* Icon Selector */}
                                            <div className="space-y-2">
                                                <Label>Icône</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {SERVICE_ICONS.map((icon) => (
                                                        <button
                                                            key={icon}
                                                            onClick={() => updateService(service.id, 'icon', icon)}
                                                            className={cn(
                                                                'w-10 h-10 rounded-lg border text-lg flex items-center justify-center transition-all',
                                                                service.icon === icon
                                                                    ? 'border-primary bg-primary/10'
                                                                    : 'border-border hover:border-primary/50'
                                                            )}
                                                        >
                                                            {icon}
                                                        </button>
                                                    ))}
                                                    <Input
                                                        value={service.icon}
                                                        onChange={(e) => updateService(service.id, 'icon', e.target.value)}
                                                        className="w-16 text-center text-lg"
                                                        placeholder="🎯"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Titre du service</Label>
                                                <Input
                                                    value={service.title}
                                                    onChange={(e) => updateService(service.id, 'title', e.target.value)}
                                                    placeholder="Nom du service"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={service.description}
                                                    onChange={(e) => updateService(service.id, 'description', e.target.value)}
                                                    placeholder="Décrivez ce service..."
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Lien (optionnel)</Label>
                                                <Input
                                                    value={service.link || ''}
                                                    onChange={(e) => updateService(service.id, 'link', e.target.value)}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Button variant="outline" onClick={addService} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" /> Ajouter un service
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
                            {services.title || 'Nos Services'}
                        </h2>
                        {services.subtitle && (
                            <p className="text-sm text-muted-foreground">{services.subtitle}</p>
                        )}
                    </div>
                    <div className={cn(
                        'gap-3',
                        services.layout === 'grid' && 'grid grid-cols-2',
                        services.layout === 'list' && 'space-y-3',
                        services.layout === 'cards' && 'grid grid-cols-2'
                    )}>
                        {services.services.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center col-span-2">
                                Aucun service configuré
                            </p>
                        ) : (
                            services.services.map((s) => (
                                <div
                                    key={s.id}
                                    className="p-4 rounded-xl"
                                    style={{ backgroundColor: theme.colors.card }}
                                >
                                    <div className="text-2xl mb-2">{s.icon}</div>
                                    <h3 className="font-semibold text-sm" style={{ color: theme.colors.cardForeground }}>
                                        {s.title || 'Service'}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {s.description || 'Description...'}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
