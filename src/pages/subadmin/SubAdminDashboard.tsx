/**
 * SubAdminDashboard - Dashboard for Sub-Administrator (Ornella DOUMBA role)
 * Vue d'ensemble with access to workflows, configuration and business management
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    Archive,
    PenTool,
    Users,
    Building2,
    Palette,
    GitBranch,
    TrendingUp,
    CreditCard,
    Activity,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Quick stats for the dashboard
const stats = [
    { label: 'Documents actifs', value: '1,234', change: '+12%', trend: 'up' },
    { label: 'Archives légales', value: '567', change: '+8%', trend: 'up' },
    { label: 'Signatures en attente', value: '23', change: '-5%', trend: 'down' },
    { label: 'Utilisateurs', value: '89', change: '+3%', trend: 'up' },
];

// Workflow modules cards
const workflowModules = [
    {
        title: 'iDocument',
        description: 'Gestion documentaire collaborative',
        icon: FileText,
        href: '/subadmin/idocument',
        gradient: 'from-blue-500 to-cyan-500',
        stats: { docs: 1234, shared: 89 },
    },
    {
        title: 'iArchive',
        description: 'Archivage légal PME',
        icon: Archive,
        href: '/subadmin/iarchive',
        gradient: 'from-amber-500 to-orange-500',
        stats: { archives: 567, certified: 234 },
    },
    {
        title: 'iSignature',
        description: 'Signatures électroniques',
        icon: PenTool,
        href: '/subadmin/isignature',
        gradient: 'from-emerald-500 to-green-500',
        stats: { pending: 23, signed: 456 },
    },
];

// Configuration quick access cards
const configCards = [
    { title: 'Utilisateurs IAM', icon: Users, href: '/subadmin/iam', count: 89 },
    { title: 'Configuration Orga', icon: Building2, href: '/subadmin/organization', count: 12 },
    { title: 'Thème Design', icon: Palette, href: '/subadmin/design-theme', label: 'Personnalisé' },
    { title: 'Modèles Workflow', icon: GitBranch, href: '/subadmin/workflow-templates', count: 37 },
];

// Business quick access cards
const businessCards = [
    { title: 'Gestion Clients', icon: Users, href: '/subadmin/clients', count: 156, status: 'active' },
    { title: 'Leads & Prospects', icon: TrendingUp, href: '/subadmin/leads', count: 45, status: 'new' },
    { title: 'Abonnements', icon: CreditCard, href: '/subadmin/subscriptions', count: 78, status: 'paid' },
];

// Recent activity
const recentActivity = [
    { user: 'Marie L.', action: 'a créé un nouveau workflow', time: 'Il y a 5 min', type: 'create' },
    { user: 'Paul K.', action: 'a signé le contrat #1234', time: 'Il y a 15 min', type: 'sign' },
    { user: 'Sophie M.', action: 'a archivé 12 documents', time: 'Il y a 1h', type: 'archive' },
    { user: 'Jean D.', action: 'a mis à jour le thème', time: 'Il y a 2h', type: 'config' },
];

export default function SubAdminDashboard() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Vue d'ensemble</h1>
                    <p className="text-muted-foreground">
                        Bienvenue, Ornella • Administration Configuration & Métier
                    </p>
                </div>
                <Badge variant="outline" className="border-purple-500/50 text-purple-500">
                    Sous-Admin
                </Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="bg-card border-border">
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                                    <Badge
                                        variant="secondary"
                                        className={stat.trend === 'up' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}
                                    >
                                        {stat.change}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Workflow Modules */}
            <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Modules Métiers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {workflowModules.map((module, index) => (
                        <motion.div
                            key={module.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            <Link to={module.href}>
                                <Card className="bg-card border-border hover:border-purple-500/50 transition-all cursor-pointer group">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className={`p-2 rounded-lg bg-gradient-to-br ${module.gradient}`}>
                                                <module.icon className="h-5 w-5 text-white" />
                                            </div>
                                            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                                        </div>
                                        <CardTitle className="mt-3">{module.title}</CardTitle>
                                        <CardDescription>{module.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            {Object.entries(module.stats).map(([key, value]) => (
                                                <span key={key}>
                                                    <span className="font-medium text-foreground">{value}</span> {key}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Configuration & Business Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration Plateforme */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <Building2 className="h-4 w-4 text-purple-400" />
                            </div>
                            <CardTitle className="text-base">Configuration Plateforme</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            {configCards.map((card) => (
                                <Link key={card.title} to={card.href}>
                                    <div className="p-3 rounded-lg border border-border hover:border-purple-500/50 hover:bg-muted/50 transition-all">
                                        <div className="flex items-center gap-2">
                                            <card.icon className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{card.title}</span>
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            {card.count !== undefined ? (
                                                <span className="font-medium text-foreground">{card.count}</span>
                                            ) : (
                                                <Badge variant="outline" className="text-xs">{card.label}</Badge>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Gestion Métier */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            </div>
                            <CardTitle className="text-base">Gestion Métier</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {businessCards.map((card) => (
                                <Link key={card.title} to={card.href}>
                                    <div className="p-3 rounded-lg border border-border hover:border-emerald-500/50 hover:bg-muted/50 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <card.icon className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">{card.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-foreground">{card.count}</span>
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        card.status === 'active' ? 'bg-green-500/20 text-green-500' :
                                                            card.status === 'new' ? 'bg-blue-500/20 text-blue-500' :
                                                                'bg-purple-500/20 text-purple-500'
                                                    }
                                                >
                                                    {card.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base">Activité Récente</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                            Voir tout
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs bg-muted">
                                        {activity.user.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">
                                        <span className="font-medium">{activity.user}</span>{' '}
                                        <span className="text-muted-foreground">{activity.action}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {activity.time}
                                    </p>
                                </div>
                                <div>
                                    {activity.type === 'create' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    {activity.type === 'sign' && <PenTool className="h-4 w-4 text-blue-500" />}
                                    {activity.type === 'archive' && <Archive className="h-4 w-4 text-amber-500" />}
                                    {activity.type === 'config' && <Palette className="h-4 w-4 text-purple-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
