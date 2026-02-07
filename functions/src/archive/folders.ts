/**
 * Archive Cloud Functions — Folder Operations
 *
 * archiveGetFolders, archiveGetFolder, archiveCreateFolder,
 * archiveUpdateFolder, archiveDeleteFolder
 */

import * as functions from 'firebase-functions';
import { query, queryOne, execute } from '../utils/db';
import { getCallerInfo, logArchiveAudit } from './helpers';

const REGION = 'europe-west1';

// =============================================================================
// archiveGetFolders — List folders for current user
// =============================================================================

export const archiveGetFolders = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { parentId, path: filterPath } = data || {};

    let sql = `SELECT * FROM archive_folders WHERE user_id = $1 AND deleted_at IS NULL`;
    const params: unknown[] = [caller.uid];
    let idx = 2;

    // If caller is in an org, also show org folders
    if (caller.organizationId) {
      sql = `SELECT * FROM archive_folders
             WHERE (user_id = $1 OR organization_id = $2) AND deleted_at IS NULL`;
      params.push(caller.organizationId);
      idx = 3;
    }

    if (parentId) {
      sql += ` AND parent_id = $${idx}`;
      params.push(parentId);
      idx++;
    } else if (parentId === null || parentId === undefined) {
      // If no parentId specified and no path filter, get root folders
      if (!filterPath) {
        sql += ` AND parent_id IS NULL`;
      }
    }

    if (filterPath) {
      sql += ` AND path = $${idx}`;
      params.push(filterPath);
      idx++;
    }

    sql += ` ORDER BY is_system DESC, name ASC`;

    const folders = await query(sql, params);
    return { folders };
  });

// =============================================================================
// archiveGetFolder — Get a single folder by ID
// =============================================================================

export const archiveGetFolder = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { id } = data;

    if (!id) {
      throw new functions.https.HttpsError('invalid-argument', 'id is required.');
    }

    const folder = await queryOne(
      `SELECT * FROM archive_folders
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3) AND deleted_at IS NULL`,
      [id, caller.uid, caller.organizationId]
    );

    if (!folder) {
      throw new functions.https.HttpsError('not-found', 'Folder not found.');
    }

    return { folder };
  });

// =============================================================================
// archiveCreateFolder — Create a new folder
// =============================================================================

export const archiveCreateFolder = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { name, description, parentId, level = 'dossier', icon = '📁', color = 'bg-blue-500' } = data;

    if (!name) {
      throw new functions.https.HttpsError('invalid-argument', 'name is required.');
    }

    // Verify parent exists if provided
    if (parentId) {
      const parent = await queryOne(
        `SELECT id FROM archive_folders WHERE id = $1 AND deleted_at IS NULL`,
        [parentId]
      );
      if (!parent) {
        throw new functions.https.HttpsError('not-found', 'Parent folder not found.');
      }
    }

    try {
      const folder = await queryOne<{ id: string }>(
        `INSERT INTO archive_folders (user_id, organization_id, parent_id, level, name, description, icon, color)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [caller.uid, caller.organizationId, parentId || null, level, name, description || null, icon, color]
      );

      await logArchiveAudit(caller.uid, 'create', null, folder?.id || null, { name, level });

      return { folder };
    } catch (error) {
      functions.logger.error('Error creating folder:', error);
      throw new functions.https.HttpsError('internal', 'Failed to create folder.');
    }
  });

// =============================================================================
// archiveUpdateFolder — Update folder details
// =============================================================================

export const archiveUpdateFolder = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { id, name, description, icon, color } = data;

    if (!id) {
      throw new functions.https.HttpsError('invalid-argument', 'id is required.');
    }

    // Verify ownership
    const existing = await queryOne(
      `SELECT id, is_system FROM archive_folders
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3) AND deleted_at IS NULL`,
      [id, caller.uid, caller.organizationId]
    );

    if (!existing) {
      throw new functions.https.HttpsError('not-found', 'Folder not found.');
    }

    const setClauses: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (name !== undefined) { setClauses.push(`name = $${idx}`); params.push(name); idx++; }
    if (description !== undefined) { setClauses.push(`description = $${idx}`); params.push(description); idx++; }
    if (icon !== undefined) { setClauses.push(`icon = $${idx}`); params.push(icon); idx++; }
    if (color !== undefined) { setClauses.push(`color = $${idx}`); params.push(color); idx++; }

    if (setClauses.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'No fields to update.');
    }

    setClauses.push('updated_at = NOW()');
    params.push(id);

    const folder = await queryOne(
      `UPDATE archive_folders SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );

    await logArchiveAudit(caller.uid, 'update', null, id, { updated_fields: Object.keys(data) });

    return { folder };
  });

// =============================================================================
// archiveDeleteFolder — Soft/hard delete a folder
// =============================================================================

export const archiveDeleteFolder = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { id, permanent = false } = data;

    if (!id) {
      throw new functions.https.HttpsError('invalid-argument', 'id is required.');
    }

    // Verify ownership
    const existing = await queryOne<{ id: string; is_system: boolean }>(
      `SELECT id, is_system FROM archive_folders
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3) AND deleted_at IS NULL`,
      [id, caller.uid, caller.organizationId]
    );

    if (!existing) {
      throw new functions.https.HttpsError('not-found', 'Folder not found.');
    }

    if (existing.is_system) {
      throw new functions.https.HttpsError('failed-precondition', 'Cannot delete system folders.');
    }

    if (permanent) {
      // Hard delete (cascade will handle children)
      await execute(`DELETE FROM archive_folders WHERE id = $1`, [id]);
    } else {
      // Soft delete
      await execute(
        `UPDATE archive_folders SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [id]
      );
      // Also soft delete all documents in folder
      await execute(
        `UPDATE archive_documents SET deleted_at = NOW(), status = 'deleted', updated_at = NOW()
         WHERE folder_id = $1 AND deleted_at IS NULL`,
        [id]
      );
    }

    await logArchiveAudit(caller.uid, 'delete', null, id, { permanent });

    return { success: true };
  });
