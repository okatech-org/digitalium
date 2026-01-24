/**
 * AuditLog - Document audit trail and compliance logging
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History,
    Eye,
    Download,
    Share2,
    Edit,
    Trash2,
    Shield,
    CheckCircle2,
    AlertCircle,
    Clock,
    User,
    Filter,
    Search,
    ChevronDown,
    FileText,
    Lock,
    Unlock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export type AuditAction =
    | 'upload'
    | 'view'
    | 'download'
    | 'share'
    | 'edit_metadata'
    | 'delete'
    | 'restore'
    | 'verify_integrity'
    | 'generate_certificate'
    | 'update_retention'
    | 'lock'
    | 'unlock'
    | 'ai_analysis';

export interface AuditEntry {
    id: string;
    action: AuditAction;
    documentId: string;
    documentTitle: string;
    userId: string;
    userName: string;
    userEmail: string;
    timestamp: number;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, any>;
    status: 'success' | 'failure' | 'warning';
}

interface AuditLogProps {
    entries: AuditEntry[];
    documentId?: string; // Filter by specific document
    onExport?: () => void;
}

const ACTION_CONFIG: Record<AuditAction, {
    icon: typeof Eye;
    label: string;
    color: string;
    bg: string;
}> = {
    upload: { icon: FileText, label: 'Archivage', color: 'text-green-500', bg: 'bg-green-500/10' },
    view: { icon: Eye, label: 'Consultation', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    download: { icon: Download, label: 'Téléchargement', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    share: { icon: Share2, label: 'Partage', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    edit_metadata: { icon: Edit, label: 'Modification', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    delete: { icon: Trash2, label: 'Suppression', color: 'text-red-500', bg: 'bg-red-500/10' },
    restore: { icon: History, label: 'Restauration', color: 'text-green-500', bg: 'bg-green-500/10' },
    verify_integrity: { icon: Shield, label: 'Vérification', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    generate_certificate: { icon: CheckCircle2, label: 'Certificat', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    update_retention: { icon: Clock, label: 'Rétention', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    lock: { icon: Lock, label: 'Verrouillage', color: 'text-red-500', bg: 'bg-red-500/10' },
    unlock: { icon: Unlock, label: 'Déverrouillage', color: 'text-green-500', bg: 'bg-green-500/10' },
    ai_analysis: { icon: AlertCircle, label: 'Analyse IA', color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function groupByDate(entries: AuditEntry[]): Record<string, AuditEntry[]> {
    const groups: Record<string, AuditEntry[]> = {};

    entries.forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(entry);
    });

    return groups;
}

export function AuditLog({ entries, documentId, onExport }: AuditLogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

    // Filter entries
    const filteredEntries = entries.filter(entry => {
        if (documentId && entry.documentId !== documentId) return false;
        if (actionFilter !== 'all' && entry.action !== actionFilter) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                entry.documentTitle.toLowerCase().includes(query) ||
                entry.userName.toLowerCase().includes(query) ||
                ACTION_CONFIG[entry.action].label.toLowerCase().includes(query)
            );
        }
        return true;
    });

    const groupedEntries = groupByDate(filteredEntries);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Journal d'audit
                        <Badge variant="secondary" className="ml-2">
                            {filteredEntries.length} événements
                        </Badge>
                    </CardTitle>
                    {onExport && (
                        <Button variant="outline" size="sm" onClick={onExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Exporter
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                        <SelectTrigger className="w-40">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes actions</SelectItem>
                            {Object.entries(ACTION_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                    {config.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Entries */}
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                        {Object.entries(groupedEntries).map(([date, dateEntries]) => (
                            <div key={date}>
                                <div className="sticky top-0 bg-card z-10 pb-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                                        {date}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {dateEntries.map((entry) => (
                                        <AuditEntryItem
                                            key={entry.id}
                                            entry={entry}
                                            isExpanded={expandedEntry === entry.id}
                                            onToggle={() => setExpandedEntry(
                                                expandedEntry === entry.id ? null : entry.id
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {filteredEntries.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Aucun événement trouvé</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function AuditEntryItem({
    entry,
    isExpanded,
    onToggle,
}: {
    entry: AuditEntry;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const config = ACTION_CONFIG[entry.action];
    const Icon = config.icon;

    return (
        <Collapsible open={isExpanded} onOpenChange={onToggle}>
            <CollapsibleTrigger asChild>
                <motion.div
                    className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        'hover:bg-muted/50',
                        isExpanded && 'bg-muted/50'
                    )}
                    whileHover={{ scale: 1.01 }}
                >
                    {/* Icon */}
                    <div className={cn('p-2 rounded-lg', config.bg)}>
                        <Icon className={cn('h-4 w-4', config.color)} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{config.label}</span>
                            {entry.status === 'failure' && (
                                <Badge variant="destructive" className="text-xs">
                                    Échec
                                </Badge>
                            )}
                            {entry.status === 'warning' && (
                                <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">
                                    Attention
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                            {entry.documentTitle}
                        </p>
                    </div>

                    {/* User & Time */}
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium">{entry.userName}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatTime(entry.timestamp)}
                        </p>
                    </div>

                    <ChevronDown className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform',
                        isExpanded && 'rotate-180'
                    )} />
                </motion.div>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 ml-6 mt-1 border-l-2 border-muted space-y-3">
                                {/* User details */}
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{entry.userName}</span>
                                    <span className="text-muted-foreground">({entry.userEmail})</span>
                                </div>

                                {/* Technical details */}
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    {entry.ipAddress && (
                                        <div>
                                            <span className="text-muted-foreground">Adresse IP</span>
                                            <p className="font-mono">{entry.ipAddress}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-muted-foreground">Horodatage</span>
                                        <p className="font-mono">{formatDate(entry.timestamp)}</p>
                                    </div>
                                </div>

                                {/* Additional details */}
                                {entry.details && Object.keys(entry.details).length > 0 && (
                                    <div className="bg-muted/50 rounded-lg p-3">
                                        <div className="text-xs text-muted-foreground mb-2">Détails</div>
                                        <pre className="text-xs font-mono overflow-x-auto">
                                            {JSON.stringify(entry.details, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CollapsibleContent>
        </Collapsible>
    );
}

/**
 * ComplianceDashboard widget showing audit summary
 */
export function AuditSummaryCard({ entries }: { entries: AuditEntry[] }) {
    const last24h = entries.filter(e => e.timestamp > Date.now() - 24 * 60 * 60 * 1000);
    const actions = new Set(last24h.map(e => e.action)).size;
    const users = new Set(last24h.map(e => e.userId)).size;
    const failures = last24h.filter(e => e.status === 'failure').length;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Activité (24h)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold">{last24h.length}</p>
                        <p className="text-xs text-muted-foreground">Événements</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{users}</p>
                        <p className="text-xs text-muted-foreground">Utilisateurs</p>
                    </div>
                    <div>
                        <p className={cn(
                            'text-2xl font-bold',
                            failures > 0 ? 'text-red-500' : 'text-green-500'
                        )}>
                            {failures}
                        </p>
                        <p className="text-xs text-muted-foreground">Échecs</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default AuditLog;
