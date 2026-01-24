import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Siren, Send } from 'lucide-react';

export default function Alerts() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Système d'Alerte National</h1>
                <p className="text-muted-foreground">Diffusion multicanal d'informations critiques</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card border-red-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                            <Siren className="w-5 h-5" />
                            Nouvelle Diffusion
                        </CardTitle>
                        <CardDescription>Envoyer une notification push et SMS à la population</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Niveau d'urgence</label>
                            <div className="flex gap-2">
                                <Badge className="bg-yellow-500 hover:bg-yellow-600 cursor-pointer">Information</Badge>
                                <Badge className="bg-orange-500 hover:bg-orange-600 cursor-pointer">Vigilance</Badge>
                                <Badge className="bg-red-500 hover:bg-red-600 cursor-pointer border-2 border-transparent hover:border-white">CRITIQUE</Badge>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Message</label>
                            <Textarea placeholder="Saisissez le message d'alerte ici..." className="h-32 bg-background/50" />
                            <p className="text-xs text-muted-foreground text-right">0 / 160 caractères (SMS)</p>
                        </div>
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
                            <Send className="w-4 h-4" />
                            Diffuser l'alerte
                        </Button>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Historique des Alertes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="border-orange-500 text-orange-500">Vigilance Crue</Badge>
                                <span className="text-xs text-muted-foreground">15 Oct 2025</span>
                            </div>
                            <p className="text-sm">Risque de montée des eaux dans le district d'Abidjan. Évitez les zones inondables.</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                                Portée: 2.4M destinataires • Taux de réception: 98%
                            </div>
                        </div>
                        <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="border-blue-500 text-blue-500">Campagne Santé</Badge>
                                <span className="text-xs text-muted-foreground">01 Sep 2025</span>
                            </div>
                            <p className="text-sm">Début de la campagne de vaccination nationale. Rendez-vous dans les centres agréés.</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                                Portée: 12M destinataires • Taux de réception: 95%
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
