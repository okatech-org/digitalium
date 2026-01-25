/**
 * OrganizationContext - Manages organizational hierarchy and archive segmentation
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import {
    OrganizationUnit,
    OrganizationState,
    OrganizationContextType,
    ArchiveConfig,
    UnitWorkflow,
    OrganizationTemplate,
    ORGANIZATION_TEMPLATES,
    DEFAULT_ARCHIVE_CONFIG,
    getEffectiveArchiveConfig,
    getUnitPath as getUnitPathHelper,
    generateUnitCode,
} from '@/types/organization';

// =====================================================
// MOCK DATA (will be replaced with API calls)
// =====================================================

const MOCK_UNITS: OrganizationUnit[] = [
    {
        id: 'unit-1',
        organization_id: 'org-1',
        parent_id: null,
        type: 'department',
        name: 'Comptabilité & Finance',
        code: 'FIN',
        description: 'Gestion comptable et financière',
        icon: 'Calculator',
        color: 'emerald',
        archive_config: {
            ...DEFAULT_ARCHIVE_CONFIG,
            retention_years: 10,
            legal_basis: 'Code du Commerce - Art. L123-22',
            document_types: ['Facture', 'Bilan', 'Déclaration', 'Relevé'],
        },
        managers: [],
        members: [],
        is_active: true,
        sort_order: 0,
        stats: { document_count: 2847, storage_used_bytes: 1024 * 1024 * 500, pending_approvals: 3 },
        created_by: 'system',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
    {
        id: 'unit-2',
        organization_id: 'org-1',
        parent_id: null,
        type: 'department',
        name: 'Ressources Humaines',
        code: 'RH',
        description: 'Gestion du personnel',
        icon: 'Users',
        color: 'blue',
        archive_config: {
            ...DEFAULT_ARCHIVE_CONFIG,
            retention_years: 5,
            legal_basis: 'Code du Travail - Art. L3243-4',
            document_types: ['Bulletin de paie', 'Contrat', 'Attestation', 'Avenant'],
        },
        managers: [],
        members: [],
        is_active: true,
        sort_order: 1,
        stats: { document_count: 1523, storage_used_bytes: 1024 * 1024 * 300, pending_approvals: 0 },
        created_by: 'system',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
    {
        id: 'unit-3',
        organization_id: 'org-1',
        parent_id: null,
        type: 'department',
        name: 'Juridique',
        code: 'JUR',
        description: 'Affaires juridiques et contentieux',
        icon: 'Scale',
        color: 'purple',
        archive_config: {
            ...DEFAULT_ARCHIVE_CONFIG,
            retention_years: 30,
            legal_basis: 'Code Civil - Art. 2224',
            document_types: ['Statuts', 'PV', 'Contrat', 'Acte notarié', 'Assignation'],
        },
        managers: [],
        members: [],
        is_active: true,
        sort_order: 2,
        stats: { document_count: 456, storage_used_bytes: 1024 * 1024 * 200, pending_approvals: 2 },
        created_by: 'system',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
    {
        id: 'unit-4',
        organization_id: 'org-1',
        parent_id: null,
        type: 'department',
        name: 'Commercial',
        code: 'COM',
        description: 'Ventes et relations clients',
        icon: 'Briefcase',
        color: 'orange',
        archive_config: {
            ...DEFAULT_ARCHIVE_CONFIG,
            retention_years: 10,
            document_types: ['Devis', 'Bon de commande', 'Contrat client', 'Facture'],
        },
        managers: [],
        members: [],
        is_active: true,
        sort_order: 3,
        stats: { document_count: 892, storage_used_bytes: 1024 * 1024 * 400, pending_approvals: 1 },
        created_by: 'system',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
    {
        id: 'unit-5',
        organization_id: 'org-1',
        parent_id: null,
        type: 'folder',
        name: 'Coffre-fort',
        code: 'COF',
        description: 'Documents sensibles à conservation permanente',
        icon: 'Shield',
        color: 'red',
        archive_config: {
            ...DEFAULT_ARCHIVE_CONFIG,
            retention_years: 'permanent',
            require_approval: true,
            document_types: ['Titre de propriété', 'Brevet', 'Marque', 'Secret'],
        },
        managers: [],
        members: [],
        is_active: true,
        sort_order: 4,
        stats: { document_count: 34, storage_used_bytes: 1024 * 1024 * 50, pending_approvals: 0 },
        created_by: 'system',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
];

// =====================================================
// CONTEXT
// =====================================================

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (!context) {
        throw new Error('useOrganization must be used within OrganizationProvider');
    }
    return context;
}

interface OrganizationProviderProps {
    children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
    const [units, setUnits] = useState<OrganizationUnit[]>(MOCK_UNITS);
    const [currentUnit, setCurrentUnit] = useState<OrganizationUnit | null>(null);
    const [workflows, setWorkflows] = useState<UnitWorkflow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // =====================================================
    // UNIT CRUD
    // =====================================================

    const createUnit = useCallback(async (
        unitData: Omit<OrganizationUnit, 'id' | 'created_at' | 'updated_at'>
    ): Promise<OrganizationUnit> => {
        setIsLoading(true);
        try {
            const newUnit: OrganizationUnit = {
                ...unitData,
                id: `unit-${Date.now()}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setUnits(prev => [...prev, newUnit]);
            return newUnit;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateUnit = useCallback(async (id: string, updates: Partial<OrganizationUnit>) => {
        setIsLoading(true);
        try {
            setUnits(prev => prev.map(u =>
                u.id === id
                    ? { ...u, ...updates, updated_at: new Date().toISOString() }
                    : u
            ));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteUnit = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            // Also delete children
            const toDelete = new Set<string>([id]);
            const findChildren = (parentId: string) => {
                units.filter(u => u.parent_id === parentId).forEach(u => {
                    toDelete.add(u.id);
                    findChildren(u.id);
                });
            };
            findChildren(id);

            setUnits(prev => prev.filter(u => !toDelete.has(u.id)));
            if (currentUnit && toDelete.has(currentUnit.id)) {
                setCurrentUnit(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, [units, currentUnit]);

    const moveUnit = useCallback(async (id: string, newParentId: string | null) => {
        setIsLoading(true);
        try {
            setUnits(prev => prev.map(u =>
                u.id === id
                    ? { ...u, parent_id: newParentId, updated_at: new Date().toISOString() }
                    : u
            ));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // =====================================================
    // SELECTION
    // =====================================================

    const selectUnit = useCallback((id: string | null) => {
        if (id === null) {
            setCurrentUnit(null);
        } else {
            const unit = units.find(u => u.id === id);
            setCurrentUnit(unit || null);
        }
    }, [units]);

    // =====================================================
    // HIERARCHY HELPERS
    // =====================================================

    const getUnitChildren = useCallback((parentId: string | null): OrganizationUnit[] => {
        return units
            .filter(u => u.parent_id === parentId)
            .sort((a, b) => a.sort_order - b.sort_order);
    }, [units]);

    const getUnitPath = useCallback((id: string): OrganizationUnit[] => {
        return getUnitPathHelper(units, id);
    }, [units]);

    const getEffectiveConfig = useCallback((id: string): ArchiveConfig => {
        return getEffectiveArchiveConfig(units, id);
    }, [units]);

    // =====================================================
    // WORKFLOWS
    // =====================================================

    const createWorkflow = useCallback(async (
        workflowData: Omit<UnitWorkflow, 'id' | 'created_at' | 'updated_at'>
    ): Promise<UnitWorkflow> => {
        const newWorkflow: UnitWorkflow = {
            ...workflowData,
            id: `wf-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setWorkflows(prev => [...prev, newWorkflow]);
        return newWorkflow;
    }, []);

    const updateWorkflow = useCallback(async (id: string, updates: Partial<UnitWorkflow>) => {
        setWorkflows(prev => prev.map(w =>
            w.id === id
                ? { ...w, ...updates, updated_at: new Date().toISOString() }
                : w
        ));
    }, []);

    const deleteWorkflow = useCallback(async (id: string) => {
        setWorkflows(prev => prev.filter(w => w.id !== id));
    }, []);

    // =====================================================
    // TEMPLATES
    // =====================================================

    const applyTemplate = useCallback(async (templateId: string) => {
        const template = ORGANIZATION_TEMPLATES.find(t => t.id === templateId);
        if (!template) {
            throw new Error('Template not found');
        }

        setIsLoading(true);
        try {
            const existingCodes = units.map(u => u.code);
            const newUnits: OrganizationUnit[] = template.units.map((unitData, index) => ({
                ...unitData,
                id: `unit-${Date.now()}-${index}`,
                organization_id: 'org-1', // TODO: Get from context
                code: generateUnitCode(unitData.name, existingCodes),
                created_by: 'system',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }));

            setUnits(prev => [...prev, ...newUnits]);
        } finally {
            setIsLoading(false);
        }
    }, [units]);

    // =====================================================
    // REFRESH
    // =====================================================

    const refreshUnits = useCallback(async () => {
        setIsLoading(true);
        try {
            // TODO: Fetch from API
            await new Promise(resolve => setTimeout(resolve, 500));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshWorkflows = useCallback(async () => {
        setIsLoading(true);
        try {
            // TODO: Fetch from API
            await new Promise(resolve => setTimeout(resolve, 500));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // =====================================================
    // CONTEXT VALUE
    // =====================================================

    const value = useMemo<OrganizationContextType>(() => ({
        // State
        units,
        currentUnit,
        workflows,
        templates: ORGANIZATION_TEMPLATES,
        isLoading,
        error,

        // Unit CRUD
        createUnit,
        updateUnit,
        deleteUnit,
        moveUnit,

        // Selection
        selectUnit,

        // Hierarchy helpers
        getUnitChildren,
        getUnitPath,
        getEffectiveConfig,

        // Workflows
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,

        // Templates
        applyTemplate,

        // Refresh
        refreshUnits,
        refreshWorkflows,
    }), [
        units,
        currentUnit,
        workflows,
        isLoading,
        error,
        createUnit,
        updateUnit,
        deleteUnit,
        moveUnit,
        selectUnit,
        getUnitChildren,
        getUnitPath,
        getEffectiveConfig,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
        applyTemplate,
        refreshUnits,
        refreshWorkflows,
    ]);

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
}
