/**
 * RBAC Cloud Functions
 * Hierarchical Role-Based Access Control for Digitalium
 *
 * 6-level hierarchy:
 *   0 - system_admin   : Infrastructure, sécurité, maintenance
 *   1 - platform_admin  : Crée les clients, configure (Ornella)
 *   2 - org_admin       : DG / Ministre (admin de l'organisation)
 *   3 - org_manager     : Chef de service
 *   4 - org_member      : Employé / Agent
 *   5 - org_viewer      : Lecture seule (auditeur)
 */

import * as functions from 'firebase-functions';
import { query, queryOne, execute } from '../utils/db';

// =============================================================================
// Types
// =============================================================================

type PlatformRole =
  | 'system_admin'
  | 'platform_admin'
  | 'org_admin'
  | 'org_manager'
  | 'org_member'
  | 'org_viewer';

const ROLE_LEVELS: Record<PlatformRole, number> = {
  system_admin: 0,
  platform_admin: 1,
  org_admin: 2,
  org_manager: 3,
  org_member: 4,
  org_viewer: 5,
};

const GLOBAL_ROLES: PlatformRole[] = ['system_admin', 'platform_admin'];

interface UserPlatformRole {
  id: string;
  user_id: string;
  role: PlatformRole;
  organization_id: string | null;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

interface UserRoleInfo {
  role: PlatformRole;
  level: number;
  organization_id: string | null;
  organization_name: string | null;
  organization_slug: string | null;
  is_global: boolean;
}

// =============================================================================
// Helpers
// =============================================================================

async function getCallerRole(uid: string): Promise<UserPlatformRole | null> {
  // Try new platform roles first, fall back to legacy admin check
  const platformRole = await queryOne<UserPlatformRole>(
    `SELECT * FROM user_platform_roles
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

  if (platformRole) return platformRole;

  // Fallback: check legacy user_roles for 'admin' → maps to system_admin
  const legacyAdmin = await queryOne<{ role: string }>(
    `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'admin'`,
    [uid]
  );

  if (legacyAdmin) {
    return {
      id: 'legacy',
      user_id: uid,
      role: 'system_admin',
      organization_id: null,
      granted_by: null,
      granted_at: new Date().toISOString(),
      expires_at: null,
      is_active: true,
      metadata: { legacy: true },
    };
  }

  return null;
}

async function logAudit(
  actorId: string,
  actorRole: PlatformRole,
  action: string,
  targetType: string,
  targetId: string | null,
  organizationId: string | null,
  details: Record<string, unknown> = {}
): Promise<void> {
  await execute(
    `INSERT INTO admin_audit_log (actor_id, actor_role, action, target_type, target_id, organization_id, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [actorId, actorRole, action, targetType, targetId, organizationId, JSON.stringify(details)]
  );
}

// =============================================================================
// getUserRoles — Get all roles for the authenticated user
// =============================================================================

export const getUserRoles = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const uid = context.auth.uid;

    // Get roles from new system
    const roles = await query<UserPlatformRole & { org_name: string | null; org_slug: string | null }>(
      `SELECT upr.*, o.name as org_name, o.slug as org_slug
       FROM user_platform_roles upr
       LEFT JOIN organizations o ON upr.organization_id = o.id
       WHERE upr.user_id = $1
         AND upr.is_active = true
         AND (upr.expires_at IS NULL OR upr.expires_at > NOW())
       ORDER BY
         CASE upr.role
           WHEN 'system_admin' THEN 0
           WHEN 'platform_admin' THEN 1
           WHEN 'org_admin' THEN 2
           WHEN 'org_manager' THEN 3
           WHEN 'org_member' THEN 4
           WHEN 'org_viewer' THEN 5
         END ASC`,
      [uid]
    );

    // Also check legacy system
    const legacyRoles = await query<{ role: string }>(
      `SELECT role FROM user_roles WHERE user_id = $1`,
      [uid]
    );

    const hasLegacyAdmin = legacyRoles.some(r => r.role === 'admin');

    // Build response
    const userRoles: UserRoleInfo[] = roles.map(r => ({
      role: r.role,
      level: ROLE_LEVELS[r.role],
      organization_id: r.organization_id,
      organization_name: r.org_name,
      organization_slug: r.org_slug,
      is_global: GLOBAL_ROLES.includes(r.role),
    }));

    // If legacy admin and not already in new system, add it
    if (hasLegacyAdmin && !userRoles.some(r => r.role === 'system_admin')) {
      userRoles.unshift({
        role: 'system_admin',
        level: 0,
        organization_id: null,
        organization_name: null,
        organization_slug: null,
        is_global: true,
      });
    }

    // Determine highest role
    const highestRole = userRoles.length > 0 ? userRoles[0] : null;

    return {
      roles: userRoles,
      highestRole: highestRole?.role || null,
      highestLevel: highestRole?.level ?? 99,
      isSystemAdmin: userRoles.some(r => r.role === 'system_admin'),
      isPlatformAdmin: userRoles.some(r => ['system_admin', 'platform_admin'].includes(r.role)),
      isOrgAdmin: (orgId?: string) => {
        if (userRoles.some(r => ['system_admin', 'platform_admin'].includes(r.role))) return true;
        if (orgId) return userRoles.some(r => r.role === 'org_admin' && r.organization_id === orgId);
        return userRoles.some(r => r.role === 'org_admin');
      },
      organizations: userRoles
        .filter(r => r.organization_id)
        .map(r => ({
          id: r.organization_id,
          name: r.organization_name,
          slug: r.organization_slug,
          role: r.role,
          level: r.level,
        })),
    };
  });

// =============================================================================
// checkPermission — Verify if caller can perform an action
// =============================================================================

export const checkPermission = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const { requiredRole, organizationId } = data as {
      requiredRole: PlatformRole;
      organizationId?: string;
    };

    if (!requiredRole || !(requiredRole in ROLE_LEVELS)) {
      throw new functions.https.HttpsError('invalid-argument', 'Valid requiredRole is required.');
    }

    const callerRole = await getCallerRole(context.auth.uid);

    if (!callerRole) {
      return { hasPermission: false, reason: 'No role assigned' };
    }

    const callerLevel = ROLE_LEVELS[callerRole.role];
    const requiredLevel = ROLE_LEVELS[requiredRole];

    // System/platform admins have universal access
    if (callerLevel <= 1) {
      return { hasPermission: true, callerRole: callerRole.role };
    }

    // For org-level roles, check org membership
    if (organizationId && callerRole.organization_id !== organizationId) {
      return { hasPermission: false, reason: 'Not a member of this organization' };
    }

    // Check hierarchy
    if (callerLevel <= requiredLevel) {
      return { hasPermission: true, callerRole: callerRole.role };
    }

    return { hasPermission: false, reason: 'Insufficient role level' };
  });

// =============================================================================
// assignRole — Assign a role to a user (with hierarchy enforcement)
// =============================================================================

export const assignRole = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const { targetUserId, role, organizationId } = data as {
      targetUserId: string;
      role: PlatformRole;
      organizationId?: string;
    };

    if (!targetUserId || !role) {
      throw new functions.https.HttpsError('invalid-argument', 'targetUserId and role are required.');
    }

    if (!(role in ROLE_LEVELS)) {
      throw new functions.https.HttpsError('invalid-argument', `Invalid role: ${role}`);
    }

    // Validate: global roles cannot have organizationId, org roles must have one
    if (GLOBAL_ROLES.includes(role) && organizationId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `${role} is a global role and cannot be scoped to an organization.`
      );
    }
    if (!GLOBAL_ROLES.includes(role) && !organizationId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `${role} requires an organizationId.`
      );
    }

    // Get caller role
    const callerRole = await getCallerRole(context.auth.uid);
    if (!callerRole) {
      throw new functions.https.HttpsError('permission-denied', 'No role assigned to caller.');
    }

    const callerLevel = ROLE_LEVELS[callerRole.role];
    const targetLevel = ROLE_LEVELS[role];

    // Enforce hierarchy: caller can only assign roles below their own level
    if (callerLevel >= targetLevel) {
      throw new functions.https.HttpsError(
        'permission-denied',
        `Cannot assign ${role} (level ${targetLevel}). Your role ${callerRole.role} (level ${callerLevel}) must be strictly higher.`
      );
    }

    // For org roles, verify caller has authority over that org
    if (organizationId && callerLevel > 1) {
      // Org-level callers can only manage their own org
      if (callerRole.organization_id !== organizationId) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You can only manage roles within your own organization.'
        );
      }
    }

    // Verify the organization exists if provided
    if (organizationId) {
      const org = await queryOne<{ id: string }>(
        `SELECT id FROM organizations WHERE id = $1`,
        [organizationId]
      );
      if (!org) {
        throw new functions.https.HttpsError('not-found', 'Organization not found.');
      }
    }

    try {
      // Upsert: one role per user per organization (or one global role per user)
      await execute(
        `INSERT INTO user_platform_roles (user_id, role, organization_id, granted_by, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (user_id, organization_id) DO UPDATE SET
           role = EXCLUDED.role,
           granted_by = EXCLUDED.granted_by,
           is_active = true,
           updated_at = NOW()`,
        [targetUserId, role, organizationId || null, context.auth.uid]
      );

      // Audit log
      await logAudit(
        context.auth.uid,
        callerRole.role,
        'assign_role',
        'user',
        targetUserId,
        organizationId || null,
        { assigned_role: role }
      );

      functions.logger.info('Role assigned:', { targetUserId, role, organizationId, by: context.auth.uid });

      return { success: true, role, organizationId };
    } catch (error) {
      functions.logger.error('Error assigning role:', error);
      throw new functions.https.HttpsError('internal', 'Failed to assign role.');
    }
  });

// =============================================================================
// removeRole — Remove a user's role
// =============================================================================

export const removeRole = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const { targetUserId, organizationId } = data as {
      targetUserId: string;
      organizationId?: string;
    };

    if (!targetUserId) {
      throw new functions.https.HttpsError('invalid-argument', 'targetUserId is required.');
    }

    // Get caller role
    const callerRole = await getCallerRole(context.auth.uid);
    if (!callerRole) {
      throw new functions.https.HttpsError('permission-denied', 'No role assigned to caller.');
    }

    // Get target's current role to enforce hierarchy
    const targetRole = await queryOne<UserPlatformRole>(
      `SELECT * FROM user_platform_roles
       WHERE user_id = $1 AND organization_id ${organizationId ? '= $2' : 'IS NULL'}
         AND is_active = true`,
      organizationId ? [targetUserId, organizationId] : [targetUserId]
    );

    if (!targetRole) {
      throw new functions.https.HttpsError('not-found', 'Target user role not found.');
    }

    const callerLevel = ROLE_LEVELS[callerRole.role];
    const targetLevel = ROLE_LEVELS[targetRole.role];

    // Cannot remove roles at or above your level
    if (callerLevel >= targetLevel) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Cannot remove a role at or above your level.'
      );
    }

    try {
      await execute(
        `UPDATE user_platform_roles SET is_active = false, updated_at = NOW()
         WHERE user_id = $1 AND organization_id ${organizationId ? '= $2' : 'IS NULL'}`,
        organizationId ? [targetUserId, organizationId] : [targetUserId]
      );

      await logAudit(
        context.auth.uid,
        callerRole.role,
        'remove_role',
        'user',
        targetUserId,
        organizationId || null,
        { removed_role: targetRole.role }
      );

      return { success: true };
    } catch (error) {
      functions.logger.error('Error removing role:', error);
      throw new functions.https.HttpsError('internal', 'Failed to remove role.');
    }
  });

// =============================================================================
// listUsers — List users with their roles (filtered by org or globally)
// =============================================================================

export const listUsers = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const { organizationId, searchTerm, roleFilter, limit = 50, offset = 0 } = data || {};

    const callerRole = await getCallerRole(context.auth.uid);
    if (!callerRole) {
      throw new functions.https.HttpsError('permission-denied', 'No role assigned.');
    }

    const callerLevel = ROLE_LEVELS[callerRole.role];

    // Only org_manager+ can list users
    if (callerLevel > 3) {
      throw new functions.https.HttpsError('permission-denied', 'Manager access required.');
    }

    try {
      let sql = `
        SELECT
          p.user_id,
          p.display_name,
          p.email,
          p.phone,
          p.avatar_url,
          p.created_at,
          upr.role as platform_role,
          upr.organization_id,
          upr.is_active as role_active,
          upr.granted_at,
          o.name as organization_name,
          o.slug as organization_slug
        FROM profiles p
        LEFT JOIN user_platform_roles upr ON p.user_id = upr.user_id AND upr.is_active = true
        LEFT JOIN organizations o ON upr.organization_id = o.id
        WHERE 1=1
      `;
      const params: unknown[] = [];
      let paramIndex = 1;

      // Scope by org for non-global admins
      if (organizationId) {
        sql += ` AND upr.organization_id = $${paramIndex}`;
        params.push(organizationId);
        paramIndex++;
      } else if (callerLevel > 1) {
        // Org-level roles can only see their own org
        sql += ` AND upr.organization_id = $${paramIndex}`;
        params.push(callerRole.organization_id);
        paramIndex++;
      }

      if (searchTerm) {
        sql += ` AND (p.display_name ILIKE $${paramIndex} OR p.email ILIKE $${paramIndex})`;
        params.push(`%${searchTerm}%`);
        paramIndex++;
      }

      if (roleFilter && roleFilter !== 'all') {
        sql += ` AND upr.role = $${paramIndex}`;
        params.push(roleFilter);
        paramIndex++;
      }

      sql += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const users = await query<{
        user_id: string;
        display_name: string;
        email: string;
        phone: string | null;
        avatar_url: string | null;
        created_at: string;
        platform_role: PlatformRole | null;
        organization_id: string | null;
        role_active: boolean | null;
        granted_at: string | null;
        organization_name: string | null;
        organization_slug: string | null;
      }>(sql, params);

      return { users, count: users.length };
    } catch (error) {
      functions.logger.error('Error listing users:', error);
      throw new functions.https.HttpsError('internal', 'Failed to list users.');
    }
  });

// =============================================================================
// getAuditLog — Retrieve admin actions (system/platform admin only)
// =============================================================================

export const getAuditLog = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const callerRole = await getCallerRole(context.auth.uid);
    if (!callerRole || ROLE_LEVELS[callerRole.role] > 1) {
      throw new functions.https.HttpsError('permission-denied', 'Platform admin access required.');
    }

    const { organizationId, action, limit = 50, offset = 0 } = data || {};

    let sql = `SELECT * FROM admin_audit_log WHERE 1=1`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (organizationId) {
      sql += ` AND organization_id = $${paramIndex}`;
      params.push(organizationId);
      paramIndex++;
    }

    if (action) {
      sql += ` AND action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const logs = await query(sql, params);

    return { logs, count: logs.length };
  });
