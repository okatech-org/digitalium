import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Globe, AlertOctagon } from 'lucide-react';

export default function SecuritySysAdmin() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Sécurité Système</h1>
                <p className="text-muted-foreground">Centre des opérations de sécurité (SOC)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Score de Sécurité</CardTitle>
                        <Shield className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">A+</div>
                        <p className="text-xs text-muted-foreground">0 vulnérabilités critiques</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attaques Bloquées</CardTitle>
                        <Shield className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">14,203</div>
                        <p className="text-xs text-muted-foreground">Dernières 24h</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Certificats SSL</CardTitle>
                        <Lock className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-500">Valid</div>
                        <p className="text-xs text-muted-foreground">Expire dans 89 jours</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Menaces Détectées</CardTitle>
                        <CardDescription>Alertes de sécurité récentes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-4 p-3 rounded-lg border bg-background/50">
                                <AlertOctagon className="w-5 h-5 text-red-500 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-sm">SQL Injection Attempt</h4>
                                    <p className="text-xs text-muted-foreground mb-1">Source: 45.33.22.11 • Target: /api/login</p>
                                    <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10 text-[10px]">BLOCKED</Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Règles Firewall (WAF)</CardTitle>
                        <CardDescription>Dernières mises à jour</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                            <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Block GEO: NK, IR, RU</span>
                            </div>
                            <Switch checked={true} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                            <div className="flex items-center gap-3">
                                <Shield className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Rate Limiting (Strict)</span>
                            </div>
                            <Switch checked={true} />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                            <div className="flex items-center gap-3">
                                <Lock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Force TLS 1.3</span>
                            </div>
                            <Switch checked={true} />
                        </div>
                        <Button className="w-full mt-2" variant="outline">Gérer les règles</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Switch({ checked }: { checked: boolean }) {
    return (
        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
    )
}
