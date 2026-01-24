/**
 * DepositCertificate - Generate and display deposit certificates
 * Provides legal proof of document archiving
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Award,
    Download,
    Share2,
    CheckCircle2,
    Shield,
    Calendar,
    Hash,
    FileText,
    Building2,
    User,
    Clock,
    Printer,
    ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface CertificateData {
    certificateId: string;
    documentId: string;
    documentTitle: string;
    documentCategory: string;
    hashSHA256: string;
    depositDate: number;
    depositorName: string;
    depositorEmail: string;
    organizationName?: string;
    retentionEndDate: number;
    legalBasis: string;
    verificationUrl?: string;
}

interface DepositCertificateProps {
    certificate: CertificateData;
    onDownload?: () => void;
    onShare?: () => void;
    variant?: 'compact' | 'full';
}

function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatShortDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

// Generate QR-like verification code
function generateVerificationCode(certificateId: string): string {
    return certificateId.substring(0, 4).toUpperCase() + '-' +
        certificateId.substring(4, 8).toUpperCase() + '-' +
        certificateId.substring(8, 12).toUpperCase();
}

export function DepositCertificate({
    certificate,
    onDownload,
    onShare,
    variant = 'compact',
}: DepositCertificateProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const verificationCode = generateVerificationCode(certificate.certificateId);

    if (variant === 'compact') {
        return (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow group">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                                    <Award className="h-5 w-5 text-amber-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">
                                        Certificat de dépôt
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {formatShortDate(certificate.depositDate)}
                                    </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {verificationCode}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-500" />
                            Certificat de Dépôt Numérique
                        </DialogTitle>
                    </DialogHeader>
                    <CertificateContent
                        certificate={certificate}
                        onDownload={onDownload}
                        onShare={onShare}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <CertificateContent
            certificate={certificate}
            onDownload={onDownload}
            onShare={onShare}
        />
    );
}

function CertificateContent({
    certificate,
    onDownload,
    onShare,
}: {
    certificate: CertificateData;
    onDownload?: () => void;
    onShare?: () => void;
}) {
    const verificationCode = generateVerificationCode(certificate.certificateId);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-xl p-6 border border-amber-500/20">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-amber-500/20">
                            <Award className="h-8 w-8 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Certificat de Dépôt</h2>
                            <p className="text-sm text-muted-foreground">
                                République Gabonaise • DIGITALIUM Archive
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Valide
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                            Code : {verificationCode}
                        </p>
                    </div>
                </div>
            </div>

            {/* Document Info */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Document archivé
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Titre</span>
                            <p className="font-medium">{certificate.documentTitle}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Catégorie</span>
                            <p className="font-medium capitalize">{certificate.documentCategory}</p>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                            <Hash className="h-3 w-3" />
                            Empreinte SHA-256
                        </div>
                        <code className="block text-xs font-mono bg-muted rounded px-3 py-2 break-all">
                            {certificate.hashSHA256}
                        </code>
                    </div>
                </CardContent>
            </Card>

            {/* Deposit Details */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-xs text-muted-foreground">Date de dépôt</p>
                                <p className="font-medium text-sm">
                                    {formatDate(certificate.depositDate)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-orange-500" />
                            <div>
                                <p className="text-xs text-muted-foreground">Conservation jusqu'au</p>
                                <p className="font-medium text-sm">
                                    {formatShortDate(certificate.retentionEndDate)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Depositor */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <User className="h-5 w-5 text-purple-500" />
                            <div>
                                <p className="text-xs text-muted-foreground">Déposant</p>
                                <p className="font-medium text-sm">{certificate.depositorName}</p>
                                <p className="text-xs text-muted-foreground">{certificate.depositorEmail}</p>
                            </div>
                        </div>
                        {certificate.organizationName && (
                            <div className="flex items-center gap-3">
                                <Building2 className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Organisation</p>
                                    <p className="font-medium text-sm">{certificate.organizationName}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Legal Basis */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                        <p className="font-medium">Base légale</p>
                        <p className="text-muted-foreground">{certificate.legalBasis}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button onClick={onDownload} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger PDF
                </Button>
                <Button variant="outline" onClick={onShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                </Button>
                <Button variant="outline" size="icon">
                    <Printer className="h-4 w-4" />
                </Button>
            </div>

            {/* Verification Link */}
            {certificate.verificationUrl && (
                <div className="text-center text-xs text-muted-foreground">
                    <a
                        href={certificate.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                        Vérifier l'authenticité
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
            )}
        </motion.div>
    );
}

/**
 * CertificateGenerator - Generate new deposit certificates
 */
export function generateCertificate(
    document: {
        id: string;
        title: string;
        category: string;
        hashSHA256: string;
    },
    depositor: {
        name: string;
        email: string;
        organization?: string;
    },
    retentionYears: number,
    legalBasis: string
): CertificateData {
    const now = Date.now();
    const retentionMs = retentionYears * 365 * 24 * 60 * 60 * 1000;

    return {
        certificateId: crypto.randomUUID().replace(/-/g, ''),
        documentId: document.id,
        documentTitle: document.title,
        documentCategory: document.category,
        hashSHA256: document.hashSHA256,
        depositDate: now,
        depositorName: depositor.name,
        depositorEmail: depositor.email,
        organizationName: depositor.organization,
        retentionEndDate: now + retentionMs,
        legalBasis,
        verificationUrl: `https://verify.digitalium.ga/cert/${crypto.randomUUID().substring(0, 12)}`,
    };
}

export default DepositCertificate;
