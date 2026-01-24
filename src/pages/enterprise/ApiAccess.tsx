import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Key, Copy, Archive, RotateCw, CheckCircle2, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ApiAccess() {
    const { toast } = useToast();
    const [keys, setKeys] = useState([
        { id: 'pk_live_...', name: 'Production Key', created: '22 Jan 2026', lastUsed: 'Il y a 2 min', status: 'Active' },
        { id: 'pk_test_...', name: 'Test Key', created: '10 Jan 2026', lastUsed: 'Hier', status: 'Active' },
    ]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copié",
            description: "Clé API copiée dans le presse-papier",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Accès API</h1>
                    <p className="text-muted-foreground">Gérez vos clés d'API et tokens d'accès</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <FileCode className="w-4 h-4" />
                    Documentation
                </Button>
            </div>

            <div className="grid gap-6">
                <Card className="glass-card border-primary/20">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Clés API Actives</CardTitle>
                                <CardDescription>Utilisez ces clés pour authentifier vos requêtes</CardDescription>
                            </div>
                            <Button className="bg-primary/20 text-primary hover:bg-primary/30">
                                <RotateCw className="w-4 h-4 mr-2" />
                                Générer une clé
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {keys.map((key) => (
                            <div key={key.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Key className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2">
                                            {key.name}
                                            <Badge variant="outline" className="text-xs border-green-500/50 text-green-500 bg-green-500/10">
                                                {key.status}
                                            </Badge>
                                        </h4>
                                        <p className="text-sm text-muted-foreground font-mono mt-1">{key.id}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span>Créée le: {key.created}</span>
                                            <span>Dernière utilisation: {key.lastUsed}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(key.id)}>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copier
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Archive className="w-4 h-4 mr-2" />
                                        Révoquer
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Métriques d'utilisation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                                <p className="text-sm font-medium text-muted-foreground">Taux de succès</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span className="text-2xl font-bold">99.98%</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                                <p className="text-sm font-medium text-muted-foreground">Latence Moyenne</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <RotateCw className="w-5 h-5 text-blue-500" />
                                    <span className="text-2xl font-bold">45ms</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                                <p className="text-sm font-medium text-muted-foreground">Quota Mensuel</p>
                                <div className="mt-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-bold">45%</span>
                                        <span className="text-muted-foreground">45k / 100k</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full bg-primary w-[45%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
