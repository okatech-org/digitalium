import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Smartphone, Globe, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Security() {
    const [logs] = useState([
        { id: 1, action: 'Connexion réussie', user: 'Alex Martin', ip: '192.168.1.1', location: 'Paris, FR', time: 'À l\'instant', status: 'success' },
        { id: 2, action: 'Modification API Key', user: 'Sarah Jones', ip: '10.0.0.42', location: 'Lyon, FR', time: 'Il y a 2h', status: 'warning' },
        { id: 3, action: 'Tentative échouée', user: 'unknown', ip: '45.32.12.9', location: 'Moscow, RU', time: 'Il y a 5h', status: 'danger' },
    ]);

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold gradient-text">Sécurité</h1>
                <p className="text-muted-foreground">Audit de sécurité et configuration</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Double Authentification (2FA)
                        </CardTitle>
                        <CardDescription>Renforcez la sécurité de votre compte</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
                            <div className="space-y-0.5">
                                <Label className="text-base">Authenticator App</Label>
                                <p className="text-sm text-muted-foreground">Utilisez Google Auth ou Authy</p>
                            </div>
                            <Switch checked={true} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
                            <div className="space-y-0.5">
                                <Label className="text-base">SMS Backup</Label>
                                <p className="text-sm text-muted-foreground">Code de secours par SMS</p>
                            </div>
                            <Switch checked={false} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Sessions Actives</CardTitle>
                        <CardDescription>Appareils connectés récemment</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Chrome sur MacOS</p>
                                <p className="text-xs text-muted-foreground">Paris, France • Actif maintenant</p>
                            </div>
                            <Badge variant="outline" className="text-green-500 border-green-500/50">Actuel</Badge>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Safari sur iPhone 14</p>
                                <p className="text-xs text-muted-foreground">Lyon, France • Il y a 3h</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive h-8 text-xs">Déconnecter</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Journal d'Audit</CardTitle>
                    <CardDescription>Historique des actions sensibles</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {logs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border-b last:border-0 border-border/50">
                                <div className="flex items-center gap-4">
                                    {log.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                    {log.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                                    {log.status === 'danger' && <Shield className="w-4 h-4 text-red-500" />}
                                    <div>
                                        <p className="font-medium text-sm">{log.action}</p>
                                        <p className="text-xs text-muted-foreground">{log.user} • {log.ip}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{log.location}</p>
                                    <p className="text-xs text-muted-foreground">{log.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
