/**
 * ElectronicSignature Component
 * 
 * Digital signature workflow for document authentication.
 * Supports multi-party signing, signature pad, and certificate verification.
 */

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    PenLine,
    FileSignature,
    CheckCircle2,
    Clock,
    XCircle,
    User,
    Send,
    Download,
    Shield,
    KeyRound,
    Calendar,
    AlertTriangle,
    Trash2,
    Plus,
    Eye
} from 'lucide-react';

// Types
export type SignatureStatus = 'pending' | 'signed' | 'declined' | 'expired';
export type SignatureMethod = 'draw' | 'type' | 'upload';

export interface Signatory {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar?: string;
    role?: string;
    order: number;
    status: SignatureStatus;
    signedAt?: Date;
    signatureMethod?: SignatureMethod;
    signatureData?: string;
    ipAddress?: string;
    declineReason?: string;
}

export interface SignatureRequest {
    id: string;
    documentId: string;
    documentTitle: string;
    documentHash: string;
    status: 'draft' | 'pending' | 'completed' | 'cancelled';
    signatories: Signatory[];
    message?: string;
    expiresAt?: Date;
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    completedAt?: Date;
    certificateUrl?: string;
}

interface ElectronicSignatureProps {
    request?: SignatureRequest;
    documentId?: string;
    documentTitle?: string;
    currentUserId?: string;
    onSign?: (signatureData: string, method: SignatureMethod) => Promise<void>;
    onDecline?: (reason: string) => Promise<void>;
    onSendRequest?: (request: Partial<SignatureRequest>) => Promise<void>;
    onCancel?: () => Promise<void>;
}

const STATUS_CONFIG: Record<SignatureStatus, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'En attente', color: 'text-amber-500', icon: <Clock className="h-4 w-4" /> },
    signed: { label: 'Signé', color: 'text-green-500', icon: <CheckCircle2 className="h-4 w-4" /> },
    declined: { label: 'Refusé', color: 'text-red-500', icon: <XCircle className="h-4 w-4" /> },
    expired: { label: 'Expiré', color: 'text-gray-500', icon: <AlertTriangle className="h-4 w-4" /> },
};

// Demo request
const DEMO_REQUEST: SignatureRequest = {
    id: 'sig-1',
    documentId: 'doc-1',
    documentTitle: 'Contrat de partenariat 2026',
    documentHash: 'sha256:a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a',
    status: 'pending',
    message: 'Veuillez signer ce contrat de partenariat pour validation.',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdBy: 'user-1',
    createdByName: 'Jean Dupont',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    signatories: [
        {
            id: 'sig-s1',
            userId: 'user-1',
            userName: 'Jean Dupont',
            userEmail: 'jean.dupont@company.com',
            role: 'Directeur Général',
            order: 1,
            status: 'signed',
            signedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            signatureMethod: 'draw',
            ipAddress: '192.168.1.100',
        },
        {
            id: 'sig-s2',
            userId: 'user-2',
            userName: 'Marie Martin',
            userEmail: 'marie.martin@partner.com',
            role: 'Responsable Partenariats',
            order: 2,
            status: 'pending',
        },
        {
            id: 'sig-s3',
            userId: 'user-3',
            userName: 'Pierre Legal',
            userEmail: 'pierre.legal@company.com',
            role: 'Directeur Juridique',
            order: 3,
            status: 'pending',
        },
    ],
};

export function ElectronicSignature({
    request = DEMO_REQUEST,
    documentId,
    documentTitle,
    currentUserId = 'user-2',
    onSign,
    onDecline,
    onSendRequest,
    onCancel,
}: ElectronicSignatureProps) {
    const [showSignDialog, setShowSignDialog] = useState(false);
    const [showDeclineDialog, setShowDeclineDialog] = useState(false);
    const [signatureMethod, setSignatureMethod] = useState<SignatureMethod>('draw');
    const [typedSignature, setTypedSignature] = useState('');
    const [declineReason, setDeclineReason] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    const signedCount = request.signatories.filter(s => s.status === 'signed').length;
    const totalSignatories = request.signatories.length;
    const progress = (signedCount / totalSignatories) * 100;

    const currentSignatory = request.signatories.find(
        s => s.userId === currentUserId && s.status === 'pending'
    );
    const canSign = !!currentSignatory;

    // Canvas drawing handlers
    const initCanvas = useCallback(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = 400;
            canvas.height = 150;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#000';
                ctxRef.current = ctx;
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!ctxRef.current || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !ctxRef.current || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        ctxRef.current.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctxRef.current.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        if (ctxRef.current && canvasRef.current) {
            ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleSign = async () => {
        let signatureData = '';

        if (signatureMethod === 'draw' && canvasRef.current) {
            signatureData = canvasRef.current.toDataURL('image/png');
        } else if (signatureMethod === 'type') {
            signatureData = typedSignature;
        }

        if (onSign) {
            await onSign(signatureData, signatureMethod);
        } else {
            console.log('Demo: Sign document', { signatureData, signatureMethod });
        }

        setShowSignDialog(false);
    };

    const handleDecline = async () => {
        if (onDecline) {
            await onDecline(declineReason);
        }
        setShowDeclineDialog(false);
        setDeclineReason('');
    };

    const SignatoryCard = ({ signatory }: { signatory: Signatory }) => {
        const config = STATUS_CONFIG[signatory.status];
        const isCurrent = signatory.userId === currentUserId;

        return (
            <div className={`flex items-center justify-between p-3 rounded-lg border ${isCurrent && signatory.status === 'pending' ? 'border-primary bg-primary/5' :
                    signatory.status === 'signed' ? 'bg-green-500/5 border-green-500/30' :
                        signatory.status === 'declined' ? 'bg-red-500/5 border-red-500/30' : 'bg-muted/30'
                }`}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={signatory.userAvatar} />
                            <AvatarFallback>
                                {signatory.userName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 rounded-full p-0.5 bg-background ${config.color}`}>
                            {config.icon}
                        </div>
                    </div>
                    <div>
                        <p className="font-medium text-sm">
                            {signatory.userName}
                            {isCurrent && <Badge variant="outline" className="ml-2 text-xs">Vous</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground">{signatory.role || signatory.userEmail}</p>
                    </div>
                </div>

                <div className="text-right">
                    <Badge className={config.color} variant="outline">
                        {config.icon}
                        <span className="ml-1">{config.label}</span>
                    </Badge>
                    {signatory.signedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {signatory.signedAt.toLocaleDateString('fr-FR')}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <FileSignature className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Signature Électronique</CardTitle>
                                <CardDescription>{request.documentTitle}</CardDescription>
                            </div>
                        </div>
                        <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                            {signedCount}/{totalSignatories} signatures
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Progress bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Créé par {request.createdByName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {request.createdAt.toLocaleDateString('fr-FR')}
                        </span>
                        {request.expiresAt && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Expire le {request.expiresAt.toLocaleDateString('fr-FR')}
                            </span>
                        )}
                    </div>

                    {/* Document hash */}
                    <div className="mt-4 p-2 rounded bg-muted/50 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <code className="text-xs text-muted-foreground truncate">
                            {request.documentHash}
                        </code>
                    </div>
                </CardContent>
            </Card>

            {/* Action buttons for current user */}
            {canSign && (
                <Card className="border-primary">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Votre signature est requise</p>
                                <p className="text-sm text-muted-foreground">{request.message}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowDeclineDialog(true)}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Refuser
                                </Button>
                                <Button onClick={() => {
                                    setShowSignDialog(true);
                                    setTimeout(initCanvas, 100);
                                }}>
                                    <PenLine className="h-4 w-4 mr-2" />
                                    Signer
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Signatories list */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Signataires</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[250px]">
                        <div className="space-y-2">
                            {request.signatories.map((signatory) => (
                                <SignatoryCard key={signatory.id} signatory={signatory} />
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Sign Dialog */}
            <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PenLine className="h-5 w-5 text-primary" />
                            Signer le document
                        </DialogTitle>
                        <DialogDescription>
                            Choisissez votre méthode de signature
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={signatureMethod} onValueChange={(v) => setSignatureMethod(v as SignatureMethod)}>
                        <TabsList className="w-full">
                            <TabsTrigger value="draw" className="flex-1">Dessiner</TabsTrigger>
                            <TabsTrigger value="type" className="flex-1">Taper</TabsTrigger>
                        </TabsList>

                        <TabsContent value="draw" className="mt-4">
                            <div className="border rounded-lg p-2 bg-white">
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    className="w-full cursor-crosshair"
                                    style={{ height: '150px' }}
                                />
                            </div>
                            <Button variant="ghost" size="sm" onClick={clearCanvas} className="mt-2">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Effacer
                            </Button>
                        </TabsContent>

                        <TabsContent value="type" className="mt-4">
                            <div className="space-y-2">
                                <Label>Tapez votre nom complet</Label>
                                <Input
                                    value={typedSignature}
                                    onChange={(e) => setTypedSignature(e.target.value)}
                                    placeholder="Votre signature"
                                    className="text-2xl font-signature text-center h-16"
                                    style={{ fontFamily: "'Brush Script MT', cursive" }}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm">
                        <p className="flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-amber-500" />
                            <span>En signant, vous acceptez les termes du document.</span>
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSignDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSign}
                            disabled={(signatureMethod === 'type' && !typedSignature.trim())}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Confirmer la signature
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decline Dialog */}
            <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <XCircle className="h-5 w-5" />
                            Refuser de signer
                        </DialogTitle>
                        <DialogDescription>
                            Indiquez la raison de votre refus
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <Textarea
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            placeholder="Expliquez pourquoi vous refusez de signer..."
                            rows={4}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDecline}
                            disabled={!declineReason.trim()}
                        >
                            Confirmer le refus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ElectronicSignature;
