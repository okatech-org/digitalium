import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    CreditCard,
    Download,
    FileText,
    CheckCircle2,
    AlertCircle,
    Zap,
    Users,
    HardDrive,
    ArrowUpRight,
    History
} from 'lucide-react';

export default function BillingPro() {
    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">Facturation Pro</h1>
                    <p className="text-sm text-muted-foreground">Gestion de l'abonnement entreprise</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Tout télécharger
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 h-full min-h-0">

                {/* Column 1: Current Plan */}
                <Card className="glass-card flex flex-col min-h-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            Abonnement Actif
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 text-white">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg">Enterprise Elite</h3>
                                    <p className="text-xs text-slate-400">Facturation Annuelle</p>
                                </div>
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">ACTIF</Badge>
                            </div>
                            <div className="text-2xl font-bold mb-4">
                                2.5M <span className="text-sm font-normal text-slate-400">FCFA / an</span>
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Renouvellement le 24 Jan 2027
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Moyen de paiement</h4>
                            <div className="flex items-center gap-4 p-3 rounded-lg border bg-background/50">
                                <div className="p-2 rounded bg-blue-500/10 text-blue-500">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Visa ending in 4242</p>
                                    <p className="text-xs text-muted-foreground">Expire le 12/28</p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 text-xs">Modifier</Button>
                            </div>
                        </div>

                        <div className="pt-4 mt-auto">
                            <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 border">
                                <ArrowUpRight className="w-4 h-4 mr-2" />
                                Changer de plan
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Column 2: Usage Stats */}
                <Card className="glass-card flex flex-col min-h-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <History className="w-4 h-4 text-blue-500" />
                            Consommation Mensuelle
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 overflow-y-auto custom-scrollbar">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    Sièges Utilisateurs
                                </span>
                                <span className="font-mono">12 / 20</span>
                            </div>
                            <Progress value={60} className="h-2" />
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-muted-foreground" />
                                    Appels API
                                </span>
                                <span className="font-mono">845k / 1M</span>
                            </div>
                            <Progress value={84.5} className="h-2" />
                            <p className="text-xs text-amber-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Seuil d'alerte (80%) atteint
                            </p>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                                    Stockage Cloud
                                </span>
                                <span className="font-mono">450GB / 1TB</span>
                            </div>
                            <Progress value={45} className="h-2" />
                        </div>

                        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground border mt-4">
                            Votre cycle de facturation se réinitialise dans <strong>12 jours</strong>.
                        </div>
                    </CardContent>
                </Card>

                {/* Column 3: Invoices */}
                <Card className="glass-card flex flex-col min-h-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-500" />
                            Historique Factures
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-y-auto custom-scrollbar p-0">
                        <div className="divide-y divide-border/50">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-muted">
                                            <FileText className="w-4 h-4 text-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Facture #{2024000 + i}</p>
                                            <p className="text-xs text-muted-foreground">24 Jan 2026</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm">208,000 FCFA</p>
                                        <div className="flex items-center justify-end gap-2 mt-1">
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-green-500/30 text-green-500 bg-green-500/10">Payée</Badge>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <Download className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
