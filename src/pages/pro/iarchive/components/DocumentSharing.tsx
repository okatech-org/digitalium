/**
 * DocumentSharing - Secure document sharing components
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Share2,
    Link as LinkIcon,
    Mail,
    Copy,
    Check,
    Clock,
    Users,
    Eye,
    Download,
    Lock,
    Unlock,
    Shield,
    X,
    Calendar,
    QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export type SharePermission = 'view' | 'download' | 'edit';

export interface ShareLink {
    id: string;
    documentId: string;
    url: string;
    permission: SharePermission;
    expiresAt?: number;
    password?: string;
    maxViews?: number;
    viewCount: number;
    createdAt: number;
    createdBy: string;
    isActive: boolean;
}

export interface ShareRecipient {
    id: string;
    email: string;
    name?: string;
    permission: SharePermission;
    sharedAt: number;
    lastAccessedAt?: number;
}

interface ShareDialogProps {
    documentId: string;
    documentTitle: string;
    existingLinks?: ShareLink[];
    existingRecipients?: ShareRecipient[];
    onCreateLink?: (options: {
        permission: SharePermission;
        expiresAt?: number;
        password?: string;
        maxViews?: number;
    }) => Promise<ShareLink>;
    onShareByEmail?: (emails: string[], permission: SharePermission) => Promise<void>;
    onRevokeLink?: (linkId: string) => Promise<void>;
    onRevokeRecipient?: (recipientId: string) => Promise<void>;
    children?: React.ReactNode;
}

export function ShareDialog({
    documentId,
    documentTitle,
    existingLinks = [],
    existingRecipients = [],
    onCreateLink,
    onShareByEmail,
    onRevokeLink,
    onRevokeRecipient,
    children,
}: ShareDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'link' | 'email'>('link');
    const [permission, setPermission] = useState<SharePermission>('view');
    const [expiresIn, setExpiresIn] = useState<string>('7d');
    const [usePassword, setUsePassword] = useState(false);
    const [password, setPassword] = useState('');
    const [maxViews, setMaxViews] = useState<string>('');
    const [emails, setEmails] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

    const handleCreateLink = async () => {
        if (!onCreateLink) return;

        setIsLoading(true);
        try {
            const expiresAt = expiresIn === 'never'
                ? undefined
                : Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000;

            await onCreateLink({
                permission,
                expiresAt,
                password: usePassword ? password : undefined,
                maxViews: maxViews ? parseInt(maxViews) : undefined,
            });

            // Reset form
            setPassword('');
            setMaxViews('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShareByEmail = async () => {
        if (!onShareByEmail || !emails.trim()) return;

        setIsLoading(true);
        try {
            const emailList = emails.split(',').map(e => e.trim()).filter(Boolean);
            await onShareByEmail(emailList, permission);
            setEmails('');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (url: string, linkId: string) => {
        await navigator.clipboard.writeText(url);
        setCopiedLinkId(linkId);
        setTimeout(() => setCopiedLinkId(null), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Partager "{documentTitle}"
                    </DialogTitle>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex gap-2 border-b">
                    <button
                        onClick={() => setActiveTab('link')}
                        className={cn(
                            'pb-2 px-4 text-sm font-medium transition-colors',
                            activeTab === 'link'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <LinkIcon className="h-4 w-4 inline mr-2" />
                        Lien de partage
                    </button>
                    <button
                        onClick={() => setActiveTab('email')}
                        className={cn(
                            'pb-2 px-4 text-sm font-medium transition-colors',
                            activeTab === 'email'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Mail className="h-4 w-4 inline mr-2" />
                        Par email
                    </button>
                </div>

                {/* Content */}
                <div className="py-4">
                    {activeTab === 'link' ? (
                        <div className="space-y-4">
                            {/* Permission */}
                            <div className="space-y-2">
                                <Label>Permission</Label>
                                <Select value={permission} onValueChange={(v) => setPermission(v as SharePermission)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="view">
                                            <div className="flex items-center gap-2">
                                                <Eye className="h-4 w-4" />
                                                <span>Lecture seule</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="download">
                                            <div className="flex items-center gap-2">
                                                <Download className="h-4 w-4" />
                                                <span>Lecture + Téléchargement</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="edit">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>Modification</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Expiration */}
                            <div className="space-y-2">
                                <Label>Expiration</Label>
                                <Select value={expiresIn} onValueChange={setExpiresIn}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 jour</SelectItem>
                                        <SelectItem value="7">7 jours</SelectItem>
                                        <SelectItem value="30">30 jours</SelectItem>
                                        <SelectItem value="90">90 jours</SelectItem>
                                        <SelectItem value="never">Jamais</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Password */}
                            <div className="flex items-center justify-between">
                                <Label>Protéger par mot de passe</Label>
                                <Switch checked={usePassword} onCheckedChange={setUsePassword} />
                            </div>
                            {usePassword && (
                                <Input
                                    type="password"
                                    placeholder="Mot de passe..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            )}

                            {/* Max views */}
                            <div className="space-y-2">
                                <Label>Limite de vues (optionnel)</Label>
                                <Input
                                    type="number"
                                    placeholder="Illimité"
                                    value={maxViews}
                                    onChange={(e) => setMaxViews(e.target.value)}
                                />
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleCreateLink}
                                disabled={isLoading || (usePassword && !password)}
                            >
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Créer le lien
                            </Button>

                            {/* Existing links */}
                            {existingLinks.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">
                                            Liens actifs ({existingLinks.filter(l => l.isActive).length})
                                        </Label>
                                        {existingLinks.filter(l => l.isActive).map(link => (
                                            <ShareLinkItem
                                                key={link.id}
                                                link={link}
                                                onCopy={() => copyToClipboard(link.url, link.id)}
                                                onRevoke={() => onRevokeLink?.(link.id)}
                                                isCopied={copiedLinkId === link.id}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Adresses email (séparées par des virgules)</Label>
                                <Input
                                    placeholder="email@exemple.com, autre@exemple.com"
                                    value={emails}
                                    onChange={(e) => setEmails(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Permission</Label>
                                <Select value={permission} onValueChange={(v) => setPermission(v as SharePermission)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="view">Lecture seule</SelectItem>
                                        <SelectItem value="download">Lecture + Téléchargement</SelectItem>
                                        <SelectItem value="edit">Modification</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleShareByEmail}
                                disabled={isLoading || !emails.trim()}
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                Envoyer l'invitation
                            </Button>

                            {/* Existing recipients */}
                            {existingRecipients.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">
                                            Personnes avec accès ({existingRecipients.length})
                                        </Label>
                                        {existingRecipients.map(recipient => (
                                            <div
                                                key={recipient.id}
                                                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {recipient.name || recipient.email}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {recipient.email}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {recipient.permission}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive"
                                                        onClick={() => onRevokeRecipient?.(recipient.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ShareLinkItem({
    link,
    onCopy,
    onRevoke,
    isCopied,
}: {
    link: ShareLink;
    onCopy: () => void;
    onRevoke: () => void;
    isCopied: boolean;
}) {
    const isExpired = link.expiresAt && link.expiresAt < Date.now();

    return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <Badge variant={isExpired ? 'destructive' : 'secondary'} className="text-xs">
                        {link.permission}
                    </Badge>
                    {link.password && <Lock className="h-3 w-3 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">
                    {link.viewCount} vue{link.viewCount > 1 ? 's' : ''}
                    {link.expiresAt && !isExpired && (
                        <> • Expire le {new Date(link.expiresAt).toLocaleDateString('fr-FR')}</>
                    )}
                    {isExpired && <span className="text-destructive"> • Expiré</span>}
                </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCopy}>
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onRevoke}>
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}

/**
 * ShareBadge - Shows sharing status on a document
 */
export function ShareBadge({
    shareCount,
    onClick
}: {
    shareCount: number;
    onClick?: () => void;
}) {
    if (shareCount === 0) return null;

    return (
        <Badge
            variant="outline"
            className="cursor-pointer text-xs gap-1 hover:bg-muted"
            onClick={onClick}
        >
            <Users className="h-3 w-3" />
            {shareCount}
        </Badge>
    );
}

export default ShareDialog;
