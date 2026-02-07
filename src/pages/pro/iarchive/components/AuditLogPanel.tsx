/**
 * AuditLogPanel - Document audit trail viewer
 * 
 * Displays the immutable audit log for a specific archived document.
 * Shows all events: consultations, copies, integrity checks, etc.
 * Conforms to NF Z42-013 traceability requirements.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    FileText,
    Clock,
    User,
    Hash,
    Filter,
    Shield,
    Eye,
    Copy,
    Award,
    XCircle,
    CheckCircle2,
    AlertTriangle,
    Activity,
    Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    getDocumentAuditTrail,
    getDocumentAuditSummary,
    logAuditEvent,
    AUDIT_ACTION_LABELS,
    type AuditEvent,
    type AuditActionType,
} from '@/services/archiveAuditService';
import type { ArchiveDocumentData } from './ArchiveDocumentCard';

interface AuditLogPanelProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document: ArchiveDocumentData | null;
}

export function AuditLogPanel({
    open,
    onOpenChange,
    document,
}: AuditLogPanelProps) {
    const [filterType, setFilterType] = useState<AuditActionType | 'all'>('all');

    // Log consultation of audit trail
    React.useEffect(() => {
        if (open && document) {
            logAuditEvent({
                documentId: document.id,
                documentTitle: document.title,
                action: 'audit_log_view',
                details: 'Journal d\'audit consulté',
            });
        }
    }, [open, document]);

    const events = useMemo(() => {
        if (!document) return [];
        return getDocumentAuditTrail(document.id);
    }, [document, open]);

    const summary = useMemo(() => {
        if (!document) return null;
        return getDocumentAuditSummary(document.id);
    }, [document, open]);

    const filteredEvents = useMemo(() => {
        if (filterType === 'all') return events;
        return events.filter(e => e.action === filterType);
    }, [events, filterType]);

    const getActionIcon = (action: AuditActionType) => {
        switch (action) {
            case 'consultation': return <Eye className="h-3.5 w-3.5" />;
            case 'certified_copy': return <Copy className="h-3.5 w-3.5" />;
            case 'integrity_check': return <Shield className="h-3.5 w-3.5" />;
            case 'certificate_download': return <Award className="h-3.5 w-3.5" />;
            case 'archive': return <FileText className="h-3.5 w-3.5" />;
            case 'access_denied': return <XCircle className="h-3.5 w-3.5" />;
            case 'audit_log_view': return <Activity className="h-3.5 w-3.5" />;
            default: return <Clock className="h-3.5 w-3.5" />;
        }
    };

    const filterOptions: { key: AuditActionType | 'all'; label: string }[] = [
        { key: 'all', label: 'Tout' },
        { key: 'consultation', label: 'Consultations' },
        { key: 'certified_copy', label: 'Copies' },
        { key: 'integrity_check', label: 'Intégrité' },
        { key: 'access_denied', label: 'Accès refusés' },
    ];

    if (!document) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden max-h-[85vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogHeader>
                                <DialogTitle className="text-white text-lg font-semibold">
                                    Journal d'Audit
                                </DialogTitle>
                            </DialogHeader>
                            <p className="text-white/80 text-sm line-clamp-1">
                                {document.title}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Summary cards */}
                {summary && (
                    <div className="px-6 pt-4 grid grid-cols-4 gap-2">
                        <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                            <p className="text-lg font-bold text-blue-600">{summary.totalConsultations}</p>
                            <p className="text-[10px] text-blue-600/80">Consultations</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
                            <p className="text-lg font-bold text-purple-600">{summary.totalCopies}</p>
                            <p className="text-[10px] text-purple-600/80">Copies cert.</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                            <p className="text-lg font-bold text-green-600">{summary.totalEvents}</p>
                            <p className="text-[10px] text-green-600/80">Événements</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                            <p className="text-lg font-bold text-red-600">{summary.accessDenied}</p>
                            <p className="text-[10px] text-red-600/80">Accès refusés</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="px-6 pt-3">
                    <div className="flex items-center gap-1 flex-wrap">
                        {filterOptions.map(opt => (
                            <Button
                                key={opt.key}
                                variant={filterType === opt.key ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                    'h-7 text-xs',
                                    filterType === opt.key && 'bg-indigo-500 hover:bg-indigo-600'
                                )}
                                onClick={() => setFilterType(opt.key)}
                            >
                                {opt.label}
                                {opt.key !== 'all' && (
                                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-[9px]">
                                        {events.filter(e => opt.key === 'all' || e.action === opt.key).length}
                                    </Badge>
                                )}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Events timeline */}
                <ScrollArea className="px-6 pb-6 pt-3 max-h-[400px]">
                    <div className="space-y-1">
                        {filteredEvents.length === 0 ? (
                            <div className="text-center py-8">
                                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                                <p className="text-sm text-muted-foreground">Aucun événement</p>
                                <p className="text-xs text-muted-foreground/60">
                                    Le journal d'audit est vide pour ce filtre
                                </p>
                            </div>
                        ) : (
                            filteredEvents.map((event, i) => {
                                const actionConfig = AUDIT_ACTION_LABELS[event.action];
                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                                    >
                                        {/* Timeline dot */}
                                        <div className="flex flex-col items-center mt-1">
                                            <div className={cn(
                                                'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
                                                event.success
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'
                                                    : 'bg-red-100 dark:bg-red-900/20 text-red-600'
                                            )}>
                                                {getActionIcon(event.action)}
                                            </div>
                                            {i < filteredEvents.length - 1 && (
                                                <div className="w-px h-full min-h-[20px] bg-border mt-1" />
                                            )}
                                        </div>

                                        {/* Event content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={cn('text-sm font-medium', actionConfig.color)}>
                                                    {actionConfig.icon} {actionConfig.label}
                                                </span>
                                                {!event.success && (
                                                    <Badge className="bg-red-500 text-white text-[9px] h-4">
                                                        Échec
                                                    </Badge>
                                                )}
                                            </div>
                                            {event.details && (
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                    {event.details}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground/70">
                                                <span className="flex items-center gap-0.5">
                                                    <User className="h-2.5 w-2.5" />
                                                    {event.userName}
                                                </span>
                                                <span className="flex items-center gap-0.5">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    {new Date(event.timestamp).toLocaleDateString('fr-FR', {
                                                        day: '2-digit', month: 'short',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </span>
                                                {event.hashAtTime && (
                                                    <span className="flex items-center gap-0.5 font-mono">
                                                        <Hash className="h-2.5 w-2.5" />
                                                        {event.hashAtTime.slice(0, 12)}...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="border-t px-6 py-3 bg-muted/30 flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">
                        Journal immuable • NF Z42-013 • {filteredEvents.length} événement(s)
                    </p>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onOpenChange(false)}>
                        Fermer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
