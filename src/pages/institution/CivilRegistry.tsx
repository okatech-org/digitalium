import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function CivilRegistry() {
    const recentRequests = [
        { id: 'REQ-2024-001', type: 'Acte de Naissance', citizen: 'Kouame Jean', date: '25 Jan 2026', status: 'pending' },
        { id: 'REQ-2024-002', type: 'Acte de Mariage', citizen: 'Diallo Fatou', date: '24 Jan 2026', status: 'validated' },
        { id: 'REQ-2024-003', type: 'Déclaration Décès', citizen: 'Famille Koné', date: '24 Jan 2026', status: 'validated' },
        { id: 'REQ-2024-004', type: 'Acte de Naissance', citizen: 'Yao Paul', date: '23 Jan 2026', status: 'rejected' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">État Civil</h1>
                    <p className="text-muted-foreground">Gestion des registres et demandes citoyennes</p>
                </div>
                <Button className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 border-none">
                    <FileText className="w-4 h-4" />
                    Nouvelle Entrée
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Demandes en Attente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-500">24</div>
                        <p className="text-xs text-muted-foreground">Dont 5 urgentes</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Actes Délivrés (Mois)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-500">1,205</div>
                        <p className="text-xs text-muted-foreground">+12% vs mois dernier</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Population Totale</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-500">28.4M</div>
                        <p className="text-xs text-muted-foreground">Estimation temps réel</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Demandes Récentes</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher un dossier..." className="pl-9 bg-background/50" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentRequests.map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded bg-muted">
                                        <FileText className="w-5 h-5 text-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{req.type}</h4>
                                        <p className="text-xs text-muted-foreground">Ref: {req.id} • {req.citizen}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-sm text-muted-foreground">{req.date}</span>
                                    <Badge variant="outline" className={`
                                        ${req.status === 'validated' ? 'text-green-500 border-green-500/20 bg-green-500/10' : ''}
                                        ${req.status === 'pending' ? 'text-orange-500 border-orange-500/20 bg-orange-500/10' : ''}
                                        ${req.status === 'rejected' ? 'text-red-500 border-red-500/20 bg-red-500/10' : ''}
                                    `}>
                                        {req.status === 'validated' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                        {req.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                        {req.status.toUpperCase()}
                                    </Badge>
                                    <Button variant="ghost" size="sm">Détails</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
