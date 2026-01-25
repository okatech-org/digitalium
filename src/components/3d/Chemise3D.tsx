/**
 * Chemise3D - Interactive 3D Folder Component
 * A folder that opens/closes and contains documents
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Chemise3DProps } from '@/types/document3d';

// Color mapping for document types
const TYPE_COLORS: Record<string, string> = {
    pdf: '#DC2626',
    word: '#2563EB',
    excel: '#16A34A',
    image: '#9333EA',
    contract: '#F59E0B',
    invoice: '#06B6D4',
    other: '#8B7355',
};

export function Chemise3D({
    chemise,
    position = [0, 0, 0],
    isOpen: externalIsOpen = false,
    isSelected = false,
    onOpen,
    onClose,
    onSelect,
    onDocumentClick,
}: Chemise3DProps) {
    const groupRef = useRef<THREE.Group>(null);
    const topCoverRef = useRef<THREE.Mesh>(null);

    const [isOpen, setIsOpen] = useState(externalIsOpen);
    const [isHovered, setIsHovered] = useState(false);
    const [rotationAngle, setRotationAngle] = useState(0);

    // Animation for opening/closing
    useFrame((state, delta) => {
        if (!topCoverRef.current) return;

        const targetAngle = isOpen ? Math.PI * 0.66 : 0;
        const newAngle = THREE.MathUtils.lerp(rotationAngle, targetAngle, delta * 4);
        setRotationAngle(newAngle);
        topCoverRef.current.rotation.x = -newAngle;

        // Breathing animation when hovered
        if (groupRef.current) {
            if (isHovered || isSelected) {
                const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.02;
                groupRef.current.scale.setScalar(scale);
            } else {
                groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 5);
            }
        }
    });

    const handleClick = (e: THREE.Event) => {
        e.stopPropagation();
        const newState = !isOpen;
        setIsOpen(newState);
        if (newState) {
            onOpen?.();
            onSelect?.(chemise);
        } else {
            onClose?.();
        }
    };

    const chemiseColor = chemise.color || TYPE_COLORS.other;

    return (
        <group
            ref={groupRef}
            position={position}
            onClick={handleClick}
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
        >
            {/* Base cover (bottom) */}
            <RoundedBox args={[2, 0.05, 2.8]} radius={0.02} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color={chemiseColor}
                    roughness={0.6}
                    metalness={0.1}
                />
            </RoundedBox>

            {/* Top cover (opens) */}
            <mesh ref={topCoverRef} position={[0, 0.025, -1.4]}>
                <RoundedBox args={[2, 0.05, 2.8]} radius={0.02}>
                    <meshStandardMaterial
                        color={chemiseColor}
                        roughness={0.6}
                        metalness={0.1}
                    />
                </RoundedBox>

                {/* Label on cover */}
                <Text
                    position={[0, 0.03, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.12}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={1.8}
                    font="/fonts/Inter-Bold.woff"
                >
                    {chemise.name}
                </Text>

                {/* Document count badge */}
                <mesh position={[0.7, 0.03, -0.8]}>
                    <circleGeometry args={[0.15, 32]} />
                    <meshStandardMaterial color="#1F2937" />
                </mesh>
                <Text
                    position={[0.7, 0.04, -0.8]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {chemise.documentCount}
                </Text>
            </mesh>

            {/* Documents inside (visible when open) */}
            {isOpen && chemise.documents.slice(0, 5).map((doc, i) => (
                <group
                    key={doc.id}
                    position={[0, 0.08 + i * 0.02, -0.1 + i * 0.15]}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDocumentClick?.(doc);
                    }}
                >
                    <mesh>
                        <boxGeometry args={[1.7, 0.015, 2.4]} />
                        <meshStandardMaterial
                            color="#FFFEF5"
                            roughness={0.9}
                        />
                    </mesh>

                    {/* Document icon header */}
                    <mesh position={[-0.65, 0.01, -0.9]}>
                        <boxGeometry args={[0.25, 0.01, 0.3]} />
                        <meshStandardMaterial color={TYPE_COLORS[doc.type] || TYPE_COLORS.other} />
                    </mesh>

                    {/* Document title */}
                    <Text
                        position={[0, 0.02, -0.3]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={0.08}
                        color="#1F2937"
                        anchorX="center"
                        anchorY="middle"
                        maxWidth={1.5}
                    >
                        {doc.name}
                    </Text>

                    {/* Document type */}
                    <Text
                        position={[0, 0.02, 0.1]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={0.06}
                        color="#6B7280"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {doc.type.toUpperCase()} • {doc.reference || doc.id}
                    </Text>

                    {/* Verified badge */}
                    {doc.verified && (
                        <mesh position={[0.7, 0.02, 0.9]}>
                            <sphereGeometry args={[0.05, 16, 16]} />
                            <meshStandardMaterial
                                color="#10B981"
                                emissive="#10B981"
                                emissiveIntensity={0.3}
                            />
                        </mesh>
                    )}
                </group>
            ))}

            {/* More documents indicator */}
            {isOpen && chemise.documentCount > 5 && (
                <Text
                    position={[0, 0.2, 0.8]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.08}
                    color="#6B7280"
                    anchorX="center"
                    anchorY="middle"
                >
                    +{chemise.documentCount - 5} autres documents
                </Text>
            )}

            {/* Selection glow */}
            {(isSelected || isHovered) && (
                <mesh position={[0, -0.02, 0]}>
                    <planeGeometry args={[2.4, 3.2]} />
                    <meshBasicMaterial
                        color={isSelected ? '#3B82F6' : '#60A5FA'}
                        transparent
                        opacity={0.3}
                    />
                </mesh>
            )}

            {/* Hover hint */}
            {isHovered && !isOpen && (
                <Text
                    position={[0, 0.6, 0]}
                    fontSize={0.1}
                    color="#3B82F6"
                    anchorX="center"
                    anchorY="middle"
                >
                    Cliquer pour ouvrir
                </Text>
            )}
        </group>
    );
}

export default Chemise3D;
