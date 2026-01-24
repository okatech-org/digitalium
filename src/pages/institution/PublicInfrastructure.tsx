import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Wifi, Server, MapPin } from 'lucide-react';

export default function PublicInfrastructure() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Infrastructures Publiques</h1>
                <p className="text-muted-foreground">État du réseau national et des points de service</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wifi className="w-5 h-5 text-indigo-500" />
                            Réseau National
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">94%</div>
                        <p className="text-xs text-muted-foreground">Couverture Fibre Optique</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="w-5 h-5 text-blue-500" />
                            Data Centers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Sites Gouvernementaux (Tier III)</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-green-500" />
                            Points de Service
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">142</div>
                        <p className="text-xs text-muted-foreground">Agences connectées</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Maintenance Régionale</CardTitle>
                        <CardDescription>Plannings d'intervention</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/30">
                            <div>
                                <h4 className="font-bold text-sm">Abidjan Nord</h4>
                                <p className="text-xs text-muted-foreground">Mise à niveau Switchs</p>
                            </div>
                            <Badge variant="secondary">En Cours</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/30">
                            <div>
                                <h4 className="font-bold text-sm">Bouaké Centre</h4>
                                <p className="text-xs text-muted-foreground">Installation Fibre</p>
                            </div>
                            <Badge variant="outline">Planifié (25 Jan)</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Incidents Réseau</CardTitle>
                        <CardDescription>Dernières 24 heures</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                                <Database className="w-6 h-6 text-green-500" />
                            </div>
                            <p>Aucun incident majeur signalé</p>
                            <p className="text-xs mt-1">Le réseau fonctionne nominalement.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
