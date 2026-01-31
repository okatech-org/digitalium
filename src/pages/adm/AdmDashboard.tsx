/**
 * AdmDashboard - Dashboard for Administration organizations
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
    Clock,
    ChevronRight,
    Upload,
    Send,
    Plus,
    FolderOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Mock data
const MOCK_STATS = {
    storage: { used: 456, total: 1000, unit: 'GB' },
    documents: 3842,
    archived: 24567,
    signatures: { pending: 12, thisMonth: 156 },
    agents: 48,
};

const MOCK_ACTIVITY = [
    { id: 1, user: 'Dir. Cabinet', action: 'a signé', doc: 'Arrêté ministériel N°2026-012', module: 'iSignature', time: 'Il y a 10 min' },
    { id: 2, user: 'SG', action: 'a archivé', doc: 'Procès-verbal séance plénière', module: 'iArchive', time: 'Il y a 30 min' },
    { id: 3, user: 'DAF', action: 'a transmis', doc: 'Budget exercice 2026', module: 'iDocument', time: 'Il y a 1h' },
    { id: 4, user: 'DRH', action: 'a validé', doc: 'Dossiers recrutement Q1', module: 'iSignature', time: 'Il y a 2h' },
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

                {/* iDocument */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Link to="/adm/idocument">
                        <Card className="hover:border-blue-500/50 transition-colors cursor-pointer group">
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
                    <Link to="/adm/iarchive">
                        <Card className="hover:border-emerald-500/50 transition-colors cursor-pointer group">
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
                    <Link to="/adm/isignature">
                        <Card className="hover:border-purple-500/50 transition-colors cursor-pointer group">
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
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Actions rapides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start gap-3" asChild>
                            <Link to="/adm/idocument?action=new">
                                <Plus className="h-4 w-4 text-blue-500" />
                                <span>Créer un document</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-3" asChild>
                            <Link to="/adm/iarchive?action=import">
                                <Upload className="h-4 w-4 text-emerald-500" />
                                <span>Archiver un lot</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-3" asChild>
                            <Link to="/adm/isignature?action=new">
                                <Send className="h-4 w-4 text-purple-500" />
                                <span>Envoyer à signature</span>
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
                                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                                        <FolderOpen className="h-4 w-4 text-blue-500" />
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
                <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors">
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
                        <Button className="w-full bg-blue-500 hover:bg-blue-600" asChild>
                            <Link to="/adm/idocument">
                                Ouvrir iDocument
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
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
                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600" asChild>
                            <Link to="/adm/iarchive">
                                Ouvrir iArchive
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors">
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
                        <Button className="w-full bg-purple-500 hover:bg-purple-600" asChild>
                            <Link to="/adm/isignature">
                                Ouvrir iSignature
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
