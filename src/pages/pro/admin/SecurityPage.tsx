/**
 * SecurityPage - Sécurité
 * Security settings, 2FA, sessions, and audit
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Lock,
    Smartphone,
    Key,
    Globe,
    Clock,
    AlertTriangle,
    Check,
    X,
    LogOut,
    Monitor,
    Laptop,
    Tablet,
    RefreshCw,
    Eye,
    EyeOff,
    Mail,
    History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface Session {
    id: string;
    device: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    location: string;
    ip: string;
    lastActiveAt: number;
    isCurrent: boolean;
}

const MOCK_SESSIONS: Session[] = [
    {
        id: '1',
        device: 'MacBook Pro',
        deviceType: 'desktop',
        browser: 'Chrome 120',
        location: 'Libreville, Gabon',
        ip: '197.214.xx.xx',
        lastActiveAt: Date.now() - 5 * 60 * 1000,
        isCurrent: true,
    },
    {
        id: '2',
        device: 'iPhone 15 Pro',
        deviceType: 'mobile',
        browser: 'Safari Mobile',
        location: 'Libreville, Gabon',
        ip: '197.214.xx.xx',
        lastActiveAt: Date.now() - 2 * 60 * 60 * 1000,
        isCurrent: false,
    },
    {
        id: '3',
        device: 'Windows PC',
        deviceType: 'desktop',
        browser: 'Edge 119',
        location: 'Port-Gentil, Gabon',
        ip: '41.158.xx.xx',
        lastActiveAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        isCurrent: false,
    },
];

const SECURITY_LOG = [
    { action: 'Connexion réussie', time: '2 min', location: 'Libreville', success: true },
    { action: 'Mot de passe modifié', time: '3 jours', location: 'Libreville', success: true },
    { action: 'Tentative de connexion échouée', time: '5 jours', location: 'Paris', success: false },
    { action: 'Nouvelle session', time: '1 semaine', location: 'Port-Gentil', success: true },
];

export default function SecurityPage() {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [sessions, setSessions] = useState(MOCK_SESSIONS);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const revokeSession = (sessionId: string) => {
        setSessions(sessions.filter(s => s.id !== sessionId));
    };

    const revokeAllOtherSessions = () => {
        setSessions(sessions.filter(s => s.isCurrent));
    };

    const getDeviceIcon = (type: Session['deviceType']) => {
        switch (type) {
            case 'mobile': return Smartphone;
            case 'tablet': return Tablet;
            default: return Laptop;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Sécurité</h1>
                <p className="text-muted-foreground">
                    Protégez votre compte et vos données
                </p>
            </div>

            {/* Security Score */}
            <Card className="border-green-500/30 bg-gradient-to-r from-green-500/5 to-transparent">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-500/20">
                            <Shield className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold">Score de sécurité: Excellent</h2>
                                <Badge className="bg-green-500/20 text-green-500">95/100</Badge>
                            </div>
                            <p className="text-muted-foreground">
                                Votre compte est bien protégé. Continuez à maintenir ces bonnes pratiques.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
                {/* Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Mot de passe
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Dernier changement</p>
                                <p className="text-sm text-muted-foreground">Il y a 3 jours</p>
                            </div>
                            <Badge className="bg-green-500/10 text-green-500">Récent</Badge>
                        </div>
                        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    <Key className="h-4 w-4 mr-2" />
                                    Modifier le mot de passe
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Modifier le mot de passe</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Mot de passe actuel</Label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nouveau mot de passe</Label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirmer le nouveau mot de passe</Label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}>
                                        Enregistrer
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                {/* Two-Factor */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Authentification à deux facteurs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">2FA Activé</p>
                                <p className="text-sm text-muted-foreground">Via application d'authentification</p>
                            </div>
                            <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                        </div>
                        <Button variant="outline" className="w-full">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Régénérer les codes de secours
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Notifications de sécurité
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Alertes par email</p>
                                <p className="text-sm text-muted-foreground">
                                    Recevoir un email lors de nouvelles connexions
                                </p>
                            </div>
                            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Connexions suspectes</p>
                                <p className="text-sm text-muted-foreground">
                                    Alerte si connexion depuis un nouvel appareil ou localisation
                                </p>
                            </div>
                            <Switch checked={true} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Sessions actives
                        </CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={revokeAllOtherSessions}
                            disabled={sessions.length <= 1}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Déconnecter les autres
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sessions.map((session) => {
                            const DeviceIcon = getDeviceIcon(session.deviceType);
                            return (
                                <div
                                    key={session.id}
                                    className={cn(
                                        'flex items-center justify-between p-3 rounded-lg border',
                                        session.isCurrent && 'border-primary/50 bg-primary/5'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-muted rounded-lg">
                                            <DeviceIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{session.device}</span>
                                                {session.isCurrent && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Session actuelle
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {session.browser} • {session.location} • {session.ip}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground">
                                            {session.isCurrent
                                                ? 'En ligne'
                                                : `Actif il y a ${Math.round((Date.now() - session.lastActiveAt) / (1000 * 60 * 60))}h`
                                            }
                                        </span>
                                        {!session.isCurrent && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => revokeSession(session.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Security Log */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Journal de sécurité
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {SECURITY_LOG.map((log, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={cn(
                                    'p-2 rounded-full',
                                    log.success ? 'bg-green-500/10' : 'bg-red-500/10'
                                )}>
                                    {log.success
                                        ? <Check className="h-4 w-4 text-green-500" />
                                        : <X className="h-4 w-4 text-red-500" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{log.action}</p>
                                    <p className="text-xs text-muted-foreground">{log.location}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
