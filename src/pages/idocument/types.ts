
import { LucideIcon } from "lucide-react";

// ========================================
// ARCHIVAL STATUS & LIFECYCLE
// ========================================

/**
 * Statut archivistique - Cycle de vie du document
 * Basé sur les normes NF Z42-013 / ISO 14641
 * 
 * actif       → Document en cours d'utilisation (DUA - Durée d'Utilité Administrative)
 * semi_actif  → Document moins consulté, conservé pour valeur administrative résiduelle
 * inactif     → Fin de la DUA, en attente de sort final
 * archive     → Conservation définitive (valeur patrimoniale/historique)
 * destruction → Marqué pour destruction après validation du sort final
 */
export type ArchivalStatus = 'actif' | 'semi_actif' | 'inactif' | 'archive' | 'destruction';

/**
 * Configuration du statut archivistique
 */
export interface ArchivalStatusConfig {
    label: string;
    color: string;
    icon: string;
    description: string;
    allowedActions: ArchivalAction[];
}

/**
 * Actions autorisées selon le statut archivistique
 */
export type ArchivalAction =
    | 'edit' | 'delete' | 'share' | 'print'
    | 'view' | 'download' | 'certified_copy'
    | 'verify_integrity' | 'transfer' | 'destroy'
    | 'change_status' | 'add_version' | 'annotate';

/**
 * Règles d'affaires pour les transitions de statut archivistique
 */
export interface ArchivalTransitionRule {
    from: ArchivalStatus;
    to: ArchivalStatus;
    requiresApproval: boolean;
    approverRole?: string;
    autoTrigger?: {
        condition: 'retention_expired' | 'manual' | 'date_reached';
        delayDays?: number;
    };
    businessRule: string;
}

/**
 * Politique de rétention liée au statut archivistique
 */
export interface RetentionRuleByStatus {
    archivalStatus: ArchivalStatus;
    retentionYears: number | 'permanent';
    description: string;
    legalBasis?: string;
    autoTransitionTo?: ArchivalStatus;
}

// ========================================
// DOCUMENT VERSION MANAGEMENT
// ========================================

/**
 * Version d'un document - Traçabilité complète
 */
export interface IDocumentVersion {
    id: string;
    versionNumber: number;
    label: string;              // ex: "v1.0", "v2.1-draft"
    author: string;
    changeDescription: string;
    changeType: 'major' | 'minor' | 'patch';
    attachments: IAttachment[];  // Snapshot des pièces jointes à cette version
    hash_sha256?: string;        // Empreinte numérique pour intégrité
    size?: string;
    created_at: string;
    isLocked: boolean;           // Version verrouillée (= non modifiable)
    isCurrent: boolean;          // Version courante
}

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
    // Classement obligatoire - rattachement à l'arborescence
    classeurId: string;
    dossierId: string;
    // Archival lifecycle
    archivalStatus: ArchivalStatus;
    archivalStatusChangedAt?: string;
    archivalStatusChangedBy?: string;
    retentionEndDate?: string;        // Date de fin de conservation
    finalDisposition?: 'conservation' | 'destruction' | 'tri'; // Sort final
    // Version management
    versions: IDocumentVersion[];
    currentVersionNumber: number;
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
    // Classement obligatoire - rattachement au classeur parent
    classeurId: string;
    // Archival status for the folder
    archivalStatus?: ArchivalStatus;
    retentionYears?: number;
    retentionPolicy?: string; // Reference to retention policy
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
// PERMISSION GROUP TYPES
// ========================================

export interface IPermissionGroup {
    id: string;
    name: string;
    description?: string;
    color?: string;
    permissions: GroupPermission[];
    memberIds: string[];
    created_at: string;
    updated_at?: string;
}

export type GroupPermission =
    | 'read' | 'write' | 'delete' | 'share'
    | 'manage_members' | 'manage_archive'
    | 'approve' | 'admin';

// Location info for tree select
export interface TreeLocation {
    classeurId: string;
    dossierId?: string;
    classeurName?: string;
    dossierName?: string;
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
