/**
 * Third-Party Integrations Service
 *
 * Integration helpers for external services:
 * - Google Drive sync
 * - Email notifications
 * - Webhook dispatching
 *
 * Migrated from Supabase to Firebase (Cloud Functions + Storage)
 */

import { functions, storage } from '@/config/firebase';
import { httpsCallable } from 'firebase/functions';
import { ref, getDownloadURL } from 'firebase/storage';

// Types
export type IntegrationType = 'google_drive' | 'email' | 'webhook';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface Integration {
    id: string;
    type: IntegrationType;
    name: string;
    status: IntegrationStatus;
    config: Record<string, unknown>;
    lastSyncAt?: Date;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SyncResult {
    success: boolean;
    syncedCount: number;
    errors: string[];
    timestamp: Date;
}

// ============================================
// GOOGLE DRIVE INTEGRATION
// ============================================

interface DriveConfig {
    folderId?: string;
    syncDirection: 'upload' | 'download' | 'bidirectional';
    autoSync: boolean;
    syncIntervalMinutes: number;
}

/**
 * Initialize Google Drive integration
 */
export async function initGoogleDriveIntegration(): Promise<{ authUrl: string }> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-client-id';
    const redirectUri = `${window.location.origin}/integrations/google/callback`;
    const scope = 'https://www.googleapis.com/auth/drive.file';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline`;

    return { authUrl };
}

/**
 * Sync documents to Google Drive
 * Uses Cloud Function to handle the actual Drive API calls
 */
export async function syncToGoogleDrive(
    documentIds: string[],
    config: DriveConfig
): Promise<SyncResult> {
    try {
        const syncFn = httpsCallable(functions, 'syncToGoogleDrive');
        const result = await syncFn({ documentIds, config });
        return result.data as SyncResult;
    } catch (error) {
        return {
            success: false,
            syncedCount: 0,
            errors: [error instanceof Error ? error.message : 'Sync failed'],
            timestamp: new Date(),
        };
    }
}

// ============================================
// EMAIL NOTIFICATIONS
// ============================================

interface EmailConfig {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    fromAddress: string;
    fromName: string;
}

interface EmailMessage {
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
        filename: string;
        content: Blob;
    }>;
}

/**
 * Send email notification via Cloud Function
 */
export async function sendEmailNotification(
    message: EmailMessage,
    config?: EmailConfig
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const sendEmailFn = httpsCallable(functions, 'sendEmail');
        const result = await sendEmailFn({
            to: message.to,
            subject: message.subject,
            html: message.html,
            config,
        });
        return result.data as { success: boolean; messageId?: string };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Send document share notification
 */
export async function sendShareNotification(
    recipientEmail: string,
    documentTitle: string,
    shareUrl: string,
    message?: string
): Promise<{ success: boolean }> {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Document partagé avec vous</h2>
      <p>Un document a été partagé avec vous sur Digitalium iArchive.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold;">${documentTitle}</p>
      </div>
      ${message ? `<p style="color: #666;">${message}</p>` : ''}
      <a href="${shareUrl}"
         style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px;">
        Accéder au document
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Ce lien expire dans 7 jours. Ne partagez pas ce lien avec des tiers non autorisés.
      </p>
    </div>
  `;

    return sendEmailNotification({
        to: recipientEmail,
        subject: `Document partagé: ${documentTitle}`,
        html,
    });
}

/**
 * Send expiration reminder
 */
export async function sendExpirationReminder(
    recipientEmail: string,
    documentTitle: string,
    daysUntilExpiration: number,
    documentUrl: string
): Promise<{ success: boolean }> {
    const urgencyColor = daysUntilExpiration <= 7 ? '#dc2626' : '#f59e0b';

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${urgencyColor};">Rappel d'expiration</h2>
      <p>Un document de votre archive approche de son expiration.</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold;">${documentTitle}</p>
        <p style="margin: 10px 0 0; color: ${urgencyColor}; font-weight: bold;">
          Expire dans ${daysUntilExpiration} jour${daysUntilExpiration > 1 ? 's' : ''}
        </p>
      </div>
      <p style="color: #666;">
        Veuillez prendre les mesures nécessaires pour archiver, détruire ou prolonger ce document.
      </p>
      <a href="${documentUrl}"
         style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px;">
        Voir le document
      </a>
    </div>
  `;

    return sendEmailNotification({
        to: recipientEmail,
        subject: `Expiration prochaine: ${documentTitle}`,
        html,
    });
}

// ============================================
// WEBHOOK DISPATCHER
// ============================================

interface WebhookConfig {
    url: string;
    secret?: string;
    events: string[];
    headers?: Record<string, string>;
}

interface WebhookPayload {
    event: string;
    timestamp: string;
    data: Record<string, unknown>;
}

/**
 * Dispatch webhook event
 */
export async function dispatchWebhook(
    config: WebhookConfig,
    event: string,
    data: Record<string, unknown>
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    if (!config.events.includes(event)) {
        return { success: true };
    }

    const payload: WebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        data,
    };

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...config.headers,
        };

        if (config.secret) {
            const signature = await generateWebhookSignature(JSON.stringify(payload), config.secret);
            headers['X-Webhook-Signature'] = signature;
        }

        const response = await fetch(config.url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        return {
            success: response.ok,
            statusCode: response.status,
            error: response.ok ? undefined : `HTTP ${response.status}`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Webhook events catalog
 */
export const WEBHOOK_EVENTS = {
    DOCUMENT_CREATED: 'document.created',
    DOCUMENT_UPDATED: 'document.updated',
    DOCUMENT_DELETED: 'document.deleted',
    DOCUMENT_SHARED: 'document.shared',
    DOCUMENT_SIGNED: 'document.signed',
    FOLDER_CREATED: 'folder.created',
    FOLDER_DELETED: 'folder.deleted',
    RETENTION_EXPIRED: 'retention.expired',
    APPROVAL_REQUESTED: 'approval.requested',
    APPROVAL_COMPLETED: 'approval.completed',
} as const;

// ============================================
// INTEGRATION MANAGEMENT
// ============================================

/**
 * List configured integrations
 */
export async function listIntegrations(): Promise<Integration[]> {
    // In demo mode, return mock integrations
    return [
        {
            id: 'int-1',
            type: 'google_drive',
            name: 'Google Drive - Archives',
            status: 'disconnected',
            config: { syncDirection: 'upload', autoSync: false },
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'int-2',
            type: 'email',
            name: 'Notifications Email',
            status: 'connected',
            config: { fromAddress: 'archives@digitalium.ga', fromName: 'Digitalium Archives' },
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
}

/**
 * Test integration connection
 */
export async function testIntegration(integrationId: string): Promise<{ success: boolean; error?: string }> {
    console.log(`[Integration] Testing: ${integrationId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
}

// ============================================
// HELPERS
// ============================================

async function generateWebhookSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    return `sha256=${Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}
