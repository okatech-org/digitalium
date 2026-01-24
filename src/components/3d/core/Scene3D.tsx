/**
 * Scene3D - Base 3D scene with lighting, controls, and environment
 * Used as the container for all 3D archive objects
 */

import React from 'react';
import { OrbitControls, Grid, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface Scene3DBaseProps {
    children?: React.ReactNode;
    showGrid?: boolean;
    showEnvironment?: boolean;
    cameraPosition?: [number, number, number];
    controlsEnabled?: boolean;
}

export function Scene3DBase({
    children,
    showGrid = true,
    showEnvironment = true,
    cameraPosition = [0, 8, 12],
    controlsEnabled = true,
}: Scene3DBaseProps) {
    return (
        <>
            {/* Camera */}
            <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />

            {/* Controls */}
            {controlsEnabled && (
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={3}
                    maxDistance={30}
                    maxPolarAngle={Math.PI / 2.1}
                    target={[0, 0, 0]}
                />
            )}

            {/* Lighting */}
            <ambientLight intensity={0.4} color="#ffffff" />
            <directionalLight
                position={[10, 15, 10]}
                intensity={1}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
            />
            <directionalLight
                position={[-10, 10, -5]}
                intensity={0.3}
                color="#b3e0ff"
            />
            <spotLight
                position={[0, 15, 0]}
                angle={0.4}
                penumbra={0.5}
                intensity={0.5}
                castShadow
            />

            {/* Environment */}
            {showEnvironment && (
                <Environment preset="city" background={false} />
            )}

            {/* Ground/Floor */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.01, 0]}
                receiveShadow
            >
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial
                    color="#1a1a2e"
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>

            {/* Grid */}
            {showGrid && (
                <Grid
                    position={[0, 0, 0]}
                    args={[50, 50]}
                    cellSize={1}
                    cellThickness={0.5}
                    cellColor="#3d3d5c"
                    sectionSize={5}
                    sectionThickness={1}
                    sectionColor="#5a5a8c"
                    fadeDistance={40}
                    fadeStrength={1}
                    infiniteGrid
                />
            )}

            {/* Desk surface (optional visual element) */}
            <mesh position={[0, 0.4, 0]} receiveShadow>
                <boxGeometry args={[12, 0.1, 8]} />
                <meshStandardMaterial
                    color="#2d2d44"
                    roughness={0.6}
                    metalness={0.3}
                />
            </mesh>

            {/* Children (3D objects) */}
            {children}
        </>
    );
}

export default Scene3DBase;
