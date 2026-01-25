
import { useState, useCallback } from 'react';
import { SmartAnalysisResult } from '../types';

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

export function useSmartImport() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisResults, setAnalysisResults] = useState<SmartAnalysisResult[]>([]);

    const analyzeFiles = useCallback(async (files: File[]) => {
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

            // Map type to default classeur/dossier
            const classeurDossierMap: Record<string, { classeurId: string; dossierId: string }> = {
                contrat: { classeurId: 'entreprise-2024', dossierId: 'contrats-clients' },
                facture: { classeurId: 'entreprise-2024', dossierId: 'factures-fournisseurs' },
                devis: { classeurId: 'entreprise-2024', dossierId: 'devis-prospects' },
                rapport: { classeurId: 'projets-2024', dossierId: 'projet-digitalium' },
                projet: { classeurId: 'projets-2024', dossierId: 'projet-digitalium' },
                other: { classeurId: 'entreprise-2024', dossierId: 'contrats-clients' },
            };

            const location = classeurDossierMap[classification.type] || classeurDossierMap.other;

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
