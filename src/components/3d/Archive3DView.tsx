/**
 * Archive3DGridView - Flat grid layout with 3D-styled folder cards
 * Uses CSS transforms for 3D effect, no WebGL
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Chemise3DCard } from '@/components/ui/Chemise3DCard';

interface Document {
    id: string;
    name: string;
    type: string;
    reference?: string;
    verified?: boolean;
}

interface Chemise {
    id: string;
    name: string;
    color?: string;
    documentCount: number;
    documents: Document[];
}

interface Archive3DGridViewProps {
    category: string;
    onDocumentSelect?: (doc: Document) => void;
}

// Generate mock chemises based on category
const generateMockChemises = (category: string): Chemise[] => {
    const categoryConfig: Record<string, { names: string[]; docTypes: string[] }> = {
        fiscal: {
            names: ['Factures 2024', 'Déclarations TVA', 'Bilans Comptables', 'Justificatifs Q4', 'Charges Sociales', 'Relevés Bancaires', 'Amortissements', 'Impôts'],
            docTypes: ['invoice', 'pdf', 'excel', 'pdf', 'pdf', 'excel', 'pdf', 'pdf'],
        },
        social: {
            names: ['Paies 2024', 'Contrats CDI', 'Contrats CDD', 'Attestations', 'Congés', 'URSSAF', 'Médecine du Travail'],
            docTypes: ['pdf', 'contract', 'contract', 'pdf', 'excel', 'pdf', 'pdf'],
        },
        legal: {
            names: ['Statuts Société', 'PV Assemblées', 'Contrats Commerciaux', 'Actes Notariés', 'Contentieux'],
            docTypes: ['contract', 'pdf', 'contract', 'pdf', 'pdf'],
        },
        clients: {
            names: ['Client Alpha Corp', 'Client Beta SA', 'Client Gamma SARL', 'Client Delta Inc', 'Client Epsilon SAS', 'Prospects 2024'],
            docTypes: ['pdf', 'contract', 'invoice', 'pdf', 'word', 'excel'],
        },
        vault: {
            names: ['Coffre Principal', 'Documents Sensibles', 'Propriété Intellectuelle', 'Brevets'],
            docTypes: ['pdf', 'pdf', 'contract', 'pdf'],
        },
        certificates: {
            names: ['Certificats 2024', 'Attestations Légales', 'Horodatages Blockchain', 'Conformité RGPD'],
            docTypes: ['pdf', 'pdf', 'pdf', 'pdf'],
        },
    };

    const config = categoryConfig[category] || categoryConfig.fiscal;

    return config.names.map((name, i) => {
        const docCount = Math.floor(Math.random() * 12) + 3;
        return {
            id: `chemise-${category}-${i}`,
            name,
            documentCount: docCount,
            documents: Array.from({ length: docCount }, (_, j) => ({
                id: `doc-${category}-${i}-${j}`,
                name: `${config.docTypes[i % config.docTypes.length] === 'invoice' ? 'Facture' : 'Document'} ${j + 1} - ${name}`,
                type: config.docTypes[i % config.docTypes.length],
                reference: `ARCH-2024-${String(i * 100 + j).padStart(5, '0')}`,
                verified: Math.random() > 0.1,
            })),
        };
    });
};

export default function Archive3DGridView({ category, onDocumentSelect }: Archive3DGridViewProps) {
    const chemises = useMemo(() => generateMockChemises(category), [category]);

    return (
        <div className="py-6 px-4">
            {/* Grid of 3D folder cards - well spaced */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-y-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {chemises.map((chemise, i) => (
                    <motion.div
                        key={chemise.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Chemise3DCard
                            name={chemise.name}
                            documentCount={chemise.documentCount}
                            documents={chemise.documents}
                            category={category}
                            onDocumentClick={onDocumentSelect}
                        />
                    </motion.div>
                ))}
            </motion.div>

            {/* Info footer */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Cliquez sur un dossier pour voir les documents</p>
            </div>
        </div>
    );
}
