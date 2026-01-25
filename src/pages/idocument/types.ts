
import { LucideIcon } from "lucide-react";

// ========================================
// 3-LEVEL HIERARCHY: Classeur → Dossier → Fichier
// ========================================

// Niveau 3: Pièces jointes physiques (PDF, images, etc.)
export interface IAttachment {
    id: string;
    name: string;
    type: 'pdf' | 'doc' | 'image' | 'spreadsheet' | 'other';
    size: string;
    url?: string;
    created_at: string;
    updated_at?: string;
}

// Niveau 3: Fichier (Document individuel avec métadonnées)
export interface IFichier {
    id: string;
    name: string;
    description?: string;
    type: 'contrat' | 'facture' | 'devis' | 'rapport' | 'projet' | 'other';
    reference: string;
    author: string;
    status: 'brouillon' | 'en_revision' | 'approuve' | 'archive';
    tags: string[];
    attachments: IAttachment[];
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
}

// Niveau 2: Dossier (Folder - Catégorie/Thème)
export interface IDossier {
    id: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    fichiers: IFichier[];
    created_at: string;
}

// Niveau 1: Classeur (Binder - Conteneur principal)
export interface IClasseur {
    id: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    dossiers: IDossier[];
    is_system: boolean;
    created_at: string;
}

// ========================================
// LEGACY ALIASES (for backwards compatibility)
// ========================================
export type IDocumentFile = IAttachment;
export type IDocument = IFichier;
export type IDocumentFolder = IDossier;

// ========================================
// UTILITY TYPES
// ========================================
export type SearchType = 'all' | 'name' | 'content' | 'metadata';
export type SortType = 'date_desc' | 'date_asc' | 'name' | 'type';
export type FichierType = IFichier['type'];
export type FichierStatus = IFichier['status'];

export interface SmartAnalysisResult {
    file: File;
    smartName: string;
    type: string;
    classeurId: string;
    dossierId: string;
    folderId: string; // Alias for target folder
    confidence: number;
}

// Navigation state
export type NavigationLevel = 'classeurs' | 'dossiers' | 'fichiers' | 'details';
