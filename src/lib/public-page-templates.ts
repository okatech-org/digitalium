/**
 * Public Page Templates
 * Predefined templates for the public company page editor
 */

export type TemplateId = 'corporate' | 'modern' | 'minimal' | 'bold' | 'elegant';

export interface TemplateConfig {
    id: TemplateId;
    name: string;
    description: string;
    preview: string; // Preview image path or gradient
    styles: {
        heroHeight: 'sm' | 'md' | 'lg' | 'xl';
        heroStyle: 'gradient' | 'image' | 'solid' | 'pattern';
        headerStyle: 'centered' | 'left' | 'overlay';
        cardStyle: 'flat' | 'elevated' | 'glass' | 'bordered';
        typography: 'classic' | 'modern' | 'elegant' | 'bold';
        spacing: 'compact' | 'normal' | 'relaxed';
        animations: boolean;
        roundness: 'none' | 'sm' | 'md' | 'lg' | 'full';
    };
    defaultSections: string[];
}

export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
    corporate: {
        id: 'corporate',
        name: 'Corporate',
        description: 'Style professionnel et classique, idéal pour les entreprises établies',
        preview: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)',
        styles: {
            heroHeight: 'md',
            heroStyle: 'gradient',
            headerStyle: 'left',
            cardStyle: 'bordered',
            typography: 'classic',
            spacing: 'normal',
            animations: false,
            roundness: 'sm',
        },
        defaultSections: ['hero', 'about', 'stats', 'services', 'contact'],
    },
    modern: {
        id: 'modern',
        name: 'Moderne',
        description: 'Design glassmorphism avec animations subtiles',
        preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        styles: {
            heroHeight: 'lg',
            heroStyle: 'gradient',
            headerStyle: 'centered',
            cardStyle: 'glass',
            typography: 'modern',
            spacing: 'relaxed',
            animations: true,
            roundness: 'lg',
        },
        defaultSections: ['hero', 'stats', 'about', 'services', 'team', 'contact'],
    },
    minimal: {
        id: 'minimal',
        name: 'Minimaliste',
        description: 'Clean et épuré, beaucoup d\'espace blanc',
        preview: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        styles: {
            heroHeight: 'sm',
            heroStyle: 'solid',
            headerStyle: 'left',
            cardStyle: 'flat',
            typography: 'elegant',
            spacing: 'relaxed',
            animations: false,
            roundness: 'none',
        },
        defaultSections: ['hero', 'about', 'contact'],
    },
    bold: {
        id: 'bold',
        name: 'Audacieux',
        description: 'Couleurs vives et formes géométriques impactantes',
        preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        styles: {
            heroHeight: 'xl',
            heroStyle: 'pattern',
            headerStyle: 'overlay',
            cardStyle: 'elevated',
            typography: 'bold',
            spacing: 'normal',
            animations: true,
            roundness: 'md',
        },
        defaultSections: ['hero', 'stats', 'services', 'about', 'documents', 'contact'],
    },
    elegant: {
        id: 'elegant',
        name: 'Élégant',
        description: 'Dégradés doux et effets premium',
        preview: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        styles: {
            heroHeight: 'lg',
            heroStyle: 'gradient',
            headerStyle: 'centered',
            cardStyle: 'glass',
            typography: 'elegant',
            spacing: 'relaxed',
            animations: true,
            roundness: 'full',
        },
        defaultSections: ['hero', 'about', 'stats', 'team', 'services', 'contact'],
    },
};

export const getTemplate = (id: TemplateId): TemplateConfig => {
    return TEMPLATES[id] || TEMPLATES.corporate;
};

export const getAllTemplates = (): TemplateConfig[] => {
    return Object.values(TEMPLATES);
};
