/**
 * Organization Workflow Presets
 * Predefined workflows for iArchive, iDocument, and iSignature
 * Mapped to Gabonese organization types (TemplateId)
 */

import { DEFAULT_ARCHIVE_CONFIG, type ArchiveConfig, type OrganizationUnit, type UnitWorkflow } from '@/types/organization';
import type { TemplateId, OrganizationCategory } from '@/stores/publicPageEditorStore';
import type { WorkflowTemplate, WorkflowStepConfig } from './workflowTemplatesData';

// =============================================================================
// TYPES
// =============================================================================

export interface OrganizationWorkflowPreset {
    templateId: TemplateId;
    category: OrganizationCategory;

    // iDocument: Structure organisationnelle
    units: Omit<OrganizationUnit, 'id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at'>[];

    // iArchive: Workflows d'archivage
    archiveWorkflows: WorkflowTemplate[];

    // iSignature: Circuits de signature
    signatureWorkflows: WorkflowTemplate[];

    // Configuration par défaut
    defaultArchiveConfig: ArchiveConfig;

    // Métadonnées
    legalBasis?: string;
    retentionYears: number | 'permanent';
    requiresDoubleSignature: boolean;
}

// =============================================================================
// REUSABLE WORKFLOW STEPS
// =============================================================================

const STEP_NOTIFY_MANAGER: WorkflowStepConfig = {
    id: 'step-notify-manager',
    order: 1,
    type: 'notify',
    name: 'Notification Responsable',
    description: 'Informer le responsable hiérarchique',
    config: { notify_roles: ['manager'], notify_message: 'Document en attente de traitement' }
};

const STEP_SIMPLE_APPROVAL: WorkflowStepConfig = {
    id: 'step-simple-approval',
    order: 2,
    type: 'approve',
    name: 'Approbation Simple',
    description: 'Validation par un responsable',
    config: { approval_type: 'any', timeout_days: 7 }
};

const STEP_DOUBLE_APPROVAL: WorkflowStepConfig = {
    id: 'step-double-approval',
    order: 2,
    type: 'approve',
    name: 'Double Approbation',
    description: 'Validation par tous les approbateurs',
    config: { approval_type: 'all', timeout_days: 14 }
};

const STEP_HIERARCHICAL_APPROVAL: WorkflowStepConfig = {
    id: 'step-hierarchical',
    order: 2,
    type: 'approve',
    name: 'Approbation Hiérarchique',
    description: 'Validation en cascade (N+1, N+2)',
    config: { approval_type: 'all', timeout_days: 10 }
};

const STEP_TAG_ARCHIVED: WorkflowStepConfig = {
    id: 'step-tag-archive',
    order: 3,
    type: 'tag',
    name: 'Marquage Archivé',
    config: { tags: ['archivé', 'validé'] }
};

const STEP_TAG_LEGAL: WorkflowStepConfig = {
    id: 'step-tag-legal',
    order: 3,
    type: 'tag',
    name: 'Marquage Légal',
    config: { tags: ['légal', 'certifié', 'conforme'] }
};

const STEP_TAG_MEDICAL: WorkflowStepConfig = {
    id: 'step-tag-medical',
    order: 3,
    type: 'tag',
    name: 'Marquage Médical',
    config: { tags: ['médical', 'confidentiel', 'patient'] }
};

const createArchiveStep = (years: number | 'permanent', legalBasis?: string): WorkflowStepConfig => ({
    id: 'step-archive',
    order: 4,
    type: 'archive',
    name: 'Archivage',
    description: `Conservation ${years === 'permanent' ? 'permanente' : `${years} ans`}`,
    config: {
        retention_years: typeof years === 'number' ? years : 100,
        add_metadata: legalBasis ? { legal_basis: legalBasis } : undefined
    }
});

// =============================================================================
// WORKFLOW TEMPLATES BY SECTOR
// =============================================================================

// --- ARCHIVAGE STANDARD (PME, Commerce) ---
const WF_ARCHIVE_STANDARD: WorkflowTemplate = {
    id: 'wf-org-standard',
    name: 'Archivage Standard',
    description: 'Archivage courant avec approbation simple',
    trigger: 'manual',
    category: 'archivage',
    is_active: true,
    is_system: true,
    created_by: 'system',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [STEP_NOTIFY_MANAGER, STEP_SIMPLE_APPROVAL, STEP_TAG_ARCHIVED, createArchiveStep(10)]
};

// --- ARCHIVAGE LÉGAL (Notaire, Avocat, Tribunal) ---
const WF_ARCHIVE_LEGAL: WorkflowTemplate = {
    id: 'wf-org-legal',
    name: 'Archivage Légal',
    description: 'Documents juridiques avec conservation permanente',
    trigger: 'upload',
    category: 'archivage',
    is_active: true,
    is_system: true,
    created_by: 'system',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [
        { ...STEP_NOTIFY_MANAGER, config: { notify_roles: ['legal', 'daj'] } },
        STEP_DOUBLE_APPROVAL,
        STEP_TAG_LEGAL,
        createArchiveStep('permanent', 'Code Civil Gabonais - Actes Authentiques')
    ]
};

// --- ARCHIVAGE MÉDICAL (Pharmacie, Clinique, Hôpital) ---
const WF_ARCHIVE_MEDICAL: WorkflowTemplate = {
    id: 'wf-org-medical',
    name: 'Archivage Médical',
    description: 'Dossiers patients avec confidentialité renforcée',
    trigger: 'manual',
    category: 'archivage',
    is_active: true,
    is_system: true,
    created_by: 'system',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [
        { ...STEP_NOTIFY_MANAGER, config: { notify_roles: ['medical', 'direction'] } },
        STEP_SIMPLE_APPROVAL,
        STEP_TAG_MEDICAL,
        createArchiveStep(30, 'Loi sur la Santé Publique - Dossiers Médicaux')
    ]
};

// --- ARCHIVAGE FISCAL (Comptable, DAF) ---
const WF_ARCHIVE_FISCAL: WorkflowTemplate = {
    id: 'wf-org-fiscal',
    name: 'Archivage Fiscal',
    description: 'Documents comptables et fiscaux',
    trigger: 'schedule',
    category: 'archivage',
    is_active: true,
    is_system: true,
    created_by: 'system',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [
        { ...STEP_NOTIFY_MANAGER, config: { notify_roles: ['finance', 'daf'] } },
        STEP_SIMPLE_APPROVAL,
        { ...STEP_TAG_ARCHIVED, config: { tags: ['fiscal', 'comptabilité', 'déclaration'] } },
        createArchiveStep(10, 'Code Général des Impôts du Gabon')
    ]
};

// --- ARCHIVAGE ADMINISTRATIF (Ministère, Direction) ---
const WF_ARCHIVE_ADMIN: WorkflowTemplate = {
    id: 'wf-org-admin',
    name: 'Archivage Administratif',
    description: 'Documents officiels des administrations',
    trigger: 'manual',
    category: 'archivage',
    is_active: true,
    is_system: true,
    created_by: 'system',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [
        { ...STEP_NOTIFY_MANAGER, config: { notify_roles: ['cabinet', 'sg'] } },
        STEP_HIERARCHICAL_APPROVAL,
        { ...STEP_TAG_ARCHIVED, config: { tags: ['officiel', 'administratif', 'souverain'] } },
        createArchiveStep('permanent', 'Loi sur les Archives Nationales du Gabon')
    ]
};

// --- ARCHIVAGE JUDICIAIRE (Tribunal, Parquet) ---
const WF_ARCHIVE_JUDICIAL: WorkflowTemplate = {
    id: 'wf-org-judicial',
    name: 'Archivage Judiciaire',
    description: 'Jugements et actes de procédure',
    trigger: 'upload',
    category: 'archivage',
    is_active: true,
    is_system: true,
    created_by: 'system',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [
        { ...STEP_NOTIFY_MANAGER, config: { notify_roles: ['greffe', 'magistrat'] } },
        STEP_DOUBLE_APPROVAL,
        { ...STEP_TAG_LEGAL, config: { tags: ['judiciaire', 'jugement', 'exécutoire'] } },
        createArchiveStep('permanent', 'Code de Procédure Civile et Pénale')
    ]
};

// --- ARCHIVAGE SÉCURISÉ (Police, Armée, Douanes) ---
const WF_ARCHIVE_SECURITY: WorkflowTemplate = {
    id: 'wf-org-security',
    name: 'Archivage Sécurisé',
    description: 'Documents classifiés avec accès restreint',
    trigger: 'manual',
    category: 'archivage',
    is_active: true,
    is_system: true,
    created_by: 'system',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [
        { ...STEP_NOTIFY_MANAGER, config: { notify_roles: ['commandement', 'sécurité'] } },
        STEP_DOUBLE_APPROVAL,
        { ...STEP_TAG_ARCHIVED, config: { tags: ['classifié', 'sensible', 'restreint'] } },
        createArchiveStep('permanent', 'Loi sur le Secret Défense')
    ]
};

// =============================================================================
// SIGNATURE WORKFLOW TEMPLATES
// =============================================================================

const WF_SIGNATURE_SIMPLE: WorkflowTemplate = {
    id: 'wf-sig-simple',
    name: 'Signature Simple',
    description: 'Signature électronique standard',
    trigger: 'manual',
    category: 'signature',
    is_active: true,
    is_system: true,
    created_by: 'system',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [
        STEP_NOTIFY_MANAGER,
        { ...STEP_SIMPLE_APPROVAL, name: 'Signature', description: 'Signature électronique' }
    ]
};

const WF_SIGNATURE_LEGAL: WorkflowTemplate = {
    id: 'wf-sig-legal',
    name: 'Signature Légale',
    description: 'Signature avec valeur juridique (notaire, avocat)',
    trigger: 'manual',
    category: 'signature',
    is_active: true,
    is_system: true,
    created_by: 'system',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [
        { ...STEP_NOTIFY_MANAGER, config: { notify_roles: ['legal', 'associé'] } },
        STEP_DOUBLE_APPROVAL,
        { id: 'step-certify', order: 3, type: 'tag', name: 'Certification', config: { tags: ['certifié', 'authentique'] } }
    ]
};

const WF_SIGNATURE_HIERARCHICAL: WorkflowTemplate = {
    id: 'wf-sig-hierarchical',
    name: 'Signature Hiérarchique',
    description: 'Parapheur électronique administratif',
    trigger: 'manual',
    category: 'signature',
    is_active: true,
    is_system: true,
    created_by: 'system',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [
        { ...STEP_NOTIFY_MANAGER, config: { notify_roles: ['cabinet', 'sg', 'ministre'] } },
        STEP_HIERARCHICAL_APPROVAL,
        { id: 'step-validate', order: 3, type: 'tag', name: 'Validation', config: { tags: ['signé', 'officiel'] } }
    ]
};

const WF_SIGNATURE_MEDICAL: WorkflowTemplate = {
    id: 'wf-sig-medical',
    name: 'Signature Médicale',
    description: 'Ordonnances et prescriptions',
    trigger: 'manual',
    category: 'signature',
    is_active: true,
    is_system: true,
    created_by: 'system',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    steps: [
        { ...STEP_NOTIFY_MANAGER, config: { notify_roles: ['praticien', 'pharmacien'] } },
        { ...STEP_SIMPLE_APPROVAL, name: 'Signature Praticien' },
        { id: 'step-prescription', order: 3, type: 'tag', name: 'Prescription', config: { tags: ['prescription', 'médical'] } }
    ]
};

// =============================================================================
// UNIT TEMPLATES BY SECTOR
// =============================================================================

const UNITS_COMMERCE: OrganizationWorkflowPreset['units'] = [
    { parent_id: null, type: 'department', name: 'Direction', code: 'DIR', icon: 'Building2', color: 'purple', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 0 },
    { parent_id: null, type: 'department', name: 'Commercial', code: 'COM', icon: 'Briefcase', color: 'blue', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 }, managers: [], members: [], is_active: true, sort_order: 1 },
    { parent_id: null, type: 'department', name: 'Comptabilité', code: 'CPT', icon: 'Calculator', color: 'emerald', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10, legal_basis: 'Code Général des Impôts' }, managers: [], members: [], is_active: true, sort_order: 2 },
    { parent_id: null, type: 'department', name: 'Logistique', code: 'LOG', icon: 'Truck', color: 'orange', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 5 }, managers: [], members: [], is_active: true, sort_order: 3 },
];

const UNITS_SANTE_PRIVEE: OrganizationWorkflowPreset['units'] = [
    { parent_id: null, type: 'department', name: 'Direction', code: 'DIR', icon: 'Building2', color: 'purple', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 0 },
    { parent_id: null, type: 'department', name: 'Soins / Officine', code: 'SOI', icon: 'Heart', color: 'red', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30, legal_basis: 'Loi Santé Publique' }, managers: [], members: [], is_active: true, sort_order: 1 },
    { parent_id: null, type: 'department', name: 'Pharmacovigilance', code: 'PHA', icon: 'Pill', color: 'green', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 }, managers: [], members: [], is_active: true, sort_order: 2 },
    { parent_id: null, type: 'department', name: 'Administration', code: 'ADM', icon: 'FileText', color: 'blue', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 }, managers: [], members: [], is_active: true, sort_order: 3 },
];

const UNITS_LEGAL: OrganizationWorkflowPreset['units'] = [
    { parent_id: null, type: 'department', name: 'Direction / Associés', code: 'DIR', icon: 'Building2', color: 'purple', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 0 },
    { parent_id: null, type: 'department', name: 'Actes & Minutes', code: 'ACT', icon: 'ScrollText', color: 'amber', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent', legal_basis: 'Loi sur le Notariat' }, managers: [], members: [], is_active: true, sort_order: 1 },
    { parent_id: null, type: 'department', name: 'Dossiers Clients', code: 'CLI', icon: 'FolderOpen', color: 'blue', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 }, managers: [], members: [], is_active: true, sort_order: 2 },
    { parent_id: null, type: 'department', name: 'Comptabilité', code: 'CPT', icon: 'Calculator', color: 'emerald', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 }, managers: [], members: [], is_active: true, sort_order: 3 },
];

const UNITS_MINISTERE: OrganizationWorkflowPreset['units'] = [
    { parent_id: null, type: 'department', name: 'Cabinet', code: 'CAB', icon: 'Building2', color: 'purple', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 0 },
    { parent_id: null, type: 'department', name: 'Secrétariat Général', code: 'SG', icon: 'FileText', color: 'blue', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 1 },
    { parent_id: null, type: 'department', name: 'Direction des Affaires Financières', code: 'DAF', icon: 'Calculator', color: 'emerald', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 }, managers: [], members: [], is_active: true, sort_order: 2 },
    { parent_id: null, type: 'department', name: 'Direction des Ressources Humaines', code: 'DRH', icon: 'Users', color: 'blue', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 50 }, managers: [], members: [], is_active: true, sort_order: 3 },
    { parent_id: null, type: 'department', name: 'Direction des Affaires Juridiques', code: 'DAJ', icon: 'Scale', color: 'red', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 4 },
    { parent_id: null, type: 'department', name: 'Archives', code: 'ARC', icon: 'Archive', color: 'amber', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 5 },
];

const UNITS_TRIBUNAL: OrganizationWorkflowPreset['units'] = [
    { parent_id: null, type: 'department', name: 'Présidence', code: 'PRE', icon: 'Gavel', color: 'purple', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 0 },
    { parent_id: null, type: 'department', name: 'Greffe', code: 'GRE', icon: 'FileText', color: 'blue', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent', legal_basis: 'Code de Procédure' }, managers: [], members: [], is_active: true, sort_order: 1 },
    { parent_id: null, type: 'department', name: 'Chambres', code: 'CHB', icon: 'Scale', color: 'amber', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 2 },
    { parent_id: null, type: 'department', name: 'Secrétariat', code: 'SEC', icon: 'FileText', color: 'gray', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 }, managers: [], members: [], is_active: true, sort_order: 3 },
];

const UNITS_MAIRIE: OrganizationWorkflowPreset['units'] = [
    { parent_id: null, type: 'department', name: 'Cabinet du Maire', code: 'CAB', icon: 'Building2', color: 'purple', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 0 },
    { parent_id: null, type: 'department', name: 'État Civil', code: 'ECV', icon: 'Users', color: 'blue', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent', legal_basis: 'Code Civil - État Civil' }, managers: [], members: [], is_active: true, sort_order: 1 },
    { parent_id: null, type: 'department', name: 'Urbanisme', code: 'URB', icon: 'Building', color: 'orange', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 }, managers: [], members: [], is_active: true, sort_order: 2 },
    { parent_id: null, type: 'department', name: 'Finances', code: 'FIN', icon: 'Calculator', color: 'emerald', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 }, managers: [], members: [], is_active: true, sort_order: 3 },
];

// =============================================================================
// PRESET MAPPING BY TEMPLATE ID
// =============================================================================

export const ORGANIZATION_WORKFLOW_PRESETS: Record<TemplateId, OrganizationWorkflowPreset> = {
    // === COMMERCE ===
    'commerce-fournisseur': {
        templateId: 'commerce-fournisseur',
        category: 'commerce',
        units: UNITS_COMMERCE,
        archiveWorkflows: [WF_ARCHIVE_STANDARD, WF_ARCHIVE_FISCAL],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        retentionYears: 10,
        requiresDoubleSignature: false,
    },
    'commerce-distribution': {
        templateId: 'commerce-distribution',
        category: 'commerce',
        units: UNITS_COMMERCE,
        archiveWorkflows: [WF_ARCHIVE_STANDARD, WF_ARCHIVE_FISCAL],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        retentionYears: 10,
        requiresDoubleSignature: false,
    },
    'commerce-import-export': {
        templateId: 'commerce-import-export',
        category: 'commerce',
        units: [...UNITS_COMMERCE, { parent_id: null, type: 'department', name: 'Douane & Transit', code: 'DOU', icon: 'Ship', color: 'cyan', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 }, managers: [], members: [], is_active: true, sort_order: 4 }],
        archiveWorkflows: [WF_ARCHIVE_STANDARD, WF_ARCHIVE_FISCAL],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        retentionYears: 10,
        requiresDoubleSignature: false,
    },

    // === SANTÉ PRIVÉE ===
    'sante-pharmacie': {
        templateId: 'sante-pharmacie',
        category: 'sante-privee',
        units: UNITS_SANTE_PRIVEE,
        archiveWorkflows: [WF_ARCHIVE_MEDICAL, WF_ARCHIVE_FISCAL],
        signatureWorkflows: [WF_SIGNATURE_MEDICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 },
        legalBasis: 'Loi sur la Santé Publique',
        retentionYears: 30,
        requiresDoubleSignature: false,
    },
    'sante-clinique': {
        templateId: 'sante-clinique',
        category: 'sante-privee',
        units: UNITS_SANTE_PRIVEE,
        archiveWorkflows: [WF_ARCHIVE_MEDICAL, WF_ARCHIVE_FISCAL],
        signatureWorkflows: [WF_SIGNATURE_MEDICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 },
        legalBasis: 'Loi sur la Santé Publique - Dossiers Patients',
        retentionYears: 30,
        requiresDoubleSignature: false,
    },
    'sante-laboratoire': {
        templateId: 'sante-laboratoire',
        category: 'sante-privee',
        units: UNITS_SANTE_PRIVEE,
        archiveWorkflows: [WF_ARCHIVE_MEDICAL],
        signatureWorkflows: [WF_SIGNATURE_MEDICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 },
        retentionYears: 30,
        requiresDoubleSignature: false,
    },

    // === BTP & INDUSTRIE ===
    'btp-construction': {
        templateId: 'btp-construction',
        category: 'btp-industrie',
        units: [...UNITS_COMMERCE, { parent_id: null, type: 'department', name: 'Chantiers', code: 'CHA', icon: 'Hammer', color: 'orange', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 }, managers: [], members: [], is_active: true, sort_order: 4 }],
        archiveWorkflows: [WF_ARCHIVE_STANDARD, WF_ARCHIVE_FISCAL],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        retentionYears: 10,
        requiresDoubleSignature: false,
    },
    'btp-architecture': {
        templateId: 'btp-architecture',
        category: 'btp-industrie',
        units: [...UNITS_COMMERCE, { parent_id: null, type: 'department', name: 'Projets', code: 'PRJ', icon: 'Ruler', color: 'cyan', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 }, managers: [], members: [], is_active: true, sort_order: 4 }],
        archiveWorkflows: [WF_ARCHIVE_STANDARD],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 },
        retentionYears: 30,
        requiresDoubleSignature: false,
    },
    'industrie-production': {
        templateId: 'industrie-production',
        category: 'btp-industrie',
        units: UNITS_COMMERCE,
        archiveWorkflows: [WF_ARCHIVE_STANDARD, WF_ARCHIVE_FISCAL],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        retentionYears: 10,
        requiresDoubleSignature: false,
    },
    'industrie-petrole': {
        templateId: 'industrie-petrole',
        category: 'btp-industrie',
        units: [...UNITS_COMMERCE, { parent_id: null, type: 'department', name: 'QHSE', code: 'QHS', icon: 'Shield', color: 'red', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 }, managers: [], members: [], is_active: true, sort_order: 4 }],
        archiveWorkflows: [WF_ARCHIVE_STANDARD, WF_ARCHIVE_FISCAL],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE, WF_SIGNATURE_LEGAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 },
        retentionYears: 30,
        requiresDoubleSignature: true,
    },

    // === SERVICES PROFESSIONNELS ===
    'pro-notaire': {
        templateId: 'pro-notaire',
        category: 'services-pro',
        units: UNITS_LEGAL,
        archiveWorkflows: [WF_ARCHIVE_LEGAL],
        signatureWorkflows: [WF_SIGNATURE_LEGAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        legalBasis: 'Loi sur le Notariat - Conservation des Minutes',
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },
    'pro-avocat': {
        templateId: 'pro-avocat',
        category: 'services-pro',
        units: UNITS_LEGAL,
        archiveWorkflows: [WF_ARCHIVE_LEGAL],
        signatureWorkflows: [WF_SIGNATURE_LEGAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 },
        legalBasis: 'Règlement Intérieur du Barreau',
        retentionYears: 30,
        requiresDoubleSignature: true,
    },
    'pro-comptable': {
        templateId: 'pro-comptable',
        category: 'services-pro',
        units: [...UNITS_COMMERCE, { parent_id: null, type: 'department', name: 'Audit', code: 'AUD', icon: 'Search', color: 'purple', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 }, managers: [], members: [], is_active: true, sort_order: 4 }],
        archiveWorkflows: [WF_ARCHIVE_FISCAL],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        legalBasis: 'Code Général des Impôts',
        retentionYears: 10,
        requiresDoubleSignature: false,
    },
    'pro-conseil': {
        templateId: 'pro-conseil',
        category: 'services-pro',
        units: UNITS_COMMERCE,
        archiveWorkflows: [WF_ARCHIVE_STANDARD],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        retentionYears: 10,
        requiresDoubleSignature: false,
    },
    'pro-assurance': {
        templateId: 'pro-assurance',
        category: 'services-pro',
        units: [...UNITS_COMMERCE, { parent_id: null, type: 'department', name: 'Sinistres', code: 'SIN', icon: 'AlertTriangle', color: 'red', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 }, managers: [], members: [], is_active: true, sort_order: 4 }],
        archiveWorkflows: [WF_ARCHIVE_STANDARD, WF_ARCHIVE_LEGAL],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        retentionYears: 10,
        requiresDoubleSignature: false,
    },

    // === TECH & TÉLÉCOM ===
    'tech-startup': {
        templateId: 'tech-startup',
        category: 'tech-telecom',
        units: [
            { parent_id: null, type: 'department', name: 'Direction', code: 'DIR', icon: 'Rocket', color: 'purple', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 }, managers: [], members: [], is_active: true, sort_order: 0 },
            { parent_id: null, type: 'department', name: 'Produit', code: 'PRD', icon: 'Layers', color: 'blue', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 }, managers: [], members: [], is_active: true, sort_order: 1 },
            { parent_id: null, type: 'department', name: 'Tech', code: 'TCH', icon: 'Code', color: 'cyan', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 5 }, managers: [], members: [], is_active: true, sort_order: 2 },
        ],
        archiveWorkflows: [WF_ARCHIVE_STANDARD],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        retentionYears: 10,
        requiresDoubleSignature: false,
    },
    'tech-telecom': {
        templateId: 'tech-telecom',
        category: 'tech-telecom',
        units: UNITS_COMMERCE,
        archiveWorkflows: [WF_ARCHIVE_STANDARD, WF_ARCHIVE_FISCAL],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        retentionYears: 10,
        requiresDoubleSignature: false,
    },
    'tech-it-services': {
        templateId: 'tech-it-services',
        category: 'tech-telecom',
        units: UNITS_COMMERCE,
        archiveWorkflows: [WF_ARCHIVE_STANDARD],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        retentionYears: 10,
        requiresDoubleSignature: false,
    },

    // === AUTRES ENTREPRISES ===
    'entreprise-pme': {
        templateId: 'entreprise-pme',
        category: 'autres-entreprises',
        units: UNITS_COMMERCE,
        archiveWorkflows: [WF_ARCHIVE_STANDARD, WF_ARCHIVE_FISCAL],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        retentionYears: 10,
        requiresDoubleSignature: false,
    },
    'entreprise-corporate': {
        templateId: 'entreprise-corporate',
        category: 'autres-entreprises',
        units: [...UNITS_COMMERCE, { parent_id: null, type: 'department', name: 'Juridique', code: 'JUR', icon: 'Scale', color: 'red', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 }, managers: [], members: [], is_active: true, sort_order: 4 }],
        archiveWorkflows: [WF_ARCHIVE_STANDARD, WF_ARCHIVE_FISCAL, WF_ARCHIVE_LEGAL],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE, WF_SIGNATURE_LEGAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        retentionYears: 10,
        requiresDoubleSignature: false,
    },

    // === GOUVERNEMENT CENTRAL ===
    'admin-ministere': {
        templateId: 'admin-ministere',
        category: 'gouvernement-central',
        units: UNITS_MINISTERE,
        archiveWorkflows: [WF_ARCHIVE_ADMIN],
        signatureWorkflows: [WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        legalBasis: 'Loi sur les Archives Nationales',
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },
    'admin-presidence': {
        templateId: 'admin-presidence',
        category: 'gouvernement-central',
        units: UNITS_MINISTERE,
        archiveWorkflows: [WF_ARCHIVE_ADMIN],
        signatureWorkflows: [WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        legalBasis: 'Archives de la Présidence',
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },
    'admin-direction': {
        templateId: 'admin-direction',
        category: 'gouvernement-central',
        units: UNITS_MINISTERE,
        archiveWorkflows: [WF_ARCHIVE_ADMIN],
        signatureWorkflows: [WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },
    'admin-agence': {
        templateId: 'admin-agence',
        category: 'gouvernement-central',
        units: UNITS_MINISTERE,
        archiveWorkflows: [WF_ARCHIVE_ADMIN, WF_ARCHIVE_FISCAL],
        signatureWorkflows: [WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },

    // === JUSTICE ===
    'justice-tribunal': {
        templateId: 'justice-tribunal',
        category: 'justice',
        units: UNITS_TRIBUNAL,
        archiveWorkflows: [WF_ARCHIVE_JUDICIAL],
        signatureWorkflows: [WF_SIGNATURE_LEGAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        legalBasis: 'Code de Procédure Civile et Pénale',
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },
    'justice-parquet': {
        templateId: 'justice-parquet',
        category: 'justice',
        units: UNITS_TRIBUNAL,
        archiveWorkflows: [WF_ARCHIVE_JUDICIAL],
        signatureWorkflows: [WF_SIGNATURE_LEGAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        legalBasis: 'Ministère Public',
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },
    'justice-prison': {
        templateId: 'justice-prison',
        category: 'justice',
        units: UNITS_MINISTERE,
        archiveWorkflows: [WF_ARCHIVE_ADMIN, WF_ARCHIVE_SECURITY],
        signatureWorkflows: [WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },

    // === COLLECTIVITÉS ===
    'local-mairie': {
        templateId: 'local-mairie',
        category: 'collectivites',
        units: UNITS_MAIRIE,
        archiveWorkflows: [WF_ARCHIVE_ADMIN],
        signatureWorkflows: [WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        legalBasis: 'Code des Collectivités Locales',
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },
    'local-conseil-departemental': {
        templateId: 'local-conseil-departemental',
        category: 'collectivites',
        units: UNITS_MINISTERE,
        archiveWorkflows: [WF_ARCHIVE_ADMIN],
        signatureWorkflows: [WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },
    'local-province': {
        templateId: 'local-province',
        category: 'collectivites',
        units: UNITS_MINISTERE,
        archiveWorkflows: [WF_ARCHIVE_ADMIN],
        signatureWorkflows: [WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },

    // === SÉCURITÉ & DÉFENSE ===
    'securite-police': {
        templateId: 'securite-police',
        category: 'securite-defense',
        units: UNITS_MINISTERE,
        archiveWorkflows: [WF_ARCHIVE_SECURITY],
        signatureWorkflows: [WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        legalBasis: 'Secret Défense',
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },
    'securite-armee': {
        templateId: 'securite-armee',
        category: 'securite-defense',
        units: UNITS_MINISTERE,
        archiveWorkflows: [WF_ARCHIVE_SECURITY],
        signatureWorkflows: [WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        legalBasis: 'Secret Défense Nationale',
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },
    'securite-douane': {
        templateId: 'securite-douane',
        category: 'securite-defense',
        units: UNITS_MINISTERE,
        archiveWorkflows: [WF_ARCHIVE_ADMIN, WF_ARCHIVE_FISCAL],
        signatureWorkflows: [WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
        legalBasis: 'Code des Douanes',
        retentionYears: 10,
        requiresDoubleSignature: true,
    },

    // === ÉDUCATION & CULTURE ===
    'education-universite': {
        templateId: 'education-universite',
        category: 'education-culture',
        units: [
            { parent_id: null, type: 'department', name: 'Rectorat', code: 'REC', icon: 'GraduationCap', color: 'purple', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 0 },
            { parent_id: null, type: 'department', name: 'Scolarité', code: 'SCO', icon: 'BookOpen', color: 'blue', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 1 },
            { parent_id: null, type: 'department', name: 'Ressources Humaines', code: 'RH', icon: 'Users', color: 'green', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 50 }, managers: [], members: [], is_active: true, sort_order: 2 },
        ],
        archiveWorkflows: [WF_ARCHIVE_ADMIN],
        signatureWorkflows: [WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        legalBasis: 'Diplômes et Relevés de Notes',
        retentionYears: 'permanent',
        requiresDoubleSignature: true,
    },
    'education-lycee': {
        templateId: 'education-lycee',
        category: 'education-culture',
        units: [
            { parent_id: null, type: 'department', name: 'Provisorat', code: 'PRO', icon: 'GraduationCap', color: 'purple', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 0 },
            { parent_id: null, type: 'department', name: 'Scolarité', code: 'SCO', icon: 'BookOpen', color: 'blue', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 50 }, managers: [], members: [], is_active: true, sort_order: 1 },
        ],
        archiveWorkflows: [WF_ARCHIVE_ADMIN],
        signatureWorkflows: [WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 50 },
        retentionYears: 50,
        requiresDoubleSignature: true,
    },
    'culture-musee': {
        templateId: 'culture-musee',
        category: 'education-culture',
        units: UNITS_MINISTERE,
        archiveWorkflows: [WF_ARCHIVE_ADMIN],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
        retentionYears: 'permanent',
        requiresDoubleSignature: false,
    },

    // === SANTÉ PUBLIQUE ===
    'sante-hopital': {
        templateId: 'sante-hopital',
        category: 'sante-publique',
        units: [
            { parent_id: null, type: 'department', name: 'Direction', code: 'DIR', icon: 'Building2', color: 'purple', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' }, managers: [], members: [], is_active: true, sort_order: 0 },
            { parent_id: null, type: 'department', name: 'Dossiers Médicaux', code: 'DIM', icon: 'FileText', color: 'red', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30, legal_basis: 'Secret Médical' }, managers: [], members: [], is_active: true, sort_order: 1 },
            { parent_id: null, type: 'department', name: 'Pharmacie', code: 'PHA', icon: 'Pill', color: 'green', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 }, managers: [], members: [], is_active: true, sort_order: 2 },
            { parent_id: null, type: 'department', name: 'Ressources Humaines', code: 'RH', icon: 'Users', color: 'blue', archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 50 }, managers: [], members: [], is_active: true, sort_order: 3 },
        ],
        archiveWorkflows: [WF_ARCHIVE_MEDICAL, WF_ARCHIVE_ADMIN],
        signatureWorkflows: [WF_SIGNATURE_MEDICAL, WF_SIGNATURE_HIERARCHICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 },
        legalBasis: 'Secret Médical et Loi Santé Publique',
        retentionYears: 30,
        requiresDoubleSignature: true,
    },
    'sante-centre': {
        templateId: 'sante-centre',
        category: 'sante-publique',
        units: UNITS_SANTE_PRIVEE,
        archiveWorkflows: [WF_ARCHIVE_MEDICAL],
        signatureWorkflows: [WF_SIGNATURE_MEDICAL],
        defaultArchiveConfig: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30 },
        retentionYears: 30,
        requiresDoubleSignature: false,
    },

    // === CUSTOM ===
    'custom': {
        templateId: 'custom',
        category: 'autres-entreprises',
        units: UNITS_COMMERCE,
        archiveWorkflows: [WF_ARCHIVE_STANDARD],
        signatureWorkflows: [WF_SIGNATURE_SIMPLE],
        defaultArchiveConfig: DEFAULT_ARCHIVE_CONFIG,
        retentionYears: 10,
        requiresDoubleSignature: false,
    },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get workflow preset by template ID
 */
export function getWorkflowPreset(templateId: TemplateId): OrganizationWorkflowPreset | undefined {
    return ORGANIZATION_WORKFLOW_PRESETS[templateId];
}

/**
 * Get all archive workflows for a template
 */
export function getArchiveWorkflows(templateId: TemplateId): WorkflowTemplate[] {
    return ORGANIZATION_WORKFLOW_PRESETS[templateId]?.archiveWorkflows || [];
}

/**
 * Get all signature workflows for a template
 */
export function getSignatureWorkflows(templateId: TemplateId): WorkflowTemplate[] {
    return ORGANIZATION_WORKFLOW_PRESETS[templateId]?.signatureWorkflows || [];
}

/**
 * Get default archive config for a template
 */
export function getDefaultArchiveConfig(templateId: TemplateId): ArchiveConfig {
    return ORGANIZATION_WORKFLOW_PRESETS[templateId]?.defaultArchiveConfig || DEFAULT_ARCHIVE_CONFIG;
}

/**
 * Get organizational units for a template
 */
export function getOrganizationUnits(templateId: TemplateId): OrganizationWorkflowPreset['units'] {
    return ORGANIZATION_WORKFLOW_PRESETS[templateId]?.units || [];
}

/**
 * Check if template requires double signature
 */
export function requiresDoubleSignature(templateId: TemplateId): boolean {
    return ORGANIZATION_WORKFLOW_PRESETS[templateId]?.requiresDoubleSignature || false;
}
