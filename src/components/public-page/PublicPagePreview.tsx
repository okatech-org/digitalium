/**
 * PublicPagePreview - Live preview component for the public page editor
 * Renders the public page in real-time with editable areas
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Globe,
    Building2,
    MapPin,
    Phone,
    Mail,
    ExternalLink,
    Users,
    FileText,
    Calendar,
    Award,
    Linkedin,
    Facebook,
    Twitter,
    Instagram,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type TemplateConfig } from '@/lib/public-page-templates';
import { type ColorPalette, paletteToCSS } from '@/lib/public-page-palettes';

export interface PublicPageContent {
    companyName: string;
    tagline: string;
    description: string;
    longDescription: string;
    industry: string;
    size: string;
    founded: string;
    website: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        country: string;
    };
    social: {
        linkedin?: string;
        facebook?: string;
        twitter?: string;
        instagram?: string;
    };
    logo?: string;
    coverImage?: string;
    stats: {
        label: string;
        value: string;
    }[];
    certifications: string[];
}

export interface SectionConfig {
    id: string;
    type: 'hero' | 'about' | 'stats' | 'services' | 'team' | 'documents' | 'contact' | 'social';
    enabled: boolean;
    order: number;
}

interface PublicPagePreviewProps {
    template: TemplateConfig;
    palette: ColorPalette;
    content: PublicPageContent;
    sections: SectionConfig[];
    viewMode: 'desktop' | 'tablet' | 'mobile';
    onEditField?: (field: string, value: string) => void;
    isEditing?: boolean;
}

export default function PublicPagePreview({
    template,
    palette,
    content,
    sections,
    viewMode,
    onEditField,
    isEditing = true,
}: PublicPagePreviewProps) {
    const cssVariables = paletteToCSS(palette);

    const getViewportWidth = () => {
        switch (viewMode) {
            case 'mobile': return 'max-w-[375px]';
            case 'tablet': return 'max-w-[768px]';
            default: return 'w-full';
        }
    };

    const getHeroHeight = () => {
        switch (template.styles.heroHeight) {
            case 'sm': return 'h-32';
            case 'md': return 'h-48';
            case 'lg': return 'h-64';
            case 'xl': return 'h-80';
            default: return 'h-48';
        }
    };

    const getCardClasses = () => {
        const base = 'transition-all duration-200';
        switch (template.styles.cardStyle) {
            case 'flat': return `${base} border-0`;
            case 'elevated': return `${base} shadow-lg border-0`;
            case 'glass': return `${base} backdrop-blur-lg bg-white/10 border border-white/20`;
            case 'bordered': return `${base} border border-current/10`;
            default: return base;
        }
    };

    const getRoundness = () => {
        switch (template.styles.roundness) {
            case 'none': return 'rounded-none';
            case 'sm': return 'rounded-sm';
            case 'md': return 'rounded-md';
            case 'lg': return 'rounded-lg';
            case 'full': return 'rounded-2xl';
            default: return 'rounded-md';
        }
    };

    const enabledSections = sections
        .filter(s => s.enabled)
        .sort((a, b) => a.order - b.order);

    const EditableText = ({
        field,
        value,
        className,
        as: Component = 'span'
    }: {
        field: string;
        value: string;
        className?: string;
        as?: any;
    }) => {
        if (!isEditing) {
            return <Component className={className}>{value}</Component>;
        }

        return (
            <Component
                className={cn(
                    className,
                    'cursor-text hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 focus:ring-2 focus:ring-primary focus:outline-none px-1 -mx-1 rounded transition-all'
                )}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e: React.FocusEvent<HTMLElement>) => {
                    onEditField?.(field, e.currentTarget.textContent || '');
                }}
            >
                {value}
            </Component>
        );
    };

    const renderHero = () => (
        <div className="relative">
            {/* Cover Image / Gradient */}
            <div
                className={cn(getHeroHeight(), 'w-full')}
                style={{ background: palette.gradients.hero }}
            >
                {content.coverImage && (
                    <img
                        src={content.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Company Avatar */}
            <div className="px-6 relative">
                <div className={cn(
                    'absolute -mt-16',
                    template.styles.headerStyle === 'centered' ? 'left-1/2 -translate-x-1/2' : 'left-6'
                )}>
                    <Avatar className={cn(
                        'h-24 w-24 border-4',
                        getRoundness() === 'rounded-2xl' ? 'rounded-2xl' : 'rounded-full'
                    )} style={{ borderColor: palette.colors.background }}>
                        <AvatarImage src={content.logo} />
                        <AvatarFallback
                            className="text-2xl font-bold"
                            style={{ background: palette.gradients.button, color: palette.colors.foreground }}
                        >
                            {content.companyName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>

            {/* Header Content */}
            <div className={cn(
                'pt-14 px-6 pb-6',
                template.styles.headerStyle === 'centered' && 'text-center'
            )}>
                <div className="flex items-center gap-2 flex-wrap">
                    <EditableText
                        field="companyName"
                        value={content.companyName}
                        as="h1"
                        className="text-2xl font-bold"
                    />
                    <Badge
                        className="text-xs"
                        style={{ background: `${palette.colors.primary}20`, color: palette.colors.primary }}
                    >
                        Vérifié
                    </Badge>
                </div>
                <EditableText
                    field="tagline"
                    value={content.tagline || content.industry}
                    as="p"
                    className="text-sm opacity-70 mt-1"
                />
            </div>
        </div>
    );

    const renderStats = () => (
        <div className="px-6 py-4">
            <div className={cn('grid grid-cols-3 gap-4', viewMode === 'mobile' && 'grid-cols-1')}>
                {content.stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={template.styles.animations ? { opacity: 0, y: 20 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(
                            'text-center p-4',
                            getCardClasses(),
                            getRoundness()
                        )}
                        style={{ background: palette.gradients.card }}
                    >
                        <EditableText
                            field={`stats.${i}.value`}
                            value={stat.value}
                            as="p"
                            className="text-2xl font-bold"
                        />
                        <EditableText
                            field={`stats.${i}.label`}
                            value={stat.label}
                            as="p"
                            className="text-xs opacity-70"
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderAbout = () => (
        <div className={cn('mx-6 my-4 p-6', getCardClasses(), getRoundness())} style={{ background: palette.gradients.card }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4" style={{ color: palette.colors.primary }} />
                À propos
            </h3>
            <EditableText
                field="description"
                value={content.description}
                as="p"
                className="text-sm opacity-80 leading-relaxed"
            />

            {content.certifications.length > 0 && (
                <div className="mt-6 pt-4 border-t border-current/10">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4" style={{ color: palette.colors.primary }} />
                        Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {content.certifications.map((cert, i) => (
                            <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                                style={{ borderColor: `${palette.colors.primary}50` }}
                            >
                                {cert}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderContact = () => (
        <div className={cn('mx-6 my-4 p-6', getCardClasses(), getRoundness())} style={{ background: palette.gradients.card }}>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-sm">
                {content.website && (
                    <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4" style={{ color: palette.colors.primary }} />
                        <span className="opacity-80">{content.website.replace('https://', '')}</span>
                    </div>
                )}
                {content.email && (
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4" style={{ color: palette.colors.primary }} />
                        <EditableText field="email" value={content.email} className="opacity-80" />
                    </div>
                )}
                {content.phone && (
                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4" style={{ color: palette.colors.primary }} />
                        <EditableText field="phone" value={content.phone} className="opacity-80" />
                    </div>
                )}
                <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5" style={{ color: palette.colors.primary }} />
                    <span className="opacity-80">
                        {content.address.street}<br />
                        {content.address.city}, {content.address.country}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderSocial = () => {
        const hasSocial = content.social.linkedin || content.social.facebook || content.social.twitter || content.social.instagram;
        if (!hasSocial) return null;

        return (
            <div className={cn('mx-6 my-4 p-6', getCardClasses(), getRoundness())} style={{ background: palette.gradients.card }}>
                <h3 className="font-semibold mb-4">Réseaux sociaux</h3>
                <div className="flex gap-2">
                    {content.social.linkedin && (
                        <Button variant="outline" size="icon" className={getRoundness()}>
                            <Linkedin className="h-4 w-4" />
                        </Button>
                    )}
                    {content.social.facebook && (
                        <Button variant="outline" size="icon" className={getRoundness()}>
                            <Facebook className="h-4 w-4" />
                        </Button>
                    )}
                    {content.social.twitter && (
                        <Button variant="outline" size="icon" className={getRoundness()}>
                            <Twitter className="h-4 w-4" />
                        </Button>
                    )}
                    {content.social.instagram && (
                        <Button variant="outline" size="icon" className={getRoundness()}>
                            <Instagram className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const renderSection = (section: SectionConfig) => {
        switch (section.type) {
            case 'hero': return renderHero();
            case 'stats': return renderStats();
            case 'about': return renderAbout();
            case 'contact': return renderContact();
            case 'social': return renderSocial();
            default: return null;
        }
    };

    return (
        <div
            className={cn(
                'mx-auto transition-all duration-300 overflow-hidden',
                getViewportWidth(),
                getRoundness(),
                'border shadow-2xl'
            )}
            style={{
                ...cssVariables as any,
                backgroundColor: palette.colors.background,
                color: palette.colors.foreground,
            }}
        >
            {/* Preview Content */}
            <div className="min-h-[600px]">
                {enabledSections.map((section) => (
                    <div key={section.id}>
                        {renderSection(section)}
                    </div>
                ))}

                {/* Footer */}
                <div className="text-center py-6 opacity-50 text-xs">
                    Propulsé par DIGITALIUM
                </div>
            </div>
        </div>
    );
}
