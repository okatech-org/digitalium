/**
 * RetentionPolicy - Legal retention management components
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    AlertTriangle,
    Calendar,
    Scale,
    FileWarning,
    CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Legal retention rules for Gabon
export const GABON_RETENTION_RULES: Record<string, {
    years: number;
    legalBasis: string;
    description: string;
}> = {
    fiscal: {
        years: 10,
        legalBasis: 'Code Commerce Gabon',
        description: 'Documents fiscaux, comptables, factures',
    },
    social: {
        years: 5,
        legalBasis: 'Code du Travail',
        description: 'Contrats de travail, bulletins de paie',
    },
    juridique: {
        years: 30,
        legalBasis: 'Code Civil',
        description: 'Actes notariés, titres de propriété',
    },
    client: {
        years: 10,
        legalBasis: 'Commercial',
        description: 'Contrats clients, bons de commande',
    },
    'coffre-fort': {
        years: 99, // Permanent
        legalBasis: 'Conservation volontaire',
        description: 'Documents personnels importants',
    },
};

interface RetentionPolicyCardProps {
    category: string;
    documentCount: number;
    expiringCount: number;
    nextExpiration?: number;
}

export function RetentionPolicyCard({
    category,
    documentCount,
    expiringCount,
    nextExpiration,
}: RetentionPolicyCardProps) {
    const rule = GABON_RETENTION_RULES[category];
    if (!rule) return null;

    const daysUntil = nextExpiration
        ? Math.ceil((nextExpiration - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium capitalize">
                        {category}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                        {rule.years === 99 ? 'Permanent' : `${rule.years} ans`}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                    {rule.description}
                </p>

                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Documents</span>
                    <span className="font-medium">{documentCount}</span>
                </div>

                {expiringCount > 0 && (
                    <div className="flex items-center gap-2 text-orange-500 text-xs mt-2">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{expiringCount} expirant dans 30j</span>
                    </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Scale className="h-3.5 w-3.5" />
                    <span>{rule.legalBasis}</span>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * ExpirationAlert - Alert banner for expiring documents
 */
interface ExpirationAlertProps {
    expiringDocuments: Array<{
        id: string;
        title: string;
        retentionEndDate: number;
        category: string;
    }>;
    onViewAll?: () => void;
}

export function ExpirationAlert({ expiringDocuments, onViewAll }: ExpirationAlertProps) {
    if (expiringDocuments.length === 0) return null;

    const urgentCount = expiringDocuments.filter(d => {
        const days = Math.ceil((d.retentionEndDate - Date.now()) / (1000 * 60 * 60 * 24));
        return days <= 7;
    }).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'rounded-lg p-4 flex items-center justify-between',
                urgentCount > 0
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'bg-orange-500/10 border border-orange-500/30'
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    'p-2 rounded-lg',
                    urgentCount > 0 ? 'bg-red-500/20' : 'bg-orange-500/20'
                )}>
                    <FileWarning className={cn(
                        'h-5 w-5',
                        urgentCount > 0 ? 'text-red-500' : 'text-orange-500'
                    )} />
                </div>
                <div>
                    <h4 className={cn(
                        'font-medium',
                        urgentCount > 0 ? 'text-red-500' : 'text-orange-500'
                    )}>
                        {expiringDocuments.length} document{expiringDocuments.length > 1 ? 's' : ''} à réviser
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        {urgentCount > 0
                            ? `${urgentCount} expire(nt) dans moins de 7 jours !`
                            : 'Conservation légale arrivant à expiration'
                        }
                    </p>
                </div>
            </div>

            {onViewAll && (
                <button
                    onClick={onViewAll}
                    className={cn(
                        'text-sm font-medium',
                        urgentCount > 0 ? 'text-red-500' : 'text-orange-500'
                    )}
                >
                    Voir tout →
                </button>
            )}
        </motion.div>
    );
}

/**
 * RetentionTimeline - Visual timeline for document lifecycle
 */
interface RetentionTimelineProps {
    uploadedAt: number;
    retentionEndDate: number;
    archivedAt?: number;
    deletedAt?: number;
}

export function RetentionTimeline({
    uploadedAt,
    retentionEndDate,
    archivedAt,
    deletedAt,
}: RetentionTimelineProps) {
    const now = Date.now();
    const totalDuration = retentionEndDate - uploadedAt;
    const elapsed = now - uploadedAt;
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    const formatDate = (ts: number) => new Date(ts).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const events = [
        { date: uploadedAt, label: 'Archivé', icon: CheckCircle2, color: 'text-emerald-500' },
        ...(archivedAt ? [{ date: archivedAt, label: 'Passage archive', icon: Clock, color: 'text-blue-500' }] : []),
        { date: retentionEndDate, label: 'Fin rétention', icon: AlertTriangle, color: progress >= 80 ? 'text-orange-500' : 'text-muted-foreground' },
    ].sort((a, b) => a.date - b.date);

    return (
        <div className="space-y-4">
            {/* Progress bar */}
            <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{formatDate(uploadedAt)}</span>
                    <span>{formatDate(retentionEndDate)}</span>
                </div>
                <Progress
                    value={progress}
                    className={cn(
                        'h-2',
                        progress >= 90 && 'bg-red-200 [&>div]:bg-red-500',
                        progress >= 80 && progress < 90 && 'bg-orange-200 [&>div]:bg-orange-500'
                    )}
                />
                <div className="text-center text-xs text-muted-foreground mt-1">
                    {Math.round(100 - progress)}% de la période de conservation restante
                </div>
            </div>

            {/* Timeline events */}
            <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                {events.map((event, i) => {
                    const Icon = event.icon;
                    const isPast = event.date <= now;

                    return (
                        <div key={i} className="relative flex gap-4 pb-4 last:pb-0">
                            <div className={cn(
                                'relative z-10 p-1 rounded-full bg-background border-2',
                                isPast ? 'border-emerald-500' : 'border-border'
                            )}>
                                <Icon className={cn('h-4 w-4', event.color)} />
                            </div>
                            <div className="flex-1 pt-0.5">
                                <div className="font-medium text-sm">{event.label}</div>
                                <div className="text-xs text-muted-foreground">
                                    {formatDate(event.date)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
