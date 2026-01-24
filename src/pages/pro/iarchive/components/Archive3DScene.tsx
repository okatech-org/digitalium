/**
 * Archive3DScene - 3D scene for archive visualization
 * Displays documents as interactive 3D Chemises on a virtual desk
 */

import React, { useState, useMemo } from 'react';
import { Scene3DBase } from '@/components/3d/core/Scene3D';
import { Chemise3D } from '@/components/3d/objects/Chemise3D';
import { Text } from '@react-three/drei';
import type { Document3D, Archive3DSceneProps } from '@/types/document3d';

export function Archive3DScene({
    documents,
    category,
    onDocumentClick,
    onViewDocument,
    onDownloadDocument,
}: Archive3DSceneProps) {
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

    // Calculate grid positions for documents
    const documentPositions = useMemo(() => {
        const cols = 4;
        const spacing = 2.5;
        const startX = -((Math.min(documents.length, cols) - 1) * spacing) / 2;
        const startZ = -2;

        return documents.slice(0, 12).map((doc, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            return {
                doc,
                position: [
                    startX + col * spacing,
                    0.5, // On desk
                    startZ + row * spacing,
                ] as [number, number, number],
            };
        });
    }, [documents]);

    const handleDocumentClick = (doc: Document3D) => {
        setSelectedDoc(selectedDoc === doc.id ? null : doc.id);
        onDocumentClick?.(doc);
    };

    return (
        <Scene3DBase showGrid={true} showEnvironment={true}>
            {/* Category title */}
            <Text
                position={[0, 3, -5]}
                fontSize={0.5}
                color="#10B981"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                {category}
            </Text>

            {/* Stats */}
            <Text
                position={[0, 2.5, -5]}
                fontSize={0.2}
                color="#9CA3AF"
                anchorX="center"
                anchorY="middle"
            >
                {documents.length} documents
            </Text>

            {/* Document Chemises */}
            {documentPositions.map(({ doc, position }) => (
                <Chemise3D
                    key={doc.id}
                    document={doc}
                    position={position}
                    isOpen={selectedDoc === doc.id}
                    onOpen={() => handleDocumentClick(doc)}
                    onClose={() => setSelectedDoc(null)}
                    onClick={() => handleDocumentClick(doc)}
                />
            ))}

            {/* Empty state */}
            {documents.length === 0 && (
                <Text
                    position={[0, 1.5, 0]}
                    fontSize={0.3}
                    color="#6B7280"
                    anchorX="center"
                    anchorY="middle"
                >
                    Aucun document dans cette catégorie
                </Text>
            )}

            {/* Instructions */}
            <Text
                position={[0, 0.3, 4]}
                fontSize={0.15}
                color="#6B7280"
                anchorX="center"
                anchorY="middle"
            >
                🖱️ Cliquer pour ouvrir • Molette pour zoomer • Glisser pour tourner
            </Text>
        </Scene3DBase>
    );
}

export default Archive3DScene;
