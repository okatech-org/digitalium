/**
 * document3d.ts - Types for 3D document components
 */

// Document status in 3D environment
export type Document3DStatus = 'pending' | 'classified' | 'archived' | 'verified';

// Document types with associated colors
export type DocumentFileType = 'pdf' | 'word' | 'excel' | 'image' | 'presentation' | 'other';

// 3D position tuple
export type Position3D = [number, number, number];

// Base document interface for 3D
export interface Document3D {
    id: string;
    name: string;
    type: DocumentFileType;
    status: Document3DStatus;
    size?: number;
    createdAt?: number;
    archivedAt?: number;
    category?: string;
    hash?: string;
}

// Chemise 3D Props
export interface Chemise3DProps {
    document?: Document3D;
    isOpen?: boolean;
    position?: Position3D;
    rotation?: Position3D;
    scale?: number;
    color?: string;
    onOpen?: () => void;
    onClose?: () => void;
    onClick?: () => void;
    onClassify?: () => void;
}

// Scene 3D Props
export interface Scene3DProps {
    documents?: Document3D[];
    onDocumentClick?: (doc: Document3D) => void;
    onDocumentOpen?: (doc: Document3D) => void;
    className?: string;
}

// Transition Props
export interface TransitionTo3DProps {
    isActive: boolean;
    onComplete?: () => void;
    children: React.ReactNode;
    duration?: number;
}

// Canvas Wrapper Props
export interface Canvas3DWrapperProps {
    children: React.ReactNode;
    className?: string;
    fallback?: React.ReactNode;
    onError?: (error: Error) => void;
}

// Archive 3D Scene Props
export interface Archive3DSceneProps {
    documents: Document3D[];
    category: string;
    onDocumentClick?: (doc: Document3D) => void;
    onViewDocument?: (doc: Document3D) => void;
    onDownloadDocument?: (doc: Document3D) => void;
}

// Color mapping for document types
export const DOCUMENT_TYPE_COLORS: Record<DocumentFileType, string> = {
    pdf: '#DC2626',      // Red
    word: '#2563EB',     // Blue
    excel: '#16A34A',    // Green
    image: '#9333EA',    // Purple
    presentation: '#F97316', // Orange
    other: '#8B7355',    // Beige
};

// Status colors for LED indicator
export const DOCUMENT_STATUS_COLORS: Record<Document3DStatus, string> = {
    pending: '#EF4444',    // Red
    classified: '#F59E0B', // Amber
    archived: '#10B981',   // Green
    verified: '#3B82F6',   // Blue
};
