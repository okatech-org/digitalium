/**
 * TeamManagementPage - Gestion d'équipe
 * Manage team members, roles, and permissions
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    UserPlus,
    Mail,
    Shield,
    MoreVertical,
    Search,
    Filter,
    Crown,
    Eye,
    Edit,
    Trash2,
    Check,
    X,
    Clock,
    Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type MemberRole = 'admin' | 'manager' | 'member' | 'viewer';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: MemberRole;
    department?: string;
    joinedAt: number;
    lastActiveAt?: number;
    status: 'active' | 'pending' | 'suspended';
}

const ROLE_CONFIG: Record<MemberRole, { label: string; color: string; icon: typeof Crown }> = {
    admin: { label: 'Administrateur', color: 'text-red-500 bg-red-500/10', icon: Crown },
    manager: { label: 'Gestionnaire', color: 'text-orange-500 bg-orange-500/10', icon: Shield },
    member: { label: 'Membre', color: 'text-blue-500 bg-blue-500/10', icon: Users },
    viewer: { label: 'Lecteur', color: 'text-gray-500 bg-gray-500/10', icon: Eye },
};

// Mock data
const MOCK_MEMBERS: TeamMember[] = [
    {
        id: '1',
        name: 'Jean Ndong',
        email: 'j.ndong@entreprise.ga',
        role: 'admin',
        department: 'Direction',
        joinedAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 2 * 60 * 60 * 1000,
        status: 'active',
    },
    {
        id: '2',
        name: 'Marie Obame',
        email: 'm.obame@entreprise.ga',
        role: 'manager',
        department: 'Comptabilité',
        joinedAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 30 * 60 * 1000,
        status: 'active',
    },
    {
        id: '3',
        name: 'Pierre Mba',
        email: 'p.mba@entreprise.ga',
        role: 'member',
        department: 'RH',
        joinedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
        lastActiveAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        status: 'active',
    },
    {
        id: '4',
        name: 'Sophie Ella',
        email: 's.ella@entreprise.ga',
        role: 'viewer',
        department: 'Juridique',
        joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        status: 'pending',
    },
];

export default function TeamManagementPage() {
    const [members, setMembers] = useState<TeamMember[]>(MOCK_MEMBERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<MemberRole>('member');

    const filteredMembers = members.filter(m => {
        if (roleFilter !== 'all' && m.role !== roleFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
        }
        return true;
    });

    const stats = {
        total: members.length,
        active: members.filter(m => m.status === 'active').length,
        pending: members.filter(m => m.status === 'pending').length,
    };

    const handleInvite = () => {
        // Mock invite
        const newMember: TeamMember = {
            id: crypto.randomUUID(),
            name: inviteEmail.split('@')[0],
            email: inviteEmail,
            role: inviteRole,
            joinedAt: Date.now(),
            status: 'pending',
        };
        setMembers([...members, newMember]);
        setInviteEmail('');
        setIsInviteOpen(false);
    };

    const handleUpdateRole = (memberId: string, newRole: MemberRole) => {
        setMembers(members.map(m =>
            m.id === memberId ? { ...m, role: newRole } : m
        ));
    };

    const handleRemove = (memberId: string) => {
        setMembers(members.filter(m => m.id !== memberId));
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Gestion d'Équipe</h1>
                    <p className="text-muted-foreground">
                        Gérez les membres et leurs permissions
                    </p>
                </div>
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Inviter un membre
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Inviter un nouveau membre</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Adresse email</Label>
                                <Input
                                    type="email"
                                    placeholder="email@exemple.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Rôle</Label>
                                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as MemberRole)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                                            <SelectItem key={key} value={key}>
                                                {config.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="w-full" onClick={handleInvite} disabled={!inviteEmail}>
                                <Mail className="h-4 w-4 mr-2" />
                                Envoyer l'invitation
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Users className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-xs text-muted-foreground">Total membres</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Check className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.active}</p>
                                <p className="text-xs text-muted-foreground">Actifs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Clock className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                                <p className="text-xs text-muted-foreground">En attente</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un membre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filtrer par rôle" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les rôles</SelectItem>
                        {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                                {config.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Members List */}
            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {filteredMembers.map((member) => (
                            <MemberRow
                                key={member.id}
                                member={member}
                                onUpdateRole={handleUpdateRole}
                                onRemove={handleRemove}
                            />
                        ))}
                        {filteredMembers.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Aucun membre trouvé</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function MemberRow({
    member,
    onUpdateRole,
    onRemove,
}: {
    member: TeamMember;
    onUpdateRole: (id: string, role: MemberRole) => void;
    onRemove: (id: string) => void;
}) {
    const roleConfig = ROLE_CONFIG[member.role];
    const RoleIcon = roleConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
        >
            <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary">
                    {member.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{member.name}</span>
                    {member.status === 'pending' && (
                        <Badge variant="outline" className="text-xs text-orange-500 border-orange-500/30">
                            En attente
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>

            {member.department && (
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {member.department}
                </div>
            )}

            <Select
                value={member.role}
                onValueChange={(v) => onUpdateRole(member.id, v as MemberRole)}
            >
                <SelectTrigger className={cn('w-40', roleConfig.color)}>
                    <RoleIcon className="h-4 w-4 mr-2" />
                    <span>{roleConfig.label}</span>
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                            {config.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onRemove(member.id)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Retirer
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </motion.div>
    );
}
