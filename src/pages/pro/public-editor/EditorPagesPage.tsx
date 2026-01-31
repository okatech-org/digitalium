/**
 * EditorPagesPage - Page management for the public site
 */

import React from 'react';
import { FileText, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePublicPageEditorStore } from '@/stores/publicPageEditorStore';
import PageManager from '@/components/public-page/PageManager';
import { useNavigate } from 'react-router-dom';

export default function EditorPagesPage() {
    const { config, setActiveSection, setActivePageId } = usePublicPageEditorStore();
    const navigate = useNavigate();

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

    const handleEditPage = (pageId: string) => {
        setActivePageId(pageId);
        // Navigate to hero section to start editing
        setActiveSection('hero');
        navigate('/pro/public-editor/hero');
    };

    const publicBaseUrl = `https://digitalium.ga/p/${config.slug}`;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Gestion des Pages
                </h1>
                <p className="text-muted-foreground">
                    Organisez la structure de votre site public avec des pages dédiées
                </p>
            </div>

            {/* Info Alert */}
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>URLs de vos pages</AlertTitle>
                <AlertDescription className="space-y-1">
                    <p>Chaque page a sa propre URL accessible publiquement :</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                        {publicBaseUrl}/[slug-de-la-page]
                    </code>
                </AlertDescription>
            </Alert>

            {/* Page Manager */}
            <Card>
                <CardContent className="pt-6">
                    <PageManager onEditPage={handleEditPage} />
                </CardContent>
            </Card>
        </div>
    );
}
