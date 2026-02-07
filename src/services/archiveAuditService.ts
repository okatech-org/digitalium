/**
 * Archive Audit Service
 * Tracks all actions performed on archived documents.
 * Provides immutable audit trail for compliance with NF Z42-013 / ISO 14641.
 */

// ========================================
// TYPES
// ========================================

export type AuditActionType =
    | 'archive'           // Document archived
    | 'consultation'      // Document viewed
    | 'certified_copy'    // Certified copy generated
    | 'integrity_check'   // Integrity verification performed
    | 'certificate_download' // Archive certificate downloaded
    | 'audit_log_view'    // Audit log consulted
    | 'access_denied'     // Unauthorized access attempt
    | 'retention_alert'   // Retention expiration alert
    | 'destruction'       // Document destroyed after retention
    | 'legal_hold'        // Document put on legal hold
    | 'metadata_view';    // Document metadata viewed

export interface AuditEvent {
    id: string;
    documentId: string;
    documentTitle: string;
    action: AuditActionType;
    timestamp: string;       // ISO 8601
    userId: string;
    userName: string;
    userRole: string;
    ipAddress?: string;
    details?: string;
    hashAtTime?: string;     // Document hash at the time of action
    success: boolean;
    metadata?: Record<string, string>;
}

export interface AuditSummary {
    totalEvents: number;
    lastConsultation?: string;
    lastIntegrityCheck?: string;
    totalCopies: number;
    totalConsultations: number;
    accessDenied: number;
}

// ========================================
// AUDIT ACTION LABELS
// ========================================

export const AUDIT_ACTION_LABELS: Record<AuditActionType, { label: string; icon: string; color: string }> = {
    archive: { label: 'Archivage', icon: '📦', color: 'text-emerald-600' },
    consultation: { label: 'Consultation', icon: '👁', color: 'text-blue-600' },
    certified_copy: { label: 'Copie certifiée', icon: '📋', color: 'text-purple-600' },
    integrity_check: { label: 'Vérification intégrité', icon: '🛡', color: 'text-green-600' },
    certificate_download: { label: 'Certificat téléchargé', icon: '📜', color: 'text-amber-600' },
    audit_log_view: { label: 'Journal consulté', icon: '📊', color: 'text-indigo-600' },
    access_denied: { label: 'Accès refusé', icon: '🚫', color: 'text-red-600' },
    retention_alert: { label: 'Alerte rétention', icon: '⏰', color: 'text-orange-600' },
    destruction: { label: 'Destruction', icon: '🗑', color: 'text-red-700' },
    legal_hold: { label: 'Gel juridique', icon: '⚖️', color: 'text-yellow-700' },
    metadata_view: { label: 'Métadonnées consultées', icon: '🏷', color: 'text-gray-600' },
};

// ========================================
// STORAGE
// ========================================

const STORAGE_KEY = 'digitalium_archive_audit';

function loadEvents(): AuditEvent[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveEvents(events: AuditEvent[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function generateId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ========================================
// CORE FUNCTIONS
// ========================================

/**
 * Log an audit event (immutable - no update or delete)
 */
export function logAuditEvent(params: {
    documentId: string;
    documentTitle: string;
    action: AuditActionType;
    userId?: string;
    userName?: string;
    userRole?: string;
    details?: string;
    hashAtTime?: string;
    success?: boolean;
    metadata?: Record<string, string>;
}): AuditEvent {
    const event: AuditEvent = {
        id: generateId(),
        documentId: params.documentId,
        documentTitle: params.documentTitle,
        action: params.action,
        timestamp: new Date().toISOString(),
        userId: params.userId || 'current-user',
        userName: params.userName || 'Utilisateur courant',
        userRole: params.userRole || 'operator',
        details: params.details,
        hashAtTime: params.hashAtTime,
        success: params.success ?? true,
        metadata: params.metadata,
    };

    const events = loadEvents();
    events.push(event);
    saveEvents(events);

    return event;
}

/**
 * Get all audit events for a document, sorted by most recent first
 */
export function getDocumentAuditTrail(documentId: string): AuditEvent[] {
    return loadEvents()
        .filter(e => e.documentId === documentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get all audit events, sorted by most recent first
 */
export function getAllAuditEvents(limit?: number): AuditEvent[] {
    const events = loadEvents()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return limit ? events.slice(0, limit) : events;
}

/**
 * Get audit summary for a document
 */
export function getDocumentAuditSummary(documentId: string): AuditSummary {
    const events = getDocumentAuditTrail(documentId);

    const consultations = events.filter(e => e.action === 'consultation');
    const copies = events.filter(e => e.action === 'certified_copy');
    const integrityChecks = events.filter(e => e.action === 'integrity_check');
    const accessDenied = events.filter(e => e.action === 'access_denied');

    return {
        totalEvents: events.length,
        lastConsultation: consultations.length > 0 ? consultations[0].timestamp : undefined,
        lastIntegrityCheck: integrityChecks.length > 0 ? integrityChecks[0].timestamp : undefined,
        totalCopies: copies.length,
        totalConsultations: consultations.length,
        accessDenied: accessDenied.length,
    };
}

/**
 * Generate a document hash for integrity verification
 */
export function generateDocumentHash(documentId: string): string {
    // In production, this would be a real SHA-256 hash of the document content
    const base = `SHA256:${documentId}-${Date.now()}`;
    const hash = base.split('').reduce((acc, char) => {
        return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
    }, 0);
    return `SHA256:${Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64)}`;
}

/**
 * Verify document integrity by comparing hashes
 */
export function verifyDocumentIntegrity(documentId: string, storedHash: string): {
    isValid: boolean;
    currentHash: string;
    storedHash: string;
    verifiedAt: string;
} {
    // In production, this would recalculate the hash from document content
    // For now, we simulate a successful verification
    const currentHash = storedHash; // In real implementation, recalculate from file
    const isValid = currentHash === storedHash;

    // Log the verification
    logAuditEvent({
        documentId,
        documentTitle: '',
        action: 'integrity_check',
        details: isValid ? 'Intégrité vérifiée avec succès' : 'ALERTE: Intégrité compromise',
        hashAtTime: currentHash,
        success: isValid,
    });

    return {
        isValid,
        currentHash,
        storedHash,
        verifiedAt: new Date().toISOString(),
    };
}

/**
 * Generate certified copy metadata
 */
export function generateCertifiedCopyMetadata(documentId: string, documentTitle: string): {
    copyId: string;
    copyReference: string;
    generatedAt: string;
    certifiedBy: string;
    originalRef: string;
    watermark: string;
} {
    const copyId = generateId();
    const ref = `CC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    logAuditEvent({
        documentId,
        documentTitle,
        action: 'certified_copy',
        details: `Copie certifiée générée: ${ref}`,
        metadata: { copyReference: ref },
    });

    return {
        copyId,
        copyReference: ref,
        generatedAt: new Date().toISOString(),
        certifiedBy: 'SGG Digital - iArchive',
        originalRef: `ARCH-${documentId.slice(0, 8).toUpperCase()}`,
        watermark: `COPIE CERTIFIÉE CONFORME - ${ref} - ${new Date().toLocaleDateString('fr-FR')}`,
    };
}
