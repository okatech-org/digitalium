/**
 * ClientsManagement - SysAdmin page for managing ecosystem clients
 * Manages Administrations, Entreprises, and displays IDN.ga citizen stats
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    MoreVertical,
    Building2,
    Calendar,
    Shield,
    Edit,
    Trash2,
    Ban,
    CheckCircle,
    Crown,
    Download,
    Eye,
    UserPlus,
    Landmark,
    Briefcase,
    Globe,
    TrendingUp,
    Activity,
    ExternalLink,
    BadgeCheck,
    RefreshCw,
    X,
    Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock Administrations data
const INITIAL_ADMINISTRATIONS = [
    { id: 'adm-1', name: 'Ministère de la Pêche', email: 'contact@peche.gouv.ga', phone: '+241 01 72 XX XX', type: 'ministry', status: 'active', users: 156, plan: 'sovereign_gov', modules: ['iDocument', 'iArchive', 'iSignature'], createdAt: '2024-06-15', lastSync: '2026-01-31 09:30' },
    { id: 'adm-2', name: 'Présidence de la République', email: 'cabinet@presidence.ga', phone: '+241 01 74 XX XX', type: 'presidency', status: 'active', users: 89, plan: 'sovereign_gov', modules: ['iDocument', 'iArchive', 'iSignature', 'DGSS'], createdAt: '2024-01-10', lastSync: '2026-01-31 10:15' },
    { id: 'adm-3', name: 'Assemblée Nationale', email: 'secretariat@assemblee.ga', phone: '+241 01 76 XX XX', type: 'parliament', status: 'active', users: 234, plan: 'sovereign_gov', modules: ['iDocument', 'iArchive'], createdAt: '2024-03-22', lastSync: '2026-01-31 08:45' },
    { id: 'adm-4', name: 'Tribunal de Libreville', email: 'greffe@justice.gouv.ga', phone: '+241 01 73 XX XX', type: 'judiciary', status: 'active', users: 67, plan: 'sovereign_gov', modules: ['iArchive', 'iSignature'], createdAt: '2024-08-05', lastSync: '2026-01-30 16:20' },
    { id: 'adm-5', name: 'Ministère de l\'Économie', email: 'contact@economie.gouv.ga', phone: '+241 01 79 XX XX', type: 'ministry', status: 'pending', users: 0, plan: 'sovereign_gov', modules: ['iDocument'], createdAt: '2026-01-28', lastSync: '-' },
];

// Mock Entreprises data
const INITIAL_ENTREPRISES = [
    { id: 'ent-1', name: 'ASCOMA Assurances', email: 'contact@ascoma.ga', phone: '+241 01 44 XX XX', sector: 'insurance', status: 'active', users: 87, plan: 'sovereign_pro', modules: ['iDocument', 'iArchive'], createdAt: '2024-09-12', subscription: '150000' },
    { id: 'ent-2', name: 'COLAS Gabon', email: 'direction@colas.ga', phone: '+241 01 76 XX XX', sector: 'construction', status: 'active', users: 156, plan: 'sovereign_enterprise', modules: ['iDocument', 'iArchive', 'iSignature'], createdAt: '2024-07-08', subscription: '350000' },
    { id: 'ent-3', name: 'BGFI Bank', email: 'corporate@bgfi.ga', phone: '+241 01 79 XX XX', sector: 'banking', status: 'active', users: 312, plan: 'sovereign_enterprise', modules: ['iDocument', 'iArchive', 'iSignature'], createdAt: '2024-02-14', subscription: '500000' },
    { id: 'ent-4', name: 'Okatech Digital', email: 'contact@okatech.ga', phone: '+241 01 77 XX XX', sector: 'technology', status: 'active', users: 24, plan: 'sovereign_pro', modules: ['iDocument', 'iArchive'], createdAt: '2025-01-05', subscription: '75000' },
    { id: 'ent-5', name: 'Olam Gabon', email: 'admin@olam.ga', phone: '+241 01 72 XX XX', sector: 'agriculture', status: 'trial', users: 45, plan: 'sovereign_pro', modules: ['iDocument'], createdAt: '2026-01-15', subscription: '0' },
];

// IDN.ga Citizen statistics (read-only)
const IDN_STATS = {
    totalCitizens: 1247853,
    verifiedCitizens: 892145,
    monthlyGrowth: 12847,
    dailySignups: 428,
    biometricVerified: 654231,
    documentsIssued: 1823456,
    lastSync: '2026-01-30T10:30:00',
};

const typeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    ministry: { label: 'Ministère', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', icon: <Landmark className="w-3 h-3" /> },
    presidency: { label: 'Présidence', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30', icon: <Crown className="w-3 h-3" /> },
    parliament: { label: 'Parlement', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30', icon: <Building2 className="w-3 h-3" /> },
    judiciary: { label: 'Justice', color: 'bg-red-500/20 text-red-500 border-red-500/30', icon: <Shield className="w-3 h-3" /> },
};

const sectorConfig: Record<string, { label: string; color: string }> = {
    insurance: { label: 'Assurance', color: 'bg-blue-500/20 text-blue-500' },
    construction: { label: 'BTP', color: 'bg-orange-500/20 text-orange-500' },
    banking: { label: 'Banque', color: 'bg-green-500/20 text-green-500' },
    technology: { label: 'Tech', color: 'bg-purple-500/20 text-purple-500' },
    agriculture: { label: 'Agriculture', color: 'bg-emerald-500/20 text-emerald-500' },
    energy: { label: 'Énergie', color: 'bg-yellow-500/20 text-yellow-600' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: 'Actif', color: 'bg-green-500/20 text-green-500' },
    pending: { label: 'En attente', color: 'bg-amber-500/20 text-amber-500' },
    trial: { label: 'Essai', color: 'bg-blue-500/20 text-blue-500' },
    suspended: { label: 'Suspendu', color: 'bg-red-500/20 text-red-500' },
};

const planConfig: Record<string, { label: string; color: string }> = {
    sovereign_gov: { label: 'Sovereign Gov', color: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
    sovereign_pro: { label: 'Sovereign Pro', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
    sovereign_enterprise: { label: 'Sovereign Enterprise', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
    citizen_premium: { label: 'Citizen Premium', color: 'bg-green-500/20 text-green-500 border-green-500/30' },
};

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatCurrency(amount: string): string {
    return new Intl.NumberFormat('fr-FR').format(parseInt(amount)) + ' XAF';
}

export default function ClientsManagement() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('administrations');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Data state
    const [administrations, setAdministrations] = useState(INITIAL_ADMINISTRATIONS);
    const [entreprises, setEntreprises] = useState(INITIAL_ENTREPRISES);

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', type: 'ministry', sector: 'technology' });
    const [isSyncing, setIsSyncing] = useState(false);

    // Filter logic
    const filteredAdmins = administrations.filter(admin => {
        const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredEnterprises = entreprises.filter(ent => {
        const matchesSearch = ent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ent.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || ent.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats
    const adminStats = {
        total: administrations.length,
        active: administrations.filter(a => a.status === 'active').length,
        totalUsers: administrations.reduce((sum, a) => sum + a.users, 0),
    };

    const enterpriseStats = {
        total: entreprises.length,
        active: entreprises.filter(e => e.status === 'active').length,
        totalUsers: entreprises.reduce((sum, e) => sum + e.users, 0),
        mrr: entreprises.reduce((sum, e) => sum + parseInt(e.subscription), 0),
    };

    // Handlers
    const handleCreateClient = () => {
        if (!newClient.name || !newClient.email) {
            toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
            return;
        }

        const id = `${activeTab === 'administrations' ? 'adm' : 'ent'}-${Date.now()}`;
        const now = new Date().toISOString().split('T')[0];

        if (activeTab === 'administrations') {
            setAdministrations(prev => [...prev, {
                id, name: newClient.name, email: newClient.email, phone: newClient.phone,
                type: newClient.type, status: 'pending', users: 0, plan: 'sovereign_gov',
                modules: ['iDocument'], createdAt: now, lastSync: '-'
            }]);
        } else {
            setEntreprises(prev => [...prev, {
                id, name: newClient.name, email: newClient.email, phone: newClient.phone,
                sector: newClient.sector, status: 'trial', users: 0, plan: 'sovereign_pro',
                modules: ['iDocument'], createdAt: now, subscription: '0'
            }]);
        }

        toast({ title: 'Client créé', description: `${newClient.name} a été ajouté avec succès` });
        setNewClient({ name: '', email: '', phone: '', type: 'ministry', sector: 'technology' });
        setIsCreateModalOpen(false);
    };

    const handleExport = () => {
        const data = activeTab === 'administrations' ? administrations : entreprises;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Export réussi', description: `${data.length} ${activeTab} exporté(e)s` });
    };

    const handleViewDetails = (client: any) => {
        setSelectedClient(client);
        setIsDetailsModalOpen(true);
    };

    const handleSuspend = (id: string, isAdmin: boolean) => {
        if (isAdmin) {
            setAdministrations(prev => prev.map(a => a.id === id ? { ...a, status: 'suspended' } : a));
        } else {
            setEntreprises(prev => prev.map(e => e.id === id ? { ...e, status: 'suspended' } : e));
        }
        toast({ title: 'Client suspendu', description: 'Le compte a été suspendu', variant: 'destructive' });
    };

    const handleSync = async () => {
        setIsSyncing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSyncing(false);
        toast({ title: 'Synchronisation terminée', description: 'Les données IDN.ga ont été mises à jour' });
    };

    const handleOpenIDN = () => {
        window.open('https://identite.ga', '_blank');
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Gestion des Clients</h1>
                    <p className="text-muted-foreground">Administration des clients écosystème Digitalium</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                    </Button>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Nouveau Client
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                    <TabsTrigger value="administrations" className="gap-2">
                        <Landmark className="h-4 w-4" />
                        Administrations
                        <Badge variant="secondary" className="ml-1 text-xs">{administrations.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="entreprises" className="gap-2">
                        <Briefcase className="h-4 w-4" />
                        Entreprises
                        <Badge variant="secondary" className="ml-1 text-xs">{entreprises.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="particuliers" className="gap-2">
                        <Users className="h-4 w-4" />
                        Particuliers
                        <Badge variant="outline" className="ml-1 text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                            <Globe className="w-3 h-3 mr-1" />
                            IDN.ga
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                {/* ADMINISTRATIONS TAB */}
                <TabsContent value="administrations" className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Institutions</p>
                                        <p className="text-2xl font-bold">{adminStats.total}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-amber-500/10">
                                        <Landmark className="w-6 h-6 text-amber-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-green-500/30">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Actives</p>
                                        <p className="text-2xl font-bold text-green-500">{adminStats.active}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-green-500/10">
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-blue-500/30">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Utilisateurs</p>
                                        <p className="text-2xl font-bold text-blue-500">{adminStats.totalUsers}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <Users className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-purple-500/30">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Plan</p>
                                        <p className="text-lg font-bold text-purple-500">Sovereign Gov</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                        <Crown className="w-6 h-6 text-purple-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher une institution..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="Statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        <SelectItem value="active">Actif</SelectItem>
                                        <SelectItem value="pending">En attente</SelectItem>
                                        <SelectItem value="suspended">Suspendu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Institutions ({filteredAdmins.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Institution</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Utilisateurs</TableHead>
                                            <TableHead>Modules</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Dernière sync</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAdmins.map((admin) => (
                                            <TableRow key={admin.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="bg-amber-500/10 text-amber-600">
                                                                {admin.name.slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{admin.name}</p>
                                                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={typeConfig[admin.type]?.color}>
                                                        {typeConfig[admin.type]?.icon}
                                                        <span className="ml-1">{typeConfig[admin.type]?.label}</span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{admin.users}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {admin.modules.map(mod => (
                                                            <Badge key={mod} variant="secondary" className="text-xs">
                                                                {mod}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={statusConfig[admin.status]?.color}>
                                                        {statusConfig[admin.status]?.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {admin.lastSync}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewDetails(admin)}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Voir détails
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => toast({ title: 'Modifier', description: `Édition de ${admin.name}` })}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Modifier
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-orange-500" onClick={() => handleSuspend(admin.id, true)}>
                                                                <Ban className="h-4 w-4 mr-2" />
                                                                Suspendre
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ENTREPRISES TAB */}
                <TabsContent value="entreprises" className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Entreprises</p>
                                        <p className="text-2xl font-bold">{enterpriseStats.total}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <Briefcase className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-green-500/30">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Actives</p>
                                        <p className="text-2xl font-bold text-green-500">{enterpriseStats.active}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-green-500/10">
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-purple-500/30">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Utilisateurs</p>
                                        <p className="text-2xl font-bold text-purple-500">{enterpriseStats.totalUsers}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-purple-500/10">
                                        <Users className="w-6 h-6 text-purple-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-emerald-500/30">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">MRR</p>
                                        <p className="text-xl font-bold text-emerald-500">{formatCurrency(enterpriseStats.mrr.toString())}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher une entreprise..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <SelectValue placeholder="Statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        <SelectItem value="active">Actif</SelectItem>
                                        <SelectItem value="trial">Essai</SelectItem>
                                        <SelectItem value="suspended">Suspendu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Entreprises ({filteredEnterprises.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Entreprise</TableHead>
                                            <TableHead>Secteur</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Utilisateurs</TableHead>
                                            <TableHead>Abonnement</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEnterprises.map((ent) => (
                                            <TableRow key={ent.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="bg-blue-500/10 text-blue-600">
                                                                {ent.name.slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{ent.name}</p>
                                                            <p className="text-sm text-muted-foreground">{ent.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={sectorConfig[ent.sector]?.color}>
                                                        {sectorConfig[ent.sector]?.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={planConfig[ent.plan]?.color}>
                                                        {planConfig[ent.plan]?.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{ent.users}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{formatCurrency(ent.subscription)}/mois</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={statusConfig[ent.status]?.color}>
                                                        {statusConfig[ent.status]?.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewDetails(ent)}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Voir détails
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => toast({ title: 'Modifier', description: `Édition de ${ent.name}` })}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Modifier
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-orange-500" onClick={() => handleSuspend(ent.id, false)}>
                                                                <Ban className="h-4 w-4 mr-2" />
                                                                Suspendre
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PARTICULIERS TAB (IDN.ga Stats - Read Only) */}
                <TabsContent value="particuliers" className="space-y-6">
                    {/* IDN.ga Banner */}
                    <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-blue-500/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-emerald-500/10">
                                        <Globe className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold">Statistiques Citoyens</h3>
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                                                <BadgeCheck className="w-3 h-3 mr-1" />
                                                Lié à IDN.ga
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground">
                                            Données synchronisées depuis la plateforme d'identité nationale (identite.ga)
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" className="gap-2" onClick={handleOpenIDN}>
                                    <ExternalLink className="h-4 w-4" />
                                    Ouvrir IDN.ga
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Card className="md:col-span-1">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Citoyens Inscrits</p>
                                        <p className="text-3xl font-bold">{formatNumber(IDN_STATS.totalCitizens)}</p>
                                        <p className="text-sm text-emerald-500 mt-1">
                                            <TrendingUp className="w-3 h-3 inline mr-1" />
                                            +{formatNumber(IDN_STATS.monthlyGrowth)} ce mois
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-blue-500/10">
                                        <Users className="w-8 h-8 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Identités Vérifiées</p>
                                        <p className="text-3xl font-bold text-green-500">{formatNumber(IDN_STATS.verifiedCitizens)}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {((IDN_STATS.verifiedCitizens / IDN_STATS.totalCitizens) * 100).toFixed(1)}% du total
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-green-500/10">
                                        <BadgeCheck className="w-8 h-8 text-green-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Biométrie Validée</p>
                                        <p className="text-3xl font-bold text-purple-500">{formatNumber(IDN_STATS.biometricVerified)}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Empreintes + Reconnaissance faciale
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-purple-500/10">
                                        <Shield className="w-8 h-8 text-purple-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Inscriptions/jour</p>
                                        <p className="text-2xl font-bold">{IDN_STATS.dailySignups}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <Activity className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Documents émis</p>
                                        <p className="text-2xl font-bold">{formatNumber(IDN_STATS.documentsIssued)}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-amber-500/10">
                                        <Building2 className="w-6 h-6 text-amber-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="md:col-span-2">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Dernière synchronisation</p>
                                        <p className="text-lg font-medium">{new Date(IDN_STATS.lastSync).toLocaleString('fr-FR')}</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="gap-2" onClick={handleSync} disabled={isSyncing}>
                                        <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                                        {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Info Notice */}
                    <Card className="border-blue-500/30 bg-blue-500/5">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                                    <Globe className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-blue-500">Données en lecture seule</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Les informations des citoyens sont gérées exclusivement par la plateforme d'identité nationale
                                        <strong> identite.ga (IDN.ga)</strong>. Pour modifier ou accéder aux profils individuels,
                                        veuillez utiliser le portail administrateur dédié.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Client Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Nouveau {activeTab === 'administrations' ? 'Administration' : 'Entreprise'}
                        </DialogTitle>
                        <DialogDescription>
                            Enregistrez un nouveau client dans l'écosystème Digitalium
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom *</Label>
                            <Input
                                id="name"
                                placeholder={activeTab === 'administrations' ? 'Ministère de...' : 'Nom de l\'entreprise'}
                                value={newClient.name}
                                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="contact@exemple.ga"
                                value={newClient.email}
                                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                                id="phone"
                                placeholder="+241 01 XX XX XX"
                                value={newClient.phone}
                                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                            />
                        </div>
                        {activeTab === 'administrations' ? (
                            <div className="space-y-2">
                                <Label>Type d'institution</Label>
                                <Select value={newClient.type} onValueChange={(value) => setNewClient({ ...newClient, type: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ministry">Ministère</SelectItem>
                                        <SelectItem value="presidency">Présidence</SelectItem>
                                        <SelectItem value="parliament">Parlement</SelectItem>
                                        <SelectItem value="judiciary">Justice</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Secteur d'activité</Label>
                                <Select value={newClient.sector} onValueChange={(value) => setNewClient({ ...newClient, sector: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="insurance">Assurance</SelectItem>
                                        <SelectItem value="construction">BTP</SelectItem>
                                        <SelectItem value="banking">Banque</SelectItem>
                                        <SelectItem value="technology">Technologie</SelectItem>
                                        <SelectItem value="agriculture">Agriculture</SelectItem>
                                        <SelectItem value="energy">Énergie</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleCreateClient}>
                            <Plus className="h-4 w-4 mr-2" />
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Modal */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Détails du client
                        </DialogTitle>
                    </DialogHeader>
                    {selectedClient && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                        {selectedClient.name?.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedClient.name}</h3>
                                    <p className="text-muted-foreground">{selectedClient.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Téléphone</p>
                                    <p className="font-medium">{selectedClient.phone || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Statut</p>
                                    <Badge className={statusConfig[selectedClient.status]?.color}>
                                        {statusConfig[selectedClient.status]?.label}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Utilisateurs</p>
                                    <p className="font-medium">{selectedClient.users}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Créé le</p>
                                    <p className="font-medium">{selectedClient.createdAt}</p>
                                </div>
                            </div>
                            {selectedClient.modules && (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Modules actifs</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {selectedClient.modules.map((mod: string) => (
                                            <Badge key={mod} variant="secondary">{mod}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                            Fermer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
