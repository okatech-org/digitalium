/**
 * useOrganizationSetup Hook
 * Automatically configures an organization based on its template type
 * Applies predefined workflows, units, and archive configurations
 */

import { useCallback } from 'react';
import {
    getWorkflowPreset,
    getArchiveWorkflows,
    getSignatureWorkflows,
    getOrganizationUnits,
    getDefaultArchiveConfig,
    requiresDoubleSignature,
    type OrganizationWorkflowPreset
} from '@/data/organizationWorkflowPresets';
import type { TemplateId } from '@/stores/publicPageEditorStore';
import type { OrganizationUnit, UnitWorkflow, ArchiveConfig } from '@/types/organization';
import type { WorkflowTemplate } from '@/data/workflowTemplatesData';

// =============================================================================
// TYPES
// =============================================================================

export interface OrganizationSetupResult {
    units: Omit<OrganizationUnit, 'id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at'>[];
    archiveWorkflows: WorkflowTemplate[];
    signatureWorkflows: WorkflowTemplate[];
    defaultArchiveConfig: ArchiveConfig;
    legalBasis?: string;
    retentionYears: number | 'permanent';
    requiresDoubleSignature: boolean;
}

export interface UseOrganizationSetupReturn {
    /** Get full setup configuration for a template */
    getSetup: (templateId: TemplateId) => OrganizationSetupResult | null;

    /** Get organizational units for a template */
    getUnits: (templateId: TemplateId) => OrganizationSetupResult['units'];

    /** Get archive workflows for a template */
    getArchiveWorkflows: (templateId: TemplateId) => WorkflowTemplate[];

    /** Get signature workflows for a template */
    getSignatureWorkflows: (templateId: TemplateId) => WorkflowTemplate[];

    /** Get default archive config for a template */
    getDefaultConfig: (templateId: TemplateId) => ArchiveConfig;

    /** Check if template requires double signature */
    needsDoubleSignature: (templateId: TemplateId) => boolean;

    /** Apply setup to an organization (async - would call API) */
    applySetup: (organizationId: string, templateId: TemplateId) => Promise<void>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useOrganizationSetup(): UseOrganizationSetupReturn {

    const getSetup = useCallback((templateId: TemplateId): OrganizationSetupResult | null => {
        const preset = getWorkflowPreset(templateId);
        if (!preset) return null;

        return {
            units: preset.units,
            archiveWorkflows: preset.archiveWorkflows,
            signatureWorkflows: preset.signatureWorkflows,
            defaultArchiveConfig: preset.defaultArchiveConfig,
            legalBasis: preset.legalBasis,
            retentionYears: preset.retentionYears,
            requiresDoubleSignature: preset.requiresDoubleSignature,
        };
    }, []);

    const getUnits = useCallback((templateId: TemplateId) => {
        return getOrganizationUnits(templateId);
    }, []);

    const applySetup = useCallback(async (organizationId: string, templateId: TemplateId): Promise<void> => {
        const setup = getSetup(templateId);
        if (!setup) {
            console.warn(`No workflow preset found for template: ${templateId}`);
            return;
        }

        console.log(`[useOrganizationSetup] Applying setup for ${templateId} to organization ${organizationId}`);
        console.log(`  - ${setup.units.length} units to create`);
        console.log(`  - ${setup.archiveWorkflows.length} archive workflows`);
        console.log(`  - ${setup.signatureWorkflows.length} signature workflows`);
        console.log(`  - Retention: ${setup.retentionYears} years`);
        console.log(`  - Double signature: ${setup.requiresDoubleSignature}`);

        // TODO: Implement actual API calls to:
        // 1. Create organizational units
        // 2. Assign archive workflows
        // 3. Assign signature workflows
        // 4. Set default archive configuration

        // For now, this is a mock implementation
        // In production, this would call:
        // - POST /api/organizations/:id/units (batch create)
        // - POST /api/organizations/:id/workflows (batch create)
        // - PUT /api/organizations/:id/config

    }, [getSetup]);

    return {
        getSetup,
        getUnits,
        getArchiveWorkflows,
        getSignatureWorkflows,
        getDefaultConfig: getDefaultArchiveConfig,
        needsDoubleSignature: requiresDoubleSignature,
        applySetup,
    };
}

export default useOrganizationSetup;
