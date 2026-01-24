/**
 * IArchive3DView - 3D immersive view for document archives
 * Integrated component with toggle switch in existing pages
 */

import React, { useState, useMemo, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Layers3,
    Table2,
    Eye,
    Download,
    Shield,
    Award,
    Loader2,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Canvas3DWrapper } from '@/components/3d/core/Canvas3DWrapper';
import { Archive3DScene } from './components/Archive3DScene';
import { TransitionTo3D } from '@/components/3d/transitions/TransitionTo3D';
import type { Document3D } from '@/types/document3d';

interface IArchive3DViewProps {
    documents: Document3D[];
    category: string;
    onViewDocument?: (doc: Document3D) => void;
    onDownloadDocument?: (doc: Document3D) => void;
    className?: string;
}

export function IArchive3DView({
    documents,
    category,
    onViewDocument,
    onDownloadDocument,
    className,
}: IArchive3DViewProps) {
    const [is3DMode, setIs3DMode] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document3D | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleToggle3D = () => {
        if (!is3DMode) {
            setIsTransitioning(true);
        } else {
            setIs3DMode(false);
        }
    };

    const handleTransitionComplete = () => {
        setIsTransitioning(false);
        setIs3DMode(true);
    };

    const handleDocumentClick = (doc: Document3D) => {
        setSelectedDocument(doc);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    return (
        <div className={cn('relative', className)}>
            {/* View Toggle Button */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={is3DMode ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={handleToggle3D}
                                    className={cn(
                                        'gap-2',
                                        is3DMode && 'bg-emerald-600 hover:bg-emerald-700'
                                    )}
                                >
                                    {is3DMode ? (
                                        <>
                                            <Table2 className="h-4 w-4" />
                                            Vue Tableau
                                        </>
                                    ) : (
                                        <>
                                            <Layers3 className="h-4 w-4" />
                                            Vue 3D
                                        </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {is3DMode ? 'Revenir à la vue classique' : 'Visualiser en 3D immersif'}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {is3DMode && (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
                            <Box className="h-3 w-3 mr-1" />
                            Mode 3D actif
                        </Badge>
                    )}
                </div>

                {/* 3D Controls */}
                {is3DMode && (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Transition Animation */}
            <TransitionTo3D
                isActive={isTransitioning}
                onComplete={handleTransitionComplete}
                duration={1.5}
            >
                <div />
            </TransitionTo3D>

            {/* 3D View */}
            <AnimatePresence mode="wait">
                {is3DMode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="relative rounded-lg overflow-hidden border bg-card"
                        style={{ height: isFullscreen ? '100vh' : '600px' }}
                    >
                        <Canvas3DWrapper
                            className="w-full h-full"
                            fallback={
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-muted-foreground">
                                        WebGL non disponible - retour à la vue tableau
                                    </p>
                                </div>
                            }
                        >
                            <Archive3DScene
                                documents={documents}
                                category={category}
                                onDocumentClick={handleDocumentClick}
                                onViewDocument={onViewDocument}
                                onDownloadDocument={onDownloadDocument}
                            />
                        </Canvas3DWrapper>

                        {/* Selected Document Info Panel */}
                        <AnimatePresence>
                            {selectedDocument && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="absolute top-4 right-4 w-72 bg-card/95 backdrop-blur-lg border rounded-lg p-4 shadow-lg"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-medium truncate max-w-[200px]">
                                                {selectedDocument.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedDocument.type.toUpperCase()}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                selectedDocument.status === 'archived' && 'bg-green-500/10 text-green-500',
                                                selectedDocument.status === 'classified' && 'bg-amber-500/10 text-amber-500',
                                                selectedDocument.status === 'pending' && 'bg-red-500/10 text-red-500'
                                            )}
                                        >
                                            {selectedDocument.status}
                                        </Badge>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => onViewDocument?.(selectedDocument)}
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Voir
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => onDownloadDocument?.(selectedDocument)}
                                        >
                                            <Download className="h-3 w-3 mr-1" />
                                            Télécharger
                                        </Button>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="w-full mt-2 text-xs"
                                        onClick={() => setSelectedDocument(null)}
                                    >
                                        Fermer
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Help overlay */}
                        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded">
                            <kbd className="px-1 bg-muted rounded">Clic</kbd> Ouvrir •
                            <kbd className="px-1 bg-muted rounded ml-2">Molette</kbd> Zoomer •
                            <kbd className="px-1 bg-muted rounded ml-2">Glisser</kbd> Tourner
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default IArchive3DView;
