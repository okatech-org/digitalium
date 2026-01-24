/**
 * Authentication functions
 * Handles user registration hooks and profile management
 */

import * as functions from 'firebase-functions';
export * from './idn';
import { query, execute } from '../utils/db';

interface UserRecord {
  uid: string;
  email?: string;
  displayName?: string;
}

/**
 * Triggered when a new user is created in Firebase Auth
 * Creates profile and assigns default subscription
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

      // Assign default user role
      await execute(
        `INSERT INTO user_roles (user_id, role, created_at)
         VALUES ($1, 'user', NOW())
         ON CONFLICT (user_id, role) DO NOTHING`,
        [uid]
      );

      // Get free plan ID
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
 * Cleans up user data
 */
export const onUserDeleted = functions
  .region('europe-west1')
  .auth.user()
  .onDelete(async (user: UserRecord) => {
    const { uid } = user;

    functions.logger.info('User deleted:', { uid });

    try {
      // Delete user data (cascade should handle related tables)
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
 */
export const checkAdminRole = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const uid = context.auth.uid;

    const roles = await query<{ role: string }>(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'admin'`,
      [uid]
    );

    return { isAdmin: roles.length > 0 };
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

    return {
      profile: profiles[0] || null,
      subscription: subscriptions[0] || null,
      usage: usage[0] || null,
    };
  });
