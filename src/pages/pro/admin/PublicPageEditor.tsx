/**
 * PublicPageEditor - Advanced public page editor with live preview
 * Main page for editing the company's public profile with templates, palettes, and sections
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    Eye,
    EyeOff,
    Undo2,
    Redo2,
    Monitor,
    Tablet,
    Smartphone,
    ExternalLink,
    Globe,
    Check,
    Copy,
    QrCode,
    ChevronLeft,
    LayoutPanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useOrganizationContext } from '@/hooks/useOrganizationContext';
import { type TemplateId, type TemplateConfig, getTemplate, TEMPLATES } from '@/lib/public-page-templates';
import { type PaletteId, type ColorPalette, getPalette, PALETTES } from '@/lib/public-page-palettes';
import PublicPagePreview, { type PublicPageContent, type SectionConfig } from '@/components/public-page/PublicPagePreview';
import PublicPageSidebar from '@/components/public-page/PublicPageSidebar';

// Default sections configuration
const DEFAULT_SECTIONS: SectionConfig[] = [
    { id: 'hero', type: 'hero', enabled: true, order: 0 },
    { id: 'stats', type: 'stats', enabled: true, order: 1 },
    { id: 'about', type: 'about', enabled: true, order: 2 },
    { id: 'services', type: 'services', enabled: false, order: 3 },
    { id: 'team', type: 'team', enabled: false, order: 4 },
    { id: 'documents', type: 'documents', enabled: false, order: 5 },
    { id: 'contact', type: 'contact', enabled: true, order: 6 },
    { id: 'social', type: 'social', enabled: true, order: 7 },
];

export default function PublicPageEditor() {
    const orgContext = useOrganizationContext();

    // Initial content from organization context
    const initialContent: PublicPageContent = {
        companyName: orgContext.name,
        tagline: orgContext.isInstitutional ? 'Au service des citoyens' : 'Excellence et Innovation',
        description: orgContext.isInstitutional
            ? `Le ${orgContext.name} œuvre pour le développement durable des ressources halieutiques au Gabon. Notre mission est d'assurer une gestion responsable des pêches et de l'aquaculture pour les générations futures.`
            : `${orgContext.name} est un leader dans le secteur des assurances au Gabon. Nous accompagnons les entreprises et particuliers avec des solutions d'assurance adaptées à leurs besoins.`,
        longDescription: '',
        industry: orgContext.isInstitutional ? 'Administration Publique' : 'Assurances & Services Financiers',
        size: orgContext.isInstitutional ? '150+ agents' : `${orgContext.members.length}+ employés`,
        founded: orgContext.isInstitutional ? '1960' : '1995',
        website: `https://${orgContext.type === 'peche' ? 'peche.gouv.ga' : orgContext.type === 'ascoma' ? 'ascoma.ga' : 'digitalium.ga'}`,
        email: orgContext.members[0]?.email || 'contact@digitalium.ga',
        phone: '+241 01 76 XX XX',
        address: {
            street: orgContext.address,
            city: orgContext.city,
            country: orgContext.country,
        },
        social: {
            linkedin: 'https://linkedin.com/company/example',
            facebook: 'https://facebook.com/example',
        },
        stats: [
            { label: orgContext.isInstitutional ? 'Permis délivrés' : 'Polices actives', value: orgContext.stats.documents.value.toString() },
            { label: 'Années d\'expérience', value: orgContext.isInstitutional ? '64+' : '29+' },
            { label: orgContext.isInstitutional ? 'Agents' : 'Collaborateurs', value: orgContext.members.length.toString() },
        ],
        certifications: orgContext.isInstitutional
            ? ['ISO 9001', 'Gouvernement Gabonais', 'OHADA']
            : ['CIMA', 'FANAF', 'ISO 27001'],
    };

    // State
    const [templateId, setTemplateId] = useState<TemplateId>(orgContext.isInstitutional ? 'corporate' : 'modern');
    const [paletteId, setPaletteId] = useState<PaletteId>(orgContext.isInstitutional ? 'forest' : 'royal');
    const [content, setContent] = useState<PublicPageContent>(initialContent);
    const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
    const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const template = getTemplate(templateId);
    const palette = getPalette(paletteId);
    const publicUrl = `https://digitalium.ga/p/${orgContext.type}`;

    // Handlers
    const handleTemplateChange = useCallback((id: TemplateId) => {
        setTemplateId(id);
        setHasChanges(true);
    }, []);

    const handlePaletteChange = useCallback((id: PaletteId) => {
        setPaletteId(id);
        setHasChanges(true);
    }, []);

    const handleContentChange = useCallback((updates: Partial<PublicPageContent>) => {
        setContent(prev => ({ ...prev, ...updates }));
        setHasChanges(true);
    }, []);

    const handleSectionToggle = useCallback((id: string, enabled: boolean) => {
        setSections(prev =>
            prev.map(s => (s.id === id ? { ...s, enabled } : s))
        );
        setHasChanges(true);
    }, []);

    const handleSectionReorder = useCallback((newSections: SectionConfig[]) => {
        setSections(newSections);
        setHasChanges(true);
    }, []);

    const handleEditField = useCallback((field: string, value: string) => {
        if (field.startsWith('stats.')) {
            const [, index, prop] = field.split('.');
            setContent(prev => ({
                ...prev,
                stats: prev.stats.map((s, i) =>
                    i === parseInt(index) ? { ...s, [prop]: value } : s
                ),
            }));
        } else {
            setContent(prev => ({ ...prev, [field]: value }));
        }
        setHasChanges(true);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setHasChanges(false);
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(publicUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="h-screen flex flex-col bg-muted/30">
            {/* Header */}
            <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarVisible(!sidebarVisible)}>
                        <LayoutPanelLeft className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <div>
                        <h1 className="text-sm font-semibold">Éditeur de Page Publique</h1>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {publicUrl}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Viewport Switcher */}
                    <TooltipProvider delayDuration={0}>
                        <div className="flex items-center border rounded-md p-1 bg-muted/50">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={viewMode === 'desktop' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setViewMode('desktop')}
                                    >
                                        <Monitor className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Bureau</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={viewMode === 'tablet' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setViewMode('tablet')}
                                    >
                                        <Tablet className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Tablette</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={viewMode === 'mobile' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setViewMode('mobile')}
                                    >
                                        <Smartphone className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Mobile</TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>

                    <Separator orientation="vertical" className="h-6" />

                    {/* Copy Link */}
                    <Button variant="outline" size="sm" onClick={handleCopyLink}>
                        {isCopied ? (
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                            <Copy className="h-4 w-4 mr-2" />
                        )}
                        Copier le lien
                    </Button>

                    {/* Preview */}
                    <Button variant="outline" size="sm" asChild>
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Aperçu
                        </a>
                    </Button>

                    {/* Save */}
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className="min-w-[100px]"
                    >
                        {isSaving ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >
                                <Save className="h-4 w-4" />
                            </motion.div>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {hasChanges ? 'Enregistrer' : 'Enregistré'}
                            </>
                        )}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <motion.div
                    initial={false}
                    animate={{
                        width: sidebarVisible ? 320 : 0,
                        opacity: sidebarVisible ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden shrink-0"
                >
                    <div className="w-[320px] h-full">
                        <PublicPageSidebar
                            template={template}
                            palette={palette}
                            content={content}
                            sections={sections}
                            onTemplateChange={handleTemplateChange}
                            onPaletteChange={handlePaletteChange}
                            onContentChange={handleContentChange}
                            onSectionToggle={handleSectionToggle}
                            onSectionReorder={handleSectionReorder}
                        />
                    </div>
                </motion.div>

                {/* Preview Area */}
                <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
                    <motion.div
                        layout
                        className="w-full"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <PublicPagePreview
                            template={template}
                            palette={palette}
                            content={content}
                            sections={sections}
                            viewMode={viewMode}
                            onEditField={handleEditField}
                            isEditing={true}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Status Bar */}
            <footer className="h-8 border-t bg-background flex items-center justify-between px-4 text-xs text-muted-foreground shrink-0">
                <div className="flex items-center gap-4">
                    <span>Template: <strong className="text-foreground">{template.name}</strong></span>
                    <span>Palette: <strong className="text-foreground">{palette.name}</strong></span>
                    <span>{sections.filter(s => s.enabled).length} sections actives</span>
                </div>
                <div className="flex items-center gap-2">
                    {hasChanges ? (
                        <Badge variant="outline" className="text-orange-500 border-orange-500/50">
                            Modifications non enregistrées
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-green-500 border-green-500/50">
                            <Check className="h-3 w-3 mr-1" />
                            Synchronisé
                        </Badge>
                    )}
                </div>
            </footer>
        </div>
    );
}
