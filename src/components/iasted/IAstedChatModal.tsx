/**
 * IAstedChatModal - Enhanced Chat Interface
 * 
 * Document-centric chat modal for iAsted with:
 * - Message bubbles with Markdown support
 * - Referenced documents visualization
 * - Quick actions for archive operations
 * - Feedback loop (thumbs up/down)
 * - Context-aware responses
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Send,
    X,
    Minimize2,
    Maximize2,
    FileText,
    Search,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Loader2,
    RotateCcw,
    ThumbsUp,
    ThumbsDown,
    Copy,
    User,
    Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { QUICK_ACTIONS as CONFIG_QUICK_ACTIONS } from '@/config/iasted-config';

// ============================================================
// TYPES
// ============================================================

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    isLoading?: boolean;
    actions?: Array<{
        type: string;
        description: string;
        result?: unknown;
    }>;
    referencedDocuments?: Array<{
        id: string;
        title: string;
        category: string;
    }>;
    feedback?: 'positive' | 'negative' | null;
}

interface QuickAction {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    query: string;
}

interface IAstedChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    contextDocuments?: Array<{
        id: string;
        title: string;
        category: string;
    }>;
    userRole?: string;
    userName?: string;
}

// ============================================================
// QUICK ACTIONS
// ============================================================

const QUICK_ACTIONS: QuickAction[] = [
    {
        icon: Search,
        label: 'Résumer documents',
        query: 'Fais-moi un résumé de mes documents archivés ce mois-ci',
    },
    {
        icon: TrendingUp,
        label: 'Analyser dépenses',
        query: 'Analyse mes factures et montre-moi les tendances de dépenses',
    },
    {
        icon: AlertCircle,
        label: 'Documents expirant',
        query: 'Quels documents arrivent à expiration dans les 30 prochains jours ?',
    },
    {
        icon: FileText,
        label: 'Vérifier conformité',
        query: 'Vérifie la conformité de mes archives fiscales',
    },
];

// ============================================================
// WELCOME MESSAGE
// ============================================================

const createWelcomeMessage = (userName?: string): Message => ({
    id: 'welcome',
    role: 'assistant',
    content: `${userName ? `Bonjour ${userName} !` : 'Bonjour !'} Je suis **iAsted**, votre assistant archiviste intelligent.

Je peux vous aider à :
- 🔍 **Rechercher** dans vos archives par mots-clés ou sens
- 📊 **Analyser** vos documents et extraire des données
- ⚡ **Détecter** les anomalies et doublons
- 📈 **Générer** des rapports et insights
- ✅ **Vérifier** la conformité légale (Code Commerce Gabon)

Comment puis-je vous aider aujourd'hui ?`,
    timestamp: Date.now(),
});

// ============================================================
// MESSAGE BUBBLE COMPONENT
// ============================================================

function MessageBubble({
    message,
    onFeedback,
    onCopy,
}: {
    message: Message;
    onFeedback: (id: string, feedback: 'positive' | 'negative') => void;
    onCopy: (content: string) => void;
}) {
    const isUser = message.role === 'user';

    if (message.isLoading) {
        return (
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                        <span className="text-sm text-muted-foreground">Analyse en cours...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}
        >
            {/* Avatar */}
            <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                isUser
                    ? 'bg-primary'
                    : 'bg-gradient-to-br from-purple-500 to-indigo-600'
            )}>
                {isUser ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                    <Sparkles className="h-4 w-4 text-white" />
                )}
            </div>

            {/* Content */}
            <div className={cn(
                'max-w-[80%] rounded-lg px-4 py-3',
                isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
                <div
                    className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                        __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br />')
                    }}
                />

                {/* Referenced Documents */}
                {message.referencedDocuments && message.referencedDocuments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                        <div className="text-xs font-medium opacity-70">Documents référencés :</div>
                        {message.referencedDocuments.map(doc => (
                            <div
                                key={doc.id}
                                className="flex items-center gap-2 text-xs bg-background/50 rounded px-2 py-1"
                            >
                                <FileText className="h-3 w-3" />
                                <span>{doc.title}</span>
                                <Badge variant="outline" className="text-[10px] px-1">
                                    {doc.category}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions from AI */}
                {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                        {message.actions.map((action, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                <span>{action.description}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Feedback & Copy (assistant only) */}
                {!isUser && message.id !== 'welcome' && (
                    <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'h-6 w-6',
                                message.feedback === 'positive' && 'text-green-500'
                            )}
                            onClick={() => onFeedback(message.id, 'positive')}
                        >
                            <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'h-6 w-6',
                                message.feedback === 'negative' && 'text-red-500'
                            )}
                            onClick={() => onFeedback(message.id, 'negative')}
                        >
                            <ThumbsDown className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-auto"
                            onClick={() => onCopy(message.content)}
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ============================================================
// MOCK RESPONSE GENERATOR
// ============================================================

async function generateMockResponse(
    query: string,
    contextDocs: Array<{ id: string; title: string; category: string }>
): Promise<Message> {
    const lowQuery = query.toLowerCase();

    let content = '';
    let referencedDocuments: Message['referencedDocuments'] = [];
    let actions: Message['actions'] = [];

    if (lowQuery.includes('résume') || lowQuery.includes('résumé')) {
        content = `📋 **Résumé de vos archives du mois**

Vous avez archivé **12 documents** ce mois-ci :
- 📊 **5 factures** (Fiscal) - Total : 2 450 000 FCFA
- 📄 **4 contrats** (Juridique)
- 👥 **3 bulletins** (Social)

**Points clés :**
- ↗️ Augmentation de 15% des factures par rapport au mois dernier
- ⚠️ 2 contrats expirent dans 60 jours
- ✅ Tous les documents sont conformes

Souhaitez-vous plus de détails sur une catégorie ?`;
        actions = [{ type: 'analyze', description: 'Analyse de 12 documents effectuée' }];
    }
    else if (lowQuery.includes('dépense') || lowQuery.includes('facture')) {
        content = `📈 **Analyse de vos dépenses**

**Total 2024 :** 18 650 000 FCFA

**Par catégorie :**
| Catégorie | Montant | % |
|-----------|---------|---|
| Fournisseurs | 8 200 000 | 44% |
| Services | 5 100 000 | 27% |
| Charges | 3 850 000 | 21% |
| Divers | 1 500 000 | 8% |

**Tendance :** ↗️ +12% vs 2023

**Recommandation :** Négocier avec les 3 principaux fournisseurs pourrait réduire les coûts de 8-10%.`;
        actions = [
            { type: 'search', description: 'Recherche des factures' },
            { type: 'calculate', description: 'Calcul des totaux' },
        ];
    }
    else if (lowQuery.includes('expir') || lowQuery.includes('30 jour')) {
        content = `⚠️ **Documents arrivant à expiration**

**Dans les 30 prochains jours :**

1. 📄 **Contrat maintenance informatique**
   - Catégorie : Juridique
   - Expiration : 15 février 2026
   - Action : Renouveler ou archiver définitivement

2. 📊 **Déclaration TVA Q3 2023**
   - Catégorie : Fiscal
   - Expiration : 28 février 2026
   - Action : Vérifier conservation légale

**Conseil :** Ces documents ont atteint leur durée légale de conservation selon le Code Commerce gabonais (Art. 18-25). Vous pouvez les supprimer ou les transférer en archive morte.`;
        referencedDocuments = [
            { id: '1', title: 'Contrat maintenance informatique', category: 'juridique' },
            { id: '2', title: 'Déclaration TVA Q3 2023', category: 'fiscal' },
        ];
    }
    else if (lowQuery.includes('conformité') || lowQuery.includes('conforme')) {
        content = `✅ **Rapport de conformité fiscale**

**Statut global : CONFORME** ✓

**Vérifications effectuées :**
- ✅ Durées de conservation respectées
- ✅ Intégrité des documents (SHA-256 vérifié)
- ✅ Métadonnées complètes
- ✅ Horodatage valide

**Détails par catégorie :**
- Archive Fiscale : 45 docs ✅
- Archive Sociale : 23 docs ✅
- Archive Clients : 67 docs ✅

**Base légale :** Code Commerce Gabon (Art. 18-25)

Aucune action requise. Prochaine vérification recommandée : Mars 2026.`;
        actions = [
            { type: 'verify', description: 'Vérification de 135 documents' },
            { type: 'generate_report', description: 'Rapport PDF disponible' },
        ];
    }
    else if (lowQuery.includes('doublon') || lowQuery.includes('double')) {
        content = `🔍 **Détection de doublons**

**Résultat de l'analyse :**

⚠️ **2 doublons potentiels détectés :**

1. **Facture SEEG #2024-0847**
   - Montant : 125 000 FCFA
   - Date originale : 15/01/2024
   - Date doublon : 18/01/2024
   - Probabilité : 98%

2. **Note de frais Transport**
   - Montant : 45 000 FCFA
   - Date originale : 22/01/2024
   - Date doublon : 22/01/2024
   - Probabilité : 95%

**Action recommandée :** Vérifier ces documents et supprimer les doublons pour éviter une double comptabilisation.`;
        actions = [
            { type: 'scan', description: 'Scan de 234 documents' },
            { type: 'compare', description: 'Comparaison par empreinte SHA-256' },
        ];
        referencedDocuments = [
            { id: '3', title: 'Facture SEEG #2024-0847', category: 'fiscal' },
            { id: '4', title: 'Note de frais Transport', category: 'fiscal' },
        ];
    }
    else {
        content = `Je comprends votre question sur "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"

Je peux vous aider avec :
- 🔍 Recherche de documents spécifiques
- 📊 Analyse de données (factures, contrats)
- ⏰ Alertes de conservation légale
- 📋 Génération de rapports
- 🔄 Détection de doublons

Pouvez-vous préciser votre demande ?`;
    }

    // Add context documents if available
    if (contextDocs.length > 0 && referencedDocuments.length === 0) {
        referencedDocuments = contextDocs.slice(0, 3);
    }

    return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content,
        timestamp: Date.now(),
        referencedDocuments,
        actions,
    };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function IAstedChatModal({
    isOpen,
    onClose,
    contextDocuments = [],
    userRole,
    userName,
}: IAstedChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([createWelcomeMessage(userName)]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, isMinimized]);

    // Reset welcome message when userName changes
    useEffect(() => {
        if (messages.length === 1 && messages[0].id === 'welcome') {
            setMessages([createWelcomeMessage(userName)]);
        }
    }, [userName]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Add loading message
        const loadingMessage: Message = {
            id: 'loading',
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            isLoading: true,
        };
        setMessages(prev => [...prev, loadingMessage]);

        try {
            // Simulate AI response
            await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

            const aiResponse = await generateMockResponse(userMessage.content, contextDocuments);

            // Replace loading with actual response
            setMessages(prev => prev.filter(m => m.id !== 'loading').concat(aiResponse));
        } catch (error) {
            setMessages(prev => prev.filter(m => m.id !== 'loading').concat({
                id: crypto.randomUUID(),
                role: 'assistant',
                content: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
                timestamp: Date.now(),
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (query: string) => {
        setInput(query);
        setTimeout(() => handleSend(), 100);
    };

    const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
        setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, feedback } : m
        ));
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    const handleReset = () => {
        setMessages([createWelcomeMessage(userName)]);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className={cn(
                    'fixed z-[9998] bg-card border rounded-xl shadow-2xl overflow-hidden',
                    isMinimized
                        ? 'bottom-4 right-4 w-72 h-14'
                        : 'bottom-4 right-4 w-[420px] h-[600px] max-h-[80vh]'
                )}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Archive className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-sm">iAsted</h3>
                            {!isMinimized && (
                                <p className="text-white/70 text-xs">Assistant Archiviste IA</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                            onClick={() => setIsMinimized(!isMinimized)}
                        >
                            {isMinimized ? (
                                <Maximize2 className="h-4 w-4" />
                            ) : (
                                <Minimize2 className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Context Documents */}
                        {contextDocuments.length > 0 && (
                            <div className="px-4 py-2 border-b bg-muted/30">
                                <div className="text-xs text-muted-foreground mb-1">Documents en contexte :</div>
                                <div className="flex flex-wrap gap-1">
                                    {contextDocuments.slice(0, 3).map(doc => (
                                        <Badge key={doc.id} variant="secondary" className="text-xs">
                                            {doc.title}
                                        </Badge>
                                    ))}
                                    {contextDocuments.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{contextDocuments.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <ScrollArea className="flex-1 h-[calc(100%-180px)]">
                            <div className="p-4 space-y-4">
                                {messages.map((message) => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        onFeedback={handleFeedback}
                                        onCopy={handleCopy}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Quick Actions */}
                        {messages.length <= 2 && (
                            <div className="px-4 py-2 border-t bg-muted/30">
                                <div className="text-xs text-muted-foreground mb-2">Suggestions :</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {QUICK_ACTIONS.map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleQuickAction(action.query)}
                                            className="flex items-center gap-2 px-3 py-2 text-xs bg-background rounded-lg border hover:bg-muted transition-colors text-left"
                                        >
                                            <action.icon className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                                            <span className="truncate">{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-3 border-t bg-background">
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 flex-shrink-0"
                                    onClick={handleReset}
                                    title="Nouvelle conversation"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Posez une question..."
                                    className="flex-1"
                                    disabled={isLoading}
                                />
                                <Button
                                    size="icon"
                                    className="h-9 w-9 flex-shrink-0 bg-purple-600 hover:bg-purple-700"
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

export default IAstedChatModal;
