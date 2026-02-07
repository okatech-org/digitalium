/**
 * Shared Admin Components
 * 
 * These components are used in both SysAdmin (/sysadmin) and SubAdmin (/subadmin) spaces.
 * They represent configuration and business management features that are shared across
 * multiple admin-level roles.
 */

// Configuration Plateforme components
export { default as Iam } from './Iam';
export { default as OrganizationConfig } from './OrganizationConfig';
export { default as DesignThemeSettings } from './DesignThemeSettings';
export { default as WorkflowTemplates } from './WorkflowTemplates';

// Gestion Métier components
export { default as ClientsManagement } from './ClientsManagement';
export { default as LeadsProspectsManagement } from './LeadsProspectsManagement';
export { default as SubscriptionsOverview } from './SubscriptionsOverview';
