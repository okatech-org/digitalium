import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, HardDrive } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Analytics() {
    const apiData = [
        { name: 'Lun', requests: 4000 },
        { name: 'Mar', requests: 3000 },
        { name: 'Mer', requests: 2000 },
        { name: 'Jeu', requests: 2780 },
        { name: 'Ven', requests: 1890 },
        { name: 'Sam', requests: 2390 },
        { name: 'Dim', requests: 3490 },
    ];

    const storageData = [
        { name: 'Jan', gb: 10 },
        { name: 'Fev', gb: 15 },
        { name: 'Mar', gb: 25 },
        { name: 'Avr', gb: 40 },
        { name: 'Mai', gb: 45 },
        { name: 'Juin', gb: 60 },
    ];

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
                <p className="text-muted-foreground">Statistiques d'utilisation en temps réel</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Requêtes API</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45.2k</div>
                        <p className="text-xs text-muted-foreground flex items-center text-emerald-500">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +20.1% ce mois
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stockage</CardTitle>
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">64.5 GB</div>
                        <p className="text-xs text-muted-foreground flex items-center text-emerald-500">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +2.5% cette semaine
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="api" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="api">Utilisation API</TabsTrigger>
                    <TabsTrigger value="storage">Stockage</TabsTrigger>
                </TabsList>

                <TabsContent value="api" className="space-y-4">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Requêtes par jour</CardTitle>
                            <CardDescription>Volume de requêtes sur les 7 derniers jours</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={apiData}>
                                    <defs>
                                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="name" className="text-sm" />
                                    <YAxis className="text-sm" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="requests" stroke="#8884d8" fillOpacity={1} fill="url(#colorRequests)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="storage" className="space-y-4">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Croissance du Stockage</CardTitle>
                            <CardDescription>Évolution sur les 6 derniers mois (GB)</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={storageData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="name" className="text-sm" />
                                    <YAxis className="text-sm" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="gb" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
