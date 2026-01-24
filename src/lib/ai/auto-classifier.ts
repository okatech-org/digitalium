/**
 * Auto-Classifier - AI-powered document classification
 * Uses heuristics and Claude API for intelligent categorization
 */

import { getClaudeClient, type ClaudeMessage } from './claude-client';
import { extractText, parseInvoiceData, type OCRResult } from './ocr-service';
import { GABON_RETENTION_RULES } from '@/pages/pro/iarchive/components/RetentionPolicy';

export type DocumentCategory =
    | 'fiscal'
    | 'social'
    | 'juridique'
    | 'client'
    | 'coffre-fort';

export interface ClassificationResult {
    category: DocumentCategory;
    confidence: number;
    method: 'ai' | 'heuristic' | 'filename' | 'user';
    suggestedTags: string[];
    extractedData?: Record<string, any>;
    retentionYears: number;
    legalBasis: string;
}

// Keyword patterns for heuristic classification
const CATEGORY_PATTERNS: Record<DocumentCategory, {
    keywords: string[];
    filePatterns: RegExp[];
}> = {
    fiscal: {
        keywords: [
            'facture', 'invoice', 'tva', 'taxe', 'impôt', 'fiscal',
            'comptable', 'bilan', 'declaration', 'dge', 'dgi',
            'reçu', 'quittance', 'note de frais', 'bon de commande',
        ],
        filePatterns: [
            /facture/i, /invoice/i, /fiscal/i, /tax/i, /compta/i,
            /F\d{4,}/i, // Invoice numbers like F2024-001
        ],
    },
    social: {
        keywords: [
            'salaire', 'bulletin', 'paie', 'contrat de travail', 'employé',
            'cnss', 'assurance', 'congé', 'attestation travail', 'certificat travail',
            'retraite', 'avenant', 'démission', 'licenciement',
        ],
        filePatterns: [
            /bulletin/i, /paie/i, /salaire/i, /contrat.*travail/i,
            /BP\d{4,}/i, // Bulletin Paie
        ],
    },
    juridique: {
        keywords: [
            'contrat', 'acte', 'notarié', 'judiciaire', 'tribunal',
            'procès', 'jugement', 'statuts', 'assemblée', 'délibération',
            'propriété', 'titre', 'bail', 'procuration', 'testament',
        ],
        filePatterns: [
            /contrat/i, /acte/i, /statut/i, /juridique/i, /legal/i,
        ],
    },
    client: {
        keywords: [
            'client', 'devis', 'proposition', 'commande', 'livraison',
            'réclamation', 'correspondance', 'email', 'courrier',
            'bon de livraison', 'bl', 'bon de reception',
        ],
        filePatterns: [
            /client/i, /devis/i, /commande/i, /BL\d+/i,
        ],
    },
    'coffre-fort': {
        keywords: [
            'personnel', 'privé', 'confidentiel', 'secret',
            'certificat', 'diplôme', 'passeport', 'cni', 'permis',
        ],
        filePatterns: [
            /personnel/i, /prive/i, /confident/i, /coffre/i,
        ],
    },
};

/**
 * Classify document based on filename alone (fast)
 */
export function classifyByFilename(filename: string): ClassificationResult | null {
    const lowerFilename = filename.toLowerCase();

    for (const [category, config] of Object.entries(CATEGORY_PATTERNS)) {
        for (const pattern of config.filePatterns) {
            if (pattern.test(filename)) {
                const rule = GABON_RETENTION_RULES[category];
                return {
                    category: category as DocumentCategory,
                    confidence: 0.6, // Moderate confidence for filename-only
                    method: 'filename',
                    suggestedTags: [filename.split('.')[0].substring(0, 20)],
                    retentionYears: rule?.years || 10,
                    legalBasis: rule?.legalBasis || 'Non spécifié',
                };
            }
        }
    }

    return null;
}

/**
 * Classify document using keyword heuristics (medium speed)
 */
export function classifyByKeywords(text: string): ClassificationResult {
    const lowerText = text.toLowerCase();
    const scores: Record<DocumentCategory, number> = {
        fiscal: 0,
        social: 0,
        juridique: 0,
        client: 0,
        'coffre-fort': 0,
    };

    for (const [category, config] of Object.entries(CATEGORY_PATTERNS)) {
        for (const keyword of config.keywords) {
            const regex = new RegExp(keyword, 'gi');
            const matches = lowerText.match(regex);
            if (matches) {
                scores[category as DocumentCategory] += matches.length;
            }
        }
    }

    // Find category with highest score
    let bestCategory: DocumentCategory = 'fiscal';
    let bestScore = 0;

    for (const [category, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            bestCategory = category as DocumentCategory;
        }
    }

    // Calculate confidence based on score and total keywords found
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? Math.min(0.9, bestScore / totalScore + 0.3) : 0.3;

    // Extract tags from text
    const words = text.match(/\b[A-Za-zÀ-ÿ]{4,}\b/g) || [];
    const wordFreq: Record<string, number> = {};
    words.forEach(w => {
        const lower = w.toLowerCase();
        wordFreq[lower] = (wordFreq[lower] || 0) + 1;
    });

    const suggestedTags = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);

    const rule = GABON_RETENTION_RULES[bestCategory];

    return {
        category: bestCategory,
        confidence,
        method: 'heuristic',
        suggestedTags,
        retentionYears: rule?.years || 10,
        legalBasis: rule?.legalBasis || 'Non spécifié',
    };
}

/**
 * Classify document using Claude AI (most accurate but slower)
 */
export async function classifyWithAI(
    text: string,
    filename: string
): Promise<ClassificationResult> {
    const client = getClaudeClient();

    if (!client.isConfigured()) {
        // Fall back to heuristic if AI not available
        return classifyByKeywords(text);
    }

    const prompt = `Analyse ce document et classifie-le.

Nom du fichier: ${filename}

Contenu (extrait):
${text.substring(0, 2000)}

Réponds UNIQUEMENT en JSON avec ce format:
{
    "category": "fiscal" | "social" | "juridique" | "client" | "coffre-fort",
    "confidence": 0.0 à 1.0,
    "tags": ["tag1", "tag2", "tag3"],
    "extractedData": { données clés extraites },
    "reasoning": "explication courte"
}`;

    try {
        const messages: ClaudeMessage[] = [{ role: 'user', content: prompt }];
        const response = await client.chat(messages, undefined, {
            maxTokens: 512,
            temperature: 0.2,
        });

        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const category = parsed.category as DocumentCategory;
            const rule = GABON_RETENTION_RULES[category];

            return {
                category,
                confidence: Math.min(0.98, parsed.confidence || 0.8),
                method: 'ai',
                suggestedTags: parsed.tags || [],
                extractedData: parsed.extractedData,
                retentionYears: rule?.years || 10,
                legalBasis: rule?.legalBasis || 'Non spécifié',
            };
        }
    } catch (error) {
        console.warn('AI classification failed, falling back to heuristic', error);
    }

    // Fallback
    return classifyByKeywords(text);
}

/**
 * Full classification pipeline
 */
export async function classifyDocument(
    file: File,
    options?: {
        useAI?: boolean;
        extractData?: boolean;
    }
): Promise<ClassificationResult & { ocrResult?: OCRResult }> {
    // 1. Try filename classification first (instant)
    const filenameResult = classifyByFilename(file.name);

    // 2. Extract text via OCR
    const ocrResult = await extractText(file);

    // 3. If we have text, do deeper analysis
    if (ocrResult.text.length > 50) {
        // Extract invoice data if it looks like a financial doc
        let extractedData = {};
        if (options?.extractData) {
            const invoiceData = parseInvoiceData(ocrResult.text);
            if (Object.keys(invoiceData).length > 0) {
                extractedData = invoiceData;
            }
        }

        // 4. Use AI or heuristic classification
        let result: ClassificationResult;

        if (options?.useAI) {
            result = await classifyWithAI(ocrResult.text, file.name);
        } else {
            result = classifyByKeywords(ocrResult.text);
        }

        // Merge extracted data
        if (Object.keys(extractedData).length > 0) {
            result.extractedData = { ...result.extractedData, ...extractedData };
        }

        return { ...result, ocrResult };
    }

    // 5. Fall back to filename result or default
    return {
        ...(filenameResult || {
            category: 'fiscal',
            confidence: 0.3,
            method: 'filename' as const,
            suggestedTags: [],
            retentionYears: 10,
            legalBasis: 'Code Commerce Gabon',
        }),
        ocrResult,
    };
}

export default {
    classifyDocument,
    classifyByFilename,
    classifyByKeywords,
    classifyWithAI,
};
