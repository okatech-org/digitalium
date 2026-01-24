/**
 * AnalyticsPage - Dashboard analytics et métriques
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    FileText,
    Archive,
    PenTool,
    Users,
    Calendar,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Clock,
    Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface StatCard {
    label: string;
    value: string | number;
    change: number;
    icon: typeof FileText;
    color: string;
}

const STATS: StatCard[] = [
    { label: 'Documents', value: '1,247', change: 12.5, icon: FileText, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Archives', value: '856', change: 8.2, icon: Archive, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Signatures', value: '324', change: -3.1, icon: PenTool, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Utilisateurs', value: '18', change: 22.0, icon: Users, color: 'text-orange-500 bg-orange-500/10' },
];

const ACTIVITY_DATA = [
    { day: 'Lun', uploads: 45, views: 120, signatures: 12 },
    { day: 'Mar', uploads: 52, views: 98, signatures: 18 },
    { day: 'Mer', uploads: 38, views: 145, signatures: 8 },
    { day: 'Jeu', uploads: 65, views: 112, signatures: 22 },
    { day: 'Ven', uploads: 48, views: 88, signatures: 15 },
    { day: 'Sam', uploads: 12, views: 34, signatures: 3 },
    { day: 'Dim', uploads: 8, views: 22, signatures: 1 },
];

const TOP_DOCUMENTS = [
    { name: 'Contrat Fournisseur ABC', views: 234, category: 'juridique' },
    { name: 'Facture Q4 2025', views: 189, category: 'fiscal' },
    { name: 'Bulletin Décembre', views: 156, category: 'social' },
    { name: 'Statuts Société', views: 142, category: 'juridique' },
    { name: 'Devis Client XYZ', views: 98, category: 'client' },
];

const STORAGE_USAGE = {
    used: 2.4,
    total: 10,
    breakdown: [
        { category: 'Documents', size: 1.2, color: 'bg-blue-500' },
        { category: 'Archives', size: 0.8, color: 'bg-emerald-500' },
        { category: 'Signatures', size: 0.3, color: 'bg-purple-500' },
        { category: 'Autres', size: 0.1, color: 'bg-gray-500' },
    ],
};

export default function AnalyticsPage() {
    const [period, setPeriod] = useState('7d');

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">
                        Aperçu de l'activité et des performances
                    </p>
                </div>
                <div className="flex gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-36">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="24h">24 heures</SelectItem>
                            <SelectItem value="7d">7 jours</SelectItem>
                            <SelectItem value="30d">30 jours</SelectItem>
                            <SelectItem value="90d">90 jours</SelectItem>
                            <SelectItem value="1y">1 an</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
                {STATS.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className={cn('p-2 rounded-lg', stat.color.split(' ')[1])}>
                                        <stat.icon className={cn('h-5 w-5', stat.color.split(' ')[0])} />
                                    </div>
                                    <div className={cn(
                                        'flex items-center gap-1 text-xs font-medium',
                                        stat.change > 0 ? 'text-green-500' : 'text-red-500'
                                    )}>
                                        {stat.change > 0 ? (
                                            <ArrowUpRight className="h-3 w-3" />
                                        ) : (
                                            <ArrowDownRight className="h-3 w-3" />
                                        )}
                                        {Math.abs(stat.change)}%
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-6">
                {/* Activity Chart */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Activité hebdomadaire
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end gap-2">
                            {ACTIVITY_DATA.map((day, i) => {
                                const maxValue = Math.max(...ACTIVITY_DATA.map(d => d.uploads + d.views + d.signatures));
                                const height = ((day.uploads + day.views + day.signatures) / maxValue) * 100;

                                return (
                                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex flex-col gap-0.5" style={{ height: `${height}%` }}>
                                            <div
                                                className="bg-blue-500 rounded-t"
                                                style={{ flex: day.uploads }}
                                            />
                                            <div
                                                className="bg-emerald-500"
                                                style={{ flex: day.views / 3 }}
                                            />
                                            <div
                                                className="bg-purple-500 rounded-b"
                                                style={{ flex: day.signatures }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">{day.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded bg-blue-500" />
                                <span>Uploads</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded bg-emerald-500" />
                                <span>Vues</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded bg-purple-500" />
                                <span>Signatures</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Storage Usage */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Archive className="h-4 w-4" />
                            Stockage
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold">
                                {STORAGE_USAGE.used} <span className="text-lg text-muted-foreground">/ {STORAGE_USAGE.total} Go</span>
                            </p>
                            <p className="text-sm text-muted-foreground">utilisé</p>
                        </div>

                        <Progress value={(STORAGE_USAGE.used / STORAGE_USAGE.total) * 100} />

                        <div className="space-y-2">
                            {STORAGE_USAGE.breakdown.map(item => (
                                <div key={item.category} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={cn('w-3 h-3 rounded', item.color)} />
                                        <span>{item.category}</span>
                                    </div>
                                    <span className="text-muted-foreground">{item.size} Go</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">
                {/* Top Documents */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Documents les plus consultés
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {TOP_DOCUMENTS.map((doc, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-muted-foreground w-4">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{doc.name}</p>
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {doc.category}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Eye className="h-3 w-3" />
                                        {doc.views}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Activité récente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { action: 'Document archivé', user: 'Marie O.', time: '2 min', icon: Archive, color: 'text-emerald-500' },
                                { action: 'Signature complétée', user: 'Jean N.', time: '15 min', icon: PenTool, color: 'text-purple-500' },
                                { action: 'Nouveau document', user: 'Pierre M.', time: '1h', icon: FileText, color: 'text-blue-500' },
                                { action: 'Membre invité', user: 'Admin', time: '2h', icon: Users, color: 'text-orange-500' },
                                { action: 'Export PDF', user: 'Sophie E.', time: '3h', icon: Download, color: 'text-gray-500' },
                            ].map((activity, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={cn('p-2 rounded-lg bg-muted')}>
                                        <activity.icon className={cn('h-4 w-4', activity.color)} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.action}</p>
                                        <p className="text-xs text-muted-foreground">par {activity.user}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
