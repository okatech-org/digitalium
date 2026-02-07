
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FolderPlus, Sparkles, Palette } from "lucide-react";
import { IClasseur, IDossier, TreeLocation } from '../types';
import { DOSSIER_TEMPLATES, CLASSEUR_COLORS, DOSSIER_ICONS } from '../constants';
import { TreeSelect } from '../components/TreeSelect';

interface NewDossierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: Partial<IDossier>, classeurId: string) => void;
    classeurName?: string;
    /** If provided, pre-selects this classeur */
    preSelectedClasseurId?: string;
    /** All classeurs for tree navigation */
    classeurs?: IClasseur[];
}

export function NewDossierModal({
    isOpen,
    onClose,
    onCreate,
    classeurName,
    preSelectedClasseurId,
    classeurs = [],
}: NewDossierModalProps) {
    const [formData, setFormData] = useState<Partial<IDossier>>({
        name: '',
        description: '',
        icon: '📁',
        color: 'bg-amber-400',
    });

    const [selectedLocation, setSelectedLocation] = useState<TreeLocation | null>(
        preSelectedClasseurId
            ? { classeurId: preSelectedClasseurId, classeurName: classeurName }
            : null
    );
    const [showLocationError, setShowLocationError] = useState(false);

    // Reset when modal opens with pre-selected classeur
    React.useEffect(() => {
        if (isOpen && preSelectedClasseurId) {
            setSelectedLocation({
                classeurId: preSelectedClasseurId,
                classeurName: classeurName,
            });
            setShowLocationError(false);
        }
    }, [isOpen, preSelectedClasseurId, classeurName]);

    const handleSubmit = () => {
        if (!formData.name?.trim()) return;

        const targetClasseurId = selectedLocation?.classeurId || preSelectedClasseurId;
        if (!targetClasseurId) {
            setShowLocationError(true);
            return;
        }

        onCreate({
            ...formData,
            id: `dossier-${Date.now()}`,
            fichiers: [],
            created_at: new Date().toISOString(),
        }, targetClasseurId);

        onClose();
        setFormData({ name: '', description: '', icon: '📁', color: 'bg-amber-400' });
        setSelectedLocation(null);
        setShowLocationError(false);
    };

    const applyTemplate = (template: typeof DOSSIER_TEMPLATES[0]) => {
        setFormData({
            ...formData,
            name: template.name,
            description: template.description,
            icon: template.icon,
            color: template.color,
        });
    };

    const showTreeSelect = !preSelectedClasseurId && classeurs.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl border-border/40 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <FolderPlus className="h-5 w-5 text-primary" />
                        <span>Nouveau Dossier</span>
                    </DialogTitle>
                    <DialogDescription>
                        {classeurName ? (
                            <>Ajouter un dossier dans <strong>{classeurName}</strong></>
                        ) : (
                            <>Choisissez un classeur et créez un dossier pour organiser vos fichiers.</>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* Tree Select for choosing classeur (when not pre-selected) */}
                {showTreeSelect && (
                    <TreeSelect
                        classeurs={classeurs}
                        value={selectedLocation}
                        onChange={(loc) => {
                            setSelectedLocation(loc);
                            setShowLocationError(false);
                        }}
                        classeurOnly={true}
                        label="Classeur de destination *"
                        error={showLocationError}
                        errorMessage="Veuillez sélectionner un classeur"
                    />
                )}

                {/* Quick Templates */}
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Modèles rapides</Label>
                    <div className="flex flex-wrap gap-2">
                        {DOSSIER_TEMPLATES.map((template, i) => (
                            <button
                                key={i}
                                onClick={() => applyTemplate(template)}
                                className="bg-muted/50 hover:bg-muted px-3 py-2 rounded-lg flex items-center gap-2 text-xs hover:text-primary transition-colors"
                            >
                                <span>{template.icon}</span>
                                <span>{template.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label>Nom du dossier *</Label>
                            <Input
                                placeholder="Ex: Contrats Clients, Factures 2024..."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="border-border/40 font-medium"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Décrivez le contenu de ce dossier..."
                                className="h-[100px] border-border/40 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Icon Selection */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5" />
                                Icône
                            </Label>
                            <div className="bg-muted/30 p-3 rounded-lg border border-border/40">
                                <div className="grid grid-cols-6 gap-2">
                                    {DOSSIER_ICONS.map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => setFormData({ ...formData, icon })}
                                            className={`text-xl p-2 rounded-lg transition-all ${formData.icon === icon
                                                ? 'bg-primary/10 scale-110 shadow-sm'
                                                : 'hover:bg-muted/50'
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Palette className="h-3.5 w-3.5" />
                                Couleur
                            </Label>
                            <div className="bg-muted/30 p-3 rounded-lg border border-border/40">
                                <div className="grid grid-cols-4 gap-2">
                                    {CLASSEUR_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            className={`h-8 rounded-lg transition-all ${color.value} ${formData.color === color.value
                                                ? 'ring-2 ring-offset-2 ring-primary scale-105'
                                                : 'opacity-70 hover:opacity-100'
                                                }`}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-muted/30 p-4 rounded-lg border border-border/40">
                            <Label className="text-xs text-muted-foreground mb-2 block">Aperçu</Label>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-lg ${formData.color} flex items-center justify-center shadow-lg`}>
                                    <span className="text-2xl">{formData.icon}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">
                                        {formData.name || 'Nouveau Dossier'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formData.description || 'Aucune description'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
                    <Button variant="ghost" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.name?.trim()}
                        className="bg-primary hover:bg-primary/90 text-white shadow-lg"
                    >
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Créer le dossier
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
