/**
 * NegativePermissions Component
 * 
 * Allows setting negative permissions on documents/folders to block specific users.
 * Negative permissions override positive permissions - if a user has a negative
 * permission, they cannot access the resource regardless of other permissions.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Shield,
    ShieldX,
    ShieldCheck,
    User,
    Users,
    Plus,
    Trash2,
    AlertTriangle,
    Lock,
    Unlock,
    Calendar
} from 'lucide-react';

// Types
export type PermissionType = 'positive' | 'negative';
export type PermissionLevel = 'view' | 'download' | 'edit' | 'full';

export interface Permission {
    id: string;
    documentId?: string;
    folderId?: string;
    userId?: string;
    groupName?: string;
    userName?: string;
    userEmail?: string;
    permissionType: PermissionType;
    permissionLevel: PermissionLevel;
    isInherited: boolean;
    reason?: string;
    grantedBy: string;
    grantedByName?: string;
    expiresAt?: Date;
    createdAt: Date;
}

interface NegativePermissionsProps {
    documentId?: string;
    folderId?: string;
    permissions?: Permission[];
    onAddPermission?: (permission: Omit<Permission, 'id' | 'createdAt'>) => Promise<void>;
    onRemovePermission?: (permissionId: string) => Promise<void>;
    isLoading?: boolean;
}

const PERMISSION_LEVELS: { value: PermissionLevel; label: string; description: string }[] = [
    { value: 'view', label: 'Consultation', description: 'Bloquer la visualisation' },
    { value: 'download', label: 'Téléchargement', description: 'Bloquer le téléchargement' },
    { value: 'edit', label: 'Modification', description: 'Bloquer les modifications' },
    { value: 'full', label: 'Accès complet', description: 'Bloquer tout accès' },
];

// Demo data
const DEMO_PERMISSIONS: Permission[] = [
    {
        id: 'perm-1',
        documentId: 'doc-1',
        userId: 'user-blocked-1',
        userName: 'Jean Dupont',
        userEmail: 'jean.dupont@example.com',
        permissionType: 'negative',
        permissionLevel: 'full',
        isInherited: false,
        reason: 'Conflit d\'intérêt - dossier sensible',
        grantedBy: 'admin-1',
        grantedByName: 'Marie Admin',
        createdAt: new Date('2024-01-15'),
    },
    {
        id: 'perm-2',
        documentId: 'doc-1',
        groupName: 'Stagiaires',
        permissionType: 'negative',
        permissionLevel: 'download',
        isInherited: true,
        reason: 'Documents confidentiels - accès restreint aux employés permanents',
        grantedBy: 'admin-1',
        grantedByName: 'Marie Admin',
        expiresAt: new Date('2024-12-31'),
        createdAt: new Date('2024-01-10'),
    },
    {
        id: 'perm-3',
        documentId: 'doc-1',
        userId: 'user-allowed-1',
        userName: 'Sophie Martin',
        userEmail: 'sophie.martin@example.com',
        permissionType: 'positive',
        permissionLevel: 'edit',
        isInherited: false,
        grantedBy: 'admin-1',
        grantedByName: 'Marie Admin',
        createdAt: new Date('2024-01-12'),
    },
];

export function NegativePermissions({
    documentId,
    folderId,
    permissions = DEMO_PERMISSIONS,
    onAddPermission,
    onRemovePermission,
    isLoading = false,
}: NegativePermissionsProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newPermission, setNewPermission] = useState({
        isNegative: true,
        userOrGroup: 'user' as 'user' | 'group',
        userEmail: '',
        groupName: '',
        permissionLevel: 'full' as PermissionLevel,
        reason: '',
        hasExpiration: false,
        expirationDate: '',
    });

    const negativePermissions = permissions.filter(p => p.permissionType === 'negative');
    const positivePermissions = permissions.filter(p => p.permissionType === 'positive');

    const handleAddPermission = async () => {
        if (!onAddPermission) {
            console.log('Demo mode: Would add permission', newPermission);
            setShowAddDialog(false);
            return;
        }

        await onAddPermission({
            documentId,
            folderId,
            userId: newPermission.userOrGroup === 'user' ? 'pending-lookup' : undefined,
            groupName: newPermission.userOrGroup === 'group' ? newPermission.groupName : undefined,
            permissionType: newPermission.isNegative ? 'negative' : 'positive',
            permissionLevel: newPermission.permissionLevel,
            isInherited: false,
            reason: newPermission.reason,
            grantedBy: 'current-user',
            expiresAt: newPermission.hasExpiration ? new Date(newPermission.expirationDate) : undefined,
        });

        setShowAddDialog(false);
        setNewPermission({
            isNegative: true,
            userOrGroup: 'user',
            userEmail: '',
            groupName: '',
            permissionLevel: 'full',
            reason: '',
            hasExpiration: false,
            expirationDate: '',
        });
    };

    const handleRemovePermission = async (permissionId: string) => {
        if (!onRemovePermission) {
            console.log('Demo mode: Would remove permission', permissionId);
            return;
        }
        await onRemovePermission(permissionId);
    };

    const PermissionCard = ({ permission }: { permission: Permission }) => {
        const isNegative = permission.permissionType === 'negative';
        const levelInfo = PERMISSION_LEVELS.find(l => l.value === permission.permissionLevel);

        return (
            <Card className={`border ${isNegative ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${isNegative ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                {isNegative ? (
                                    <ShieldX className="h-5 w-5 text-red-500" />
                                ) : (
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {permission.userId ? (
                                        <>
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{permission.userName || permission.userEmail}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Groupe: {permission.groupName}</span>
                                        </>
                                    )}

                                    {permission.isInherited && (
                                        <Badge variant="outline" className="text-xs">
                                            Hérité
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Badge variant={isNegative ? 'destructive' : 'default'} className="text-xs">
                                        {isNegative ? 'Blocage' : 'Autorisation'}: {levelInfo?.label}
                                    </Badge>

                                    {permission.expiresAt && (
                                        <span className="flex items-center gap-1 text-xs">
                                            <Calendar className="h-3 w-3" />
                                            Expire le {permission.expiresAt.toLocaleDateString('fr-FR')}
                                        </span>
                                    )}
                                </div>

                                {permission.reason && (
                                    <p className="text-sm text-muted-foreground bg-background/50 rounded px-2 py-1">
                                        <span className="font-medium">Raison:</span> {permission.reason}
                                    </p>
                                )}

                                <p className="text-xs text-muted-foreground mt-2">
                                    Par {permission.grantedByName} le {permission.createdAt.toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>

                        {!permission.isInherited && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemovePermission(permission.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Gestion des Permissions
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Les permissions négatives bloquent l'accès même si d'autres permissions l'autorisent
                    </p>
                </div>

                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter une permission
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Nouvelle Permission</DialogTitle>
                            <DialogDescription>
                                Configurez les droits d'accès pour un utilisateur ou un groupe
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Permission Type Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    {newPermission.isNegative ? (
                                        <ShieldX className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <ShieldCheck className="h-5 w-5 text-green-500" />
                                    )}
                                    <div>
                                        <p className="font-medium">
                                            {newPermission.isNegative ? 'Permission négative (Blocage)' : 'Permission positive (Accès)'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {newPermission.isNegative
                                                ? 'Bloquer l\'accès à cet utilisateur/groupe'
                                                : 'Autoriser l\'accès à cet utilisateur/groupe'}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={newPermission.isNegative}
                                    onCheckedChange={(checked) => setNewPermission(p => ({ ...p, isNegative: checked }))}
                                />
                            </div>

                            {/* User or Group */}
                            <div className="space-y-2">
                                <Label>Type de principal</Label>
                                <Select
                                    value={newPermission.userOrGroup}
                                    onValueChange={(value: 'user' | 'group') =>
                                        setNewPermission(p => ({ ...p, userOrGroup: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">
                                            <span className="flex items-center gap-2">
                                                <User className="h-4 w-4" /> Utilisateur
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="group">
                                            <span className="flex items-center gap-2">
                                                <Users className="h-4 w-4" /> Groupe
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {newPermission.userOrGroup === 'user' ? (
                                <div className="space-y-2">
                                    <Label>Email de l'utilisateur</Label>
                                    <Input
                                        type="email"
                                        placeholder="utilisateur@exemple.com"
                                        value={newPermission.userEmail}
                                        onChange={(e) => setNewPermission(p => ({ ...p, userEmail: e.target.value }))}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Nom du groupe</Label>
                                    <Select
                                        value={newPermission.groupName}
                                        onValueChange={(value) => setNewPermission(p => ({ ...p, groupName: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un groupe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Stagiaires">Stagiaires</SelectItem>
                                            <SelectItem value="Consultants">Consultants externes</SelectItem>
                                            <SelectItem value="Temporaires">Employés temporaires</SelectItem>
                                            <SelectItem value="Partenaires">Partenaires</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Permission Level */}
                            <div className="space-y-2">
                                <Label>Niveau de {newPermission.isNegative ? 'blocage' : 'permission'}</Label>
                                <Select
                                    value={newPermission.permissionLevel}
                                    onValueChange={(value: PermissionLevel) =>
                                        setNewPermission(p => ({ ...p, permissionLevel: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PERMISSION_LEVELS.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                <span className="flex flex-col">
                                                    <span>{level.label}</span>
                                                    <span className="text-xs text-muted-foreground">{level.description}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Reason */}
                            <div className="space-y-2">
                                <Label>Raison (optionnel mais recommandé)</Label>
                                <Textarea
                                    placeholder="Expliquez la raison de cette permission..."
                                    value={newPermission.reason}
                                    onChange={(e) => setNewPermission(p => ({ ...p, reason: e.target.value }))}
                                    rows={2}
                                />
                            </div>

                            {/* Expiration */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Date d'expiration</Label>
                                    <Switch
                                        checked={newPermission.hasExpiration}
                                        onCheckedChange={(checked) =>
                                            setNewPermission(p => ({ ...p, hasExpiration: checked }))
                                        }
                                    />
                                </div>
                                {newPermission.hasExpiration && (
                                    <Input
                                        type="date"
                                        value={newPermission.expirationDate}
                                        onChange={(e) =>
                                            setNewPermission(p => ({ ...p, expirationDate: e.target.value }))
                                        }
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                Annuler
                            </Button>
                            <Button
                                onClick={handleAddPermission}
                                className={newPermission.isNegative ? 'bg-red-600 hover:bg-red-700' : ''}
                            >
                                {newPermission.isNegative ? (
                                    <>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Bloquer l'accès
                                    </>
                                ) : (
                                    <>
                                        <Unlock className="h-4 w-4 mr-2" />
                                        Autoriser l'accès
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Warning for negative permissions */}
            {negativePermissions.length > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-amber-500">
                            {negativePermissions.length} blocage{negativePermissions.length > 1 ? 's' : ''} actif{negativePermissions.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Les utilisateurs/groupes bloqués ne peuvent pas accéder à cette ressource,
                            même s'ils ont d'autres permissions positives.
                        </p>
                    </div>
                </div>
            )}

            {/* Negative Permissions Section */}
            {negativePermissions.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-red-500 flex items-center gap-2">
                        <ShieldX className="h-4 w-4" />
                        Blocages ({negativePermissions.length})
                    </h4>
                    <div className="space-y-2">
                        {negativePermissions.map((permission) => (
                            <PermissionCard key={permission.id} permission={permission} />
                        ))}
                    </div>
                </div>
            )}

            {/* Positive Permissions Section */}
            {positivePermissions.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-green-500 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Autorisations ({positivePermissions.length})
                    </h4>
                    <div className="space-y-2">
                        {positivePermissions.map((permission) => (
                            <PermissionCard key={permission.id} permission={permission} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {permissions.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Shield className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground text-center">
                            Aucune permission spécifique configurée.
                            <br />
                            <span className="text-sm">
                                Les permissions par défaut du dossier parent s'appliquent.
                            </span>
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default NegativePermissions;
