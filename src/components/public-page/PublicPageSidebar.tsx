/**
 * PublicPageSidebar - Configuration sidebar for the public page editor
 * Contains tabs for Template, Palette, Content, and Sections configuration
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette,
    Layout,
    FileText,
    Layers,
    Eye,
    EyeOff,
    GripVertical,
    ChevronDown,
    Check,
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    Share2,
    BarChart3,
    Users,
    Briefcase,
    FileText as DocIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { type TemplateConfig, type TemplateId, getAllTemplates } from '@/lib/public-page-templates';
import { type ColorPalette, type PaletteId, getAllPalettes } from '@/lib/public-page-palettes';
import { type PublicPageContent, type SectionConfig } from './PublicPagePreview';

interface PublicPageSidebarProps {
    template: TemplateConfig;
    palette: ColorPalette;
    content: PublicPageContent;
    sections: SectionConfig[];
    onTemplateChange: (id: TemplateId) => void;
    onPaletteChange: (id: PaletteId) => void;
    onContentChange: (updates: Partial<PublicPageContent>) => void;
    onSectionToggle: (id: string, enabled: boolean) => void;
    onSectionReorder: (sections: SectionConfig[]) => void;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
    hero: <Layout className="h-4 w-4" />,
    about: <Building2 className="h-4 w-4" />,
    stats: <BarChart3 className="h-4 w-4" />,
    services: <Briefcase className="h-4 w-4" />,
    team: <Users className="h-4 w-4" />,
    documents: <DocIcon className="h-4 w-4" />,
    contact: <Mail className="h-4 w-4" />,
    social: <Share2 className="h-4 w-4" />,
};

const SECTION_NAMES: Record<string, string> = {
    hero: 'En-tête (Hero)',
    about: 'À propos',
    stats: 'Statistiques',
    services: 'Services',
    team: 'Équipe',
    documents: 'Documents',
    contact: 'Contact',
    social: 'Réseaux sociaux',
};

export default function PublicPageSidebar({
    template,
    palette,
    content,
    sections,
    onTemplateChange,
    onPaletteChange,
    onContentChange,
    onSectionToggle,
}: PublicPageSidebarProps) {
    const [activeTab, setActiveTab] = useState('template');
    const templates = getAllTemplates();
    const palettes = getAllPalettes();

    return (
        <div className="h-full flex flex-col bg-background border-r">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                <TabsList className="grid grid-cols-4 m-2">
                    <TabsTrigger value="template" className="text-xs px-2">
                        <Layout className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Template</span>
                    </TabsTrigger>
                    <TabsTrigger value="palette" className="text-xs px-2">
                        <Palette className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Couleurs</span>
                    </TabsTrigger>
                    <TabsTrigger value="content" className="text-xs px-2">
                        <FileText className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Contenu</span>
                    </TabsTrigger>
                    <TabsTrigger value="sections" className="text-xs px-2">
                        <Layers className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Sections</span>
                    </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1">
                    {/* Template Tab */}
                    <TabsContent value="template" className="m-0 p-3 space-y-3">
                        <p className="text-xs text-muted-foreground">
                            Choisissez un style pour votre page
                        </p>
                        <div className="grid gap-2">
                            {templates.map((t) => (
                                <motion.div
                                    key={t.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <button
                                        onClick={() => onTemplateChange(t.id)}
                                        className={cn(
                                            'w-full text-left p-3 rounded-lg border transition-all',
                                            template.id === t.id
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            <div
                                                className="w-12 h-12 rounded-md shrink-0"
                                                style={{ background: t.preview }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm">{t.name}</p>
                                                    {template.id === t.id && (
                                                        <Check className="h-3 w-3 text-primary" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {t.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Palette Tab */}
                    <TabsContent value="palette" className="m-0 p-3 space-y-3">
                        <p className="text-xs text-muted-foreground">
                            Sélectionnez une palette de couleurs
                        </p>
                        <div className="grid gap-2">
                            {palettes.map((p) => (
                                <motion.div
                                    key={p.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <button
                                        onClick={() => onPaletteChange(p.id)}
                                        className={cn(
                                            'w-full text-left p-3 rounded-lg border transition-all',
                                            palette.id === p.id
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        <div className="flex gap-3 items-center">
                                            <div className="flex gap-1 shrink-0">
                                                <div
                                                    className="w-6 h-6 rounded-full"
                                                    style={{ backgroundColor: p.colors.primary }}
                                                />
                                                <div
                                                    className="w-6 h-6 rounded-full"
                                                    style={{ backgroundColor: p.colors.secondary }}
                                                />
                                                <div
                                                    className="w-6 h-6 rounded-full"
                                                    style={{ backgroundColor: p.colors.accent }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm">{p.name}</p>
                                                    {palette.id === p.id && (
                                                        <Check className="h-3 w-3 text-primary" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {p.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {palette.isCustom && (
                            <Card className="mt-4">
                                <CardHeader className="py-3">
                                    <CardTitle className="text-sm">Couleurs personnalisées</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs">Primaire</Label>
                                            <Input
                                                type="color"
                                                value={palette.colors.primary}
                                                className="h-8 p-1 cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Secondaire</Label>
                                            <Input
                                                type="color"
                                                value={palette.colors.secondary}
                                                className="h-8 p-1 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Content Tab */}
                    <TabsContent value="content" className="m-0 p-3 space-y-4">
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs">Nom de l'entreprise</Label>
                                <Input
                                    value={content.companyName}
                                    onChange={(e) => onContentChange({ companyName: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Slogan / Tagline</Label>
                                <Input
                                    value={content.tagline}
                                    onChange={(e) => onContentChange({ tagline: e.target.value })}
                                    placeholder="Votre slogan..."
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Description</Label>
                                <Textarea
                                    value={content.description}
                                    onChange={(e) => onContentChange({ description: e.target.value })}
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground">Informations</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Secteur</Label>
                                    <Input
                                        value={content.industry}
                                        onChange={(e) => onContentChange({ industry: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Taille</Label>
                                    <Input
                                        value={content.size}
                                        onChange={(e) => onContentChange({ size: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs">Fondée en</Label>
                                <Input
                                    value={content.founded}
                                    onChange={(e) => onContentChange({ founded: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground">Contact</p>
                            <div>
                                <Label className="text-xs">Email</Label>
                                <Input
                                    type="email"
                                    value={content.email}
                                    onChange={(e) => onContentChange({ email: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Téléphone</Label>
                                <Input
                                    value={content.phone}
                                    onChange={(e) => onContentChange({ phone: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Site web</Label>
                                <Input
                                    value={content.website}
                                    onChange={(e) => onContentChange({ website: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Sections Tab */}
                    <TabsContent value="sections" className="m-0 p-3 space-y-3">
                        <p className="text-xs text-muted-foreground">
                            Activez ou désactivez les sections de votre page
                        </p>
                        <div className="space-y-2">
                            {sections.sort((a, b) => a.order - b.order).map((section) => (
                                <div
                                    key={section.id}
                                    className={cn(
                                        'flex items-center gap-3 p-3 rounded-lg border transition-all',
                                        section.enabled
                                            ? 'bg-background border-border'
                                            : 'bg-muted/30 border-transparent opacity-60'
                                    )}
                                >
                                    <div className="text-muted-foreground cursor-grab">
                                        <GripVertical className="h-4 w-4" />
                                    </div>
                                    <div className="text-muted-foreground">
                                        {SECTION_ICONS[section.type]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">
                                            {SECTION_NAMES[section.type]}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={section.enabled}
                                        onCheckedChange={(checked) => onSectionToggle(section.id, checked)}
                                    />
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
    );
}
