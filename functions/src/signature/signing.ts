/**
 * Signature Cloud Functions — Signing Actions
 *
 * signatureSignDocument, signatureDeclineDocument
 */

import * as functions from 'firebase-functions';
import { query, queryOne, execute } from '../utils/db';
import { getCallerInfo } from '../archive/helpers';
import { logSignatureAudit, generateCertificateNumber, generateVerificationToken } from './helpers';

const REGION = 'europe-west1';

// =============================================================================
// signatureSignDocument — Sign a document (record the signature)
// =============================================================================

export const signatureSignDocument = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { requestId, signatureData, signatureMethod = 'draw' } = data;

    if (!requestId) {
      throw new functions.https.HttpsError('invalid-argument', 'requestId is required.');
    }

    if (!signatureData) {
      throw new functions.https.HttpsError('invalid-argument', 'signatureData is required.');
    }

    // Find the pending signatory for this user
    const signatory = await queryOne<{
      id: string;
      request_id: string;
      sign_order: number;
      status: string;
    }>(
      `SELECT ss.id, ss.request_id, ss.sign_order, ss.status
       FROM signature_signatories ss
       JOIN signature_requests sr ON ss.request_id = sr.id
       WHERE ss.request_id = $1 AND ss.user_id = $2 AND sr.status = 'pending'`,
      [requestId, caller.uid]
    );

    if (!signatory) {
      throw new functions.https.HttpsError('not-found', 'No pending signature found for this user.');
    }

    if (signatory.status !== 'pending') {
      throw new functions.https.HttpsError('failed-precondition', 'Signature already processed.');
    }

    // Check sequential order: all previous signatories must have signed
    const unsignedBefore = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM signature_signatories
       WHERE request_id = $1 AND sign_order < $2 AND status != 'signed'`,
      [requestId, signatory.sign_order]
    );

    if (unsignedBefore && parseInt(unsignedBefore.count, 10) > 0) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Previous signatories have not yet signed.'
      );
    }

    // Get IP from context (if available via request)
    const ipAddress = null; // Cloud Functions doesn't easily expose client IP

    // Record the signature
    await execute(
      `UPDATE signature_signatories
       SET status = 'signed',
           signature_method = $2,
           signature_data = $3,
           signed_at = NOW(),
           ip_address = $4
       WHERE id = $1`,
      [signatory.id, signatureMethod, signatureData, ipAddress]
    );

    // The trigger check_signature_completion will auto-complete the request if all signed

    await logSignatureAudit(caller.uid, 'signed', requestId, signatory.id, null, {
      signatureMethod,
    });

    // Check if this was the last signature (request now completed)
    const updatedRequest = await queryOne<{ id: string; status: string }>(
      `SELECT id, status FROM signature_requests WHERE id = $1`,
      [requestId]
    );

    // If completed, generate certificate
    if (updatedRequest && updatedRequest.status === 'completed') {
      await generateCertificate(requestId);
    }

    return {
      success: true,
      requestCompleted: updatedRequest?.status === 'completed',
    };
  });

// =============================================================================
// signatureDeclineDocument — Decline to sign a document
// =============================================================================

export const signatureDeclineDocument = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { requestId, reason } = data;

    if (!requestId) {
      throw new functions.https.HttpsError('invalid-argument', 'requestId is required.');
    }

    if (!reason || !reason.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'A reason is required to decline.');
    }

    // Find the pending signatory for this user
    const signatory = await queryOne<{ id: string; status: string }>(
      `SELECT ss.id, ss.status
       FROM signature_signatories ss
       JOIN signature_requests sr ON ss.request_id = sr.id
       WHERE ss.request_id = $1 AND ss.user_id = $2 AND sr.status = 'pending'`,
      [requestId, caller.uid]
    );

    if (!signatory) {
      throw new functions.https.HttpsError('not-found', 'No pending signature found for this user.');
    }

    if (signatory.status !== 'pending') {
      throw new functions.https.HttpsError('failed-precondition', 'Signature already processed.');
    }

    // Record the decline
    await execute(
      `UPDATE signature_signatories
       SET status = 'declined', decline_reason = $2, declined_at = NOW()
       WHERE id = $1`,
      [signatory.id, reason]
    );

    await logSignatureAudit(caller.uid, 'declined', requestId, signatory.id, null, { reason });

    return { success: true };
  });

// =============================================================================
// Internal: Generate signature certificate
// =============================================================================

async function generateCertificate(requestId: string): Promise<void> {
  try {
    const request = await queryOne<{ document_hash: string; document_title: string }>(
      `SELECT document_hash, document_title FROM signature_requests WHERE id = $1`,
      [requestId]
    );

    if (!request) return;

    const signatories = await query<{
      user_name: string;
      user_email: string;
      role: string;
      signature_method: string;
      signed_at: string;
      ip_address: string;
      sign_order: number;
    }>(
      `SELECT user_name, user_email, role, signature_method, signed_at, ip_address, sign_order
       FROM signature_signatories
       WHERE request_id = $1
       ORDER BY sign_order`,
      [requestId]
    );

    const certNumber = generateCertificateNumber();
    const verificationToken = generateVerificationToken();

    await execute(
      `INSERT INTO signature_certificates (request_id, certificate_number, document_hash, signatories_snapshot, verification_token)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        requestId,
        certNumber,
        request.document_hash || '',
        JSON.stringify(signatories),
        verificationToken,
      ]
    );

    // Update request with certificate reference
    await execute(
      `UPDATE signature_requests SET certificate_url = $2 WHERE id = $1`,
      [requestId, `/certificates/${certNumber}`]
    );

    // Log audit
    await logSignatureAudit('system', 'certificate_generated', requestId, null, null, {
      certificateNumber: certNumber,
    });
  } catch (error) {
    functions.logger.error('Failed to generate certificate:', error);
  }
}
