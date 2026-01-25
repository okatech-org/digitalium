/**
 * ProDashboard - Central hub with overview of all three functions
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    Archive,
    PenTool,
    HardDrive,
    Users,
    Activity,
    Clock,
    AlertTriangle,
    ChevronRight,
    Plus,
    Upload,
    Send,
    Folder,
    Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDesignTheme } from '@/contexts/DesignThemeContext';

// Mock data - will be replaced with real hooks
const MOCK_STATS = {
    storage: { used: 234, total: 500, unit: 'GB' },
    documents: 1247,
    archived: 8432,
    signatures: { pending: 5, thisMonth: 89 },
    team: 12,
};

const MOCK_ACTIVITY = [
    { id: 1, user: 'Jean', action: 'a signé', doc: 'Contrat Client XYZ', module: 'iSignature', time: 'Il y a 5 min' },
    { id: 2, user: 'Marie', action: 'a archivé', doc: '15 factures janvier', module: 'iArchive', time: 'Il y a 15 min' },
    { id: 3, user: 'Paul', action: 'a créé', doc: 'Budget Q1 2026', module: 'iDocument', time: 'Il y a 1h' },
    { id: 4, user: 'Sophie', action: 'a partagé', doc: 'Rapport annuel', module: 'iDocument', time: 'Il y a 2h' },
    { id: 5, user: 'Vous', action: 'avez envoyé à signature', doc: 'Avenant contrat', module: 'iSignature', time: 'Il y a 3h' },
];

const MOCK_ALERTS = [
    { id: 1, type: 'warning', message: '5 signatures en attente de votre part', module: 'iSignature', href: '/pro/isignature' },
    { id: 2, type: 'info', message: '12 documents arrivent à expiration', module: 'iArchive', href: '/pro/iarchive' },
    { id: 3, type: 'warning', message: 'Quota stockage à 85%', module: 'storage', href: '/billing-pro' },
];

const MODULE_CONFIG = {
    iDocument: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: FileText },
    iArchive: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: Archive },
    iSignature: { color: 'text-purple-500', bg: 'bg-purple-500/10', icon: PenTool },
    storage: { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: HardDrive },
};

export default function ProDashboard() {
    const storagePercent = (MOCK_STATS.storage.used / MOCK_STATS.storage.total) * 100;
    const { designTheme } = useDesignTheme();

    // Theme-specific card styling
    const getThemeCardClass = () => {
        switch (designTheme) {
            case 'classic':
                return 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/80 dark:border-slate-600/60 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300';
            case 'vintage3d':
                return 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-600 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300';
            default:
                return '';
        }
    };

    const themeCardClass = getThemeCardClass();

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Vue d'ensemble</h1>
                    <p className="text-muted-foreground">Bienvenue dans votre espace Pro</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to="/team">
                            <Users className="h-4 w-4 mr-2" />
                            {MOCK_STATS.team} membres
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Storage */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className={themeCardClass}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-orange-500/10">
                                    <HardDrive className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Stockage</p>
                                    <p className="text-xl font-bold">{MOCK_STATS.storage.used} / {MOCK_STATS.storage.total} GB</p>
                                </div>
                            </div>
                            <Progress value={storagePercent} className="h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* iDocument */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Link to="/pro/idocument">
                        <Card className={cn(themeCardClass, "hover:border-blue-500/50 transition-colors cursor-pointer group")}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/10 group-hover:scale-110 transition-transform">
                                            <FileText className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">iDocument</p>
                                            <p className="text-xl font-bold">{MOCK_STATS.documents.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>

                {/* iArchive */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Link to="/pro/iarchive">
                        <Card className={cn(themeCardClass, "hover:border-emerald-500/50 transition-colors cursor-pointer group")}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:scale-110 transition-transform">
                                            <Archive className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">iArchive</p>
                                            <p className="text-xl font-bold">{MOCK_STATS.archived.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>

                {/* iSignature */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Link to="/pro/isignature">
                        <Card className={cn(themeCardClass, "hover:border-purple-500/50 transition-colors cursor-pointer group")}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-purple-500/10 group-hover:scale-110 transition-transform">
                                            <PenTool className="h-5 w-5 text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">iSignature</p>
                                            <p className="text-xl font-bold">{MOCK_STATS.signatures.thisMonth} ce mois</p>
                                        </div>
                                    </div>
                                    {MOCK_STATS.signatures.pending > 0 && (
                                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-500">
                                            {MOCK_STATS.signatures.pending} en attente
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>
            </div>

            {/* Quick Actions & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card className={cn(themeCardClass, "lg:col-span-1")}>
                    <CardHeader>
                        <CardTitle className="text-lg">Actions rapides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start gap-3" asChild>
                            <Link to="/pro/idocument?action=new">
                                <Plus className="h-4 w-4 text-blue-500" />
                                <span>Créer un document</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-3" asChild>
                            <Link to="/pro/iarchive?action=import">
                                <Upload className="h-4 w-4 text-emerald-500" />
                                <span>Archiver un lot</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-3" asChild>
                            <Link to="/pro/isignature?action=new">
                                <Send className="h-4 w-4 text-purple-500" />
                                <span>Envoyer à signature</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-3" asChild>
                            <Link to="/pro/idocument/templates">
                                <Folder className="h-4 w-4" />
                                <span>Voir les modèles</span>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Activity Timeline */}
                <Card className={cn(themeCardClass, "lg:col-span-2")}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Activité récente</CardTitle>
                        <Button variant="ghost" size="sm">
                            Voir tout
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[220px]">
                            <div className="space-y-4">
                                {MOCK_ACTIVITY.map((activity) => {
                                    const config = MODULE_CONFIG[activity.module as keyof typeof MODULE_CONFIG];
                                    const Icon = config.icon;

                                    return (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-start gap-3"
                                        >
                                            <div className={cn('p-1.5 rounded-lg', config.bg)}>
                                                <Icon className={cn('h-4 w-4', config.color)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm">
                                                    <span className="font-medium">{activity.user}</span>
                                                    {' '}{activity.action}{' '}
                                                    <span className="font-medium">"{activity.doc}"</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {activity.time}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts */}
            {MOCK_ALERTS.length > 0 && (
                <Card className={cn(themeCardClass, "border-orange-500/30")}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Alertes et notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {MOCK_ALERTS.map((alert) => {
                                const config = MODULE_CONFIG[alert.module as keyof typeof MODULE_CONFIG] || MODULE_CONFIG.storage;
                                const Icon = config.icon;

                                return (
                                    <Link
                                        key={alert.id}
                                        to={alert.href}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className={cn('p-2 rounded-lg', config.bg)}>
                                            <Icon className={cn('h-4 w-4', config.color)} />
                                        </div>
                                        <span className="flex-1 text-sm">{alert.message}</span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Module Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* iDocument Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className={cn(themeCardClass, "h-full border-blue-500/20 hover:border-blue-500/40 transition-colors")}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-blue-500/10">
                                    <FileText className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle>iDocument</CardTitle>
                                    <CardDescription>Documents collaboratifs</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Créez, éditez et partagez vos documents de travail avec votre équipe.
                            </p>
                            <div className="flex gap-2">
                                <Badge variant="secondary">Collaboration</Badge>
                                <Badge variant="secondary">Workflows</Badge>
                            </div>
                            <Button className="w-full bg-blue-500 hover:bg-blue-600" asChild>
                                <Link to="/pro/idocument">
                                    Ouvrir iDocument
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* iArchive Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card className={cn(themeCardClass, "h-full border-emerald-500/20 hover:border-emerald-500/40 transition-colors")}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-emerald-500/10">
                                    <Archive className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div>
                                    <CardTitle>iArchive</CardTitle>
                                    <CardDescription>Archivage légal</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Conservez vos documents avec intégrité garantie et conformité légale.
                            </p>
                            <div className="flex gap-2">
                                <Badge variant="secondary">Conformité</Badge>
                                <Badge variant="secondary">SHA-256</Badge>
                            </div>
                            <Button className="w-full bg-emerald-500 hover:bg-emerald-600" asChild>
                                <Link to="/pro/iarchive">
                                    Ouvrir iArchive
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* iSignature Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Card className={cn(themeCardClass, "h-full border-purple-500/20 hover:border-purple-500/40 transition-colors")}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-purple-500/10">
                                    <PenTool className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                    <CardTitle>iSignature</CardTitle>
                                    <CardDescription>Signature électronique</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Envoyez vos documents à signature et suivez les validations en temps réel.
                            </p>
                            <div className="flex gap-2">
                                <Badge variant="secondary">Multi-signataires</Badge>
                                <Badge variant="secondary">Certifié</Badge>
                            </div>
                            <Button className="w-full bg-purple-500 hover:bg-purple-600" asChild>
                                <Link to="/pro/isignature">
                                    Ouvrir iSignature
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
