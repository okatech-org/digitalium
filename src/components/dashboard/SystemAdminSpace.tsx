import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Server, Activity, Database, ShieldAlert, Terminal, Users, ChevronRight, ArrowUp, ArrowDown, ShieldCheck, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const SystemAdminSpace = () => {
    const menuItems = [
        {
            title: 'Infrastructure',
            description: '4 Serveurs Actifs',
            icon: Server,
            href: '/sysadmin/infrastructure',
            color: 'from-slate-600 to-slate-800',
            metric: '98% Uptime',
            metricColor: 'text-green-500',
            status: 'Operational'
        },
        {
            title: 'Monitoring',
            description: '2.4k RPS',
            icon: Activity,
            href: '/sysadmin/monitoring',
            color: 'from-blue-600 to-slate-700',
            metric: '-12ms Latency',
            metricColor: 'text-blue-500',
            status: 'Normal'
        },
        {
            title: 'Bases de Données',
            description: 'Primary + 2 Replicas',
            icon: Database,
            href: '/sysadmin/databases',
            color: 'from-emerald-600 to-teal-700',
            metric: 'Backup: 2h ago',
            metricColor: 'text-emerald-500',
            status: 'Healthy'
        },
        {
            title: 'Logs Système',
            description: '45 logs/sec',
            icon: Terminal,
            href: '/sysadmin/logs',
            color: 'from-zinc-600 to-neutral-800',
            metric: '0 Errors (1h)',
            metricColor: 'text-zinc-500',
            status: 'Live'
        },
        {
            title: 'Sécurité',
            description: 'Score A+',
            icon: ShieldAlert,
            href: '/sysadmin/security',
            color: 'from-red-600 to-orange-700',
            metric: '14k Threats Blocked',
            metricColor: 'text-red-500',
            status: 'Protected'
        },
        {
            title: 'Utilisateurs IAM',
            description: '4 Comptes Techniques',
            icon: Users,
            href: '/sysadmin/iam',
            color: 'from-indigo-600 to-violet-700',
            metric: 'No anomalies',
            metricColor: 'text-indigo-500',
            status: 'Active'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* System Health Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full p-6 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 mb-2 flex items-center justify-between relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-slate-900/50 z-0" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                        <Cpu className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            Système Opérationnel
                            <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-none">
                                v2.4.0
                            </Badge>
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-400 font-mono">
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                API: Running
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                DB: Connected
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                Cache: Hit 94%
                            </span>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-3 bg-slate-950/50 px-4 py-2 rounded-lg border border-slate-800">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-mono text-green-500 font-bold tracking-wider">LIVE MONITORING</span>
                </div>
            </motion.div>

            {menuItems.map((item, index) => (
                <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                    <Link to={item.href}>
                        <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all group cursor-pointer h-full hover:shadow-lg hover:-translate-y-1 overflow-hidden relative">
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                                        <item.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <Badge variant="outline" className={`${item.metricColor.replace('text-', 'border-').replace('500', '500/30')} bg-background/50`}>
                                        {item.status}
                                    </Badge>
                                </div>
                                <CardTitle className="flex items-center justify-between text-base">
                                    {item.title}
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300" />
                                </CardTitle>
                                <CardDescription className="line-clamp-1">{item.description}</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className={`text-xs font-medium font-mono flex items-center gap-1 ${item.metricColor}`}>
                                    {index % 2 === 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                    {item.metric}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
};
