// =====================================================
// DIGITALIUM ORGANIZATION & ARCHIVE SEGMENTATION TYPES
// =====================================================

// =====================================================
// ORGANIZATIONAL UNIT TYPES
// =====================================================

export type OrganizationUnitType =
    | 'group'       // Holding/Group of companies
    | 'company'     // Individual company/administration
    | 'department'  // Department (Finance, HR, IT, etc.)
    | 'service'     // Service within department
    | 'sector'      // Sector/Team within service
    | 'folder';     // Logical folder for documents

export type RetentionPeriod = number | 'permanent';

// =====================================================
// ARCHIVE CONFIGURATION
// =====================================================

export interface ArchiveConfig {
    /** Retention period in years or 'permanent' */
    retention_years: RetentionPeriod;

    /** Legal basis for retention (e.g., "Code du Commerce - Art. L123-22") */
    legal_basis?: string;

    /** Allowed document types for this unit */
    document_types: string[];

    /** Naming pattern for documents (e.g., "{type}-{date}-{ref}") */
    naming_convention?: string;

    /** Auto-archive documents on upload */
    auto_archive: boolean;

    /** Require approval before archiving */
    require_approval: boolean;

    /** User IDs of approvers */
    approvers?: string[];

    /** Days before expiration to send notification */
    notify_expiration_days?: number;

    /** Storage quota in bytes for this unit */
    storage_quota_bytes?: number;

    /** Inherit config from parent unit */
    inherit_from_parent: boolean;
}

export const DEFAULT_ARCHIVE_CONFIG: ArchiveConfig = {
    retention_years: 10,
    document_types: [],
    auto_archive: false,
    require_approval: false,
    notify_expiration_days: 30,
    inherit_from_parent: true,
};

// =====================================================
// ORGANIZATION UNIT
// =====================================================

export interface OrganizationUnit {
    id: string;

    /** Parent organization ID (company/admin) */
    organization_id: string;

    /** Parent unit ID for hierarchy (null for root) */
    parent_id: string | null;

    /** Type of organizational unit */
    type: OrganizationUnitType;

    /** Display name */
    name: string;

    /** Unique code within organization (e.g., "FIN-001") */
    code: string;

    /** Description of the unit */
    description?: string;

    /** Icon identifier (lucide icon name) */
    icon?: string;

    /** Color for UI (hex or tailwind class) */
    color?: string;

    /** Archive configuration for this unit */
    archive_config: ArchiveConfig;

    /** User IDs who can manage this unit */
    managers: string[];

    /** User IDs who are members of this unit */
    members: string[];

    /** Whether this unit is active */
    is_active: boolean;

    /** Sort order among siblings */
    sort_order: number;

    /** Statistics */
    stats?: {
        document_count: number;
        storage_used_bytes: number;
        pending_approvals: number;
    };

    /** Metadata */
    created_by: string;
    created_at: string;
    updated_at: string;
}

// =====================================================
// WORKFLOW TYPES
// =====================================================

export type WorkflowTrigger =
    | 'upload'      // Triggered on document upload
    | 'approval'    // Triggered when approval needed
    | 'expiration'  // Triggered on document expiration
    | 'schedule'    // Triggered on schedule
    | 'manual';     // Manually triggered

export type WorkflowStepType =
    | 'notify'      // Send notification
    | 'approve'     // Request approval
    | 'archive'     // Archive document
    | 'move'        // Move to another unit
    | 'tag'         // Add tags
    | 'webhook';    // Call external webhook

export interface WorkflowStep {
    id: string;
    order: number;
    type: WorkflowStepType;
    name: string;

    /** Configuration based on step type */
    config: {
        /** For 'notify': user IDs or roles to notify */
        notify_users?: string[];
        notify_roles?: string[];

        /** For 'approve': required approvers */
        approvers?: string[];
        approval_type?: 'any' | 'all' | 'majority';

        /** For 'move': target unit ID */
        target_unit_id?: string;

        /** For 'tag': tags to add */
        tags?: string[];

        /** For 'webhook': URL and method */
        webhook_url?: string;
        webhook_method?: 'GET' | 'POST';
    };

    /** Condition to execute this step (optional) */
    condition?: {
        field: string;
        operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
        value: string | number;
    };
}

export interface UnitWorkflow {
    id: string;
    unit_id: string;
    name: string;
    description?: string;
    trigger: WorkflowTrigger;
    steps: WorkflowStep[];
    is_active: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
}

// =====================================================
// ORGANIZATION TEMPLATES
// =====================================================

export type OrganizationTemplateType =
    | 'pme'           // Small/Medium Enterprise
    | 'grande_entreprise'  // Large Enterprise
    | 'administration' // Public Administration
    | 'ong'           // NGO
    | 'cabinet'       // Law/Accounting firm
    | 'custom';       // Custom structure

export interface OrganizationTemplate {
    id: string;
    type: OrganizationTemplateType;
    name: string;
    description: string;

    /** Predefined unit structure */
    units: Omit<OrganizationUnit, 'id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at'>[];

    /** Predefined workflows */
    workflows: Omit<UnitWorkflow, 'id' | 'unit_id' | 'created_by' | 'created_at' | 'updated_at'>[];
}

// Predefined templates
export const ORGANIZATION_TEMPLATES: OrganizationTemplate[] = [
    {
        id: 'tpl-pme',
        type: 'pme',
        name: 'PME Standard',
        description: 'Structure adaptée aux petites et moyennes entreprises',
        units: [
            {
                parent_id: null,
                type: 'department',
                name: 'Direction',
                code: 'DIR',
                icon: 'Building2',
                color: 'purple',
                archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
                managers: [],
                members: [],
                is_active: true,
                sort_order: 0,
            },
            {
                parent_id: null,
                type: 'department',
                name: 'Comptabilité & Finance',
                code: 'FIN',
                icon: 'Calculator',
                color: 'emerald',
                archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10, legal_basis: 'Code du Commerce - Art. L123-22' },
                managers: [],
                members: [],
                is_active: true,
                sort_order: 1,
            },
            {
                parent_id: null,
                type: 'department',
                name: 'Ressources Humaines',
                code: 'RH',
                icon: 'Users',
                color: 'blue',
                archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 5, legal_basis: 'Code du Travail - Art. L3243-4' },
                managers: [],
                members: [],
                is_active: true,
                sort_order: 2,
            },
            {
                parent_id: null,
                type: 'department',
                name: 'Commercial',
                code: 'COM',
                icon: 'Briefcase',
                color: 'orange',
                archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
                managers: [],
                members: [],
                is_active: true,
                sort_order: 3,
            },
            {
                parent_id: null,
                type: 'department',
                name: 'Juridique',
                code: 'JUR',
                icon: 'Scale',
                color: 'red',
                archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 30, legal_basis: 'Code Civil - Art. 2224' },
                managers: [],
                members: [],
                is_active: true,
                sort_order: 4,
            },
        ],
        workflows: [],
    },
    {
        id: 'tpl-admin',
        type: 'administration',
        name: 'Administration Publique',
        description: 'Structure pour les administrations et institutions publiques',
        units: [
            {
                parent_id: null,
                type: 'department',
                name: 'Cabinet',
                code: 'CAB',
                icon: 'Building2',
                color: 'purple',
                archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
                managers: [],
                members: [],
                is_active: true,
                sort_order: 0,
            },
            {
                parent_id: null,
                type: 'department',
                name: 'Secrétariat Général',
                code: 'SG',
                icon: 'FileText',
                color: 'blue',
                archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
                managers: [],
                members: [],
                is_active: true,
                sort_order: 1,
            },
            {
                parent_id: null,
                type: 'department',
                name: 'Direction des Affaires Financières',
                code: 'DAF',
                icon: 'Calculator',
                color: 'emerald',
                archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 10 },
                managers: [],
                members: [],
                is_active: true,
                sort_order: 2,
            },
            {
                parent_id: null,
                type: 'department',
                name: 'Direction des Ressources Humaines',
                code: 'DRH',
                icon: 'Users',
                color: 'blue',
                archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 50 },
                managers: [],
                members: [],
                is_active: true,
                sort_order: 3,
            },
            {
                parent_id: null,
                type: 'department',
                name: 'Direction des Affaires Juridiques',
                code: 'DAJ',
                icon: 'Scale',
                color: 'red',
                archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
                managers: [],
                members: [],
                is_active: true,
                sort_order: 4,
            },
            {
                parent_id: null,
                type: 'department',
                name: 'Archives',
                code: 'ARC',
                icon: 'Archive',
                color: 'amber',
                archive_config: { ...DEFAULT_ARCHIVE_CONFIG, retention_years: 'permanent' },
                managers: [],
                members: [],
                is_active: true,
                sort_order: 5,
            },
        ],
        workflows: [],
    },
];

// =====================================================
// CONTEXT STATE TYPES
// =====================================================

export interface OrganizationState {
    /** All units for current organization */
    units: OrganizationUnit[];

    /** Currently selected unit */
    currentUnit: OrganizationUnit | null;

    /** Workflows for current organization */
    workflows: UnitWorkflow[];

    /** Available templates */
    templates: OrganizationTemplate[];

    /** Loading state */
    isLoading: boolean;

    /** Error message */
    error: string | null;
}

export interface OrganizationContextType extends OrganizationState {
    // Unit CRUD
    createUnit: (unit: Omit<OrganizationUnit, 'id' | 'created_at' | 'updated_at'>) => Promise<OrganizationUnit>;
    updateUnit: (id: string, updates: Partial<OrganizationUnit>) => Promise<void>;
    deleteUnit: (id: string) => Promise<void>;
    moveUnit: (id: string, newParentId: string | null) => Promise<void>;

    // Selection
    selectUnit: (id: string | null) => void;

    // Hierarchy helpers
    getUnitChildren: (parentId: string | null) => OrganizationUnit[];
    getUnitPath: (id: string) => OrganizationUnit[];
    getEffectiveConfig: (id: string) => ArchiveConfig;

    // Workflows
    createWorkflow: (workflow: Omit<UnitWorkflow, 'id' | 'created_at' | 'updated_at'>) => Promise<UnitWorkflow>;
    updateWorkflow: (id: string, updates: Partial<UnitWorkflow>) => Promise<void>;
    deleteWorkflow: (id: string) => Promise<void>;

    // Templates
    applyTemplate: (templateId: string) => Promise<void>;

    // Refresh
    refreshUnits: () => Promise<void>;
    refreshWorkflows: () => Promise<void>;
}

// =====================================================
// PERMISSION TYPES
// =====================================================

export type OrganizationPermission =
    | 'org:create_unit'
    | 'org:update_unit'
    | 'org:delete_unit'
    | 'org:manage_members'
    | 'org:configure_archive'
    | 'org:create_workflow'
    | 'org:apply_template'
    | 'archive:upload'
    | 'archive:view'
    | 'archive:approve'
    | 'archive:delete';

export interface UserPermissions {
    /** Global permissions */
    global: OrganizationPermission[];

    /** Unit-specific permissions (unit_id -> permissions) */
    units: Record<string, OrganizationPermission[]>;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Build a tree structure from flat units array
 */
export function buildUnitTree(units: OrganizationUnit[], parentId: string | null = null): OrganizationUnit[] {
    return units
        .filter(u => u.parent_id === parentId)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(u => ({
            ...u,
            children: buildUnitTree(units, u.id),
        }));
}

/**
 * Get the path from root to a specific unit
 */
export function getUnitPath(units: OrganizationUnit[], unitId: string): OrganizationUnit[] {
    const path: OrganizationUnit[] = [];
    let current = units.find(u => u.id === unitId);

    while (current) {
        path.unshift(current);
        current = current.parent_id ? units.find(u => u.id === current!.parent_id) : undefined;
    }

    return path;
}

/**
 * Get effective archive config considering inheritance
 */
export function getEffectiveArchiveConfig(
    units: OrganizationUnit[],
    unitId: string
): ArchiveConfig {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return DEFAULT_ARCHIVE_CONFIG;

    if (!unit.archive_config.inherit_from_parent || !unit.parent_id) {
        return unit.archive_config;
    }

    // Merge with parent config
    const parentConfig = getEffectiveArchiveConfig(units, unit.parent_id);
    return {
        ...parentConfig,
        ...unit.archive_config,
        // Keep document_types from both
        document_types: [
            ...new Set([...parentConfig.document_types, ...unit.archive_config.document_types])
        ],
    };
}

/**
 * Generate a unique code for a new unit
 */
export function generateUnitCode(name: string, existingCodes: string[]): string {
    // Take first 3 letters uppercase
    let baseCode = name
        .replace(/[^a-zA-Z]/g, '')
        .slice(0, 3)
        .toUpperCase();

    if (baseCode.length < 3) {
        baseCode = baseCode.padEnd(3, 'X');
    }

    // Add number if exists
    let code = baseCode;
    let counter = 1;
    while (existingCodes.includes(code)) {
        code = `${baseCode}-${String(counter).padStart(3, '0')}`;
        counter++;
    }

    return code;
}
