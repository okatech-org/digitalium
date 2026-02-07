
import { FileText, File as FileIcon, Image, FileSpreadsheet } from "lucide-react";
import { IClasseur, ArchivalStatus, ArchivalStatusConfig, ArchivalTransitionRule, RetentionRuleByStatus, ArchivalAction } from "./types";

export const DOCUMENT_TYPES = {
    contrat: { label: 'Contrat', color: 'bg-blue-500/10 text-blue-600', icon: FileText },
    facture: { label: 'Facture', color: 'bg-green-500/10 text-green-600', icon: FileText },
    devis: { label: 'Devis', color: 'bg-yellow-500/10 text-yellow-600', icon: FileText },
    rapport: { label: 'Rapport', color: 'bg-purple-500/10 text-purple-600', icon: FileText },
    projet: { label: 'Projet', color: 'bg-primary/10 text-primary', icon: FileText },
    other: { label: 'Autre', color: 'bg-gray-500/10 text-gray-600', icon: FileIcon },
};

export const STATUS_CONFIG = {
    brouillon: { label: 'Brouillon', color: 'bg-yellow-500/10 text-yellow-600' },
    en_revision: { label: 'En révision', color: 'bg-blue-500/10 text-blue-600' },
    approuve: { label: 'Approuvé', color: 'bg-green-500/10 text-green-600' },
    archive: { label: 'Archivé', color: 'bg-gray-500/10 text-gray-600' },
};

export const FILE_TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string }> = {
    pdf: { icon: FileText, color: 'text-red-500' },
    doc: { icon: FileText, color: 'text-blue-500' },
    image: { icon: Image, color: 'text-green-500' },
    spreadsheet: { icon: FileSpreadsheet, color: 'text-emerald-500' },
    other: { icon: FileIcon, color: 'text-gray-500' },
};

// ========================================
// ARCHIVAL STATUS CONFIGURATION
// Ref: NF Z42-013 / ISO 14641
// ========================================

export const ARCHIVAL_STATUS_CONFIG: Record<ArchivalStatus, ArchivalStatusConfig> = {
    actif: {
        label: 'Actif',
        color: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
        icon: '🟢',
        description: 'Document en cours d\'utilisation – DUA en vigueur',
        allowedActions: ['edit', 'delete', 'share', 'print', 'view', 'download', 'change_status', 'add_version', 'annotate'],
    },
    semi_actif: {
        label: 'Semi-actif',
        color: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
        icon: '🟡',
        description: 'Conservation administrative résiduelle – Accès restreint',
        allowedActions: ['view', 'download', 'print', 'change_status', 'certified_copy', 'verify_integrity'],
    },
    inactif: {
        label: 'Inactif',
        color: 'bg-slate-500/15 text-slate-700 border-slate-500/30',
        icon: '⚪',
        description: 'Fin de DUA – En attente de décision sur le sort final',
        allowedActions: ['view', 'download', 'change_status', 'verify_integrity', 'certified_copy'],
    },
    archive: {
        label: 'Archivé',
        color: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
        icon: '🔵',
        description: 'Conservation définitive – Valeur patrimoniale/historique',
        allowedActions: ['view', 'download', 'certified_copy', 'verify_integrity'],
    },
    destruction: {
        label: 'En destruction',
        color: 'bg-red-500/15 text-red-700 border-red-500/30',
        icon: '🔴',
        description: 'Marqué pour destruction réglementaire',
        allowedActions: ['view', 'verify_integrity', 'destroy'],
    },
};

/**
 * Règles d'affaires pour les transitions de statut archivistique
 * Définit les transitions autorisées et leurs conditions
 */
export const ARCHIVAL_TRANSITION_RULES: ArchivalTransitionRule[] = [
    // Actif → Semi-actif : fin de la période active
    {
        from: 'actif',
        to: 'semi_actif',
        requiresApproval: false,
        autoTrigger: { condition: 'date_reached', delayDays: 0 },
        businessRule: 'Transition automatique après expiration de la période active (DUA). Le document reste accessible en lecture.',
    },
    // Semi-actif → Inactif : fin de la conservation administrative
    {
        from: 'semi_actif',
        to: 'inactif',
        requiresApproval: false,
        autoTrigger: { condition: 'retention_expired' },
        businessRule: 'Transition automatique après expiration du délai de conservation semi-active.',
    },
    // Inactif → Archive : conservation définitive
    {
        from: 'inactif',
        to: 'archive',
        requiresApproval: true,
        approverRole: 'archiviste',
        autoTrigger: { condition: 'manual' },
        businessRule: 'Décision du sort final : conservation permanente. Requiert validation d\'un archiviste habilité.',
    },
    // Inactif → Destruction : élimination réglementaire
    {
        from: 'inactif',
        to: 'destruction',
        requiresApproval: true,
        approverRole: 'archiviste',
        autoTrigger: { condition: 'manual' },
        businessRule: 'Décision du sort final : destruction. Requiert visa de l\'archiviste et certificat de destruction (NF Z42-013 §8.4).',
    },
    // Actif → Archive (fast-track pour documents patrimoniaux)
    {
        from: 'actif',
        to: 'archive',
        requiresApproval: true,
        approverRole: 'directeur',
        autoTrigger: { condition: 'manual' },
        businessRule: 'Archivage anticipé d\'un document de valeur patrimoniale. Requiert validation du directeur.',
    },
    // Semi-actif → Actif (réactivation exceptionnelle)
    {
        from: 'semi_actif',
        to: 'actif',
        requiresApproval: true,
        approverRole: 'responsable',
        autoTrigger: { condition: 'manual' },
        businessRule: 'Réactivation exceptionnelle d\'un document semi-actif. Justification requise.',
    },
];

/**
 * Délais de conservation par statut archivistique et type de document
 * Les durées varient selon le type de document ET le statut
 */
export const RETENTION_RULES_BY_STATUS: Record<string, RetentionRuleByStatus[]> = {
    contrat: [
        { archivalStatus: 'actif', retentionYears: 5, description: 'Durée de validité du contrat + 2 ans', legalBasis: 'Art. L110-4 Code de commerce', autoTransitionTo: 'semi_actif' },
        { archivalStatus: 'semi_actif', retentionYears: 5, description: 'Conservation pour litiges éventuels', legalBasis: 'Prescription civile 5 ans', autoTransitionTo: 'inactif' },
        { archivalStatus: 'inactif', retentionYears: 0, description: 'Attente décision sort final', autoTransitionTo: undefined },
        { archivalStatus: 'archive', retentionYears: 'permanent', description: 'Conservation définitive' },
    ],
    facture: [
        { archivalStatus: 'actif', retentionYears: 2, description: 'Exercice fiscal en cours + 1 an', legalBasis: 'Code Général des Impôts', autoTransitionTo: 'semi_actif' },
        { archivalStatus: 'semi_actif', retentionYears: 8, description: 'Obligation fiscale de 10 ans', legalBasis: 'Art. L102 B LPF – Conservation 10 ans', autoTransitionTo: 'inactif' },
        { archivalStatus: 'inactif', retentionYears: 0, description: 'Attente destruction réglementaire', autoTransitionTo: 'destruction' },
    ],
    devis: [
        { archivalStatus: 'actif', retentionYears: 1, description: 'Durée de validité du devis', autoTransitionTo: 'semi_actif' },
        { archivalStatus: 'semi_actif', retentionYears: 4, description: 'Conservation preuve commerciale', autoTransitionTo: 'inactif' },
        { archivalStatus: 'inactif', retentionYears: 0, description: 'Attente destruction', autoTransitionTo: 'destruction' },
    ],
    rapport: [
        { archivalStatus: 'actif', retentionYears: 3, description: 'Période d\'exploitation active', autoTransitionTo: 'semi_actif' },
        { archivalStatus: 'semi_actif', retentionYears: 7, description: 'Conservation référence documentaire', autoTransitionTo: 'inactif' },
        { archivalStatus: 'inactif', retentionYears: 0, description: 'Évaluation pour conservation permanente' },
        { archivalStatus: 'archive', retentionYears: 'permanent', description: 'Conservation définitive si valeur historique' },
    ],
    projet: [
        { archivalStatus: 'actif', retentionYears: 5, description: 'Durée du projet + 2 ans', autoTransitionTo: 'semi_actif' },
        { archivalStatus: 'semi_actif', retentionYears: 5, description: 'Conservation post-projet', autoTransitionTo: 'inactif' },
        { archivalStatus: 'inactif', retentionYears: 0, description: 'Attente décision sort final' },
        { archivalStatus: 'archive', retentionYears: 'permanent', description: 'Conservation si projet stratégique' },
    ],
    other: [
        { archivalStatus: 'actif', retentionYears: 3, description: 'Conservation par défaut', autoTransitionTo: 'semi_actif' },
        { archivalStatus: 'semi_actif', retentionYears: 5, description: 'Conservation résiduelle', autoTransitionTo: 'inactif' },
        { archivalStatus: 'inactif', retentionYears: 0, description: 'Attente sort final', autoTransitionTo: 'destruction' },
    ],
};

/**
 * Vérifie si une action est autorisée pour un statut archivistique donné
 */
export function isActionAllowed(archivalStatus: ArchivalStatus, action: ArchivalAction): boolean {
    return ARCHIVAL_STATUS_CONFIG[archivalStatus].allowedActions.includes(action);
}

/**
 * Retourne les transitions possibles depuis un statut donné
 */
export function getAvailableTransitions(fromStatus: ArchivalStatus): ArchivalTransitionRule[] {
    return ARCHIVAL_TRANSITION_RULES.filter(rule => rule.from === fromStatus);
}

/**
 * Calcule la date de fin de rétention pour un fichier
 */
export function calculateRetentionEndDate(
    documentType: string,
    archivalStatus: ArchivalStatus,
    createdAt: string
): string | null {
    const rules = RETENTION_RULES_BY_STATUS[documentType] || RETENTION_RULES_BY_STATUS['other'];
    const rule = rules.find(r => r.archivalStatus === archivalStatus);
    if (!rule || rule.retentionYears === 'permanent') return null;

    const date = new Date(createdAt);
    date.setFullYear(date.getFullYear() + rule.retentionYears);
    return date.toISOString();
}

// ========================================
// MOCK DATA: REMOVED - Data now comes from database
// ========================================

export const MOCK_CLASSEURS: IClasseur[] = [];

// ========================================
// MOCK DATA: MINISTÈRE - REMOVED
// Data now comes from database
// ========================================

export const MOCK_CLASSEURS_MINISTERE_PECHE: IClasseur[] = [];

// CLASSEUR TEMPLATES for creation modal

export const CLASSEUR_TEMPLATES = [
    { icon: '📚', color: 'bg-blue-500', name: 'Gestion Annuelle', description: 'Documents de gestion par année' },
    { icon: '🚀', color: 'bg-purple-500', name: 'Projet', description: 'Documentation projet' },
    { icon: '👥', color: 'bg-orange-500', name: 'Ressources Humaines', description: 'Documents RH' },
    { icon: '💰', color: 'bg-green-500', name: 'Comptabilité', description: 'Documents financiers' },
    { icon: '📦', color: 'bg-gray-500', name: 'Archives', description: 'Documents archivés' },
];

// DOSSIER TEMPLATES for creation modal
export const DOSSIER_TEMPLATES = [
    { icon: '📝', color: 'bg-blue-400', name: 'Contrats', description: 'Contrats et accords' },
    { icon: '🧾', color: 'bg-green-400', name: 'Factures', description: 'Factures et paiements' },
    { icon: '💰', color: 'bg-yellow-400', name: 'Devis', description: 'Propositions commerciales' },
    { icon: '📊', color: 'bg-purple-400', name: 'Rapports', description: 'Analyses et rapports' },
    { icon: '📋', color: 'bg-orange-400', name: 'Procédures', description: 'Procédures internes' },
];

export const CLASSEUR_COLORS = [
    { value: 'bg-blue-500', label: 'Bleu' },
    { value: 'bg-green-500', label: 'Vert' },
    { value: 'bg-purple-500', label: 'Violet' },
    { value: 'bg-orange-500', label: 'Orange' },
    { value: 'bg-red-500', label: 'Rouge' },
    { value: 'bg-pink-500', label: 'Rose' },
    { value: 'bg-yellow-500', label: 'Jaune' },
    { value: 'bg-gray-500', label: 'Gris' },
];

export const CLASSEUR_ICONS = ['📚', '📒', '📔', '📕', '📗', '📘', '📙', '🗂️', '📁', '🚀', '💼', '🏢'];
export const DOSSIER_ICONS = ['📁', '📂', '📄', '🧾', '💰', '📊', '📝', '🗂️', '📋', '📑', '👥', '💼'];

// ========================================
// PDF CONVERSION CONFIG FOR ARCHIVAL
// ========================================

/**
 * Configuration for automatic PDF/A conversion during archival
 * Ref: NF Z42-013 §7.2 - Les documents archivés doivent être au format PDF/A
 */
export interface PdfConversionConfig {
    /** Enable automatic conversion to PDF/A on archival */
    enabled: boolean;
    /** Target PDF/A format */
    targetFormat: 'PDF/A-1b' | 'PDF/A-2b' | 'PDF/A-3b';
    /** File types that should be converted */
    convertibleTypes: string[];
    /** Max file size for conversion in bytes (default: 100MB) */
    maxFileSizeBytes: number;
    /** Keep original file alongside converted version */
    keepOriginal: boolean;
}

export const DEFAULT_PDF_CONVERSION_CONFIG: PdfConversionConfig = {
    enabled: true,
    targetFormat: 'PDF/A-2b',
    convertibleTypes: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'jpg', 'jpeg', 'png', 'tiff', 'bmp'],
    maxFileSizeBytes: 100 * 1024 * 1024, // 100MB
    keepOriginal: true,
};

/**
 * Mime types that need PDF/A conversion for archival compliance
 */
export const NON_ARCHIVE_COMPLIANT_TYPES = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/bmp',
];

/**
 * Check if a file attachment needs PDF conversion for archival
 */
export function needsPdfConversion(attachment: { name: string; type: string }): boolean {
    const ext = attachment.name.split('.').pop()?.toLowerCase() || '';
    return DEFAULT_PDF_CONVERSION_CONFIG.convertibleTypes.includes(ext) || attachment.type !== 'pdf';
}

/**
 * Simulates PDF/A conversion (in production, would call a backend service)
 * Returns the converted attachment metadata
 */
export function simulatePdfConversion(attachment: { id: string; name: string; type: string; size: string }): {
    id: string;
    name: string;
    type: 'pdf';
    size: string;
    pdfACompliant: boolean;
    convertedFrom: string;
} {
    const baseName = attachment.name.replace(/\.[^.]+$/, '');
    return {
        id: `${attachment.id}-pdfa`,
        name: `${baseName}.pdf`,
        type: 'pdf',
        size: attachment.size,
        pdfACompliant: true,
        convertedFrom: attachment.name,
    };
}
