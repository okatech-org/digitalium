import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileBarChart, Download, Calendar, Filter } from 'lucide-react';

export default function Reports() {
    const reports = [
        { title: 'Rapport Annuel 2025', category: 'Général', date: '15 Jan 2026', size: '12 MB' },
        { title: 'Statistiques État Civil Q4', category: 'Démographie', date: '05 Jan 2026', size: '2.5 MB' },
        { title: 'Usage Services Numériques', category: 'Digital', date: '01 Jan 2026', size: '5.8 MB' },
        { title: 'Audit Sécurité Publique', category: 'Sécurité', date: '20 Dec 2025', size: '8.4 MB' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Rapports & Transparence</h1>
                    <p className="text-muted-foreground">Bibliothèque des documents officiels et statistiques</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        2026
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filtres
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {reports.map((report, i) => (
                    <Card key={i} className="glass-card">
                        <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
                                    <FileBarChart className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{report.title}</h3>
                                    <p className="text-sm text-muted-foreground">{report.category} • {report.date}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">{report.size}</span>
                                <Button className="gap-2" variant="secondary">
                                    <Download className="w-4 h-4" />
                                    Télécharger
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
