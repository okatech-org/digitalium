/**
 * Public Page Color Palettes
 * Predefined color palettes for the public company page editor
 */

export type PaletteId = 'ocean' | 'forest' | 'sunset' | 'royal' | 'mono' | 'emerald' | 'custom';

export interface ColorPalette {
    id: PaletteId;
    name: string;
    description: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        foreground: string;
        muted: string;
    };
    gradients: {
        hero: string;
        card: string;
        button: string;
    };
    isCustom?: boolean;
}

export const PALETTES: Record<PaletteId, ColorPalette> = {
    ocean: {
        id: 'ocean',
        name: 'Océan',
        description: 'Bleus et cyans apaisants',
        colors: {
            primary: '#0ea5e9',
            secondary: '#06b6d4',
            accent: '#14b8a6',
            background: '#0f172a',
            foreground: '#f8fafc',
            muted: '#334155',
        },
        gradients: {
            hero: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)',
            card: 'linear-gradient(180deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
            button: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
        },
    },
    forest: {
        id: 'forest',
        name: 'Forêt',
        description: 'Verts naturels et frais',
        colors: {
            primary: '#22c55e',
            secondary: '#10b981',
            accent: '#059669',
            background: '#0f1f17',
            foreground: '#f0fdf4',
            muted: '#1a3a2a',
        },
        gradients: {
            hero: 'linear-gradient(135deg, #22c55e 0%, #10b981 50%, #059669 100%)',
            card: 'linear-gradient(180deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
            button: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
        },
    },
    sunset: {
        id: 'sunset',
        name: 'Coucher de soleil',
        description: 'Oranges et roses chaleureux',
        colors: {
            primary: '#f97316',
            secondary: '#ef4444',
            accent: '#ec4899',
            background: '#1f1510',
            foreground: '#fff7ed',
            muted: '#3f2a1a',
        },
        gradients: {
            hero: 'linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)',
            card: 'linear-gradient(180deg, rgba(249, 115, 22, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
            button: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
        },
    },
    royal: {
        id: 'royal',
        name: 'Royal',
        description: 'Violets et bleus majestueux',
        colors: {
            primary: '#8b5cf6',
            secondary: '#6366f1',
            accent: '#3b82f6',
            background: '#1a1625',
            foreground: '#f5f3ff',
            muted: '#2d2640',
        },
        gradients: {
            hero: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
            card: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
            button: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        },
    },
    mono: {
        id: 'mono',
        name: 'Monochrome',
        description: 'Élégance en noir et blanc',
        colors: {
            primary: '#374151',
            secondary: '#6b7280',
            accent: '#111827',
            background: '#ffffff',
            foreground: '#111827',
            muted: '#f3f4f6',
        },
        gradients: {
            hero: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
            card: 'linear-gradient(180deg, rgba(55, 65, 81, 0.05) 0%, rgba(107, 114, 128, 0.02) 100%)',
            button: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
        },
    },
    emerald: {
        id: 'emerald',
        name: 'Émeraude',
        description: 'Vert émeraude luxueux',
        colors: {
            primary: '#10b981',
            secondary: '#059669',
            accent: '#047857',
            background: '#0d1f17',
            foreground: '#ecfdf5',
            muted: '#1a3a2a',
        },
        gradients: {
            hero: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
            card: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            button: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        },
    },
    custom: {
        id: 'custom',
        name: 'Personnalisée',
        description: 'Définissez vos propres couleurs',
        colors: {
            primary: '#3b82f6',
            secondary: '#6366f1',
            accent: '#8b5cf6',
            background: '#0f172a',
            foreground: '#f8fafc',
            muted: '#334155',
        },
        gradients: {
            hero: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            card: 'linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
            button: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
        },
        isCustom: true,
    },
};

export const getPalette = (id: PaletteId): ColorPalette => {
    return PALETTES[id] || PALETTES.ocean;
};

export const getAllPalettes = (): ColorPalette[] => {
    return Object.values(PALETTES);
};

/**
 * Generate CSS variables from a palette
 */
export const paletteToCSS = (palette: ColorPalette): Record<string, string> => {
    return {
        '--public-primary': palette.colors.primary,
        '--public-secondary': palette.colors.secondary,
        '--public-accent': palette.colors.accent,
        '--public-background': palette.colors.background,
        '--public-foreground': palette.colors.foreground,
        '--public-muted': palette.colors.muted,
        '--public-hero-gradient': palette.gradients.hero,
        '--public-card-gradient': palette.gradients.card,
        '--public-button-gradient': palette.gradients.button,
    };
};
