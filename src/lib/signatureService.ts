/**
 * Signature Service - Cloud Functions Implementation
 *
 * Frontend service layer for iSignature module.
 * All database operations go through Cloud Functions.
 *
 * Tables: signature_requests, signature_signatories, signature_workflows,
 *         signature_workflow_steps, signature_audit_logs, signature_certificates
 */

import { functions } from '@/config/firebase';
import { httpsCallable } from 'firebase/functions';

// =============================================================================
// Types
// =============================================================================

export type SignatureRequestStatus = 'draft' | 'pending' | 'completed' | 'cancelled' | 'expired';
export type SignatoryStatus = 'pending' | 'signed' | 'declined' | 'expired';
export type SignatureMethod = 'draw' | 'type' | 'upload';
export type WorkflowStatus = 'active' | 'inactive' | 'archived';

export interface SignatureRequest {
  id: string;
  document_id?: string;
  document_title: string;
  document_hash?: string;
  status: SignatureRequestStatus;
  message?: string;
  priority: string;
  created_by: string;
  organization_id?: string;
  expires_at?: string;
  completed_at?: string;
  certificate_url?: string;
  certificate_hash?: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  cancelled_reason?: string;
}

export interface SignatureSignatory {
  id: string;
  request_id: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  role?: string;
  sign_order: number;
  status: SignatoryStatus;
  signature_method?: SignatureMethod;
  signature_data?: string;
  signed_at?: string;
  ip_address?: string;
  user_agent?: string;
  decline_reason?: string;
  declined_at?: string;
  last_reminder_at?: string;
  reminder_count: number;
  created_at: string;
  updated_at: string;
}

export interface SignatureWorkflow {
  id: string;
  user_id: string;
  organization_id?: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface SignatureWorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  role: string;
  action: string;
  is_required: boolean;
  default_user_id?: string;
  default_user_name?: string;
  default_user_email?: string;
  created_at: string;
}

export interface SignatureCertificate {
  id: string;
  request_id: string;
  certificate_number: string;
  document_hash: string;
  signed_document_hash?: string;
  signatories_snapshot: unknown;
  verification_token: string;
  is_valid: boolean;
  invalidated_at?: string;
  invalidated_reason?: string;
  issued_at: string;
  expires_at?: string;
}

export interface SignatureAuditLog {
  id: number;
  user_id?: string;
  ip_address?: string;
  request_id?: string;
  signatory_id?: string;
  workflow_id?: string;
  action: string;
  action_details: Record<string, unknown>;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  display_name: string;
  email: string;
  photo_url?: string;
}

export interface SignatureStats {
  requests: {
    draft: number;
    pending: number;
    completed: number;
    cancelled: number;
    expired: number;
    total: number;
  };
  signedByMe: number;
  pendingForMe: number;
  avgCompletionHours: number;
  workflows: {
    active: number;
    totalUsage: number;
  };
}

export interface CertificateVerification {
  valid: boolean;
  error?: string;
  certificate?: {
    number: string;
    documentTitle: string;
    documentHash: string;
    signatories: unknown;
    issuedAt: string;
    completedAt?: string;
  };
}

// =============================================================================
// Signatory input for creating requests
// =============================================================================

export interface SignatoryInput {
  userId?: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role?: string;
  order: number;
}

// =============================================================================
// Workflow step input for creating workflows
// =============================================================================

export interface WorkflowStepInput {
  order: number;
  role: string;
  action?: string;
  isRequired?: boolean;
  defaultUserId?: string;
  defaultUserName?: string;
  defaultUserEmail?: string;
}

// =============================================================================
// Cloud Function callable references
// =============================================================================

// Requests
const createRequestFn = httpsCallable<
  {
    documentId?: string;
    documentTitle: string;
    documentHash?: string;
    message?: string;
    priority?: string;
    expiresAt?: string;
    signatories: SignatoryInput[];
  },
  { request: SignatureRequest; signatories: SignatureSignatory[] }
>(functions, 'signatureCreateRequest');

const getRequestsFn = httpsCallable<
  { filter?: string; limit?: number; offset?: number },
  { requests: SignatureRequest[]; signatories: SignatureSignatory[]; profiles: UserProfile[] }
>(functions, 'signatureGetRequests');

const getRequestFn = httpsCallable<
  { requestId: string },
  {
    request: SignatureRequest;
    signatories: SignatureSignatory[];
    creator: UserProfile | null;
    auditLogs: SignatureAuditLog[];
    certificate: SignatureCertificate | null;
  }
>(functions, 'signatureGetRequest');

const cancelRequestFn = httpsCallable<
  { requestId: string; reason?: string },
  { success: boolean }
>(functions, 'signatureCancelRequest');

const sendReminderFn = httpsCallable<
  { requestId: string; signatoryId?: string },
  { success: boolean }
>(functions, 'signatureSendReminder');

// Signing
const signDocumentFn = httpsCallable<
  { requestId: string; signatureData: string; signatureMethod?: string },
  { success: boolean; requestCompleted: boolean }
>(functions, 'signatureSignDocument');

const declineDocumentFn = httpsCallable<
  { requestId: string; reason: string },
  { success: boolean }
>(functions, 'signatureDeclineDocument');

// Workflows
const getWorkflowsFn = httpsCallable<
  Record<string, never>,
  { workflows: SignatureWorkflow[]; steps: SignatureWorkflowStep[] }
>(functions, 'signatureGetWorkflows');

const createWorkflowFn = httpsCallable<
  { name: string; description?: string; steps: WorkflowStepInput[] },
  { workflow: SignatureWorkflow; steps: SignatureWorkflowStep[] }
>(functions, 'signatureCreateWorkflow');

const updateWorkflowFn = httpsCallable<
  {
    workflowId: string;
    name?: string;
    description?: string;
    status?: string;
    steps?: WorkflowStepInput[];
  },
  { success: boolean }
>(functions, 'signatureUpdateWorkflow');

const deleteWorkflowFn = httpsCallable<
  { workflowId: string },
  { success: boolean }
>(functions, 'signatureDeleteWorkflow');

const launchWorkflowFn = httpsCallable<
  {
    workflowId: string;
    documentId?: string;
    documentTitle: string;
    documentHash?: string;
    message?: string;
    expiresAt?: string;
    signatoryOverrides?: Record<string, { userId?: string; userName?: string; userEmail?: string }>;
  },
  { requestId: string; success: boolean }
>(functions, 'signatureLaunchWorkflow');

// Certificates & Stats
const verifyCertificateFn = httpsCallable<
  { token?: string; certificateNumber?: string },
  CertificateVerification
>(functions, 'signatureVerifyCertificate');

const getCertificateFn = httpsCallable<
  { requestId: string },
  { certificate: SignatureCertificate }
>(functions, 'signatureGetCertificate');

const getStatsFn = httpsCallable<
  Record<string, never>,
  SignatureStats
>(functions, 'signatureGetStats');

// =============================================================================
// Public API
// =============================================================================

export const signatureService = {
  // ── Requests ───────────────────────────────────────────────────────────────
  async createRequest(params: {
    documentId?: string;
    documentTitle: string;
    documentHash?: string;
    message?: string;
    priority?: string;
    expiresAt?: string;
    signatories: SignatoryInput[];
  }) {
    const result = await createRequestFn(params);
    return result.data;
  },

  async getRequests(filter: 'all' | 'to_sign' | 'pending' | 'completed' = 'all', limit = 50, offset = 0) {
    const result = await getRequestsFn({ filter, limit, offset });
    return result.data;
  },

  async getRequest(requestId: string) {
    const result = await getRequestFn({ requestId });
    return result.data;
  },

  async cancelRequest(requestId: string, reason?: string) {
    const result = await cancelRequestFn({ requestId, reason });
    return result.data;
  },

  async sendReminder(requestId: string, signatoryId?: string) {
    const result = await sendReminderFn({ requestId, signatoryId });
    return result.data;
  },

  // ── Signing ────────────────────────────────────────────────────────────────
  async signDocument(requestId: string, signatureData: string, signatureMethod: SignatureMethod = 'draw') {
    const result = await signDocumentFn({ requestId, signatureData, signatureMethod });
    return result.data;
  },

  async declineDocument(requestId: string, reason: string) {
    const result = await declineDocumentFn({ requestId, reason });
    return result.data;
  },

  // ── Workflows ──────────────────────────────────────────────────────────────
  async getWorkflows() {
    const result = await getWorkflowsFn({});
    return result.data;
  },

  async createWorkflow(name: string, description: string, steps: WorkflowStepInput[]) {
    const result = await createWorkflowFn({ name, description, steps });
    return result.data;
  },

  async updateWorkflow(workflowId: string, updates: {
    name?: string;
    description?: string;
    status?: string;
    steps?: WorkflowStepInput[];
  }) {
    const result = await updateWorkflowFn({ workflowId, ...updates });
    return result.data;
  },

  async deleteWorkflow(workflowId: string) {
    const result = await deleteWorkflowFn({ workflowId });
    return result.data;
  },

  async launchWorkflow(params: {
    workflowId: string;
    documentId?: string;
    documentTitle: string;
    documentHash?: string;
    message?: string;
    expiresAt?: string;
    signatoryOverrides?: Record<string, { userId?: string; userName?: string; userEmail?: string }>;
  }) {
    const result = await launchWorkflowFn(params);
    return result.data;
  },

  // ── Certificates & Stats ───────────────────────────────────────────────────
  async verifyCertificate(tokenOrNumber: string, isToken = true) {
    const params = isToken
      ? { token: tokenOrNumber }
      : { certificateNumber: tokenOrNumber };
    const result = await verifyCertificateFn(params);
    return result.data;
  },

  async getCertificate(requestId: string) {
    const result = await getCertificateFn({ requestId });
    return result.data;
  },

  async getStats() {
    const result = await getStatsFn({});
    return result.data;
  },
};

export default signatureService;
