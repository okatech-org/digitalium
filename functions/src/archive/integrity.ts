/**
 * Archive Cloud Functions — Integrity Verification
 *
 * archiveVerifyIntegrity
 */

import * as functions from 'firebase-functions';
import { execute } from '../utils/db';
import { getCallerInfo, logArchiveAudit } from './helpers';

const REGION = 'europe-west1';

// =============================================================================
// archiveVerifyIntegrity — Record integrity check result
// =============================================================================

export const archiveVerifyIntegrity = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { id, isValid, currentHash } = data;

    if (!id) {
      throw new functions.https.HttpsError('invalid-argument', 'id is required.');
    }

    // Update verification timestamp
    await execute(
      `UPDATE archive_documents SET hash_verified_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3)`,
      [id, caller.uid, caller.organizationId]
    );

    await logArchiveAudit(caller.uid, 'read', id, null, {
      action: 'integrity_check',
      isValid,
      currentHash,
    });

    return { success: true, isValid };
  });
