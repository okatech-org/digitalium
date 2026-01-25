import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Database,
    RefreshCw,
    HardDrive,
    CheckCircle,
    AlertTriangle,
    Clock,
    Download,
    Upload,
    Trash2,
    Calendar,
    Shield,
    Play,
    MoreVertical
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface Backup {
    id: string;
    name: string;
    database: string;
    type: 'full' | 'incremental' | 'snapshot';
    status: 'completed' | 'in_progress' | 'failed' | 'scheduled';
    size: string;
    createdAt: string;
    duration: string;
    retention: string;
    encrypted: boolean;
    progress?: number;
}

export default function DatabaseBackups() {
    const backups: Backup[] = [
        {
            id: '1',
            name: 'backup-primary-2026-01-25-12h00',
            database: 'primary-db',
            type: 'full',
            status: 'completed',
            size: '450 GB',
            createdAt: '25/01/2026 12:00',
            duration: '45 min',
            retention: '30 jours',
            encrypted: true
        },
        {
            id: '2',
            name: 'backup-primary-2026-01-25-06h00',
            database: 'primary-db',
            type: 'incremental',
            status: 'completed',
            size: '12 GB',
            createdAt: '25/01/2026 06:00',
            duration: '8 min',
            retention: '7 jours',
            encrypted: true
        },
        {
            id: '3',
            name: 'backup-analytics-2026-01-25-02h00',
            database: 'analytics-db',
            type: 'full',
            status: 'in_progress',
            size: '1.8 TB',
            createdAt: '25/01/2026 02:00',
            duration: 'En cours...',
            retention: '90 jours',
            encrypted: true,
            progress: 67
        },
        {
            id: '4',
            name: 'backup-document-2026-01-24-22h00',
            database: 'document-store',
            type: 'snapshot',
            status: 'completed',
            size: '890 GB',
            createdAt: '24/01/2026 22:00',
            duration: '1h 20min',
            retention: '14 jours',
            encrypted: true
        },
        {
            id: '5',
            name: 'backup-primary-2026-01-24-12h00',
            database: 'primary-db',
            type: 'full',
            status: 'failed',
            size: '-',
            createdAt: '24/01/2026 12:00',
            duration: '15 min',
            retention: '-',
            encrypted: false
        },
        {
            id: '6',
            name: 'backup-cache-2026-01-26-00h00',
            database: 'cache-cluster',
            type: 'snapshot',
            status: 'scheduled',
            size: '-',
            createdAt: '26/01/2026 00:00',
            duration: '-',
            retention: '3 jours',
            encrypted: true
        },
    ];

    const getStatusBadge = (status: Backup['status']) => {
        switch (status) {
            case 'completed':
                return <Badge variant="outline" className="text-green-500 border-green-500/50 bg-green-500/10 gap-1">
                    <CheckCircle className="w-3 h-3" /> Terminé
                </Badge>;
            case 'in_progress':
                return <Badge variant="outline" className="text-blue-500 border-blue-500/50 bg-blue-500/10 gap-1 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" /> En cours
                </Badge>;
            case 'failed':
                return <Badge variant="outline" className="text-red-500 border-red-500/50 bg-red-500/10 gap-1">
                    <AlertTriangle className="w-3 h-3" /> Échec
                </Badge>;
            case 'scheduled':
                return <Badge variant="outline" className="text-amber-500 border-amber-500/50 bg-amber-500/10 gap-1">
                    <Clock className="w-3 h-3" /> Planifié
                </Badge>;
        }
    };

    const getTypeBadge = (type: Backup['type']) => {
        switch (type) {
            case 'full':
                return <Badge variant="secondary" className="bg-primary/10 text-primary">Complet</Badge>;
            case 'incremental':
                return <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">Incrémental</Badge>;
            case 'snapshot':
                return <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-500">Snapshot</Badge>;
        }
    };

    const completedCount = backups.filter(b => b.status === 'completed').length;
    const totalSize = '3.15 TB';
    const nextScheduled = '26/01/2026 00:00';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Sauvegardes</h1>
                    <p className="text-muted-foreground">Gestion des sauvegardes et restaurations</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </Button>
                    <Button className="gap-2">
                        <Play className="w-4 h-4" />
                        Nouvelle Sauvegarde
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <HardDrive className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Sauvegardes</p>
                            <p className="text-2xl font-bold">{backups.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Réussies</p>
                            <p className="text-2xl font-bold">{completedCount}/{backups.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                            <Database className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Espace Utilisé</p>
                            <p className="text-2xl font-bold">{totalSize}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Prochaine</p>
                            <p className="text-lg font-bold">{nextScheduled}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Backups List */}
            <div className="grid grid-cols-1 gap-4">
                {backups.map((backup) => (
                    <Card key={backup.id} className="glass-card">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${backup.status === 'failed'
                                            ? 'bg-red-500/10 text-red-500'
                                            : backup.status === 'in_progress'
                                                ? 'bg-blue-500/10 text-blue-500'
                                                : 'bg-primary/10 text-primary'
                                        }`}>
                                        <HardDrive className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2 flex-wrap">
                                            {backup.name}
                                            {getStatusBadge(backup.status)}
                                        </h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                            <Database className="w-3 h-3" />
                                            {backup.database}
                                            <span className="text-muted-foreground/50">•</span>
                                            {getTypeBadge(backup.type)}
                                            {backup.encrypted && (
                                                <>
                                                    <span className="text-muted-foreground/50">•</span>
                                                    <Shield className="w-3 h-3 text-green-500" />
                                                    <span className="text-green-500 text-xs">Chiffré</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <span className="text-muted-foreground">Date: </span>
                                            <span>{backup.createdAt}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <span className="text-muted-foreground">Taille: </span>
                                            <span>{backup.size}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <span className="text-muted-foreground">Durée: </span>
                                            <span>{backup.duration}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full lg:w-auto">
                                    {backup.status === 'completed' && (
                                        <>
                                            <Button variant="outline" size="sm" className="gap-1">
                                                <Download className="w-3 h-3" />
                                                Télécharger
                                            </Button>
                                            <Button variant="outline" size="sm" className="gap-1">
                                                <Upload className="w-3 h-3" />
                                                Restaurer
                                            </Button>
                                        </>
                                    )}
                                    {backup.status === 'failed' && (
                                        <Button size="sm" className="gap-1">
                                            <RefreshCw className="w-3 h-3" />
                                            Réessayer
                                        </Button>
                                    )}
                                    {backup.status === 'scheduled' && (
                                        <Button variant="outline" size="sm" className="gap-1">
                                            <Play className="w-3 h-3" />
                                            Lancer maintenant
                                        </Button>
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Détails</DropdownMenuItem>
                                            <DropdownMenuItem>Logs</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-500">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Progress Bar for in-progress backups */}
                            {backup.status === 'in_progress' && backup.progress && (
                                <div className="mt-4 pt-4 border-t border-border/50">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Progression de la sauvegarde</span>
                                        <span className="font-medium">{backup.progress}%</span>
                                    </div>
                                    <Progress value={backup.progress} className="h-2" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Retention Policy Card */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Politique de Rétention
                    </CardTitle>
                    <CardDescription>Configuration des règles de conservation des sauvegardes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 rounded-xl bg-muted/30">
                            <h4 className="font-medium mb-2">Sauvegardes Quotidiennes</h4>
                            <p className="text-sm text-muted-foreground mb-2">Incrémentales toutes les 6h</p>
                            <Badge variant="outline">Rétention: 7 jours</Badge>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30">
                            <h4 className="font-medium mb-2">Sauvegardes Hebdomadaires</h4>
                            <p className="text-sm text-muted-foreground mb-2">Complètes chaque dimanche</p>
                            <Badge variant="outline">Rétention: 30 jours</Badge>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30">
                            <h4 className="font-medium mb-2">Sauvegardes Mensuelles</h4>
                            <p className="text-sm text-muted-foreground mb-2">Complètes le 1er du mois</p>
                            <Badge variant="outline">Rétention: 1 an</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
