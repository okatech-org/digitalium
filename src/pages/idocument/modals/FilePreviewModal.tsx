
import React from 'react';
import {
    Dialog, DialogContent
} from "@/components/ui/dialog";
import { IAttachment } from '../types';

interface FilePreviewModalProps {
    file: IAttachment | null;
    isOpen: boolean;
    onClose: () => void;
}

export function FilePreviewModal({
    file,
    isOpen,
    onClose
}: FilePreviewModalProps) {
    if (!file) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[80vh] border-border/40 shadow-2xl p-0 overflow-hidden flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                    <h3 className="font-semibold text-lg">{file.name}</h3>
                </div>
                <div className="flex-1 bg-muted/20 p-4 overflow-auto flex items-center justify-center">
                    {file.type === 'image' ? (
                        <img src={file.url || "#"} alt={file.name} className="max-w-full max-h-full object-contain shadow-lg rounded-lg" />
                    ) : file.type === 'pdf' ? (
                        <div className="w-full h-full flex items-center justify-center bg-card shadow-lg rounded-lg border border-border/40">
                            <p className="text-muted-foreground">Aperçu PDF simulé (Intégration PDF.js requise pour le rendu réel)</p>
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-card rounded-lg shadow border border-border/40">
                            <p className="text-muted-foreground mb-2">Aperçu non disponible pour ce type de fichier</p>
                            <p className="font-medium text-foreground">{file.name}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
