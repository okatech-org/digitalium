/**
 * Authentication functions
 * Handles user registration hooks and profile management
 *
 * Updated for RBAC hierarchical roles (Phase 1)
 */

import * as functions from 'firebase-functions';
export * from './idn';
import { query, execute } from '../utils/db';

interface UserRecord {
  uid: string;
  email?: string;
  displayName?: string;
}

// Role hierarchy levels for reference
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

/**
 * Triggered when a new user is created in Firebase Auth
 * Creates profile, assigns default subscription, and handles invitation-based role assignment
 */
export const onUserCreated = functions
  .region('europe-west1')
  .auth.user()
  .onCreate(async (user: UserRecord) => {
    const { uid, email, displayName } = user;

    functions.logger.info('New user created:', { uid, email });

    try {
      // Create user profile
      await execute(
        `INSERT INTO profiles (user_id, display_name, email, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        [uid, displayName || null, email || null]
      );

      // Legacy: Assign default user role (for backward compatibility)
      await execute(
        `INSERT INTO user_roles (user_id, role, created_at)
         VALUES ($1, 'user', NOW())
         ON CONFLICT (user_id, role) DO NOTHING`,
        [uid]
      );

      // Check for pending invitations for this email
      if (email) {
        const pendingInvitations = await query<{
          id: string;
          organization_id: string;
          role: PlatformRole;
          invited_by: string;
        }>(
          `SELECT id, organization_id, role, invited_by
           FROM organization_invitations
           WHERE email = $1 AND status = 'pending' AND expires_at > NOW()`,
          [email]
        );

        for (const invitation of pendingInvitations) {
          // Auto-assign role from invitation
          await execute(
            `INSERT INTO user_platform_roles (user_id, role, organization_id, granted_by, is_active)
             VALUES ($1, $2, $3, $4, true)
             ON CONFLICT (user_id, organization_id) DO UPDATE SET
               role = EXCLUDED.role,
               granted_by = EXCLUDED.granted_by,
               is_active = true,
               updated_at = NOW()`,
            [uid, invitation.role, invitation.organization_id, invitation.invited_by]
          );

          // Mark invitation as accepted
          await execute(
            `UPDATE organization_invitations SET status = 'accepted', accepted_at = NOW(), accepted_by = $1
             WHERE id = $2`,
            [uid, invitation.id]
          );

          functions.logger.info('Auto-accepted invitation for new user:', {
            uid,
            email,
            organizationId: invitation.organization_id,
            role: invitation.role,
          });
        }
      }

      // Get free plan ID for default subscription
      const plans = await query<{ id: string }>(
        `SELECT id FROM plans WHERE name = 'free' AND type = 'personal' AND is_active = true LIMIT 1`
      );

      if (plans.length > 0) {
        const freePlanId = plans[0].id;

        // Create free subscription
        await execute(
          `INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
           VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '100 years', NOW(), NOW())`,
          [uid, freePlanId]
        );

        // Initialize usage tracking
        const currentPeriod = new Date().toISOString().slice(0, 7);
        await execute(
          `INSERT INTO usage (user_id, period, storage_bytes, documents_count, ai_requests_count, created_at, updated_at)
           VALUES ($1, $2, 0, 0, 0, NOW(), NOW())
           ON CONFLICT (user_id, period) DO NOTHING`,
          [uid, currentPeriod]
        );
      }

      functions.logger.info('User profile and subscription created:', { uid });
    } catch (error) {
      functions.logger.error('Error creating user profile:', error);
      throw error;
    }
  });

/**
 * Triggered when a user is deleted from Firebase Auth
 * Cleans up user data including new RBAC roles
 */
export const onUserDeleted = functions
  .region('europe-west1')
  .auth.user()
  .onDelete(async (user: UserRecord) => {
    const { uid } = user;

    functions.logger.info('User deleted:', { uid });

    try {
      // Delete from new RBAC system
      await execute(`UPDATE user_platform_roles SET is_active = false, updated_at = NOW() WHERE user_id = $1`, [uid]);

      // Delete legacy data
      await execute(`DELETE FROM profiles WHERE user_id = $1`, [uid]);
      await execute(`DELETE FROM subscriptions WHERE user_id = $1`, [uid]);
      await execute(`DELETE FROM user_roles WHERE user_id = $1`, [uid]);

      functions.logger.info('User data cleaned up:', { uid });
    } catch (error) {
      functions.logger.error('Error cleaning up user data:', error);
      throw error;
    }
  });

/**
 * HTTP function to check if user has admin role
 * Updated to check both new RBAC system and legacy system
 *
 * Returns detailed role info for the frontend
 */
export const checkAdminRole = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const uid = context.auth.uid;

    // Check new RBAC system first
    const platformRoles = await query<{
      role: PlatformRole;
      organization_id: string | null;
      org_name: string | null;
      org_slug: string | null;
    }>(
      `SELECT upr.role, upr.organization_id, o.name as org_name, o.slug as org_slug
       FROM user_platform_roles upr
       LEFT JOIN organizations o ON upr.organization_id = o.id
       WHERE upr.user_id = $1 AND upr.is_active = true
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

    if (platformRoles.length > 0) {
      const highest = platformRoles[0];
      const level = ROLE_LEVELS[highest.role];

      return {
        // Legacy compatibility
        isAdmin: level <= 2, // system_admin, platform_admin, org_admin are all "admin"

        // New RBAC info
        role: highest.role,
        level,
        isSystemAdmin: level === 0,
        isPlatformAdmin: level <= 1,
        isOrgAdmin: level <= 2,
        isManager: level <= 3,

        // All roles
        roles: platformRoles.map(r => ({
          role: r.role,
          level: ROLE_LEVELS[r.role],
          organizationId: r.organization_id,
          organizationName: r.org_name,
          organizationSlug: r.org_slug,
        })),

        // Organizations the user belongs to
        organizations: platformRoles
          .filter(r => r.organization_id)
          .map(r => ({
            id: r.organization_id,
            name: r.org_name,
            slug: r.org_slug,
            role: r.role,
          })),
      };
    }

    // Fallback to legacy system
    const legacyRoles = await query<{ role: string }>(
      `SELECT role FROM user_roles WHERE user_id = $1`,
      [uid]
    );

    const isLegacyAdmin = legacyRoles.some(r => r.role === 'admin');

    return {
      isAdmin: isLegacyAdmin,
      role: isLegacyAdmin ? 'system_admin' : 'org_member',
      level: isLegacyAdmin ? 0 : 4,
      isSystemAdmin: isLegacyAdmin,
      isPlatformAdmin: isLegacyAdmin,
      isOrgAdmin: isLegacyAdmin,
      isManager: isLegacyAdmin,
      roles: isLegacyAdmin
        ? [{ role: 'system_admin', level: 0, organizationId: null, organizationName: null, organizationSlug: null }]
        : [{ role: 'org_member', level: 4, organizationId: null, organizationName: null, organizationSlug: null }],
      organizations: [],
    };
  });

/**
 * HTTP function to get user profile with subscription
 */
export const getUserProfile = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const uid = context.auth.uid;

    // Get profile
    const profiles = await query<{
      id: string;
      display_name: string;
      email: string;
      phone: string;
      company: string;
      avatar_url: string;
    }>(`SELECT * FROM profiles WHERE user_id = $1`, [uid]);

    // Get subscription with plan
    const subscriptions = await query<{
      id: string;
      plan_id: string;
      status: string;
      current_period_end: string;
      plan_name: string;
      plan_display_name: string;
      features: string[];
    }>(
      `SELECT s.*, p.name as plan_name, p.display_name as plan_display_name, p.features
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = $1 AND s.status IN ('active', 'trialing')
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [uid]
    );

    // Get current usage
    const currentPeriod = new Date().toISOString().slice(0, 7);
    const usage = await query<{
      storage_bytes: number;
      documents_count: number;
      ai_requests_count: number;
    }>(`SELECT * FROM usage WHERE user_id = $1 AND period = $2`, [uid, currentPeriod]);

    // Get RBAC roles
    const roles = await query<{
      role: PlatformRole;
      organization_id: string | null;
      org_name: string | null;
    }>(
      `SELECT upr.role, upr.organization_id, o.name as org_name
       FROM user_platform_roles upr
       LEFT JOIN organizations o ON upr.organization_id = o.id
       WHERE upr.user_id = $1 AND upr.is_active = true
         AND (upr.expires_at IS NULL OR upr.expires_at > NOW())`,
      [uid]
    );

    return {
      profile: profiles[0] || null,
      subscription: subscriptions[0] || null,
      usage: usage[0] || null,
      roles: roles.map(r => ({
        role: r.role,
        organizationId: r.organization_id,
        organizationName: r.org_name,
      })),
    };
  });
