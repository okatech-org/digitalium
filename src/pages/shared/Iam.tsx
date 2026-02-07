/**
 * IAM & Accès - Identity and Access Management
 *
 * Connected to adminService backend (RBAC + Organizations Cloud Functions)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    Key,
    Plus,
    MoreVertical,
    Search,
    CheckCircle2,
    XCircle,
    Loader2,
    Users,
    Crown,
    Eye,
    Building2,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import adminService, { type PlatformUser, type PlatformRole, type UserRoleInfo } from '@/lib/adminService';
import { useToast } from '@/hooks/use-toast';

const ROLE_LABELS: Record<string, string> = {
    system_admin: 'System Admin',
    platform_admin: 'Platform Admin',
    org_admin: 'Org Admin',
    org_manager: 'Manager',
    org_member: 'Membre',
    org_viewer: 'Viewer',
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
    system_admin: ['read:*', 'write:*', 'delete:*', 'admin:platform', 'admin:organizations', 'admin:users'],
    platform_admin: ['read:*', 'write:*', 'admin:organizations', 'admin:users'],
    org_admin: ['read:org', 'write:org', 'admin:org_members', 'admin:org_settings'],
    org_manager: ['read:org', 'write:documents', 'write:signatures', 'manage:team'],
    org_member: ['read:org', 'write:documents', 'write:signatures'],
    org_viewer: ['read:org', 'read:documents'],
};

const ROLES: { value: PlatformRole; label: string }[] = [
    { value: 'system_admin', label: 'System Admin' },
    { value: 'platform_admin', label: 'Platform Admin' },
    { value: 'org_admin', label: 'Org Admin' },
    { value: 'org_manager', label: 'Manager' },
    { value: 'org_member', label: 'Membre' },
    { value: 'org_viewer', label: 'Viewer' },
];

function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'En ligne';
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    return `Il y a ${diffD}j`;
}

export default function Iam() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<PlatformUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Role change dialog
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState<PlatformRole>('org_member');
    const [roleChanging, setRoleChanging] = useState(false);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminService.listUsers({
                searchTerm: searchQuery || undefined,
                limit: 100,
            });
            setUsers(data.users);
            if (data.users.length > 0 && !selectedUserId) {
                setSelectedUserId(data.users[0].user_id);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            toast({ title: 'Erreur', description: 'Impossible de charger les utilisateurs.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [searchQuery, toast]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const activeUser = users.find(u => u.user_id === selectedUserId) || users[0];
    const activeUserPermissions = activeUser?.platform_role
        ? (ROLE_PERMISSIONS[activeUser.platform_role] || [])
        : [];

    const handleOpenRoleDialog = () => {
        if (!activeUser) return;
        setNewRole(activeUser.platform_role || 'org_member');
        setRoleDialogOpen(true);
    };

    const handleAssignRole = async () => {
        if (!activeUser) return;
        try {
            setRoleChanging(true);
            await adminService.assignRole(
                activeUser.user_id,
                newRole,
                activeUser.organization_id || undefined,
            );
            toast({ title: 'Rôle modifié', description: `${activeUser.display_name} est maintenant ${ROLE_LABELS[newRole] || newRole}.` });
            setRoleDialogOpen(false);
            loadUsers();
        } catch (error) {
            console.error('Failed to assign role:', error);
            toast({ title: 'Erreur', description: 'Impossible de changer le rôle.', variant: 'destructive' });
        } finally {
            setRoleChanging(false);
        }
    };

    const handleRemoveAccess = async () => {
        if (!activeUser) return;
        try {
            await adminService.removeRole(activeUser.user_id, activeUser.organization_id || undefined);
            toast({ title: 'Accès suspendu', description: `L'accès de ${activeUser.display_name} a été retiré.` });
            loadUsers();
        } catch (error) {
            console.error('Failed to remove role:', error);
            toast({ title: 'Erreur', description: 'Impossible de suspendre l\'accès.', variant: 'destructive' });
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
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">IAM & Accès</h1>
                    <p className="text-sm text-muted-foreground">Gestion centralisée des identités ({users.length} utilisateurs)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-4 flex-1 min-h-0">

                {/* Left Pane: User List */}
                <Card className="glass-card flex flex-col min-h-0">
                    <div className="p-3 border-b border-border/50 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-8 h-8 text-xs bg-muted/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col p-2 gap-1">
                            {users.map((user) => (
                                <button
                                    key={user.user_id}
                                    onClick={() => setSelectedUserId(user.user_id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors border ${selectedUserId === user.user_id
                                        ? 'bg-primary/10 border-primary/20'
                                        : 'hover:bg-muted/30 border-transparent'
                                    }`}
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className={`${selectedUserId === user.user_id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            {user.display_name?.substring(0, 2).toUpperCase() || '??'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-sm font-medium truncate ${selectedUserId === user.user_id ? 'text-primary' : ''}`}>
                                                {user.display_name || 'Sans nom'}
                                            </span>
                                            {user.role_active === true && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {users.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">Aucun utilisateur</p>
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Right Pane: Details */}
                {activeUser ? (
                    <Card className="glass-card flex flex-col min-h-0 bg-muted/10">
                        <CardHeader className="pb-4 shrink-0 border-b border-border/50">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                                        <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-secondary text-white">
                                            {activeUser.display_name?.substring(0, 2).toUpperCase() || '??'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-xl">{activeUser.display_name || 'Sans nom'}</CardTitle>
                                        <CardDescription>{activeUser.email}</CardDescription>
                                        <div className="flex items-center gap-2 mt-2">
                                            {activeUser.platform_role ? (
                                                <Badge variant={
                                                    activeUser.platform_role === 'system_admin' || activeUser.platform_role === 'platform_admin'
                                                        ? 'default' : 'secondary'
                                                } className="text-xs">
                                                    {ROLE_LABELS[activeUser.platform_role] || activeUser.platform_role}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-xs">Aucun rôle</Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                {activeUser.role_active ? (
                                                    <><CheckCircle2 className="w-3 h-3 text-green-500" /> Actif</>
                                                ) : (
                                                    <><XCircle className="w-3 h-3 text-gray-400" /> Inactif</>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Organisation</span>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Building2 className="w-4 h-4" />
                                        {activeUser.organization_name || 'Aucune'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Niveau d'accès</span>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Key className="w-4 h-4" />
                                        {ROLE_LABELS[activeUser.platform_role || ''] || 'Aucun'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Inscrit le</span>
                                    <div className="text-sm">
                                        {new Date(activeUser.created_at).toLocaleDateString('fr-FR', {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Rôle attribué le</span>
                                    <div className="text-sm">
                                        {activeUser.granted_at
                                            ? new Date(activeUser.granted_at).toLocaleDateString('fr-FR', {
                                                year: 'numeric', month: 'long', day: 'numeric',
                                            })
                                            : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium mb-2">Permissions Effectives</h4>
                                {activeUserPermissions.length > 0 ? (
                                    activeUserPermissions.map((perm) => (
                                        <div key={perm} className="flex items-center justify-between text-xs py-2 border-b border-border/30 last:border-0 hover:bg-muted/20 px-2 rounded">
                                            <span className="font-mono text-muted-foreground">{perm}</span>
                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">Aucune permission attribuée</p>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="shrink-0 border-t border-border/50 p-4 bg-muted/20 justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10"
                                onClick={handleRemoveAccess}
                            >
                                Suspendre l'accès
                            </Button>
                            <Button size="sm" variant="secondary" onClick={handleOpenRoleDialog}>
                                Modifier le rôle
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <Card className="glass-card flex items-center justify-center min-h-0 bg-muted/10">
                        <div className="text-center">
                            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">Sélectionnez un utilisateur</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Role Change Dialog */}
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le rôle</DialogTitle>
                        <DialogDescription>
                            {activeUser && (
                                <>Changer le rôle de <strong>{activeUser.display_name}</strong> ({activeUser.email})</>
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
