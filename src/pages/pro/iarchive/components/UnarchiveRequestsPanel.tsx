/**
 * UnarchiveRequestsPanel - Panel showing all unarchive requests
 * 
 * Displays pending, approved, rejected, and completed requests
 * with the ability to approve/reject from this panel.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    ArchiveRestore,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    FileText,
    GitBranch,
    Zap,
    User,
    Users,
    ChevronDown,
    ChevronRight,
    MessageSquare,
    Ban,
    Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    type UnarchiveRequest,
    type UnarchiveRequestStatus,
    getUnarchiveRequests,
    approveUnarchiveRequest,
    rejectUnarchiveRequest,
    cancelUnarchiveRequest,
} from '@/services/unarchiveService';

interface UnarchiveRequestsPanelProps {
    onRequestCompleted?: (request: UnarchiveRequest) => void;
    className?: string;
}

const STATUS_CONFIG: Record<UnarchiveRequestStatus, {
    label: string;
    color: string;
    icon: React.ReactNode;
}> = {
    pending: {
        label: 'En attente',
        color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
        icon: <Clock className="h-3.5 w-3.5" />,
    },
    approved: {
        label: 'Approuvé',
        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    rejected: {
        label: 'Rejeté',
        color: 'bg-red-500/10 text-red-600 border-red-500/30',
        icon: <XCircle className="h-3.5 w-3.5" />,
    },
    completed: {
        label: 'Terminé',
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    cancelled: {
        label: 'Annulé',
        color: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
        icon: <Ban className="h-3.5 w-3.5" />,
    },
};

export function UnarchiveRequestsPanel({ onRequestCompleted, className }: UnarchiveRequestsPanelProps) {
    const [requests, setRequests] = useState<UnarchiveRequest[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<UnarchiveRequest | null>(null);
    const [selectedApproverId, setSelectedApproverId] = useState<string | null>(null);
    const [comment, setComment] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    // Load requests
    useEffect(() => {
        setRequests(getUnarchiveRequests());
    }, []);

    const refreshRequests = () => {
        setRequests(getUnarchiveRequests());
    };

    const filteredRequests = requests.filter(r => {
        if (filter === 'pending') return r.status === 'pending';
        if (filter === 'completed') return ['completed', 'approved', 'rejected', 'cancelled'].includes(r.status);
        return true;
    }).sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime());

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    const handleApprove = () => {
        if (!selectedRequest || !selectedApproverId) return;
        const updated = approveUnarchiveRequest(selectedRequest.id, selectedApproverId, comment);
        if (updated) {
            refreshRequests();
            if (updated.status === 'approved') {
                onRequestCompleted?.(updated);
            }
        }
        setShowApproveDialog(false);
        setComment('');
        setSelectedRequest(null);
        setSelectedApproverId(null);
    };

    const handleReject = () => {
        if (!selectedRequest || !selectedApproverId || !comment.trim()) return;
        const updated = rejectUnarchiveRequest(selectedRequest.id, selectedApproverId, comment);
        if (updated) {
            refreshRequests();
        }
        setShowRejectDialog(false);
        setComment('');
        setSelectedRequest(null);
        setSelectedApproverId(null);
    };

    const handleCancel = (requestId: string) => {
        cancelUnarchiveRequest(requestId);
        refreshRequests();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={cn('space-y-4', className)}>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <ArchiveRestore className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Demandes de Désarchivage</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {pendingCount > 0
                                        ? `${pendingCount} demande(s) en attente de validation`
                                        : 'Aucune demande en attente'
                                    }
                                </p>
                            </div>
                        </div>
                        {pendingCount > 0 && (
                            <Badge className="bg-amber-500 text-white">
                                {pendingCount}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Filter tabs */}
                    <div className="flex gap-1 mb-4 p-1 bg-muted/50 rounded-lg">
                        {[
                            { key: 'all', label: 'Toutes', count: requests.length },
                            { key: 'pending', label: 'En attente', count: pendingCount },
                            { key: 'completed', label: 'Traitées', count: requests.length - pendingCount },
                        ].map(tab => (
                            <Button
                                key={tab.key}
                                variant={filter === tab.key ? 'default' : 'ghost'}
                                size="sm"
                                className={cn(
                                    'flex-1 h-8 text-xs gap-1',
                                    filter === tab.key && 'bg-amber-500 hover:bg-amber-600 shadow-sm'
                                )}
                                onClick={() => setFilter(tab.key as any)}
                            >
                                {tab.label}
                                <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-1">
                                    {tab.count}
                                </Badge>
                            </Button>
                        ))}
                    </div>

                    {/* Requests list */}
                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <Inbox className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground">
                                {filter === 'pending' ? 'Aucune demande en attente' : 'Aucune demande'}
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="max-h-[400px]">
                            <div className="space-y-2 pr-2">
                                {filteredRequests.map((request) => {
                                    const statusConfig = STATUS_CONFIG[request.status];
                                    const isExpanded = expandedId === request.id;
                                    const approvedCount = request.approvers.filter(a => a.decision === 'approved').length;
                                    const totalApprovers = request.approvers.length;

                                    return (
                                        <motion.div
                                            key={request.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                'border rounded-lg overflow-hidden transition-all',
                                                request.status === 'pending' && 'border-amber-500/30',
                                                isExpanded && 'shadow-md'
                                            )}
                                        >
                                            {/* Request header */}
                                            <div
                                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                                                onClick={() => setExpandedId(isExpanded ? null : request.id)}
                                            >
                                                <div className={cn(
                                                    'p-1.5 rounded-lg',
                                                    request.mode === 'direct' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                                                )}>
                                                    {request.mode === 'direct' ? (
                                                        <Zap className="h-3.5 w-3.5 text-emerald-500" />
                                                    ) : (
                                                        <GitBranch className="h-3.5 w-3.5 text-amber-500" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{request.documentTitle}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{formatDate(request.initiatedAt)}</span>
                                                        {request.mode === 'workflow' && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{approvedCount}/{totalApprovers} approuvé(s)</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <Badge className={cn('text-[10px]', statusConfig.color)} variant="outline">
                                                    {statusConfig.icon}
                                                    <span className="ml-1">{statusConfig.label}</span>
                                                </Badge>

                                                {isExpanded ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>

                                            {/* Expanded details */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-3 pb-3 space-y-3 border-t pt-3">
                                                            {/* Reason */}
                                                            {request.reason && (
                                                                <div className="p-2.5 rounded-lg bg-muted/50">
                                                                    <p className="text-xs text-muted-foreground mb-1 font-medium">Motif :</p>
                                                                    <p className="text-sm">{request.reason}</p>
                                                                </div>
                                                            )}

                                                            {/* Approvers */}
                                                            {request.approvers.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                                        Approbateurs
                                                                    </p>
                                                                    {request.approvers.map((approver) => {
                                                                        const decisionColor = approver.decision === 'approved'
                                                                            ? 'text-emerald-500'
                                                                            : approver.decision === 'rejected'
                                                                                ? 'text-red-500'
                                                                                : 'text-amber-500';
                                                                        return (
                                                                            <div
                                                                                key={approver.id}
                                                                                className={cn(
                                                                                    'flex items-center justify-between p-2.5 rounded-lg border',
                                                                                    approver.decision === 'approved' && 'bg-emerald-500/5 border-emerald-500/20',
                                                                                    approver.decision === 'rejected' && 'bg-red-500/5 border-red-500/20',
                                                                                    approver.decision === 'pending' && 'bg-amber-500/5 border-amber-500/20',
                                                                                )}
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <Avatar className="h-7 w-7">
                                                                                        <AvatarFallback className="text-[10px]">
                                                                                            {approver.userName.split(' ').map(n => n[0]).join('')}
                                                                                        </AvatarFallback>
                                                                                    </Avatar>
                                                                                    <div>
                                                                                        <p className="text-xs font-medium">{approver.userName}</p>
                                                                                        <p className="text-[10px] text-muted-foreground">{approver.role}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className={cn('flex items-center gap-1 text-xs', decisionColor)}>
                                                                                        {approver.decision === 'approved' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                                                        {approver.decision === 'rejected' && <XCircle className="h-3.5 w-3.5" />}
                                                                                        {approver.decision === 'pending' && <Clock className="h-3.5 w-3.5" />}
                                                                                        {approver.decision === 'approved' ? 'Approuvé' :
                                                                                            approver.decision === 'rejected' ? 'Rejeté' : 'En attente'}
                                                                                    </span>
                                                                                    {/* Action buttons for pending approvers */}
                                                                                    {request.status === 'pending' && approver.decision === 'pending' && (
                                                                                        <div className="flex gap-1 ml-2">
                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="outline"
                                                                                                className="h-6 px-2 text-[10px] text-red-500 border-red-500/50 hover:bg-red-500/10"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setSelectedRequest(request);
                                                                                                    setSelectedApproverId(approver.id);
                                                                                                    setShowRejectDialog(true);
                                                                                                }}
                                                                                            >
                                                                                                Rejeter
                                                                                            </Button>
                                                                                            <Button
                                                                                                size="sm"
                                                                                                className="h-6 px-2 text-[10px] bg-emerald-500 hover:bg-emerald-600"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setSelectedRequest(request);
                                                                                                    setSelectedApproverId(approver.id);
                                                                                                    setShowApproveDialog(true);
                                                                                                }}
                                                                                            >
                                                                                                Approuver
                                                                                            </Button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {/* Cancel button for pending requests */}
                                                            {request.status === 'pending' && (
                                                                <div className="flex justify-end pt-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-xs text-muted-foreground hover:text-red-500"
                                                                        onClick={() => handleCancel(request.id)}
                                                                    >
                                                                        <Ban className="h-3.5 w-3.5 mr-1" />
                                                                        Annuler la demande
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>

            {/* Approve Dialog */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-500">
                            <CheckCircle2 className="h-5 w-5" />
                            Approuver le désarchivage
                        </DialogTitle>
                        <DialogDescription>
                            Confirmez l'approbation pour « {selectedRequest?.documentTitle} »
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Commentaire (optionnel)</Label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Ajoutez un commentaire..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            className="bg-emerald-500 hover:bg-emerald-600"
                            onClick={handleApprove}
                        >
                            Confirmer l'approbation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <XCircle className="h-5 w-5" />
                            Rejeter le désarchivage
                        </DialogTitle>
                        <DialogDescription>
                            Indiquez la raison du rejet pour « {selectedRequest?.documentTitle} »
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Raison du rejet *</Label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Expliquez pourquoi vous rejetez cette demande..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!comment.trim()}
                        >
                            Confirmer le rejet
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default UnarchiveRequestsPanel;
