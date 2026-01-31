/**
 * OrgDashboard - Dashboard for Organism organizations
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FolderOpen,
    BookOpen,
    ClipboardSignature,
    HardDrive,
    Users,
    Clock,
    ChevronRight,
    Upload,
    FileText,
    Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Mock data
const MOCK_STATS = {
    storage: { used: 128, total: 250, unit: 'GB' },
    documents: 2156,
    archives: 8934,
    signatures: { pending: 3, thisMonth: 42 },
    membres: 156,
};

const MOCK_ACTIVITY = [
    { id: 1, user: 'Directeur', action: 'a signé', doc: 'Convention de partenariat', module: 'Signatures', time: 'Il y a 15 min' },
    { id: 2, user: 'Scolarité', action: 'a archivé', doc: 'Relevés de notes 2025', module: 'Archives', time: 'Il y a 45 min' },
    { id: 3, user: 'Secrétariat', action: 'a partagé', doc: 'Calendrier académique 2026', module: 'Documents', time: 'Il y a 2h' },
    { id: 4, user: 'Comptabilité', action: 'a créé', doc: 'Rapport financier annuel', module: 'Documents', time: 'Il y a 3h' },
];

export default function OrgDashboard() {
    const storagePercent = (MOCK_STATS.storage.used / MOCK_STATS.storage.total) * 100;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Tableau de Bord</h1>
                    <p className="text-muted-foreground">Gestion collaborative</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to="/org/team">
                            <Users className="h-4 w-4 mr-2" />
                            {MOCK_STATS.membres} membres
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

                {/* Documents */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Link to="/org/idocument">
                        <Card className="hover:border-green-500/50 transition-colors cursor-pointer group">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-500/10 group-hover:scale-110 transition-transform">
                                            <FolderOpen className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Documents</p>
                                            <p className="text-xl font-bold">{MOCK_STATS.documents.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>

                {/* Archives */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Link to="/org/iarchive">
                        <Card className="hover:border-indigo-500/50 transition-colors cursor-pointer group">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-indigo-500/10 group-hover:scale-110 transition-transform">
                                            <BookOpen className="h-5 w-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Archives</p>
                                            <p className="text-xl font-bold">{MOCK_STATS.archives.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>

                {/* Signatures */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Link to="/org/isignature">
                        <Card className="hover:border-pink-500/50 transition-colors cursor-pointer group">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-pink-500/10 group-hover:scale-110 transition-transform">
                                            <ClipboardSignature className="h-5 w-5 text-pink-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Signatures</p>
                                            <p className="text-xl font-bold">{MOCK_STATS.signatures.thisMonth} ce mois</p>
                                        </div>
                                    </div>
                                    {MOCK_STATS.signatures.pending > 0 && (
                                        <Badge variant="secondary" className="bg-pink-500/20 text-pink-500">
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
                            <Link to="/org/idocument?action=new">
                                <Plus className="h-4 w-4 text-green-500" />
                                <span>Nouveau document</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-3" asChild>
                            <Link to="/org/iarchive/upload">
                                <Upload className="h-4 w-4 text-indigo-500" />
                                <span>Archiver des fichiers</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-3" asChild>
                            <Link to="/org/isignature">
                                <ClipboardSignature className="h-4 w-4 text-pink-500" />
                                <span>Demander une signature</span>
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
                                    <div className="p-1.5 rounded-lg bg-green-500/10">
                                        <FileText className="h-4 w-4 text-green-500" />
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
                <Card className="border-green-500/20 hover:border-green-500/40 transition-colors">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-green-500/10">
                                <FolderOpen className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <CardTitle>Documents</CardTitle>
                                <CardDescription>Gestion partagée</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Créez et partagez vos documents avec les membres de votre organisation.
                        </p>
                        <Button className="w-full bg-green-500 hover:bg-green-600" asChild>
                            <Link to="/org/idocument">
                                Accéder
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-indigo-500/10">
                                <BookOpen className="h-6 w-6 text-indigo-500" />
                            </div>
                            <div>
                                <CardTitle>Archives</CardTitle>
                                <CardDescription>Conservation sécurisée</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Archivez vos documents importants avec une conservation garantie.
                        </p>
                        <Button className="w-full bg-indigo-500 hover:bg-indigo-600" asChild>
                            <Link to="/org/iarchive">
                                Accéder
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-pink-500/20 hover:border-pink-500/40 transition-colors">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-pink-500/10">
                                <ClipboardSignature className="h-6 w-6 text-pink-500" />
                            </div>
                            <div>
                                <CardTitle>Signatures</CardTitle>
                                <CardDescription>Validation électronique</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Collectez des signatures électroniques sur vos documents officiels.
                        </p>
                        <Button className="w-full bg-pink-500 hover:bg-pink-600" asChild>
                            <Link to="/org/isignature">
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
