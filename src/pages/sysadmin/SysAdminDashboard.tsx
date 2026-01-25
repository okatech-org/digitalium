/**
 * SysAdminDashboard - System administration overview dashboard
 * Displays system health metrics, quick access to modules, and recent alerts
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Server,
    Activity,
    Database,
    Terminal,
    ShieldAlert,
    Users,
    Cpu,
    HardDrive,
    Wifi,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';

export default function SysAdminDashboard() {
    // System health metrics
    const systemMetrics = [
        { label: 'CPU Moyen', value: '42%', icon: Cpu, color: 'text-blue-400', trend: 'down', trendValue: '-8%' },
        { label: 'RAM Utilisée', value: '64 GB', icon: HardDrive, color: 'text-purple-400', trend: 'up', trendValue: '+2 GB' },
        { label: 'Serveurs Actifs', value: '4/4', icon: Server, color: 'text-green-400', trend: 'stable', trendValue: '100%' },
        { label: 'Latence Moyenne', value: '12ms', icon: Wifi, color: 'text-orange-400', trend: 'down', trendValue: '-3ms' },
    ];

    // Quick access modules
    const modules = [
        {
            title: 'Infrastructure',
            description: '4 Serveurs • 98% Uptime',
            icon: Server,
            href: '/admin/infrastructure',
            color: 'from-slate-600 to-slate-800',
            status: 'Operational',
            statusColor: 'text-green-400',
        },
        {
            title: 'Monitoring',
            description: '2.4k RPS • Real-time',
            icon: Activity,
            href: '/admin/monitoring',
            color: 'from-blue-600 to-slate-700',
            status: 'Live',
            statusColor: 'text-blue-400',
        },
        {
            title: 'Bases de Données',
            description: 'Primary + 2 Replicas',
            icon: Database,
            href: '/admin/databases',
            color: 'from-emerald-600 to-teal-700',
            status: 'Healthy',
            statusColor: 'text-emerald-400',
        },
        {
            title: 'Logs Système',
            description: '45 logs/sec',
            icon: Terminal,
            href: '/admin/logs',
            color: 'from-zinc-600 to-neutral-800',
            status: '0 Errors',
            statusColor: 'text-zinc-400',
        },
        {
            title: 'Sécurité',
            description: 'Score A+ • 14k Blocked',
            icon: ShieldAlert,
            href: '/admin/security',
            color: 'from-red-600 to-orange-700',
            status: 'Protected',
            statusColor: 'text-red-400',
        },
        {
            title: 'Utilisateurs IAM',
            description: '4 Comptes Techniques',
            icon: Users,
            href: '/admin/iam',
            color: 'from-indigo-600 to-violet-700',
            status: 'Active',
            statusColor: 'text-indigo-400',
        },
    ];

    // Recent alerts
    const recentAlerts = [
        { message: 'Backup automatique terminé avec succès', time: '2 min', type: 'success' },
        { message: 'Réplication DB synchronisée', time: '15 min', type: 'info' },
        { message: 'Pic de charge détecté sur Worker-Node-01', time: '1h', type: 'warning' },
        { message: 'Mise à jour de sécurité appliquée', time: '3h', type: 'success' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Console Système</h1>
                    <p className="text-slate-400">Vue d'ensemble de l'infrastructure</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-mono text-green-400 font-bold tracking-wider">SYSTÈME OPÉRATIONNEL</span>
                </div>
            </div>

            {/* System Health Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900 border border-slate-700/50 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NCAwLTE4IDguMDYtMTggMThzOC4wNiAxOCAxOCAxOCAxOC04LjA2IDE4LTE4LTguMDYtMTgtMTgtMTh6bTAgMzJjLTcuNzMyIDAtMTQtNi4yNjgtMTQtMTRzNi4yNjgtMTQgMTQtMTQgMTQgNi4yNjggMTQgMTQtNi4yNjggMTQtMTQgMTR6IiBmaWxsPSIjMzM0MTU1IiBmaWxsLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-10" />
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {systemMetrics.map((metric, index) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className={`inline-flex p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 mb-2`}>
                                <metric.icon className={`w-6 h-6 ${metric.color}`} />
                            </div>
                            <p className="text-2xl font-bold text-slate-100">{metric.value}</p>
                            <p className="text-xs text-slate-500">{metric.label}</p>
                            <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${metric.trend === 'down' ? 'text-green-400' : metric.trend === 'up' ? 'text-orange-400' : 'text-slate-500'
                                }`}>
                                {metric.trend === 'down' && <ArrowDown className="w-3 h-3" />}
                                {metric.trend === 'up' && <ArrowUp className="w-3 h-3" />}
                                <span>{metric.trendValue}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Access Modules */}
            <div>
                <h2 className="text-lg font-semibold text-slate-200 mb-4">Modules Système</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.map((module, index) => (
                        <motion.div
                            key={module.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.08 }}
                        >
                            <Link to={module.href}>
                                <Card className="bg-slate-900 border-slate-700/50 hover:border-slate-600 transition-all group cursor-pointer h-full hover:shadow-lg hover:-translate-y-1 overflow-hidden relative">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                                                <module.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <Badge variant="outline" className={`${module.statusColor} border-slate-700 bg-slate-800/50`}>
                                                {module.status}
                                            </Badge>
                                        </div>
                                        <CardTitle className="flex items-center justify-between text-base text-slate-200">
                                            {module.title}
                                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors group-hover:translate-x-1 duration-300" />
                                        </CardTitle>
                                        <CardDescription className="text-slate-500">{module.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Recent Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-slate-700/50">
                    <CardHeader>
                        <CardTitle className="text-slate-200 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-slate-400" />
                            Activité Récente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentAlerts.map((alert, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/30"
                            >
                                {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                                {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />}
                                {alert.type === 'info' && <Activity className="w-4 h-4 text-blue-400 shrink-0" />}
                                <p className="text-sm text-slate-300 flex-1">{alert.message}</p>
                                <span className="text-xs text-slate-500">{alert.time}</span>
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-slate-900 border-slate-700/50">
                    <CardHeader>
                        <CardTitle className="text-slate-200 flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-slate-400" />
                            Actions Rapides
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
                            <Database className="w-4 h-4 mr-2" />
                            Lancer un Backup DB
                        </Button>
                        <Button variant="outline" className="w-full justify-start bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
                            <Activity className="w-4 h-4 mr-2" />
                            Voir les Métriques Live
                        </Button>
                        <Button variant="outline" className="w-full justify-start bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
                            <Terminal className="w-4 h-4 mr-2" />
                            Accéder aux Logs
                        </Button>
                        <Button variant="outline" className="w-full justify-start bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            Audit de Sécurité
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
