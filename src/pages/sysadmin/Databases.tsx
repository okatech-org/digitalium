import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, HardDrive, RefreshCw, Save } from 'lucide-react';

export default function Databases() {
    const databases = [
        { name: 'primary-db', type: 'PostgreSQL', version: '15.4', size: '450 GB', status: 'healthy', backup: '2h ago' },
        { name: 'cache-cluster', type: 'Redis', version: '7.0', size: '12 GB', status: 'healthy', backup: 'N/A' },
        { name: 'document-store', type: 'MongoDB', version: '6.0', size: '1.2 TB', status: 'optimizing', backup: '5h ago' },
        { name: 'analytics-db', type: 'ClickHouse', version: '23.3', size: '2.5 TB', status: 'healthy', backup: '12h ago' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Bases de Données</h1>
                    <p className="text-muted-foreground">Gestion des instances et sauvegardes</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Actualiser
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {databases.map((db) => (
                    <Card key={db.name} className="glass-card">
                        <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <Database className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        {db.name}
                                        {db.status === 'healthy' && <Badge variant="outline" className="text-green-500 border-green-500/50 bg-green-500/10">Healthy</Badge>}
                                        {db.status === 'optimizing' && <Badge variant="outline" className="text-blue-500 border-blue-500/50 bg-blue-500/10 animate-pulse">Optimizing</Badge>}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{db.type} v{db.version}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 text-sm">
                                <div className="flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                                    <span>{db.size}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Save className="w-4 h-4 text-muted-foreground" />
                                    <span>Backup: {db.backup}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Button variant="outline" size="sm">Logs</Button>
                                <Button size="sm">Backup Now</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
