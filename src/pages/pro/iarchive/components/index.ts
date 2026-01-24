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


