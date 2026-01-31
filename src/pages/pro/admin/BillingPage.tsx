/**
 * BillingPage - Facturation Pro
 * Subscription management, invoices, and payment methods
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Receipt,
    Download,
    Check,
    Crown,
    Zap,
    Building2,
    Calendar,
    ArrowUpRight,
    Plus,
    Trash2,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useOrganizationContext } from '@/hooks/useOrganizationContext';

interface Plan {
    id: string;
    name: string;
    price: number;
    period: 'month' | 'year';
    features: string[];
    limits: {
        storage: number;
        users: number;
        documents: number;
    };
    popular?: boolean;
}

interface Invoice {
    id: string;
    date: number;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    pdfUrl: string;
}

const PLANS: Plan[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: 25000,
        period: 'month',
        features: ['5 utilisateurs', '10 Go stockage', '500 documents/mois', 'Support email'],
        limits: { storage: 10, users: 5, documents: 500 },
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 75000,
        period: 'month',
        features: ['20 utilisateurs', '50 Go stockage', 'Documents illimités', 'API Access', 'Support prioritaire'],
        limits: { storage: 50, users: 20, documents: -1 },
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 200000,
        period: 'month',
        features: ['Utilisateurs illimités', '500 Go stockage', 'Documents illimités', 'API Premium', 'Account manager', 'SLA 99.9%'],
        limits: { storage: 500, users: -1, documents: -1 },
    },
    {
        id: 'institutional',
        name: 'Institutionnel',
        price: 0,
        period: 'year',
        features: ['Utilisateurs illimités', '100 Go stockage', 'Documents illimités', 'API Gouvernementale', 'Support dédié', 'Souveraineté données'],
        limits: { storage: 100, users: -1, documents: -1 },
    },
];

const MOCK_INVOICES: Invoice[] = [
    { id: 'INV-2026-001', date: Date.now() - 5 * 24 * 60 * 60 * 1000, amount: 75000, status: 'paid', pdfUrl: '#' },
    { id: 'INV-2025-012', date: Date.now() - 35 * 24 * 60 * 60 * 1000, amount: 75000, status: 'paid', pdfUrl: '#' },
    { id: 'INV-2025-011', date: Date.now() - 65 * 24 * 60 * 60 * 1000, amount: 75000, status: 'paid', pdfUrl: '#' },
];

export default function BillingPage() {
    const orgContext = useOrganizationContext();

    // Find the current plan based on organization context
    const currentPlan = PLANS.find(p => p.name === orgContext.planName) || PLANS[1];
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

    const usage = {
        storage: { used: orgContext.storageUsed, limit: orgContext.storageTotalGB },
        users: { used: orgContext.members.length, limit: currentPlan.limits.users },
        documents: { used: orgContext.stats.documents.value, limit: currentPlan.limits.documents },
    };

    const nextBillingDate = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000);

    // Organization billing info
    const billingInfo = {
        name: orgContext.name,
        address: orgContext.address,
        city: `${orgContext.city}, ${orgContext.country}`,
        nif: orgContext.nif,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Facturation</h1>
                <p className="text-muted-foreground">
                    Gérez votre abonnement et vos moyens de paiement
                </p>
            </div>

            {/* Current Plan */}
            <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <Crown className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold">Plan {currentPlan.name}</h2>
                                    <Badge className="bg-primary/20 text-primary">Actif</Badge>
                                </div>
                                <p className="text-muted-foreground">
                                    {currentPlan.price.toLocaleString('fr-FR')} FCFA/mois
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Prochain paiement</p>
                            <p className="font-medium">
                                {nextBillingDate.toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Usage bars */}
                    <div className="grid grid-cols-3 gap-6 mt-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Stockage</span>
                                <span>{usage.storage.used} / {usage.storage.limit} Go</span>
                            </div>
                            <Progress value={(usage.storage.used / usage.storage.limit) * 100} />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Utilisateurs</span>
                                <span>{usage.users.used} / {usage.users.limit}</span>
                            </div>
                            <Progress value={(usage.users.used / usage.users.limit) * 100} />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Documents</span>
                                <span>{usage.documents.used.toLocaleString()} / ∞</span>
                            </div>
                            <Progress value={35} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Plans */}
            <div>
                <h3 className="font-semibold mb-4">Changer de plan</h3>
                <div className="grid grid-cols-3 gap-4">
                    {PLANS.map((plan) => (
                        <Card
                            key={plan.id}
                            className={cn(
                                'relative transition-all',
                                plan.id === currentPlan.id && 'border-primary',
                                plan.popular && 'ring-2 ring-primary/20'
                            )}
                        >
                            {plan.popular && (
                                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                                    Populaire
                                </Badge>
                            )}
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>
                                    <span className="text-2xl font-bold text-foreground">
                                        {plan.price.toLocaleString('fr-FR')}
                                    </span>
                                    <span className="text-muted-foreground"> FCFA/mois</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 mb-4">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className="w-full"
                                    variant={plan.id === currentPlan.id ? 'secondary' : 'default'}
                                    disabled={plan.id === currentPlan.id}
                                >
                                    {plan.id === currentPlan.id ? 'Plan actuel' : 'Choisir'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Payment Method */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Moyen de paiement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded">
                                    <CreditCard className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="font-medium">•••• •••• •••• 4242</p>
                                    <p className="text-xs text-muted-foreground">Expire 12/2027</p>
                                </div>
                            </div>
                            <Badge variant="outline">Par défaut</Badge>
                        </div>
                        <Button variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter une carte
                        </Button>
                    </CardContent>
                </Card>

                {/* Billing Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Informations de facturation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p className="font-medium">Entreprise Demo SARL</p>
                            <p className="text-muted-foreground">123 Boulevard Triomphal</p>
                            <p className="text-muted-foreground">Libreville, Gabon</p>
                            <p className="text-muted-foreground">NIF: GA12345678</p>
                        </div>
                        <Button variant="link" className="px-0 mt-2">
                            Modifier
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Invoices */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Historique des factures
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        {MOCK_INVOICES.map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-4">
                                    <Receipt className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{invoice.id}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(invoice.date).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-medium">
                                        {invoice.amount.toLocaleString('fr-FR')} FCFA
                                    </span>
                                    <Badge
                                        variant={invoice.status === 'paid' ? 'secondary' : 'destructive'}
                                        className={invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' : ''}
                                    >
                                        {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                                    </Badge>
                                    <Button variant="ghost" size="icon">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
