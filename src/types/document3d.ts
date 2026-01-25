/**
 * Document 3D Types
 * Types for iArchive 3D visualization
 */

// Document status in archive
export type DocumentStatus = 'pending' | 'classified' | 'archived';

// Document type for color coding
export type DocumentType = 'pdf' | 'word' | 'excel' | 'image' | 'contract' | 'invoice' | 'other';

// Single document in a chemise
export interface Document3D {
    id: string;
    name: string;
    type: DocumentType;
    status: DocumentStatus;
    reference?: string;
    archivedAt?: string;
    retentionEnd?: string;
    size?: string;
    hash?: string;
    verified?: boolean;
}

// Chemise (folder) containing documents
export interface Chemise3D {
    id: string;
    name: string;
    category: string;
    color: string;
    documents: Document3D[];
    documentCount: number;
}

// Props for Chemise3D component
export interface Chemise3DProps {
    chemise: Chemise3D;
    position?: [number, number, number];
    isOpen?: boolean;
    isSelected?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    onSelect?: (chemise: Chemise3D) => void;
    onDocumentClick?: (document: Document3D) => void;
}

// Props for Document3D component 
export interface Document3DProps {
    document: Document3D;
    position?: [number, number, number];
    index?: number;
    onClick?: (document: Document3D) => void;
    isVisible?: boolean;
}

// Archive 3D view configuration
export interface Archive3DConfig {
    category: string;
    showDocuments: boolean;
    gridCols: number;
    spacing: number;
}
