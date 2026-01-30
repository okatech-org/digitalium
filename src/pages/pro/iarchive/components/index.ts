/**
 * iArchive Components - Barrel export
 */

// Upload
export { DocumentUploader } from './DocumentUploader';

// Cards
export { ArchiveCard, type ArchiveDocument } from './ArchiveCard';

// Integrity
export { IntegrityBadge, HashVerifier, type IntegrityStatus } from './IntegrityBadge';

// Retention
export {
    RetentionPolicyCard,
    ExpirationAlert,
    RetentionTimeline,
    GABON_RETENTION_RULES,
} from './RetentionPolicy';

// AI Assistant
export { IAstedChat } from './IAstedChat';

// Compliance - Phase 3
export {
    DepositCertificate,
    generateCertificate,
    type CertificateData,
} from './DepositCertificate';
export {
    AuditLog,
    AuditSummaryCard,
    type AuditEntry,
    type AuditAction,
} from './AuditLog';

// Collaboration - Phase 5
export {
    ShareDialog,
    ShareBadge,
    type ShareLink,
    type ShareRecipient,
    type SharePermission,
} from './DocumentSharing';
export {
    AnnotationPanel,
    HighlightColorPicker,
    type Annotation,
    type AnnotationType,
    type AnnotationPriority,
} from './DocumentAnnotations';

// Red Notes - Phase 3 Advanced Features
export { NegativePermissions, type Permission, type PermissionType, type PermissionLevel } from './NegativePermissions';
export { BatchOperationsPanel, type BatchOperationType, type SelectedDocument, type BatchOperationResult } from './BatchOperationsPanel';
export { DestructionCertificateGenerator, type DocumentToDestroy, type DestructionCertificate } from './DestructionCertificateGenerator';
export { AutoArchiveRules, type AutoArchiveRule, type Frequency } from './AutoArchiveRules';
export { RenewalReminders, type DocumentReminder, type ReminderType } from './RenewalReminders';
export { RedactionTool, type Redaction } from './RedactionTool';
export { DocumentManagementTable, type ManagementCategory, type FinalDisposition } from './DocumentManagementTable';

// Phase 4 - Workflows & Automation
export { ApprovalWorkflow, type ApprovalWorkflowData, type ApprovalStep, type Approver } from './ApprovalWorkflow';
export { ClassificationRules, type ClassificationRule, type ClassificationCondition } from './ClassificationRules';
export { ExpirationNotifications, type ExpiringDocument } from './ExpirationNotifications';
export { RetentionTransitions, type TransitionQueue, type RetentionPhase } from './RetentionTransitions';

// Phase 5 - Integration & Polish
export { ElectronicSignature, type SignatureRequest, type Signatory, type SignatureStatus } from './ElectronicSignature';
export { IntegrationsPanel } from './IntegrationsPanel';
