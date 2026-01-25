/**
 * UsersManagement - Admin page for managing platform users
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
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
    RefreshCw,
    Eye,
    UserPlus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Mock users data
const MOCK_USERS = [
    { id: '1', name: 'Jean Dubois', email: 'jean@company.fr', phone: '+237 699 123 456', role: 'admin', status: 'active', organization: 'Tech Solutions', plan: 'pro', createdAt: '2024-01-15', lastLogin: '2025-01-25' },
    { id: '2', name: 'Marie Kouassi', email: 'marie@startup.cm', phone: '+237 677 234 567', role: 'user', status: 'active', organization: 'StartupCM', plan: 'business', createdAt: '2024-03-20', lastLogin: '2025-01-24' },
    { id: '3', name: 'Paul Nguema', email: 'paul@gov.ga', phone: '+241 06 345 678', role: 'user', status: 'active', organization: 'Ministère des Finances', plan: 'institution', createdAt: '2024-02-10', lastLogin: '2025-01-23' },
    { id: '4', name: 'Sophie Biya', email: 'sophie@corporate.cm', phone: '+237 655 456 789', role: 'manager', status: 'inactive', organization: 'Corporate CM', plan: 'pro', createdAt: '2024-04-05', lastLogin: '2024-12-15' },
    { id: '5', name: 'Amadou Diallo', email: 'amadou@startup.sn', phone: '+221 77 567 890', role: 'user', status: 'suspended', organization: null, plan: 'personal', createdAt: '2024-05-12', lastLogin: '2024-11-01' },
];

const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    admin: { label: 'Admin', color: 'bg-red-500/20 text-red-500', icon: <Crown className="w-3 h-3" /> },
    manager: { label: 'Manager', color: 'bg-purple-500/20 text-purple-500', icon: <Shield className="w-3 h-3" /> },
    user: { label: 'Utilisateur', color: 'bg-blue-500/20 text-blue-500', icon: <Users className="w-3 h-3" /> },
};

const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: 'Actif', color: 'bg-green-500/20 text-green-500' },
    inactive: { label: 'Inactif', color: 'bg-gray-500/20 text-gray-500' },
    suspended: { label: 'Suspendu', color: 'bg-red-500/20 text-red-500' },
};

const planColors: Record<string, string> = {
    personal: 'bg-gray-500/20 text-gray-500',
    pro: 'bg-blue-500/20 text-blue-500',
    business: 'bg-purple-500/20 text-purple-500',
    institution: 'bg-amber-500/20 text-amber-600',
};

export default function UsersManagement() {
    const [users] = useState(MOCK_USERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        admins: users.filter(u => u.role === 'admin').length,
        thisMonth: users.filter(u => new Date(u.createdAt) > new Date('2024-12-01')).length,
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Utilisateurs</h1>
                    <p className="text-muted-foreground">Gestion des utilisateurs de la plateforme</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                    </Button>
                    <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Inviter
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
                                <Users className="w-6 h-6 text-blue-500" />
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
                <Card className="border-red-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Admins</p>
                                <p className="text-2xl font-bold text-red-500">{stats.admins}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <Crown className="w-6 h-6 text-red-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-purple-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Ce mois</p>
                                <p className="text-2xl font-bold text-purple-500">{stats.thisMonth}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Calendar className="w-6 h-6 text-purple-500" />
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
                                placeholder="Rechercher par nom, email ou organisation..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Rôle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les rôles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="user">Utilisateur</SelectItem>
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
                                <SelectItem value="suspended">Suspendu</SelectItem>
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
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Dernière connexion</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {user.name.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={roleConfig[user.role]?.color}>
                                                {roleConfig[user.role]?.icon}
                                                <span className="ml-1">{roleConfig[user.role]?.label}</span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.organization ? (
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{user.organization}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={planColors[user.plan]}>
                                                {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={statusConfig[user.status]?.color}>
                                                {statusConfig[user.status]?.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {user.lastLogin}
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
                                                        Modifier
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        Changer le rôle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-orange-500">
                                                        <Ban className="h-4 w-4 mr-2" />
                                                        Suspendre
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Supprimer
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
        </div>
    );
}
