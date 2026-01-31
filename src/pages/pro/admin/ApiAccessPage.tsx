/**
 * ApiAccessPage - Accès API
 * API keys management and documentation
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Key,
    Plus,
    Copy,
    Check,
    Eye,
    EyeOff,
    Trash2,
    RefreshCw,
    Code,
    Book,
    Clock,
    Activity,
    AlertTriangle,
    ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useOrganizationContext } from '@/hooks/useOrganizationContext';

interface ApiKey {
    id: string;
    name: string;
    key: string;
    prefix: string;
    createdAt: number;
    lastUsedAt?: number;
    expiresAt?: number;
    permissions: string[];
    isActive: boolean;
}

const MOCK_KEYS: ApiKey[] = [
    {
        id: '1',
        name: 'Production API',
        key: 'dgm_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        prefix: 'dgm_live',
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
        lastUsedAt: Date.now() - 2 * 60 * 60 * 1000,
        permissions: ['read', 'write', 'delete'],
        isActive: true,
    },
    {
        id: '2',
        name: 'Test API',
        key: 'dgm_test_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4',
        prefix: 'dgm_test',
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        lastUsedAt: Date.now() - 24 * 60 * 60 * 1000,
        permissions: ['read'],
        isActive: true,
    },
];

const CODE_EXAMPLES = {
    curl: `curl -X GET "https://api.digitalium.ga/v1/documents" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,

    javascript: `const response = await fetch('https://api.digitalium.ga/v1/documents', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,

    python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.digitalium.ga/v1/documents',
    headers=headers
)

data = response.json()
print(data)`,
};

export default function ApiAccessPage() {
    const orgContext = useOrganizationContext();
    const apiPrefix = orgContext.apiPrefix;

    // Generate contextual mock keys based on organization
    const getContextualKeys = (): ApiKey[] => [
        {
            id: '1',
            name: 'Production API',
            key: `${apiPrefix}_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`,
            prefix: `${apiPrefix}_live`,
            createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
            lastUsedAt: Date.now() - 2 * 60 * 60 * 1000,
            permissions: ['read', 'write', 'delete'],
            isActive: true,
        },
        {
            id: '2',
            name: 'Test API',
            key: `${apiPrefix}_test_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4`,
            prefix: `${apiPrefix}_test`,
            createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
            lastUsedAt: Date.now() - 24 * 60 * 60 * 1000,
            permissions: ['read'],
            isActive: true,
        },
    ];

    const [keys, setKeys] = useState<ApiKey[]>(getContextualKeys());
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyType, setNewKeyType] = useState<'live' | 'test'>('test');
    const [codeLanguage, setCodeLanguage] = useState<'curl' | 'javascript' | 'python'>('javascript');

    const toggleVisibility = (keyId: string) => {
        const newVisible = new Set(visibleKeys);
        if (newVisible.has(keyId)) {
            newVisible.delete(keyId);
        } else {
            newVisible.add(keyId);
        }
        setVisibleKeys(newVisible);
    };

    const copyKey = async (key: string, keyId: string) => {
        await navigator.clipboard.writeText(key);
        setCopiedKey(keyId);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const createKey = () => {
        const prefix = newKeyType === 'live' ? `${apiPrefix}_live` : `${apiPrefix}_test`;
        const newKey: ApiKey = {
            id: crypto.randomUUID(),
            name: newKeyName,
            key: `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`,
            prefix,
            createdAt: Date.now(),
            permissions: ['read', 'write'],
            isActive: true,
        };
        setKeys([newKey, ...keys]);
        setNewKeyName('');
        setIsCreateOpen(false);
    };

    const deleteKey = (keyId: string) => {
        setKeys(keys.filter(k => k.id !== keyId));
    };

    const toggleKeyActive = (keyId: string) => {
        setKeys(keys.map(k =>
            k.id === keyId ? { ...k, isActive: !k.isActive } : k
        ));
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Accès API</h1>
                    <p className="text-muted-foreground">
                        Gérez vos clés API et intégrez DIGITALIUM
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <a href="https://docs.digitalium.ga" target="_blank" rel="noopener noreferrer">
                            <Book className="h-4 w-4 mr-2" />
                            Documentation
                            <ExternalLink className="h-3 w-3 ml-2" />
                        </a>
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nouvelle clé
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Créer une clé API</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Nom de la clé</Label>
                                    <Input
                                        placeholder="ex: Production API"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={newKeyType}
                                        onValueChange={(v) => setNewKeyType(v as 'live' | 'test')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="test">Test (dgm_test_...)</SelectItem>
                                            <SelectItem value="live">Production (dgm_live_...)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Les clés test ne peuvent accéder qu'aux données de test.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Annuler
                                </Button>
                                <Button onClick={createKey} disabled={!newKeyName}>
                                    Créer
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Warning */}
            <Card className="border-orange-500/30 bg-orange-500/5">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium text-orange-500">Sécurité des clés API</p>
                            <p className="text-muted-foreground">
                                Ne partagez jamais vos clés API. Utilisez des variables d'environnement
                                pour les stocker. Les clés de production ne doivent jamais être exposées
                                côté client.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* API Keys */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Clés API
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {keys.map((apiKey) => (
                            <motion.div
                                key={apiKey.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={cn(
                                    'border rounded-lg p-4',
                                    !apiKey.isActive && 'opacity-60'
                                )}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium">{apiKey.name}</h4>
                                            <Badge
                                                variant="outline"
                                                className={apiKey.prefix.includes('live')
                                                    ? 'text-green-500 border-green-500/30'
                                                    : 'text-blue-500 border-blue-500/30'
                                                }
                                            >
                                                {apiKey.prefix.includes('live') ? 'Production' : 'Test'}
                                            </Badge>
                                            {!apiKey.isActive && (
                                                <Badge variant="secondary">Désactivée</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Créée le {new Date(apiKey.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                            {apiKey.lastUsedAt && (
                                                <span className="flex items-center gap-1">
                                                    <Activity className="h-3 w-3" />
                                                    Dernière utilisation: {new Date(apiKey.lastUsedAt).toLocaleDateString('fr-FR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={apiKey.isActive}
                                            onCheckedChange={() => toggleKeyActive(apiKey.id)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => deleteKey(apiKey.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-muted rounded px-3 py-2 text-sm font-mono">
                                        {visibleKeys.has(apiKey.id)
                                            ? apiKey.key
                                            : `${apiKey.prefix}_${'•'.repeat(32)}`
                                        }
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => toggleVisibility(apiKey.id)}
                                    >
                                        {visibleKeys.has(apiKey.id) ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => copyKey(apiKey.key, apiKey.id)}
                                    >
                                        {copiedKey === apiKey.id ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Start */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Démarrage rapide
                    </CardTitle>
                    <CardDescription>
                        Exemples de code pour intégrer l'API DIGITALIUM
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={codeLanguage} onValueChange={(v) => setCodeLanguage(v as any)}>
                        <TabsList>
                            <TabsTrigger value="curl">cURL</TabsTrigger>
                            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                            <TabsTrigger value="python">Python</TabsTrigger>
                        </TabsList>
                        <TabsContent value={codeLanguage} className="mt-4">
                            <div className="relative">
                                <pre className="bg-muted rounded-lg p-4 text-sm font-mono overflow-x-auto">
                                    <code>{CODE_EXAMPLES[codeLanguage]}</code>
                                </pre>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={() => navigator.clipboard.writeText(CODE_EXAMPLES[codeLanguage])}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
