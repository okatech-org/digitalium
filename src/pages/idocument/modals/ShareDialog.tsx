/**
 * ShareDialog Component
 * Modal for sharing documents with permissions and expiration
 */

import React, { useState } from 'react';
import { format, addDays, addHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Copy, Check, Link2, Lock, Clock, Users, Shield, ExternalLink } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { shareDocument, SharePermission, ArchiveDocument, DocumentShare } from '@/lib/archiveService';

interface ShareDialogProps {
    document: ArchiveDocument | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onShareCreated?: (share: DocumentShare) => void;
}

type ExpirationPreset = '1h' | '24h' | '7d' | '30d' | 'never';

const EXPIRATION_PRESETS: { value: ExpirationPreset; label: string }[] = [
    { value: '1h', label: '1 heure' },
    { value: '24h', label: '24 heures' },
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: 'never', label: 'Jamais' },
];

const PERMISSION_OPTIONS: { value: SharePermission; label: string; description: string }[] = [
    { value: 'view', label: 'Visualiser', description: 'Peut voir le document' },
    { value: 'download', label: 'Télécharger', description: 'Peut voir et télécharger' },
    { value: 'edit', label: 'Modifier', description: 'Peut modifier les métadonnées' },
    { value: 'full', label: 'Complet', description: 'Accès complet' },
];

export function ShareDialog({ document, open, onOpenChange, onShareCreated }: ShareDialogProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Form state
    const [permission, setPermission] = useState<SharePermission>('view');
    const [expiration, setExpiration] = useState<ExpirationPreset>('7d');
    const [usePassword, setUsePassword] = useState(false);
    const [password, setPassword] = useState('');
    const [maxAccess, setMaxAccess] = useState<number | undefined>(undefined);

    const getExpirationDate = (preset: ExpirationPreset): Date | undefined => {
        const now = new Date();
        switch (preset) {
            case '1h': return addHours(now, 1);
            case '24h': return addHours(now, 24);
            case '7d': return addDays(now, 7);
            case '30d': return addDays(now, 30);
            case 'never': return undefined;
        }
    };

    const handleCreateShare = async () => {
        if (!document) return;

        setIsLoading(true);
        try {
            const share = await shareDocument(document.id, {
                permission,
                expiresAt: getExpirationDate(expiration),
                maxAccessCount: maxAccess,
                password: usePassword ? password : undefined,
            });

            // Generate share URL
            const baseUrl = window.location.origin;
            const shareUrl = `${baseUrl}/share/${share.share_token}`;
            setShareLink(shareUrl);

            toast({
                title: '🔗 Lien de partage créé',
                description: 'Le lien a été généré avec succès.',
            });

            onShareCreated?.(share);
        } catch (error) {
            toast({
                title: 'Erreur',
                description: error instanceof Error ? error.message : 'Échec du partage',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = async () => {
        if (!shareLink) return;

        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            toast({
                title: '📋 Copié !',
                description: 'Le lien a été copié dans le presse-papiers.',
            });
        } catch {
            toast({
                title: 'Erreur',
                description: 'Impossible de copier le lien',
                variant: 'destructive',
            });
        }
    };

    const handleClose = () => {
        setShareLink(null);
        setPassword('');
        setUsePassword(false);
        setCopied(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5" />
                        Partager le document
                    </DialogTitle>
                    <DialogDescription>
                        {document?.title || 'Document'}
                    </DialogDescription>
                </DialogHeader>

                {!shareLink ? (
                    <div className="space-y-6">
                        {/* Permission */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Permissions
                            </Label>
                            <Select value={permission} onValueChange={(v) => setPermission(v as SharePermission)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PERMISSION_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            <div>
                                                <span className="font-medium">{opt.label}</span>
                                                <span className="text-muted-foreground ml-2">- {opt.description}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Expiration */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Expiration
                            </Label>
                            <Select value={expiration} onValueChange={(v) => setExpiration(v as ExpirationPreset)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {EXPIRATION_PRESETS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {expiration !== 'never' && (
                                <p className="text-xs text-muted-foreground">
                                    Expire le {format(getExpirationDate(expiration)!, 'PPP à HH:mm', { locale: fr })}
                                </p>
                            )}
                        </div>

                        {/* Password protection */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2" htmlFor="use-password">
                                    <Lock className="w-4 h-4" />
                                    Protection par mot de passe
                                </Label>
                                <Switch
                                    id="use-password"
                                    checked={usePassword}
                                    onCheckedChange={setUsePassword}
                                />
                            </div>
                            {usePassword && (
                                <Input
                                    type="password"
                                    placeholder="Entrez un mot de passe"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            )}
                        </div>

                        {/* Max access count */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Nombre d'accès maximum (optionnel)
                            </Label>
                            <Input
                                type="number"
                                placeholder="Illimité"
                                min={1}
                                value={maxAccess || ''}
                                onChange={(e) => setMaxAccess(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                        </div>

                        <Button
                            onClick={handleCreateShare}
                            disabled={isLoading || (usePassword && !password)}
                            className="w-full"
                        >
                            {isLoading ? 'Création...' : 'Générer le lien de partage'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                            <Input
                                value={shareLink}
                                readOnly
                                className="flex-1 bg-transparent border-none focus-visible:ring-0"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCopyLink}
                                className="flex-shrink-0"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>• Permission: <strong>{PERMISSION_OPTIONS.find(o => o.value === permission)?.label}</strong></p>
                            <p>• Expire: <strong>{expiration === 'never' ? 'Jamais' : EXPIRATION_PRESETS.find(p => p.value === expiration)?.label}</strong></p>
                            {usePassword && <p>• 🔒 Protégé par mot de passe</p>}
                            {maxAccess && <p>• Limité à {maxAccess} accès</p>}
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleClose} className="flex-1">
                                Fermer
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => window.open(shareLink, '_blank')}
                                className="flex-1"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ouvrir
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
