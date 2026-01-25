/**
 * PendingSignatures - Documents sent by user, awaiting signatures from others
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Clock,
    User,
    MoreVertical,
    RefreshCw,
    XCircle,
    Bell,
    Eye,
    Mail,
    Users,
    CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock data
const MOCK_PENDING = [
    {
        id: '1',
        title: 'Contrat de Prestation - Studio Design',
        sentAt: '20/01/2026',
        deadline: '30/01/2026',
        signers: [
            { name: 'Vous', initials: 'VO', signed: true, date: '20/01/26' },
            { name: 'Client A', initials: 'CA', signed: true, date: '22/01/26' },
            { name: 'Directeur', initials: 'DI', signed: false, lastReminder: '24/01/26' },
        ],
    },
    {
        id: '2',
        title: 'Avenant Commercial Q1 2026',
        sentAt: '18/01/2026',
        deadline: '25/01/2026',
        signers: [
            { name: 'Vous', initials: 'VO', signed: true, date: '18/01/26' },
            { name: 'Finance', initials: 'FI', signed: false, lastReminder: '23/01/26' },
            { name: 'CEO', initials: 'CE', signed: false },
        ],
    },
    {
        id: '3',
        title: 'Accord de Confidentialité',
        sentAt: '23/01/2026',
        deadline: '02/02/2026',
        signers: [
            { name: 'Vous', initials: 'VO', signed: true, date: '23/01/26' },
            { name: 'Partenaire X', initials: 'PX', signed: false },
        ],
    },
    {
        id: '4',
        title: 'Contrat Freelance - Dev Mobile',
        sentAt: '15/01/2026',
        deadline: '28/01/2026',
        signers: [
            { name: 'Vous', initials: 'VO', signed: true, date: '15/01/26' },
            { name: 'Freelance', initials: 'FL', signed: true, date: '16/01/26' },
            { name: 'RH', initials: 'RH', signed: true, date: '17/01/26' },
            { name: 'Direction', initials: 'DI', signed: false, lastReminder: '22/01/26' },
        ],
    },
];

export default function PendingSignatures() {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">En attente</h2>
                    <p className="text-sm text-muted-foreground">
                        {MOCK_PENDING.length} documents envoyés en attente de signatures
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                </Button>
            </div>

            {/* Pending Queue */}
            <div className="space-y-3">
                {MOCK_PENDING.map((doc, i) => {
                    const signedCount = doc.signers.filter(s => s.signed).length;
                    const totalSigners = doc.signers.length;
                    const progress = (signedCount / totalSigners) * 100;
                    const pendingSigners = doc.signers.filter(s => !s.signed);

                    return (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="group hover:border-purple-500/30 transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="p-2.5 rounded-xl bg-blue-500/10">
                                            <Clock className="h-5 w-5 text-blue-500" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold">{doc.title}</h3>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <span>Envoyé le {doc.sentAt}</span>
                                                        <span>•</span>
                                                        <span>Échéance: {doc.deadline}</span>
                                                    </p>
                                                </div>
                                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    {signedCount}/{totalSigners}
                                                </Badge>
                                            </div>

                                            {/* Progress */}
                                            <Progress value={progress} className="h-1.5 mb-3" />

                                            {/* Signers Status */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {doc.signers.map((signer, j) => (
                                                    <div
                                                        key={j}
                                                        className={cn(
                                                            'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
                                                            signer.signed
                                                                ? 'bg-green-500/10 text-green-500'
                                                                : 'bg-orange-500/10 text-orange-500'
                                                        )}
                                                    >
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarFallback className="text-[8px]">
                                                                {signer.initials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>{signer.name}</span>
                                                        {signer.signed ? (
                                                            <CheckCircle2 className="h-3 w-3" />
                                                        ) : (
                                                            <Clock className="h-3 w-3" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {pendingSigners.length > 0 && (
                                                <Button variant="outline" size="sm">
                                                    <Bell className="h-4 w-4 mr-1" />
                                                    Relancer
                                                </Button>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Voir le document
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Mail className="h-4 w-4 mr-2" />
                                                        Relancer tous
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-500">
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Annuler la demande
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Empty state */}
            {MOCK_PENDING.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-muted-foreground">Aucun document en attente</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
