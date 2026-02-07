/**
 * Signature Cloud Functions — Workflows
 *
 * signatureGetWorkflows, signatureCreateWorkflow, signatureUpdateWorkflow,
 * signatureDeleteWorkflow, signatureLaunchWorkflow
 */

import * as functions from 'firebase-functions';
import { query, queryOne, execute } from '../utils/db';
import { getCallerInfo } from '../archive/helpers';
import { logSignatureAudit } from './helpers';

const REGION = 'europe-west1';

// =============================================================================
// signatureGetWorkflows — Get workflow templates
// =============================================================================

export const signatureGetWorkflows = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);

    let sql: string;
    const params: unknown[] = [];

    if (caller.organizationId) {
      sql = `SELECT * FROM signature_workflows
             WHERE (user_id = $1 OR organization_id = $2) AND deleted_at IS NULL
             ORDER BY usage_count DESC, created_at DESC`;
      params.push(caller.uid, caller.organizationId);
    } else {
      sql = `SELECT * FROM signature_workflows
             WHERE user_id = $1 AND deleted_at IS NULL
             ORDER BY usage_count DESC, created_at DESC`;
      params.push(caller.uid);
    }

    const workflows = await query(sql, params);

    // Fetch steps for each workflow
    const workflowIds = (workflows as { id: string }[]).map(w => w.id);
    let steps: unknown[] = [];
    if (workflowIds.length > 0) {
      const placeholders = workflowIds.map((_, i) => `$${i + 1}`).join(',');
      steps = await query(
        `SELECT * FROM signature_workflow_steps WHERE workflow_id IN (${placeholders}) ORDER BY step_order`,
        workflowIds
      );
    }

    return { workflows, steps };
  });

// =============================================================================
// signatureCreateWorkflow — Create a new workflow template
// =============================================================================

export const signatureCreateWorkflow = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { name, description, steps = [] } = data;

    if (!name) {
      throw new functions.https.HttpsError('invalid-argument', 'name is required.');
    }

    if (!steps.length) {
      throw new functions.https.HttpsError('invalid-argument', 'At least one step is required.');
    }

    try {
      const workflow = await queryOne<{ id: string }>(
        `INSERT INTO signature_workflows (user_id, organization_id, name, description)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [caller.uid, caller.organizationId, name, description || null]
      );

      if (!workflow) {
        throw new functions.https.HttpsError('internal', 'Failed to create workflow.');
      }

      // Insert steps
      for (const step of steps) {
        await execute(
          `INSERT INTO signature_workflow_steps (workflow_id, step_order, role, action, is_required, default_user_id, default_user_name, default_user_email)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            workflow.id,
            step.order || 1,
            step.role,
            step.action || 'sign',
            step.isRequired !== false,
            step.defaultUserId || null,
            step.defaultUserName || null,
            step.defaultUserEmail || null,
          ]
        );
      }

      await logSignatureAudit(caller.uid, 'workflow_created', null, null, workflow.id, {
        name,
        stepCount: steps.length,
      });

      // Return complete workflow with steps
      const fullWorkflow = await queryOne(
        `SELECT * FROM signature_workflows WHERE id = $1`,
        [workflow.id]
      );

      const fullSteps = await query(
        `SELECT * FROM signature_workflow_steps WHERE workflow_id = $1 ORDER BY step_order`,
        [workflow.id]
      );

      return { workflow: fullWorkflow, steps: fullSteps };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) throw error;
      functions.logger.error('Error creating workflow:', error);
      throw new functions.https.HttpsError('internal', 'Failed to create workflow.');
    }
  });

// =============================================================================
// signatureUpdateWorkflow — Update a workflow template
// =============================================================================

export const signatureUpdateWorkflow = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { workflowId, name, description, status, steps } = data;

    if (!workflowId) {
      throw new functions.https.HttpsError('invalid-argument', 'workflowId is required.');
    }

    // Verify ownership
    const workflow = await queryOne<{ id: string }>(
      `SELECT id FROM signature_workflows
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3) AND deleted_at IS NULL`,
      [workflowId, caller.uid, caller.organizationId]
    );

    if (!workflow) {
      throw new functions.https.HttpsError('not-found', 'Workflow not found.');
    }

    // Build dynamic update
    const updates: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (name !== undefined) {
      updates.push(`name = $${idx}`);
      params.push(name);
      idx++;
    }
    if (description !== undefined) {
      updates.push(`description = $${idx}`);
      params.push(description);
      idx++;
    }
    if (status !== undefined) {
      updates.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }

    if (updates.length > 0) {
      params.push(workflowId);
      await execute(
        `UPDATE signature_workflows SET ${updates.join(', ')} WHERE id = $${idx}`,
        params
      );
    }

    // Replace steps if provided
    if (steps && Array.isArray(steps)) {
      // Delete existing steps
      await execute(
        `DELETE FROM signature_workflow_steps WHERE workflow_id = $1`,
        [workflowId]
      );

      // Insert new steps
      for (const step of steps) {
        await execute(
          `INSERT INTO signature_workflow_steps (workflow_id, step_order, role, action, is_required, default_user_id, default_user_name, default_user_email)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            workflowId,
            step.order || 1,
            step.role,
            step.action || 'sign',
            step.isRequired !== false,
            step.defaultUserId || null,
            step.defaultUserName || null,
            step.defaultUserEmail || null,
          ]
        );
      }
    }

    await logSignatureAudit(caller.uid, 'workflow_updated', null, null, workflowId, {
      updatedFields: updates.length > 0 ? updates : undefined,
      stepsReplaced: !!steps,
    });

    return { success: true };
  });

// =============================================================================
// signatureDeleteWorkflow — Soft-delete a workflow
// =============================================================================

export const signatureDeleteWorkflow = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const { workflowId } = data;

    if (!workflowId) {
      throw new functions.https.HttpsError('invalid-argument', 'workflowId is required.');
    }

    // Verify ownership
    const workflow = await queryOne<{ id: string }>(
      `SELECT id FROM signature_workflows
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3) AND deleted_at IS NULL`,
      [workflowId, caller.uid, caller.organizationId]
    );

    if (!workflow) {
      throw new functions.https.HttpsError('not-found', 'Workflow not found.');
    }

    await execute(
      `UPDATE signature_workflows SET deleted_at = NOW(), status = 'archived' WHERE id = $1`,
      [workflowId]
    );

    await logSignatureAudit(caller.uid, 'workflow_deleted', null, null, workflowId);

    return { success: true };
  });

// =============================================================================
// signatureLaunchWorkflow — Create a signature request from a workflow template
// =============================================================================

export const signatureLaunchWorkflow = functions
  .region(REGION)
  .https.onCall(async (data, context) => {
    const caller = await getCallerInfo(context);
    const {
      workflowId,
      documentId,
      documentTitle,
      documentHash,
      message,
      expiresAt,
      signatoryOverrides = {},
    } = data;

    if (!workflowId || !documentTitle) {
      throw new functions.https.HttpsError('invalid-argument', 'workflowId and documentTitle are required.');
    }

    // Get workflow and steps
    const workflow = await queryOne<{ id: string; name: string }>(
      `SELECT id, name FROM signature_workflows
       WHERE id = $1 AND (user_id = $2 OR organization_id = $3) AND deleted_at IS NULL AND status = 'active'`,
      [workflowId, caller.uid, caller.organizationId]
    );

    if (!workflow) {
      throw new functions.https.HttpsError('not-found', 'Active workflow not found.');
    }

    const steps = await query<{
      id: string;
      step_order: number;
      role: string;
      action: string;
      default_user_id: string | null;
      default_user_name: string | null;
      default_user_email: string | null;
    }>(
      `SELECT * FROM signature_workflow_steps WHERE workflow_id = $1 ORDER BY step_order`,
      [workflowId]
    );

    if (!steps.length) {
      throw new functions.https.HttpsError('failed-precondition', 'Workflow has no steps.');
    }

    // Create the signature request
    const request = await queryOne<{ id: string }>(
      `INSERT INTO signature_requests (document_id, document_title, document_hash, status, message, created_by, organization_id, expires_at)
       VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7)
       RETURNING id`,
      [
        documentId || null,
        documentTitle,
        documentHash || null,
        message || null,
        caller.uid,
        caller.organizationId,
        expiresAt || null,
      ]
    );

    if (!request) {
      throw new functions.https.HttpsError('internal', 'Failed to create request from workflow.');
    }

    // Create signatories from workflow steps (with optional overrides)
    for (const step of steps) {
      const override = signatoryOverrides[step.id] || {};
      await execute(
        `INSERT INTO signature_signatories (request_id, user_id, user_name, user_email, role, sign_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          request.id,
          override.userId || step.default_user_id || null,
          override.userName || step.default_user_name || step.role,
          override.userEmail || step.default_user_email || '',
          step.role,
          step.step_order,
        ]
      );
    }

    // Increment workflow usage
    await execute(
      `UPDATE signature_workflows SET usage_count = usage_count + 1, last_used_at = NOW() WHERE id = $1`,
      [workflowId]
    );

    await logSignatureAudit(caller.uid, 'workflow_launched', request.id, null, workflowId, {
      workflowName: workflow.name,
      documentTitle,
    });

    return { requestId: request.id, success: true };
  });
