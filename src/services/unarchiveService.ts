/**
 * Unarchive Service
 * 
 * Manages unarchive requests with optional validation workflows.
 * Supports direct unarchive (no approval needed) and workflow-based
 * unarchive (requires approval from designated collaborators/roles).
 * 
 * Persists state in localStorage for demo purposes.
 */

// ============================================
// TYPES
// ============================================

export type UnarchiveMode = 'direct' | 'workflow';

export type UnarchiveRequestStatus =
    | 'pending'      // Waiting for approval
    | 'approved'     // All approvals received
    | 'rejected'     // At least one rejection
    | 'completed'    // Document successfully unarchived
    | 'cancelled';   // Request cancelled by initiator

export type ApproverDecision = 'pending' | 'approved' | 'rejected';

export interface UnarchiveApprover {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    role: string;
    decision: ApproverDecision;
    decidedAt?: string;
    comment?: string;
}

export interface UnarchiveRequest {
    id: string;
    documentId: string;
    documentTitle: string;
    documentCategory: string;
    mode: UnarchiveMode;
    status: UnarchiveRequestStatus;
    reason: string;
    targetFolderId?: string;   // Where to move the document after unarchive
    targetModule: 'idocument' | 'custom'; // Where to restore the document
    // Workflow fields
    approvers: UnarchiveApprover[];
    approvalType: 'any' | 'all' | 'majority';
    // Metadata
    initiatedBy: string;
    initiatedByName: string;
    initiatedAt: string;
    completedAt?: string;
    dueDate?: string;
}

export interface UnarchiveWorkflowTemplate {
    id: string;
    name: string;
    description: string;
    approvers: Array<{
        role: string;
        userName: string;
        userEmail: string;
    }>;
    approvalType: 'any' | 'all' | 'majority';
    defaultDueDays: number;
}

// ============================================
// STORAGE
// ============================================

const STORAGE_KEY = 'digitalium-unarchive-requests';

function loadRequests(): UnarchiveRequest[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveRequests(requests: UnarchiveRequest[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch (e) {
        console.error('Failed to save unarchive requests:', e);
    }
}

// ============================================
// WORKFLOW TEMPLATES
// ============================================

export const UNARCHIVE_WORKFLOW_TEMPLATES: UnarchiveWorkflowTemplate[] = [
    {
        id: 'wf-unarchive-simple',
        name: 'Désarchivage Simple',
        description: 'Validation par un responsable. Idéal pour les documents courants.',
        approvers: [
            { role: 'Responsable de service', userName: 'Jean Martin', userEmail: 'jean.martin@company.com' },
        ],
        approvalType: 'any',
        defaultDueDays: 3,
    },
    {
        id: 'wf-unarchive-standard',
        name: 'Désarchivage Standard',
        description: 'Validation par un responsable ET le service Archives. Pour documents de conformité.',
        approvers: [
            { role: 'Responsable de service', userName: 'Jean Martin', userEmail: 'jean.martin@company.com' },
            { role: 'Archiviste', userName: 'Marie Dupont', userEmail: 'marie.dupont@company.com' },
        ],
        approvalType: 'all',
        defaultDueDays: 5,
    },
    {
        id: 'wf-unarchive-legal',
        name: 'Désarchivage Documents Légaux',
        description: 'Circuit renforcé avec approbation juridique. Pour documents sensibles ou légaux.',
        approvers: [
            { role: 'Responsable Juridique', userName: 'Sophie Legal', userEmail: 'sophie.legal@company.com' },
            { role: 'Directeur de service', userName: 'Paul Directeur', userEmail: 'paul.directeur@company.com' },
            { role: 'Archiviste', userName: 'Marie Dupont', userEmail: 'marie.dupont@company.com' },
        ],
        approvalType: 'all',
        defaultDueDays: 7,
    },
    {
        id: 'wf-unarchive-urgent',
        name: 'Désarchivage Urgent',
        description: 'Validation rapide par UN des responsables disponibles. Pour les urgences.',
        approvers: [
            { role: 'Responsable de service', userName: 'Jean Martin', userEmail: 'jean.martin@company.com' },
            { role: 'Directeur Adjoint', userName: 'Anne Sous-Dir', userEmail: 'anne.sousdir@company.com' },
            { role: 'Directeur Général', userName: 'Paul Directeur', userEmail: 'paul.directeur@company.com' },
        ],
        approvalType: 'any',
        defaultDueDays: 1,
    },
];

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Create a new unarchive request
 */
export function createUnarchiveRequest(params: {
    documentId: string;
    documentTitle: string;
    documentCategory: string;
    mode: UnarchiveMode;
    reason: string;
    targetFolderId?: string;
    targetModule?: 'idocument' | 'custom';
    workflowTemplateId?: string;
    customApprovers?: UnarchiveApprover[];
    dueDays?: number;
}): UnarchiveRequest {
    const requests = loadRequests();

    let approvers: UnarchiveApprover[] = [];
    let approvalType: 'any' | 'all' | 'majority' = 'any';

    if (params.mode === 'workflow') {
        if (params.workflowTemplateId) {
            const template = UNARCHIVE_WORKFLOW_TEMPLATES.find(t => t.id === params.workflowTemplateId);
            if (template) {
                approvers = template.approvers.map((a, idx) => ({
                    id: `approver-${Date.now()}-${idx}`,
                    userId: `user-${a.role.toLowerCase().replace(/\s/g, '-')}`,
                    userName: a.userName,
                    userEmail: a.userEmail,
                    role: a.role,
                    decision: 'pending' as const,
                }));
                approvalType = template.approvalType;
            }
        } else if (params.customApprovers) {
            approvers = params.customApprovers;
        }
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (params.dueDays || 5));

    const request: UnarchiveRequest = {
        id: `unarchive-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
        documentId: params.documentId,
        documentTitle: params.documentTitle,
        documentCategory: params.documentCategory,
        mode: params.mode,
        status: params.mode === 'direct' ? 'completed' : 'pending',
        reason: params.reason,
        targetFolderId: params.targetFolderId,
        targetModule: params.targetModule || 'idocument',
        approvers,
        approvalType,
        initiatedBy: 'current-user',
        initiatedByName: 'Utilisateur actuel',
        initiatedAt: new Date().toISOString(),
        completedAt: params.mode === 'direct' ? new Date().toISOString() : undefined,
        dueDate: dueDate.toISOString(),
    };

    requests.push(request);
    saveRequests(requests);

    return request;
}

/**
 * Get all unarchive requests
 */
export function getUnarchiveRequests(): UnarchiveRequest[] {
    return loadRequests();
}

/**
 * Get pending unarchive requests
 */
export function getPendingUnarchiveRequests(): UnarchiveRequest[] {
    return loadRequests().filter(r => r.status === 'pending');
}

/**
 * Get unarchive requests for a specific document
 */
export function getUnarchiveRequestsForDocument(documentId: string): UnarchiveRequest[] {
    return loadRequests().filter(r => r.documentId === documentId);
}

/**
 * Approve an unarchive request (for a specific approver)
 */
export function approveUnarchiveRequest(
    requestId: string,
    approverId: string,
    comment?: string
): UnarchiveRequest | null {
    const requests = loadRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request) return null;

    const approver = request.approvers.find(a => a.id === approverId);
    if (!approver) return null;

    approver.decision = 'approved';
    approver.decidedAt = new Date().toISOString();
    approver.comment = comment;

    // Check if workflow is complete
    const approvedCount = request.approvers.filter(a => a.decision === 'approved').length;
    const totalCount = request.approvers.length;
    const majorityCount = Math.ceil(totalCount / 2);

    let isComplete = false;
    switch (request.approvalType) {
        case 'any':
            isComplete = approvedCount >= 1;
            break;
        case 'all':
            isComplete = approvedCount === totalCount;
            break;
        case 'majority':
            isComplete = approvedCount >= majorityCount;
            break;
    }

    if (isComplete) {
        request.status = 'approved';
        request.completedAt = new Date().toISOString();
    }

    saveRequests(requests);
    return request;
}

/**
 * Reject an unarchive request
 */
export function rejectUnarchiveRequest(
    requestId: string,
    approverId: string,
    comment: string
): UnarchiveRequest | null {
    const requests = loadRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request) return null;

    const approver = request.approvers.find(a => a.id === approverId);
    if (!approver) return null;

    approver.decision = 'rejected';
    approver.decidedAt = new Date().toISOString();
    approver.comment = comment;

    request.status = 'rejected';
    request.completedAt = new Date().toISOString();

    saveRequests(requests);
    return request;
}

/**
 * Cancel an unarchive request
 */
export function cancelUnarchiveRequest(requestId: string): boolean {
    const requests = loadRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request || request.status !== 'pending') return false;

    request.status = 'cancelled';
    request.completedAt = new Date().toISOString();
    saveRequests(requests);
    return true;
}

/**
 * Mark a completed approval as fully completed (document moved)
 */
export function completeUnarchive(requestId: string): boolean {
    const requests = loadRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request || (request.status !== 'approved' && request.mode !== 'direct')) return false;

    request.status = 'completed';
    request.completedAt = new Date().toISOString();
    saveRequests(requests);
    return true;
}

/**
 * Check if a document has a pending unarchive request
 */
export function hasPendingUnarchiveRequest(documentId: string): boolean {
    return loadRequests().some(
        r => r.documentId === documentId && r.status === 'pending'
    );
}
