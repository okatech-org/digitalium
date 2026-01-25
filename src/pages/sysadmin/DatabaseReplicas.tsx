import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Database,
    RefreshCw,
    ArrowLeftRight,
    CheckCircle,
    AlertTriangle,
    Clock,
    Globe,
    Server,
    Activity,
    Zap
} from 'lucide-react';

interface Replica {
    id: string;
    name: string;
    region: string;
    primaryDb: string;
    status: 'synced' | 'syncing' | 'lag' | 'error';
    lag: string;
    lastSync: string;
    syncProgress?: number;
    reads: string;
    latency: string;
}

export default function DatabaseReplicas() {
    const replicas: Replica[] = [
        {
            id: '1',
            name: 'replica-eu-west-1',
            region: 'Europe (Paris)',
            primaryDb: 'primary-db',
            status: 'synced',
            lag: '0ms',
            lastSync: 'Just now',
            reads: '12.5K/s',
            latency: '2ms'
        },
        {
            id: '2',
            name: 'replica-africa-central',
            region: 'Afrique Centrale (Libreville)',
            primaryDb: 'primary-db',
            status: 'synced',
            lag: '15ms',
            lastSync: '2s ago',
            reads: '8.2K/s',
            latency: '45ms'
        },
        {
            id: '3',
            name: 'replica-us-east-1',
            region: 'Amérique (Virginie)',
            primaryDb: 'primary-db',
            status: 'syncing',
            lag: '250ms',
            lastSync: '5m ago',
            syncProgress: 78,
            reads: '5.1K/s',
            latency: '120ms'
        },
        {
            id: '4',
            name: 'analytics-replica',
            region: 'Europe (Francfort)',
            primaryDb: 'analytics-db',
            status: 'lag',
            lag: '2.5s',
            lastSync: '30s ago',
            reads: '2.8K/s',
            latency: '8ms'
        },
        {
            id: '5',
            name: 'backup-replica-dr',
            region: 'Afrique du Sud (Johannesburg)',
            primaryDb: 'primary-db',
            status: 'synced',
            lag: '50ms',
            lastSync: '1s ago',
            reads: '0/s',
            latency: '180ms'
        },
    ];

    const getStatusBadge = (status: Replica['status']) => {
        switch (status) {
            case 'synced':
                return <Badge variant="outline" className="text-green-500 border-green-500/50 bg-green-500/10 gap-1">
                    <CheckCircle className="w-3 h-3" /> Synchronisé
                </Badge>;
            case 'syncing':
                return <Badge variant="outline" className="text-blue-500 border-blue-500/50 bg-blue-500/10 gap-1 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Synchronisation
                </Badge>;
            case 'lag':
                return <Badge variant="outline" className="text-amber-500 border-amber-500/50 bg-amber-500/10 gap-1">
                    <AlertTriangle className="w-3 h-3" /> Retard
                </Badge>;
            case 'error':
                return <Badge variant="outline" className="text-red-500 border-red-500/50 bg-red-500/10 gap-1">
                    <AlertTriangle className="w-3 h-3" /> Erreur
                </Badge>;
        }
    };

    const syncedCount = replicas.filter(r => r.status === 'synced').length;
    const totalReplicas = replicas.length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Réplicas de Base de Données</h1>
                    <p className="text-muted-foreground">Gestion des réplicas et synchronisation multi-région</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </Button>
                    <Button className="gap-2">
                        <Database className="w-4 h-4" />
                        Nouveau Réplica
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Database className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Réplicas</p>
                            <p className="text-2xl font-bold">{totalReplicas}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Synchronisés</p>
                            <p className="text-2xl font-bold">{syncedCount}/{totalReplicas}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Régions</p>
                            <p className="text-2xl font-bold">4</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Latence Moy.</p>
                            <p className="text-2xl font-bold">71ms</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Replicas List */}
            <div className="grid grid-cols-1 gap-4">
                {replicas.map((replica) => (
                    <Card key={replica.id} className="glass-card">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                        <Server className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            {replica.name}
                                            {getStatusBadge(replica.status)}
                                        </h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Globe className="w-3 h-3" />
                                            {replica.region}
                                            <span className="text-muted-foreground/50">•</span>
                                            <ArrowLeftRight className="w-3 h-3" />
                                            {replica.primaryDb}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <span className="text-muted-foreground">Lag: </span>
                                            <span className={replica.status === 'lag' ? 'text-amber-500 font-medium' : ''}>
                                                {replica.lag}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <span className="text-muted-foreground">Reads: </span>
                                            <span>{replica.reads}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <span className="text-muted-foreground">Latence: </span>
                                            <span>{replica.latency}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full lg:w-auto">
                                    <Button variant="outline" size="sm">Détails</Button>
                                    <Button variant="outline" size="sm">Promouvoir</Button>
                                    <Button size="sm" className="gap-1">
                                        <RefreshCw className="w-3 h-3" />
                                        Resync
                                    </Button>
                                </div>
                            </div>

                            {/* Sync Progress Bar for syncing replicas */}
                            {replica.status === 'syncing' && replica.syncProgress && (
                                <div className="mt-4 pt-4 border-t border-border/50">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Progression de synchronisation</span>
                                        <span className="font-medium">{replica.syncProgress}%</span>
                                    </div>
                                    <Progress value={replica.syncProgress} className="h-2" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Replication Topology */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowLeftRight className="w-5 h-5" />
                        Topologie de Réplication
                    </CardTitle>
                    <CardDescription>Vue d'ensemble des flux de réplication entre les instances</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="p-6 rounded-2xl bg-primary/10 mb-4">
                            <Database className="w-12 h-12 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">primary-db</h3>
                        <p className="text-sm text-muted-foreground mb-6">Instance principale (Libreville)</p>

                        <div className="w-px h-8 bg-border"></div>
                        <div className="w-full max-w-2xl border-t border-border"></div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 w-full max-w-3xl">
                            {replicas.filter(r => r.primaryDb === 'primary-db').map(replica => (
                                <div key={replica.id} className="flex flex-col items-center p-4 rounded-xl bg-muted/30">
                                    <Server className="w-6 h-6 text-muted-foreground mb-2" />
                                    <span className="text-xs font-medium text-center">{replica.name}</span>
                                    <span className="text-xs text-muted-foreground">{replica.lag}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
