/**
 * SubscriptionsSysAdmin - SysAdmin page for managing ecosystem subscriptions
 * Manages sovereign plans across Administrations, Entreprises, and Citoyens
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Search,
    MoreVertical,
    Building2,
    Calendar,
    CheckCircle,
    Download,
    Eye,
    TrendingUp,
    TrendingDown,
    Activity,
    BadgeCheck,
    Globe,
    AlertTriangle,
    RefreshCw,
    Receipt,
    Wallet,
    Crown,
    Briefcase,
    Users,
    ArrowUpRight,
    Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Mock Subscriptions data - Demo Mode: Only Ministère de la Pêche and ASCOMA
const MOCK_SUBSCRIPTIONS = [
    { id: 'SUB-001', client: 'Ministère de la Pêche et des Mers', email: 'dsi@peche.gouv.ga', type: 'administration', plan: 'sovereign_gov', status: 'active', amount: 0, billingCycle: 'annual', users: 156, storage: '500 GB', nextBilling: '2026-12-31', createdAt: '2024-01-15', verified: true },
    { id: 'SUB-002', client: 'ASCOMA Assurances', email: 'direction@ascoma.ga', type: 'enterprise', plan: 'sovereign_pro', status: 'active', amount: 150000, billingCycle: 'monthly', users: 87, storage: '100 GB', nextBilling: '2026-02-28', createdAt: '2024-01-20', verified: true },
];

// Mock Invoices - Demo Mode: Only ASCOMA (Ministère de la Pêche is on convention)
const MOCK_INVOICES = [
    { id: 'INV-2026-001', client: 'ASCOMA Assurances', amount: 150000, status: 'paid', date: '2026-01-28', paidAt: '2026-01-29' },
    { id: 'INV-2025-012', client: 'ASCOMA Assurances', amount: 150000, status: 'paid', date: '2025-12-28', paidAt: '2025-12-30' },
    { id: 'INV-2025-011', client: 'ASCOMA Assurances', amount: 150000, status: 'paid', date: '2025-11-28', paidAt: '2025-11-29' },
];

// Aggregated stats - Demo Mode: Only Ministère de la Pêche + ASCOMA
const STATS = {
    mrr: 150000, // ASCOMA only (Ministère is on convention)
    arr: 1800000, // 150000 * 12
    activeSubscriptions: 2,
    trialSubscriptions: 0,
    overdueSubscriptions: 0,
    churnRate: 0,
    totalUsers: 243, // 156 + 87
    citizenPremium: {
        active: 23456,
        mrr: 117280000, // 23456 * 5000
        verified: 21892,
    },
};

const planConfig: Record<string, { label: string; color: string; price: string }> = {
    sovereign_gov: { label: 'Sovereign Gov', color: 'bg-amber-500/20 text-amber-600 border-amber-500/30', price: 'Sur convention' },
    sovereign_pro: { label: 'Sovereign Pro', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', price: '150,000 XAF/mois' },
    sovereign_enterprise: { label: 'Sovereign Enterprise', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30', price: '350,000+ XAF/mois' },
    citizen_premium: { label: 'Citizen Premium', color: 'bg-green-500/20 text-green-500 border-green-500/30', price: '5,000 XAF/mois' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: 'Actif', color: 'bg-green-500/20 text-green-500' },
    pending: { label: 'En attente', color: 'bg-amber-500/20 text-amber-500' },
    trial: { label: 'Essai', color: 'bg-blue-500/20 text-blue-500' },
    overdue: { label: 'Impayé', color: 'bg-red-500/20 text-red-500' },
    canceled: { label: 'Annulé', color: 'bg-gray-500/20 text-gray-500' },
};

const invoiceStatusConfig: Record<string, { label: string; color: string }> = {
    paid: { label: 'Payé', color: 'bg-green-500/20 text-green-500' },
    pending: { label: 'En attente', color: 'bg-amber-500/20 text-amber-500' },
    overdue: { label: 'Impayé', color: 'bg-red-500/20 text-red-500' },
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF';
}

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

export default function SubscriptionsSysAdmin() {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredSubscriptions = MOCK_SUBSCRIPTIONS.filter(sub => {
        const matchesSearch = sub.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Abonnements Souverains</h1>
                    <p className="text-muted-foreground">Gestion des abonnements écosystème Digitalium</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                    </Button>
                    <Button variant="outline">
                        <Receipt className="h-4 w-4 mr-2" />
                        Factures
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/50">
                    <TabsTrigger value="overview" className="gap-2">
                        <Activity className="h-4 w-4" />
                        Vue d'ensemble
                    </TabsTrigger>
                    <TabsTrigger value="subscriptions" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Abonnements
                    </TabsTrigger>
                    <TabsTrigger value="invoices" className="gap-2">
                        <Receipt className="h-4 w-4" />
                        Factures
                    </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Revenue Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="border-emerald-500/30">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">MRR Entreprises</p>
                                        <p className="text-2xl font-bold text-emerald-500">{formatCurrency(STATS.mrr)}</p>
                                        <p className="text-xs text-green-500 mt-1 flex items-center">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            +8.2% vs mois précédent
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-500/10">
                                        <Wallet className="w-8 h-8 text-emerald-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">ARR Projeté</p>
                                        <p className="text-2xl font-bold">{formatCurrency(STATS.arr)}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-blue-500/10">
                                        <TrendingUp className="w-8 h-8 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Abonnements Actifs</p>
                                        <p className="text-2xl font-bold">{STATS.activeSubscriptions}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            +{STATS.trialSubscriptions} en essai
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-purple-500/10">
                                        <CreditCard className="w-8 h-8 text-purple-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-red-500/30">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Churn Rate</p>
                                        <p className="text-2xl font-bold">{STATS.churnRate}%</p>
                                        <p className="text-xs text-red-500 mt-1 flex items-center">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            {STATS.overdueSubscriptions} impayé(s)
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-red-500/10">
                                        <TrendingDown className="w-8 h-8 text-red-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Plans Distribution - Demo Mode */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Crown className="h-5 w-5 text-amber-500" />
                                    Sovereign Gov
                                </CardTitle>
                                <CardDescription>Administrations & Institutions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Client</span>
                                        <span className="font-bold">Ministère de la Pêche</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Utilisateurs</span>
                                        <span className="font-bold">156</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Facturation</span>
                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600">Convention</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-blue-500" />
                                    Sovereign Pro
                                </CardTitle>
                                <CardDescription>PME & Entreprises</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Client</span>
                                        <span className="font-bold">ASCOMA Assurances</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">MRR</span>
                                        <span className="font-bold text-emerald-500">150,000 XAF</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Utilisateurs</span>
                                        <span className="font-medium">87</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Citizen Premium - IDN.ga Link */}
                    <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-blue-500/5">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <Users className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            Citizen Premium
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                                                <BadgeCheck className="w-3 h-3 mr-1" />
                                                Lié à IDN.ga
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>Abonnements particuliers via identite.ga</CardDescription>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Globe className="w-4 h-4" />
                                    Portail IDN.ga
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-muted-foreground">Abonnés Actifs</p>
                                    <p className="text-3xl font-bold">{formatNumber(STATS.citizenPremium.active)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">MRR Citoyens</p>
                                    <p className="text-3xl font-bold text-emerald-500">{formatCurrency(STATS.citizenPremium.mrr)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Vérifiés IDN.ga</p>
                                    <p className="text-3xl font-bold text-blue-500">{formatNumber(STATS.citizenPremium.verified)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        ({((STATS.citizenPremium.verified / STATS.citizenPremium.active) * 100).toFixed(1)}%)
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SUBSCRIPTIONS TAB */}
                <TabsContent value="subscriptions" className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher un client..."
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
                                        <SelectItem value="pending">En attente</SelectItem>
                                        <SelectItem value="overdue">Impayé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Abonnements ({filteredSubscriptions.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[450px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Utilisateurs</TableHead>
                                            <TableHead>Montant</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Prochaine échéance</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSubscriptions.map((sub) => (
                                            <TableRow key={sub.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className={sub.type === 'administration' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}>
                                                                {sub.client.slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium">{sub.client}</p>
                                                                {sub.verified && (
                                                                    <BadgeCheck className="w-4 h-4 text-emerald-500" />
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">{sub.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={planConfig[sub.plan]?.color}>
                                                        {planConfig[sub.plan]?.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{sub.users}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">
                                                        {sub.amount > 0 ? formatCurrency(sub.amount) + '/mois' : 'Convention'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={statusConfig[sub.status]?.color}>
                                                        {statusConfig[sub.status]?.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {sub.nextBilling ? (
                                                        <span className={sub.status === 'overdue' ? 'text-red-500' : 'text-muted-foreground'}>
                                                            {sub.nextBilling}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Voir détails
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Receipt className="h-4 w-4 mr-2" />
                                                                Factures
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-orange-500">
                                                                <Clock className="h-4 w-4 mr-2" />
                                                                Rappel de paiement
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

                {/* INVOICES TAB */}
                <TabsContent value="invoices" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Factures récentes</CardTitle>
                            <CardDescription>Historique des factures émises</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>N° Facture</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Montant</TableHead>
                                            <TableHead>Date émission</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Date paiement</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {MOCK_INVOICES.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                                                <TableCell className="font-medium">{invoice.client}</TableCell>
                                                <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                                                <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={invoiceStatusConfig[invoice.status]?.color}>
                                                        {invoiceStatusConfig[invoice.status]?.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {invoice.paidAt || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
