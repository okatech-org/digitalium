import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, Key, Plus, MoreVertical, Search, CheckCircle2, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function Iam() {
    const [selectedUser, setSelectedUser] = useState<string | null>('demo-sysadmin@digitalium.ga');

    const users = [
        { id: 1, name: 'SysAdmin Demo', email: 'demo-sysadmin@digitalium.ga', role: 'Super Admin', status: 'active', lastActive: 'Now' },
        { id: 2, name: 'DevOps Team', email: 'devops@digitalium.ga', role: 'Maintainer', status: 'active', lastActive: '2h ago' },
        { id: 3, name: 'Support Level 2', email: 'support-l2@digitalium.ga', role: 'Viewer', status: 'active', lastActive: '1d ago' },
        { id: 4, name: 'Audit Bot', email: 'bot-audit@internal', role: 'Auditor', status: 'active', lastActive: '5m ago' },
        { id: 5, name: 'Guest Dev', email: 'guest@external.com', role: 'Viewer', status: 'pending', lastActive: 'Never' },
    ];

    const activeUser = users.find(u => u.email === selectedUser) || users[0];

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">IAM & Accès</h1>
                    <p className="text-sm text-muted-foreground">Gestion centralisée des identités</p>
                </div>
                <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-secondary">
                    <Plus className="w-4 h-4" />
                    Ajouter
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-4 flex-1 min-h-0">

                {/* Left Pane: User List */}
                <Card className="glass-card flex flex-col min-h-0">
                    <div className="p-3 border-b border-border/50 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input placeholder="Rechercher..." className="pl-8 h-8 text-xs bg-muted/20" />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col p-2 gap-1">
                            {users.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedUser(user.email)}
                                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors border ${selectedUser === user.email
                                            ? 'bg-primary/10 border-primary/20'
                                            : 'hover:bg-muted/30 border-transparent'
                                        }`}
                                >
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className={`${selectedUser === user.email ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-sm font-medium truncate ${selectedUser === user.email ? 'text-primary' : ''}`}>{user.name}</span>
                                            {user.status === 'active' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Right Pane: Details */}
                <Card className="glass-card flex flex-col min-h-0 bg-muted/10">
                    <CardHeader className="pb-4 shrink-0 border-b border-border/50">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                                    <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-secondary text-white">
                                        {activeUser.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-xl">{activeUser.name}</CardTitle>
                                    <CardDescription>{activeUser.email}</CardDescription>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={activeUser.role === 'Super Admin' ? 'default' : 'secondary'} className="text-xs">
                                            {activeUser.role}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                            Active: {activeUser.lastActive}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">MFA Status</span>
                                <div className="flex items-center gap-2 text-sm font-medium text-green-500">
                                    <Shield className="w-4 h-4" /> Enabled
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Access Level</span>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Key className="w-4 h-4" /> Full Administration
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Department</span>
                                <div className="text-sm">Engineering / DevOps</div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Location</span>
                                <div className="text-sm">Abidjan, CI (Remote)</div>
                            </div>
                        </div>

                        <Separator className="bg-border/50" />

                        <div className="space-y-3">
                            <h4 className="text-sm font-medium mb-2">Permissions Effectives</h4>
                            {['read:infrastructure', 'write:infrastructure', 'read:billing', 'write:users', 'delete:logs'].map((perm) => (
                                <div key={perm} className="flex items-center justify-between text-xs py-2 border-b border-border/30 last:border-0 hover:bg-muted/20 px-2 rounded">
                                    <span className="font-mono text-muted-foreground">{perm}</span>
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                </div>
                            ))}
                        </div>
                    </CardContent>

                    <CardFooter className="shrink-0 border-t border-border/50 p-4 bg-muted/20 justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10">
                            Suspendre l'accès
                        </Button>
                        <Button size="sm" variant="secondary">
                            Modifier le profil
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
