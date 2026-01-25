/**
 * DesignThemePage - Settings page for selecting UI design theme (Pro Space)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Check, Sparkles, Box, Layers } from 'lucide-react';
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
    modern: 'from-blue-500 to-indigo-600',
    classic: 'from-slate-400 to-slate-600',
    vintage3d: 'from-emerald-500 to-teal-600',
};

export default function DesignThemePage() {
    const { designTheme, setDesignTheme } = useDesignTheme();
    const { toast } = useToast();

    const handleThemeChange = (theme: DesignTheme) => {
        setDesignTheme(theme);
        toast({
            title: 'Thème appliqué',
            description: `Le thème "${DESIGN_THEMES.find(t => t.id === theme)?.name}" a été activé.`,
        });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                        <Palette className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Thème de Design</h1>
                </div>
                <p className="text-muted-foreground">
                    Personnalisez l'apparence de votre espace de travail
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
                                    {/* Theme Preview */}
                                    <div className="rounded-lg border overflow-hidden">
                                        <div className={`h-2 bg-gradient-to-r ${themeGradients[theme.id]}`} />
                                        <div className="p-3 bg-muted/30">
                                            <div className={`rounded-md p-3 ${theme.preview.cardStyle} border`}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.preview.accentGradient}`} />
                                                    <div className="space-y-1 flex-1">
                                                        <div className="h-2 bg-foreground/20 rounded w-3/4" />
                                                        <div className="h-2 bg-foreground/10 rounded w-1/2" />
                                                    </div>
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

            {/* Current Theme Info */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="text-base">Thème actif</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${themeGradients[designTheme]}`}>
                                <span className="text-white">{themeIcons[designTheme]}</span>
                            </div>
                            <div>
                                <p className="font-medium">
                                    {DESIGN_THEMES.find(t => t.id === designTheme)?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {DESIGN_THEMES.find(t => t.id === designTheme)?.description}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleThemeChange('modern')}>
                            Réinitialiser
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
