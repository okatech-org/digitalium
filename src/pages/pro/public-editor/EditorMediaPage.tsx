/**
 * EditorMediaPage - Media library management page
 */

import React from 'react';
import { Images, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePublicPageEditorStore } from '@/stores/publicPageEditorStore';
import MediaLibrary from '@/components/public-page/MediaLibrary';

export default function EditorMediaPage() {
    const { config } = usePublicPageEditorStore();

    if (!config) {
        return (
            <div className="p-6">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Configuration requise</AlertTitle>
                    <AlertDescription>
                        Veuillez d'abord sélectionner un template dans la vue d'ensemble.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const totalMedia = config.mediaLibrary?.length || 0;
    const totalSize = config.mediaLibrary?.reduce((acc, m) => acc + m.size, 0) || 0;
    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Images className="h-6 w-6 text-primary" />
                    Médiathèque
                </h1>
                <p className="text-muted-foreground">
                    Gérez vos images, vidéos et documents pour les réutiliser dans vos pages
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total médias</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalMedia}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Espace utilisé</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatSize(totalSize)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Types</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {config.mediaLibrary?.filter(m => m.type === 'image').length || 0} images
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Media Library */}
            <Card>
                <CardHeader>
                    <CardTitle>Tous les médias</CardTitle>
                    <CardDescription>
                        Uploadez et organisez vos fichiers. Ils seront disponibles dans toutes les sections.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MediaLibrary filterType="all" />
                </CardContent>
            </Card>
        </div>
    );
}
