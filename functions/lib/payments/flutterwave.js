"use strict";
/**
 * Flutterwave Payment Integration
 * Supports Cards, Mobile Money, Bank Transfers across Africa
 * Documentation: https://developer.flutterwave.com/docs
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeFlutterwaveDemoPayment = exports.verifyFlutterwavePayment = exports.flutterwaveWebhook = exports.initFlutterwavePayment = void 0;
const functions = __importStar(require("firebase-functions"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const db_1 = require("../utils/db");
const secrets_1 = require("../utils/secrets");
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';
async function getHeaders() {
    const config = await (0, secrets_1.getFlutterwaveConfig)();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.secretKey}`,
    };
}
/**
 * Initialize a Flutterwave payment
 */
exports.initFlutterwavePayment = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { planId, billingCycle, paymentMethod, phoneNumber, email, returnUrl } = data;
    const userId = context.auth.uid;
    // Get plan details
    const plan = await (0, db_1.queryOne)(`SELECT * FROM plans WHERE id = $1 AND is_active = true`, [planId]);
    if (!plan) {
        throw new functions.https.HttpsError('not-found', 'Plan not found');
    }
    const amount = billingCycle === 'yearly' && plan.price_yearly_xaf
        ? plan.price_yearly_xaf
        : plan.price_xaf;
    const transactionId = `DGTL-${Date.now()}-${(0, uuid_1.v4)().slice(0, 8)}`;
    // Map payment method to Flutterwave type
    const paymentTypeMap = {
        mobile_money_mtn: 'mobile_money_franco',
        mobile_money_airtel: 'mobile_money_franco',
        mobile_money_moov: 'mobile_money_franco',
        card: 'card',
    };
    const config = await (0, secrets_1.getFlutterwaveConfig)();
    // Check for demo mode
    if (config.mode === 'demo') {
        return {
            success: true,
            transactionId,
            paymentUrl: `${returnUrl || 'https://digitalium.ga/billing?status=success'}&demo=true`,
            demoMode: true,
        };
    }
    try {
        const payload = {
            tx_ref: transactionId,
            amount,
            currency: 'XAF',
            redirect_url: returnUrl || 'https://digitalium.ga/billing?status=success',
            payment_options: paymentTypeMap[paymentMethod] || 'card',
            customer: {
                email: email || context.auth.token.email || 'customer@digitalium.ga',
                phonenumber: phoneNumber,
                name: context.auth.token.name || 'Client DIGITALIUM',
            },
            customizations: {
                title: 'DIGITALIUM',
                description: `Abonnement ${plan.display_name}`,
                logo: 'https://digitalium.ga/logo.png',
            },
            meta: {
                user_id: userId,
                plan_id: planId,
                billing_cycle: billingCycle,
            },
        };
        // For mobile money, add phone number
        if (paymentMethod.startsWith('mobile_money') && phoneNumber) {
            payload.phone_number = phoneNumber;
        }
        const response = await axios_1.default.post(`${FLUTTERWAVE_BASE_URL}/payments`, payload, { headers: await getHeaders() });
        if (response.data.status === 'success') {
            // Store pending transaction
            await (0, db_1.execute)(`INSERT INTO payment_transactions (id, user_id, amount_xaf, payment_method, provider, status, provider_reference, phone_number, metadata, created_at)
           VALUES ($1, $2, $3, $4, 'flutterwave', 'pending', $5, $6, $7, NOW())`, [
                transactionId,
                userId,
                amount,
                paymentMethod,
                transactionId,
                phoneNumber || null,
                JSON.stringify({ planId, billingCycle }),
            ]);
            return {
                success: true,
                transactionId,
                paymentUrl: response.data.data.link,
            };
        }
        else {
            throw new Error(response.data.message || 'Payment initialization failed');
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        functions.logger.error('Flutterwave payment init error:', error);
        throw new functions.https.HttpsError('internal', `Payment failed: ${errorMessage}`);
    }
});
/**
 * Flutterwave webhook handler
 */
exports.flutterwaveWebhook = functions
    .region('europe-west1')
    .https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method not allowed');
        return;
    }
    // Verify webhook signature
    const config = await (0, secrets_1.getFlutterwaveConfig)();
    const signature = req.headers['verif-hash'];
    if (signature !== config.secretKey) {
        functions.logger.warn('Invalid Flutterwave webhook signature');
        res.status(401).send('Unauthorized');
        return;
    }
    const { event, data } = req.body;
    functions.logger.info('Flutterwave webhook received:', { event, txRef: data?.tx_ref });
    try {
        if (event === 'charge.completed' && data.status === 'successful') {
            const { tx_ref, meta } = data;
            // Verify transaction
            const verifyResponse = await axios_1.default.get(`${FLUTTERWAVE_BASE_URL}/transactions/${data.id}/verify`, { headers: await getHeaders() });
            if (verifyResponse.data.status === 'success' && verifyResponse.data.data.status === 'successful') {
                // Get transaction from DB
                const transaction = await (0, db_1.queryOne)(`SELECT * FROM payment_transactions WHERE provider_reference = $1 AND provider = 'flutterwave'`, [tx_ref]);
                if (transaction) {
                    // Update transaction
                    await (0, db_1.execute)(`UPDATE payment_transactions SET status = 'completed', provider_transaction_id = $1, completed_at = NOW() WHERE id = $2`, [data.id.toString(), transaction.id]);
                    // Create subscription
                    const { planId, billingCycle } = meta || transaction.metadata;
                    const plan = await (0, db_1.queryOne)(`SELECT * FROM plans WHERE id = $1`, [planId]);
                    if (plan) {
                        const now = new Date();
                        let periodEnd;
                        if (billingCycle === 'yearly') {
                            periodEnd = new Date(now.setFullYear(now.getFullYear() + 1));
                        }
                        else {
                            periodEnd = new Date(now.setMonth(now.getMonth() + 1));
                        }
                        await (0, db_1.execute)(`UPDATE subscriptions SET status = 'canceled', canceled_at = NOW() WHERE user_id = $1 AND status = 'active'`, [transaction.user_id]);
                        await (0, db_1.execute)(`INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, payment_method, created_at, updated_at)
                 VALUES ($1, $2, $3, 'active', NOW(), $4, $5, NOW(), NOW())`, [(0, uuid_1.v4)(), transaction.user_id, planId, periodEnd.toISOString(), transaction.metadata]);
                    }
                    functions.logger.info('Flutterwave payment completed:', { txRef: tx_ref });
                }
            }
        }
        res.status(200).send('OK');
    }
    catch (error) {
        functions.logger.error('Flutterwave webhook error:', error);
        res.status(500).send('Internal error');
    }
});
/**
 * Verify Flutterwave transaction
 */
exports.verifyFlutterwavePayment = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { transactionId } = data;
    try {
        // Get transaction from our DB first
        const transaction = await (0, db_1.queryOne)(`SELECT * FROM payment_transactions WHERE id = $1 OR provider_reference = $1`, [transactionId]);
        if (!transaction?.provider_transaction_id) {
            // Try to find by tx_ref
            const response = await axios_1.default.get(`${FLUTTERWAVE_BASE_URL}/transactions/verify_by_reference?tx_ref=${transactionId}`, { headers: await getHeaders() });
            return {
                status: response.data.data?.status || 'pending',
                data: response.data.data,
            };
        }
        const response = await axios_1.default.get(`${FLUTTERWAVE_BASE_URL}/transactions/${transaction.provider_transaction_id}/verify`, { headers: await getHeaders() });
        return {
            status: response.data.data?.status || 'pending',
            data: response.data.data,
        };
    }
    catch (error) {
        functions.logger.error('Flutterwave verify error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to verify payment');
    }
});
/**
 * Complete Flutterwave demo payment (simulated)
 */
exports.completeFlutterwaveDemoPayment = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { planId, billingCycle } = data;
    const userId = context.auth.uid;
    const transactionId = `DEMO-FLW-${Date.now()}`;
    // Get plan details
    const plan = await (0, db_1.queryOne)(`SELECT * FROM plans WHERE id = $1 AND is_active = true`, [planId]);
    if (!plan) {
        throw new functions.https.HttpsError('not-found', 'Plan not found');
    }
    const amount = billingCycle === 'yearly' && plan.price_yearly_xaf
        ? plan.price_yearly_xaf
        : plan.price_xaf;
    try {
        // 1. Create completed transaction record
        await (0, db_1.execute)(`INSERT INTO payment_transactions (id, user_id, amount_xaf, payment_method, provider, status, provider_reference, completed_at, created_at)
         VALUES ($1, $2, $3, 'mobile_money_mtn', 'flutterwave', 'completed', $4, NOW(), NOW())`, [transactionId, userId, amount, transactionId]);
        // 2. Calculate subscription period
        const now = new Date();
        let periodEnd;
        if (billingCycle === 'yearly') {
            periodEnd = new Date(now.setFullYear(now.getFullYear() + 1));
        }
        else {
            periodEnd = new Date(now.setMonth(now.getMonth() + 1));
        }
        // 3. Cancel existing active subscriptions
        await (0, db_1.execute)(`UPDATE subscriptions SET status = 'canceled', canceled_at = NOW() WHERE user_id = $1 AND status = 'active'`, [userId]);
        // 4. Create new subscription
        const subscriptionId = (0, uuid_1.v4)();
        await (0, db_1.execute)(`INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, payment_method, created_at, updated_at)
         VALUES ($1, $2, $3, 'active', NOW(), $4, 'mobile_money_mtn', NOW(), NOW())`, [subscriptionId, userId, planId, periodEnd.toISOString()]);
        functions.logger.info('Flutterwave demo payment completed:', { userId, planId });
        return { success: true, subscriptionId };
    }
    catch (error) {
        functions.logger.error('Flutterwave demo payment error:', error);
        throw new functions.https.HttpsError('internal', 'Demo payment failed');
    }
});
//# sourceMappingURL=flutterwave.js.map