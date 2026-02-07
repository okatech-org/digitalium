import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { formatXAF, formatBytes } from '@/contexts/FirebaseBillingContext';
import {
  ArrowLeft,
  Search,
  CreditCard,
  Users,
  TrendingUp,
  DollarSign,
  FileText,
  Package,
  Loader2,
  Eye,
  RefreshCw,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Plan, Subscription, Invoice } from '@/types/billing';

interface SubscriptionWithUser extends Subscription {
  profiles?: {
    display_name: string | null;
  };
  plans?: Plan;
}

// Get Cloud Functions instance (europe-west1 region)
const functions = getFunctions(undefined, 'europe-west1');
const getAdminSubscriptionsFunc = httpsCallable<unknown, { subscriptions: SubscriptionWithUser[] }>(functions, 'getAdminSubscriptions');
const getAdminInvoicesFunc = httpsCallable<unknown, { invoices: Invoice[] }>(functions, 'getAdminInvoices');
const getPlansFunc = httpsCallable<unknown, { plans: Plan[] }>(functions, 'getPlans');

export default function AdminBilling() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('subscriptions');

  // Stats
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchSubscriptions(),
      fetchInvoices(),
      fetchPlans(),
    ]);
    setIsLoading(false);
  };

  const fetchSubscriptions = async () => {
    try {
      const result = await getAdminSubscriptionsFunc({});
      const subs = result.data.subscriptions || [];
      setSubscriptions(subs);

      // Calculate stats
      const active = subs.filter(s => s.status === 'active').length;
      const monthlyRev = subs
        .filter(s => s.status === 'active')
        .reduce((acc, s) => acc + (s.plans?.price_xaf || 0), 0);

      setStats(prev => ({
        ...prev,
        totalSubscriptions: subs.length,
        activeSubscriptions: active,
        monthlyRevenue: monthlyRev,
      }));
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const result = await getAdminInvoicesFunc({});
      const invs = result.data.invoices || [];
      setInvoices(invs);

      // Calculate total revenue from paid invoices
      const totalRev = invs
        .filter(i => i.status === 'paid')
        .reduce((acc, i) => acc + i.total_xaf, 0);

      setStats(prev => ({
        ...prev,
        totalRevenue: totalRev,
      }));
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const result = await getPlansFunc({});
      setPlans(result.data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
      active: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
      trialing: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <Clock className="w-3 h-3" /> },
      past_due: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: <AlertCircle className="w-3 h-3" /> },
      canceled: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: <XCircle className="w-3 h-3" /> },
      expired: { color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: <XCircle className="w-3 h-3" /> },
    };
    const labels: Record<string, string> = {
      active: 'Actif',
      trialing: 'Essai',
      past_due: 'En retard',
      canceled: 'Annulé',
      expired: 'Expiré',
    };
    const c = config[status] || config.expired;
    return (
      <Badge variant="outline" className={c.color}>
        {c.icon}
        <span className="ml-1">{labels[status] || status}</span>
      </Badge>
    );
  };

  const getInvoiceStatusBadge = (status: string) => {
    const config: Record<string, { color: string }> = {
      paid: { color: 'bg-green-500/10 text-green-500 border-green-500/20' },
      pending: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      overdue: { color: 'bg-red-500/10 text-red-500 border-red-500/20' },
      draft: { color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
    };
    const labels: Record<string, string> = {
      paid: 'Payée',
      pending: 'En attente',
      overdue: 'En retard',
      draft: 'Brouillon',
    };
    return (
      <Badge variant="outline" className={config[status]?.color || ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch =
      sub.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plans?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen cortex-grid">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/sysadmin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-xl">Gestion Billing</h1>
              <p className="text-sm text-muted-foreground">Abonnements et factures</p>
            </div>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Abonnements</p>
                  <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Actifs</p>
                  <p className="text-2xl font-bold text-green-500">{stats.activeSubscriptions}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenu mensuel</p>
                  <p className="text-2xl font-bold text-blue-500">{formatXAF(stats.monthlyRevenue)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenu total</p>
                  <p className="text-2xl font-bold text-amber-500">{formatXAF(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Abonnements
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Factures
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Plans
            </TabsTrigger>
          </TabsList>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div>
                    <CardTitle>Abonnements</CardTitle>
                    <CardDescription>Liste de tous les abonnements</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 bg-muted/50"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 bg-muted/50">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="trialing">Essai</SelectItem>
                        <SelectItem value="past_due">En retard</SelectItem>
                        <SelectItem value="canceled">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredSubscriptions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucun abonnement trouvé
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Fin période</TableHead>
                          <TableHead>Paiement</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubscriptions.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell>
                              <span className="font-medium">
                                {sub.profiles?.display_name || 'Utilisateur'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {sub.plans?.display_name || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatXAF(sub.plans?.price_xaf || 0)}/mois</TableCell>
                            <TableCell>{getStatusBadge(sub.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(sub.current_period_end), 'dd MMM yyyy', { locale: fr })}
                            </TableCell>
                            <TableCell className="text-sm">
                              {sub.payment_method?.replace(/_/g, ' ') || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle>Factures</CardTitle>
                <CardDescription>Historique des factures</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucune facture trouvée
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Numéro</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Paiement</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-mono text-sm">{invoice.number}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {invoice.issued_at
                                ? format(new Date(invoice.issued_at), 'dd MMM yyyy', { locale: fr })
                                : '-'}
                            </TableCell>
                            <TableCell className="font-medium">{formatXAF(invoice.total_xaf)}</TableCell>
                            <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                            <TableCell className="text-sm">
                              {invoice.payment_method?.replace(/_/g, ' ') || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle>Plans tarifaires</CardTitle>
                <CardDescription>Configuration des plans d'abonnement</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                      <Card key={plan.id} className={`${!plan.is_active ? 'opacity-50' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                            <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                              {plan.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                          <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Type</span>
                              <Badge variant="outline">{plan.type}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Prix mensuel</span>
                              <span className="font-medium">{formatXAF(plan.price_xaf)}</span>
                            </div>
                            {plan.price_yearly_xaf && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Prix annuel</span>
                                <span className="font-medium">{formatXAF(plan.price_yearly_xaf)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Stockage</span>
                              <span>{formatBytes(plan.storage_bytes)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Documents</span>
                              <span>{plan.max_documents === -1 ? 'Illimité' : plan.max_documents}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">IA/jour</span>
                              <span>{plan.ai_requests_per_day === -1 ? 'Illimité' : plan.ai_requests_per_day}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
