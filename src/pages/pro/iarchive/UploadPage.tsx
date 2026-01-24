/**
 * UploadPage - Dedicated page for document archiving
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    FolderOpen,
    Tag,
    Clock,
    Info,
    FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentUploader } from './components/DocumentUploader';
import { GABON_RETENTION_RULES } from './components/RetentionPolicy';

const CATEGORIES = [
    { value: 'fiscal', label: 'Fiscal', icon: '📊', color: 'text-green-500' },
    { value: 'social', label: 'Social', icon: '👥', color: 'text-blue-500' },
    { value: 'juridique', label: 'Juridique', icon: '⚖️', color: 'text-purple-500' },
    { value: 'client', label: 'Clients', icon: '🤝', color: 'text-orange-500' },
    { value: 'coffre-fort', label: 'Coffre-fort', icon: '🔐', color: 'text-red-500' },
];

export default function UploadPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<'upload' | 'metadata'>('upload');
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [metadata, setMetadata] = useState({
        title: '',
        description: '',
        category: '',
        tags: [] as string[],
        customRetention: false,
        retentionYears: 10,
    });
    const [tagInput, setTagInput] = useState('');

    const handleUploadComplete = (files: any[]) => {
        setUploadedFiles(files);
        // Auto-fill title if single file
        if (files.length === 1) {
            setMetadata(prev => ({
                ...prev,
                title: files[0].name.replace(/\.[^/.]+$/, ''),
            }));
        }
        setStep('metadata');
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
            setMetadata(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()],
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setMetadata(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag),
        }));
    };

    const handleSubmit = async () => {
        // TODO: Submit to Firebase
        console.log('Submitting:', { files: uploadedFiles, metadata });

        // For now, just navigate back
        navigate('/pro/iarchive');
    };

    const selectedRule = metadata.category ? GABON_RETENTION_RULES[metadata.category] : null;

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/pro/iarchive')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Archiver des documents</h1>
                        <p className="text-muted-foreground">
                            {step === 'upload'
                                ? 'Sélectionnez les documents à archiver'
                                : 'Complétez les informations'
                            }
                        </p>
                    </div>
                </div>

                {/* Steps indicator */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            1
                        </div>
                        <span className="font-medium">Upload</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-border" />
                    <div className={`flex items-center gap-2 ${step === 'metadata' ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'metadata' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            2
                        </div>
                        <span className="font-medium">Métadonnées</span>
                    </div>
                </div>

                {/* Content */}
                {step === 'upload' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <DocumentUploader onUploadComplete={handleUploadComplete} />
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Left: Files summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Fichiers ({uploadedFiles.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {uploadedFiles.map((file, i) => (
                                    <div
                                        key={i}
                                        className="text-sm p-2 rounded-lg bg-muted/50 truncate"
                                    >
                                        {file.name}
                                    </div>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => setStep('upload')}
                                >
                                    Modifier
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Right: Metadata form */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-sm">Informations d'archivage</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Titre du document</Label>
                                    <Input
                                        id="title"
                                        value={metadata.title}
                                        onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Ex: Facture fournisseur Janvier 2024"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (optionnel)</Label>
                                    <Textarea
                                        id="description"
                                        value={metadata.description}
                                        onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Notes supplémentaires..."
                                        rows={2}
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label>Catégorie</Label>
                                    <Select
                                        value={metadata.category}
                                        onValueChange={(value) => setMetadata(prev => ({ ...prev, category: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner une catégorie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{cat.icon}</span>
                                                        <span>{cat.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Retention info */}
                                    {selectedRule && (
                                        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <span className="font-medium">
                                                    Conservation : {selectedRule.years === 99 ? 'Permanente' : `${selectedRule.years} ans`}
                                                </span>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Base légale : {selectedRule.legalBasis}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tags */}
                                <div className="space-y-2">
                                    <Label>Tags</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            placeholder="Ajouter un tag..."
                                        />
                                        <Button type="button" onClick={handleAddTag} variant="outline">
                                            <Tag className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {metadata.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {metadata.tags.map(tag => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="cursor-pointer"
                                                    onClick={() => handleRemoveTag(tag)}
                                                >
                                                    {tag} ×
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Submit */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/pro/iarchive')}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!metadata.title || !metadata.category}
                                        className="bg-emerald-500 hover:bg-emerald-600"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Archiver
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
