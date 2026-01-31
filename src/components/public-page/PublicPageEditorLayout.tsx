/**
 * PublicPageEditorLayout V2 - Main layout for the multi-page editor
 * Provides navigation between different section pages
 */

import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    Palette,
    Image as ImageIcon,
    Type,
    Users,
    Briefcase,
    Mail,
    FileText,
    Images,
    Save,
    Eye,
    Globe,
    ChevronLeft,
    Check,
    Loader2,
    ExternalLink,
    Settings,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { usePublicPageEditorStore } from '@/stores/publicPageEditorStore';
import { useOrganizationContext } from '@/hooks/useOrganizationContext';

// Navigation items types
interface NavLink {
    type: 'link';
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
}

interface NavSeparator {
    type: 'separator';
}

type NavItem = NavLink | NavSeparator;

// Configuration section items
const CONFIG_NAV_ITEMS: NavLink[] = [
    { type: 'link', id: 'overview', label: 'Vue d\'ensemble', icon: <LayoutGrid className="h-4 w-4" />, path: '' },
    { type: 'link', id: 'theme', label: 'Thème & Couleurs', icon: <Palette className="h-4 w-4" />, path: 'theme' },
    { type: 'link', id: 'pages', label: 'Pages du site', icon: <FileText className="h-4 w-4" />, path: 'pages' },
    { type: 'link', id: 'media', label: 'Médiathèque', icon: <Images className="h-4 w-4" />, path: 'media' },
];

// Section items
const SECTION_NAV_ITEMS: NavLink[] = [
    { type: 'link', id: 'hero', label: 'En-tête (Hero)', icon: <ImageIcon className="h-4 w-4" />, path: 'hero' },
    { type: 'link', id: 'about', label: 'À propos', icon: <Type className="h-4 w-4" />, path: 'about' },
    { type: 'link', id: 'services', label: 'Services', icon: <Briefcase className="h-4 w-4" />, path: 'services' },
    { type: 'link', id: 'team', label: 'Équipe', icon: <Users className="h-4 w-4" />, path: 'team' },
    { type: 'link', id: 'gallery', label: 'Galerie', icon: <Images className="h-4 w-4" />, path: 'gallery' },
    { type: 'link', id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" />, path: 'documents' },
    { type: 'link', id: 'contact', label: 'Contact', icon: <Mail className="h-4 w-4" />, path: 'contact' },
];

export default function PublicPageEditorLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const orgContext = useOrganizationContext();
    const {
        config,
        isDirty,
        activeSection,
        setActiveSection,
        initializeFromTemplate,
        save
    } = usePublicPageEditorStore();

    const [isSaving, setIsSaving] = React.useState(false);

    // Initialize store if needed
    useEffect(() => {
        if (!config) {
            const defaultTemplate = orgContext.isInstitutional ? 'ministere' : 'corporate-pro';
            const defaultOrgType = orgContext.isInstitutional ? 'administration' : 'entreprise';
            initializeFromTemplate(defaultTemplate, orgContext.name, orgContext.type, defaultOrgType);
        }
    }, [config, orgContext, initializeFromTemplate]);

    // Sync active section with route
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];

        if (lastPart === 'public-editor' || lastPart === '') {
            setActiveSection('overview');
        } else {
            // Find in both config and section items
            const allItems = [...CONFIG_NAV_ITEMS, ...SECTION_NAV_ITEMS];
            const section = allItems.find(item => item.path === lastPart);
            if (section) {
                setActiveSection(section.id as typeof activeSection);
            }
        }
    }, [location.pathname, setActiveSection]);

    const handleSave = async () => {
        setIsSaving(true);
        await save();
        setIsSaving(false);
    };

    // Check if a section is enabled for the current page
    const isSectionEnabled = (sectionId: string): boolean => {
        if (!config || !config.pages || config.pages.length === 0) return false;
        // Check if section exists in any page
        return config.pages.some(page => page.sections.includes(sectionId as never));
    };

    const publicUrl = config ? `https://digitalium.ga/p/${config.slug}` : '#';

    return (
        <div className="h-screen flex flex-col bg-muted/30">
            {/* Top Header */}
            <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/pro')}
                        className="gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Retour
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="font-medium">Éditeur de Page Publique</span>
                        {config?.isPublished && (
                            <Badge variant="default" className="text-xs gap-1">
                                <Check className="h-3 w-3" />
                                Publiée
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Public URL */}
                    {config && (
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2 text-muted-foreground"
                        >
                            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                                {config.slug}
                            </a>
                        </Button>
                    )}

                    {/* Preview Button */}
                    <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Aperçu
                    </Button>

                    {/* Save Button */}
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={!isDirty || isSaving}
                        className="gap-2"
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isDirty ? 'Sauvegarder' : 'Sauvegardé'}
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Navigation */}
                <nav className="w-64 border-r bg-background shrink-0">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-1">
                            <p className="text-xs font-medium text-muted-foreground mb-3 px-2">
                                CONFIGURATION
                            </p>

                            {CONFIG_NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.id}
                                    to={item.path ? `/pro/public-editor/${item.path}` : '/pro/public-editor'}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm',
                                        activeSection === item.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {item.icon}
                                    <span className="flex-1">{item.label}</span>
                                </Link>
                            ))}

                            <Separator className="my-4" />

                            <p className="text-xs font-medium text-muted-foreground mb-3 px-2">
                                SECTIONS
                            </p>

                            {SECTION_NAV_ITEMS.map((item) => {
                                const isEnabled = isSectionEnabled(item.id);
                                return (
                                    <Link
                                        key={item.id}
                                        to={`/pro/public-editor/${item.path}`}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm group',
                                            activeSection === item.id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                                            !isEnabled && activeSection !== item.id && 'opacity-50'
                                        )}
                                    >
                                        {item.icon}
                                        <span className="flex-1">{item.label}</span>
                                        {!isEnabled && (
                                            <Badge variant="outline" className="text-xs opacity-50">
                                                Inactif
                                            </Badge>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </nav>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
