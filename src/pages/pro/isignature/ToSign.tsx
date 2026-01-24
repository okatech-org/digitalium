/**
 * ToSign - Documents awaiting user's signature
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    PenTool,
    Clock,
    User,
    ChevronRight,
    AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Mock data
const MOCK_TO_SIGN = [
    {
        id: '1',
        title: 'Contrat Commercial - Client XYZ',
        initiatedBy: { name: 'Marie Nguema', initials: 'MN' },
        createdAt: '22/01/2026',
        deadline: '31/01/2026',
        urgent: true,
        signers: [
            { name: 'Marie N.', initials: 'MN', signed: true, date: '22/01/26' },
            { name: 'Vous', initials: 'VO', signed: false, current: true },
            { name: 'Jean O.', initials: 'JO', signed: false },
            { name: 'Direction', initials: 'DI', signed: false },
        ],
    },
    {
        id: '2',
        title: 'Avenant Contrat Employé - Paul Mba',
        initiatedBy: { name: 'Service RH', initials: 'RH' },
        createdAt: '20/01/2026',
        deadline: '28/01/2026',
        urgent: false,
        signers: [
            { name: 'RH', initials: 'RH', signed: true, date: '20/01/26' },
            { name: 'Paul M.', initials: 'PM', signed: true, date: '21/01/26' },
            { name: 'Vous', initials: 'VO', signed: false, current: true },
        ],
    },
    {
        id: '3',
        title: 'Bon de Commande - Fournisseur ABC',
        initiatedBy: { name: 'Service Achats', initials: 'AC' },
        createdAt: '23/01/2026',
        deadline: '25/01/2026',
        urgent: true,
        signers: [
            { name: 'Achats', initials: 'AC', signed: true, date: '23/01/26' },
            { name: 'Vous', initials: 'VO', signed: false, current: true },
        ],
    },
    {
        id: '4',
        title: 'Procès-verbal AG Extraordinaire',
        initiatedBy: { name: 'Secrétariat', initials: 'SE' },
        createdAt: '19/01/2026',
        deadline: '02/02/2026',
        urgent: false,
        signers: [
            { name: 'Secrétariat', initials: 'SE', signed: true, date: '19/01/26' },
            { name: 'Vous', initials: 'VO', signed: false, current: true },
            { name: 'Président', initials: 'PR', signed: false },
        ],
    },
    {
        id: '5',
        title: 'NDA - Partenaire Stratégique',
        initiatedBy: { name: 'Juridique', initials: 'JU' },
        createdAt: '24/01/2026',
        deadline: '30/01/2026',
        urgent: false,
        signers: [
            { name: 'Juridique', initials: 'JU', signed: true, date: '24/01/26' },
            { name: 'Vous', initials: 'VO', signed: false, current: true },
            { name: 'Partenaire', initials: 'PA', signed: false },
        ],
    },
];

export default function ToSign() {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">À signer</h2>
                    <p className="text-sm text-muted-foreground">
                        {MOCK_TO_SIGN.length} documents en attente de votre signature
                    </p>
                </div>
            </div>

            {/* Signature Queue */}
            <div className="space-y-4">
                {MOCK_TO_SIGN.map((doc, i) => {
                    const signedCount = doc.signers.filter(s => s.signed).length;
                    const totalSigners = doc.signers.length;
                    const progress = (signedCount / totalSigners) * 100;

                    return (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className={cn(
                                'group cursor-pointer hover:border-purple-500/50 transition-all',
                                doc.urgent && 'border-orange-500/50'
                            )}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="p-3 rounded-xl bg-purple-500/10 group-hover:scale-110 transition-transform">
                                            <FileText className="h-6 w-6 text-purple-500" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold flex items-center gap-2">
                                                        {doc.title}
                                                        {doc.urgent && (
                                                            <Badge variant="secondary" className="bg-orange-500/20 text-orange-500">
                                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                                Urgent
                                                            </Badge>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <User className="h-3 w-3" />
                                                        Initié par {doc.initiatedBy.name}
                                                        <span>•</span>
                                                        <Clock className="h-3 w-3" />
                                                        Échéance: {doc.deadline}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-purple-500 border-purple-500/30">
                                                    {signedCount}/{totalSigners} signés
                                                </Badge>
                                            </div>

                                            {/* Signers Progress */}
                                            <div className="space-y-2">
                                                <Progress value={progress} className="h-2" />
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {doc.signers.map((signer, j) => (
                                                        <div
                                                            key={j}
                                                            className={cn(
                                                                'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
                                                                signer.signed
                                                                    ? 'bg-green-500/10 text-green-500'
                                                                    : signer.current
                                                                        ? 'bg-purple-500/10 text-purple-500 ring-2 ring-purple-500/30'
                                                                        : 'bg-muted text-muted-foreground'
                                                            )}
                                                        >
                                                            <Avatar className="h-5 w-5">
                                                                <AvatarFallback className="text-[10px]">
                                                                    {signer.initials}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span>{signer.name}</span>
                                                            {signer.signed && <span>✓</span>}
                                                            {signer.current && <span className="font-semibold">(vous)</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <Button className="bg-purple-500 hover:bg-purple-600">
                                            <PenTool className="h-4 w-4 mr-2" />
                                            Signer
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
