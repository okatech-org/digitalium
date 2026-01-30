/**
 * IntegrationsPanel Component
 * 
 * UI for managing third-party integrations (Google Drive, Email, Webhooks).
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
    Cloud,
    Mail,
    Webhook,
    Settings,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    ExternalLink,
    Plus,
    Trash2,
    Link2
} from 'lucide-react';
import {
    listIntegrations,
    testIntegration,
    initGoogleDriveIntegration,
    type Integration,
    type IntegrationType,
    WEBHOOK_EVENTS
} from '@/lib/archiveIntegrations';

interface IntegrationsPanelProps {
    onConnect?: (type: IntegrationType) => Promise<void>;
    onDisconnect?: (integrationId: string) => Promise<void>;
    onConfigUpdate?: (integrationId: string, config: Record<string, unknown>) => Promise<void>;
}

const INTEGRATION_CONFIG = {
    google_drive: {
        icon: Cloud,
        title: 'Google Drive',
        description: 'Synchronisez vos documents avec Google Drive',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
    },
    email: {
        icon: Mail,
        title: 'Notifications Email',
        description: 'Recevez des notifications par email',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
    },
    webhook: {
        icon: Webhook,
        title: 'Webhooks',
        description: 'Envoyez des événements vers vos applications',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
    },
};

const STATUS_CONFIG = {
    connected: { label: 'Connecté', color: 'text-green-500', icon: CheckCircle2 },
    disconnected: { label: 'Déconnecté', color: 'text-gray-500', icon: XCircle },
    error: { label: 'Erreur', color: 'text-red-500', icon: AlertCircle },
};

export function IntegrationsPanel({
    onConnect,
    onDisconnect,
    onConfigUpdate,
}: IntegrationsPanelProps) {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);
    const [testingId, setTestingId] = useState<string | null>(null);
    const [showAddWebhook, setShowAddWebhook] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');

    useEffect(() => {
        loadIntegrations();
    }, []);

    const loadIntegrations = async () => {
        setLoading(true);
        const data = await listIntegrations();
        setIntegrations(data);
        setLoading(false);
    };

    const handleConnectGoogle = async () => {
        const { authUrl } = await initGoogleDriveIntegration();
        // In production, redirect to authUrl
        console.log('Would redirect to:', authUrl);
        alert('Demo: Google OAuth flow would open here');
    };

    const handleTestConnection = async (integrationId: string) => {
        setTestingId(integrationId);
        const result = await testIntegration(integrationId);
        if (result.success) {
            alert('Connexion réussie!');
        } else {
            alert(`Erreur: ${result.error}`);
        }
        setTestingId(null);
    };

    const handleAddWebhook = async () => {
        if (!webhookUrl) return;

        console.log('Would add webhook:', { url: webhookUrl, secret: webhookSecret });
        setShowAddWebhook(false);
        setWebhookUrl('');
        setWebhookSecret('');
        await loadIntegrations();
    };

    const IntegrationCard = ({ integration }: { integration: Integration }) => {
        const config = INTEGRATION_CONFIG[integration.type];
        const status = STATUS_CONFIG[integration.status];
        const Icon = config.icon;
        const StatusIcon = status.icon;

        return (
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                <Icon className={`h-5 w-5 ${config.color}`} />
                            </div>
                            <div>
                                <p className="font-medium">{integration.name}</p>
                                <p className="text-sm text-muted-foreground">{config.description}</p>

                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className={status.color}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {status.label}
                                    </Badge>
                                    {integration.lastSyncAt && (
                                        <span className="text-xs text-muted-foreground">
                                            Dernière synchro: {integration.lastSyncAt.toLocaleDateString('fr-FR')}
                                        </span>
                                    )}
                                </div>

                                {integration.error && (
                                    <p className="text-xs text-red-500 mt-1">{integration.error}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleTestConnection(integration.id)}
                                disabled={testingId === integration.id}
                            >
                                {testingId === integration.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                            </Button>
                            <Switch
                                checked={integration.status === 'connected'}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        onConnect?.(integration.type);
                                    } else {
                                        onDisconnect?.(integration.id);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary" />
                        Intégrations
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Connectez iArchive à vos services externes
                    </p>
                </div>
            </div>

            {/* Available Integrations */}
            <div className="grid grid-cols-3 gap-4">
                {/* Google Drive */}
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleConnectGoogle}>
                    <CardContent className="p-4 text-center">
                        <div className="p-3 rounded-full bg-blue-500/10 w-fit mx-auto mb-2">
                            <Cloud className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="font-medium">Google Drive</p>
                        <p className="text-xs text-muted-foreground">Synchroniser</p>
                    </CardContent>
                </Card>

                {/* Email */}
                <Card className="opacity-50">
                    <CardContent className="p-4 text-center">
                        <div className="p-3 rounded-full bg-green-500/10 w-fit mx-auto mb-2">
                            <Mail className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="font-medium">Email SMTP</p>
                        <p className="text-xs text-muted-foreground">Configuré</p>
                    </CardContent>
                </Card>

                {/* Webhooks */}
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setShowAddWebhook(true)}>
                    <CardContent className="p-4 text-center">
                        <div className="p-3 rounded-full bg-purple-500/10 w-fit mx-auto mb-2">
                            <Webhook className="h-6 w-6 text-purple-500" />
                        </div>
                        <p className="font-medium">Webhooks</p>
                        <p className="text-xs text-muted-foreground">
                            <Plus className="h-3 w-3 inline mr-1" />
                            Ajouter
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Configured Integrations */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Intégrations actives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : integrations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Aucune intégration configurée</p>
                        </div>
                    ) : (
                        integrations.map((integration) => (
                            <IntegrationCard key={integration.id} integration={integration} />
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Webhook Events Reference */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Événements disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(WEBHOOK_EVENTS).map((event) => (
                            <Badge key={event} variant="outline" className="text-xs font-mono">
                                {event}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Add Webhook Dialog */}
            <Dialog open={showAddWebhook} onOpenChange={setShowAddWebhook}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Webhook className="h-5 w-5 text-purple-500" />
                            Ajouter un Webhook
                        </DialogTitle>
                        <DialogDescription>
                            Recevez des notifications en temps réel sur vos événements
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>URL du webhook *</Label>
                            <Input
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                placeholder="https://your-service.com/webhook"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Secret (optionnel)</Label>
                            <Input
                                type="password"
                                value={webhookSecret}
                                onChange={(e) => setWebhookSecret(e.target.value)}
                                placeholder="Clé secrète pour la signature"
                            />
                            <p className="text-xs text-muted-foreground">
                                Utilisé pour signer les requêtes (HMAC-SHA256)
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddWebhook(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleAddWebhook} disabled={!webhookUrl}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default IntegrationsPanel;
