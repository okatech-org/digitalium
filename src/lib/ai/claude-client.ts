/**
 * Claude AI Client for iAsted
 * Wrapper for Anthropic Claude API with document analysis capabilities
 */

// Types for Claude API responses
export interface ClaudeMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ClaudeStreamEvent {
    type: 'content_block_delta' | 'message_stop' | 'error';
    delta?: { text: string };
    error?: { message: string };
}

export interface DocumentAnalysis {
    summary: string;
    extractedData: Record<string, any>;
    documentType: string;
    confidence: number;
    suggestedCategory: string;
    tags: string[];
    anomalies: string[];
}

export interface ArchiveContext {
    totalDocuments: number;
    categories: Record<string, number>;
    recentDocuments?: Array<{
        id: string;
        title: string;
        category: string;
        date: string;
    }>;
    currentDocument?: {
        id: string;
        title: string;
        content: string;
        extractedText?: string;
    };
}

// System prompts for iAsted
export const IASTED_SYSTEM_PROMPT = `Tu es iAsted, l'assistant IA du système d'archivage DIGITALIUM.

## Ton rôle
Tu aides les utilisateurs gabonais à gérer leurs archives numériques professionnelles.

## Tes capacités
1. **Recherche sémantique** : Trouver des documents par sens, pas seulement par mots-clés
2. **Analyse documentaire** : Extraire des données de factures, contrats, bulletins de paie
3. **Vérification conformité** : Contrôler les durées de conservation légales (Gabon)
4. **Détection d'anomalies** : Identifier les doublons, incohérences, dépenses inhabituelles
5. **Génération de rapports** : Résumer l'activité, tendances, alertes

## Contexte légal Gabon
- Fiscal : 10 ans (Code Commerce)
- Social : 5 ans (Code du Travail)  
- Juridique : 30 ans (Code Civil)
- Clients : 10 ans (Commercial)
- Coffre-fort : Permanent

## Ton style
- Professionnel mais accessible
- Réponds en français
- Utilise des émojis pour les listes (📊 📄 ⚠️ ✅)
- Sois concis mais complet
- Mentionne les sources/documents quand pertinent

## Format de réponse
Utilise le markdown :
- **Gras** pour les points importants
- Tableaux pour les données chiffrées
- Listes pour les énumérations`;

export const DOCUMENT_ANALYSIS_PROMPT = `Analyse ce document et extrais les informations suivantes :

1. **Type de document** : (facture, contrat, bulletin de paie, reçu, etc.)
2. **Données clés** :
   - Pour une facture : montant, date, fournisseur, numéro, TVA
   - Pour un contrat : parties, dates, objet, clauses importantes
   - Pour un bulletin : employé, période, salaire brut/net
3. **Catégorie suggérée** : (fiscal, social, juridique, client)
4. **Tags recommandés** : 3-5 mots-clés pertinents
5. **Anomalies détectées** : incohérences, informations manquantes

Réponds en JSON structuré.`;

/**
 * Claude API Client
 */
export class ClaudeClient {
    private apiKey: string;
    private baseUrl = 'https://api.anthropic.com/v1';
    private model = 'claude-sonnet-4-20250514';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY || '';
    }

    /**
     * Check if API key is configured
     */
    isConfigured(): boolean {
        return this.apiKey.length > 0;
    }

    /**
     * Send a chat message
     */
    async chat(
        messages: ClaudeMessage[],
        context?: ArchiveContext,
        options?: {
            maxTokens?: number;
            temperature?: number;
        }
    ): Promise<string> {
        if (!this.isConfigured()) {
            throw new Error('Claude API key not configured');
        }

        const systemPrompt = this.buildSystemPrompt(context);

        const response = await fetch(`${this.baseUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: options?.maxTokens || 2048,
                temperature: options?.temperature || 0.7,
                system: systemPrompt,
                messages,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Claude API error');
        }

        const data = await response.json();
        return data.content[0]?.text || '';
    }

    /**
     * Stream chat response
     */
    async *streamChat(
        messages: ClaudeMessage[],
        context?: ArchiveContext,
        options?: {
            maxTokens?: number;
            temperature?: number;
        }
    ): AsyncGenerator<string, void, unknown> {
        if (!this.isConfigured()) {
            throw new Error('Claude API key not configured');
        }

        const systemPrompt = this.buildSystemPrompt(context);

        const response = await fetch(`${this.baseUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: options?.maxTokens || 2048,
                temperature: options?.temperature || 0.7,
                system: systemPrompt,
                messages,
                stream: true,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Claude API error');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') return;

                    try {
                        const event: ClaudeStreamEvent = JSON.parse(data);
                        if (event.type === 'content_block_delta' && event.delta?.text) {
                            yield event.delta.text;
                        }
                    } catch {
                        // Skip invalid JSON
                    }
                }
            }
        }
    }

    /**
     * Analyze a document
     */
    async analyzeDocument(
        documentText: string,
        mimeType: string
    ): Promise<DocumentAnalysis> {
        const messages: ClaudeMessage[] = [
            {
                role: 'user',
                content: `${DOCUMENT_ANALYSIS_PROMPT}\n\nContenu du document (${mimeType}):\n\n${documentText}`,
            },
        ];

        const response = await this.chat(messages, undefined, {
            maxTokens: 1024,
            temperature: 0.3, // Lower temperature for structured output
        });

        try {
            // Try to parse JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch {
            // Fallback parsing
        }

        // Fallback response
        return {
            summary: response.substring(0, 200),
            extractedData: {},
            documentType: 'unknown',
            confidence: 0.5,
            suggestedCategory: 'fiscal',
            tags: [],
            anomalies: [],
        };
    }

    /**
     * Build system prompt with context
     */
    private buildSystemPrompt(context?: ArchiveContext): string {
        let prompt = IASTED_SYSTEM_PROMPT;

        if (context) {
            prompt += '\n\n## Contexte actuel\n';
            prompt += `- Documents totaux: ${context.totalDocuments}\n`;
            prompt += `- Catégories: ${JSON.stringify(context.categories)}\n`;

            if (context.recentDocuments?.length) {
                prompt += '\n### Documents récents\n';
                context.recentDocuments.slice(0, 5).forEach(doc => {
                    prompt += `- ${doc.title} (${doc.category}, ${doc.date})\n`;
                });
            }

            if (context.currentDocument) {
                prompt += '\n### Document actif\n';
                prompt += `Titre: ${context.currentDocument.title}\n`;
                if (context.currentDocument.extractedText) {
                    prompt += `Contenu:\n${context.currentDocument.extractedText.substring(0, 1000)}...\n`;
                }
            }
        }

        return prompt;
    }
}

// Singleton instance
let claudeClient: ClaudeClient | null = null;

export function getClaudeClient(): ClaudeClient {
    if (!claudeClient) {
        claudeClient = new ClaudeClient();
    }
    return claudeClient;
}

export default ClaudeClient;
