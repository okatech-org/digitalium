
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FilePlus, Upload, AlertCircle } from "lucide-react";
import { IClasseur, IFichier, IAttachment, TreeLocation } from '../types';
import { DOCUMENT_TYPES } from '../constants';
import { TreeSelect } from '../components/TreeSelect';

interface NewFichierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: Partial<IFichier>, classeurId: string, dossierId: string) => void;
    dossierName?: string;
    /** If provided, pre-selects this location */
    preSelectedClasseurId?: string;
    preSelectedDossierId?: string;
    /** All classeurs for tree navigation */
    classeurs?: IClasseur[];
}

export function NewFichierModal({
    isOpen,
    onClose,
    onCreate,
    dossierName,
    preSelectedClasseurId,
    preSelectedDossierId,
    classeurs = [],
}: NewFichierModalProps) {
    const [formData, setFormData] = useState<Partial<IFichier>>({
        name: '',
        description: '',
        type: undefined, // No default - type is mandatory
        reference: '',
        tags: [],
        attachments: [],
    });

    const [tagInput, setTagInput] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<TreeLocation | null>(
        preSelectedClasseurId && preSelectedDossierId
            ? { classeurId: preSelectedClasseurId, dossierId: preSelectedDossierId, dossierName }
            : null
    );
    const [showLocationError, setShowLocationError] = useState(false);
    const [showTypeError, setShowTypeError] = useState(false);

    // Reset when modal opens with pre-selected location
    React.useEffect(() => {
        if (isOpen && preSelectedClasseurId && preSelectedDossierId) {
            setSelectedLocation({
                classeurId: preSelectedClasseurId,
                dossierId: preSelectedDossierId,
                dossierName,
            });
            setShowLocationError(false);
        }
    }, [isOpen, preSelectedClasseurId, preSelectedDossierId, dossierName]);

    const handleSubmit = () => {
        if (!formData.name?.trim()) return;

        // Validate mandatory type
        if (!formData.type) {
            setShowTypeError(true);
            return;
        }

        const targetClasseurId = selectedLocation?.classeurId || preSelectedClasseurId;
        const targetDossierId = selectedLocation?.dossierId || preSelectedDossierId;

        if (!targetClasseurId || !targetDossierId) {
            setShowLocationError(true);
            return;
        }

        onCreate({
            ...formData,
            id: `fichier-${Date.now()}`,
            reference: formData.reference || `REF-${Date.now()}`,
            status: 'brouillon',
            created_at: new Date().toISOString(),
        }, targetClasseurId, targetDossierId);

        onClose();
        setFormData({ name: '', description: '', type: undefined, reference: '', tags: [], attachments: [] });
        setTagInput('');
        setSelectedLocation(null);
        setShowLocationError(false);
        setShowTypeError(false);
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...(formData.tags || []), tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData({
            ...formData,
            tags: formData.tags?.filter(t => t !== tag) || []
        });
    };

    const showTreeSelect = !(preSelectedClasseurId && preSelectedDossierId) && classeurs.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl border-border/40 shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <FilePlus className="h-5 w-5 text-primary" />
                        <span>Nouveau Fichier</span>
                    </DialogTitle>
                    <DialogDescription>
                        {dossierName ? (
                            <>Ajouter un fichier dans <strong>{dossierName}</strong></>
                        ) : (
                            <>Choisissez un emplacement et créez un fichier avec ses métadonnées.</>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Tree Select for choosing location (when not pre-selected) */}
                    {showTreeSelect && (
                        <TreeSelect
                            classeurs={classeurs}
                            value={selectedLocation}
                            onChange={(loc) => {
                                setSelectedLocation(loc);
                                setShowLocationError(false);
                            }}
                            classeurOnly={false}
                            label="Emplacement (Classeur > Dossier) *"
                            error={showLocationError}
                            errorMessage="Veuillez sélectionner un classeur et un dossier"
                        />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label>Nom du fichier *</Label>
                            <Input
                                placeholder="Ex: Contrat Acme Corp 2024"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="border-border/40"
                            />
                        </div>

                        {/* Reference */}
                        <div className="space-y-2">
                            <Label>Référence</Label>
                            <Input
                                placeholder="Ex: CTR-2024-001"
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                className="border-border/40 font-mono"
                            />
                        </div>
                    </div>

                    {/* Type - MANDATORY */}
                    <div className="space-y-2">
                        <Label className={showTypeError ? 'text-destructive' : ''}>
                            Type de document *
                        </Label>
                        <Select
                            value={formData.type || ''}
                            onValueChange={(val) => {
                                setFormData({ ...formData, type: val as IFichier['type'] });
                                setShowTypeError(false);
                            }}
                        >
                            <SelectTrigger className={`border-border/40 ${showTypeError ? 'border-destructive' : ''}`}>
                                <SelectValue placeholder="Sélectionnez un type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(DOCUMENT_TYPES).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                            <config.icon className={`h-4 w-4 ${config.color.split(' ')[1]}`} />
                                            <span>{config.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {showTypeError && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Le type de document est obligatoire
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Décrivez brièvement ce document..."
                            className="h-[80px] border-border/40 resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Ajouter un tag..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="border-border/40"
                            />
                            <Button type="button" variant="outline" onClick={addTag}>
                                Ajouter
                            </Button>
                        </div>
                        {formData.tags && formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="bg-muted px-2 py-1 rounded-md text-sm flex items-center gap-1 group"
                                    >
                                        #{tag}
                                        <button
                                            onClick={() => removeTag(tag)}
                                            className="text-muted-foreground hover:text-destructive ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upload placeholder */}
                    <div className="border-2 border-dashed border-border/40 rounded-xl p-6 text-center bg-muted/20">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Glissez-déposez des pièces jointes ici<br />
                            <span className="text-xs">ou cliquez pour parcourir</span>
                        </p>
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
                        <FilePlus className="h-4 w-4 mr-2" />
                        Créer le fichier
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
