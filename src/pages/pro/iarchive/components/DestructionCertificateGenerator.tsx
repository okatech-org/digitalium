/**
 * DestructionCertificateGenerator Component
 * 
 * Generates legal certificates when documents are definitively destroyed.
 * The certificate serves as proof that a document was properly destroyed
 * according to retention policies and legal requirements.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    FileWarning,
    ShieldCheck,
    Download,
    Share2,
    Copy,
    QrCode,
    Hash,
    Calendar,
    Clock,
    User,
    Building,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Printer,
    ExternalLink
} from 'lucide-react';
import QRCode from 'react-qr-code';

// Types
export interface DocumentToDestroy {
    id: string;
    title: string;
    reference?: string;
    hash: string;
    type: string;
    sizeBytes: number;
    createdAt: Date;
    retentionYears: number;
    expirationDate: Date;
}

export interface DestructionCertificate {
    certificateNumber: string;
    documentTitle: string;
    documentReference?: string;
    documentHash: string;
    documentType: string;
    documentSizeBytes: number;
    documentCreatedAt: Date;
    retentionYears: number;
    retentionExpiredAt: Date;
    destructionReason: string;
    destructionMethod: string;
    destructionAuthorizedBy: string;
    destructionAuthorizedByName: string;
    verificationHash: string;
    qrVerificationCode: string;
    createdAt: Date;
    organizationName?: string;
}

interface DestructionCertificateGeneratorProps {
    document?: DocumentToDestroy;
    onGenerateCertificate?: (document: DocumentToDestroy, reason: string, method: string) => Promise<DestructionCertificate>;
    existingCertificate?: DestructionCertificate;
}

const DESTRUCTION_METHODS = [
    { value: 'secure_delete', label: 'Suppression sécurisée', description: 'Effacement logique avec écrasement' },
    { value: 'shred', label: 'Broyage numérique', description: 'Multiple passes d\'écrasement (DoD 5220.22-M)' },
    { value: 'crypto_erase', label: 'Effacement cryptographique', description: 'Destruction de la clé de chiffrement' },
];

const DESTRUCTION_REASONS = [
    'Fin de période de rétention légale',
    'Demande RGPD (droit à l\'oubli)',
    'Document obsolète',
    'Document erroné',
    'Fusion/Consolidation de documents',
    'Autre (préciser)',
];

// Demo document
const DEMO_DOCUMENT: DocumentToDestroy = {
    id: 'doc-demo-1',
    title: 'Contrat de service 2020-2024',
    reference: 'CTR-2020-0042',
    hash: '7a8e9c3f1b2d4e6a8c0b2d4f6e8a0c2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c',
    type: 'contract',
    sizeBytes: 2458624,
    createdAt: new Date('2020-01-15'),
    retentionYears: 5,
    expirationDate: new Date('2025-01-15'),
};

const DEMO_CERTIFICATE: DestructionCertificate = {
    certificateNumber: 'DC-20260129-a1b2c3d4',
    documentTitle: 'Contrat de service 2020-2024',
    documentReference: 'CTR-2020-0042',
    documentHash: '7a8e9c3f1b2d4e6a8c0b2d4f6e8a0c2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c',
    documentType: 'contract',
    documentSizeBytes: 2458624,
    documentCreatedAt: new Date('2020-01-15'),
    retentionYears: 5,
    retentionExpiredAt: new Date('2025-01-15'),
    destructionReason: 'Fin de période de rétention légale',
    destructionMethod: 'shred',
    destructionAuthorizedBy: 'user-admin-1',
    destructionAuthorizedByName: 'Marie Administrateur',
    verificationHash: 'e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c7a8e9c3f1b2d4e6a8c0b2d4f6e8a0c2',
    qrVerificationCode: 'DIGI-DC-20260129-A1B2C3',
    createdAt: new Date(),
    organizationName: 'Digitalium SA',
};

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function DestructionCertificateGenerator({
    document = DEMO_DOCUMENT,
    onGenerateCertificate,
    existingCertificate,
}: DestructionCertificateGeneratorProps) {
    const [showGenerateDialog, setShowGenerateDialog] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('secure_delete');
    const [isGenerating, setIsGenerating] = useState(false);
    const [certificate, setCertificate] = useState<DestructionCertificate | null>(existingCertificate || null);
    const [showCertificateView, setShowCertificateView] = useState(!!existingCertificate);

    const handleGenerate = async () => {
        setIsGenerating(true);

        const reason = selectedReason === 'Autre (préciser)' ? customReason : selectedReason;

        if (onGenerateCertificate) {
            const newCert = await onGenerateCertificate(document, reason, selectedMethod);
            setCertificate(newCert);
        } else {
            // Demo mode
            await new Promise(resolve => setTimeout(resolve, 1500));
            setCertificate({
                ...DEMO_CERTIFICATE,
                documentTitle: document.title,
                documentReference: document.reference,
                documentHash: document.hash,
                destructionReason: reason,
                destructionMethod: selectedMethod,
                createdAt: new Date(),
            });
        }

        setIsGenerating(false);
        setShowGenerateDialog(false);
        setShowCertificateView(true);
    };

    const handleCopyHash = (hash: string) => {
        navigator.clipboard.writeText(hash);
    };

    const handleDownload = () => {
        // In production, this would generate a PDF
        console.log('Downloading certificate as PDF...');
        alert('Dans une implémentation complète, cela téléchargerait le certificat en PDF.');
    };

    const handlePrint = () => {
        window.print();
    };

    const CertificateView = ({ cert }: { cert: DestructionCertificate }) => (
        <Card className="border-2 border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-amber-500/10">
                            <ShieldCheck className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <CardTitle>Certificat de Destruction</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="font-mono">
                                    {cert.certificateNumber}
                                </Badge>
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={handlePrint}>
                            <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleDownload}>
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Document Info */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Document Détruit
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Titre:</span>
                            <p className="font-medium">{cert.documentTitle}</p>
                        </div>
                        {cert.documentReference && (
                            <div>
                                <span className="text-muted-foreground">Référence:</span>
                                <p className="font-medium">{cert.documentReference}</p>
                            </div>
                        )}
                        <div>
                            <span className="text-muted-foreground">Type:</span>
                            <p className="font-medium capitalize">{cert.documentType}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Taille:</span>
                            <p className="font-medium">{formatBytes(cert.documentSizeBytes)}</p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Hash Info */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Empreinte Numérique
                    </h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                            <code className="text-xs font-mono text-muted-foreground truncate flex-1">
                                {cert.documentHash}
                            </code>
                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={() => handleCopyHash(cert.documentHash)}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            SHA-256 - Cette empreinte garantit l'identité unique du document détruit
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Retention Info */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Période de Conservation
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Archivé le:</span>
                            <p className="font-medium">{cert.documentCreatedAt.toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Durée:</span>
                            <p className="font-medium">{cert.retentionYears} ans</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Expiration:</span>
                            <p className="font-medium">{cert.retentionExpiredAt.toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Destruction Info */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <FileWarning className="h-4 w-4" />
                        Détails de la Destruction
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Date:</span>
                            <p className="font-medium">{cert.createdAt.toLocaleDateString('fr-FR')} à {cert.createdAt.toLocaleTimeString('fr-FR')}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Méthode:</span>
                            <p className="font-medium">{DESTRUCTION_METHODS.find(m => m.value === cert.destructionMethod)?.label}</p>
                        </div>
                        <div className="col-span-2">
                            <span className="text-muted-foreground">Raison:</span>
                            <p className="font-medium">{cert.destructionReason}</p>
                        </div>
                        <div className="col-span-2">
                            <span className="text-muted-foreground">Autorisé par:</span>
                            <p className="font-medium flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {cert.destructionAuthorizedByName}
                                {cert.organizationName && (
                                    <>
                                        <span className="text-muted-foreground">•</span>
                                        <Building className="h-4 w-4" />
                                        {cert.organizationName}
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Verification */}
                <div className="flex items-start justify-between">
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Vérification
                        </h4>
                        <div className="text-sm">
                            <p className="text-muted-foreground mb-1">Code de vérification:</p>
                            <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                                {cert.qrVerificationCode}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground max-w-xs">
                            Scannez le QR code ou utilisez ce code sur notre portail de vérification
                        </p>
                    </div>

                    <div className="p-3 bg-white rounded-lg">
                        <QRCode
                            value={`https://digitalium.ga/verify/${cert.qrVerificationCode}`}
                            size={100}
                            level="M"
                        />
                    </div>
                </div>

                {/* Legal Notice */}
                <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Avertissement légal:</p>
                    <p>
                        Ce certificat atteste que le document identifié ci-dessus a été définitivement
                        détruit conformément à la politique de conservation des documents et aux
                        réglementations applicables. L'empreinte SHA-256 permet de vérifier que le
                        document détruit correspondait bien à l'original archivé.
                    </p>
                </div>
            </CardContent>
        </Card>
    );

    if (showCertificateView && certificate) {
        return (
            <div className="space-y-4">
                <Button variant="outline" onClick={() => setShowCertificateView(false)}>
                    ← Retour
                </Button>
                <CertificateView cert={certificate} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Document to be destroyed */}
            <Card className="border-red-500/30">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10">
                            <FileWarning className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <CardTitle className="text-base">{document.title}</CardTitle>
                            <CardDescription>
                                {document.reference && <span className="font-mono">{document.reference} • </span>}
                                {formatBytes(document.sizeBytes)} • Expire le {document.expirationDate.toLocaleDateString('fr-FR')}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <div>
                                <p className="text-sm font-medium">Destruction définitive</p>
                                <p className="text-xs text-muted-foreground">
                                    Un certificat sera généré comme preuve de destruction
                                </p>
                            </div>
                        </div>
                        <Button variant="destructive" onClick={() => setShowGenerateDialog(true)}>
                            <FileWarning className="h-4 w-4 mr-2" />
                            Détruire avec certificat
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Certificate generation dialog */}
            <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileWarning className="h-5 w-5 text-red-500" />
                            Générer un certificat de destruction
                        </DialogTitle>
                        <DialogDescription>
                            Ce certificat servira de preuve légale que le document a été correctement détruit.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="font-medium text-sm">{document.title}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-1">
                                SHA-256: {document.hash.substring(0, 16)}...
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Raison de la destruction</Label>
                            <Select value={selectedReason} onValueChange={setSelectedReason}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une raison" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DESTRUCTION_REASONS.map((reason) => (
                                        <SelectItem key={reason} value={reason}>
                                            {reason}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedReason === 'Autre (préciser)' && (
                                <Textarea
                                    placeholder="Précisez la raison..."
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                />
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Méthode de destruction</Label>
                            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DESTRUCTION_METHODS.map((method) => (
                                        <SelectItem key={method.value} value={method.value}>
                                            <div>
                                                <span>{method.label}</span>
                                                <span className="block text-xs text-muted-foreground">{method.description}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-500">Action irréversible</p>
                                    <p className="text-xs text-muted-foreground">
                                        Le document sera définitivement supprimé. Seul le certificat sera conservé
                                        comme preuve de sa destruction légale.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleGenerate}
                            disabled={isGenerating || !selectedReason || (selectedReason === 'Autre (préciser)' && !customReason)}
                        >
                            {isGenerating ? (
                                <>
                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                    Génération...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Détruire et générer certificat
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default DestructionCertificateGenerator;
