/**
 * SubscriptionsManagement - Admin page for managing subscriptions and billing
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Search,
    MoreVertical,
    Building2,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    Download,
    RefreshCw,
    Eye,
    Edit,
    Ban,
    TrendingUp,
    DollarSign,
    Users,
    FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

// Mock subscriptions data
const MOCK_SUBSCRIPTIONS = [
    { id: '1', user: 'Jean Dubois', email: 'jean@company.fr', organization: 'Tech Solutions', plan: 'Pro', price: 25000, status: 'active', billingCycle: 'monthly', nextBilling: '2025-02-15', createdAt: '2024-01-15' },
    { id: '2', user: 'Marie Kouassi', email: 'marie@startup.cm', organization: 'StartupCM', plan: 'Business', price: 99000, status: 'active', billingCycle: 'yearly', nextBilling: '2025-12-20', createdAt: '2024-03-20' },
    { id: '3', user: 'Paul Nguema', email: 'paul@gov.ga', organization: 'Ministère des Finances', plan: 'Institution', price: 500000, status: 'active', billingCycle: 'yearly', nextBilling: '2026-02-10', createdAt: '2024-02-10' },
    { id: '4', user: 'Sophie Biya', email: 'sophie@corporate.cm', organization: 'Corporate CM', plan: 'Pro', price: 25000, status: 'past_due', billingCycle: 'monthly', nextBilling: '2025-01-05', createdAt: '2024-04-05' },
    { id: '5', user: 'Amadou Diallo', email: 'amadou@startup.sn', organization: null, plan: 'Personal', price: 5000, status: 'canceled', billingCycle: 'monthly', nextBilling: null, createdAt: '2024-05-12' },
];

const MOCK_INVOICES = [
    { id: 'INV-001', user: 'Jean Dubois', amount: 25000, status: 'paid', date: '2025-01-15', paidAt: '2025-01-15' },
    { id: 'INV-002', user: 'Marie Kouassi', amount: 99000, status: 'paid', date: '2025-01-10', paidAt: '2025-01-10' },
    { id: 'INV-003', user: 'Sophie Biya', amount: 25000, status: 'overdue', date: '2025-01-05', paidAt: null },
    { id: 'INV-004', user: 'Paul Nguema', amount: 500000, status: 'paid', date: '2024-12-10', paidAt: '2024-12-10' },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    active: { label: 'Actif', color: 'bg-green-500/20 text-green-500', icon: <CheckCircle className="w-3 h-3" /> },
    trialing: { label: 'Essai', color: 'bg-blue-500/20 text-blue-500', icon: <Clock className="w-3 h-3" /> },
    past_due: { label: 'Impayé', color: 'bg-orange-500/20 text-orange-500', icon: <AlertTriangle className="w-3 h-3" /> },
    canceled: { label: 'Annulé', color: 'bg-red-500/20 text-red-500', icon: <XCircle className="w-3 h-3" /> },
};

const invoiceStatusConfig: Record<string, { label: string; color: string }> = {
    paid: { label: 'Payé', color: 'bg-green-500/20 text-green-500' },
    pending: { label: 'En attente', color: 'bg-blue-500/20 text-blue-500' },
    overdue: { label: 'Impayé', color: 'bg-red-500/20 text-red-500' },
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF';
}

export default function SubscriptionsManagement() {
    const [subscriptions] = useState(MOCK_SUBSCRIPTIONS);
    const [invoices] = useState(MOCK_INVOICES);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch =
            sub.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'active').length,
        mrr: subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.price, 0),
        pastDue: subscriptions.filter(s => s.status === 'past_due').length,
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Abonnements</h1>
                    <p className="text-muted-foreground">Gestion des abonnements et facturation</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/adminis/billing">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Admin Billing
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <CreditCard className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-green-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Actifs</p>
                                <p className="text-2xl font-bold text-green-500">{stats.active}</p>
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
                                <p className="text-sm text-muted-foreground">MRR</p>
                                <p className="text-xl font-bold text-purple-500">{formatCurrency(stats.mrr)}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <TrendingUp className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-orange-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Impayés</p>
                                <p className="text-2xl font-bold text-orange-500">{stats.pastDue}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <AlertTriangle className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="subscriptions">
                <TabsList>
                    <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
                    <TabsTrigger value="invoices">Factures</TabsTrigger>
                </TabsList>

                <TabsContent value="subscriptions" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher..."
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
                                        <SelectItem value="past_due">Impayé</SelectItem>
                                        <SelectItem value="canceled">Annulé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subscriptions Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Abonnements ({filteredSubscriptions.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Utilisateur</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Prix</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Prochaine facturation</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSubscriptions.map((sub) => (
                                            <TableRow key={sub.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{sub.user}</p>
                                                        <p className="text-sm text-muted-foreground">{sub.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{sub.plan}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{formatCurrency(sub.price)}</p>
                                                        <p className="text-xs text-muted-foreground">/{sub.billingCycle === 'monthly' ? 'mois' : 'an'}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={statusConfig[sub.status]?.color}>
                                                        {statusConfig[sub.status]?.icon}
                                                        <span className="ml-1">{statusConfig[sub.status]?.label}</span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {sub.nextBilling || '-'}
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
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Modifier le plan
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-500">
                                                                <Ban className="h-4 w-4 mr-2" />
                                                                Annuler
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

                <TabsContent value="invoices" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Factures récentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>N° Facture</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Montant</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-mono">{invoice.id}</TableCell>
                                            <TableCell>{invoice.user}</TableCell>
                                            <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={invoiceStatusConfig[invoice.status]?.color}>
                                                    {invoiceStatusConfig[invoice.status]?.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{invoice.date}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">
                                                    <Download className="h-4 w-4 mr-1" />
                                                    PDF
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
