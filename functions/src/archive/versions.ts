/**
 * Archive Cloud Functions — Version Control
 *
 * archiveGetVersions, archiveCreateVersion
 */

import * as functions from 'firebase-functions';
import { query, queryOne, execute } from '../utils/db';
import { getCallerInfo, logArchiveAudit } from './helpers';

const REGION = 'europe-west1';

// =============================================================================
// archiveGetVersions — Get version history for a document
// =============================================================================

export const archiveGetVersions = functions
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

    const versions = await query(
      `SELECT * FROM document_versions WHERE document_id = $1 ORDER BY version_number DESC`,
      [documentId]
    );

    return { versions };
  });

// =============================================================================
// archiveCreateVersion — Create a new version for a document
// =============================================================================

export const archiveCreateVersion = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { documentId, storagePath, storageUrl, hashSha256, sizeBytes, changeDescription } = data;

    if (!documentId || !storagePath || !hashSha256) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'documentId, storagePath, and hashSha256 are required.'
      );
    }

    // Verify ownership and get current version
    const doc = await queryOne<{ id: string; version: number }>(
      `SELECT id, version FROM archive_documents
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3) AND deleted_at IS NULL`,
      [documentId, caller.uid, caller.organizationId]
    );

    if (!doc) {
      throw new functions.https.HttpsError('not-found', 'Document not found.');
    }

    const newVersionNumber = doc.version + 1;

    try {
      // Create version record
      const version = await queryOne(
        `INSERT INTO document_versions (document_id, version_number, storage_path, storage_url, hash_sha256, size_bytes, change_description, changed_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [documentId, newVersionNumber, storagePath, storageUrl || null, hashSha256, sizeBytes || 0, changeDescription || null, caller.uid]
      );

      // Update the main document with new version info
      await execute(
        `UPDATE archive_documents
         SET version = $1, storage_path = $2, storage_url = $3, hash_sha256 = $4,
             size_bytes = $5, updated_at = NOW()
         WHERE id = $6`,
        [newVersionNumber, storagePath, storageUrl || null, hashSha256, sizeBytes || 0, documentId]
      );

      await logArchiveAudit(caller.uid, 'version', documentId, null, {
        versionNumber: newVersionNumber,
        changeDescription,
      });

      return { version };
    } catch (error) {
      functions.logger.error('Error creating version:', error);
      throw new functions.https.HttpsError('internal', 'Failed to create version.');
    }
  });
