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
    // === RACINE ===
    { id: 'root', name: 'Mes Dossiers', icon: '📁', color: 'blue', parentId: null, path: '/', createdAt: '2024-01-01', modifiedAt: '2026-01-31' },

    // === CONTRATS CLIENTS ===
    { id: 'folder-contrats', name: 'Contrats Clients', icon: '📋', color: 'blue', parentId: 'root', path: '/Contrats Clients', createdAt: '2024-01-01', modifiedAt: '2026-01-30' },
    { id: 'folder-contrats-admin', name: 'Administration Publique', icon: '🏛️', color: 'emerald', parentId: 'folder-contrats', path: '/Contrats Clients/Administration Publique', createdAt: '2024-01-01', modifiedAt: '2026-01-30' },
    { id: 'folder-presidence', name: 'Présidence de la République', color: 'emerald', parentId: 'folder-contrats-admin', path: '/Contrats Clients/Administration Publique/Présidence de la République', createdAt: '2025-06-15', modifiedAt: '2026-01-28' },
    { id: 'folder-minfin', name: 'Ministère des Finances', color: 'emerald', parentId: 'folder-contrats-admin', path: '/Contrats Clients/Administration Publique/Ministère des Finances', createdAt: '2025-03-20', modifiedAt: '2026-01-30' },
    { id: 'folder-minpeche', name: 'Ministère de la Pêche', color: 'emerald', parentId: 'folder-contrats-admin', path: '/Contrats Clients/Administration Publique/Ministère de la Pêche', createdAt: '2025-08-10', modifiedAt: '2026-01-15' },
    { id: 'folder-cnss', name: 'CNSS', color: 'emerald', parentId: 'folder-contrats-admin', path: '/Contrats Clients/Administration Publique/CNSS', createdAt: '2025-09-01', modifiedAt: '2026-01-22' },
    { id: 'folder-contrats-entreprise', name: 'Entreprises', icon: '🏢', color: 'orange', parentId: 'folder-contrats', path: '/Contrats Clients/Entreprises', createdAt: '2024-01-01', modifiedAt: '2026-01-29' },
    { id: 'folder-ascoma', name: 'ASCOMA Gabon', color: 'orange', parentId: 'folder-contrats-entreprise', path: '/Contrats Clients/Entreprises/ASCOMA Gabon', createdAt: '2024-06-01', modifiedAt: '2026-01-29' },
    { id: 'folder-bgfi', name: 'BGFI Bank', color: 'orange', parentId: 'folder-contrats-entreprise', path: '/Contrats Clients/Entreprises/BGFI Bank', createdAt: '2025-02-15', modifiedAt: '2025-12-10' },
    { id: 'folder-setrag', name: 'SETRAG', color: 'orange', parentId: 'folder-contrats-entreprise', path: '/Contrats Clients/Entreprises/SETRAG', createdAt: '2025-04-20', modifiedAt: '2025-11-30' },
    { id: 'folder-contrats-organisme', name: 'Organismes & Collectivités', icon: '🏫', color: 'purple', parentId: 'folder-contrats', path: '/Contrats Clients/Organismes & Collectivités', createdAt: '2024-01-01', modifiedAt: '2026-01-25' },
    { id: 'folder-mairie-lbv', name: 'Mairie de Libreville', color: 'purple', parentId: 'folder-contrats-organisme', path: '/Contrats Clients/Organismes & Collectivités/Mairie de Libreville', createdAt: '2024-08-01', modifiedAt: '2026-01-25' },
    { id: 'folder-mairie-pg', name: 'Mairie de Port-Gentil', color: 'purple', parentId: 'folder-contrats-organisme', path: '/Contrats Clients/Organismes & Collectivités/Mairie de Port-Gentil', createdAt: '2025-01-10', modifiedAt: '2025-11-20' },

    // === FACTURATION ===
    { id: 'folder-facturation', name: 'Facturation & Relances', icon: '💰', color: 'emerald', parentId: 'root', path: '/Facturation & Relances', createdAt: '2024-01-01', modifiedAt: '2026-01-31' },
    { id: 'folder-factures-2026', name: 'Factures 2026', parentId: 'folder-facturation', path: '/Facturation & Relances/Factures 2026', createdAt: '2026-01-01', modifiedAt: '2026-01-31' },
    { id: 'folder-factures-2025', name: 'Factures 2025', parentId: 'folder-facturation', path: '/Facturation & Relances/Factures 2025', createdAt: '2025-01-01', modifiedAt: '2025-12-31' },
    { id: 'folder-relances', name: 'Courriers de Relance', parentId: 'folder-facturation', path: '/Facturation & Relances/Courriers de Relance', createdAt: '2024-01-01', modifiedAt: '2026-01-28' },
    { id: 'folder-devis', name: 'Devis & Propositions', parentId: 'folder-facturation', path: '/Facturation & Relances/Devis & Propositions', createdAt: '2024-01-01', modifiedAt: '2026-01-30' },

    // === RH ===
    { id: 'folder-rh', name: 'Ressources Humaines', icon: '👥', color: 'pink', parentId: 'root', path: '/Ressources Humaines', createdAt: '2024-01-01', modifiedAt: '2026-01-20' },
    { id: 'folder-personnel', name: 'Dossiers du Personnel', parentId: 'folder-rh', path: '/Ressources Humaines/Dossiers du Personnel', createdAt: '2024-01-01', modifiedAt: '2026-01-20' },
    { id: 'folder-personnel-ornella', name: 'DOUMBA Ornella', parentId: 'folder-personnel', path: '/Ressources Humaines/Dossiers du Personnel/DOUMBA Ornella', createdAt: '2023-01-01', modifiedAt: '2026-01-10' },
    { id: 'folder-personnel-marc', name: 'NGUEMA Marc', parentId: 'folder-personnel', path: '/Ressources Humaines/Dossiers du Personnel/NGUEMA Marc', createdAt: '2024-03-15', modifiedAt: '2026-01-15' },
    { id: 'folder-recrutement', name: 'Recrutement', parentId: 'folder-rh', path: '/Ressources Humaines/Recrutement', createdAt: '2024-01-01', modifiedAt: '2026-01-18' },
    { id: 'folder-paie', name: 'Paie & Déclarations', parentId: 'folder-rh', path: '/Ressources Humaines/Paie & Déclarations', createdAt: '2024-01-01', modifiedAt: '2026-01-05' },

    // === JURIDIQUE ===
    { id: 'folder-juridique', name: 'Juridique & Conformité', icon: '⚖️', color: 'red', parentId: 'root', path: '/Juridique & Conformité', createdAt: '2024-01-01', modifiedAt: '2026-01-15' },
    { id: 'folder-statuts', name: 'Statuts & Actes', parentId: 'folder-juridique', path: '/Juridique & Conformité/Statuts & Actes', createdAt: '2020-01-01', modifiedAt: '2024-06-30' },
    { id: 'folder-cgv', name: 'CGV & Politiques', parentId: 'folder-juridique', path: '/Juridique & Conformité/CGV & Politiques', createdAt: '2024-01-01', modifiedAt: '2026-01-15' },
    { id: 'folder-nda', name: 'NDA & Confidentialité', parentId: 'folder-juridique', path: '/Juridique & Conformité/NDA & Confidentialité', createdAt: '2024-01-01', modifiedAt: '2026-01-05' },

    // === TECHNIQUE ===
    { id: 'folder-technique', name: 'Technique & Produit', icon: '🔧', color: 'cyan', parentId: 'root', path: '/Technique & Produit', createdAt: '2024-01-01', modifiedAt: '2026-01-28' },
    { id: 'folder-architecture', name: 'Architecture & Specs', parentId: 'folder-technique', path: '/Technique & Produit/Architecture & Specs', createdAt: '2024-01-01', modifiedAt: '2026-01-28' },
    { id: 'folder-deploiements', name: 'Procédures Déploiement', parentId: 'folder-technique', path: '/Technique & Produit/Procédures Déploiement', createdAt: '2024-01-01', modifiedAt: '2026-01-18' },

    // === MARKETING ===
    { id: 'folder-marketing', name: 'Marketing & Commercial', icon: '📈', color: 'amber', parentId: 'root', path: '/Marketing & Commercial', createdAt: '2024-01-01', modifiedAt: '2026-01-29' },
    { id: 'folder-presentations', name: 'Présentations', parentId: 'folder-marketing', path: '/Marketing & Commercial/Présentations', createdAt: '2024-01-01', modifiedAt: '2026-01-29' },
    { id: 'folder-brochures', name: 'Brochures & Fiches', parentId: 'folder-marketing', path: '/Marketing & Commercial/Brochures & Fiches', createdAt: '2024-01-01', modifiedAt: '2026-01-20' },

    // === PROJETS ===
    { id: 'folder-projets', name: 'Projets En Cours', icon: '🚀', color: 'violet', parentId: 'root', path: '/Projets En Cours', createdAt: '2024-01-01', modifiedAt: '2026-01-31' },
    { id: 'folder-projet-idn', name: 'IDN.ga', parentId: 'folder-projets', path: '/Projets En Cours/IDN.ga', createdAt: '2024-06-01', modifiedAt: '2026-01-31' },
    { id: 'folder-projet-presidence', name: 'Présidence.ga', parentId: 'folder-projets', path: '/Projets En Cours/Présidence.ga', createdAt: '2025-03-01', modifiedAt: '2026-01-28' },
    { id: 'folder-projet-consulat', name: 'Consulat.ga', parentId: 'folder-projets', path: '/Projets En Cours/Consulat.ga', createdAt: '2025-07-01', modifiedAt: '2026-01-25' },
    { id: 'folder-projet-ietude', name: 'iÉtude.ga', parentId: 'folder-projets', path: '/Projets En Cours/iÉtude.ga', createdAt: '2025-09-01', modifiedAt: '2026-01-30' },
];

// =====================================================
// Fichiers (Documents) - Liés aux dossiers via folderId
// =====================================================

export const digitaliumFiles: DigitaliumFile[] = [
    // === Contrats - Ministère des Finances ===
    { id: 'file-001', name: 'Contrat SaaS - iDocument', type: 'pdf', extension: 'pdf', size: '2.4 MB', status: 'approved', author: 'Ornella DOUMBA', createdAt: '2025-09-15', modifiedAt: '2026-01-30', folderId: 'folder-minfin', collaborators: ['Marc NGUEMA'], starred: true },
    { id: 'file-002', name: 'Avenant n°1 - Extension iArchive', type: 'pdf', extension: 'pdf', size: '856 KB', status: 'approved', author: 'Ornella DOUMBA', createdAt: '2026-01-20', modifiedAt: '2026-01-28', folderId: 'folder-minfin' },
    { id: 'file-003', name: 'PV Réunion Kick-off', type: 'document', extension: 'docx', size: '1.2 MB', status: 'approved', author: 'Sophie MBOU', createdAt: '2025-09-18', modifiedAt: '2025-09-20', folderId: 'folder-minfin' },

    // === Contrats - Présidence ===
    { id: 'file-004', name: 'Contrat SaaS - Présidence.ga', type: 'pdf', extension: 'pdf', size: '3.1 MB', status: 'review', author: 'Ornella DOUMBA', createdAt: '2026-01-25', modifiedAt: '2026-01-28', folderId: 'folder-presidence', starred: true },
    { id: 'file-005', name: 'Cahier des charges v2', type: 'document', extension: 'docx', size: '4.5 MB', status: 'approved', author: 'Direction Présidence', createdAt: '2025-06-20', modifiedAt: '2025-08-10', folderId: 'folder-presidence' },

    // === Contrats - ASCOMA ===
    { id: 'file-006', name: 'Contrat Licence Enterprise', type: 'pdf', extension: 'pdf', size: '1.8 MB', status: 'approved', author: 'Ornella DOUMBA', createdAt: '2024-06-15', modifiedAt: '2024-07-01', folderId: 'folder-ascoma' },
    { id: 'file-007', name: 'Annexe Technique SLA', type: 'document', extension: 'docx', size: '650 KB', status: 'approved', author: 'Marc NGUEMA', createdAt: '2024-06-15', modifiedAt: '2024-06-20', folderId: 'folder-ascoma' },

    // === Contrats - Mairie Libreville ===
    { id: 'file-008', name: 'Contrat Licence PME', type: 'pdf', extension: 'pdf', size: '1.5 MB', status: 'review', author: 'Ornella DOUMBA', createdAt: '2026-01-25', modifiedAt: '2026-01-29', folderId: 'folder-mairie-lbv' },

    // === Facturation 2026 ===
    { id: 'file-009', name: 'FAC-2026-001 - MinFin Janvier', type: 'pdf', extension: 'pdf', size: '125 KB', status: 'approved', author: 'Comptabilité', createdAt: '2026-01-05', modifiedAt: '2026-01-05', folderId: 'folder-factures-2026' },
    { id: 'file-010', name: 'FAC-2026-002 - ASCOMA Janvier', type: 'pdf', extension: 'pdf', size: '98 KB', status: 'approved', author: 'Comptabilité', createdAt: '2026-01-10', modifiedAt: '2026-01-10', folderId: 'folder-factures-2026' },
    { id: 'file-011', name: 'FAC-2026-003 - CNSS Janvier', type: 'pdf', extension: 'pdf', size: '115 KB', status: 'draft', author: 'Comptabilité', createdAt: '2026-01-28', modifiedAt: '2026-01-31', folderId: 'folder-factures-2026' },

    // === Devis ===
    { id: 'file-012', name: 'Devis - Présidence Extension', type: 'pdf', extension: 'pdf', size: '450 KB', status: 'approved', author: 'Marc NGUEMA', createdAt: '2026-01-20', modifiedAt: '2026-01-22', folderId: 'folder-devis', starred: true },
    { id: 'file-013', name: 'Proposition Commerciale - BGFI', type: 'presentation', extension: 'pptx', size: '8.2 MB', status: 'draft', author: 'Marc NGUEMA', createdAt: '2026-01-28', modifiedAt: '2026-01-30', folderId: 'folder-devis' },

    // === Relances ===
    { id: 'file-014', name: 'Relance 1 - SETRAG Dec 2025', type: 'document', extension: 'docx', size: '85 KB', status: 'approved', author: 'Comptabilité', createdAt: '2025-12-15', modifiedAt: '2025-12-15', folderId: 'folder-relances' },

    // === RH - Ornella ===
    { id: 'file-015', name: 'Contrat CDI - Ornella DOUMBA', type: 'pdf', extension: 'pdf', size: '1.2 MB', status: 'approved', author: 'Direction', createdAt: '2023-01-10', modifiedAt: '2023-01-15', folderId: 'folder-personnel-ornella' },
    { id: 'file-016', name: 'Fiche de poste - Sous-Admin', type: 'document', extension: 'docx', size: '350 KB', status: 'approved', author: 'RH', createdAt: '2023-01-10', modifiedAt: '2024-06-01', folderId: 'folder-personnel-ornella' },

    // === RH - Marc ===
    { id: 'file-017', name: 'Contrat CDI - Marc NGUEMA', type: 'pdf', extension: 'pdf', size: '1.1 MB', status: 'approved', author: 'Direction', createdAt: '2024-03-15', modifiedAt: '2024-03-20', folderId: 'folder-personnel-marc' },

    // === Juridique - CGV ===
    { id: 'file-018', name: 'CGV Digitalium v3.2', type: 'pdf', extension: 'pdf', size: '890 KB', status: 'approved', author: 'Cabinet Juridique', createdAt: '2026-01-10', modifiedAt: '2026-01-15', folderId: 'folder-cgv', starred: true },
    { id: 'file-019', name: 'Politique de Confidentialité', type: 'pdf', extension: 'pdf', size: '650 KB', status: 'approved', author: 'Cabinet Juridique', createdAt: '2025-12-01', modifiedAt: '2026-01-10', folderId: 'folder-cgv' },

    // === Juridique - NDA ===
    { id: 'file-020', name: 'NDA Template Standard', type: 'document', extension: 'docx', size: '250 KB', status: 'approved', author: 'Ornella DOUMBA', createdAt: '2024-06-01', modifiedAt: '2026-01-05', folderId: 'folder-nda' },
    { id: 'file-021', name: 'NDA Signé - TechAfrica', type: 'pdf', extension: 'pdf', size: '1.5 MB', status: 'approved', author: 'Direction', createdAt: '2025-11-20', modifiedAt: '2025-11-25', folderId: 'folder-nda' },

    // === Technique ===
    { id: 'file-022', name: 'Architecture Cloud - Vue d\'ensemble', type: 'document', extension: 'docx', size: '5.2 MB', status: 'approved', author: 'Équipe DevOps', createdAt: '2025-06-01', modifiedAt: '2026-01-28', folderId: 'folder-architecture', starred: true },
    { id: 'file-023', name: 'Diagramme Infrastructure GCP', type: 'image', extension: 'png', size: '2.8 MB', status: 'approved', author: 'Équipe DevOps', createdAt: '2025-08-15', modifiedAt: '2025-12-10', folderId: 'folder-architecture' },
    { id: 'file-024', name: 'Guide Déploiement Cloud Run', type: 'document', extension: 'md', size: '450 KB', status: 'approved', author: 'Équipe DevOps', createdAt: '2025-09-01', modifiedAt: '2026-01-18', folderId: 'folder-deploiements' },

    // === Marketing ===
    { id: 'file-025', name: 'Présentation Corporate 2026', type: 'presentation', extension: 'pptx', size: '15.6 MB', status: 'approved', author: 'Marketing', createdAt: '2026-01-15', modifiedAt: '2026-01-29', folderId: 'folder-presentations', starred: true },
    { id: 'file-026', name: 'Demo iDocument - Gouvernement', type: 'presentation', extension: 'pptx', size: '22.3 MB', status: 'approved', author: 'Marc NGUEMA', createdAt: '2025-10-01', modifiedAt: '2026-01-20', folderId: 'folder-presentations' },
    { id: 'file-027', name: 'Fiche Produit - iArchive', type: 'pdf', extension: 'pdf', size: '3.2 MB', status: 'approved', author: 'Marketing', createdAt: '2025-11-01', modifiedAt: '2026-01-15', folderId: 'folder-brochures' },

    // === Projets - IDN.ga ===
    { id: 'file-028', name: 'Spécifications Fonctionnelles v4', type: 'document', extension: 'docx', size: '8.5 MB', status: 'approved', author: 'Direction', createdAt: '2024-08-01', modifiedAt: '2026-01-31', folderId: 'folder-projet-idn', starred: true },
    { id: 'file-029', name: 'Planning Livraisons Q1 2026', type: 'spreadsheet', extension: 'xlsx', size: '1.2 MB', status: 'approved', author: 'Chef de Projet', createdAt: '2025-12-15', modifiedAt: '2026-01-20', folderId: 'folder-projet-idn' },

    // === Projets - Présidence.ga ===
    { id: 'file-030', name: 'Maquettes UI Validées', type: 'image', extension: 'figma', size: '45 MB', status: 'approved', author: 'UX Designer', createdAt: '2025-06-01', modifiedAt: '2025-12-15', folderId: 'folder-projet-presidence' },

    // === Projets - iÉtude.ga ===
    { id: 'file-031', name: 'Cahier des charges iÉtude', type: 'document', extension: 'docx', size: '6.8 MB', status: 'review', author: 'Direction', createdAt: '2025-09-15', modifiedAt: '2026-01-30', folderId: 'folder-projet-ietude' },
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
    // === FISCAL ===
    { id: 'arch-folder-fiscal-root', name: 'Archives Fiscales', color: 'emerald', parentId: null, category: 'fiscal', retentionYears: 10, path: '/', createdAt: '2024-01-01', modifiedAt: '2026-01-31' },
    { id: 'arch-folder-fiscal-2025', name: 'Exercice 2025', color: 'emerald', parentId: 'arch-folder-fiscal-root', category: 'fiscal', retentionYears: 10, path: '/Exercice 2025', createdAt: '2025-01-01', modifiedAt: '2026-01-20' },
    { id: 'arch-folder-fiscal-2024', name: 'Exercice 2024', color: 'emerald', parentId: 'arch-folder-fiscal-root', category: 'fiscal', retentionYears: 10, path: '/Exercice 2024', createdAt: '2024-01-01', modifiedAt: '2025-01-15' },
    { id: 'arch-folder-fiscal-tva', name: 'Déclarations TVA', color: 'blue', parentId: 'arch-folder-fiscal-2025', category: 'fiscal', retentionYears: 6, path: '/Exercice 2025/Déclarations TVA', createdAt: '2025-01-01', modifiedAt: '2026-01-10' },
    { id: 'arch-folder-fiscal-bilans', name: 'Bilans & Comptes', color: 'blue', parentId: 'arch-folder-fiscal-2025', category: 'fiscal', retentionYears: 10, path: '/Exercice 2025/Bilans & Comptes', createdAt: '2025-12-01', modifiedAt: '2026-01-20' },

    // === SOCIAL ===
    { id: 'arch-folder-social-root', name: 'Archives Sociales', color: 'blue', parentId: null, category: 'social', retentionYears: 5, path: '/', createdAt: '2024-01-01', modifiedAt: '2026-01-31' },
    { id: 'arch-folder-social-paie', name: 'Bulletins de Paie', color: 'blue', parentId: 'arch-folder-social-root', category: 'social', retentionYears: 5, path: '/Bulletins de Paie', createdAt: '2024-01-01', modifiedAt: '2026-01-05' },
    { id: 'arch-folder-social-paie-2025', name: '2025', parentId: 'arch-folder-social-paie', category: 'social', retentionYears: 5, path: '/Bulletins de Paie/2025', createdAt: '2025-01-01', modifiedAt: '2025-12-31' },
    { id: 'arch-folder-social-paie-2026', name: '2026', parentId: 'arch-folder-social-paie', category: 'social', retentionYears: 5, path: '/Bulletins de Paie/2026', createdAt: '2026-01-01', modifiedAt: '2026-01-05' },
    { id: 'arch-folder-social-contrats', name: 'Contrats de Travail', color: 'purple', parentId: 'arch-folder-social-root', category: 'social', retentionYears: 50, path: '/Contrats de Travail', createdAt: '2024-01-01', modifiedAt: '2024-03-15' },
    { id: 'arch-folder-social-dsn', name: 'DSN & Déclarations', color: 'orange', parentId: 'arch-folder-social-root', category: 'social', retentionYears: 5, path: '/DSN & Déclarations', createdAt: '2024-01-01', modifiedAt: '2026-01-12' },

    // === LEGAL ===
    { id: 'arch-folder-legal-root', name: 'Archives Juridiques', color: 'purple', parentId: null, category: 'legal', retentionYears: 30, path: '/', createdAt: '2020-01-01', modifiedAt: '2026-01-31' },
    { id: 'arch-folder-legal-statuts', name: 'Statuts & Actes', color: 'purple', parentId: 'arch-folder-legal-root', category: 'legal', retentionYears: 99, path: '/Statuts & Actes', createdAt: '2020-01-01', modifiedAt: '2020-01-01' },
    { id: 'arch-folder-legal-ag', name: 'Assemblées Générales', color: 'purple', parentId: 'arch-folder-legal-root', category: 'legal', retentionYears: 10, path: '/Assemblées Générales', createdAt: '2020-01-01', modifiedAt: '2025-06-30' },

    // === CLIENTS ===
    { id: 'arch-folder-clients-root', name: 'Archives Clients', color: 'orange', parentId: null, category: 'clients', retentionYears: 10, path: '/', createdAt: '2024-01-01', modifiedAt: '2026-01-31' },
    { id: 'arch-folder-clients-gouv', name: 'Gouvernement & Ministères', color: 'emerald', parentId: 'arch-folder-clients-root', category: 'clients', retentionYears: 10, path: '/Gouvernement & Ministères', createdAt: '2024-01-01', modifiedAt: '2025-09-15' },
    { id: 'arch-folder-clients-mairies', name: 'Mairies & Collectivités', color: 'purple', parentId: 'arch-folder-clients-root', category: 'clients', retentionYears: 10, path: '/Mairies & Collectivités', createdAt: '2024-01-01', modifiedAt: '2025-11-20' },

    // === VAULT ===
    { id: 'arch-folder-vault-root', name: 'Coffre-fort', color: 'red', parentId: null, category: 'vault', retentionYears: 99, path: '/', createdAt: '2024-01-01', modifiedAt: '2026-01-31' },
    { id: 'arch-folder-vault-secrets', name: 'Secrets & Clés', color: 'red', parentId: 'arch-folder-vault-root', category: 'vault', retentionYears: 99, path: '/Secrets & Clés', createdAt: '2025-01-01', modifiedAt: '2025-01-01' },

    // === CERTIFICATES ===
    { id: 'arch-folder-certs-root', name: 'Certificats', color: 'amber', parentId: null, category: 'certificates', retentionYears: 99, path: '/', createdAt: '2024-01-01', modifiedAt: '2026-01-31' },
    { id: 'arch-folder-certs-ssl', name: 'Certificats SSL', color: 'amber', parentId: 'arch-folder-certs-root', category: 'certificates', retentionYears: 2, path: '/Certificats SSL', createdAt: '2024-01-01', modifiedAt: '2025-12-01' },
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
    // Fiscal
    {
        id: 'arch-001',
        title: 'Liasse Fiscale 2025',
        category: 'fiscal',
        retentionYears: 10,
        archivedDate: '2026-01-15',
        expirationDate: '2036-01-15',
        size: '2.4 MB',
        certified: true,
        hash: 'SHA256:a1b2c3...',
        folderId: 'arch-folder-fiscal-2025',
    },
    {
        id: 'arch-002',
        title: 'Déclaration TVA Q4 2025',
        category: 'fiscal',
        retentionYears: 6,
        archivedDate: '2026-01-10',
        expirationDate: '2032-01-10',
        size: '856 KB',
        certified: true,
        folderId: 'arch-folder-fiscal-tva',
    },
    {
        id: 'arch-003',
        title: 'Bilan Comptable 2025',
        category: 'fiscal',
        retentionYears: 10,
        archivedDate: '2026-01-20',
        expirationDate: '2036-01-20',
        size: '1.8 MB',
        certified: true,
        folderId: 'arch-folder-fiscal-bilans',
    },
    // Social
    {
        id: 'arch-004',
        title: 'Bulletins Paie - Décembre 2025',
        category: 'social',
        retentionYears: 5,
        archivedDate: '2026-01-05',
        expirationDate: '2031-01-05',
        size: '3.2 MB',
        certified: true,
        folderId: 'arch-folder-social-paie-2025',
    },
    {
        id: 'arch-005',
        title: 'DSN Annuelle 2025',
        category: 'social',
        retentionYears: 5,
        archivedDate: '2026-01-12',
        expirationDate: '2031-01-12',
        size: '1.1 MB',
        certified: true,
        folderId: 'arch-folder-social-dsn',
    },
    {
        id: 'arch-006',
        title: 'Contrat CDI - Marc NGUEMA',
        category: 'social',
        retentionYears: 50,
        archivedDate: '2024-03-15',
        expirationDate: '2074-03-15',
        size: '456 KB',
        certified: true,
        folderId: 'arch-folder-social-contrats',
    },
    // Juridique
    {
        id: 'arch-007',
        title: 'Statuts Digitalium SAS',
        category: 'legal',
        retentionYears: 99,
        archivedDate: '2020-01-01',
        expirationDate: '2119-01-01',
        size: '1.2 MB',
        certified: true,
        folderId: 'arch-folder-legal-statuts',
    },
    {
        id: 'arch-008',
        title: 'PV AG 2025',
        category: 'legal',
        retentionYears: 10,
        archivedDate: '2025-06-30',
        expirationDate: '2035-06-30',
        size: '890 KB',
        certified: true,
        folderId: 'arch-folder-legal-ag',
    },
    // Clients
    {
        id: 'arch-009',
        title: 'Contrat signé - MinistèreFinances',
        category: 'clients',
        retentionYears: 10,
        archivedDate: '2025-09-15',
        expirationDate: '2035-09-15',
        size: '2.1 MB',
        certified: true,
        folderId: 'arch-folder-clients-gouv',
    },
    {
        id: 'arch-010',
        title: 'Contrat signé - Mairie Port-Gentil',
        category: 'clients',
        retentionYears: 10,
        archivedDate: '2025-11-20',
        expirationDate: '2035-11-20',
        size: '1.8 MB',
        certified: true,
        folderId: 'arch-folder-clients-mairies',
    },
    // Coffre-fort
    {
        id: 'arch-011',
        title: 'Secrets API Production',
        category: 'vault',
        retentionYears: 99,
        archivedDate: '2025-01-01',
        expirationDate: '2124-01-01',
        size: '12 KB',
        certified: true,
        folderId: 'arch-folder-vault-secrets',
    },
    // Certificats
    {
        id: 'arch-012',
        title: 'Certificat SSL Digitalium.ga',
        category: 'certificates',
        retentionYears: 2,
        archivedDate: '2025-12-01',
        expirationDate: '2027-12-01',
        size: '8 KB',
        certified: true,
        folderId: 'arch-folder-certs-ssl',
    },
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
    // À signer
    {
        id: 'sig-001',
        title: 'Contrat SaaS - Présidence.ga',
        type: 'contract',
        status: 'pending',
        signers: [
            { name: 'Ornella DOUMBA', status: 'signed', signedAt: '2026-01-28' },
            { name: 'Direction Présidence', status: 'pending' },
        ],
        createdAt: '2026-01-25',
        deadline: '2026-02-10',
    },
    {
        id: 'sig-002',
        title: 'NDA - Partenaire TechAfrica',
        type: 'nda',
        status: 'pending',
        signers: [
            { name: 'Marc NGUEMA', status: 'pending' },
            { name: 'CEO TechAfrica', status: 'pending' },
        ],
        createdAt: '2026-01-29',
        deadline: '2026-02-15',
    },
    {
        id: 'sig-003',
        title: 'Avenant Contrat - MinistèreFinances',
        type: 'amendment',
        status: 'pending',
        signers: [
            { name: 'Ornella DOUMBA', status: 'pending' },
            { name: 'DG MinFin', status: 'pending' },
        ],
        createdAt: '2026-01-30',
        deadline: '2026-02-05',
    },
    // Signés
    {
        id: 'sig-004',
        title: 'Contrat CDI - Sophie MBOU',
        type: 'hr',
        status: 'signed',
        signers: [
            { name: 'RH Digitalium', status: 'signed', signedAt: '2026-01-15' },
            { name: 'Sophie MBOU', status: 'signed', signedAt: '2026-01-16' },
        ],
        createdAt: '2026-01-10',
    },
    {
        id: 'sig-005',
        title: 'Contrat Licence - CNSS',
        type: 'contract',
        status: 'signed',
        signers: [
            { name: 'Ornella DOUMBA', status: 'signed', signedAt: '2026-01-20' },
            { name: 'DG CNSS', status: 'signed', signedAt: '2026-01-22' },
        ],
        createdAt: '2026-01-12',
    },
    {
        id: 'sig-006',
        title: 'Partenariat GabonCom',
        type: 'partner',
        status: 'signed',
        signers: [
            { name: 'Direction Digitalium', status: 'signed', signedAt: '2026-01-08' },
            { name: 'Président GabonCom', status: 'signed', signedAt: '2026-01-10' },
        ],
        createdAt: '2026-01-05',
    },
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
