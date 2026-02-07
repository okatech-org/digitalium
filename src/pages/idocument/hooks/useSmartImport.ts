
import { useState, useCallback } from 'react';
import { IClasseur, SmartAnalysisResult } from '../types';

// Simulated document classification based on filename keywords
function classifyDocument(file: File): { type: string; confidence: number } {
    const name = file.name.toLowerCase();

    if (name.includes('contrat') || name.includes('contract') || name.includes('accord')) {
        return { type: 'contrat', confidence: 0.92 };
    }
    if (name.includes('facture') || name.includes('invoice') || name.includes('bill')) {
        return { type: 'facture', confidence: 0.89 };
    }
    if (name.includes('devis') || name.includes('quote') || name.includes('proposition')) {
        return { type: 'devis', confidence: 0.88 };
    }
    if (name.includes('rapport') || name.includes('report') || name.includes('analyse')) {
        return { type: 'rapport', confidence: 0.85 };
    }
    if (name.includes('projet') || name.includes('project') || name.includes('cdc') || name.includes('cahier')) {
        return { type: 'projet', confidence: 0.87 };
    }

    // Default - lower confidence
    return { type: 'other', confidence: 0.65 };
}

// Generate a smart name from file name
function generateSmartName(file: File): string {
    let name = file.name
        .replace(/\.[^/.]+$/, "") // Remove extension
        .replace(/[-_]/g, ' ')    // Replace dashes and underscores
        .replace(/\s+/g, ' ')     // Normalize spaces
        .trim();

    // Capitalize first letter of each word
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Map document type to a preferred dossier name for smart matching
const TYPE_TO_DOSSIER_NAME: Record<string, string[]> = {
    contrat: ['contrat', 'contrats', 'contract'],
    facture: ['facture', 'factures', 'invoice', 'comptabilité'],
    devis: ['devis', 'propositions', 'commercial'],
    rapport: ['rapport', 'rapports', 'analyses'],
    projet: ['projet', 'projets', 'project'],
    other: [],
};

/**
 * Try to find the best classeur/dossier match from existing data.
 * If no match is found, returns empty IDs so the caller can auto-create.
 */
function findBestLocation(
    type: string,
    classeurs: IClasseur[]
): { classeurId: string; dossierId: string } {
    const keywords = TYPE_TO_DOSSIER_NAME[type] || [];

    // Strategy 1: Find a dossier whose name matches the document type
    for (const classeur of classeurs) {
        for (const dossier of classeur.dossiers) {
            const dossierNameLower = dossier.name.toLowerCase();
            if (keywords.some(kw => dossierNameLower.includes(kw))) {
                return { classeurId: classeur.id, dossierId: dossier.id };
            }
        }
    }

    // Strategy 2: Use the first classeur/first dossier as fallback
    if (classeurs.length > 0) {
        const firstClasseur = classeurs[0];
        if (firstClasseur.dossiers.length > 0) {
            return { classeurId: firstClasseur.id, dossierId: firstClasseur.dossiers[0].id };
        }
        // Classeur exists but no dossier — return classeurId only, caller will create dossier
        return { classeurId: firstClasseur.id, dossierId: '' };
    }

    // No classeurs at all — caller must create everything
    return { classeurId: '', dossierId: '' };
}

export function useSmartImport() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisResults, setAnalysisResults] = useState<SmartAnalysisResult[]>([]);

    const analyzeFiles = useCallback(async (files: File[], classeurs: IClasseur[] = []) => {
        if (files.length === 0) return;

        setIsAnalyzing(true);
        setAnalysisProgress(0);
        setAnalysisResults([]);

        const results: SmartAnalysisResult[] = [];
        const totalFiles = files.length;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Simulate AI analysis delay
            await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

            const classification = classifyDocument(file);
            const smartName = generateSmartName(file);

            // Find the best matching location from existing classeurs
            const location = findBestLocation(classification.type, classeurs);

            results.push({
                file,
                smartName,
                type: classification.type,
                classeurId: location.classeurId,
                dossierId: location.dossierId,
                folderId: location.dossierId, // Alias for target folder
                confidence: classification.confidence,
            });

            setAnalysisProgress(Math.round(((i + 1) / totalFiles) * 100));
        }

        setAnalysisResults(results);
        setIsAnalyzing(false);
    }, []);

    const updateAnalysisResult = useCallback((index: number, updates: Partial<SmartAnalysisResult>) => {
        setAnalysisResults(prev => prev.map((result, i) =>
            i === index ? { ...result, ...updates } : result
        ));
    }, []);

    const removeAnalysisResult = useCallback((index: number) => {
        setAnalysisResults(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clearAnalysis = useCallback(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        setAnalysisResults([]);
    }, []);

    return {
        isAnalyzing,
        analysisProgress,
        analysisResults,
        analyzeFiles,
        updateAnalysisResult,
        removeAnalysisResult,
        clearAnalysis,
    };
}

