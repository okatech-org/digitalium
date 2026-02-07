/**
 * Archive Cloud Functions — Sharing
 *
 * archiveShareDocument, archiveGetShares, archiveRevokeShare, archiveAccessShared
 */

import * as functions from 'firebase-functions';
import { query, queryOne, execute } from '../utils/db';
import { getCallerInfo, logArchiveAudit } from './helpers';

const REGION = 'europe-west1';

// =============================================================================
// archiveShareDocument — Create a share link/invitation
// =============================================================================

export const archiveShareDocument = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { documentId, shareToken, permission = 'view', expiresAt, maxAccessCount, password, sharedWithEmail } = data;

    if (!documentId || !shareToken) {
      throw new functions.https.HttpsError('invalid-argument', 'documentId and shareToken are required.');
    }

    // Verify ownership
    const doc = await queryOne(
      `SELECT id FROM archive_documents
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3) AND deleted_at IS NULL`,
      [documentId, caller.uid, caller.organizationId]
    );

    if (!doc) {
      throw new functions.https.HttpsError('not-found', 'Document not found.');
    }

    // Find user by email if sharing to a specific user
    let sharedWithUserId: string | null = null;
    if (sharedWithEmail) {
      const targetUser = await queryOne<{ user_id: string }>(
        `SELECT user_id FROM profiles WHERE email = $1`,
        [sharedWithEmail]
      );
      sharedWithUserId = targetUser?.user_id || null;
    }

    // Simple password hash (for production, use bcrypt)
    let passwordHash: string | null = null;
    if (password) {
      // Using SHA-256 as a simple hash for share passwords
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
      passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    try {
      const share = await queryOne(
        `INSERT INTO document_shares (document_id, shared_by, shared_with, share_token, password_hash, permission, expires_at, max_access_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          documentId,
          caller.uid,
          sharedWithUserId,
          shareToken,
          passwordHash,
          permission,
          expiresAt || null,
          maxAccessCount || null,
        ]
      );

      await logArchiveAudit(caller.uid, 'share', documentId, null, {
        permission,
        sharedWithEmail,
        hasPassword: !!password,
        expiresAt,
      });

      return { share };
    } catch (error) {
      functions.logger.error('Error sharing document:', error);
      throw new functions.https.HttpsError('internal', 'Failed to share document.');
    }
  });

// =============================================================================
// archiveGetShares — Get all shares for a document
// =============================================================================

export const archiveGetShares = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { documentId } = data;

    if (!documentId) {
      throw new functions.https.HttpsError('invalid-argument', 'documentId is required.');
    }

    // Verify ownership
    const doc = await queryOne(
      `SELECT id FROM archive_documents
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3)`,
      [documentId, caller.uid, caller.organizationId]
    );

    if (!doc) {
      throw new functions.https.HttpsError('not-found', 'Document not found.');
    }

    const shares = await query(
      `SELECT ds.*, p.display_name as shared_with_name, p.email as shared_with_email
       FROM document_shares ds
       LEFT JOIN profiles p ON ds.shared_with = p.user_id
       WHERE ds.document_id = $1
       ORDER BY ds.created_at DESC`,
      [documentId]
    );

    return { shares };
  });

// =============================================================================
// archiveRevokeShare — Deactivate a share
// =============================================================================

export const archiveRevokeShare = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { shareId } = data;

    if (!shareId) {
      throw new functions.https.HttpsError('invalid-argument', 'shareId is required.');
    }

    // Verify caller owns the share
    const share = await queryOne<{ id: string; document_id: string }>(
      `SELECT ds.id, ds.document_id FROM document_shares ds
       JOIN archive_documents ad ON ds.document_id = ad.id
       WHERE ds.id = $1 AND (ad.user_id = $2 OR ad.organization_id = $3)`,
      [shareId, caller.uid, caller.organizationId]
    );

    if (!share) {
      throw new functions.https.HttpsError('not-found', 'Share not found.');
    }

    await execute(
      `UPDATE document_shares SET is_active = false WHERE id = $1`,
      [shareId]
    );

    await logArchiveAudit(caller.uid, 'unshare', share.document_id, null, { shareId });

    return { success: true };
  });

// =============================================================================
// archiveAccessShared — Access a shared document by token (public)
// =============================================================================

export const archiveAccessShared = functions
  .region(REGION)
  .https.onCall(async (data, _context) => {
    const { token, password } = data;

    if (!token) {
      throw new functions.https.HttpsError('invalid-argument', 'token is required.');
    }

    const share = await queryOne<{
      id: string;
      document_id: string;
      password_hash: string | null;
      permission: string;
      expires_at: string | null;
      max_access_count: number | null;
      access_count: number;
      is_active: boolean;
    }>(
      `SELECT * FROM document_shares WHERE share_token = $1`,
      [token]
    );

    if (!share || !share.is_active) {
      throw new functions.https.HttpsError('not-found', 'Share link not found or inactive.');
    }

    // Check expiration
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      throw new functions.https.HttpsError('failed-precondition', 'Share link has expired.');
    }

    // Check access count
    if (share.max_access_count && share.access_count >= share.max_access_count) {
      throw new functions.https.HttpsError('resource-exhausted', 'Share link has reached max access count.');
    }

    // Check password
    if (share.password_hash) {
      if (!password) {
        throw new functions.https.HttpsError('unauthenticated', 'Password required.');
      }
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
      const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (hash !== share.password_hash) {
        throw new functions.https.HttpsError('permission-denied', 'Invalid password.');
      }
    }

    // Get document
    const document = await queryOne(
      `SELECT * FROM archive_documents WHERE id = $1`,
      [share.document_id]
    );

    if (!document) {
      throw new functions.https.HttpsError('not-found', 'Document not found.');
    }

    // Increment access count
    await execute(
      `UPDATE document_shares SET access_count = access_count + 1, last_accessed_at = NOW()
       WHERE id = $1`,
      [share.id]
    );

    const doc = document as { storage_url: string };
    return { document, url: doc.storage_url || '' };
  });
