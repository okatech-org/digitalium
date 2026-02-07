/**
 * Organizations Cloud Functions
 * CRUD for organizations, member management, invitations
 *
 * Called by: Platform Admin (Ornella) for creating/managing client orgs
 *           Org Admin (DG) for managing their own org members
 */

import * as functions from 'firebase-functions';
import { v4 as uuidv4 } from 'uuid';
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

interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  sector: string | null;
  nif: string | null;
  rccm: string | null;
  max_users: number;
  storage_quota_bytes: number;
  modules_enabled: string[];
  created_by: string | null;
  plan_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: PlatformRole;
  invited_by: string;
  token: string;
  status: string;
  expires_at: string;
  message: string | null;
  created_at: string;
}

// =============================================================================
// Helpers
// =============================================================================

async function getCallerHighestRole(uid: string): Promise<{ role: PlatformRole; level: number; organization_id: string | null } | null> {
  const result = await queryOne<{ role: PlatformRole; organization_id: string | null }>(
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

  if (result) {
    return { role: result.role, level: ROLE_LEVELS[result.role], organization_id: result.organization_id };
  }

  // Fallback: check legacy
  const legacy = await queryOne<{ role: string }>(
    `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'admin'`,
    [uid]
  );

  if (legacy) {
    return { role: 'system_admin', level: 0, organization_id: null };
  }

  return null;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
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
// createOrganization — Create a new client org (platform_admin+)
// =============================================================================

export const createOrganization = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const caller = await getCallerHighestRole(context.auth.uid);
    if (!caller || caller.level > 1) {
      throw new functions.https.HttpsError('permission-denied', 'Platform admin access required.');
    }

    const {
      name,
      type,
      sector,
      address,
      city,
      country,
      contactEmail,
      contactPhone,
      nif,
      rccm,
      maxUsers = 10,
      storageQuotaBytes = 5368709120, // 5GB
      modulesEnabled = ['idocument', 'iarchive'],
      planId,
    } = data;

    if (!name || !type) {
      throw new functions.https.HttpsError('invalid-argument', 'name and type are required.');
    }

    // Generate unique slug
    let slug = generateSlug(name);
    const existingSlugs = await query<{ slug: string }>(
      `SELECT slug FROM organizations WHERE slug LIKE $1`,
      [`${slug}%`]
    );
    if (existingSlugs.some(o => o.slug === slug)) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    try {
      const orgId = uuidv4();

      await execute(
        `INSERT INTO organizations (id, name, slug, type, sector, address, city, country, contact_email, contact_phone, nif, rccm, max_users, storage_quota_bytes, modules_enabled, created_by, status, plan_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'active', $17)`,
        [
          orgId, name, slug, type, sector || null, address || null,
          city || null, country || null, contactEmail || null, contactPhone || null,
          nif || null, rccm || null, maxUsers, storageQuotaBytes,
          modulesEnabled, context.auth.uid, planId || null,
        ]
      );

      await logAudit(
        context.auth.uid,
        caller.role,
        'create_org',
        'organization',
        orgId,
        orgId,
        { name, type, sector, slug }
      );

      functions.logger.info('Organization created:', { orgId, name, slug, by: context.auth.uid });

      return {
        success: true,
        organization: { id: orgId, name, slug, type, status: 'active' },
      };
    } catch (error) {
      functions.logger.error('Error creating organization:', error);
      throw new functions.https.HttpsError('internal', 'Failed to create organization.');
    }
  });

// =============================================================================
// getOrganizations — List all organizations (platform_admin+) or caller's org
// =============================================================================

export const getOrganizations = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const caller = await getCallerHighestRole(context.auth.uid);
    if (!caller) {
      throw new functions.https.HttpsError('permission-denied', 'No role assigned.');
    }

    const { searchTerm, statusFilter, limit = 50, offset = 0 } = data || {};

    let sql: string;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (caller.level <= 1) {
      // System/Platform admins see all
      sql = `SELECT o.*,
              (SELECT COUNT(*) FROM user_platform_roles upr WHERE upr.organization_id = o.id AND upr.is_active = true) as member_count,
              (SELECT COUNT(*) FROM user_platform_roles upr WHERE upr.organization_id = o.id AND upr.is_active = true AND upr.role = 'org_admin') as admin_count
             FROM organizations o WHERE 1=1`;
    } else {
      // Org-level users only see their org
      sql = `SELECT o.*,
              (SELECT COUNT(*) FROM user_platform_roles upr WHERE upr.organization_id = o.id AND upr.is_active = true) as member_count,
              (SELECT COUNT(*) FROM user_platform_roles upr WHERE upr.organization_id = o.id AND upr.is_active = true AND upr.role = 'org_admin') as admin_count
             FROM organizations o WHERE o.id = $${paramIndex}`;
      params.push(caller.organization_id);
      paramIndex++;
    }

    if (searchTerm) {
      sql += ` AND (o.name ILIKE $${paramIndex} OR o.slug ILIKE $${paramIndex} OR o.contact_email ILIKE $${paramIndex})`;
      params.push(`%${searchTerm}%`);
      paramIndex++;
    }

    if (statusFilter && statusFilter !== 'all') {
      sql += ` AND o.status = $${paramIndex}`;
      params.push(statusFilter);
      paramIndex++;
    }

    sql += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const organizations = await query<Organization & { member_count: string; admin_count: string }>(sql, params);

    return {
      organizations: organizations.map(o => ({
        ...o,
        member_count: parseInt(o.member_count || '0', 10),
        admin_count: parseInt(o.admin_count || '0', 10),
      })),
    };
  });

// =============================================================================
// getOrganization — Get a single organization with details
// =============================================================================

export const getOrganization = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const { organizationId } = data;
    if (!organizationId) {
      throw new functions.https.HttpsError('invalid-argument', 'organizationId is required.');
    }

    const caller = await getCallerHighestRole(context.auth.uid);
    if (!caller) {
      throw new functions.https.HttpsError('permission-denied', 'No role assigned.');
    }

    // Non-global users can only view their own org
    if (caller.level > 1 && caller.organization_id !== organizationId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied to this organization.');
    }

    const org = await queryOne<Organization>(
      `SELECT * FROM organizations WHERE id = $1`,
      [organizationId]
    );

    if (!org) {
      throw new functions.https.HttpsError('not-found', 'Organization not found.');
    }

    // Get members
    const members = await query<{
      user_id: string;
      display_name: string;
      email: string;
      role: PlatformRole;
      granted_at: string;
    }>(
      `SELECT upr.user_id, p.display_name, p.email, upr.role, upr.granted_at
       FROM user_platform_roles upr
       JOIN profiles p ON upr.user_id = p.user_id
       WHERE upr.organization_id = $1 AND upr.is_active = true
       ORDER BY
         CASE upr.role
           WHEN 'org_admin' THEN 0
           WHEN 'org_manager' THEN 1
           WHEN 'org_member' THEN 2
           WHEN 'org_viewer' THEN 3
         END ASC`,
      [organizationId]
    );

    // Get pending invitations
    const invitations = await query<Invitation>(
      `SELECT * FROM organization_invitations
       WHERE organization_id = $1 AND status = 'pending' AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [organizationId]
    );

    return {
      organization: org,
      members,
      invitations,
    };
  });

// =============================================================================
// updateOrganization — Update organization details
// =============================================================================

export const updateOrganization = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const { organizationId, updates } = data;
    if (!organizationId || !updates) {
      throw new functions.https.HttpsError('invalid-argument', 'organizationId and updates are required.');
    }

    const caller = await getCallerHighestRole(context.auth.uid);
    if (!caller) {
      throw new functions.https.HttpsError('permission-denied', 'No role assigned.');
    }

    // Platform admins can update any org, org_admins only their own
    if (caller.level > 1 && caller.organization_id !== organizationId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied.');
    }

    if (caller.level > 2) {
      throw new functions.https.HttpsError('permission-denied', 'Org admin access required.');
    }

    // Whitelist of updatable fields
    const allowedFields: Record<string, string> = {
      name: 'name',
      contactEmail: 'contact_email',
      contactPhone: 'contact_phone',
      address: 'address',
      city: 'city',
      country: 'country',
      sector: 'sector',
      nif: 'nif',
      rccm: 'rccm',
      logoUrl: 'logo_url',
    };

    // Only platform admins can update these
    const adminOnlyFields: Record<string, string> = {
      status: 'status',
      maxUsers: 'max_users',
      storageQuotaBytes: 'storage_quota_bytes',
      modulesEnabled: 'modules_enabled',
      planId: 'plan_id',
    };

    const setClauses: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      const dbField = allowedFields[key] || (caller.level <= 1 ? adminOnlyFields[key] : null);
      if (dbField) {
        setClauses.push(`${dbField} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'No valid fields to update.');
    }

    setClauses.push('updated_at = NOW()');
    params.push(organizationId);

    try {
      await execute(
        `UPDATE organizations SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`,
        params
      );

      await logAudit(
        context.auth.uid,
        caller.role,
        'update_org',
        'organization',
        organizationId,
        organizationId,
        { updated_fields: Object.keys(updates) }
      );

      return { success: true };
    } catch (error) {
      functions.logger.error('Error updating organization:', error);
      throw new functions.https.HttpsError('internal', 'Failed to update organization.');
    }
  });

// =============================================================================
// inviteUser — Send an invitation to join an organization
// =============================================================================

export const inviteUser = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const { organizationId, email, role = 'org_member', message } = data as {
      organizationId: string;
      email: string;
      role?: PlatformRole;
      message?: string;
    };

    if (!organizationId || !email) {
      throw new functions.https.HttpsError('invalid-argument', 'organizationId and email are required.');
    }

    // Validate role is org-level
    if (['system_admin', 'platform_admin'].includes(role)) {
      throw new functions.https.HttpsError('invalid-argument', 'Cannot invite to global roles.');
    }

    const caller = await getCallerHighestRole(context.auth.uid);
    if (!caller) {
      throw new functions.https.HttpsError('permission-denied', 'No role assigned.');
    }

    // Check authority
    if (caller.level > 1 && caller.organization_id !== organizationId) {
      throw new functions.https.HttpsError('permission-denied', 'Cannot invite to another organization.');
    }

    // Must have higher role than the one being assigned
    if (caller.level >= ROLE_LEVELS[role]) {
      throw new functions.https.HttpsError(
        'permission-denied',
        `Cannot invite with role ${role}. Must be higher in the hierarchy.`
      );
    }

    // Check org exists
    const org = await queryOne<{ id: string; name: string; max_users: number }>(
      `SELECT id, name, max_users FROM organizations WHERE id = $1`,
      [organizationId]
    );
    if (!org) {
      throw new functions.https.HttpsError('not-found', 'Organization not found.');
    }

    // Check member count limit
    const memberCount = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM user_platform_roles WHERE organization_id = $1 AND is_active = true`,
      [organizationId]
    );
    if (parseInt(memberCount?.count || '0') >= org.max_users) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        `Organization has reached maximum users (${org.max_users}).`
      );
    }

    // Check for existing pending invitation
    const existingInvitation = await queryOne<{ id: string }>(
      `SELECT id FROM organization_invitations
       WHERE organization_id = $1 AND email = $2 AND status = 'pending' AND expires_at > NOW()`,
      [organizationId, email]
    );
    if (existingInvitation) {
      throw new functions.https.HttpsError('already-exists', 'An active invitation already exists for this email.');
    }

    try {
      const token = uuidv4();
      const invitationId = uuidv4();

      await execute(
        `INSERT INTO organization_invitations (id, organization_id, email, role, invited_by, token, status, message)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)`,
        [invitationId, organizationId, email, role, context.auth.uid, token, message || null]
      );

      await logAudit(
        context.auth.uid,
        caller.role,
        'invite_user',
        'invitation',
        invitationId,
        organizationId,
        { email, role }
      );

      functions.logger.info('Invitation sent:', { organizationId, email, role, by: context.auth.uid });

      // TODO: Send email with invitation link (e.g. via SendGrid / Mailgun)
      // const inviteUrl = `https://app.digitalium.ga/invite/${token}`;

      return {
        success: true,
        invitation: { id: invitationId, token, email, role, organizationId },
      };
    } catch (error) {
      functions.logger.error('Error creating invitation:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send invitation.');
    }
  });

// =============================================================================
// acceptInvitation — Accept an invitation by token
// =============================================================================

export const acceptInvitation = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const { token } = data;
    if (!token) {
      throw new functions.https.HttpsError('invalid-argument', 'token is required.');
    }

    const invitation = await queryOne<Invitation>(
      `SELECT * FROM organization_invitations
       WHERE token = $1 AND status = 'pending' AND expires_at > NOW()`,
      [token]
    );

    if (!invitation) {
      throw new functions.https.HttpsError('not-found', 'Invitation not found or expired.');
    }

    // Verify email matches (optional — could allow any authenticated user)
    // For now we're lenient and allow any authenticated user to accept

    try {
      // Create the role
      await execute(
        `INSERT INTO user_platform_roles (user_id, role, organization_id, granted_by, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (user_id, organization_id) DO UPDATE SET
           role = EXCLUDED.role,
           granted_by = EXCLUDED.granted_by,
           is_active = true,
           updated_at = NOW()`,
        [context.auth.uid, invitation.role, invitation.organization_id, invitation.invited_by]
      );

      // Mark invitation as accepted
      await execute(
        `UPDATE organization_invitations SET status = 'accepted', accepted_at = NOW(), accepted_by = $1
         WHERE id = $2`,
        [context.auth.uid, invitation.id]
      );

      await logAudit(
        context.auth.uid,
        invitation.role,
        'accept_invitation',
        'invitation',
        invitation.id,
        invitation.organization_id,
        { email: invitation.email }
      );

      functions.logger.info('Invitation accepted:', {
        userId: context.auth.uid,
        organizationId: invitation.organization_id,
        role: invitation.role,
      });

      return {
        success: true,
        organizationId: invitation.organization_id,
        role: invitation.role,
      };
    } catch (error) {
      functions.logger.error('Error accepting invitation:', error);
      throw new functions.https.HttpsError('internal', 'Failed to accept invitation.');
    }
  });

// =============================================================================
// revokeInvitation — Cancel a pending invitation
// =============================================================================

export const revokeInvitation = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const { invitationId } = data;
    if (!invitationId) {
      throw new functions.https.HttpsError('invalid-argument', 'invitationId is required.');
    }

    const invitation = await queryOne<Invitation>(
      `SELECT * FROM organization_invitations WHERE id = $1 AND status = 'pending'`,
      [invitationId]
    );

    if (!invitation) {
      throw new functions.https.HttpsError('not-found', 'Invitation not found.');
    }

    const caller = await getCallerHighestRole(context.auth.uid);
    if (!caller) {
      throw new functions.https.HttpsError('permission-denied', 'No role assigned.');
    }

    // Must be platform admin or org admin of the same org
    if (caller.level > 1 && caller.organization_id !== invitation.organization_id) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied.');
    }
    if (caller.level > 2) {
      throw new functions.https.HttpsError('permission-denied', 'Org admin access required.');
    }

    await execute(
      `UPDATE organization_invitations SET status = 'revoked' WHERE id = $1`,
      [invitationId]
    );

    await logAudit(
      context.auth.uid,
      caller.role,
      'revoke_invitation',
      'invitation',
      invitationId,
      invitation.organization_id,
      { email: invitation.email }
    );

    return { success: true };
  });

// =============================================================================
// getOrgMembers — Get members of an organization
// =============================================================================

export const getOrgMembers = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const { organizationId } = data;
    if (!organizationId) {
      throw new functions.https.HttpsError('invalid-argument', 'organizationId is required.');
    }

    const caller = await getCallerHighestRole(context.auth.uid);
    if (!caller) {
      throw new functions.https.HttpsError('permission-denied', 'No role assigned.');
    }

    // Must be member of the org or global admin
    if (caller.level > 1 && caller.organization_id !== organizationId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied.');
    }

    const members = await query<{
      user_id: string;
      display_name: string;
      email: string;
      avatar_url: string | null;
      role: PlatformRole;
      granted_at: string;
      granted_by: string | null;
    }>(
      `SELECT upr.user_id, p.display_name, p.email, p.avatar_url,
              upr.role, upr.granted_at, upr.granted_by
       FROM user_platform_roles upr
       JOIN profiles p ON upr.user_id = p.user_id
       WHERE upr.organization_id = $1 AND upr.is_active = true
       ORDER BY
         CASE upr.role
           WHEN 'org_admin' THEN 0
           WHEN 'org_manager' THEN 1
           WHEN 'org_member' THEN 2
           WHEN 'org_viewer' THEN 3
         END ASC,
         p.display_name ASC`,
      [organizationId]
    );

    return { members, count: members.length };
  });

// =============================================================================
// removeMember — Remove a member from an organization
// =============================================================================

export const removeMember = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    const { organizationId, userId } = data;
    if (!organizationId || !userId) {
      throw new functions.https.HttpsError('invalid-argument', 'organizationId and userId are required.');
    }

    const caller = await getCallerHighestRole(context.auth.uid);
    if (!caller) {
      throw new functions.https.HttpsError('permission-denied', 'No role assigned.');
    }

    // Check authority
    if (caller.level > 1 && caller.organization_id !== organizationId) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied.');
    }

    // Get target member's role
    const targetMember = await queryOne<{ role: PlatformRole }>(
      `SELECT role FROM user_platform_roles
       WHERE user_id = $1 AND organization_id = $2 AND is_active = true`,
      [userId, organizationId]
    );

    if (!targetMember) {
      throw new functions.https.HttpsError('not-found', 'Member not found.');
    }

    // Cannot remove someone at or above your level
    if (caller.level >= ROLE_LEVELS[targetMember.role] && caller.level > 1) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Cannot remove a member at or above your role level.'
      );
    }

    // Prevent removing the last org_admin
    if (targetMember.role === 'org_admin') {
      const adminCount = await queryOne<{ count: string }>(
        `SELECT COUNT(*) as count FROM user_platform_roles
         WHERE organization_id = $1 AND role = 'org_admin' AND is_active = true`,
        [organizationId]
      );
      if (parseInt(adminCount?.count || '0') <= 1) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Cannot remove the last org admin.'
        );
      }
    }

    await execute(
      `UPDATE user_platform_roles SET is_active = false, updated_at = NOW()
       WHERE user_id = $1 AND organization_id = $2`,
      [userId, organizationId]
    );

    await logAudit(
      context.auth.uid,
      caller.role,
      'remove_member',
      'user',
      userId,
      organizationId,
      { removed_role: targetMember.role }
    );

    return { success: true };
  });
