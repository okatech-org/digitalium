/**
 * Chemise3D - 3D Folder component for document hierarchy
 * Level 4: Contains individual documents
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Document3D, STATUS_COLORS, TYPE_COLORS } from '@/types/document3d';

interface Chemise3DProps {
    document: Document3D;
    position?: [number, number, number];
    isOpen?: boolean;
    onClick?: () => void;
    scale?: number;
}

const STATUS_COLOR_MAP = {
    pending: '#EF4444',
    classified: '#F59E0B',
    archived: '#10B981',
};

const TYPE_COLOR_MAP = {
    pdf: '#EF4444',
    word: '#3B82F6',
    excel: '#10B981',
    image: '#8B5CF6',
    other: '#6B7280',
};

export function Chemise3D({
    document,
    position = [0, 0, 0],
    isOpen = false,
    onClick,
    scale = 1,
}: Chemise3DProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const [openProgress, setOpenProgress] = useState(0);

    const folderColor = TYPE_COLOR_MAP[document.type] || TYPE_COLOR_MAP.other;
    const statusColor = STATUS_COLOR_MAP[document.status];

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Animate opening
        const targetProgress = isOpen ? 1 : 0;
        setOpenProgress((prev) => THREE.MathUtils.lerp(prev, targetProgress, delta * 5));

        // Hover effect
        if (hovered) {
            groupRef.current.position.y = THREE.MathUtils.lerp(
                groupRef.current.position.y,
                position[1] + 0.1,
                delta * 10
            );
        } else {
            groupRef.current.position.y = THREE.MathUtils.lerp(
                groupRef.current.position.y,
                position[1],
                delta * 10
            );
        }
    });

    const coverRotation = openProgress * -Math.PI * 0.4;

    return (
        <group
            ref={groupRef}
            position={position}
            scale={scale}
            onClick={onClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            {/* Base of folder */}
            <RoundedBox
                args={[2, 0.05, 2.8]}
                radius={0.02}
                position={[0, 0, 0]}
            >
                <meshStandardMaterial
                    color={folderColor}
                    roughness={0.6}
                    metalness={0.1}
                />
            </RoundedBox>

            {/* Back of folder */}
            <RoundedBox
                args={[2, 0.05, 2.8]}
                radius={0.02}
                position={[0, 0.1, 0]}
            >
                <meshStandardMaterial
                    color={folderColor}
                    roughness={0.6}
                    metalness={0.1}
                />
            </RoundedBox>

            {/* Cover (animated) */}
            <group position={[0, 0.1, -1.35]} rotation={[coverRotation, 0, 0]}>
                <RoundedBox
                    args={[2, 0.03, 2.8]}
                    radius={0.02}
                    position={[0, 0, 1.35]}
                >
                    <meshStandardMaterial
                        color={folderColor}
                        roughness={0.5}
                        metalness={0.15}
                        emissive={hovered ? folderColor : '#000000'}
                        emissiveIntensity={hovered ? 0.2 : 0}
                    />
                </RoundedBox>

                {/* Tab */}
                <RoundedBox
                    args={[0.8, 0.02, 0.3]}
                    radius={0.01}
                    position={[0.4, 0.02, 0.1]}
                >
                    <meshStandardMaterial color={folderColor} />
                </RoundedBox>
            </group>

            {/* Label */}
            <Text
                position={[0, 0.15, 0.5]}
                fontSize={0.12}
                color="white"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.8}
            >
                {document.name}
            </Text>

            {/* Status LED */}
            <mesh position={[0.8, 0.15, -1]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial
                    color={statusColor}
                    emissive={statusColor}
                    emissiveIntensity={0.8}
                />
            </mesh>

            {/* Document pages inside (visible when open) */}
            {isOpen && (
                <group position={[0, 0.05, 0]}>
                    {[0, 1, 2].map((i) => (
                        <mesh key={i} position={[0, i * 0.01, 0]}>
                            <boxGeometry args={[1.8, 0.005, 2.5]} />
                            <meshStandardMaterial color="#FFFEF0" />
                        </mesh>
                    ))}
                </group>
            )}

            {/* Hover hint */}
            {hovered && !isOpen && (
                <Text
                    position={[0, 0.3, 0]}
                    fontSize={0.08}
                    color="#3B82F6"
                    anchorX="center"
                >
                    Cliquer pour ouvrir
                </Text>
            )}
        </group>
    );
}
