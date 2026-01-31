/**
 * ImageUploader - Reusable image upload and configuration component
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Image as ImageIcon,
    Trash2,
    Move,
    Maximize2,
    X,
    Check,
    RefreshCw,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type ImageConfig, defaultImageConfig } from '@/stores/publicPageEditorStore';

interface ImageUploaderProps {
    value: ImageConfig | null;
    onChange: (config: ImageConfig | null) => void;
    label?: string;
    description?: string;
    aspectRatio?: 'square' | 'video' | 'banner' | 'portrait' | 'free';
    showOverlayOptions?: boolean;
    showSizeOptions?: boolean;
    maxHeight?: string;
}

export default function ImageUploader({
    value,
    onChange,
    label = 'Image',
    description,
    aspectRatio = 'free',
    showOverlayOptions = false,
    showSizeOptions = true,
    maxHeight = '200px',
}: ImageUploaderProps) {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const url = e.target?.result as string;
                onChange({
                    ...defaultImageConfig,
                    ...value,
                    url,
                    alt: file.name.replace(/\.[^/.]+$/, ''),
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const url = e.target?.result as string;
                onChange({
                    ...defaultImageConfig,
                    ...value,
                    url,
                    alt: file.name.replace(/\.[^/.]+$/, ''),
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        onChange(null);
    };

    const updateConfig = (updates: Partial<ImageConfig>) => {
        if (value) {
            onChange({ ...value, ...updates });
        }
    };

    const getAspectRatioClass = () => {
        switch (aspectRatio) {
            case 'square': return 'aspect-square';
            case 'video': return 'aspect-video';
            case 'banner': return 'aspect-[3/1]';
            case 'portrait': return 'aspect-[3/4]';
            default: return '';
        }
    };

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Upload Zone or Preview */}
            <AnimatePresence mode="wait">
                {!value?.url ? (
                    <motion.div
                        key="upload-zone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                            getAspectRatioClass(),
                            isDragging
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        )}
                        style={{ maxHeight }}
                    >
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                            <div className={cn(
                                'p-3 rounded-full transition-colors',
                                isDragging ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                            )}>
                                <Upload className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">
                                    {isDragging ? 'Déposez l\'image' : 'Cliquez ou glissez une image'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    PNG, JPG, WEBP jusqu'à 10MB
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative rounded-xl overflow-hidden group"
                        style={{ maxHeight }}
                    >
                        <img
                            src={value.url}
                            alt={value.alt}
                            className={cn(
                                'w-full h-full transition-all',
                                getAspectRatioClass(),
                                value.objectFit === 'cover' && 'object-cover',
                                value.objectFit === 'contain' && 'object-contain',
                                value.objectFit === 'fill' && 'object-fill',
                                value.position === 'top' && 'object-top',
                                value.position === 'bottom' && 'object-bottom',
                                value.position === 'left' && 'object-left',
                                value.position === 'right' && 'object-right'
                            )}
                        />

                        {/* Overlay if enabled */}
                        {value.overlay?.enabled && (
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundColor: value.overlay.color,
                                    opacity: value.overlay.opacity / 100,
                                }}
                            />
                        )}

                        {/* Action Buttons */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Remplacer
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setIsConfigOpen(true)}
                            >
                                <Maximize2 className="h-4 w-4 mr-1" />
                                Configurer
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleRemove}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Configuration Modal */}
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Configuration de l'Image</DialogTitle>
                        <DialogDescription>
                            Ajustez la taille, le positionnement et les effets
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Preview */}
                        <div className="space-y-4">
                            <Label>Aperçu</Label>
                            <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                                {value?.url && (
                                    <>
                                        <img
                                            src={value.url}
                                            alt={value.alt}
                                            className={cn(
                                                'w-full h-full',
                                                value.objectFit === 'cover' && 'object-cover',
                                                value.objectFit === 'contain' && 'object-contain',
                                                value.objectFit === 'fill' && 'object-fill',
                                                value.position === 'top' && 'object-top',
                                                value.position === 'bottom' && 'object-bottom'
                                            )}
                                        />
                                        {value.overlay?.enabled && (
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    backgroundColor: value.overlay.color,
                                                    opacity: value.overlay.opacity / 100,
                                                }}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="space-y-4">
                            {/* Alt Text */}
                            <div className="space-y-2">
                                <Label>Texte alternatif</Label>
                                <Input
                                    value={value?.alt || ''}
                                    onChange={(e) => updateConfig({ alt: e.target.value })}
                                    placeholder="Description de l'image"
                                />
                            </div>

                            {showSizeOptions && (
                                <>
                                    {/* Object Fit */}
                                    <div className="space-y-2">
                                        <Label>Ajustement</Label>
                                        <Select
                                            value={value?.objectFit || 'cover'}
                                            onValueChange={(v: any) => updateConfig({ objectFit: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cover">Couvrir</SelectItem>
                                                <SelectItem value="contain">Contenir</SelectItem>
                                                <SelectItem value="fill">Étirer</SelectItem>
                                                <SelectItem value="none">Original</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Position */}
                                    <div className="space-y-2">
                                        <Label>Position</Label>
                                        <Select
                                            value={value?.position || 'center'}
                                            onValueChange={(v: any) => updateConfig({ position: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="center">Centre</SelectItem>
                                                <SelectItem value="top">Haut</SelectItem>
                                                <SelectItem value="bottom">Bas</SelectItem>
                                                <SelectItem value="left">Gauche</SelectItem>
                                                <SelectItem value="right">Droite</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Border Radius */}
                                    <div className="space-y-2">
                                        <Label>Arrondis</Label>
                                        <Select
                                            value={value?.borderRadius || 'md'}
                                            onValueChange={(v: any) => updateConfig({ borderRadius: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Aucun</SelectItem>
                                                <SelectItem value="sm">Petit</SelectItem>
                                                <SelectItem value="md">Moyen</SelectItem>
                                                <SelectItem value="lg">Grand</SelectItem>
                                                <SelectItem value="xl">Très grand</SelectItem>
                                                <SelectItem value="full">Complet</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {/* Overlay Options */}
                            {showOverlayOptions && (
                                <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                                    <div className="flex items-center justify-between">
                                        <Label>Overlay</Label>
                                        <Switch
                                            checked={value?.overlay?.enabled || false}
                                            onCheckedChange={(checked) =>
                                                updateConfig({
                                                    overlay: {
                                                        enabled: checked,
                                                        color: value?.overlay?.color || '#000000',
                                                        opacity: value?.overlay?.opacity || 50,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    {value?.overlay?.enabled && (
                                        <>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    value={value.overlay.color}
                                                    onChange={(e) =>
                                                        updateConfig({
                                                            overlay: { ...value.overlay!, color: e.target.value },
                                                        })
                                                    }
                                                    className="w-12 h-10 p-1"
                                                />
                                                <Input
                                                    value={value.overlay.color}
                                                    onChange={(e) =>
                                                        updateConfig({
                                                            overlay: { ...value.overlay!, color: e.target.value },
                                                        })
                                                    }
                                                    className="flex-1 font-mono"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Opacité</span>
                                                    <span>{value.overlay.opacity}%</span>
                                                </div>
                                                <Slider
                                                    value={[value.overlay.opacity]}
                                                    onValueChange={([v]) =>
                                                        updateConfig({
                                                            overlay: { ...value.overlay!, opacity: v },
                                                        })
                                                    }
                                                    min={0}
                                                    max={100}
                                                    step={5}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                            Fermer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
