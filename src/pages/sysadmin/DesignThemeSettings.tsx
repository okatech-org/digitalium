/**
 * DesignThemeSettings - Settings page for selecting UI design theme (SysAdmin Space)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Check, Sparkles, Box, Layers, Server } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDesignTheme, DESIGN_THEMES, DesignTheme } from '@/contexts/DesignThemeContext';
import { useToast } from '@/hooks/use-toast';

const themeIcons: Record<DesignTheme, React.ReactNode> = {
    modern: <Layers className="w-6 h-6" />,
    classic: <Sparkles className="w-6 h-6" />,
    vintage3d: <Box className="w-6 h-6" />,
};

const themeGradients: Record<DesignTheme, string> = {
    modern: 'from-slate-600 to-slate-800',
    classic: 'from-blue-500 to-indigo-600',
    vintage3d: 'from-orange-500 to-rose-600',
};

export default function DesignThemeSettings() {
    const { designTheme, setDesignTheme } = useDesignTheme();
    const { toast } = useToast();

    const handleThemeChange = (theme: DesignTheme) => {
        setDesignTheme(theme);
        toast({
            title: 'Thème système appliqué',
            description: `Le thème "${DESIGN_THEMES.find(t => t.id === theme)?.name}" est maintenant actif.`,
        });
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800">
                        <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Configuration du Thème</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Server className="w-3.5 h-3.5" />
                            Console Système
                        </p>
                    </div>
                </div>
                <p className="text-muted-foreground mt-2">
                    Définissez l'apparence visuelle de l'interface d'administration
                </p>
            </div>

            {/* Theme Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {DESIGN_THEMES.map((theme) => {
                    const isSelected = designTheme === theme.id;

                    return (
                        <motion.div
                            key={theme.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card
                                className={`cursor-pointer transition-all duration-300 ${isSelected
                                        ? 'ring-2 ring-primary shadow-lg'
                                        : 'hover:shadow-md'
                                    }`}
                                onClick={() => handleThemeChange(theme.id)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${themeGradients[theme.id]}`}>
                                            <span className="text-white">{themeIcons[theme.id]}</span>
                                        </div>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="p-1.5 rounded-full bg-primary"
                                            >
                                                <Check className="w-4 h-4 text-primary-foreground" />
                                            </motion.div>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg mt-3">{theme.name}</CardTitle>
                                    <CardDescription className="text-sm">
                                        {theme.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Theme Preview - Admin Style */}
                                    <div className="rounded-lg border overflow-hidden bg-muted/20">
                                        <div className={`h-1.5 bg-gradient-to-r ${themeGradients[theme.id]}`} />
                                        <div className="p-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="rounded-md p-2 bg-card border">
                                                    <div className="h-1.5 bg-foreground/15 rounded w-2/3 mb-1.5" />
                                                    <div className="h-3 bg-foreground/10 rounded" />
                                                </div>
                                                <div className="rounded-md p-2 bg-card border">
                                                    <div className="h-1.5 bg-foreground/15 rounded w-1/2 mb-1.5" />
                                                    <div className="h-3 bg-foreground/10 rounded" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* System Info */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        Configuration Système
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${themeGradients[designTheme]}`}>
                                <span className="text-white">{themeIcons[designTheme]}</span>
                            </div>
                            <div>
                                <p className="font-medium">
                                    Thème actif: {DESIGN_THEMES.find(t => t.id === designTheme)?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Appliqué à tous les espaces d'administration
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleThemeChange('modern')}>
                                Par défaut
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
