/**
 * Archive Cloud Functions — Document Operations
 *
 * archiveGetDocuments, archiveGetDocument, archiveCreateDocument,
 * archiveUpdateDocument, archiveDeleteDocument, archiveRestoreDocument,
 * archiveSearchDocuments
 */

import * as functions from 'firebase-functions';
import { query, queryOne, execute } from '../utils/db';
import { getCallerInfo, logArchiveAudit } from './helpers';

const REGION = 'europe-west1';

// =============================================================================
// archiveGetDocuments — List documents (optionally in a folder)
// =============================================================================

export const archiveGetDocuments = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { folderId, limit = 100, offset = 0 } = data || {};

    let sql: string;
    const params: unknown[] = [];
    let idx = 1;

    if (caller.organizationId) {
      sql = `SELECT * FROM archive_documents
             WHERE (user_id = $${idx} OR organization_id = $${idx + 1})
               AND status != 'deleted' AND deleted_at IS NULL`;
      params.push(caller.uid, caller.organizationId);
      idx = 3;
    } else {
      sql = `SELECT * FROM archive_documents
             WHERE user_id = $${idx}
               AND status != 'deleted' AND deleted_at IS NULL`;
      params.push(caller.uid);
      idx = 2;
    }

    if (folderId) {
      sql += ` AND folder_id = $${idx}`;
      params.push(folderId);
      idx++;
    }

    sql += ` ORDER BY updated_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const documents = await query(sql, params);
    return { documents };
  });

// =============================================================================
// archiveGetDocument — Get a single document by ID
// =============================================================================

export const archiveGetDocument = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { id } = data;

    if (!id) {
      throw new functions.https.HttpsError('invalid-argument', 'id is required.');
    }

    const document = await queryOne(
      `SELECT * FROM archive_documents
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3)`,
      [id, caller.uid, caller.organizationId]
    );

    if (!document) {
      throw new functions.https.HttpsError('not-found', 'Document not found.');
    }

    // Update last accessed timestamp (non-blocking)
    execute(
      `UPDATE archive_documents SET last_accessed_at = NOW() WHERE id = $1`,
      [id]
    ).catch(() => {});

    return { document };
  });

// =============================================================================
// archiveCreateDocument — Create a document record (after client-side upload)
// =============================================================================

export const archiveCreateDocument = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);

    const {
      folderId,
      filename,
      originalFilename,
      mimeType,
      sizeBytes,
      storagePath,
      storageUrl,
      title,
      description,
      documentType = 'other',
      tags = [],
      hashSha256,
      retentionYears = 10,
      expirationDate,
      metadata = {},
    } = data;

    if (!filename || !storagePath || !hashSha256) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'filename, storagePath, and hashSha256 are required.'
      );
    }

    // Verify folder exists if provided
    if (folderId) {
      const folder = await queryOne(
        `SELECT id FROM archive_folders WHERE id = $1 AND deleted_at IS NULL`,
        [folderId]
      );
      if (!folder) {
        throw new functions.https.HttpsError('not-found', 'Folder not found.');
      }
    }

    try {
      const document = await queryOne(
        `INSERT INTO archive_documents (
            user_id, organization_id, folder_id, filename, original_filename,
            mime_type, size_bytes, storage_path, storage_url, title,
            description, document_type, tags, hash_sha256, retention_years,
            expiration_date, metadata, status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'draft')
         RETURNING *`,
        [
          caller.uid,
          caller.organizationId,
          folderId || null,
          filename,
          originalFilename || filename,
          mimeType || 'application/octet-stream',
          sizeBytes || 0,
          storagePath,
          storageUrl || null,
          title || filename,
          description || null,
          documentType,
          tags,
          hashSha256,
          retentionYears,
          expirationDate || null,
          JSON.stringify(metadata),
        ]
      );

      // Create initial version record
      if (document) {
        const doc = document as { id: string };
        await execute(
          `INSERT INTO document_versions (document_id, version_number, storage_path, storage_url, hash_sha256, size_bytes, change_description, changed_by)
           VALUES ($1, 1, $2, $3, $4, $5, 'Version initiale', $6)`,
          [doc.id, storagePath, storageUrl || null, hashSha256, sizeBytes || 0, caller.uid]
        );

        // Update user storage usage
        const currentPeriod = new Date().toISOString().slice(0, 7);
        await execute(
          `UPDATE usage SET storage_bytes = storage_bytes + $1, documents_count = documents_count + 1, updated_at = NOW()
           WHERE user_id = $2 AND period = $3`,
          [sizeBytes || 0, caller.uid, currentPeriod]
        );

        await logArchiveAudit(caller.uid, 'create', doc.id, folderId, { filename, mimeType, sizeBytes });
      }

      return { document };
    } catch (error) {
      functions.logger.error('Error creating document:', error);
      throw new functions.https.HttpsError('internal', 'Failed to create document.');
    }
  });

// =============================================================================
// archiveUpdateDocument — Update document metadata
// =============================================================================

export const archiveUpdateDocument = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { id, title, description, tags, documentType, status, metadata } = data;

    if (!id) {
      throw new functions.https.HttpsError('invalid-argument', 'id is required.');
    }

    // Verify ownership
    const existing = await queryOne(
      `SELECT id FROM archive_documents
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3) AND deleted_at IS NULL`,
      [id, caller.uid, caller.organizationId]
    );

    if (!existing) {
      throw new functions.https.HttpsError('not-found', 'Document not found.');
    }

    const setClauses: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (title !== undefined) { setClauses.push(`title = $${idx}`); params.push(title); idx++; }
    if (description !== undefined) { setClauses.push(`description = $${idx}`); params.push(description); idx++; }
    if (tags !== undefined) { setClauses.push(`tags = $${idx}`); params.push(tags); idx++; }
    if (documentType !== undefined) { setClauses.push(`document_type = $${idx}`); params.push(documentType); idx++; }
    if (status !== undefined) { setClauses.push(`status = $${idx}`); params.push(status); idx++; }
    if (metadata !== undefined) { setClauses.push(`metadata = $${idx}`); params.push(JSON.stringify(metadata)); idx++; }

    if (setClauses.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'No fields to update.');
    }

    setClauses.push('updated_at = NOW()');
    params.push(id);

    const document = await queryOne(
      `UPDATE archive_documents SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    await logArchiveAudit(caller.uid, 'update', id, null, { updated_fields: Object.keys(data) });

    return { document };
  });

// =============================================================================
// archiveDeleteDocument — Soft or hard delete
// =============================================================================

export const archiveDeleteDocument = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { id, permanent = false } = data;

    if (!id) {
      throw new functions.https.HttpsError('invalid-argument', 'id is required.');
    }

    const existing = await queryOne<{ id: string; size_bytes: number; storage_path: string }>(
      `SELECT id, size_bytes, storage_path FROM archive_documents
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3)`,
      [id, caller.uid, caller.organizationId]
    );

    if (!existing) {
      throw new functions.https.HttpsError('not-found', 'Document not found.');
    }

    if (permanent) {
      // Hard delete (storage file deletion is handled client-side)
      await execute(`DELETE FROM archive_documents WHERE id = $1`, [id]);

      // Update usage
      const currentPeriod = new Date().toISOString().slice(0, 7);
      await execute(
        `UPDATE usage SET storage_bytes = GREATEST(0, storage_bytes - $1), documents_count = GREATEST(0, documents_count - 1), updated_at = NOW()
         WHERE user_id = $2 AND period = $3`,
        [existing.size_bytes, caller.uid, currentPeriod]
      );
    } else {
      // Soft delete
      await execute(
        `UPDATE archive_documents SET deleted_at = NOW(), status = 'deleted', updated_at = NOW()
         WHERE id = $1`,
        [id]
      );
    }

    await logArchiveAudit(caller.uid, 'delete', id, null, { permanent });

    return { success: true };
  });

// =============================================================================
// archiveRestoreDocument — Restore a soft-deleted document
// =============================================================================

export const archiveRestoreDocument = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { id } = data;

    if (!id) {
      throw new functions.https.HttpsError('invalid-argument', 'id is required.');
    }

    const existing = await queryOne(
      `SELECT id FROM archive_documents
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3) AND deleted_at IS NOT NULL`,
      [id, caller.uid, caller.organizationId]
    );

    if (!existing) {
      throw new functions.https.HttpsError('not-found', 'Deleted document not found.');
    }

    const document = await queryOne(
      `UPDATE archive_documents SET deleted_at = NULL, status = 'draft', updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );

    await logArchiveAudit(caller.uid, 'restore', id, null, {});

    return { document };
  });

// =============================================================================
// archiveSearchDocuments — Full-text + filter search
// =============================================================================

export const archiveSearchDocuments = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { query: searchQuery, folderId, tags, mimeTypes, documentType, dateFrom, dateTo, status, limit = 50 } = data || {};

    let sql: string;
    const params: unknown[] = [];
    let idx = 1;

    if (caller.organizationId) {
      sql = `SELECT * FROM archive_documents
             WHERE (user_id = $${idx} OR organization_id = $${idx + 1})
               AND deleted_at IS NULL`;
      params.push(caller.uid, caller.organizationId);
      idx = 3;
    } else {
      sql = `SELECT * FROM archive_documents WHERE user_id = $${idx} AND deleted_at IS NULL`;
      params.push(caller.uid);
      idx = 2;
    }

    // Full-text search
    if (searchQuery && searchQuery.trim()) {
      sql += ` AND (
        to_tsvector('french', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(extracted_text, ''))
        @@ plainto_tsquery('french', $${idx})
        OR title ILIKE $${idx + 1}
        OR original_filename ILIKE $${idx + 1}
      )`;
      params.push(searchQuery.trim(), `%${searchQuery.trim()}%`);
      idx += 2;
    }

    if (folderId) {
      sql += ` AND folder_id = $${idx}`;
      params.push(folderId);
      idx++;
    }

    if (tags && tags.length > 0) {
      sql += ` AND tags && $${idx}`;
      params.push(tags);
      idx++;
    }

    if (mimeTypes && mimeTypes.length > 0) {
      sql += ` AND mime_type = ANY($${idx})`;
      params.push(mimeTypes);
      idx++;
    }

    if (documentType) {
      sql += ` AND document_type = $${idx}`;
      params.push(documentType);
      idx++;
    }

    if (dateFrom) {
      sql += ` AND created_at >= $${idx}`;
      params.push(dateFrom);
      idx++;
    }

    if (dateTo) {
      sql += ` AND created_at <= $${idx}`;
      params.push(dateTo);
      idx++;
    }

    if (status) {
      sql += ` AND status = $${idx}`;
      params.push(status);
      idx++;
    }

    sql += ` ORDER BY updated_at DESC LIMIT $${idx}`;
    params.push(limit);

    const documents = await query(sql, params);
    return { documents };
  });
