/**
 * Canvas3DWrapper - Safe wrapper for React Three Fiber Canvas
 * Handles WebGL detection, error boundaries, and suspense
 */

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader2 } from 'lucide-react';
import type { Canvas3DWrapperProps } from '@/types/document3d';

// Check if WebGL is available
const isWebGLAvailable = (): boolean => {
    try {
        const canvas = document.createElement('canvas');
        return !!(
            window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
    } catch (e) {
        return false;
    }
};

// Error boundary for 3D canvas
class Canvas3DErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ReactNode; onError?: (error: Error) => void },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode; fallback?: React.ReactNode; onError?: (error: Error) => void }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Canvas3D Error:', error, errorInfo);
        this.props.onError?.(error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg">
                    <div className="text-center p-6">
                        <p className="text-lg font-medium text-destructive mb-2">Erreur 3D</p>
                        <p className="text-sm text-muted-foreground">
                            Impossible de charger l'environnement 3D
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Loading fallback component
const LoadingFallback = () => (
    <div className="flex items-center justify-center h-full">
        <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Chargement de l'environnement 3D...</p>
        </div>
    </div>
);

// No WebGL fallback
const NoWebGLFallback = () => (
    <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg">
        <div className="text-center p-6">
            <p className="text-lg font-medium mb-2">WebGL non disponible</p>
            <p className="text-sm text-muted-foreground">
                Votre navigateur ne supporte pas WebGL. Utilisez la vue tableau classique.
            </p>
        </div>
    </div>
);

export function Canvas3DWrapper({
    children,
    className = '',
    fallback,
    onError,
}: Canvas3DWrapperProps) {
    const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);

    useEffect(() => {
        setWebGLSupported(isWebGLAvailable());
    }, []);

    // Still checking
    if (webGLSupported === null) {
        return <LoadingFallback />;
    }

    // No WebGL support
    if (!webGLSupported) {
        return fallback ? <>{fallback}</> : <NoWebGLFallback />;
    }

    return (
        <Canvas3DErrorBoundary fallback={fallback} onError={onError}>
            <Suspense fallback={<LoadingFallback />}>
                <Canvas
                    className={className}
                    shadows
                    dpr={[1, 2]}
                    gl={{
                        antialias: true,
                        alpha: true,
                        preserveDrawingBuffer: true,
                    }}
                    camera={{
                        position: [0, 5, 10],
                        fov: 50,
                        near: 0.1,
                        far: 1000,
                    }}
                >
                    {children}
                </Canvas>
            </Suspense>
        </Canvas3DErrorBoundary>
    );
}

export default Canvas3DWrapper;
