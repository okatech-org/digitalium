/**
 * Types for 3D document hierarchy system
 */

export interface Document3D {
    id: string;
    name: string;
    type: 'pdf' | 'word' | 'excel' | 'image' | 'other';
    size: number;
    createdAt: Date;
    updatedAt: Date;
    status: 'pending' | 'classified' | 'archived';
    category: string;
    thumbnailUrl?: string;
}

export interface Compartiment {
    id: string;
    label: string;
    color: string;
    chemises: Document3D[];
}

export interface Trieur {
    id: string;
    label?: string;
    compartiments: Compartiment[];
}

export interface Tiroir {
    id: string;
    label: string;
    color: string;
    trieurs: Trieur[];
}

export interface Armoire {
    id: string;
    label: string;
    tiroirs: Tiroir[];
}

export type ViewMode = 'overview' | 'armoire' | 'trieur' | 'chemise';

// Color utilities
export const STATUS_COLORS = {
    pending: '#EF4444',
    classified: '#F59E0B',
    archived: '#10B981',
};

export const TYPE_COLORS = {
    pdf: '#EF4444',
    word: '#3B82F6',
    excel: '#10B981',
    image: '#8B5CF6',
    other: '#6B7280',
};
