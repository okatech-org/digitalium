/**
 * Signature Helpers — shared utilities for signature Cloud Functions
 */

import * as functions from 'firebase-functions';
import { execute } from '../utils/db';

/**
 * Log a signature audit event
 */
export async function logSignatureAudit(
  userId: string,
  action: string,
  requestId?: string | null,
  signatoryId?: string | null,
  workflowId?: string | null,
  details: Record<string, unknown> = {},
  ipAddress?: string | null
): Promise<void> {
  try {
    await execute(
      `INSERT INTO signature_audit_logs (user_id, action, request_id, signatory_id, workflow_id, action_details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        action,
        requestId || null,
        signatoryId || null,
        workflowId || null,
        JSON.stringify(details),
        ipAddress || null,
      ]
    );
  } catch (error) {
    functions.logger.warn('Failed to log signature audit:', error);
  }
}

/**
 * Generate a unique certificate number: CERT-YYYYMMDD-XXXXX
 */
export function generateCertificateNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CERT-${dateStr}-${rand}`;
}

/**
 * Generate a verification token for certificates
 */
export function generateVerificationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
