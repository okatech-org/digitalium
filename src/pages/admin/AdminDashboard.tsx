/**
 * AdminDashboard - Overview stats and quick actions for platform administration
 *
 * Connected to adminService backend (RBAC + Organizations Cloud Functions)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    UserPlus,
    CreditCard,
    TrendingUp,
    Building2,
    Activity,
    HardDrive,
    Clock,
    Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDesignTheme } from '@/contexts/DesignThemeContext';
import adminService, { type Organization, type AuditLogEntry } from '@/lib/adminService';
import { useToast } from '@/hooks/use-toast';

function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Il y a un instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    return `Il y a ${diffD}j`;
}

const actionLabels: Record<string, { message: string; type: string }> = {
    assign_role: { message: "R\u00F4le attribu\u00E9", type: "user" },
    remove_role: { message: "R\u00F4le retir\u00E9", type: "user" },
    create_org: { message: "Organisation cr\u00E9\u00E9e", type: "organization" },
    update_org: { message: "Organisation mise \u00E0 jour", type: "organization" },
    invite_user: { message: "Invitation envoy\u00E9e", type: "lead" },
    accept_invitation: { message: "Invitation accept\u00E9e", type: "user" },
    revoke_invitation: { message: "Invitation r\u00E9voqu\u00E9e", type: "user" },
    remove_member: { message: "Membre retir\u00E9", type: "user" },
};

export default function AdminDashboard() {
    const { designTheme } = useDesignTheme();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [userCount, setUserCount] = useState(0);
    const [orgCount, setOrgCount] = useState(0);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [recentActivity, setRecentActivity] = useState<AuditLogEntry[]>([]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [usersData, orgsData, auditData] = await Promise.all([
                adminService.listUsers({ limit: 1 }),
                adminService.getOrganizations({ limit: 50 }),
                adminService.getAuditLog({ limit: 10 }),
            ]);
            setUserCount(usersData.count);
            setOrganizations(orgsData.organizations);
            setOrgCount(orgsData.organizations.length);
            setRecentActivity(auditData.logs);
        } catch (error) {
            console.error("Failed to load admin dashboard:", error);
            toast({ title: "Erreur", description: "Impossible de charger le tableau de bord.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { loadData(); }, [loadData]);

    const totalMembers = organizations.reduce((acc, o) => acc + o.member_count, 0);
    const storageUsedTB = organizations.reduce((acc, o) => acc + o.storage_quota_bytes, 0) / (1024 ** 4);
    const storageTotalTB = 5;
    const storagePercent = Math.min((storageUsedTB / storageTotalTB) * 100, 100);

    const getThemeCardClass = () => {
        switch (designTheme) {
            case 'classic': return 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-200/80 dark:border-slate-600/60 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300';
            case 'vintage3d': return 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-600 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300';
            default: return '';
        }
    };
    const themeCardClass = getThemeCardClass();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Administration</h1>
                    <p className="text-muted-foreground">Vue d'ensemble de la plateforme</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/admin/analytics"><Activity className="h-4 w-4 mr-2" />Analytiques</Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: Users, color: 'blue', label: 'Utilisateurs', value: totalMembers || userCount },
                    { icon: Building2, color: 'orange', label: 'Organisations', value: orgCount },
                    { icon: CreditCard, color: 'emerald', label: 'Actives', value: organizations.filter(o => o.status === 'active').length },
                    { icon: TrendingUp, color: 'purple', label: 'Actions', value: recentActivity.length },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className={themeCardClass}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2 rounded-lg bg-${stat.color}-500/10`}>
                                        <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className={themeCardClass}>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><HardDrive className="h-5 w-5" />Stockage</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>{storageUsedTB.toFixed(1)} TB allou\u00E9s</span>
                                    <span>{storageTotalTB} TB total</span>
                                </div>
                                <Progress value={storagePercent} className="h-3" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground">Organisations</p><p className="font-semibold">{orgCount}</p></div>
                                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground">Membres</p><p className="font-semibold">{totalMembers}</p></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(themeCardClass, "lg:col-span-2")}>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5" />Activit\u00E9 r\u00E9cente</CardTitle></CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px]">
                            <div className="space-y-3">
                                {recentActivity.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucune activit\u00E9 r\u00E9cente</p>}
                                {recentActivity.map(activity => {
                                    const label = actionLabels[activity.action] || { message: activity.action, type: "user" };
                                    return (
                                        <div key={activity.id} className="flex items-center gap-3">
                                            <div className={cn('p-2 rounded-lg', label.type === 'user' && 'bg-blue-500/10', label.type === 'organization' && 'bg-purple-500/10', label.type === 'lead' && 'bg-orange-500/10')}>
                                                {label.type === 'user' && <Users className="h-4 w-4 text-blue-500" />}
                                                {label.type === 'organization' && <Building2 className="h-4 w-4 text-purple-500" />}
                                                {label.type === 'lead' && <UserPlus className="h-4 w-4 text-orange-500" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm"><span className="font-medium">{label.message}</span>{activity.target_id && <span className="text-muted-foreground"> - {activity.target_id.slice(0, 8)}...</span>}</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{formatTimeAgo(activity.created_at)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            <Card className={themeCardClass}>
                <CardHeader><CardTitle className="text-lg">Acc\u00E8s rapides</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { href: '/admin/leads', icon: UserPlus, color: 'orange', label: 'Leads', sub: 'G\u00E9rer' },
                            { href: '/admin/users', icon: Users, color: 'blue', label: 'Utilisateurs', sub: 'G\u00E9rer' },
                            { href: '/admin/subscriptions', icon: CreditCard, color: 'emerald', label: 'Abonnements', sub: 'Facturation' },
                            { href: '/admin/organizations', icon: Building2, color: 'purple', label: 'Organisations', sub: `${orgCount} actives` },
                        ].map((item, i) => (
                            <Link key={i} to={item.href}>
                                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                                    <CardContent className="pt-6 text-center">
                                        <div className={`p-3 rounded-xl bg-${item.color}-500/10 w-fit mx-auto mb-3`}>
                                            <item.icon className={`h-6 w-6 text-${item.color}-500`} />
                                        </div>
                                        <p className="font-medium">{item.label}</p>
                                        <p className="text-sm text-muted-foreground">{item.sub}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
