/**
 * Armoire3D - 3D Filing Cabinet with drawers
 * Level 2: Contains multiple drawers with sorters
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Trieur3D } from './Trieur3D';
import type { Tiroir } from '@/types/document3d';

interface Armoire3DProps {
    tiroirs?: Tiroir[];
    position?: [number, number, number];
    onTiroirClick?: (tiroirId: string) => void;
}

const DEFAULT_TIROIRS: Tiroir[] = [
    { id: 'rh', label: 'Ressources Humaines', color: '#3B82F6', trieurs: [] },
    { id: 'compta', label: 'Comptabilité', color: '#10B981', trieurs: [] },
    { id: 'juridique', label: 'Juridique', color: '#F59E0B', trieurs: [] },
    { id: 'archives', label: 'Archives', color: '#8B5CF6', trieurs: [] },
];

export function Armoire3D({
    tiroirs = DEFAULT_TIROIRS,
    position = [0, 0, 0],
    onTiroirClick,
}: Armoire3DProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [openTiroir, setOpenTiroir] = useState<string | null>(null);
    const [hoveredTiroir, setHoveredTiroir] = useState<string | null>(null);
    const [tiroirOffsets, setTiroirOffsets] = useState<Map<string, number>>(new Map());

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Animate drawer opening
        const newOffsets = new Map(tiroirOffsets);
        let hasChanges = false;

        tiroirs.forEach((tiroir) => {
            const currentOffset = newOffsets.get(tiroir.id) || 0;
            const targetOffset = openTiroir === tiroir.id ? 1.5 : 0;

            if (Math.abs(currentOffset - targetOffset) > 0.01) {
                const newOffset = THREE.MathUtils.lerp(currentOffset, targetOffset, delta * 4);
                newOffsets.set(tiroir.id, newOffset);
                hasChanges = true;
            }
        });

        if (hasChanges) {
            setTiroirOffsets(newOffsets);
        }

        // Subtle ambient rotation when closed
        if (groupRef.current && !openTiroir) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
        }
    });

    const handleTiroirClick = (tiroirId: string) => {
        setOpenTiroir(openTiroir === tiroirId ? null : tiroirId);
        onTiroirClick?.(tiroirId);
    };

    const tiroirHeight = 1.0;
    const tiroirSpacing = 0.1;
    const armoireHeight = (tiroirHeight + tiroirSpacing) * tiroirs.length + 0.5;

    return (
        <group ref={groupRef} position={position}>
            {/* Cabinet body */}
            <RoundedBox
                args={[2.2, armoireHeight, 1.6]}
                radius={0.05}
                position={[0, armoireHeight / 2, 0]}
            >
                <meshStandardMaterial color="#505050" roughness={0.3} metalness={0.7} />
            </RoundedBox>

            {/* Title plate */}
            <mesh position={[0, armoireHeight + 0.15, 0.81]}>
                <boxGeometry args={[1.5, 0.2, 0.05]} />
                <meshStandardMaterial color="#8B7355" roughness={0.4} metalness={0.6} />
            </mesh>
            <Text
                position={[0, armoireHeight + 0.15, 0.84]}
                fontSize={0.12}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                ARMOIRE DE CLASSEMENT
            </Text>

            {/* Drawers */}
            {tiroirs.map((tiroir, index) => {
                const yPos = armoireHeight - 0.5 - (index * (tiroirHeight + tiroirSpacing));
                const offset = tiroirOffsets.get(tiroir.id) || 0;
                const isOpen = openTiroir === tiroir.id;
                const isHovered = hoveredTiroir === tiroir.id;

                return (
                    <group key={tiroir.id}>
                        {/* Drawer front */}
                        <mesh
                            position={[0, yPos, 0.8 + offset]}
                            onClick={() => handleTiroirClick(tiroir.id)}
                            onPointerOver={() => setHoveredTiroir(tiroir.id)}
                            onPointerOut={() => setHoveredTiroir(null)}
                        >
                            <boxGeometry args={[2, tiroirHeight - 0.1, 0.1]} />
                            <meshStandardMaterial
                                color={isHovered ? '#6B7280' : '#4B5563'}
                                roughness={0.5}
                                metalness={0.5}
                                emissive={isHovered ? '#6B7280' : '#000000'}
                                emissiveIntensity={isHovered ? 0.2 : 0}
                            />
                        </mesh>

                        {/* Drawer label */}
                        <mesh position={[0, yPos, 0.86 + offset]}>
                            <boxGeometry args={[1.2, 0.25, 0.05]} />
                            <meshStandardMaterial color={tiroir.color} roughness={0.6} metalness={0.3} />
                        </mesh>
                        <Text
                            position={[0, yPos, 0.89 + offset]}
                            fontSize={0.1}
                            color="white"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {tiroir.label}
                        </Text>

                        {/* Handle */}
                        <mesh position={[0, yPos - 0.35, 0.86 + offset]}>
                            <boxGeometry args={[0.4, 0.08, 0.08]} />
                            <meshStandardMaterial color="#8B7355" roughness={0.2} metalness={0.9} />
                        </mesh>

                        {/* Drawer interior when open */}
                        {isOpen && (
                            <group position={[0, yPos, 0.8 + offset]}>
                                {/* Back */}
                                <mesh position={[0, 0, -0.7]}>
                                    <boxGeometry args={[1.9, tiroirHeight - 0.2, 0.05]} />
                                    <meshStandardMaterial color="#3A3A3A" roughness={0.7} />
                                </mesh>
                                {/* Sides */}
                                <mesh position={[-0.95, 0, -0.35]}>
                                    <boxGeometry args={[0.05, tiroirHeight - 0.2, 1.4]} />
                                    <meshStandardMaterial color="#3A3A3A" roughness={0.7} />
                                </mesh>
                                <mesh position={[0.95, 0, -0.35]}>
                                    <boxGeometry args={[0.05, tiroirHeight - 0.2, 1.4]} />
                                    <meshStandardMaterial color="#3A3A3A" roughness={0.7} />
                                </mesh>

                                {/* Sorter inside */}
                                {tiroir.trieurs && tiroir.trieurs.length > 0 && (
                                    <Trieur3D
                                        position={[0, -0.2, -0.3]}
                                        compartiments={tiroir.trieurs[0].compartiments}
                                        isOpen={true}
                                    />
                                )}

                                {(!tiroir.trieurs || tiroir.trieurs.length === 0) && (
                                    <Text
                                        position={[0, 0, -0.3]}
                                        fontSize={0.1}
                                        color="#9CA3AF"
                                        anchorX="center"
                                    >
                                        Tiroir vide
                                    </Text>
                                )}
                            </group>
                        )}

                        {/* Content indicator */}
                        {tiroir.trieurs && tiroir.trieurs.length > 0 && !isOpen && (
                            <mesh position={[0.85, yPos + 0.35, 0.86 + offset]}>
                                <sphereGeometry args={[0.05, 16, 16]} />
                                <meshStandardMaterial
                                    color="#10B981"
                                    emissive="#10B981"
                                    emissiveIntensity={0.5}
                                />
                            </mesh>
                        )}

                        {/* Hover hint */}
                        {isHovered && !isOpen && (
                            <Text
                                position={[0, yPos - 0.6, 0.9 + offset]}
                                fontSize={0.07}
                                color="#3B82F6"
                                anchorX="center"
                            >
                                Cliquer pour ouvrir
                            </Text>
                        )}
                    </group>
                );
            })}

            {/* Feet */}
            {[-0.8, 0.8].map((x, i) => (
                <mesh key={`front-${i}`} position={[x, 0.05, 0.6]}>
                    <cylinderGeometry args={[0.08, 0.1, 0.1, 8]} />
                    <meshStandardMaterial color="#2A2A2A" roughness={0.8} metalness={0.3} />
                </mesh>
            ))}
            {[-0.8, 0.8].map((x, i) => (
                <mesh key={`back-${i}`} position={[x, 0.05, -0.6]}>
                    <cylinderGeometry args={[0.08, 0.1, 0.1, 8]} />
                    <meshStandardMaterial color="#2A2A2A" roughness={0.8} metalness={0.3} />
                </mesh>
            ))}
        </group>
    );
}
