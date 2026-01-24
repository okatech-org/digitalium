
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, CheckCircle2, AlertCircle, X } from "lucide-react";
import { DOCUMENT_TYPES } from '../constants';
import { IDocumentFolder, SmartAnalysisResult } from '../types';

interface SmartImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    isAnalyzing: boolean;
    progress: number;
    results: SmartAnalysisResult[];
    folders: IDocumentFolder[];
    onUpdateResult: (index: number, updates: Partial<SmartAnalysisResult>) => void;
    onRemoveResult: (index: number) => void;
    onConfirmImport: () => void;
}

export function SmartImportModal({
    isOpen,
    onClose,
    isAnalyzing,
    progress,
    results,
    folders,
    onUpdateResult,
    onRemoveResult,
    onConfirmImport
}: SmartImportModalProps) {

    // Avoid closing if analyzing
    const handleOpenChange = (open: boolean) => {
        if (!open && isAnalyzing) return;
        if (!open) onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col border-border/40 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span>🤖 Import Intelligent</span>
                        {isAnalyzing && <Badge variant="secondary" className="animate-pulse">Analyse en cours...</Badge>}
                    </DialogTitle>
                </DialogHeader>

                {isAnalyzing ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-6">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                            <FileText className="h-10 w-10 text-primary animate-bounce" />
                        </div>
                        <div className="w-full max-w-md space-y-2 text-center">
                            <p className="text-lg font-medium text-foreground">Analyse de vos documents...</p>
                            <p className="text-sm text-muted-foreground">Classification automatique du type et du dossier de destination.</p>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">{progress}% complété</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 pr-4 -mr-4">
                            <div className="space-y-4 py-4">
                                {results.map((result, index) => (
                                    <div key={index} className="bg-card border border-border/40 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                                {result.confidence > 0.8 ? (
                                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                                ) : (
                                                    <AlertCircle className="h-6 w-6 text-amber-600" />
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-foreground">{result.file.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{(result.file.size / 1024).toFixed(1)} KB • {result.file.type || 'Inconnu'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={result.confidence > 0.8 ? "default" : "secondary"} className={result.confidence > 0.8 ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                                                            Confiance: {Math.round(result.confidence * 100)}%
                                                        </Badge>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onRemoveResult(index)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom suggéré</label>
                                                        <Input
                                                            value={result.smartName}
                                                            onChange={(e) => onUpdateResult(index, { smartName: e.target.value })}
                                                            className="h-9 bg-muted/30"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type détecté</label>
                                                        <Select
                                                            value={result.type}
                                                            onValueChange={(val) => onUpdateResult(index, { type: val })}
                                                        >
                                                            <SelectTrigger className="h-9 bg-muted/30">
                                                                <SelectValue />
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
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dossier destination</label>
                                                        <Select
                                                            value={result.folderId}
                                                            onValueChange={(val) => onUpdateResult(index, { folderId: val })}
                                                        >
                                                            <SelectTrigger className="h-9 bg-muted/30">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {folders.map(folder => (
                                                                    <SelectItem key={folder.id} value={folder.id}>
                                                                        <div className="flex items-center gap-2">
                                                                            <span>{folder.icon}</span>
                                                                            <span>{folder.name}</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <DialogFooter className="border-t pt-4 mt-auto">
                            <div className="flex items-center justify-between w-full">
                                <p className="text-sm text-muted-foreground">
                                    {results.length} document(s) analysé(s)
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                                    <Button onClick={onConfirmImport} className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                                        Importer {results.length} documents
                                    </Button>
                                </div>
                            </div>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
