/**
 * DesignThemeContext - Manages UI design themes (Modern, Classic, Vintage 3D)
 * Separate from ThemeContext which handles dark/light mode
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type DesignTheme = "modern" | "classic" | "vintage3d";

export interface DesignThemeConfig {
    id: DesignTheme;
    name: string;
    description: string;
    preview: {
        cardStyle: string;
        accentGradient: string;
    };
}

export const DESIGN_THEMES: DesignThemeConfig[] = [
    {
        id: "modern",
        name: "Modern",
        description: "Design épuré et professionnel avec des lignes simples",
        preview: {
            cardStyle: "bg-card border border-border shadow-sm",
            accentGradient: "from-primary to-primary/80",
        },
    },
    {
        id: "classic",
        name: "Classic",
        description: "Dashboard premium avec glassmorphisme et cartes haute-contraste",
        preview: {
            cardStyle: "bg-white/95 backdrop-blur-xl border-slate-200/80 shadow-md",
            accentGradient: "from-blue-500 to-indigo-600",
        },
    },
    {
        id: "vintage3d",
        name: "Vintage 3D",
        description: "Effets 3D avec grilles KPI et dégradés riches",
        preview: {
            cardStyle: "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 shadow-xl",
            accentGradient: "from-emerald-500 to-teal-600",
        },
    },
];

interface DesignThemeContextType {
    designTheme: DesignTheme;
    setDesignTheme: (theme: DesignTheme) => void;
    themeConfig: DesignThemeConfig;
}

const DesignThemeContext = createContext<DesignThemeContextType | undefined>(undefined);

const STORAGE_KEY = "design-theme";

export const DesignThemeProvider = ({ children }: { children: ReactNode }) => {
    const [designTheme, setDesignThemeState] = useState<DesignTheme>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && ["modern", "classic", "vintage3d"].includes(saved)) {
            return saved as DesignTheme;
        }
        return "modern";
    });

    const themeConfig = DESIGN_THEMES.find((t) => t.id === designTheme) || DESIGN_THEMES[0];

    useEffect(() => {
        // Apply data attribute to root for CSS targeting
        const root = document.documentElement;
        root.setAttribute("data-design-theme", designTheme);
        localStorage.setItem(STORAGE_KEY, designTheme);
    }, [designTheme]);

    const setDesignTheme = (theme: DesignTheme) => {
        setDesignThemeState(theme);
    };

    return (
        <DesignThemeContext.Provider value={{ designTheme, setDesignTheme, themeConfig }}>
            {children}
        </DesignThemeContext.Provider>
    );
};

export const useDesignTheme = () => {
    const context = useContext(DesignThemeContext);
    if (!context) {
        throw new Error("useDesignTheme must be used within a DesignThemeProvider");
    }
    return context;
};
