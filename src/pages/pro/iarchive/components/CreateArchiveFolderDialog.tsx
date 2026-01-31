/**
 * CreateArchiveFolderDialog - Dialog for creating new archive folders
 * Supports folder creation with retention period inheritance
 */

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FolderPlus, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArchiveCategory, ARCHIVE_RETENTION_DEFAULTS } from '@/data/digitaliumMockData';

// Available folder colors (emerald-focused for archives)
const FOLDER_COLORS = [
    { value: 'emerald', label: 'Émeraude', class: 'bg-emerald-500' },
    { value: 'blue', label: 'Bleu', class: 'bg-blue-500' },
    { value: 'purple', label: 'Violet', class: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'red', label: 'Rouge', class: 'bg-red-500' },
    { value: 'amber', label: 'Ambre', class: 'bg-amber-500' },
    { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
];

export interface CreateArchiveFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    parentFolderName: string;
    parentFolderId: string;
    parentPath: string;
    category: ArchiveCategory;
    defaultRetentionYears: number;
    onCreateFolder: (folderData: {
        name: string;
        color: string;
        parentId: string;
        path: string;
        category: ArchiveCategory;
        retentionYears?: number;
    }) => void;
}

export function CreateArchiveFolderDialog({
    open,
    onOpenChange,
    parentFolderName,
    parentFolderId,
    parentPath,
    category,
    defaultRetentionYears,
    onCreateFolder,
}: CreateArchiveFolderDialogProps) {
    const [folderName, setFolderName] = useState('');
    const [selectedColor, setSelectedColor] = useState('emerald');
    const [isCreating, setIsCreating] = useState(false);
    const [useCustomRetention, setUseCustomRetention] = useState(false);
    const [customRetentionYears, setCustomRetentionYears] = useState(defaultRetentionYears);

    const handleCreate = async () => {
        if (!folderName.trim()) return;

        setIsCreating(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const newPath = parentPath === '/'
            ? `/${folderName.trim()}`
            : `${parentPath}/${folderName.trim()}`;

        onCreateFolder({
            name: folderName.trim(),
            color: selectedColor,
            parentId: parentFolderId,
            path: newPath,
            category,
            retentionYears: useCustomRetention ? customRetentionYears : undefined,
        });

        // Reset form
        setFolderName('');
        setSelectedColor('emerald');
        setUseCustomRetention(false);
        setCustomRetentionYears(defaultRetentionYears);
        setIsCreating(false);
        onOpenChange(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && folderName.trim()) {
            handleCreate();
        }
    };

    // Category labels
    const categoryLabels: Record<ArchiveCategory, string> = {
        fiscal: 'Fiscale',
        social: 'Sociale',
        legal: 'Juridique',
        clients: 'Clients',
        vault: 'Coffre-fort',
        certificates: 'Certificats',
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderPlus className="h-5 w-5 text-emerald-500" />
                        Nouveau dossier d'archives
                    </DialogTitle>
                    <DialogDescription>
                        Créer un dossier dans{' '}
                        <span className="font-medium text-foreground">{parentFolderName}</span>
                        {' '}(Archive {categoryLabels[category]})
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Folder name input */}
                    <div className="space-y-2">
                        <Label htmlFor="folder-name">Nom du dossier</Label>
                        <Input
                            id="folder-name"
                            placeholder="Ex: Exercice 2026"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    </div>

                    {/* Color picker */}
                    <div className="space-y-2">
                        <Label>Couleur</Label>
                        <div className="flex flex-wrap gap-2">
                            {FOLDER_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setSelectedColor(color.value)}
                                    className={cn(
                                        'w-8 h-8 rounded-full transition-all',
                                        color.class,
                                        selectedColor === color.value
                                            ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110'
                                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                                    )}
                                    title={color.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Retention period */}
                    <div className="space-y-3 p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="custom-retention" className="text-sm">
                                    Durée de rétention personnalisée
                                </Label>
                            </div>
                            <Switch
                                id="custom-retention"
                                checked={useCustomRetention}
                                onCheckedChange={setUseCustomRetention}
                            />
                        </div>

                        {useCustomRetention ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={customRetentionYears}
                                    onChange={(e) => setCustomRetentionYears(parseInt(e.target.value) || 1)}
                                    className="w-20 h-8 text-sm"
                                />
                                <span className="text-sm text-muted-foreground">années</span>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Héritera de la catégorie: <strong>{defaultRetentionYears >= 99 ? 'Permanent' : `${defaultRetentionYears} ans`}</strong>
                            </p>
                        )}
                    </div>

                    {/* Path preview */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Chemin</Label>
                        <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 font-mono">
                            {parentPath === '/' ? '' : parentPath}/
                            <span className="text-foreground font-medium">
                                {folderName || 'nouveau-dossier'}
                            </span>
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isCreating}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!folderName.trim() || isCreating}
                        className="bg-emerald-500 hover:bg-emerald-600"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Création...
                            </>
                        ) : (
                            <>
                                <FolderPlus className="h-4 w-4 mr-2" />
                                Créer le dossier
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default CreateArchiveFolderDialog;
