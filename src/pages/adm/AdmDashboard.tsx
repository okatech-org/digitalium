/**
 * AdmDashboard - Dashboard for Administration organizations
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ScrollText,
    Archive,
    Scale,
    HardDrive,
    Users,
    Clock,
    ChevronRight,
    Upload,
    FileSignature,
    Inbox,
    FolderOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Mock data
const MOCK_STATS = {
    storage: { used: 456, total: 1000, unit: 'GB' },
    courriers: 3842,
    archives: 24567,
    signatures: { pending: 12, thisMonth: 156 },
    agents: 48,
};

const MOCK_ACTIVITY = [
    { id: 1, user: 'Dir. Cabinet', action: 'a signé', doc: 'Arrêté ministériel N°2026-012', module: 'Parapheur', time: 'Il y a 10 min' },
    { id: 2, user: 'SG', action: 'a archivé', doc: 'Procès-verbal séance plénière', module: 'Archives', time: 'Il y a 30 min' },
    { id: 3, user: 'DAF', action: 'a transmis', doc: 'Budget exercice 2026', module: 'Courrier', time: 'Il y a 1h' },
    { id: 4, user: 'DRH', action: 'a validé', doc: 'Dossiers recrutement Q1', module: 'Parapheur', time: 'Il y a 2h' },
];

export default function AdmDashboard() {
    const storagePercent = (MOCK_STATS.storage.used / MOCK_STATS.storage.total) * 100;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Tableau de Bord</h1>
                    <p className="text-muted-foreground">Gestion institutionnelle</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to="/adm/team">
                            <Users className="h-4 w-4 mr-2" />
                            {MOCK_STATS.agents} agents
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Storage */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
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

                {/* Courrier Officiel */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Link to="/adm/idocument">
                        <Card className="hover:border-sky-500/50 transition-colors cursor-pointer group">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-sky-500/10 group-hover:scale-110 transition-transform">
                                            <ScrollText className="h-5 w-5 text-sky-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Courrier Officiel</p>
                                            <p className="text-xl font-bold">{MOCK_STATS.courriers.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-sky-500 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>

                {/* Archives */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Link to="/adm/iarchive">
                        <Card className="hover:border-amber-500/50 transition-colors cursor-pointer group">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-amber-500/10 group-hover:scale-110 transition-transform">
                                            <Archive className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Archives Légales</p>
                                            <p className="text-xl font-bold">{MOCK_STATS.archives.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>

                {/* Parapheur */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Link to="/adm/isignature">
                        <Card className="hover:border-red-500/50 transition-colors cursor-pointer group">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-red-500/10 group-hover:scale-110 transition-transform">
                                            <Scale className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Parapheur</p>
                                            <p className="text-xl font-bold">{MOCK_STATS.signatures.thisMonth} ce mois</p>
                                        </div>
                                    </div>
                                    {MOCK_STATS.signatures.pending > 0 && (
                                        <Badge variant="secondary" className="bg-red-500/20 text-red-500">
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
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Actions rapides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start gap-3" asChild>
                            <Link to="/adm/idocument?action=new">
                                <Inbox className="h-4 w-4 text-sky-500" />
                                <span>Nouveau courrier</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-3" asChild>
                            <Link to="/adm/iarchive/upload">
                                <Upload className="h-4 w-4 text-amber-500" />
                                <span>Archiver des documents</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-3" asChild>
                            <Link to="/adm/isignature">
                                <FileSignature className="h-4 w-4 text-red-500" />
                                <span>Ouvrir le parapheur</span>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Activity Timeline */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Activité récente</CardTitle>
                        <Button variant="ghost" size="sm">
                            Voir tout
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {MOCK_ACTIVITY.map((activity) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="p-1.5 rounded-lg bg-amber-500/10">
                                        <FolderOpen className="h-4 w-4 text-amber-500" />
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
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Module Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-sky-500/20 hover:border-sky-500/40 transition-colors">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-sky-500/10">
                                <ScrollText className="h-6 w-6 text-sky-500" />
                            </div>
                            <div>
                                <CardTitle>Courrier Officiel</CardTitle>
                                <CardDescription>Gestion des correspondances</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Créez, suivez et archivez vos courriers officiels entrants et sortants.
                        </p>
                        <Button className="w-full bg-sky-500 hover:bg-sky-600" asChild>
                            <Link to="/adm/idocument">
                                Accéder
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-amber-500/20 hover:border-amber-500/40 transition-colors">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-amber-500/10">
                                <Archive className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <CardTitle>Archives Légales</CardTitle>
                                <CardDescription>Conservation permanente</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Archivage légal conforme aux exigences des Archives Nationales.
                        </p>
                        <Button className="w-full bg-amber-500 hover:bg-amber-600" asChild>
                            <Link to="/adm/iarchive">
                                Accéder
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-red-500/20 hover:border-red-500/40 transition-colors">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-red-500/10">
                                <Scale className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <CardTitle>Parapheur</CardTitle>
                                <CardDescription>Signature hiérarchique</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Circuit de validation et signature électronique institutionnelle.
                        </p>
                        <Button className="w-full bg-red-500 hover:bg-red-600" asChild>
                            <Link to="/adm/isignature">
                                Accéder
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
