import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ArrowUp, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Monitoring() {
    const data = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        requests: Math.floor(Math.random() * 5000) + 1000,
        latency: Math.floor(Math.random() * 60) + 20,
        errors: Math.floor(Math.random() * 20),
    }));

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">Monitoring</h1>
                    <p className="text-sm text-muted-foreground">Métriques en temps réel</p>
                </div>
                <Badge variant="outline" className="gap-1 animate-pulse border-green-500/50 text-green-500 bg-green-500/10">
                    <Activity className="w-3 h-3" />
                    Live
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 min-h-0">
                {/* Main Chart: RPS */}
                <Card className="glass-card col-span-1 md:col-span-2 lg:col-span-2 flex flex-col min-h-0">
                    <CardHeader className="pb-2 shrink-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-base">Requêtes / Seconde</CardTitle>
                                <CardDescription className="text-xs">Trafic global (24h)</CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-blue-500">2,405</div>
                                <div className="text-[10px] text-green-500 flex items-center justify-end">
                                    <ArrowUp className="w-2 h-2 mr-0.5" /> +12%
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                                <XAxis dataKey="time" className="text-[10px]" tick={{ fill: '#6b7280' }} />
                                <YAxis className="text-[10px]" tick={{ fill: '#6b7280' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Side Stats Container */}
                <div className="flex flex-col gap-4 col-span-1 min-h-0 h-full">
                    {/* Latency Chart */}
                    <Card className="glass-card flex-1 flex flex-col min-h-0">
                        <CardHeader className="pb-0 shrink-0">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-sm">Latence API (ms)</CardTitle>
                                <div className="text-lg font-bold text-emerald-500">42ms</div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0 pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '10px' }}
                                    />
                                    <Area type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} fill="url(#colorLatency)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Errors Chart */}
                    <Card className="glass-card flex-1 flex flex-col min-h-0">
                        <CardHeader className="pb-0 shrink-0">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-sm flex items-center gap-1.5">
                                    <AlertTriangle className="w-3 h-3 text-red-500" /> Errors (5xx)
                                </CardTitle>
                                <div className="text-lg font-bold text-red-500">0.02%</div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0 pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '10px' }}
                                    />
                                    <Area type="step" dataKey="errors" stroke="#ef4444" strokeWidth={2} fill="url(#colorErrors)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
