/**
 * UsersManagement - Admin page for managing platform users
 *
 * Connected to adminService backend (RBAC Cloud Functions)
 */

import React, { useState, useEffect, useCallback } from 'react';
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
    Clock,
    Crown,
    Download,
    Eye,
    UserPlus,
    Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import adminService, { type PlatformUser, type PlatformRole } from '@/lib/adminService';
import { useToast } from '@/hooks/use-toast';

const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    system_admin: { label: 'Sys Admin', color: 'bg-red-500/20 text-red-500', icon: <Crown className="w-3 h-3" /> },
    platform_admin: { label: 'Admin', color: 'bg-red-500/20 text-red-500', icon: <Crown className="w-3 h-3" /> },
    org_admin: { label: 'Org Admin', color: 'bg-orange-500/20 text-orange-500', icon: <Shield className="w-3 h-3" /> },
    org_manager: { label: 'Manager', color: 'bg-purple-500/20 text-purple-500', icon: <Shield className="w-3 h-3" /> },
    org_member: { label: 'Membre', color: 'bg-blue-500/20 text-blue-500', icon: <Users className="w-3 h-3" /> },
    org_viewer: { label: 'Viewer', color: 'bg-gray-500/20 text-gray-500', icon: <Eye className="w-3 h-3" /> },
};

const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: 'Actif', color: 'bg-green-500/20 text-green-500' },
    inactive: { label: 'Inactif', color: 'bg-gray-500/20 text-gray-500' },
    suspended: { label: 'Suspendu', color: 'bg-red-500/20 text-red-500' },
};

const ROLES: { value: PlatformRole; label: string }[] = [
    { value: 'system_admin', label: 'System Admin' },
    { value: 'platform_admin', label: 'Platform Admin' },
    { value: 'org_admin', label: 'Org Admin' },
    { value: 'org_manager', label: 'Manager' },
    { value: 'org_member', label: 'Membre' },
    { value: 'org_viewer', label: 'Viewer' },
];

export default function UsersManagement() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Role change dialog
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
    const [newRole, setNewRole] = useState<PlatformRole>('org_member');
    const [roleChanging, setRoleChanging] = useState(false);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminService.listUsers({
                searchTerm: searchTerm || undefined,
                roleFilter: roleFilter !== 'all' ? roleFilter : undefined,
                limit: 100,
            });
            setUsers(data.users);
            setTotalCount(data.count);
        } catch (error) {
            console.error('Failed to load users:', error);
            toast({ title: 'Erreur', description: 'Impossible de charger les utilisateurs.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [searchTerm, roleFilter, toast]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Client-side status filter
    const filteredUsers = users.filter(user => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'active') return user.role_active === true;
        if (statusFilter === 'inactive') return user.role_active === false || user.platform_role === null;
        return true;
    });

    const getUserStatus = (user: PlatformUser): string => {
        if (user.role_active === true) return 'active';
        if (user.platform_role === null) return 'inactive';
        return 'inactive';
    };

    const stats = {
        total: totalCount,
        active: users.filter(u => u.role_active === true).length,
        admins: users.filter(u => u.platform_role === 'system_admin' || u.platform_role === 'platform_admin').length,
        thisMonth: users.filter(u => {
            const d = new Date(u.created_at);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length,
    };

    const handleOpenRoleDialog = (user: PlatformUser) => {
        setSelectedUser(user);
        setNewRole(user.platform_role || 'org_member');
        setRoleDialogOpen(true);
    };

    const handleAssignRole = async () => {
        if (!selectedUser) return;
        try {
            setRoleChanging(true);
            await adminService.assignRole(
                selectedUser.user_id,
                newRole,
                selectedUser.organization_id || undefined,
            );
            toast({ title: 'Rôle modifié', description: `${selectedUser.display_name} est maintenant ${roleConfig[newRole]?.label || newRole}.` });
            setRoleDialogOpen(false);
            loadUsers();
        } catch (error) {
            console.error('Failed to assign role:', error);
            toast({ title: 'Erreur', description: 'Impossible de changer le rôle.', variant: 'destructive' });
        } finally {
            setRoleChanging(false);
        }
    };

    const handleRemoveRole = async (user: PlatformUser) => {
        try {
            await adminService.removeRole(user.user_id, user.organization_id || undefined);
            toast({ title: 'Rôle retiré', description: `Le rôle de ${user.display_name} a été retiré.` });
            loadUsers();
        } catch (error) {
            console.error('Failed to remove role:', error);
            toast({ title: 'Erreur', description: 'Impossible de retirer le rôle.', variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Utilisateurs</h1>
                    <p className="text-muted-foreground">Gestion des utilisateurs de la plateforme</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadUsers}>
                        <Download className="h-4 w-4 mr-2" />
                        Actualiser
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: Users, color: 'blue' },
                    { label: 'Actifs', value: stats.active, icon: CheckCircle, color: 'green' },
                    { label: 'Admins', value: stats.admins, icon: Crown, color: 'red' },
                    { label: 'Ce mois', value: stats.thisMonth, icon: Calendar, color: 'purple' },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className={stat.color === 'green' ? 'border-green-500/30' : stat.color === 'red' ? 'border-red-500/30' : stat.color === 'purple' ? 'border-purple-500/30' : ''}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                        <p className={`text-2xl font-bold ${stat.color !== 'blue' ? `text-${stat.color}-500` : ''}`}>{stat.value}</p>
                                    </div>
                                    <div className={`p-2 rounded-lg bg-${stat.color}-500/10`}>
                                        <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par nom, email ou organisation..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Rôle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les rôles</SelectItem>
                                <SelectItem value="system_admin">Sys Admin</SelectItem>
                                <SelectItem value="platform_admin">Admin</SelectItem>
                                <SelectItem value="org_admin">Org Admin</SelectItem>
                                <SelectItem value="org_manager">Manager</SelectItem>
                                <SelectItem value="org_member">Membre</SelectItem>
                                <SelectItem value="org_viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                <SelectItem value="active">Actif</SelectItem>
                                <SelectItem value="inactive">Inactif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[500px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Utilisateur</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Organisation</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Inscrit le</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => {
                                    const status = getUserStatus(user);
                                    const role = user.platform_role || 'org_viewer';
                                    return (
                                        <TableRow key={user.user_id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {user.display_name?.slice(0, 2).toUpperCase() || '??'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{user.display_name || 'Sans nom'}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.platform_role ? (
                                                    <Badge variant="secondary" className={roleConfig[role]?.color}>
                                                        {roleConfig[role]?.icon}
                                                        <span className="ml-1">{roleConfig[role]?.label}</span>
                                                    </Badge>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">Aucun rôle</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {user.organization_name ? (
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{user.organization_name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={statusConfig[status]?.color}>
                                                    {statusConfig[status]?.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleOpenRoleDialog(user)}>
                                                            <Shield className="h-4 w-4 mr-2" />
                                                            Changer le rôle
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-500"
                                                            onClick={() => handleRemoveRole(user)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Retirer le rôle
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            Aucun utilisateur trouvé
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Role Change Dialog */}
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Changer le rôle</DialogTitle>
                        <DialogDescription>
                            {selectedUser && (
                                <>Modifier le rôle de <strong>{selectedUser.display_name}</strong> ({selectedUser.email})</>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newRole} onValueChange={(v) => setNewRole(v as PlatformRole)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLES.map(r => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleAssignRole} disabled={roleChanging}>
                            {roleChanging && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Confirmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
