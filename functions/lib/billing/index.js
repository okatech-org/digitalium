"use strict";
/**
 * Billing functions
 * Handles subscriptions, invoices, and usage tracking
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.processExpiredSubscriptions = exports.hasFeature = exports.incrementAIUsage = exports.getUsage = exports.getInvoices = exports.reactivateSubscription = exports.cancelSubscription = exports.createSubscription = exports.getSubscription = exports.getPlans = void 0;
const functions = __importStar(require("firebase-functions"));
const uuid_1 = require("uuid");
const db_1 = require("../utils/db");
/**
 * Get all available plans
 */
exports.getPlans = functions
    .region('europe-west1')
    .https.onCall(async () => {
    const plans = await (0, db_1.query)(`SELECT * FROM plans WHERE is_active = true AND is_public = true ORDER BY sort_order`);
    return { plans };
});
/**
 * Get user's current subscription
 */
exports.getSubscription = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const subscription = await (0, db_1.queryOne)(`SELECT s.*, row_to_json(p.*) as plan
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = $1 AND s.status IN ('active', 'trialing', 'past_due')
       ORDER BY s.created_at DESC
       LIMIT 1`, [context.auth.uid]);
    return { subscription };
});
/**
 * Create or update subscription
 */
exports.createSubscription = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { planId, billingCycle = 'monthly', paymentMethod, transactionId } = data;
    const userId = context.auth.uid;
    // Get plan
    const plan = await (0, db_1.queryOne)(`SELECT * FROM plans WHERE id = $1 AND is_active = true`, [planId]);
    if (!plan) {
        throw new functions.https.HttpsError('not-found', 'Plan not found');
    }
    // Calculate period end
    const now = new Date();
    let periodEnd;
    if (billingCycle === 'yearly') {
        periodEnd = new Date(now.setFullYear(now.getFullYear() + 1));
    }
    else if (billingCycle === 'monthly') {
        periodEnd = new Date(now.setMonth(now.getMonth() + 1));
    }
    else {
        periodEnd = new Date(now.setFullYear(now.getFullYear() + 100));
    }
    // Cancel existing subscription if any
    await (0, db_1.execute)(`UPDATE subscriptions SET status = 'canceled', canceled_at = NOW(), updated_at = NOW()
       WHERE user_id = $1 AND status IN ('active', 'trialing')`, [userId]);
    // Create new subscription
    const subscriptionId = (0, uuid_1.v4)();
    await (0, db_1.execute)(`INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, payment_method, created_at, updated_at)
       VALUES ($1, $2, $3, 'active', NOW(), $4, $5, NOW(), NOW())`, [subscriptionId, userId, planId, periodEnd.toISOString(), paymentMethod]);
    // Create invoice if not free
    if (plan.price_xaf > 0) {
        const price = billingCycle === 'yearly' && plan.price_yearly_xaf ? plan.price_yearly_xaf : plan.price_xaf;
        const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
        await (0, db_1.execute)(`INSERT INTO invoices (id, user_id, subscription_id, number, status, subtotal_xaf, tax_xaf, total_xaf, payment_method, items, issued_at, paid_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'paid', $5, 0, $5, $6, $7, NOW(), NOW(), NOW(), NOW())`, [
            (0, uuid_1.v4)(),
            userId,
            subscriptionId,
            invoiceNumber,
            price,
            paymentMethod,
            JSON.stringify([{
                    description: `Abonnement ${plan.display_name} (${billingCycle === 'yearly' ? 'annuel' : 'mensuel'})`,
                    quantity: 1,
                    unit_price: price,
                }]),
        ]);
        // Record payment transaction
        if (transactionId) {
            await (0, db_1.execute)(`INSERT INTO payment_transactions (id, user_id, subscription_id, amount_xaf, payment_method, status, provider_transaction_id, created_at, completed_at)
           VALUES ($1, $2, $3, $4, $5, 'completed', $6, NOW(), NOW())`, [(0, uuid_1.v4)(), userId, subscriptionId, price, paymentMethod, transactionId]);
        }
    }
    functions.logger.info('Subscription created:', { userId, planId, subscriptionId });
    return { success: true, subscriptionId };
});
/**
 * Cancel subscription
 */
exports.cancelSubscription = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { immediate = false } = data;
    const userId = context.auth.uid;
    if (immediate) {
        await (0, db_1.execute)(`UPDATE subscriptions SET status = 'canceled', canceled_at = NOW(), updated_at = NOW()
         WHERE user_id = $1 AND status IN ('active', 'trialing')`, [userId]);
    }
    else {
        await (0, db_1.execute)(`UPDATE subscriptions SET cancel_at_period_end = true, updated_at = NOW()
         WHERE user_id = $1 AND status IN ('active', 'trialing')`, [userId]);
    }
    functions.logger.info('Subscription canceled:', { userId, immediate });
    return { success: true };
});
/**
 * Reactivate subscription
 */
exports.reactivateSubscription = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    await (0, db_1.execute)(`UPDATE subscriptions SET cancel_at_period_end = false, updated_at = NOW()
       WHERE user_id = $1 AND status = 'active' AND cancel_at_period_end = true`, [context.auth.uid]);
    return { success: true };
});
/**
 * Get user invoices
 */
exports.getInvoices = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const invoices = await (0, db_1.query)(`SELECT * FROM invoices WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [context.auth.uid]);
    return { invoices };
});
/**
 * Get user usage for current period
 */
exports.getUsage = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const currentPeriod = new Date().toISOString().slice(0, 7);
    let usage = await (0, db_1.queryOne)(`SELECT * FROM usage WHERE user_id = $1 AND period = $2`, [context.auth.uid, currentPeriod]);
    // Create if not exists
    if (!usage) {
        await (0, db_1.execute)(`INSERT INTO usage (user_id, period, storage_bytes, documents_count, ai_requests_count, created_at, updated_at)
         VALUES ($1, $2, 0, 0, 0, NOW(), NOW())
         ON CONFLICT (user_id, period) DO NOTHING`, [context.auth.uid, currentPeriod]);
        usage = {
            user_id: context.auth.uid,
            period: currentPeriod,
            storage_bytes: 0,
            documents_count: 0,
            ai_requests_count: 0,
        };
    }
    return { usage };
});
/**
 * Increment AI usage
 */
exports.incrementAIUsage = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const currentPeriod = new Date().toISOString().slice(0, 7);
    await (0, db_1.execute)(`INSERT INTO usage (user_id, period, ai_requests_count, storage_bytes, documents_count, created_at, updated_at)
       VALUES ($1, $2, 1, 0, 0, NOW(), NOW())
       ON CONFLICT (user_id, period) DO UPDATE SET
         ai_requests_count = usage.ai_requests_count + 1,
         updated_at = NOW()`, [context.auth.uid, currentPeriod]);
    return { success: true };
});
/**
 * Check if user has feature access
 */
exports.hasFeature = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { feature } = data;
    const result = await (0, db_1.queryOne)(`SELECT EXISTS (
        SELECT 1 FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        WHERE s.user_id = $1
        AND s.status IN ('active', 'trialing')
        AND ($2 = ANY(p.features) OR 'all_features' = ANY(p.features))
      ) as has_feature`, [context.auth.uid, feature]);
    return { hasFeature: result?.has_feature || false };
});
/**
 * Scheduled function to process expired subscriptions
 */
exports.processExpiredSubscriptions = functions
    .region('europe-west1')
    .pubsub.schedule('every 1 hours')
    .onRun(async () => {
    // Expire subscriptions past their period end with cancel_at_period_end = true
    const expired = await (0, db_1.execute)(`UPDATE subscriptions SET status = 'expired', updated_at = NOW()
       WHERE status = 'active'
       AND cancel_at_period_end = true
       AND current_period_end < NOW()`);
    functions.logger.info('Processed expired subscriptions:', { count: expired });
    // Mark past_due subscriptions older than 7 days as expired
    const pastDue = await (0, db_1.execute)(`UPDATE subscriptions SET status = 'expired', updated_at = NOW()
       WHERE status = 'past_due'
       AND updated_at < NOW() - INTERVAL '7 days'`);
    functions.logger.info('Processed past due subscriptions:', { count: pastDue });
});
//# sourceMappingURL=index.js.map