/**
 * EditorDocumentsPage - Documents section configuration
 */

import React from 'react';
import { FileText, Plus, Trash2, FolderPlus, File, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { usePublicPageEditorStore } from '@/stores/publicPageEditorStore';

export default function EditorDocumentsPage() {
    const { config, updateSection, toggleSection } = usePublicPageEditorStore();

    if (!config) return <div className="p-6">Chargement...</div>;

    const { documents, theme } = config;

    const updateDocuments = (updates: Partial<typeof documents>) => {
        updateSection('documents', updates);
    };

    const addCategory = () => {
        updateDocuments({
            categories: [
                ...documents.categories,
                { id: crypto.randomUUID(), name: 'Nouvelle catégorie', documents: [] },
            ],
        });
    };

    const removeCategory = (id: string) => {
        updateDocuments({
            categories: documents.categories.filter((c) => c.id !== id),
        });
    };

    const updateCategory = (id: string, name: string) => {
        updateDocuments({
            categories: documents.categories.map((c) => (c.id === id ? { ...c, name } : c)),
        });
    };

    const addDocument = (categoryId: string) => {
        updateDocuments({
            categories: documents.categories.map((c) =>
                c.id === categoryId
                    ? {
                        ...c,
                        documents: [
                            ...c.documents,
                            {
                                id: crypto.randomUUID(),
                                title: '',
                                fileUrl: '',
                                fileType: 'pdf',
                                fileSize: '0 KB',
                                uploadedAt: new Date().toISOString(),
                            },
                        ],
                    }
                    : c
            ),
        });
    };

    const removeDocument = (categoryId: string, docId: string) => {
        updateDocuments({
            categories: documents.categories.map((c) =>
                c.id === categoryId
                    ? { ...c, documents: c.documents.filter((d) => d.id !== docId) }
                    : c
            ),
        });
    };

    const updateDocument = (categoryId: string, docId: string, field: string, value: string) => {
        updateDocuments({
            categories: documents.categories.map((c) =>
                c.id === categoryId
                    ? {
                        ...c,
                        documents: c.documents.map((d) =>
                            d.id === docId ? { ...d, [field]: value } : d
                        ),
                    }
                    : c
            ),
        });
    };

    const totalDocs = documents.categories.reduce((sum, c) => sum + c.documents.length, 0);

    return (
        <div className="flex gap-6 h-full">
            <div className="flex-1 overflow-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            Documents
                        </h1>
                        <p className="text-muted-foreground">
                            Partagez vos documents publics
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Label>Activer</Label>
                        <Switch
                            checked={documents.enabled}
                            onCheckedChange={(checked) => toggleSection('documents', checked)}
                        />
                    </div>
                </div>

                {!documents.enabled ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Section désactivée.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Titre</Label>
                                        <Input
                                            value={documents.title}
                                            onChange={(e) => updateDocuments({ title: e.target.value })}
                                            placeholder="Documents"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sous-titre</Label>
                                        <Input
                                            value={documents.subtitle}
                                            onChange={(e) => updateDocuments({ subtitle: e.target.value })}
                                            placeholder="Téléchargez nos ressources"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Disposition</Label>
                                    <div className="flex gap-2">
                                        {(['grid', 'list', 'categories'] as const).map((l) => (
                                            <button
                                                key={l}
                                                onClick={() => updateDocuments({ layout: l })}
                                                className={cn(
                                                    'flex-1 py-2 px-3 rounded-lg border transition-all text-sm capitalize',
                                                    documents.layout === l
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                )}
                                            >
                                                {l === 'categories' ? 'Par catégorie' : l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Catégories & Documents</CardTitle>
                                <CardDescription>
                                    {documents.categories.length} catégorie(s), {totalDocs} document(s)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {documents.categories.map((category) => (
                                    <div key={category.id} className="p-4 rounded-xl border space-y-3">
                                        <div className="flex items-center gap-2">
                                            <FolderPlus className="h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={category.name}
                                                onChange={(e) => updateCategory(category.id, e.target.value)}
                                                className="flex-1 font-medium"
                                                placeholder="Nom de la catégorie"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeCategory(category.id)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="pl-6 space-y-2">
                                            {category.documents.map((doc) => (
                                                <div key={doc.id} className="flex gap-2 items-center p-2 rounded-lg bg-muted/50">
                                                    <File className="h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        value={doc.title}
                                                        onChange={(e) => updateDocument(category.id, doc.id, 'title', e.target.value)}
                                                        placeholder="Titre du document"
                                                        className="flex-1"
                                                    />
                                                    <Input
                                                        value={doc.fileUrl}
                                                        onChange={(e) => updateDocument(category.id, doc.id, 'fileUrl', e.target.value)}
                                                        placeholder="URL du fichier"
                                                        className="w-48"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeDocument(category.id, doc.id)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addDocument(category.id)}
                                                className="w-full"
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> Ajouter un document
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <Button variant="outline" onClick={addCategory} className="w-full">
                                    <FolderPlus className="h-4 w-4 mr-2" /> Ajouter une catégorie
                                </Button>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Preview */}
            <div className="w-[400px] border-l bg-muted/30 overflow-auto">
                <div className="sticky top-0 p-4 bg-background border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Aperçu
                    </h3>
                </div>
                <div className="p-4 space-y-4">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold" style={{ color: theme.colors.primary }}>
                            {documents.title || 'Documents'}
                        </h2>
                        {documents.subtitle && (
                            <p className="text-sm text-muted-foreground">{documents.subtitle}</p>
                        )}
                    </div>

                    {documents.categories.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center">
                            Aucun document ajouté
                        </p>
                    ) : (
                        documents.categories.map((cat) => (
                            <div key={cat.id} className="space-y-2">
                                <p className="font-medium text-sm" style={{ color: theme.colors.primary }}>
                                    {cat.name}
                                </p>
                                {cat.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center gap-2 p-3 rounded-lg"
                                        style={{ backgroundColor: theme.colors.card }}
                                    >
                                        <FileText className="h-4 w-4" style={{ color: theme.colors.primary }} />
                                        <span className="text-sm flex-1">{doc.title || 'Document'}</span>
                                        <span className="text-xs text-muted-foreground">PDF</span>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
