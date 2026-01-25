import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Server, Cpu, HardDrive, Wifi, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Infrastructure() {
    const servers = [
        { name: 'Core-API-01', region: 'eu-west-3', cpu: 45, ram: 62, status: 'healthy', uptime: '45j 12h' },
        { name: 'Core-API-02', region: 'eu-west-3', cpu: 32, ram: 58, status: 'healthy', uptime: '12j 4h' },
        { name: 'Worker-Node-01', region: 'eu-west-3', cpu: 78, ram: 82, status: 'warning', uptime: '45j 12h' },
        { name: 'DB-Primary', region: 'eu-west-3', cpu: 25, ram: 45, status: 'healthy', uptime: '89j 2h' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Infrastructure</h1>
                <p className="text-muted-foreground">État du parc de serveurs et réseaux</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Santé Globale</CardTitle>
                        <ActivityIcon className="text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">98.2%</div>
                        <p className="text-xs text-muted-foreground">Tout les systèmes opérationnels</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CPU Moyen</CardTitle>
                        <Cpu className="text-blue-500 w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">42%</div>
                        <p className="text-xs text-muted-foreground">Charge modérée</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">RAM Utilisée</CardTitle>
                        <HardDrive className="text-purple-500 w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-500">64GB</div>
                        <p className="text-xs text-muted-foreground">Sur 128GB total</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bande Passante</CardTitle>
                        <Wifi className="text-orange-500 w-4 h-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">1.2 Gb/s</div>
                        <p className="text-xs text-muted-foreground">Pic à 2.4 Gb/s</p>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">Serveurs Actifs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servers.map((server) => (
                    <Card key={server.name} className="glass-card">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Server className="w-4 h-4 text-muted-foreground" />
                                    {server.name}
                                </CardTitle>
                                {server.status === 'healthy' ? (
                                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Operational</Badge>
                                ) : (
                                    <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Warning</Badge>
                                )}
                            </div>
                            <CardDescription className="text-xs font-mono">{server.region} • Uptime: {server.uptime}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>CPU Load</span>
                                    <span>{server.cpu}%</span>
                                </div>
                                <Progress value={server.cpu} className={`h-1 ${server.cpu > 70 ? '[&>div]:bg-yellow-500' : ''}`} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>RAM Usage</span>
                                    <span>{server.ram}%</span>
                                </div>
                                <Progress value={server.ram} className="h-1" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function ActivityIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-4 h-4 ${className}`}
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
