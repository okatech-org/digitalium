/**
 * Workflow Templates Data
 * Mock data for archiving workflow templates stored in SysAdmin configuration
 */

import { UnitWorkflow, WorkflowStep, WorkflowTrigger, WorkflowStepType } from '@/types/organization';

// ========================================
// WORKFLOW TEMPLATE TYPES (Extended)
// ========================================

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    trigger: WorkflowTrigger;
    steps: WorkflowStepConfig[];
    is_active: boolean;
    is_system: boolean; // System templates can't be deleted
    category: 'archivage' | 'signature' | 'validation' | 'notification' | 'custom';
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface WorkflowStepConfig {
    id: string;
    order: number;
    type: WorkflowStepType;
    name: string;
    description?: string;
    config: {
        // For 'notify'
        notify_users?: string[];
        notify_roles?: string[];
        notify_message?: string;

        // For 'approve'
        approvers?: string[];
        approval_type?: 'any' | 'all' | 'majority';
        timeout_days?: number;

        // For 'archive'
        target_folder?: string;
        retention_years?: number;
        add_metadata?: Record<string, string>;

        // For 'move'
        target_unit_id?: string;

        // For 'tag'
        tags?: string[];
        remove_tags?: string[];

        // For 'webhook'
        webhook_url?: string;
        webhook_method?: 'GET' | 'POST';
    };
    condition?: {
        field: string;
        operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_equals';
        value: string | number;
    };
}

// ========================================
// DEFAULT ARCHIVE WORKFLOW TEMPLATES
// ========================================

export const DEFAULT_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
    {
        id: 'wf-standard-archive',
        name: 'Archivage Standard',
        description: 'Workflow basique pour l\'archivage de documents courants. Notification, approbation simple, puis archivage.',
        trigger: 'manual',
        category: 'archivage',
        is_active: true,
        is_system: true,
        created_by: 'system',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        steps: [
            {
                id: 'step-1',
                order: 1,
                type: 'notify',
                name: 'Notification du responsable',
                description: 'Informer le responsable de la demande d\'archivage',
                config: {
                    notify_roles: ['manager'],
                    notify_message: 'Un document est en attente d\'archivage'
                }
            },
            {
                id: 'step-2',
                order: 2,
                type: 'approve',
                name: 'Approbation',
                description: 'Validation par un responsable',
                config: {
                    approval_type: 'any',
                    timeout_days: 7
                }
            },
            {
                id: 'step-3',
                order: 3,
                type: 'tag',
                name: 'Marquage',
                description: 'Ajouter les tags d\'archivage',
                config: {
                    tags: ['archivé', 'validé']
                }
            },
            {
                id: 'step-4',
                order: 4,
                type: 'archive',
                name: 'Archivage',
                description: 'Déplacer vers les archives',
                config: {
                    retention_years: 10
                }
            }
        ]
    },
    {
        id: 'wf-legal-archive',
        name: 'Archivage Documents Légaux',
        description: 'Workflow renforcé pour documents juridiques avec double validation et conservation permanente.',
        trigger: 'upload',
        category: 'archivage',
        is_active: true,
        is_system: true,
        created_by: 'system',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        steps: [
            {
                id: 'step-1',
                order: 1,
                type: 'notify',
                name: 'Notification DAJ',
                description: 'Alerter la Direction des Affaires Juridiques',
                config: {
                    notify_roles: ['legal', 'daj'],
                    notify_message: 'Document juridique nécessitant archivage légal'
                }
            },
            {
                id: 'step-2',
                order: 2,
                type: 'approve',
                name: 'Validation Juridique',
                description: 'Approbation par tous les membres de la DAJ',
                config: {
                    approval_type: 'all',
                    timeout_days: 14
                }
            },
            {
                id: 'step-3',
                order: 3,
                type: 'tag',
                name: 'Classification Légale',
                description: 'Appliquer les tags de conformité',
                config: {
                    tags: ['legal', 'verified', 'conforme']
                }
            },
            {
                id: 'step-4',
                order: 4,
                type: 'archive',
                name: 'Archivage Légal',
                description: 'Archivage avec conservation permanente',
                config: {
                    retention_years: 30,
                    add_metadata: {
                        legal_basis: 'Code Civil - Art. 2224',
                        classification: 'Juridique'
                    }
                }
            }
        ]
    },
    {
        id: 'wf-fiscal-archive',
        name: 'Archivage Documents Fiscaux',
        description: 'Conservation 10 ans conforme aux exigences fiscales. Validation DAF requise.',
        trigger: 'schedule',
        category: 'archivage',
        is_active: true,
        is_system: true,
        created_by: 'system',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        steps: [
            {
                id: 'step-1',
                order: 1,
                type: 'notify',
                name: 'Notification DAF',
                description: 'Alerter la Direction Administrative et Financière',
                config: {
                    notify_roles: ['finance', 'daf'],
                    notify_message: 'Document fiscal en attente d\'archivage'
                }
            },
            {
                id: 'step-2',
                order: 2,
                type: 'approve',
                name: 'Validation DAF',
                description: 'Approbation par le responsable financier',
                config: {
                    approval_type: 'any',
                    timeout_days: 5
                }
            },
            {
                id: 'step-3',
                order: 3,
                type: 'tag',
                name: 'Tags Fiscaux',
                description: 'Appliquer les tags de comptabilité',
                config: {
                    tags: ['fiscal', 'comptabilité']
                }
            },
            {
                id: 'step-4',
                order: 4,
                type: 'archive',
                name: 'Archivage Fiscal',
                description: 'Archivage 10 ans',
                config: {
                    retention_years: 10,
                    add_metadata: {
                        legal_basis: 'Code du Commerce - Art. L123-22',
                        classification: 'Fiscal'
                    }
                }
            }
        ]
    },
    {
        id: 'wf-rh-archive',
        name: 'Archivage Documents RH',
        description: 'Archivage des documents de ressources humaines avec confidentialité renforcée.',
        trigger: 'manual',
        category: 'archivage',
        is_active: true,
        is_system: true,
        created_by: 'system',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        steps: [
            {
                id: 'step-1',
                order: 1,
                type: 'notify',
                name: 'Notification DRH',
                description: 'Alerter la Direction des Ressources Humaines',
                config: {
                    notify_roles: ['hr', 'drh'],
                    notify_message: 'Document RH confidentiel en attente d\'archivage'
                }
            },
            {
                id: 'step-2',
                order: 2,
                type: 'approve',
                name: 'Validation DRH',
                description: 'Approbation par le DRH',
                config: {
                    approval_type: 'any',
                    timeout_days: 7
                }
            },
            {
                id: 'step-3',
                order: 3,
                type: 'tag',
                name: 'Tags RH',
                description: 'Appliquer les tags de confidentialité',
                config: {
                    tags: ['rh', 'confidentiel', 'personnel']
                }
            },
            {
                id: 'step-4',
                order: 4,
                type: 'archive',
                name: 'Archivage RH',
                description: 'Archivage 50 ans (carrière employé)',
                config: {
                    retention_years: 50,
                    add_metadata: {
                        legal_basis: 'Code du Travail - Art. L3243-4',
                        classification: 'Ressources Humaines'
                    }
                }
            }
        ]
    },
    {
        id: 'wf-quick-archive',
        name: 'Archivage Rapide',
        description: 'Archivage immédiat sans validation pour documents non-sensibles.',
        trigger: 'manual',
        category: 'archivage',
        is_active: true,
        is_system: false,
        created_by: 'admin',
        created_at: '2024-06-15',
        updated_at: '2024-06-15',
        steps: [
            {
                id: 'step-1',
                order: 1,
                type: 'tag',
                name: 'Tags Automatiques',
                description: 'Marquer comme archivé',
                config: {
                    tags: ['archivé', 'auto']
                }
            },
            {
                id: 'step-2',
                order: 2,
                type: 'archive',
                name: 'Archivage Direct',
                description: 'Archivage immédiat',
                config: {
                    retention_years: 5
                }
            }
        ]
    }
];

// ========================================
// WORKFLOW STEP TYPE LABELS
// ========================================

export const WORKFLOW_STEP_TYPE_LABELS: Record<WorkflowStepType, { label: string; icon: string; color: string }> = {
    notify: { label: 'Notification', icon: '🔔', color: 'bg-blue-500' },
    approve: { label: 'Approbation', icon: '✅', color: 'bg-green-500' },
    archive: { label: 'Archivage', icon: '📦', color: 'bg-amber-500' },
    move: { label: 'Déplacement', icon: '📁', color: 'bg-purple-500' },
    tag: { label: 'Tags', icon: '🏷️', color: 'bg-cyan-500' },
    webhook: { label: 'Webhook', icon: '🔗', color: 'bg-gray-500' }
};

export const WORKFLOW_TRIGGER_LABELS: Record<WorkflowTrigger, { label: string; description: string }> = {
    upload: { label: 'À l\'import', description: 'Déclenché automatiquement lors de l\'upload d\'un document' },
    approval: { label: 'À l\'approbation', description: 'Déclenché quand une approbation est requise' },
    expiration: { label: 'À l\'expiration', description: 'Déclenché quand un document expire' },
    schedule: { label: 'Programmé', description: 'Exécuté selon un calendrier défini' },
    manual: { label: 'Manuel', description: 'Déclenché manuellement par l\'utilisateur' }
};

export const WORKFLOW_CATEGORY_LABELS: Record<WorkflowTemplate['category'], { label: string; color: string }> = {
    archivage: { label: 'Archivage', color: 'bg-amber-100 text-amber-700' },
    signature: { label: 'Signature', color: 'bg-blue-100 text-blue-700' },
    validation: { label: 'Validation', color: 'bg-green-100 text-green-700' },
    notification: { label: 'Notification', color: 'bg-purple-100 text-purple-700' },
    custom: { label: 'Personnalisé', color: 'bg-gray-100 text-gray-700' }
};
