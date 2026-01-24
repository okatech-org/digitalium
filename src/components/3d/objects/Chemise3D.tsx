/**
 * Chemise3D - Interactive 3D folder/chemise for document archiving
 * Core POC component with opening/closing animation
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Chemise3DProps } from '@/types/document3d';
import { DOCUMENT_TYPE_COLORS, DOCUMENT_STATUS_COLORS } from '@/types/document3d';

export function Chemise3D({
    document: docData,
    isOpen: externalIsOpen = false,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    color,
    onOpen,
    onClose,
    onClick,
    onClassify,
}: Chemise3DProps) {
    const groupRef = useRef<THREE.Group>(null);
    const topCoverRef = useRef<THREE.Mesh>(null);

    const [isOpen, setIsOpen] = useState(externalIsOpen);
    const [isHovered, setIsHovered] = useState(false);
    const [rotationAngle, setRotationAngle] = useState(0);

    // Animation of the folder opening/closing
    useFrame((state, delta) => {
        if (!topCoverRef.current) return;

        // Target angle: 0° closed, 120° open
        const targetAngle = isOpen ? Math.PI * 0.66 : 0;
        const currentAngle = rotationAngle;

        // Smooth animation using lerp
        const newAngle = THREE.MathUtils.lerp(currentAngle, targetAngle, delta * 5);
        setRotationAngle(newAngle);

        // Apply rotation to top cover (pivot from back edge)
        topCoverRef.current.rotation.x = -newAngle;

        // Breathing animation when hovered
        if (isHovered && groupRef.current) {
            const breathScale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.015;
            groupRef.current.scale.setScalar(scale * breathScale);
        } else if (groupRef.current) {
            groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), delta * 5);
        }
    });

    const handleClick = (e: any) => {
        e.stopPropagation?.();
        const newState = !isOpen;
        setIsOpen(newState);

        if (newState) {
            onOpen?.();
        } else {
            onClose?.();
        }

        onClick?.();
    };

    // Get color based on document type or custom color
    const getChemiseColor = () => {
        if (color) return color;
        if (!docData) return '#8B7355'; // Default beige
        return DOCUMENT_TYPE_COLORS[docData.type] || '#8B7355';
    };

    // Get status indicator color
    const getStatusColor = () => {
        if (!docData) return '#6B7280';
        return DOCUMENT_STATUS_COLORS[docData.status] || '#6B7280';
    };

    const chemiseColor = getChemiseColor();

    return (
        <group
            ref={groupRef}
            position={position}
            rotation={rotation as [number, number, number]}
            onClick={handleClick}
            onPointerOver={(e) => {
                e.stopPropagation();
                setIsHovered(true);
                window.document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setIsHovered(false);
                window.document.body.style.cursor = 'auto';
            }}
        >
            {/* Bottom cover (base of the folder) */}
            <RoundedBox
                args={[2, 0.05, 2.8]}
                radius={0.02}
                position={[0, 0, 0]}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial
                    color={chemiseColor}
                    roughness={0.6}
                    metalness={0.1}
                />
            </RoundedBox>

            {/* Side walls */}
            <RoundedBox
                args={[0.05, 0.2, 2.8]}
                radius={0.01}
                position={[-0.975, 0.1, 0]}
                castShadow
            >
                <meshStandardMaterial
                    color={chemiseColor}
                    roughness={0.6}
                    metalness={0.1}
                />
            </RoundedBox>
            <RoundedBox
                args={[0.05, 0.2, 2.8]}
                radius={0.01}
                position={[0.975, 0.1, 0]}
                castShadow
            >
                <meshStandardMaterial
                    color={chemiseColor}
                    roughness={0.6}
                    metalness={0.1}
                />
            </RoundedBox>

            {/* Back wall */}
            <RoundedBox
                args={[2, 0.2, 0.05]}
                radius={0.01}
                position={[0, 0.1, -1.375]}
                castShadow
            >
                <meshStandardMaterial
                    color={chemiseColor}
                    roughness={0.6}
                    metalness={0.1}
                />
            </RoundedBox>

            {/* Top cover (opens from back) - pivot point at back edge */}
            <group position={[0, 0.2, -1.4]}>
                <mesh ref={topCoverRef} castShadow>
                    <RoundedBox
                        args={[2, 0.05, 2.8]}
                        radius={0.02}
                        position={[0, 0, 1.4]}
                    >
                        <meshStandardMaterial
                            color={chemiseColor}
                            roughness={0.6}
                            metalness={0.1}
                        />
                    </RoundedBox>

                    {/* Label on cover */}
                    {docData && (
                        <Text
                            position={[0, 0.03, 1.4]}
                            rotation={[-Math.PI / 2, 0, 0]}
                            fontSize={0.12}
                            color="white"
                            anchorX="center"
                            anchorY="middle"
                            maxWidth={1.8}
                        >
                            {docData.name.length > 25
                                ? docData.name.substring(0, 25) + '...'
                                : docData.name}
                        </Text>
                    )}

                    {/* Type badge on cover */}
                    {docData && (
                        <Text
                            position={[0.7, 0.03, 0.7]}
                            rotation={[-Math.PI / 2, 0, 0]}
                            fontSize={0.08}
                            color="rgba(255,255,255,0.7)"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {docData.type.toUpperCase()}
                        </Text>
                    )}
                </mesh>
            </group>

            {/* Document inside (visible when open) */}
            {docData && isOpen && (
                <group position={[0, 0.1, 0]}>
                    {/* Paper */}
                    <mesh castShadow>
                        <boxGeometry args={[1.6, 0.02, 2.3]} />
                        <meshStandardMaterial
                            color="#ffffff"
                            roughness={0.9}
                        />
                    </mesh>

                    {/* Document type indicator */}
                    <Text
                        position={[0, 0.02, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={0.15}
                        color="#374151"
                        anchorX="center"
                        anchorY="middle"
                    >
                        📄
                    </Text>

                    {/* File name on paper */}
                    <Text
                        position={[0, 0.02, 0.4]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        fontSize={0.08}
                        color="#6B7280"
                        anchorX="center"
                        anchorY="middle"
                        maxWidth={1.4}
                    >
                        {docData.name}
                    </Text>
                </group>
            )}

            {/* Status LED indicator */}
            {docData && (
                <mesh position={[0.85, 0.25, -1.2]}>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshStandardMaterial
                        color={getStatusColor()}
                        emissive={getStatusColor()}
                        emissiveIntensity={0.8}
                    />
                </mesh>
            )}

            {/* Hover hint */}
            {isHovered && (
                <Text
                    position={[0, 0.8, 0]}
                    fontSize={0.1}
                    color="#3B82F6"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.01}
                    outlineColor="#000000"
                >
                    {isOpen ? '🔒 Fermer' : '📂 Ouvrir'}
                </Text>
            )}

            {/* Glow effect when hovered */}
            {isHovered && (
                <mesh position={[0, 0.1, 0]}>
                    <boxGeometry args={[2.2, 0.4, 3]} />
                    <meshBasicMaterial
                        color={chemiseColor}
                        transparent
                        opacity={0.1}
                    />
                </mesh>
            )}
        </group>
    );
}

export default Chemise3D;
