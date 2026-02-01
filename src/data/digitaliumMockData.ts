/**
 * Digitalium Backoffice Mock Data
 * 
 * Internal documents, archives, and signatures for Digitalium's operations
 * 
 * ARCHITECTURE: Explorateur de fichiers
 * - Les fichiers (documents) sont DANS les dossiers
 * - Navigation par clic sur dossiers
 * - Création de dossiers/documents à n'importe quel niveau
 */

// =====================================================
// Types de base - Explorateur de fichiers
// =====================================================

export type FileType = 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'other';
export type FileStatus = 'draft' | 'review' | 'approved' | 'archived';

export interface DigitaliumFile {
    id: string;
    name: string;
    type: FileType;
    extension: string;
    size: string;
    status: FileStatus;
    author: string;
    createdAt: string;
    modifiedAt: string;
    folderId: string; // Lien vers le dossier parent
    collaborators?: string[];
    starred?: boolean;
    tags?: string[];
}

export interface DigitaliumFolder {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    parentId: string | null; // null = racine
    path: string;
    createdAt: string;
    modifiedAt: string;
}

// =====================================================
// Dossiers - Structure hiérarchique Digitalium
// =====================================================

export const digitaliumFolders: DigitaliumFolder[] = [
    // Dossier racine uniquement - Les données réelles seront chargées depuis la base de données
    { id: 'root', name: 'Mes Dossiers', icon: '📁', color: 'blue', parentId: null, path: '/', createdAt: '2024-01-01', modifiedAt: '2026-01-31' },
];

// =====================================================
// Fichiers (Documents) - Liés aux dossiers via folderId
// =====================================================

export const digitaliumFiles: DigitaliumFile[] = [
    // Aucune donnée fictive - Les fichiers réels seront chargés depuis la base de données
];

// =====================================================
// Helpers - Fonctions utilitaires pour l'explorateur
// =====================================================

/** Récupérer les sous-dossiers d'un dossier */
export function getSubfolders(parentId: string): DigitaliumFolder[] {
    return digitaliumFolders.filter(f => f.parentId === parentId);
}

/** Récupérer les fichiers d'un dossier */
export function getFilesInFolder(folderId: string): DigitaliumFile[] {
    return digitaliumFiles.filter(f => f.folderId === folderId);
}

/** Récupérer le chemin complet (breadcrumb) d'un dossier */
export function getFolderBreadcrumb(folderId: string): DigitaliumFolder[] {
    const breadcrumb: DigitaliumFolder[] = [];
    let current = digitaliumFolders.find(f => f.id === folderId);
    while (current) {
        breadcrumb.unshift(current);
        current = current.parentId ? digitaliumFolders.find(f => f.id === current!.parentId) : undefined;
    }
    return breadcrumb;
}

/** Compter les éléments d'un dossier (fichiers + sous-dossiers) */
export function getFolderItemCount(folderId: string): { files: number; folders: number } {
    return {
        files: digitaliumFiles.filter(f => f.folderId === folderId).length,
        folders: digitaliumFolders.filter(f => f.parentId === folderId).length,
    };
}

// =====================================================
// Compatibilité - Ancien format (à supprimer progressivement)
// =====================================================

export interface DigitaliumDocument {
    id: string;
    title: string;
    type: 'contract' | 'legal' | 'procedure' | 'technical' | 'hr' | 'marketing';
    status: 'draft' | 'review' | 'approved' | 'archived';
    author: string;
    lastModified: string;
    collaborators: string[];
    category: 'my' | 'shared' | 'team' | 'templates';
}

// Legacy - Mapping vers les nouveaux fichiers
export const digitaliumDocuments: DigitaliumDocument[] = digitaliumFiles.slice(0, 10).map(f => ({
    id: f.id,
    title: f.name,
    type: 'contract' as const,
    status: f.status,
    author: f.author,
    lastModified: f.modifiedAt,
    collaborators: f.collaborators || [],
    category: 'my' as const,
}));

// =====================================================
// iArchive - Archives légales PME Digitalium
// =====================================================

export interface DigitaliumArchive {
    id: string;
    title: string;
    category: 'fiscal' | 'social' | 'legal' | 'clients' | 'vault' | 'certificates';
    retentionYears: number;
    archivedDate: string;
    expirationDate: string;
    size: string;
    certified: boolean;
    hash?: string;
    folderId?: string; // Lien optionnel vers un dossier d'archives
}

// =====================================================
// Dossiers d'Archives - Organisation hiérarchique par catégorie
// =====================================================

export type ArchiveCategory = 'fiscal' | 'social' | 'legal' | 'clients' | 'vault' | 'certificates';

export interface DigitaliumArchiveFolder {
    id: string;
    name: string;
    color?: string;
    parentId: string | null; // null = racine de la catégorie
    category: ArchiveCategory;
    retentionYears: number; // Hérité de la catégorie ou personnalisé
    path: string;
    createdAt: string;
    modifiedAt: string;
}

// Durées de rétention par défaut par catégorie (en années)
export const ARCHIVE_RETENTION_DEFAULTS: Record<ArchiveCategory, number> = {
    fiscal: 10,
    social: 5,
    legal: 30,
    clients: 10,
    vault: 99, // Permanent
    certificates: 99, // Permanent
};

export const digitaliumArchiveFolders: DigitaliumArchiveFolder[] = [
    // Aucune donnée fictive - Les dossiers d'archives seront chargés depuis la base de données
];

// Helper: Récupérer les sous-dossiers d'archives par catégorie
export function getArchiveSubfolders(parentId: string, category: ArchiveCategory): DigitaliumArchiveFolder[] {
    return digitaliumArchiveFolders.filter(f => f.parentId === parentId && f.category === category);
}

// Helper: Récupérer les archives dans un dossier
export function getArchivesInFolder(folderId: string): DigitaliumArchive[] {
    return digitaliumArchives.filter(a => a.folderId === folderId);
}

// Helper: Compter les éléments dans un dossier d'archives
export function getArchiveFolderItemCount(folderId: string, category: ArchiveCategory): { archives: number; folders: number } {
    return {
        archives: digitaliumArchives.filter(a => a.folderId === folderId).length,
        folders: digitaliumArchiveFolders.filter(f => f.parentId === folderId && f.category === category).length,
    };
}

export const digitaliumArchives: DigitaliumArchive[] = [
    // Aucune donnée fictive - Les archives seront chargées depuis la base de données
];

// =====================================================
// iSignature - Signatures électroniques Digitalium
// =====================================================

export interface DigitaliumSignature {
    id: string;
    title: string;
    type: 'contract' | 'nda' | 'amendment' | 'hr' | 'partner';
    status: 'pending' | 'signed' | 'refused' | 'expired';
    signers: { name: string; status: 'pending' | 'signed' | 'refused'; signedAt?: string }[];
    createdAt: string;
    deadline?: string;
}

export const digitaliumSignatures: DigitaliumSignature[] = [
    // Aucune donnée fictive - Les signatures seront chargées depuis la base de données
];

// =====================================================
// Stats agrégées pour le dashboard
// =====================================================

export const digitaliumStats = {
    documents: {
        total: digitaliumDocuments.length,
        drafts: digitaliumDocuments.filter(d => d.status === 'draft').length,
        inReview: digitaliumDocuments.filter(d => d.status === 'review').length,
        approved: digitaliumDocuments.filter(d => d.status === 'approved').length,
    },
    archives: {
        total: digitaliumArchives.length,
        certified: digitaliumArchives.filter(a => a.certified).length,
        fiscal: digitaliumArchives.filter(a => a.category === 'fiscal').length,
        social: digitaliumArchives.filter(a => a.category === 'social').length,
        legal: digitaliumArchives.filter(a => a.category === 'legal').length,
    },
    signatures: {
        total: digitaliumSignatures.length,
        pending: digitaliumSignatures.filter(s => s.status === 'pending').length,
        signed: digitaliumSignatures.filter(s => s.status === 'signed').length,
    },
};
