/**
 * Leads Cloud Functions
 * Replaces Supabase Edge Function "submit-lead" and direct Supabase queries
 */

import * as functions from 'firebase-functions';
import { query, queryOne, execute } from '../utils/db';

// =============================================================================
// Types
// =============================================================================

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  source: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Submit Lead (Public - replaces Supabase Edge Function submit-lead)
// =============================================================================

export const submitLead = functions
  .region('europe-west1')
  .https.onCall(async (data) => {
    const { name, email, phone, company, subject, message, source } = data;

    // Validation
    if (!name || !email || !message) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Name, email, and message are required.'
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid email address.'
      );
    }

    try {
      const result = await queryOne<Lead>(
        `INSERT INTO leads (name, email, phone, company, subject, message, source, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'new')
         RETURNING *`,
        [name, email, phone || null, company || null, subject || null, message, source || 'contact_form']
      );

      return { success: true, lead: result };
    } catch (error) {
      console.error('Error submitting lead:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to submit lead.'
      );
    }
  });

// =============================================================================
// Get Leads (Admin only)
// =============================================================================

export const getLeads = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required.'
      );
    }

    // Verify admin role
    const roleResult = await queryOne<{ role: string }>(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'admin'`,
      [context.auth.uid]
    );

    if (!roleResult) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Admin access required.'
      );
    }

    const { statusFilter, searchTerm, limit = 100, offset = 0 } = data || {};

    try {
      let sql = `SELECT * FROM leads WHERE 1=1`;
      const params: unknown[] = [];
      let paramIndex = 1;

      if (statusFilter && statusFilter !== 'all') {
        sql += ` AND status = $${paramIndex}`;
        params.push(statusFilter);
        paramIndex++;
      }

      if (searchTerm) {
        sql += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`;
        params.push(`%${searchTerm}%`);
        paramIndex++;
      }

      sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const leads = await query<Lead>(sql, params);

      // Get total count
      let countSql = `SELECT COUNT(*) as total FROM leads WHERE 1=1`;
      const countParams: unknown[] = [];
      let countParamIndex = 1;

      if (statusFilter && statusFilter !== 'all') {
        countSql += ` AND status = $${countParamIndex}`;
        countParams.push(statusFilter);
        countParamIndex++;
      }

      if (searchTerm) {
        countSql += ` AND (name ILIKE $${countParamIndex} OR email ILIKE $${countParamIndex} OR company ILIKE $${countParamIndex})`;
        countParams.push(`%${searchTerm}%`);
      }

      const countResult = await queryOne<{ total: string }>(countSql, countParams);

      return {
        leads,
        total: parseInt(countResult?.total || '0', 10),
      };
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to fetch leads.'
      );
    }
  });

// =============================================================================
// Update Lead Status (Admin only)
// =============================================================================

export const updateLeadStatus = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    // Verify admin role
    const roleResult = await queryOne<{ role: string }>(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'admin'`,
      [context.auth.uid]
    );

    if (!roleResult) {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required.');
    }

    const { leadId, status } = data;

    if (!leadId || !status) {
      throw new functions.https.HttpsError('invalid-argument', 'leadId and status are required.');
    }

    const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
    if (!validStatuses.includes(status)) {
      throw new functions.https.HttpsError('invalid-argument', `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    try {
      const rowCount = await execute(
        `UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2`,
        [status, leadId]
      );

      if (rowCount === 0) {
        throw new functions.https.HttpsError('not-found', 'Lead not found.');
      }

      return { success: true };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error;
      console.error('Error updating lead status:', error);
      throw new functions.https.HttpsError('internal', 'Failed to update lead status.');
    }
  });

// =============================================================================
// Delete Lead (Admin only)
// =============================================================================

export const deleteLead = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
    }

    // Verify admin role
    const roleResult = await queryOne<{ role: string }>(
      `SELECT role FROM user_roles WHERE user_id = $1 AND role = 'admin'`,
      [context.auth.uid]
    );

    if (!roleResult) {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required.');
    }

    const { leadId } = data;

    if (!leadId) {
      throw new functions.https.HttpsError('invalid-argument', 'leadId is required.');
    }

    try {
      const rowCount = await execute(
        `DELETE FROM leads WHERE id = $1`,
        [leadId]
      );

      if (rowCount === 0) {
        throw new functions.https.HttpsError('not-found', 'Lead not found.');
      }

      return { success: true };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error;
      console.error('Error deleting lead:', error);
      throw new functions.https.HttpsError('internal', 'Failed to delete lead.');
    }
  });
