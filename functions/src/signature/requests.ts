/**
 * Signature Cloud Functions — Requests
 *
 * signatureCreateRequest, signatureGetRequests, signatureGetRequest,
 * signatureCancelRequest, signatureSendReminder
 */

import * as functions from 'firebase-functions';
import { query, queryOne, execute } from '../utils/db';
import { getCallerInfo } from '../archive/helpers';
import { logSignatureAudit } from './helpers';

const REGION = 'europe-west1';

// =============================================================================
// signatureCreateRequest — Create a new signature request
// =============================================================================

export const signatureCreateRequest = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const {
      documentId,
      documentTitle,
      documentHash,
      message,
      priority = 'normal',
      expiresAt,
      signatories = [],
    } = data;

    if (!documentTitle) {
      throw new functions.https.HttpsError('invalid-argument', 'documentTitle is required.');
    }

    if (!signatories.length) {
      throw new functions.https.HttpsError('invalid-argument', 'At least one signatory is required.');
    }

    try {
      // Create the request
      const request = await queryOne<{ id: string }>(
        `INSERT INTO signature_requests (document_id, document_title, document_hash, status, message, priority, created_by, organization_id, expires_at)
         VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          documentId || null,
          documentTitle,
          documentHash || null,
          message || null,
          priority,
          caller.uid,
          caller.organizationId,
          expiresAt || null,
        ]
      );

      if (!request) {
        throw new functions.https.HttpsError('internal', 'Failed to create signature request.');
      }

      // Insert signatories
      for (const sig of signatories) {
        await execute(
          `INSERT INTO signature_signatories (request_id, user_id, user_name, user_email, user_avatar, role, sign_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            request.id,
            sig.userId || null,
            sig.userName,
            sig.userEmail,
            sig.userAvatar || null,
            sig.role || null,
            sig.order || 1,
          ]
        );
      }

      await logSignatureAudit(caller.uid, 'created', request.id, null, null, {
        documentTitle,
        signatoryCount: signatories.length,
        priority,
      });

      // Return the full request
      const fullRequest = await queryOne(
        `SELECT * FROM signature_requests WHERE id = $1`,
        [request.id]
      );

      const sigs = await query(
        `SELECT * FROM signature_signatories WHERE request_id = $1 ORDER BY sign_order`,
        [request.id]
      );

      return { request: fullRequest, signatories: sigs };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error;
      functions.logger.error('Error creating signature request:', error);
      throw new functions.https.HttpsError('internal', 'Failed to create signature request.');
    }
  });

// =============================================================================
// signatureGetRequests — Get signature requests for the current user
// =============================================================================

export const signatureGetRequests = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { filter = 'all', limit = 50, offset = 0 } = data || {};

    let sql: string;
    const params: unknown[] = [];
    let idx = 1;

    switch (filter) {
      case 'to_sign':
        // Documents awaiting current user's signature
        sql = `SELECT DISTINCT sr.* FROM signature_requests sr
               JOIN signature_signatories ss ON sr.id = ss.request_id
               WHERE ss.user_id = $${idx} AND ss.status = 'pending' AND sr.status = 'pending'`;
        params.push(caller.uid);
        idx++;
        break;

      case 'pending':
        // Requests created by user, still pending
        sql = `SELECT * FROM signature_requests
               WHERE created_by = $${idx} AND status = 'pending'`;
        params.push(caller.uid);
        idx++;
        break;

      case 'completed':
        // Completed requests (created by or signatory of)
        sql = `SELECT DISTINCT sr.* FROM signature_requests sr
               LEFT JOIN signature_signatories ss ON sr.id = ss.request_id
               WHERE sr.status = 'completed'
                 AND (sr.created_by = $${idx} OR ss.user_id = $${idx + 1})`;
        params.push(caller.uid, caller.uid);
        idx += 2;
        break;

      default:
        // All requests involving the user
        if (caller.organizationId && caller.level <= 2) {
          // Org admins see all org requests
          sql = `SELECT DISTINCT sr.* FROM signature_requests sr
                 LEFT JOIN signature_signatories ss ON sr.id = ss.request_id
                 WHERE (sr.created_by = $${idx} OR ss.user_id = $${idx + 1} OR sr.organization_id = $${idx + 2})`;
          params.push(caller.uid, caller.uid, caller.organizationId);
          idx += 3;
        } else {
          sql = `SELECT DISTINCT sr.* FROM signature_requests sr
                 LEFT JOIN signature_signatories ss ON sr.id = ss.request_id
                 WHERE (sr.created_by = $${idx} OR ss.user_id = $${idx + 1})`;
          params.push(caller.uid, caller.uid);
          idx += 2;
        }
    }

    sql += ` ORDER BY sr.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const requests = await query(sql, params);

    // Fetch signatories for each request
    const requestIds = (requests as { id: string }[]).map(r => r.id);
    let signatories: unknown[] = [];
    if (requestIds.length > 0) {
      const placeholders = requestIds.map((_, i) => `$${i + 1}`).join(',');
      signatories = await query(
        `SELECT * FROM signature_signatories WHERE request_id IN (${placeholders}) ORDER BY sign_order`,
        requestIds
      );
    }

    // Fetch creator profiles
    const creatorIds = [...new Set((requests as { created_by: string }[]).map(r => r.created_by))];
    let profiles: unknown[] = [];
    if (creatorIds.length > 0) {
      const placeholders = creatorIds.map((_, i) => `$${i + 1}`).join(',');
      profiles = await query(
        `SELECT user_id, display_name, email, photo_url FROM profiles WHERE user_id IN (${placeholders})`,
        creatorIds
      );
    }

    return { requests, signatories, profiles };
  });

// =============================================================================
// signatureGetRequest — Get a single signature request with details
// =============================================================================

export const signatureGetRequest = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { requestId } = data;

    if (!requestId) {
      throw new functions.https.HttpsError('invalid-argument', 'requestId is required.');
    }

    // Verify access: creator, signatory, or org admin
    const request = await queryOne(
      `SELECT sr.* FROM signature_requests sr
       LEFT JOIN signature_signatories ss ON sr.id = ss.request_id
       WHERE sr.id = $1
         AND (sr.created_by = $2 OR ss.user_id = $3 OR sr.organization_id = $4)`,
      [requestId, caller.uid, caller.uid, caller.organizationId]
    );

    if (!request) {
      throw new functions.https.HttpsError('not-found', 'Signature request not found.');
    }

    const signatories = await query(
      `SELECT * FROM signature_signatories WHERE request_id = $1 ORDER BY sign_order`,
      [requestId]
    );

    // Get creator profile
    const creator = await queryOne(
      `SELECT user_id, display_name, email, photo_url FROM profiles WHERE user_id = $1`,
      [(request as { created_by: string }).created_by]
    );

    // Get audit logs
    const auditLogs = await query(
      `SELECT * FROM signature_audit_logs WHERE request_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [requestId]
    );

    // Get certificate if completed
    const certificate = await queryOne(
      `SELECT * FROM signature_certificates WHERE request_id = $1`,
      [requestId]
    );

    return { request, signatories, creator, auditLogs, certificate };
  });

// =============================================================================
// signatureCancelRequest — Cancel a pending signature request
// =============================================================================

export const signatureCancelRequest = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { requestId, reason } = data;

    if (!requestId) {
      throw new functions.https.HttpsError('invalid-argument', 'requestId is required.');
    }

    // Verify ownership
    const request = await queryOne<{ id: string; status: string }>(
      `SELECT id, status FROM signature_requests
       WHERE id = $1 AND created_by = $2`,
      [requestId, caller.uid]
    );

    if (!request) {
      throw new functions.https.HttpsError('not-found', 'Signature request not found.');
    }

    if (request.status !== 'pending' && request.status !== 'draft') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        `Cannot cancel a request with status: ${request.status}`
      );
    }

    await execute(
      `UPDATE signature_requests SET status = 'cancelled', cancelled_at = NOW(), cancelled_reason = $2
       WHERE id = $1`,
      [requestId, reason || null]
    );

    // Cancel all pending signatories
    await execute(
      `UPDATE signature_signatories SET status = 'expired'
       WHERE request_id = $1 AND status = 'pending'`,
      [requestId]
    );

    await logSignatureAudit(caller.uid, 'cancelled', requestId, null, null, { reason });

    return { success: true };
  });

// =============================================================================
// signatureSendReminder — Send reminder to pending signatories
// =============================================================================

export const signatureSendReminder = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { requestId, signatoryId } = data;

    if (!requestId) {
      throw new functions.https.HttpsError('invalid-argument', 'requestId is required.');
    }

    // Verify ownership
    const request = await queryOne<{ id: string; status: string }>(
      `SELECT id, status FROM signature_requests
       WHERE id = $1 AND created_by = $2 AND status = 'pending'`,
      [requestId, caller.uid]
    );

    if (!request) {
      throw new functions.https.HttpsError('not-found', 'Active signature request not found.');
    }

    // Update reminder timestamp(s)
    if (signatoryId) {
      // Remind specific signatory
      await execute(
        `UPDATE signature_signatories SET last_reminder_at = NOW(), reminder_count = reminder_count + 1
         WHERE id = $1 AND request_id = $2 AND status = 'pending'`,
        [signatoryId, requestId]
      );
    } else {
      // Remind all pending signatories
      await execute(
        `UPDATE signature_signatories SET last_reminder_at = NOW(), reminder_count = reminder_count + 1
         WHERE request_id = $1 AND status = 'pending'`,
        [requestId]
      );
    }

    await logSignatureAudit(caller.uid, 'reminded', requestId, signatoryId || null, null, {
      remindAll: !signatoryId,
    });

    // TODO: Send email/push notifications
    return { success: true };
  });
