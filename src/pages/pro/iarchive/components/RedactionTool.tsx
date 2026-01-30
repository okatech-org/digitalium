/**
 * RedactionTool Component (Caviardage)
 * 
 * Allows users to redact sensitive content from documents.
 * Supports drawing rectangles over sensitive areas and applying permanent redactions.
 */

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import {
    EyeOff,
    Square,
    Type,
    Trash2,
    Save,
    Undo,
    Check,
    AlertTriangle,
    Download,
    FileText,
    Palette,
    Plus,
    MousePointer2,
    Hand
} from 'lucide-react';

// Types
export interface Redaction {
    id: string;
    documentId: string;
    pageNumber: number;
    xPosition: number;
    yPosition: number;
    width: number;
    height: number;
    redactionType: 'rectangle' | 'text';
    redactionColor: string;
    redactionReason?: string;
    originalText?: string;
    replacementText?: string;
    isPermanent: boolean;
    appliedAt?: Date;
    createdBy: string;
    createdAt: Date;
}

interface RedactionToolProps {
    documentId: string;
    documentTitle: string;
    totalPages: number;
    existingRedactions?: Redaction[];
    onSaveRedactions?: (redactions: Redaction[]) => Promise<void>;
    onApplyPermanent?: (redactionIds: string[]) => Promise<void>;
}

const REDACTION_COLORS = [
    { value: '#000000', label: 'Noir', className: 'bg-black' },
    { value: '#1a1a1a', label: 'Gris foncé', className: 'bg-gray-800' },
    { value: '#333333', label: 'Gris', className: 'bg-gray-700' },
    { value: '#ffffff', label: 'Blanc', className: 'bg-white border' },
];

const REDACTION_REASONS = [
    'Données personnelles (RGPD)',
    'Secret commercial',
    'Information confidentielle',
    'Sécurité nationale',
    'Protection de la vie privée',
    'Autre',
];

// Demo redactions
const DEMO_REDACTIONS: Redaction[] = [
    {
        id: 'red-1',
        documentId: 'doc-1',
        pageNumber: 1,
        xPosition: 100,
        yPosition: 150,
        width: 200,
        height: 20,
        redactionType: 'rectangle',
        redactionColor: '#000000',
        redactionReason: 'Données personnelles (RGPD)',
        isPermanent: false,
        createdBy: 'user-1',
        createdAt: new Date(),
    },
    {
        id: 'red-2',
        documentId: 'doc-1',
        pageNumber: 1,
        xPosition: 50,
        yPosition: 300,
        width: 300,
        height: 40,
        redactionType: 'rectangle',
        redactionColor: '#000000',
        redactionReason: 'Secret commercial',
        isPermanent: true,
        appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        createdBy: 'user-1',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
];

export function RedactionTool({
    documentId,
    documentTitle,
    totalPages = 3,
    existingRedactions = DEMO_REDACTIONS,
    onSaveRedactions,
    onApplyPermanent,
}: RedactionToolProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [redactions, setRedactions] = useState<Redaction[]>(existingRedactions);
    const [selectedTool, setSelectedTool] = useState<'select' | 'rectangle' | 'text'>('select');
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [selectedRedactionId, setSelectedRedactionId] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
    const [tempRedaction, setTempRedaction] = useState<Partial<Redaction> | null>(null);
    const [showReasonDialog, setShowReasonDialog] = useState(false);
    const [pendingReason, setPendingReason] = useState('');
    const [showApplyDialog, setShowApplyDialog] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);

    const pageRedactions = redactions.filter(r => r.pageNumber === currentPage);
    const pendingRedactions = redactions.filter(r => !r.isPermanent);
    const permanentRedactions = redactions.filter(r => r.isPermanent);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (selectedTool === 'select') return;
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        setDrawStart({ x, y });
        setTempRedaction({
            pageNumber: currentPage,
            xPosition: x,
            yPosition: y,
            width: 0,
            height: 0,
            redactionColor: selectedColor,
            redactionType: selectedTool,
        });
    }, [selectedTool, currentPage, selectedColor]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing || !drawStart || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setTempRedaction(prev => prev ? {
            ...prev,
            width: Math.abs(x - drawStart.x),
            height: Math.abs(y - drawStart.y),
            xPosition: Math.min(x, drawStart.x),
            yPosition: Math.min(y, drawStart.y),
        } : null);
    }, [isDrawing, drawStart]);

    const handleMouseUp = useCallback(() => {
        if (!isDrawing || !tempRedaction) return;

        if (tempRedaction.width && tempRedaction.width > 10 &&
            tempRedaction.height && tempRedaction.height > 10) {
            setShowReasonDialog(true);
        }

        setIsDrawing(false);
        setDrawStart(null);
    }, [isDrawing, tempRedaction]);

    const handleAddRedaction = () => {
        if (!tempRedaction) return;

        const newRedaction: Redaction = {
            id: `red-${Date.now()}`,
            documentId,
            pageNumber: tempRedaction.pageNumber || currentPage,
            xPosition: tempRedaction.xPosition || 0,
            yPosition: tempRedaction.yPosition || 0,
            width: tempRedaction.width || 0,
            height: tempRedaction.height || 0,
            redactionType: tempRedaction.redactionType || 'rectangle',
            redactionColor: tempRedaction.redactionColor || '#000000',
            redactionReason: pendingReason || undefined,
            isPermanent: false,
            createdBy: 'current-user',
            createdAt: new Date(),
        };

        setRedactions([...redactions, newRedaction]);
        setTempRedaction(null);
        setShowReasonDialog(false);
        setPendingReason('');
    };

    const handleDeleteRedaction = (redactionId: string) => {
        const redaction = redactions.find(r => r.id === redactionId);
        if (redaction?.isPermanent) {
            alert('Les caviardages permanents ne peuvent pas être supprimés.');
            return;
        }
        setRedactions(redactions.filter(r => r.id !== redactionId));
        if (selectedRedactionId === redactionId) {
            setSelectedRedactionId(null);
        }
    };

    const handleSave = async () => {
        if (onSaveRedactions) {
            await onSaveRedactions(redactions);
        } else {
            console.log('Demo: Save redactions', redactions);
        }
    };

    const handleApplyPermanent = async () => {
        const pendingIds = pendingRedactions.map(r => r.id);

        if (onApplyPermanent) {
            await onApplyPermanent(pendingIds);
        } else {
            console.log('Demo: Apply permanent redactions', pendingIds);
        }

        // Mark as permanent locally
        setRedactions(redactions.map(r =>
            pendingIds.includes(r.id)
                ? { ...r, isPermanent: true, appliedAt: new Date() }
                : r
        ));

        setShowApplyDialog(false);
    };

    const RedactionOverlay = ({ redaction, isTemp = false }: { redaction: Partial<Redaction>; isTemp?: boolean }) => (
        <div
            className={`absolute cursor-pointer transition-all ${isTemp ? 'opacity-60' :
                    selectedRedactionId === redaction.id ? 'ring-2 ring-primary ring-offset-2' :
                        redaction.isPermanent ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                }`}
            style={{
                left: redaction.xPosition,
                top: redaction.yPosition,
                width: redaction.width,
                height: redaction.height,
                backgroundColor: redaction.redactionColor,
            }}
            onClick={() => !isTemp && redaction.id && setSelectedRedactionId(
                selectedRedactionId === redaction.id ? null : redaction.id
            )}
        >
            {redaction.isPermanent && (
                <div className="absolute -top-5 left-0 text-xs text-red-500 flex items-center gap-1">
                    <EyeOff className="h-3 w-3" />
                    Permanent
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <EyeOff className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Caviardage de Document</CardTitle>
                                <CardDescription>{documentTitle}</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">
                                {pendingRedactions.length} en attente
                            </Badge>
                            <Badge variant="secondary">
                                {permanentRedactions.length} appliqués
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-[1fr_300px] gap-4">
                {/* Document Canvas */}
                <Card>
                    <CardHeader className="pb-2">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={selectedTool === 'select' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedTool('select')}
                                >
                                    <MousePointer2 className="h-4 w-4 mr-1" />
                                    Sélection
                                </Button>
                                <Button
                                    variant={selectedTool === 'rectangle' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedTool('rectangle')}
                                >
                                    <Square className="h-4 w-4 mr-1" />
                                    Rectangle
                                </Button>

                                <div className="h-6 w-px bg-border mx-2" />

                                {/* Color picker */}
                                <div className="flex items-center gap-1">
                                    {REDACTION_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            className={`w-6 h-6 rounded-full ${color.className} ${selectedColor === color.value ? 'ring-2 ring-primary ring-offset-2' : ''
                                                }`}
                                            onClick={() => setSelectedColor(color.value)}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handleSave}>
                                    <Save className="h-4 w-4 mr-1" />
                                    Sauvegarder
                                </Button>
                                {pendingRedactions.length > 0 && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowApplyDialog(true)}
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        Appliquer définitivement
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Document preview area */}
                        <div
                            ref={canvasRef}
                            className="relative w-full h-[600px] bg-white border rounded-lg overflow-hidden cursor-crosshair"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={() => {
                                setIsDrawing(false);
                                setDrawStart(null);
                            }}
                            style={{ cursor: selectedTool === 'select' ? 'default' : 'crosshair' }}
                        >
                            {/* Demo document content */}
                            <div className="absolute inset-4 pointer-events-none text-sm text-gray-600 leading-relaxed">
                                <h3 className="font-bold mb-4">CONTRAT DE SERVICE CONFIDENTIEL</h3>
                                <p className="mb-2">Entre les soussignés :</p>
                                <p className="mb-2">
                                    <strong>La Société ABC</strong>, représentée par M. Jean Dupont,
                                    demeurant au 123 Avenue des Champs, 75008 Paris
                                </p>
                                <p className="mb-2">Et</p>
                                <p className="mb-4">
                                    <strong>La Société XYZ</strong>, représentée par Mme Marie Martin,
                                    SIRET: 123 456 789 00012
                                </p>
                                <p className="mb-2">Article 1 - Objet du contrat</p>
                                <p className="mb-2">
                                    Le présent contrat a pour objet la fourniture de services de conseil
                                    et d'accompagnement pour un montant de 50 000€ HT.
                                </p>
                                <p className="mb-2">Article 2 - Durée</p>
                                <p className="mb-2">
                                    La durée du contrat est de 12 mois à compter de la signature.
                                </p>
                                <p className="mb-2">Article 3 - Confidentialité</p>
                                <p>
                                    Les parties s'engagent à maintenir strictement confidentielles
                                    toutes les informations échangées dans le cadre de ce contrat.
                                </p>
                            </div>

                            {/* Existing redactions */}
                            {pageRedactions.map((redaction) => (
                                <RedactionOverlay key={redaction.id} redaction={redaction} />
                            ))}

                            {/* Temp redaction while drawing */}
                            {tempRedaction && isDrawing && (
                                <RedactionOverlay redaction={tempRedaction} isTemp />
                            )}
                        </div>

                        {/* Page navigation */}
                        <div className="flex items-center justify-center gap-4 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                Précédent
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                Suivant
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Instructions */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-2">
                            <p>1. Sélectionnez l'outil Rectangle</p>
                            <p>2. Dessinez sur le texte à caviarder</p>
                            <p>3. Indiquez la raison du caviardage</p>
                            <p>4. Sauvegardez vos modifications</p>
                            <p>5. Appliquez définitivement quand prêt</p>
                        </CardContent>
                    </Card>

                    {/* Redactions list */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center justify-between">
                                <span>Caviardages ({redactions.length})</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[350px]">
                                <div className="space-y-2">
                                    {redactions.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            Aucun caviardage. Utilisez les outils ci-dessus.
                                        </p>
                                    ) : (
                                        redactions.map((redaction) => (
                                            <div
                                                key={redaction.id}
                                                className={`p-2 rounded border text-xs ${selectedRedactionId === redaction.id ? 'border-primary bg-primary/5' : ''
                                                    } ${redaction.isPermanent ? 'bg-red-500/5 border-red-500/30' : ''}`}
                                                onClick={() => {
                                                    setSelectedRedactionId(redaction.id);
                                                    setCurrentPage(redaction.pageNumber);
                                                }}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium">
                                                        Page {redaction.pageNumber}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {redaction.isPermanent ? (
                                                            <Badge variant="destructive" className="text-[10px]">
                                                                Permanent
                                                            </Badge>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-5 w-5"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteRedaction(redaction.id);
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <div
                                                        className="w-3 h-3 rounded"
                                                        style={{ backgroundColor: redaction.redactionColor }}
                                                    />
                                                    <span>{redaction.redactionReason || 'Sans raison'}</span>
                                                </div>
                                                <p className="text-muted-foreground mt-1">
                                                    {redaction.width?.toFixed(0)}×{redaction.height?.toFixed(0)} px
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Reason Dialog */}
            <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Raison du caviardage</DialogTitle>
                        <DialogDescription>
                            Indiquez pourquoi ce contenu doit être masqué
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Raison</Label>
                            <Select value={pendingReason} onValueChange={setPendingReason}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une raison" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REDACTION_REASONS.map((reason) => (
                                        <SelectItem key={reason} value={reason}>
                                            {reason}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowReasonDialog(false);
                            setTempRedaction(null);
                        }}>
                            Annuler
                        </Button>
                        <Button onClick={handleAddRedaction}>
                            Ajouter le caviardage
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Apply Permanent Dialog */}
            <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Appliquer les caviardages définitivement
                        </DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. Les zones caviardées seront
                            définitivement supprimées du document original.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                            <p className="text-sm">
                                <strong>{pendingRedactions.length}</strong> caviardage{pendingRedactions.length > 1 ? 's' : ''} sera{pendingRedactions.length > 1 ? 'ont' : ''} appliqué{pendingRedactions.length > 1 ? 's' : ''} définitivement.
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Le contenu masqué ne pourra plus être récupéré.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleApplyPermanent}>
                            Appliquer définitivement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default RedactionTool;
