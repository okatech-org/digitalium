/**
 * Signature Cloud Functions — Certificates & Verification
 *
 * signatureVerifyCertificate, signatureGetCertificate, signatureGetStats
 */

import * as functions from 'firebase-functions';
import { query, queryOne } from '../utils/db';
import { getCallerInfo } from '../archive/helpers';

const REGION = 'europe-west1';

// =============================================================================
// signatureVerifyCertificate — Public: verify a certificate by token
// =============================================================================

export const signatureVerifyCertificate = functions
  .region(REGION)
  .https.onCall(async (data) => {
    const { token, certificateNumber } = data;

    if (!token && !certificateNumber) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Either token or certificateNumber is required.'
      );
    }

    let cert;
    if (token) {
      cert = await queryOne<{
        id: string;
        certificate_number: string;
        document_hash: string;
        signatories_snapshot: unknown;
        is_valid: boolean;
        issued_at: string;
        expires_at: string | null;
        request_id: string;
      }>(
        `SELECT * FROM signature_certificates WHERE verification_token = $1`,
        [token]
      );
    } else {
      cert = await queryOne<{
        id: string;
        certificate_number: string;
        document_hash: string;
        signatories_snapshot: unknown;
        is_valid: boolean;
        issued_at: string;
        expires_at: string | null;
        request_id: string;
      }>(
        `SELECT * FROM signature_certificates WHERE certificate_number = $1`,
        [certificateNumber]
      );
    }

    if (!cert) {
      return { valid: false, error: 'Certificate not found.' };
    }

    // Check validity
    if (!cert.is_valid) {
      return { valid: false, error: 'Certificate has been invalidated.' };
    }

    if (cert.expires_at && new Date(cert.expires_at) < new Date()) {
      return { valid: false, error: 'Certificate has expired.' };
    }

    // Get document title from request
    const request = await queryOne<{ document_title: string; completed_at: string }>(
      `SELECT document_title, completed_at FROM signature_requests WHERE id = $1`,
      [cert.request_id]
    );

    return {
      valid: true,
      certificate: {
        number: cert.certificate_number,
        documentTitle: request?.document_title || 'Unknown',
        documentHash: cert.document_hash,
        signatories: cert.signatories_snapshot,
        issuedAt: cert.issued_at,
        completedAt: request?.completed_at,
      },
    };
  });

// =============================================================================
// signatureGetCertificate — Get certificate for a completed request
// =============================================================================

export const signatureGetCertificate = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { requestId } = data;

    if (!requestId) {
      throw new functions.https.HttpsError('invalid-argument', 'requestId is required.');
    }

    // Verify access
    const request = await queryOne<{ id: string; status: string }>(
      `SELECT sr.id, sr.status FROM signature_requests sr
       LEFT JOIN signature_signatories ss ON sr.id = ss.request_id
       WHERE sr.id = $1
         AND (sr.created_by = $2 OR ss.user_id = $3)
         AND sr.status = 'completed'`,
      [requestId, caller.uid, caller.uid]
    );

    if (!request) {
      throw new functions.https.HttpsError('not-found', 'Completed request not found.');
    }

    const certificate = await queryOne(
      `SELECT * FROM signature_certificates WHERE request_id = $1`,
      [requestId]
    );

    if (!certificate) {
      throw new functions.https.HttpsError('not-found', 'Certificate not yet generated.');
    }

    return { certificate };
  });

// =============================================================================
// signatureGetStats — Signature statistics for the user/org
// =============================================================================

export const signatureGetStats = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);

    let whereClause: string;
    const params: unknown[] = [];

    if (caller.organizationId && caller.level <= 2) {
      whereClause = `(created_by = $1 OR organization_id = $2)`;
      params.push(caller.uid, caller.organizationId);
    } else {
      whereClause = `created_by = $1`;
      params.push(caller.uid);
    }

    // Count by status
    const statusCounts = await query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) as count FROM signature_requests
       WHERE ${whereClause}
       GROUP BY status`,
      params
    );

    // Total signed by current user
    const signedByMe = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM signature_signatories
       WHERE user_id = $1 AND status = 'signed'`,
      [caller.uid]
    );

    // Pending for current user
    const pendingForMe = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM signature_signatories ss
       JOIN signature_requests sr ON ss.request_id = sr.id
       WHERE ss.user_id = $1 AND ss.status = 'pending' AND sr.status = 'pending'`,
      [caller.uid]
    );

    // Average completion time (in hours)
    const avgCompletionParams = caller.organizationId
      ? [caller.uid, caller.organizationId]
      : [caller.uid];
    const avgWhereClause = caller.organizationId
      ? `(created_by = $1 OR organization_id = $2)`
      : `created_by = $1`;

    const avgCompletion = await queryOne<{ avg_hours: string }>(
      `SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as avg_hours
       FROM signature_requests
       WHERE ${avgWhereClause} AND status = 'completed' AND completed_at IS NOT NULL`,
      avgCompletionParams
    );

    // Workflow stats
    const workflowParams = caller.organizationId
      ? [caller.uid, caller.organizationId]
      : [caller.uid];
    const wfWhereClause = caller.organizationId
      ? `(user_id = $1 OR organization_id = $2) AND deleted_at IS NULL`
      : `user_id = $1 AND deleted_at IS NULL`;

    const workflowStats = await queryOne<{ active: string; total_usage: string }>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'active') as active,
         COALESCE(SUM(usage_count), 0) as total_usage
       FROM signature_workflows WHERE ${wfWhereClause}`,
      workflowParams
    );

    // Build status map
    const statusMap: Record<string, number> = {};
    for (const row of statusCounts) {
      statusMap[row.status] = parseInt(row.count, 10);
    }

    return {
      requests: {
        draft: statusMap.draft || 0,
        pending: statusMap.pending || 0,
        completed: statusMap.completed || 0,
        cancelled: statusMap.cancelled || 0,
        expired: statusMap.expired || 0,
        total: Object.values(statusMap).reduce((a, b) => a + b, 0),
      },
      signedByMe: parseInt(signedByMe?.count || '0', 10),
      pendingForMe: parseInt(pendingForMe?.count || '0', 10),
      avgCompletionHours: parseFloat(avgCompletion?.avg_hours || '0'),
      workflows: {
        active: parseInt(workflowStats?.active || '0', 10),
        totalUsage: parseInt(workflowStats?.total_usage || '0', 10),
      },
    };
  });
