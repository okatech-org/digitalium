/**
 * RenewalReminders Component
 * 
 * Manages document renewal reminders for contracts, licenses, certifications, etc.
 * Shows upcoming reminders and allows creating new ones.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Bell,
    Plus,
    Calendar,
    Clock,
    FileText,
    Check,
    AlertTriangle,
    Trash2,
    Mail,
    BellRing,
    RefreshCw,
    Edit
} from 'lucide-react';

// Types
export type ReminderType =
    | 'contract_renewal'
    | 'license_expiry'
    | 'certification_renewal'
    | 'document_review'
    | 'retention_expiry'
    | 'custom';

export interface DocumentReminder {
    id: string;
    documentId: string;
    documentTitle: string;
    reminderType: ReminderType;
    title: string;
    description?: string;
    reminderDate: Date;
    daysBeforeAlert: number;
    repeatIntervalDays?: number;
    notifyEmail: boolean;
    notifyInApp: boolean;
    notifyUsers?: string[];
    isActive: boolean;
    lastNotifiedAt?: Date;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    createdBy: string;
    createdAt: Date;
}

interface RenewalRemindersProps {
    reminders?: DocumentReminder[];
    documentId?: string;
    documentTitle?: string;
    onCreateReminder?: (reminder: Partial<DocumentReminder>) => Promise<void>;
    onUpdateReminder?: (id: string, updates: Partial<DocumentReminder>) => Promise<void>;
    onDeleteReminder?: (id: string) => Promise<void>;
    onAcknowledge?: (id: string) => Promise<void>;
}

const REMINDER_TYPES: { value: ReminderType; label: string; icon: React.ReactNode }[] = [
    { value: 'contract_renewal', label: 'Renouvellement contrat', icon: <FileText className="h-4 w-4" /> },
    { value: 'license_expiry', label: 'Expiration licence', icon: <Clock className="h-4 w-4" /> },
    { value: 'certification_renewal', label: 'Renouvellement certification', icon: <Check className="h-4 w-4" /> },
    { value: 'document_review', label: 'Révision document', icon: <Edit className="h-4 w-4" /> },
    { value: 'retention_expiry', label: 'Fin rétention', icon: <AlertTriangle className="h-4 w-4" /> },
    { value: 'custom', label: 'Personnalisé', icon: <Bell className="h-4 w-4" /> },
];

// Demo reminders
const DEMO_REMINDERS: DocumentReminder[] = [
    {
        id: 'rem-1',
        documentId: 'doc-1',
        documentTitle: 'Contrat de maintenance IT',
        reminderType: 'contract_renewal',
        title: 'Renouveler contrat maintenance',
        description: 'Le contrat expire le 15 mars. Contacter le fournisseur pour négociation.',
        reminderDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        daysBeforeAlert: 30,
        notifyEmail: true,
        notifyInApp: true,
        isActive: true,
        createdBy: 'user-1',
        createdAt: new Date('2024-01-01'),
    },
    {
        id: 'rem-2',
        documentId: 'doc-2',
        documentTitle: 'Licence Microsoft 365',
        reminderType: 'license_expiry',
        title: 'Renouveler licence Microsoft',
        reminderDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        daysBeforeAlert: 14,
        repeatIntervalDays: 365,
        notifyEmail: true,
        notifyInApp: true,
        isActive: true,
        createdBy: 'user-1',
        createdAt: new Date('2024-02-01'),
    },
    {
        id: 'rem-3',
        documentId: 'doc-3',
        documentTitle: 'Certification ISO 27001',
        reminderType: 'certification_renewal',
        title: 'Préparer audit certification',
        description: 'Prévoir audit de renouvellement. Contacter organisme certificateur.',
        reminderDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        daysBeforeAlert: 90,
        notifyEmail: true,
        notifyInApp: true,
        isActive: true,
        createdBy: 'user-1',
        createdAt: new Date('2024-03-01'),
    },
    {
        id: 'rem-4',
        documentId: 'doc-4',
        documentTitle: 'Statuts société',
        reminderType: 'retention_expiry',
        title: 'Fin période rétention approche',
        reminderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        daysBeforeAlert: 30,
        notifyEmail: true,
        notifyInApp: true,
        isActive: true,
        acknowledgedAt: new Date(),
        acknowledgedBy: 'Marie Admin',
        createdBy: 'user-1',
        createdAt: new Date('2023-12-01'),
    },
];

export function RenewalReminders({
    reminders = DEMO_REMINDERS,
    documentId,
    documentTitle,
    onCreateReminder,
    onUpdateReminder,
    onDeleteReminder,
    onAcknowledge,
}: RenewalRemindersProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newReminder, setNewReminder] = useState<Partial<DocumentReminder>>({
        documentId,
        documentTitle,
        reminderType: 'custom',
        title: '',
        description: '',
        daysBeforeAlert: 30,
        notifyEmail: true,
        notifyInApp: true,
        isActive: true,
    });

    // Calculate days until reminder
    const getDaysUntil = (date: Date): number => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reminderDate = new Date(date);
        reminderDate.setHours(0, 0, 0, 0);
        return Math.ceil((reminderDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    };

    // Sort reminders by date
    const sortedReminders = [...reminders].sort((a, b) =>
        new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime()
    );

    const overdueReminders = sortedReminders.filter(r => getDaysUntil(r.reminderDate) < 0 && !r.acknowledgedAt);
    const upcomingReminders = sortedReminders.filter(r => {
        const days = getDaysUntil(r.reminderDate);
        return days >= 0 && days <= 30 && !r.acknowledgedAt;
    });
    const futureReminders = sortedReminders.filter(r => getDaysUntil(r.reminderDate) > 30);
    const acknowledgedReminders = sortedReminders.filter(r => r.acknowledgedAt);

    const handleCreateReminder = async () => {
        if (onCreateReminder) {
            await onCreateReminder(newReminder);
        } else {
            console.log('Demo: Create reminder', newReminder);
        }
        setShowCreateDialog(false);
        setNewReminder({
            documentId,
            documentTitle,
            reminderType: 'custom',
            title: '',
            description: '',
            daysBeforeAlert: 30,
            notifyEmail: true,
            notifyInApp: true,
            isActive: true,
        });
    };

    const handleAcknowledge = async (reminderId: string) => {
        if (onAcknowledge) {
            await onAcknowledge(reminderId);
        } else {
            console.log('Demo: Acknowledge reminder', reminderId);
        }
    };

    const handleDelete = async (reminderId: string) => {
        if (onDeleteReminder) {
            await onDeleteReminder(reminderId);
        } else {
            console.log('Demo: Delete reminder', reminderId);
        }
    };

    const ReminderCard = ({ reminder }: { reminder: DocumentReminder }) => {
        const daysUntil = getDaysUntil(reminder.reminderDate);
        const isOverdue = daysUntil < 0;
        const isUrgent = daysUntil >= 0 && daysUntil <= 7;
        const typeInfo = REMINDER_TYPES.find(t => t.value === reminder.reminderType);

        return (
            <Card className={`transition-all ${reminder.acknowledgedAt ? 'opacity-60' :
                    isOverdue ? 'border-red-500/50 bg-red-500/5' :
                        isUrgent ? 'border-amber-500/50 bg-amber-500/5' : ''
                }`}>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`p-1.5 rounded ${isOverdue ? 'bg-red-500/10 text-red-500' :
                                        isUrgent ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-primary/10 text-primary'
                                    }`}>
                                    {typeInfo?.icon || <Bell className="h-4 w-4" />}
                                </div>
                                <span className="font-medium truncate">{reminder.title}</span>
                            </div>

                            <p className="text-sm text-muted-foreground mb-2">
                                {reminder.documentTitle}
                            </p>

                            {reminder.description && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {reminder.description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 text-xs">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {reminder.reminderDate.toLocaleDateString('fr-FR')}
                                </span>

                                {reminder.acknowledgedAt ? (
                                    <Badge variant="secondary" className="text-xs">
                                        <Check className="h-3 w-3 mr-1" />
                                        Traité
                                    </Badge>
                                ) : isOverdue ? (
                                    <Badge variant="destructive" className="text-xs">
                                        En retard de {Math.abs(daysUntil)} jour{Math.abs(daysUntil) > 1 ? 's' : ''}
                                    </Badge>
                                ) : isUrgent ? (
                                    <Badge variant="default" className="text-xs bg-amber-500">
                                        Dans {daysUntil} jour{daysUntil > 1 ? 's' : ''}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs">
                                        Dans {daysUntil} jours
                                    </Badge>
                                )}

                                {reminder.repeatIntervalDays && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <RefreshCw className="h-3 w-3" />
                                        Répétition
                                    </span>
                                )}

                                <div className="flex items-center gap-1">
                                    {reminder.notifyEmail && <Mail className="h-3 w-3 text-muted-foreground" />}
                                    {reminder.notifyInApp && <BellRing className="h-3 w-3 text-muted-foreground" />}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            {!reminder.acknowledgedAt && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-500"
                                    onClick={() => handleAcknowledge(reminder.id)}
                                    title="Marquer comme traité"
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDelete(reminder.id)}
                                title="Supprimer"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
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
                        <Bell className="h-5 w-5 text-primary" />
                        Rappels de Renouvellement
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Recevez des alertes avant l'expiration de vos documents importants
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau rappel
                </Button>
            </div>

            {/* Summary cards */}
            {(overdueReminders.length > 0 || upcomingReminders.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                    {overdueReminders.length > 0 && (
                        <Card className="border-red-500/50">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-full bg-red-500/10">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-500">{overdueReminders.length}</p>
                                    <p className="text-sm text-muted-foreground">En retard</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {upcomingReminders.length > 0 && (
                        <Card className="border-amber-500/50">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-full bg-amber-500/10">
                                    <Bell className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-amber-500">{upcomingReminders.length}</p>
                                    <p className="text-sm text-muted-foreground">Cette semaine / ce mois</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Reminders lists */}
            <ScrollArea className="h-[400px]">
                <div className="space-y-6 pr-4">
                    {overdueReminders.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-red-500">En retard</h4>
                            {overdueReminders.map(r => <ReminderCard key={r.id} reminder={r} />)}
                        </div>
                    )}

                    {upcomingReminders.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-amber-500">À venir (30 jours)</h4>
                            {upcomingReminders.map(r => <ReminderCard key={r.id} reminder={r} />)}
                        </div>
                    )}

                    {futureReminders.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Planifiés</h4>
                            {futureReminders.map(r => <ReminderCard key={r.id} reminder={r} />)}
                        </div>
                    )}

                    {acknowledgedReminders.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Traités</h4>
                            {acknowledgedReminders.map(r => <ReminderCard key={r.id} reminder={r} />)}
                        </div>
                    )}

                    {reminders.length === 0 && (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground text-center">
                                    Aucun rappel configuré.
                                    <br />
                                    <span className="text-sm">
                                        Créez un rappel pour ne pas oublier les dates importantes.
                                    </span>
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </ScrollArea>

            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Nouveau Rappel</DialogTitle>
                        <DialogDescription>
                            Configurez un rappel pour une date importante
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Type de rappel</Label>
                            <Select
                                value={newReminder.reminderType}
                                onValueChange={(value: ReminderType) =>
                                    setNewReminder(r => ({ ...r, reminderType: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {REMINDER_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <span className="flex items-center gap-2">
                                                {type.icon}
                                                {type.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Titre du rappel *</Label>
                            <Input
                                value={newReminder.title}
                                onChange={(e) => setNewReminder(r => ({ ...r, title: e.target.value }))}
                                placeholder="Ex: Renouveler contrat de maintenance"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={newReminder.description}
                                onChange={(e) => setNewReminder(r => ({ ...r, description: e.target.value }))}
                                placeholder="Détails supplémentaires..."
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date du rappel *</Label>
                                <Input
                                    type="date"
                                    value={newReminder.reminderDate instanceof Date
                                        ? newReminder.reminderDate.toISOString().split('T')[0]
                                        : ''}
                                    onChange={(e) => setNewReminder(r => ({
                                        ...r,
                                        reminderDate: e.target.value ? new Date(e.target.value) : undefined
                                    }))}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Alerte (jours avant)</Label>
                                <Input
                                    type="number"
                                    value={newReminder.daysBeforeAlert}
                                    onChange={(e) => setNewReminder(r => ({
                                        ...r,
                                        daysBeforeAlert: parseInt(e.target.value) || 0
                                    }))}
                                    min={0}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Répétition (optionnel)</Label>
                            <Select
                                value={newReminder.repeatIntervalDays?.toString() || ''}
                                onValueChange={(value) => setNewReminder(r => ({
                                    ...r,
                                    repeatIntervalDays: value ? parseInt(value) : undefined
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pas de répétition" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Pas de répétition</SelectItem>
                                    <SelectItem value="30">Mensuel (30 jours)</SelectItem>
                                    <SelectItem value="90">Trimestriel (90 jours)</SelectItem>
                                    <SelectItem value="180">Semestriel (180 jours)</SelectItem>
                                    <SelectItem value="365">Annuel (365 jours)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Notification par email</p>
                                    <p className="text-xs text-muted-foreground">Recevoir un email de rappel</p>
                                </div>
                            </div>
                            <Switch
                                checked={newReminder.notifyEmail}
                                onCheckedChange={(checked) => setNewReminder(r => ({ ...r, notifyEmail: checked }))}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <BellRing className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Notification in-app</p>
                                    <p className="text-xs text-muted-foreground">Afficher dans l'application</p>
                                </div>
                            </div>
                            <Switch
                                checked={newReminder.notifyInApp}
                                onCheckedChange={(checked) => setNewReminder(r => ({ ...r, notifyInApp: checked }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleCreateReminder}
                            disabled={!newReminder.title || !newReminder.reminderDate}
                        >
                            Créer le rappel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default RenewalReminders;
