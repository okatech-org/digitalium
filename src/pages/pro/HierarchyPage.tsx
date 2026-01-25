/**
 * HierarchyPage - 3D Document Hierarchy Demonstration
 * Shows the complete archiving hierarchy: Armoire → Trieur → Chemise → Document
 */

import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Building2,
    Archive,
    FolderOpen,
    FileText,
    Eye,
    Layers,
    Info,
    Mouse,
    Move,
    ZoomIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Lazy load the 3D scene to avoid SSR issues
const HierarchyScene3D = React.lazy(() =>
    import('@/components/3d/HierarchyScene3D').then(m => ({ default: m.HierarchyScene3D }))
);

type ViewMode = 'overview' | 'armoire' | 'trieur' | 'chemise';

const levelInfo = {
    overview: {
        title: 'Vue d\'ensemble',
        description: 'Visualisation complète de la hiérarchie documentaire',
        level: 'Tous les niveaux',
        color: 'bg-blue-500',
        icon: Layers,
    },
    armoire: {
        title: 'Niveau 2 : Armoire',
        description: 'Meuble de classement avec tiroirs organisés par catégorie',
        level: 'Conteneur principal',
        color: 'bg-purple-500',
        icon: Building2,
    },
    trieur: {
        title: 'Niveau 3 : Trieur',
        description: 'Compartiments thématiques pour organiser les chemises',
        level: 'Organisation thématique',
        color: 'bg-green-500',
        icon: Archive,
    },
    chemise: {
        title: 'Niveau 4 : Chemise',
        description: 'Dossier contenant les documents individuels',
        level: 'Conteneur de documents',
        color: 'bg-orange-500',
        icon: FolderOpen,
    },
};

export default function HierarchyPage() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>('overview');
    const currentInfo = levelInfo[viewMode];
    const CurrentIcon = currentInfo.icon;

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-900">
            {/* 3D Scene */}
            <Suspense fallback={<Loading3D />}>
                <HierarchyScene3D mode={viewMode} onModeChange={setViewMode} />
            </Suspense>

            {/* Header */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <Button
                    variant="outline"
                    onClick={() => navigate('/pro')}
                    className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                </Button>

                <Badge className="bg-blue-500/20 text-blue-400 backdrop-blur-md">
                    <Eye className="h-3 w-3 mr-1" />
                    Démo 3D Interactive
                </Badge>
            </div>

            {/* Info Panel */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-20 left-4 z-10"
            >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white max-w-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', currentInfo.color)}>
                                <CurrentIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold">{currentInfo.title}</h2>
                                <p className="text-xs text-gray-300">{currentInfo.level}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-200">{currentInfo.description}</p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Hierarchy Tree */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-20 right-4 z-10"
            >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white max-w-xs">
                    <CardContent className="p-4">
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            Hiérarchie
                        </h3>
                        <div className="space-y-1">
                            <HierarchyItem icon="🏢" label="Niveau 1 : Salle" indent={0} active={false} />
                            <HierarchyItem icon="🗄️" label="Niveau 2 : Armoire" indent={1} active={viewMode === 'armoire'} />
                            <HierarchyItem icon="📊" label="Niveau 3 : Trieur" indent={2} active={viewMode === 'trieur'} />
                            <HierarchyItem icon="📁" label="Niveau 4 : Chemise" indent={3} active={viewMode === 'chemise'} />
                            <HierarchyItem icon="📄" label="Niveau 5 : Document" indent={4} active={false} />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Navigation Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
            >
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-4">
                        <p className="text-white text-sm mb-3 text-center font-medium">Navigation par niveau</p>
                        <div className="flex gap-2">
                            {Object.entries(levelInfo).map(([key, info]) => {
                                const Icon = info.icon;
                                return (
                                    <Button
                                        key={key}
                                        variant={viewMode === key ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode(key as ViewMode)}
                                        className={cn(
                                            viewMode === key
                                                ? info.color + ' text-white border-transparent'
                                                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                                        )}
                                    >
                                        <Icon className="h-4 w-4 mr-1" />
                                        {info.title.split(':')[0]}
                                    </Button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Controls Help */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 right-4 z-10"
            >
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                    <CardContent className="p-3">
                        <h4 className="text-xs font-bold mb-2 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Contrôles
                        </h4>
                        <div className="text-xs space-y-1 text-gray-300">
                            <p className="flex items-center gap-2">
                                <Mouse className="h-3 w-3" /> Clic + glisser : Rotation
                            </p>
                            <p className="flex items-center gap-2">
                                <ZoomIn className="h-3 w-3" /> Molette : Zoom
                            </p>
                            <p className="flex items-center gap-2">
                                <Move className="h-3 w-3" /> Clic droit : Pan
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

function HierarchyItem({
    icon,
    label,
    indent,
    active
}: {
    icon: string;
    label: string;
    indent: number;
    active: boolean;
}) {
    return (
        <div
            className={cn(
                'flex items-center gap-2 py-1 px-2 rounded text-sm transition-colors',
                active && 'bg-white/20'
            )}
            style={{ marginLeft: indent * 12 }}
        >
            <span>{icon}</span>
            <span className={active ? 'text-white font-medium' : 'text-gray-300'}>{label}</span>
        </div>
    );
}

function Loading3D() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">Chargement de la scène 3D...</p>
                <p className="text-gray-400 text-sm mt-2">Préparation de l'environnement</p>
            </div>
        </div>
    );
}
