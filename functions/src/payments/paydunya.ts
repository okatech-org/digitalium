/**
 * PayDunya Payment Integration
 * Supports Mobile Money (MTN, Airtel, Moov) for West/Central Africa
 * Documentation: https://paydunya.com/developers
 */

import * as functions from 'firebase-functions';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { execute, queryOne } from '../utils/db';
import { getPayDunyaConfig } from '../utils/secrets';

const PAYDUNYA_BASE_URL = {
  test: 'https://app.paydunya.com/sandbox-api/v1',
  live: 'https://app.paydunya.com/api/v1',
  demo: 'https://app.paydunya.com/sandbox-api/v1', // Demo mode uses sandbox URL but skips API calls
};

async function getHeaders() {
  const config = await getPayDunyaConfig();
  return {
    'Content-Type': 'application/json',
    'PAYDUNYA-MASTER-KEY': config.masterKey,
    'PAYDUNYA-PRIVATE-KEY': config.privateKey,
    'PAYDUNYA-TOKEN': config.token,
  };
}

async function getBaseUrl() {
  const config = await getPayDunyaConfig();
  return PAYDUNYA_BASE_URL[config.mode];
}

/**
 * Initialize a PayDunya payment
 */
export const initPayDunyaPayment = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { planId, billingCycle, returnUrl } = data;
    const userId = context.auth.uid;

    // Get plan details
    const plan = await queryOne<{
      id: string;
      display_name: string;
      price_xaf: number;
      price_yearly_xaf: number;
    }>(`SELECT * FROM plans WHERE id = $1 AND is_active = true`, [planId]);

    if (!plan) {
      throw new functions.https.HttpsError('not-found', 'Plan not found');
    }

    const amount = billingCycle === 'yearly' && plan.price_yearly_xaf
      ? plan.price_yearly_xaf
      : plan.price_xaf;

    const transactionId = uuidv4();
    const config = await getPayDunyaConfig();

    // DEMO MODE: Simulate successful payment without calling real API
    if (config.mode === 'demo' || process.env.PAYMENT_DEMO_MODE === 'true') {
      functions.logger.info('PayDunya DEMO MODE: Simulating payment', { planId, amount });

      // Store pending transaction
      await execute(
        `INSERT INTO payment_transactions (id, user_id, amount_xaf, payment_method, provider, status, provider_reference, metadata, created_at)
         VALUES ($1, $2, $3, 'mobile_money_mtn', 'paydunya', 'pending', $4, $5, NOW())`,
        [
          transactionId,
          userId,
          amount,
          `demo-${transactionId}`,
          JSON.stringify({ planId, billingCycle }),
        ]
      );

      // Return demo payment URL that will auto-complete
      return {
        success: true,
        transactionId,
        paymentUrl: `${returnUrl || '/billing'}?demo=true&transaction=${transactionId}&plan=${planId}&cycle=${billingCycle}`,
        token: `demo-${transactionId}`,
        demoMode: true,
      };
    }

    // PRODUCTION/TEST MODE: Call real PayDunya API
    try {
      const response = await axios.post(
        `${await getBaseUrl()}/checkout-invoice/create`,
        {
          invoice: {
            total_amount: amount,
            description: `Abonnement DIGITALIUM ${plan.display_name}`,
          },
          store: {
            name: 'DIGITALIUM',
            tagline: 'Gestion Documentaire Intelligente',
            postal_address: 'Libreville, Gabon',
            phone: '+241 XX XX XX XX',
            logo_url: 'https://digitalium.ga/logo.png',
            website_url: 'https://digitalium.ga',
          },
          actions: {
            callback_url: `${process.env.API_URL}/paydunyaWebhook`,
            return_url: returnUrl || 'https://digitalium.ga/billing?status=success',
            cancel_url: data.cancelUrl || 'https://digitalium.ga/billing?status=canceled',
          },
          custom_data: {
            user_id: userId,
            plan_id: planId,
            billing_cycle: billingCycle,
            transaction_id: transactionId,
          },
        },
        { headers: await getHeaders() }
      );

      if (response.data.response_code === '00') {
        // Store pending transaction
        await execute(
          `INSERT INTO payment_transactions (id, user_id, amount_xaf, payment_method, provider, status, provider_reference, metadata, created_at)
           VALUES ($1, $2, $3, 'mobile_money_mtn', 'paydunya', 'pending', $4, $5, NOW())`,
          [
            transactionId,
            userId,
            amount,
            response.data.token,
            JSON.stringify({ planId, billingCycle }),
          ]
        );

        return {
          success: true,
          transactionId,
          paymentUrl: response.data.response_text,
          token: response.data.token,
        };
      } else {
        throw new Error(response.data.response_text || 'Payment initialization failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      functions.logger.error('PayDunya payment init error:', error);
      throw new functions.https.HttpsError('internal', `Payment failed: ${errorMessage}`);
    }
  });

/**
 * PayDunya webhook handler
 */
export const paydunyaWebhook = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const { data } = req.body;

    if (!data) {
      res.status(400).send('Invalid payload');
      return;
    }

    functions.logger.info('PayDunya webhook received:', data);

    try {
      const { status, token, custom_data } = data;

      if (status === 'completed') {
        // Get transaction
        const transaction = await queryOne<{
          id: string;
          user_id: string;
          metadata: { planId: string; billingCycle: string };
        }>(
          `SELECT * FROM payment_transactions WHERE provider_reference = $1 AND provider = 'paydunya'`,
          [token]
        );

        if (transaction) {
          // Update transaction status
          await execute(
            `UPDATE payment_transactions SET status = 'completed', completed_at = NOW() WHERE id = $1`,
            [transaction.id]
          );

          // Create subscription
          const { planId, billingCycle } = custom_data || transaction.metadata;

          // Import and call createSubscription logic here
          // For now, we'll do it inline
          const plan = await queryOne<{ id: string; price_xaf: number }>(
            `SELECT * FROM plans WHERE id = $1`,
            [planId]
          );

          if (plan) {
            const now = new Date();
            let periodEnd: Date;
            if (billingCycle === 'yearly') {
              periodEnd = new Date(now.setFullYear(now.getFullYear() + 1));
            } else {
              periodEnd = new Date(now.setMonth(now.getMonth() + 1));
            }

            // Cancel existing subscription
            await execute(
              `UPDATE subscriptions SET status = 'canceled', canceled_at = NOW() WHERE user_id = $1 AND status = 'active'`,
              [transaction.user_id]
            );

            // Create new subscription
            await execute(
              `INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, payment_method, created_at, updated_at)
               VALUES ($1, $2, $3, 'active', NOW(), $4, 'mobile_money_mtn', NOW(), NOW())`,
              [uuidv4(), transaction.user_id, planId, periodEnd.toISOString()]
            );
          }

          functions.logger.info('PayDunya payment completed:', { transactionId: transaction.id });
        }
      } else if (status === 'failed' || status === 'cancelled') {
        await execute(
          `UPDATE payment_transactions SET status = $1 WHERE provider_reference = $2 AND provider = 'paydunya'`,
          [status === 'cancelled' ? 'canceled' : 'failed', token]
        );
      }

      res.status(200).send('OK');
    } catch (error) {
      functions.logger.error('PayDunya webhook error:', error);
      res.status(500).send('Internal error');
    }
  });

/**
 * Check PayDunya payment status
 */
export const checkPayDunyaStatus = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { token } = data;

    try {
      const response = await axios.get(
        `${await getBaseUrl()}/checkout-invoice/confirm/${token}`,
        { headers: await getHeaders() }
      );

      return {
        status: response.data.status,
        receipt: response.data.receipt_url,
      };
    } catch (error) {
      functions.logger.error('PayDunya status check error:', error);
      throw new functions.https.HttpsError('internal', 'Failed to check payment status');
    }
  });

/**
 * Complete a demo payment (for testing without real payment providers)
 */
export const completePayDunyaDemoPayment = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { transactionId, planId, billingCycle } = data;
    const userId = context.auth.uid;

    functions.logger.info('Completing demo payment', { userId, planId, transactionId });

    try {
      // Get plan details
      const plan = await queryOne<{ id: string; price_xaf: number; display_name: string }>(
        `SELECT * FROM plans WHERE id = $1`,
        [planId]
      );

      if (!plan) {
        throw new functions.https.HttpsError('not-found', 'Plan not found');
      }

      // Update transaction status if exists
      if (transactionId) {
        await execute(
          `UPDATE payment_transactions SET status = 'completed', completed_at = NOW() WHERE id = $1 OR provider_reference = $2`,
          [transactionId, `demo-${transactionId}`]
        );
      }

      // Cancel existing subscription
      await execute(
        `UPDATE subscriptions SET status = 'canceled', canceled_at = NOW() WHERE user_id = $1 AND status = 'active'`,
        [userId]
      );

      // Calculate period end
      const now = new Date();
      let periodEnd: Date;
      if (billingCycle === 'yearly') {
        periodEnd = new Date(now.setFullYear(now.getFullYear() + 1));
      } else {
        periodEnd = new Date(now.setMonth(now.getMonth() + 1));
      }

      // Create new subscription
      const subscriptionId = uuidv4();
      await execute(
        `INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, payment_method, created_at, updated_at)
         VALUES ($1, $2, $3, 'active', NOW(), $4, 'mobile_money_mtn', NOW(), NOW())`,
        [subscriptionId, userId, planId, periodEnd.toISOString()]
      );

      functions.logger.info('Demo payment completed successfully', { subscriptionId, planId });

      return {
        success: true,
        subscriptionId,
        plan: plan.display_name,
        periodEnd: periodEnd.toISOString(),
      };
    } catch (error) {
      functions.logger.error('Demo payment completion error:', error);
      throw new functions.https.HttpsError('internal', 'Failed to complete demo payment');
    }
  });
