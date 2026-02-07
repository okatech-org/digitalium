/**
 * Archive Cloud Functions — Audit, Stats & Retention
 *
 * archiveLogAudit, archiveGetAuditLogs, archiveGetStats,
 * archiveGetRetentionPolicies, archiveGetExpiringDocuments
 */

import * as functions from 'firebase-functions';
import { query, queryOne, execute } from '../utils/db';
import { getCallerInfo } from './helpers';

const REGION = 'europe-west1';

// =============================================================================
// archiveLogAudit — Log an audit event (called from frontend)
// =============================================================================

export const archiveLogAudit = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { documentId, folderId, action, details = {} } = data;

    if (!action) {
      throw new functions.https.HttpsError('invalid-argument', 'action is required.');
    }

    try {
      await execute(
        `INSERT INTO archive_audit_logs (user_id, document_id, folder_id, action, action_details)
         VALUES ($1, $2, $3, $4, $5)`,
        [caller.uid, documentId || null, folderId || null, action, JSON.stringify(details)]
      );

      return { success: true };
    } catch (error) {
      functions.logger.warn('Failed to log audit:', error);
      // Don't throw — audit logging should not block user operations
      return { success: false };
    }
  });

// =============================================================================
// archiveGetAuditLogs — Retrieve audit logs
// =============================================================================

export const archiveGetAuditLogs = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { documentId, limit = 100, offset = 0 } = data || {};

    let sql: string;
    const params: unknown[] = [];
    let idx = 1;

    if (documentId) {
      // Audit logs for a specific document
      sql = `SELECT aal.*, p.display_name as user_name, p.email as user_email
             FROM archive_audit_logs aal
             LEFT JOIN profiles p ON aal.user_id = p.user_id
             WHERE aal.document_id = $${idx}`;
      params.push(documentId);
      idx++;

      // Verify caller can access this document
      const doc = await queryOne(
        `SELECT id FROM archive_documents
         WHERE id = $1 AND (user_id = $2 OR organization_id = $3)`,
        [documentId, caller.uid, caller.organizationId]
      );
      if (!doc && caller.level > 1) {
        throw new functions.https.HttpsError('permission-denied', 'Access denied.');
      }
    } else {
      // All audit logs for the user (or org)
      if (caller.organizationId && caller.level <= 2) {
        // Org admins see all org activity
        sql = `SELECT aal.*, p.display_name as user_name, p.email as user_email
               FROM archive_audit_logs aal
               LEFT JOIN profiles p ON aal.user_id = p.user_id
               LEFT JOIN archive_documents ad ON aal.document_id = ad.id
               WHERE (aal.user_id = $${idx} OR ad.organization_id = $${idx + 1})`;
        params.push(caller.uid, caller.organizationId);
        idx += 2;
      } else {
        sql = `SELECT aal.*, p.display_name as user_name, p.email as user_email
               FROM archive_audit_logs aal
               LEFT JOIN profiles p ON aal.user_id = p.user_id
               WHERE aal.user_id = $${idx}`;
        params.push(caller.uid);
        idx++;
      }
    }

    sql += ` ORDER BY aal.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const logs = await query(sql, params);
    return { logs };
  });

// =============================================================================
// archiveGetStats — Storage and document statistics
// =============================================================================

export const archiveGetStats = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);

    let whereClause: string;
    const params: unknown[] = [];

    if (caller.organizationId) {
      whereClause = `(user_id = $1 OR organization_id = $2) AND deleted_at IS NULL`;
      params.push(caller.uid, caller.organizationId);
    } else {
      whereClause = `user_id = $1 AND deleted_at IS NULL`;
      params.push(caller.uid);
    }

    // Get document stats
    const docStats = await queryOne<{ count: string; total_bytes: string }>(
      `SELECT COUNT(*) as count, COALESCE(SUM(size_bytes), 0) as total_bytes
       FROM archive_documents WHERE ${whereClause}`,
      params
    );

    // Get folder count
    const folderParams = caller.organizationId ? [caller.uid, caller.organizationId] : [caller.uid];
    const folderWhere = caller.organizationId
      ? `(user_id = $1 OR organization_id = $2) AND deleted_at IS NULL`
      : `user_id = $1 AND deleted_at IS NULL`;

    const folderStats = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM archive_folders WHERE ${folderWhere}`,
      folderParams
    );

    // Get storage quota from subscription/org
    let totalBytes = 5368709120; // 5GB default
    if (caller.organizationId) {
      const org = await queryOne<{ storage_quota_bytes: number }>(
        `SELECT storage_quota_bytes FROM organizations WHERE id = $1`,
        [caller.organizationId]
      );
      if (org) totalBytes = org.storage_quota_bytes;
    }

    return {
      totalBytes,
      usedBytes: parseInt(docStats?.total_bytes || '0', 10),
      documentCount: parseInt(docStats?.count || '0', 10),
      folderCount: parseInt(folderStats?.count || '0', 10),
    };
  });

// =============================================================================
// archiveGetRetentionPolicies — Get applicable retention policies
// =============================================================================

export const archiveGetRetentionPolicies = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);

    // Get default policies + org-specific ones
    let sql = `SELECT * FROM retention_policies WHERE is_default = true`;
    const params: unknown[] = [];

    if (caller.organizationId) {
      sql += ` OR organization_id = $1`;
      params.push(caller.organizationId);
    }

    sql += ` ORDER BY document_type, is_default DESC`;

    const policies = await query(sql, params);
    return { policies };
  });

// =============================================================================
// archiveGetExpiringDocuments — Documents approaching expiration
// =============================================================================

export const archiveGetExpiringDocuments = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { daysAhead = 30 } = data || {};

    let whereClause: string;
    const params: unknown[] = [];
    let idx = 1;

    if (caller.organizationId) {
      whereClause = `(user_id = $${idx} OR organization_id = $${idx + 1})`;
      params.push(caller.uid, caller.organizationId);
      idx = 3;
    } else {
      whereClause = `user_id = $${idx}`;
      params.push(caller.uid);
      idx = 2;
    }

    const documents = await query(
      `SELECT * FROM archive_documents
       WHERE ${whereClause}
         AND deleted_at IS NULL
         AND expiration_date IS NOT NULL
         AND expiration_date <= NOW() + INTERVAL '1 day' * $${idx}
       ORDER BY expiration_date ASC`,
      [...params, daysAhead]
    );

    return { documents };
  });
