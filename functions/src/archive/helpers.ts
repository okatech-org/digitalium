/**
 * Archive Helpers — shared utilities for archive Cloud Functions
 */

import * as functions from 'firebase-functions';
import { queryOne, execute } from '../utils/db';

// Role level check
type PlatformRole = 'system_admin' | 'platform_admin' | 'org_admin' | 'org_manager' | 'org_member' | 'org_viewer';

const ROLE_LEVELS: Record<PlatformRole, number> = {
  system_admin: 0,
  platform_admin: 1,
  org_admin: 2,
  org_manager: 3,
  org_member: 4,
  org_viewer: 5,
};

export interface CallerInfo {
  uid: string;
  role: PlatformRole;
  level: number;
  organizationId: string | null;
}

/**
 * Get authenticated caller info with role
 */
export async function getCallerInfo(context: functions.https.CallableContext): Promise<CallerInfo> {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const uid = context.auth.uid;

  // Check new RBAC system
  const roleRow = await queryOne<{ role: PlatformRole; organization_id: string | null }>(
    `SELECT role, organization_id FROM user_platform_roles
     WHERE user_id = $1 AND is_active = true
       AND (expires_at IS NULL OR expires_at > NOW())
     ORDER BY
       CASE role
         WHEN 'system_admin' THEN 0
         WHEN 'platform_admin' THEN 1
         WHEN 'org_admin' THEN 2
         WHEN 'org_manager' THEN 3
         WHEN 'org_member' THEN 4
         WHEN 'org_viewer' THEN 5
       END ASC
     LIMIT 1`,
    [uid]
  );

  if (roleRow) {
    return {
      uid,
      role: roleRow.role,
      level: ROLE_LEVELS[roleRow.role],
      organizationId: roleRow.organization_id,
    };
  }

  // Fallback: legacy admin check
  const legacy = await queryOne<{ role: string }>(
    `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'admin'`,
    [uid]
  );

  if (legacy) {
    return { uid, role: 'system_admin', level: 0, organizationId: null };
  }

  // Default: regular user (no org)
  return { uid, role: 'org_member', level: 4, organizationId: null };
}

/**
 * Log an archive audit event
 */
export async function logArchiveAudit(
  userId: string,
  action: string,
  documentId?: string | null,
  folderId?: string | null,
  details: Record<string, unknown> = {}
): Promise<void> {
  try {
    await execute(
      `INSERT INTO archive_audit_logs (user_id, action, document_id, folder_id, action_details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, documentId || null, folderId || null, JSON.stringify(details)]
    );
  } catch (error) {
    functions.logger.warn('Failed to log archive audit:', error);
  }
}
