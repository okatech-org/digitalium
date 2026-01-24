import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Landmark, Plane, FileText, Briefcase, Calculator } from 'lucide-react';

export default function ServicesConfig() {
    const services = [
        { id: 'passport', name: 'Demande Passeport', category: 'Identité', icon: Plane, status: true, sla: '72h' },
        { id: 'visa', name: 'E-Visa Tourisme', category: 'Immigration', icon: Landmark, status: true, sla: '24h' },
        { id: 'taxes', name: 'Déclaration Impôts', category: 'Finance', icon: Calculator, status: true, sla: 'Immédiat' },
        { id: 'business', name: 'Création Entreprise', category: 'Économie', icon: Briefcase, status: false, sla: '5 jours' },
        { id: 'land', name: 'Titres Fonciers', category: 'Urbanisme', icon: FileText, status: true, sla: '15 jours' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Services Publics</h1>
                    <p className="text-muted-foreground">Configuration du catalogue de téléservices</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <Card key={service.id} className="glass-card hover:border-primary/30 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Badge variant="outline" className="bg-muted/50">{service.category}</Badge>
                            <Switch checked={service.status} />
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-500">
                                    <service.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{service.name}</h3>
                                    <p className="text-xs text-muted-foreground">SLA Cible: {service.sla}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline" className="w-full">Configurer</Button>
                                <Button size="sm" variant="outline" className="w-full">Logs</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
