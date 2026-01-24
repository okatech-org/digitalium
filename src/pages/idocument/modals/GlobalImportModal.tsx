
import React from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Upload, HardDrive, Scan, Bot } from "lucide-react";

interface GlobalImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportLocal: () => void;
    onImportScanner: () => void;
}

export function GlobalImportModal({
    isOpen,
    onClose,
    onImportLocal,
    onImportScanner
}: GlobalImportModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl border-border/40 shadow-2xl">
                <DialogHeader>
                    <DialogTitle>Importer un document</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <Button variant="outline" className="h-32 flex flex-col gap-3 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group" onClick={onImportLocal}>
                        <div className="p-3 rounded-full bg-blue-500/10 group-hover:scale-110 transition-transform">
                            <Upload className="h-6 w-6 text-blue-500" />
                        </div>
                        <span className="font-medium">Depuis l'ordinateur</span>
                    </Button>
                    <Button variant="outline" className="h-32 flex flex-col gap-3 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all group">
                        <div className="p-3 rounded-full bg-purple-500/10 group-hover:scale-110 transition-transform">
                            <HardDrive className="h-6 w-6 text-purple-500" />
                        </div>
                        <span className="font-medium">Google Drive / Dropbox</span>
                    </Button>
                    <Button variant="outline" className="h-32 flex flex-col gap-3 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all group" onClick={onImportScanner}>
                        <div className="p-3 rounded-full bg-amber-500/10 group-hover:scale-110 transition-transform">
                            <Scan className="h-6 w-6 text-amber-500" />
                        </div>
                        <span className="font-medium">Scanner un document</span>
                    </Button>
                    <Button variant="outline" className="h-32 flex flex-col gap-3 hover:bg-green-500/10 hover:border-green-500/30 transition-all group relative overflow-hidden" onClick={onImportLocal}>
                        <div className="absolute top-0 right-0 p-1 bg-green-500 text-white text-[10px] rounded-bl">Recommandé</div>
                        <div className="p-3 rounded-full bg-green-500/10 group-hover:scale-110 transition-transform">
                            <Bot className="h-6 w-6 text-green-500" />
                        </div>
                        <span className="font-medium">Assistant IA Import</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
