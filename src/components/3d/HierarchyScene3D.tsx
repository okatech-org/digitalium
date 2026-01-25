/**
 * HierarchyScene3D - Complete 3D hierarchy demonstration scene
 * Shows: Armoire → Trieur → Chemise → Document
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Text } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { Armoire3D } from './objects/Armoire3D';
import { Trieur3D } from './objects/Trieur3D';
import { Chemise3D } from './objects/Chemise3D';
import type { Document3D, ViewMode, Tiroir, Compartiment } from '@/types/document3d';

interface HierarchyScene3DProps {
    mode?: ViewMode;
    onModeChange?: (mode: ViewMode) => void;
}

// Example documents
const exampleDocuments: Document3D[] = [
    {
        id: 'doc1',
        name: 'Contrat Martin.pdf',
        type: 'pdf',
        size: 245000,
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
        status: 'classified',
        category: 'RH',
    },
    {
        id: 'doc2',
        name: 'Facture_001.pdf',
        type: 'pdf',
        size: 125000,
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-10'),
        status: 'archived',
        category: 'Comptabilité',
    },
    {
        id: 'doc3',
        name: 'Rapport_Q1.docx',
        type: 'word',
        size: 450000,
        createdAt: new Date('2025-01-05'),
        updatedAt: new Date('2025-01-20'),
        status: 'pending',
        category: 'Direction',
    },
];

// Sorter configuration with compartments
const trieurComptabilite: { compartiments: Compartiment[] } = {
    compartiments: [
        { id: 'jan', label: 'Janvier', color: '#EF4444', chemises: [exampleDocuments[1]] },
        { id: 'fev', label: 'Février', color: '#F59E0B', chemises: [] },
        { id: 'mar', label: 'Mars', color: '#10B981', chemises: [] },
        { id: 'avr', label: 'Avril', color: '#3B82F6', chemises: [] },
        { id: 'mai', label: 'Mai', color: '#8B5CF6', chemises: [] },
    ],
};

// Drawer configuration
const armoireTiroirs: Tiroir[] = [
    {
        id: 'rh',
        label: 'Ressources Humaines',
        color: '#3B82F6',
        trieurs: [{
            id: 'trieur-rh',
            compartiments: [
                { id: 'personnel', label: 'Personnel', color: '#3B82F6', chemises: [exampleDocuments[0]] },
                { id: 'recrutement', label: 'Recrutement', color: '#8B5CF6', chemises: [] },
            ],
        }],
    },
    {
        id: 'compta',
        label: 'Comptabilité 2025',
        color: '#10B981',
        trieurs: [{ id: 'trieur-compta', ...trieurComptabilite }],
    },
    {
        id: 'juridique',
        label: 'Juridique',
        color: '#F59E0B',
        trieurs: [],
    },
    {
        id: 'archives',
        label: 'Archives',
        color: '#8B5CF6',
        trieurs: [],
    },
];

function LoadingPlaceholder() {
    return (
        <mesh position={[0, 1, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#3B82F6" wireframe />
        </mesh>
    );
}

function Arrow({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
    const midX = (from[0] + to[0]) / 2;
    const midY = (from[1] + to[1]) / 2;
    const midZ = (from[2] + to[2]) / 2;
    const length = Math.sqrt(
        Math.pow(to[0] - from[0], 2) +
        Math.pow(to[1] - from[1], 2) +
        Math.pow(to[2] - from[2], 2)
    );

    return (
        <group position={[midX, midY, midZ]}>
            <mesh>
                <cylinderGeometry args={[0.02, 0.02, length, 8]} />
                <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.3} />
            </mesh>
        </group>
    );
}

export function HierarchyScene3D({
    mode = 'overview',
    onModeChange,
}: HierarchyScene3DProps) {
    const [currentMode, setCurrentMode] = useState<ViewMode>(mode);

    const handleModeChange = (newMode: ViewMode) => {
        setCurrentMode(newMode);
        onModeChange?.(newMode);
    };

    const getCameraPosition = (): [number, number, number] => {
        switch (currentMode) {
            case 'overview': return [0, 6, 10];
            case 'armoire': return [0, 3, 5];
            case 'trieur': return [0, 2, 4];
            case 'chemise': return [0, 1, 3];
            default: return [0, 6, 10];
        }
    };

    return (
        <div className="w-full h-full">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={getCameraPosition()} fov={50} />

                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={2}
                    maxDistance={20}
                    maxPolarAngle={Math.PI / 2}
                />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />
                <pointLight position={[-10, 10, -10]} intensity={0.5} />
                <spotLight position={[0, 15, 0]} angle={0.4} penumbra={1} intensity={0.8} castShadow />

                <Environment preset="city" />

                {/* Floor */}
                <Grid
                    args={[30, 30]}
                    cellSize={1}
                    cellThickness={0.5}
                    cellColor="#6B7280"
                    sectionSize={5}
                    sectionThickness={1}
                    sectionColor="#9CA3AF"
                    fadeDistance={50}
                    fadeStrength={1}
                    followCamera={false}
                    infiniteGrid={true}
                />
                <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[30, 30]} />
                    <meshStandardMaterial color="#1F2937" roughness={0.8} metalness={0.2} />
                </mesh>

                <Suspense fallback={<LoadingPlaceholder />}>
                    {/* OVERVIEW MODE */}
                    {currentMode === 'overview' && (
                        <>
                            <Text position={[0, 5, 0]} fontSize={0.4} color="#3B82F6" anchorX="center">
                                HIÉRARCHIE DOCUMENTAIRE
                            </Text>

                            <group position={[-8, 0, 0]}>
                                <Armoire3D tiroirs={armoireTiroirs} onTiroirClick={() => handleModeChange('armoire')} />
                                <Text position={[0, -0.5, 0]} fontSize={0.15} color="white" anchorX="center">
                                    NIVEAU 2 : ARMOIRE
                                </Text>
                            </group>

                            <group position={[0, 0.5, 0]}>
                                <Trieur3D
                                    compartiments={trieurComptabilite.compartiments}
                                    isOpen={true}
                                    onCompartmentClick={() => handleModeChange('trieur')}
                                />
                                <Text position={[0, -0.8, 0]} fontSize={0.15} color="white" anchorX="center">
                                    NIVEAU 3 : TRIEUR
                                </Text>
                            </group>

                            <group position={[6, 0, 0]}>
                                <Chemise3D document={exampleDocuments[0]} isOpen={true} />
                                <Text position={[0, -0.5, 0]} fontSize={0.15} color="white" anchorX="center">
                                    NIVEAU 4 : CHEMISE
                                </Text>
                            </group>

                            <Arrow from={[-6, 1, 0]} to={[-2, 0.7, 0]} />
                            <Arrow from={[2, 0.7, 0]} to={[5, 0, 0]} />
                        </>
                    )}

                    {/* ARMOIRE MODE */}
                    {currentMode === 'armoire' && <Armoire3D tiroirs={armoireTiroirs} />}

                    {/* TRIEUR MODE */}
                    {currentMode === 'trieur' && (
                        <Trieur3D compartiments={trieurComptabilite.compartiments} isOpen={true} />
                    )}

                    {/* CHEMISE MODE */}
                    {currentMode === 'chemise' && <Chemise3D document={exampleDocuments[0]} isOpen={true} />}
                </Suspense>
            </Canvas>
        </div>
    );
}

export default HierarchyScene3D;
