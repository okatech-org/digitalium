import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building, ExternalLink, Settings } from 'lucide-react';

export default function Partners() {
    const partners = [
        { name: 'Banque Atlantique', type: 'Finance', status: 'active', apiAccess: 'Full' },
        { name: 'Orange CI', type: 'Telecom', status: 'active', apiAccess: 'Limited' },
        { name: 'CIE', type: 'Utilities', status: 'active', apiAccess: 'Read-Only' },
        { name: 'Croix Rouge', type: 'NGO', status: 'pending', apiAccess: 'None' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Partenaires</h1>
                    <p className="text-muted-foreground">Écosystème et intégrations tierces</p>
                </div>
                <Button className="gap-2">
                    <Building className="w-4 h-4" />
                    Ajouter un Partenaire
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner) => (
                    <Card key={partner.name} className="glass-card">
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <Avatar className="h-12 w-12 rounded-lg border">
                                <AvatarFallback className="rounded-lg bg-muted text-lg font-bold">
                                    {partner.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="text-base">{partner.name}</CardTitle>
                                <CardDescription>{partner.type}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className={partner.status === 'active' ? 'text-green-500 font-medium capitalize' : 'text-yellow-500 font-medium capitalize'}>
                                        {partner.status}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">API Scope</span>
                                    <span className="font-mono text-xs">{partner.apiAccess}</span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Config
                                    </Button>
                                    <Button variant="ghost" size="icon">
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
