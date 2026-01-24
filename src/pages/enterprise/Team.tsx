import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Shield, Trash2, Search } from 'lucide-react';

export default function Team() {
    const [searchTerm, setSearchTerm] = useState('');

    const members = [
        { id: 1, name: 'Alex Martin', email: 'alex.martin@company.com', role: 'Admin', avatar: '/avatars/01.png' },
        { id: 2, name: 'Sarah Jones', email: 'sarah.jones@company.com', role: 'Editor', avatar: '/avatars/02.png' },
        { id: 3, name: 'Michael Chen', email: 'michael.chen@company.com', role: 'Viewer', avatar: '/avatars/03.png' },
        { id: 4, name: 'Emma Wilson', email: 'emma.wilson@company.com', role: 'Editor', avatar: '/avatars/04.png' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Gestion d'Équipe</h1>
                    <p className="text-muted-foreground">Gérez les membres et leurs permissions</p>
                </div>
                <Button className="bg-gradient-to-r from-primary to-secondary">
                    <Plus className="w-4 h-4 mr-2" />
                    Inviter un membre
                </Button>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Membres ({members.length})</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {members.map((member) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-semibold">{member.name}</h4>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Mail className="w-3 h-3 mr-1" />
                                            {member.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'} className="w-20 justify-center">
                                        {member.role}
                                    </Badge>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
