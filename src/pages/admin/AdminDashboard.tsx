/**
 * AdminDashboard - Overview stats and quick actions for platform administration
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    UserPlus,
    CreditCard,
    TrendingUp,
    Building2,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    HardDrive,
    FileText,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ChevronRight,
    Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDesignTheme } from '@/contexts/DesignThemeContext';

// Mock stats
const MOCK_STATS = {
    totalUsers: 1247,
    usersGrowth: 12.5,
    activeSubscriptions: 892,
    subscriptionGrowth: 8.3,
    monthlyRevenue: 45600000, // XAF
    revenueGrowth: 15.2,
    organizations: 156,
    organizationsGrowth: 5.4,
    newLeads: 23,
    leadsTrend: 'up',
    storageUsed: 2.4, // TB
    storageTotal: 5, // TB
};

const MOCK_RECENT_ACTIVITY = [
    { id: 1, type: 'user', message: 'Nouvel utilisateur inscrit', name: 'Jean Dubois', time: 'Il y a 5 min' },
    { id: 2, type: 'subscription', message: 'Abonnement Pro activé', name: 'Société ABC SARL', time: 'Il y a 15 min' },
    { id: 3, type: 'lead', message: 'Nouveau lead reçu', name: 'contact@example.com', time: 'Il y a 30 min' },
    { id: 4, type: 'organization', message: 'Nouvelle organisation créée', name: 'Tech Solutions', time: 'Il y a 1h' },
    { id: 5, type: 'subscription', message: 'Paiement reçu', name: '450,000 XAF', time: 'Il y a 2h' },
];

const MOCK_ALERTS = [
    { id: 1, type: 'warning', message: '23 nouveaux leads non traités', href: '/adminis/leads' },
    { id: 2, type: 'error', message: '5 paiements en échec', href: '/adminis/subscriptions/transactions' },
    { id: 3, type: 'info', message: '12 abonnements expirent cette semaine', href: '/adminis/subscriptions' },
];

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF';
}

export default function AdminDashboard() {
    const storagePercent = (MOCK_STATS.storageUsed / MOCK_STATS.storageTotal) * 100;
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
                    <h1 className="text-2xl font-bold">Administration</h1>
                    <p className="text-muted-foreground">Vue d'ensemble de la plateforme</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/adminis/analytics">
                        <Activity className="h-4 w-4 mr-2" />
                        Analytiques détaillées
                    </Link>
                </Button>
            </div>

            {/* Alerts */}
            {MOCK_ALERTS.length > 0 && (
                <div className="space-y-2">
                    {MOCK_ALERTS.map(alert => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Link to={alert.href}>
                                <Card className={cn(
                                    'border-l-4 hover:border-primary/50 transition-colors',
                                    alert.type === 'error' && 'border-l-red-500',
                                    alert.type === 'warning' && 'border-l-orange-500',
                                    alert.type === 'info' && 'border-l-blue-500'
                                )}>
                                    <CardContent className="py-3 flex items-center gap-3">
                                        <AlertTriangle className={cn(
                                            'h-5 w-5',
                                            alert.type === 'error' && 'text-red-500',
                                            alert.type === 'warning' && 'text-orange-500',
                                            alert.type === 'info' && 'text-blue-500'
                                        )} />
                                        <span className="flex-1">{alert.message}</span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Users */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className={themeCardClass}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Users className="h-5 w-5 text-blue-500" />
                                </div>
                                <Badge variant="secondary" className="text-green-500 bg-green-500/10">
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    {MOCK_STATS.usersGrowth}%
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Utilisateurs</p>
                            <p className="text-2xl font-bold">{MOCK_STATS.totalUsers.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Subscriptions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className={themeCardClass}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <CreditCard className="h-5 w-5 text-emerald-500" />
                                </div>
                                <Badge variant="secondary" className="text-green-500 bg-green-500/10">
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    {MOCK_STATS.subscriptionGrowth}%
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Abonnements actifs</p>
                            <p className="text-2xl font-bold">{MOCK_STATS.activeSubscriptions}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Revenue */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className={themeCardClass}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <TrendingUp className="h-5 w-5 text-purple-500" />
                                </div>
                                <Badge variant="secondary" className="text-green-500 bg-green-500/10">
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    {MOCK_STATS.revenueGrowth}%
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Revenu mensuel</p>
                            <p className="text-2xl font-bold">{formatCurrency(MOCK_STATS.monthlyRevenue)}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Organizations */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className={themeCardClass}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 rounded-lg bg-orange-500/10">
                                    <Building2 className="h-5 w-5 text-orange-500" />
                                </div>
                                <Badge variant="secondary" className="text-green-500 bg-green-500/10">
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    {MOCK_STATS.organizationsGrowth}%
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Organisations</p>
                            <p className="text-2xl font-bold">{MOCK_STATS.organizations}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Storage Overview */}
                <Card className={themeCardClass}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <HardDrive className="h-5 w-5" />
                            Stockage plateforme
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>{MOCK_STATS.storageUsed} TB utilisés</span>
                                    <span>{MOCK_STATS.storageTotal} TB total</span>
                                </div>
                                <Progress value={storagePercent} className="h-3" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 rounded-lg bg-muted/50">
                                    <p className="text-muted-foreground">Documents</p>
                                    <p className="font-semibold">1.2 TB</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                    <p className="text-muted-foreground">Archives</p>
                                    <p className="font-semibold">1.0 TB</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className={cn(themeCardClass, "lg:col-span-2")}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Activité récente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px]">
                            <div className="space-y-3">
                                {MOCK_RECENT_ACTIVITY.map(activity => (
                                    <div key={activity.id} className="flex items-center gap-3">
                                        <div className={cn(
                                            'p-2 rounded-lg',
                                            activity.type === 'user' && 'bg-blue-500/10',
                                            activity.type === 'subscription' && 'bg-emerald-500/10',
                                            activity.type === 'lead' && 'bg-orange-500/10',
                                            activity.type === 'organization' && 'bg-purple-500/10'
                                        )}>
                                            {activity.type === 'user' && <Users className="h-4 w-4 text-blue-500" />}
                                            {activity.type === 'subscription' && <CreditCard className="h-4 w-4 text-emerald-500" />}
                                            {activity.type === 'lead' && <UserPlus className="h-4 w-4 text-orange-500" />}
                                            {activity.type === 'organization' && <Building2 className="h-4 w-4 text-purple-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm">
                                                <span className="font-medium">{activity.message}</span>
                                                <span className="text-muted-foreground"> - {activity.name}</span>
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className={themeCardClass}>
                <CardHeader>
                    <CardTitle className="text-lg">Accès rapides</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link to="/adminis/leads">
                            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                                <CardContent className="pt-6 text-center">
                                    <div className="p-3 rounded-xl bg-orange-500/10 w-fit mx-auto mb-3">
                                        <UserPlus className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <p className="font-medium">Leads</p>
                                    <p className="text-sm text-muted-foreground">{MOCK_STATS.newLeads} nouveaux</p>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/adminis/users">
                            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                                <CardContent className="pt-6 text-center">
                                    <div className="p-3 rounded-xl bg-blue-500/10 w-fit mx-auto mb-3">
                                        <Users className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <p className="font-medium">Utilisateurs</p>
                                    <p className="text-sm text-muted-foreground">Gérer</p>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/adminis/subscriptions">
                            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                                <CardContent className="pt-6 text-center">
                                    <div className="p-3 rounded-xl bg-emerald-500/10 w-fit mx-auto mb-3">
                                        <CreditCard className="h-6 w-6 text-emerald-500" />
                                    </div>
                                    <p className="font-medium">Abonnements</p>
                                    <p className="text-sm text-muted-foreground">Facturation</p>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link to="/adminis/organizations">
                            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                                <CardContent className="pt-6 text-center">
                                    <div className="p-3 rounded-xl bg-purple-500/10 w-fit mx-auto mb-3">
                                        <Building2 className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <p className="font-medium">Organisations</p>
                                    <p className="text-sm text-muted-foreground">Entreprises</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
