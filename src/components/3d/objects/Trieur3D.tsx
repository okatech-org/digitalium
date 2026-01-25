/**
 * Trieur3D - 3D Sorter component with colored compartments
 * Level 3: Contains multiple folders organized by compartments
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Chemise3D } from './Chemise3D';
import type { Compartiment, Document3D } from '@/types/document3d';

interface Trieur3DProps {
    compartiments?: Compartiment[];
    position?: [number, number, number];
    isOpen?: boolean;
    onCompartmentClick?: (compartimentId: string) => void;
}

const DEFAULT_COMPARTIMENTS: Compartiment[] = [
    { id: 'jan', label: 'Janvier', color: '#EF4444', chemises: [] },
    { id: 'fev', label: 'Février', color: '#F59E0B', chemises: [] },
    { id: 'mar', label: 'Mars', color: '#10B981', chemises: [] },
    { id: 'avr', label: 'Avril', color: '#3B82F6', chemises: [] },
    { id: 'mai', label: 'Mai', color: '#8B5CF6', chemises: [] },
    { id: 'jun', label: 'Juin', color: '#EC4899', chemises: [] },
    { id: 'jul', label: 'Juillet', color: '#14B8A6', chemises: [] },
];

export function Trieur3D({
    compartiments = DEFAULT_COMPARTIMENTS,
    position = [0, 0, 0],
    isOpen = false,
    onCompartmentClick,
}: Trieur3DProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [selectedCompartiment, setSelectedCompartiment] = useState<string | null>(null);
    const [hoveredCompartiment, setHoveredCompartiment] = useState<string | null>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        // Subtle rotation when open
        if (isOpen) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        }
    });

    const handleCompartmentClick = (compartimentId: string) => {
        setSelectedCompartiment(
            selectedCompartiment === compartimentId ? null : compartimentId
        );
        onCompartmentClick?.(compartimentId);
    };

    const numberOfCompartments = compartiments.length;
    const compartmentWidth = 3.5 / numberOfCompartments;

    return (
        <group ref={groupRef} position={position}>
            {/* Base */}
            <RoundedBox args={[4, 0.1, 1.2]} radius={0.02} position={[0, 0, 0]}>
                <meshStandardMaterial color="#4A4A4A" roughness={0.4} metalness={0.6} />
            </RoundedBox>

            {/* Back */}
            <RoundedBox args={[4, 0.5, 0.1]} radius={0.02} position={[0, 0.25, -0.55]}>
                <meshStandardMaterial color="#3A3A3A" roughness={0.4} metalness={0.5} />
            </RoundedBox>

            {/* Main label */}
            <Text
                position={[0, 0.28, -0.5]}
                fontSize={0.12}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                TRIEUR DOCUMENTAIRE
            </Text>

            {/* Compartments */}
            {compartiments.map((comp, index) => {
                const xPos = -1.75 + (index * compartmentWidth) + compartmentWidth / 2;
                const isSelected = selectedCompartiment === comp.id;
                const isHovered = hoveredCompartiment === comp.id;

                return (
                    <group key={comp.id}>
                        {/* Compartment divider */}
                        <mesh
                            position={[xPos, 0.25, 0]}
                            onClick={() => handleCompartmentClick(comp.id)}
                            onPointerOver={() => setHoveredCompartiment(comp.id)}
                            onPointerOut={() => setHoveredCompartiment(null)}
                        >
                            <boxGeometry args={[compartmentWidth - 0.05, 0.45, 1]} />
                            <meshStandardMaterial
                                color={comp.color}
                                roughness={0.6}
                                metalness={0.2}
                                emissive={isHovered ? comp.color : '#000000'}
                                emissiveIntensity={isHovered ? 0.3 : 0}
                            />
                        </mesh>

                        {/* Label */}
                        <Text
                            position={[xPos, 0.52, 0]}
                            fontSize={0.08}
                            color="white"
                            anchorX="center"
                            anchorY="middle"
                            maxWidth={compartmentWidth - 0.1}
                        >
                            {comp.label}
                        </Text>

                        {/* Count badge */}
                        {comp.chemises.length > 0 && (
                            <>
                                <mesh position={[xPos, 0.52, 0.52]}>
                                    <sphereGeometry args={[0.08, 16, 16]} />
                                    <meshStandardMaterial
                                        color="#DC2626"
                                        emissive="#DC2626"
                                        emissiveIntensity={0.5}
                                    />
                                </mesh>
                                <Text
                                    position={[xPos, 0.52, 0.53]}
                                    fontSize={0.06}
                                    color="white"
                                    anchorX="center"
                                    anchorY="middle"
                                >
                                    {comp.chemises.length}
                                </Text>
                            </>
                        )}

                        {/* Folders when selected */}
                        {isSelected && comp.chemises.length > 0 && (
                            <group position={[0, 0.8, 0]}>
                                {comp.chemises.slice(0, 5).map((chemise, chemiseIndex) => (
                                    <Chemise3D
                                        key={chemise.id}
                                        document={chemise}
                                        position={[xPos, chemiseIndex * 0.15, 0.3 + chemiseIndex * 0.1]}
                                        isOpen={false}
                                        scale={0.3}
                                    />
                                ))}
                                {comp.chemises.length > 5 && (
                                    <Text
                                        position={[xPos, 0.8, 0.8]}
                                        fontSize={0.08}
                                        color="#3B82F6"
                                        anchorX="center"
                                    >
                                        + {comp.chemises.length - 5} autres
                                    </Text>
                                )}
                            </group>
                        )}

                        {/* Hover hint */}
                        {isHovered && !isSelected && (
                            <Text
                                position={[xPos, -0.3, 0]}
                                fontSize={0.06}
                                color="#3B82F6"
                                anchorX="center"
                            >
                                Cliquer pour ouvrir
                            </Text>
                        )}
                    </group>
                );
            })}

            {/* Side handles */}
            <mesh position={[-2.1, 0.25, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
                <meshStandardMaterial color="#8B7355" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[2.1, 0.25, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
                <meshStandardMaterial color="#8B7355" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
}
