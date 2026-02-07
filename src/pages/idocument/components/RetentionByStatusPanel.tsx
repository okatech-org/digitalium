/**
 * RetentionByStatusPanel - Shows retention rules for a document type
 * Visual breakdown of retention periods per archival status
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
    Clock,
    Scale,
    ArrowRight,
    Infinity,
    AlertTriangle,
    CheckCircle2,
} from 'lucide-react';
import { ARCHIVAL_STATUS_CONFIG, RETENTION_RULES_BY_STATUS } from '../constants';
import { ArchivalStatus, RetentionRuleByStatus } from '../types';

interface RetentionByStatusPanelProps {
    documentType: string;
    currentArchivalStatus: ArchivalStatus;
    retentionEndDate?: string | null;
    className?: string;
}

export function RetentionByStatusPanel({
    documentType,
    currentArchivalStatus,
    retentionEndDate,
    className = '',
}: RetentionByStatusPanelProps) {
    const rules = RETENTION_RULES_BY_STATUS[documentType] || RETENTION_RULES_BY_STATUS['other'];

    // Calculate days remaining if retention end date exists
    const daysRemaining = retentionEndDate
        ? Math.ceil((new Date(retentionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                        Politique de rétention
                    </h3>
                </div>
                {daysRemaining !== null && (
                    <Badge
                        variant="outline"
                        className={`text-xs ${daysRemaining <= 30
                                ? 'bg-red-500/10 text-red-700 border-red-500/30'
                                : daysRemaining <= 90
                                    ? 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                                    : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                            }`}
                    >
                        {daysRemaining <= 0
                            ? 'Rétention expirée'
                            : `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`
                        }
                    </Badge>
                )}
            </div>

            {/* Progress through retention phases */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border/40">
                <div className="space-y-1">
                    {rules.map((rule, index) => {
                        const statusConfig = ARCHIVAL_STATUS_CONFIG[rule.archivalStatus];
                        const isCurrent = rule.archivalStatus === currentArchivalStatus;
                        const isPast = getStatusOrder(rule.archivalStatus) < getStatusOrder(currentArchivalStatus);
                        const isFuture = getStatusOrder(rule.archivalStatus) > getStatusOrder(currentArchivalStatus);

                        return (
                            <motion.div
                                key={rule.archivalStatus}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className={`flex items-start gap-3 p-3 rounded-lg transition-all ${isCurrent
                                        ? 'bg-primary/5 border border-primary/20 ring-1 ring-primary/10'
                                        : isPast
                                            ? 'opacity-50'
                                            : 'opacity-70'
                                    }`}>
                                    {/* Status indicator */}
                                    <div className="flex flex-col items-center gap-0.5 pt-0.5">
                                        <span className="text-lg">{statusConfig.icon}</span>
                                        {index < rules.length - 1 && (
                                            <div className={`w-px h-4 ${isPast ? 'bg-primary/40' : 'bg-border/60'
                                                }`} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-sm font-semibold ${isCurrent ? 'text-primary' : 'text-foreground'
                                                }`}>
                                                {statusConfig.label}
                                            </span>
                                            {isCurrent && (
                                                <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-0">
                                                    Actuel
                                                </Badge>
                                            )}
                                            {isPast && (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {rule.description}
                                        </p>

                                        <div className="flex items-center gap-3 mt-1.5">
                                            {/* Retention duration */}
                                            <div className="flex items-center gap-1 text-xs">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <span className={`font-medium ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                                                    {rule.retentionYears === 'permanent' ? (
                                                        <span className="flex items-center gap-1">
                                                            <Infinity className="h-3 w-3" />
                                                            Permanente
                                                        </span>
                                                    ) : rule.retentionYears === 0 ? (
                                                        'Immédiat'
                                                    ) : (
                                                        `${rule.retentionYears} an${rule.retentionYears > 1 ? 's' : ''}`
                                                    )}
                                                </span>
                                            </div>

                                            {/* Legal basis */}
                                            {rule.legalBasis && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Scale className="h-3 w-3" />
                                                    <span>{rule.legalBasis}</span>
                                                </div>
                                            )}

                                            {/* Auto transition */}
                                            {rule.autoTransitionTo && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <ArrowRight className="h-3 w-3" />
                                                    <span>→ {ARCHIVAL_STATUS_CONFIG[rule.autoTransitionTo].label}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Retention End Date Warning */}
            {daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 flex items-start gap-3"
                >
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                            Rétention bientôt expirée
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                            La période de conservation actuelle expire dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}.
                            Une transition de statut archivistique sera nécessaire.
                        </p>
                    </div>
                </motion.div>
            )}

            {daysRemaining !== null && daysRemaining <= 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-3 flex items-start gap-3"
                >
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                            Rétention expirée
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                            La période de conservation est terminée. Le document doit passer au statut suivant
                            selon le calendrier de conservation.
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// Helper: Get status order for comparison
function getStatusOrder(status: ArchivalStatus): number {
    const order: Record<ArchivalStatus, number> = {
        actif: 0,
        semi_actif: 1,
        inactif: 2,
        archive: 3,
        destruction: 4,
    };
    return order[status];
}

export default RetentionByStatusPanel;
