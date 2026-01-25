/**
 * Archive3DView - 3D Scene for iArchive with Chemises and Documents
 * Shows folders organized in a grid view with interactive opening
 */

import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    OrbitControls,
    Environment,
    ContactShadows,
    PerspectiveCamera,
    Text,
    Html,
} from '@react-three/drei';
import { Chemise3D } from './Chemise3D';
import type { Chemise3D as Chemise3DType, Document3D } from '@/types/document3d';

interface Archive3DViewProps {
    category: string;
    onDocumentSelect?: (document: Document3D) => void;
}

// Generate mock chemises based on category
const generateMockChemises = (category: string): Chemise3DType[] => {
    const categoryConfig: Record<string, { colors: string[]; names: string[]; docTypes: string[] }> = {
        fiscal: {
            colors: ['#10B981', '#059669', '#047857', '#065F46'],
            names: ['Factures 2024', 'Déclarations TVA', 'Bilans', 'Justificatifs Q4', 'Charges', 'Relevés'],
            docTypes: ['invoice', 'pdf', 'excel', 'pdf', 'pdf', 'excel'],
        },
        social: {
            colors: ['#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF'],
            names: ['Paies 2024', 'Contrats CDI', 'Attestations', 'Congés', 'URSSAF'],
            docTypes: ['pdf', 'contract', 'pdf', 'excel', 'pdf'],
        },
        legal: {
            colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
            names: ['Statuts Société', 'PV Assemblées', 'Contrats Commerciaux', 'Actes Notariés'],
            docTypes: ['contract', 'pdf', 'contract', 'pdf'],
        },
        clients: {
            colors: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
            names: ['Client Alpha', 'Client Beta', 'Client Gamma', 'Client Delta', 'Client Epsilon'],
            docTypes: ['pdf', 'contract', 'invoice', 'pdf', 'word'],
        },
        vault: {
            colors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'],
            names: ['Coffre Principal', 'Documents Sensibles', 'Propriété Intellectuelle'],
            docTypes: ['pdf', 'pdf', 'contract'],
        },
        certificates: {
            colors: ['#06B6D4', '#0891B2', '#0E7490', '#155E75'],
            names: ['Certificats 2024', 'Attestations Légales', 'Horodatages'],
            docTypes: ['pdf', 'pdf', 'pdf'],
        },
    };

    const config = categoryConfig[category] || categoryConfig.fiscal;

    return config.names.map((name, i) => {
        const docCount = Math.floor(Math.random() * 15) + 3;
        return {
            id: `chemise-${category}-${i}`,
            name,
            category,
            color: config.colors[i % config.colors.length],
            documentCount: docCount,
            documents: Array.from({ length: docCount }, (_, j) => ({
                id: `doc-${category}-${i}-${j}`,
                name: `${name} - Document ${j + 1}`,
                type: config.docTypes[i % config.docTypes.length] as any,
                status: Math.random() > 0.1 ? 'archived' : 'classified' as any,
                reference: `ARCH-2024-${String(i * 100 + j).padStart(5, '0')}`,
                archivedAt: `${Math.floor(Math.random() * 28 + 1)}/01/2024`,
                retentionEnd: '31/12/2034',
                verified: Math.random() > 0.05,
                hash: Math.random().toString(16).substr(2, 8) + '...',
            })),
        };
    });
};

function Scene({
    category,
    onDocumentSelect
}: {
    category: string;
    onDocumentSelect?: (doc: Document3D) => void;
}) {
    const [selectedChemise, setSelectedChemise] = useState<string | null>(null);

    const chemises = useMemo(() => generateMockChemises(category), [category]);

    // Grid layout
    const cols = 3;
    const spacing = 3;

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <directionalLight position={[-10, 10, -5]} intensity={0.5} />

            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#1a1a2e" />
            </mesh>

            {/* Category title */}
            <Text
                position={[0, 3, -8]}
                fontSize={0.5}
                color="#FFFFFF"
                anchorX="center"
                anchorY="middle"
            >
                {category.charAt(0).toUpperCase() + category.slice(1)} - {chemises.length} dossiers
            </Text>

            {/* Chemises grid */}
            {chemises.map((chemise, i) => {
                const row = Math.floor(i / cols);
                const col = i % cols;
                const x = (col - (cols - 1) / 2) * spacing;
                const z = row * spacing - 2;

                return (
                    <Chemise3D
                        key={chemise.id}
                        chemise={chemise}
                        position={[x, 0, z]}
                        isSelected={selectedChemise === chemise.id}
                        onSelect={() => setSelectedChemise(chemise.id)}
                        onOpen={() => setSelectedChemise(chemise.id)}
                        onClose={() => setSelectedChemise(null)}
                        onDocumentClick={onDocumentSelect}
                    />
                );
            })}

            {/* Contact shadows for depth */}
            <ContactShadows
                position={[0, -0.05, 0]}
                opacity={0.5}
                scale={20}
                blur={2}
                far={4}
            />
        </>
    );
}

export default function Archive3DView({ category, onDocumentSelect }: Archive3DViewProps) {
    return (
        <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950">
            <Canvas shadows>
                <Suspense fallback={
                    <Html center>
                        <div className="text-white text-center">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            Chargement 3D...
                        </div>
                    </Html>
                }>
                    <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={50} />
                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minPolarAngle={Math.PI / 6}
                        maxPolarAngle={Math.PI / 2.2}
                        minDistance={5}
                        maxDistance={25}
                    />
                    <Environment preset="city" />
                    <Scene category={category} onDocumentSelect={onDocumentSelect} />
                </Suspense>
            </Canvas>

            {/* Controls hint */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-2 rounded-lg backdrop-blur">
                <p>🖱️ Clic gauche + glisser : Rotation</p>
                <p>🖱️ Molette : Zoom</p>
                <p>📁 Cliquer sur un dossier pour l'ouvrir</p>
            </div>
        </div>
    );
}
