/**
 * CinetPay Payment Integration
 * Popular in French-speaking Africa for Mobile Money
 * Documentation: https://docs.cinetpay.com
 */

import * as functions from 'firebase-functions';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { execute, queryOne } from '../utils/db';
import { getCinetPayConfig } from '../utils/secrets';

const CINETPAY_BASE_URL = 'https://api-checkout.cinetpay.com/v2';

/**
 * Initialize a CinetPay payment
 */
export const initCinetPayPayment = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { planId, billingCycle, phoneNumber, returnUrl, notifyUrl } = data;
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

    const transactionId = `DGTL-${Date.now()}`;
    const config = await getCinetPayConfig();

    // Check for demo mode
    if ((config.mode as string) === 'demo') {
      return {
        success: true,
        transactionId,
        paymentUrl: `${returnUrl || 'https://digitalium.ga/billing?status=success'}&demo=true`,
        paymentToken: 'DEMO-TOKEN',
        demoMode: true,
      };
    }

    try {
      const response = await axios.post(
        `${CINETPAY_BASE_URL}/payment`,
        {
          apikey: config.apiKey,
          site_id: config.siteId,
          transaction_id: transactionId,
          amount,
          currency: 'XAF',
          description: `Abonnement DIGITALIUM ${plan.display_name}`,
          return_url: returnUrl || 'https://digitalium.ga/billing?status=success',
          notify_url: notifyUrl || `${process.env.API_URL}/cinetpayWebhook`,
          channels: 'ALL',
          metadata: JSON.stringify({
            user_id: userId,
            plan_id: planId,
            billing_cycle: billingCycle,
          }),
          customer_name: context.auth.token.name || 'Client',
          customer_surname: 'DIGITALIUM',
          customer_email: context.auth.token.email || 'customer@digitalium.ga',
          customer_phone_number: phoneNumber || '',
          customer_address: 'Libreville',
          customer_city: 'Libreville',
          customer_country: 'GA',
          customer_state: 'ES',
          customer_zip_code: '00000',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.code === '201') {
        // Store pending transaction
        await execute(
          `INSERT INTO payment_transactions (id, user_id, amount_xaf, payment_method, provider, status, provider_reference, phone_number, metadata, created_at)
           VALUES ($1, $2, $3, 'mobile_money_mtn', 'cinetpay', 'pending', $4, $5, $6, NOW())`,
          [
            transactionId,
            userId,
            amount,
            response.data.data.payment_token,
            phoneNumber || null,
            JSON.stringify({ planId, billingCycle }),
          ]
        );

        return {
          success: true,
          transactionId,
          paymentUrl: response.data.data.payment_url,
          paymentToken: response.data.data.payment_token,
        };
      } else {
        throw new Error(response.data.message || 'Payment initialization failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      functions.logger.error('CinetPay payment init error:', error);
      throw new functions.https.HttpsError('internal', `Payment failed: ${errorMessage}`);
    }
  });

/**
 * CinetPay webhook handler (IPN - Instant Payment Notification)
 */
export const cinetpayWebhook = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const { cpm_trans_id, cpm_site_id, cpm_trans_status } = req.body;

    functions.logger.info('CinetPay webhook received:', { cpm_trans_id, cpm_trans_status });

    const config = await getCinetPayConfig();

    // Verify site_id
    if (cpm_site_id !== config.siteId) {
      functions.logger.warn('Invalid CinetPay site_id');
      res.status(401).send('Unauthorized');
      return;
    }

    try {
      // Verify transaction status with CinetPay API
      const verifyResponse = await axios.post(
        `${CINETPAY_BASE_URL}/payment/check`,
        {
          apikey: config.apiKey,
          site_id: config.siteId,
          transaction_id: cpm_trans_id,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const { code, data } = verifyResponse.data;

      if (code === '00' && data.status === 'ACCEPTED') {
        // Payment successful
        const transaction = await queryOne<{
          id: string;
          user_id: string;
          metadata: { planId: string; billingCycle: string };
        }>(
          `SELECT * FROM payment_transactions WHERE id = $1 AND provider = 'cinetpay'`,
          [cpm_trans_id]
        );

        if (transaction) {
          // Update transaction
          await execute(
            `UPDATE payment_transactions SET status = 'completed', provider_transaction_id = $1, completed_at = NOW() WHERE id = $2`,
            [data.payment_method, transaction.id]
          );

          // Create subscription
          const { planId, billingCycle } = transaction.metadata;

          const plan = await queryOne<{ id: string }>(`SELECT * FROM plans WHERE id = $1`, [planId]);

          if (plan) {
            const now = new Date();
            let periodEnd: Date;
            if (billingCycle === 'yearly') {
              periodEnd = new Date(now.setFullYear(now.getFullYear() + 1));
            } else {
              periodEnd = new Date(now.setMonth(now.getMonth() + 1));
            }

            await execute(
              `UPDATE subscriptions SET status = 'canceled', canceled_at = NOW() WHERE user_id = $1 AND status = 'active'`,
              [transaction.user_id]
            );

            await execute(
              `INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, payment_method, created_at, updated_at)
               VALUES ($1, $2, $3, 'active', NOW(), $4, 'mobile_money_mtn', NOW(), NOW())`,
              [uuidv4(), transaction.user_id, planId, periodEnd.toISOString()]
            );
          }

          functions.logger.info('CinetPay payment completed:', { transactionId: cpm_trans_id });
        }
      } else if (data.status === 'REFUSED' || data.status === 'CANCELLED') {
        await execute(
          `UPDATE payment_transactions SET status = $1 WHERE id = $2 AND provider = 'cinetpay'`,
          [data.status === 'CANCELLED' ? 'canceled' : 'failed', cpm_trans_id]
        );
      }

      res.status(200).send('OK');
    } catch (error) {
      functions.logger.error('CinetPay webhook error:', error);
      res.status(500).send('Internal error');
    }
  });

/**
 * Check CinetPay payment status
 */
export const checkCinetPayStatus = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { transactionId } = data;
    const config = await getCinetPayConfig();

    try {
      const response = await axios.post(
        `${CINETPAY_BASE_URL}/payment/check`,
        {
          apikey: config.apiKey,
          site_id: config.siteId,
          transaction_id: transactionId,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const statusMap: Record<string, string> = {
        'ACCEPTED': 'completed',
        'REFUSED': 'failed',
        'CANCELLED': 'canceled',
        'PENDING': 'pending',
      };

      return {
        status: statusMap[response.data.data?.status] || 'pending',
        data: response.data.data,
      };
    } catch (error) {
      functions.logger.error('CinetPay status check error:', error);
      throw new functions.https.HttpsError('internal', 'Failed to check payment status');
    }
  });

/**
 * Get available CinetPay payment channels for a country
 */
export const getCinetPayChannels = functions
  .region('europe-west1')
  .https.onCall(async (data) => {
    const { country = 'GA' } = data;

    // CinetPay available channels per country
    const channels: Record<string, string[]> = {
      GA: ['MTN', 'AIRTEL'], // Gabon
      CI: ['MTN', 'ORANGE', 'MOOV', 'WAVE'], // Cote d'Ivoire
      SN: ['ORANGE', 'FREE', 'WAVE'], // Senegal
      CM: ['MTN', 'ORANGE'], // Cameroon
      BF: ['ORANGE', 'MOOV'], // Burkina Faso
      ML: ['ORANGE', 'MOOV'], // Mali
      TG: ['FLOOZ', 'TMONEY'], // Togo
      BJ: ['MTN', 'MOOV'], // Benin
    };

    return {
      channels: channels[country] || ['MTN', 'AIRTEL'],
      country,
    };
  });

/**
 * Complete CinetPay demo payment (simulated)
 */
export const completeCinetPayDemoPayment = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { planId, billingCycle } = data;
    const userId = context.auth.uid;
    const transactionId = `DEMO-CNP-${Date.now()}`;

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

    try {
      // 1. Create completed transaction record
      await execute(
        `INSERT INTO payment_transactions (id, user_id, amount_xaf, payment_method, provider, status, provider_reference, completed_at, created_at)
         VALUES ($1, $2, $3, 'mobile_money_mtn', 'cinetpay', 'completed', $4, NOW(), NOW())`,
        [transactionId, userId, amount, transactionId]
      );

      // 2. Calculate subscription period
      const now = new Date();
      let periodEnd: Date;
      if (billingCycle === 'yearly') {
        periodEnd = new Date(now.setFullYear(now.getFullYear() + 1));
      } else {
        periodEnd = new Date(now.setMonth(now.getMonth() + 1));
      }

      // 3. Cancel existing active subscriptions
      await execute(
        `UPDATE subscriptions SET status = 'canceled', canceled_at = NOW() WHERE user_id = $1 AND status = 'active'`,
        [userId]
      );

      // 4. Create new subscription
      const subscriptionId = uuidv4();
      await execute(
        `INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, payment_method, created_at, updated_at)
         VALUES ($1, $2, $3, 'active', NOW(), $4, 'mobile_money_mtn', NOW(), NOW())`,
        [subscriptionId, userId, planId, periodEnd.toISOString()]
      );

      functions.logger.info('CinetPay demo payment completed:', { userId, planId });

      return { success: true, subscriptionId };
    } catch (error) {
      functions.logger.error('CinetPay demo payment error:', error);
      throw new functions.https.HttpsError('internal', 'Demo payment failed');
    }
  });
