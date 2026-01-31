/**
 * CreateFolderDialog - Dialog for creating new folders in iDocument
 * Supports folder creation at current location in the hierarchy
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
import { FolderPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Available folder colors
const FOLDER_COLORS = [
    { value: 'blue', label: 'Bleu', class: 'bg-blue-500' },
    { value: 'emerald', label: 'Vert', class: 'bg-emerald-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'pink', label: 'Rose', class: 'bg-pink-500' },
    { value: 'purple', label: 'Violet', class: 'bg-purple-500' },
    { value: 'red', label: 'Rouge', class: 'bg-red-500' },
    { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
    { value: 'amber', label: 'Ambre', class: 'bg-amber-500' },
    { value: 'violet', label: 'Mauve', class: 'bg-violet-500' },
];

export interface CreateFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    parentFolderName: string;
    parentFolderId: string;
    parentPath: string;
    onCreateFolder: (folderData: {
        name: string;
        color: string;
        parentId: string;
        path: string;
    }) => void;
}

export function CreateFolderDialog({
    open,
    onOpenChange,
    parentFolderName,
    parentFolderId,
    parentPath,
    onCreateFolder,
}: CreateFolderDialogProps) {
    const [folderName, setFolderName] = useState('');
    const [selectedColor, setSelectedColor] = useState('blue');
    const [isCreating, setIsCreating] = useState(false);

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
        });

        // Reset form
        setFolderName('');
        setSelectedColor('blue');
        setIsCreating(false);
        onOpenChange(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && folderName.trim()) {
            handleCreate();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderPlus className="h-5 w-5 text-blue-500" />
                        Nouveau dossier
                    </DialogTitle>
                    <DialogDescription>
                        Créer un nouveau dossier dans{' '}
                        <span className="font-medium text-foreground">{parentFolderName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Folder name input */}
                    <div className="space-y-2">
                        <Label htmlFor="folder-name">Nom du dossier</Label>
                        <Input
                            id="folder-name"
                            placeholder="Entrez le nom du dossier"
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
                                            ? 'ring-2 ring-offset-2 ring-primary scale-110'
                                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                                    )}
                                    title={color.label}
                                />
                            ))}
                        </div>
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
                        className="bg-blue-500 hover:bg-blue-600"
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

export default CreateFolderDialog;
