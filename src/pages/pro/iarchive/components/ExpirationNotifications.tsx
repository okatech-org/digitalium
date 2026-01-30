/**
 * ExpirationNotifications Component
 * 
 * Dashboard showing documents approaching or past their retention expiration.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Bell,
    AlertTriangle,
    Clock,
    Calendar,
    FileText,
    Folder,
    Archive,
    Trash2,
    RefreshCw,
    CheckCircle2,
    ExternalLink,
    Filter
} from 'lucide-react';

// Types
export interface ExpiringDocument {
    id: string;
    title: string;
    reference?: string;
    type: string;
    folderPath: string;
    createdAt: Date;
    expirationDate: Date;
    daysUntilExpiration: number;
    retentionCategory: string;
    retentionYears: number;
    finalDisposition: 'destroy' | 'archive_permanent' | 'sample';
    hasBeenNotified: boolean;
    notificationSentAt?: Date;
}

interface ExpirationNotificationsProps {
    documents?: ExpiringDocument[];
    onArchive?: (documentIds: string[]) => Promise<void>;
    onDestroy?: (documentIds: string[]) => Promise<void>;
    onExtend?: (documentId: string, additionalYears: number) => Promise<void>;
    onViewDocument?: (documentId: string) => void;
}

const DISPOSITION_ACTIONS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    destroy: { label: 'À détruire', icon: <Trash2 className="h-4 w-4" />, color: 'text-red-500' },
    archive_permanent: { label: 'À archiver', icon: <Archive className="h-4 w-4" />, color: 'text-green-500' },
    sample: { label: 'À échantillonner', icon: <FileText className="h-4 w-4" />, color: 'text-amber-500' },
};

// Demo data
const DEMO_DOCUMENTS: ExpiringDocument[] = [
    {
        id: 'doc-1',
        title: 'Factures 2014 - Lot Q4',
        reference: 'FAC-2014-Q4',
        type: 'invoice',
        folderPath: '/Archives/Comptabilité/2014',
        createdAt: new Date('2014-12-31'),
        expirationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        daysUntilExpiration: -5,
        retentionCategory: 'FIS-01',
        retentionYears: 10,
        finalDisposition: 'destroy',
        hasBeenNotified: true,
        notificationSentAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'doc-2',
        title: 'Contrat fournisseur ABC',
        reference: 'CTR-2019-042',
        type: 'contract',
        folderPath: '/Archives/Contrats/2019',
        createdAt: new Date('2019-03-15'),
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        daysUntilExpiration: 7,
        retentionCategory: 'CTR-01',
        retentionYears: 5,
        finalDisposition: 'destroy',
        hasBeenNotified: true,
        notificationSentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'doc-3',
        title: 'Rapport annuel 2019',
        reference: 'RAP-2019',
        type: 'report',
        folderPath: '/Archives/Rapports/2019',
        createdAt: new Date('2019-12-31'),
        expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        daysUntilExpiration: 15,
        retentionCategory: 'PRJ-01',
        retentionYears: 5,
        finalDisposition: 'sample',
        hasBeenNotified: false,
    },
    {
        id: 'doc-4',
        title: 'Statuts société v2',
        reference: 'STAT-2020',
        type: 'legal',
        folderPath: '/Archives/Juridique/Statuts',
        createdAt: new Date('2020-01-01'),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        daysUntilExpiration: 30,
        retentionCategory: 'JUR-01',
        retentionYears: 30,
        finalDisposition: 'archive_permanent',
        hasBeenNotified: false,
    },
    {
        id: 'doc-5',
        title: 'Dossier employé - Dupont Jean',
        reference: 'RH-2015-089',
        type: 'hr',
        folderPath: '/Archives/RH/Dossiers',
        createdAt: new Date('2015-06-01'),
        expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        daysUntilExpiration: 60,
        retentionCategory: 'SOC-01',
        retentionYears: 50,
        finalDisposition: 'archive_permanent',
        hasBeenNotified: false,
    },
];

export function ExpirationNotifications({
    documents = DEMO_DOCUMENTS,
    onArchive,
    onDestroy,
    onExtend,
    onViewDocument,
}: ExpirationNotificationsProps) {
    const [selectedTab, setSelectedTab] = useState('overdue');
    const [filterDisposition, setFilterDisposition] = useState<string>('all');
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Categorize documents
    const overdueDocuments = documents.filter(d => d.daysUntilExpiration < 0);
    const urgentDocuments = documents.filter(d => d.daysUntilExpiration >= 0 && d.daysUntilExpiration <= 7);
    const upcomingDocuments = documents.filter(d => d.daysUntilExpiration > 7 && d.daysUntilExpiration <= 30);
    const futureDocuments = documents.filter(d => d.daysUntilExpiration > 30);

    const filterByDisposition = (docs: ExpiringDocument[]) => {
        if (filterDisposition === 'all') return docs;
        return docs.filter(d => d.finalDisposition === filterDisposition);
    };

    const getTabDocuments = () => {
        switch (selectedTab) {
            case 'overdue': return filterByDisposition(overdueDocuments);
            case 'urgent': return filterByDisposition(urgentDocuments);
            case 'upcoming': return filterByDisposition(upcomingDocuments);
            case 'future': return filterByDisposition(futureDocuments);
            default: return [];
        }
    };

    const handleBatchArchive = async () => {
        setIsProcessing(true);
        if (onArchive) {
            await onArchive(selectedDocs);
        }
        setSelectedDocs([]);
        setIsProcessing(false);
    };

    const handleBatchDestroy = async () => {
        setIsProcessing(true);
        if (onDestroy) {
            await onDestroy(selectedDocs);
        }
        setSelectedDocs([]);
        setIsProcessing(false);
    };

    const DocumentCard = ({ doc }: { doc: ExpiringDocument }) => {
        const disposition = DISPOSITION_ACTIONS[doc.finalDisposition];
        const isSelected = selectedDocs.includes(doc.id);
        const isOverdue = doc.daysUntilExpiration < 0;
        const isUrgent = doc.daysUntilExpiration >= 0 && doc.daysUntilExpiration <= 7;

        return (
            <Card
                className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''
                    } ${isOverdue ? 'border-red-500/50' : isUrgent ? 'border-amber-500/50' : ''}`}
                onClick={() => setSelectedDocs(prev =>
                    prev.includes(doc.id) ? prev.filter(id => id !== doc.id) : [...prev, doc.id]
                )}
            >
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium truncate">{doc.title}</span>
                                {doc.reference && (
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {doc.reference}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Folder className="h-3 w-3" />
                                <span className="truncate">{doc.folderPath}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className={disposition.color} variant="outline">
                                    {disposition.icon}
                                    <span className="ml-1">{disposition.label}</span>
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    {doc.retentionCategory}
                                </Badge>
                                {isOverdue ? (
                                    <Badge variant="destructive" className="text-xs">
                                        Expiré il y a {Math.abs(doc.daysUntilExpiration)} jours
                                    </Badge>
                                ) : isUrgent ? (
                                    <Badge className="bg-amber-500 text-xs">
                                        Expire dans {doc.daysUntilExpiration} jours
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs">
                                        Expire dans {doc.daysUntilExpiration} jours
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDocument?.(doc.id);
                            }}
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card className={overdueDocuments.length > 0 ? 'border-red-500/50' : ''}>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className={`p-2 rounded-full ${overdueDocuments.length > 0 ? 'bg-red-500/10' : 'bg-muted'}`}>
                            <AlertTriangle className={`h-5 w-5 ${overdueDocuments.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${overdueDocuments.length > 0 ? 'text-red-500' : ''}`}>
                                {overdueDocuments.length}
                            </p>
                            <p className="text-xs text-muted-foreground">Expirés</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className={urgentDocuments.length > 0 ? 'border-amber-500/50' : ''}>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className={`p-2 rounded-full ${urgentDocuments.length > 0 ? 'bg-amber-500/10' : 'bg-muted'}`}>
                            <Clock className={`h-5 w-5 ${urgentDocuments.length > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${urgentDocuments.length > 0 ? 'text-amber-500' : ''}`}>
                                {urgentDocuments.length}
                            </p>
                            <p className="text-xs text-muted-foreground">7 jours</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-500/10">
                            <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{upcomingDocuments.length}</p>
                            <p className="text-xs text-muted-foreground">30 jours</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{futureDocuments.length}</p>
                            <p className="text-xs text-muted-foreground">+30 jours</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions bar */}
            {selectedDocs.length > 0 && (
                <Card className="border-primary">
                    <CardContent className="py-3 flex items-center justify-between">
                        <span className="text-sm">
                            <strong>{selectedDocs.length}</strong> document{selectedDocs.length > 1 ? 's' : ''} sélectionné{selectedDocs.length > 1 ? 's' : ''}
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedDocs([])}>
                                Désélectionner
                            </Button>
                            <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={handleBatchArchive}
                                disabled={isProcessing}
                            >
                                <Archive className="h-4 w-4 mr-1" />
                                Archiver
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleBatchDestroy}
                                disabled={isProcessing}
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Détruire
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tab navigation */}
            <Card>
                <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            Notifications d'Expiration
                        </CardTitle>
                        <Select value={filterDisposition} onValueChange={setFilterDisposition}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filtrer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les sorts</SelectItem>
                                <SelectItem value="destroy">À détruire</SelectItem>
                                <SelectItem value="archive_permanent">À archiver</SelectItem>
                                <SelectItem value="sample">À échantillonner</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                        <TabsList className="w-full">
                            <TabsTrigger value="overdue" className="flex-1">
                                Expirés ({overdueDocuments.length})
                            </TabsTrigger>
                            <TabsTrigger value="urgent" className="flex-1">
                                Urgents ({urgentDocuments.length})
                            </TabsTrigger>
                            <TabsTrigger value="upcoming" className="flex-1">
                                Ce mois ({upcomingDocuments.length})
                            </TabsTrigger>
                            <TabsTrigger value="future" className="flex-1">
                                Planifiés ({futureDocuments.length})
                            </TabsTrigger>
                        </TabsList>

                        <ScrollArea className="h-[350px] mt-4">
                            <div className="space-y-3 pr-4">
                                {getTabDocuments().length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <CheckCircle2 className="h-12 w-12 text-green-500/30 mb-4" />
                                        <p className="text-muted-foreground">Aucun document dans cette catégorie</p>
                                    </div>
                                ) : (
                                    getTabDocuments().map((doc) => (
                                        <DocumentCard key={doc.id} doc={doc} />
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

export default ExpirationNotifications;
