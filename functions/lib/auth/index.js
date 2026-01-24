"use strict";
/**
 * Authentication functions
 * Handles user registration hooks and profile management
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.checkAdminRole = exports.onUserDeleted = exports.onUserCreated = void 0;
const functions = __importStar(require("firebase-functions"));
__exportStar(require("./idn"), exports);
const db_1 = require("../utils/db");
/**
 * Triggered when a new user is created in Firebase Auth
 * Creates profile and assigns default subscription
 */
exports.onUserCreated = functions
    .region('europe-west1')
    .auth.user()
    .onCreate(async (user) => {
    const { uid, email, displayName } = user;
    functions.logger.info('New user created:', { uid, email });
    try {
        // Create user profile
        await (0, db_1.execute)(`INSERT INTO profiles (user_id, display_name, email, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (user_id) DO NOTHING`, [uid, displayName || null, email || null]);
        // Assign default user role
        await (0, db_1.execute)(`INSERT INTO user_roles (user_id, role, created_at)
         VALUES ($1, 'user', NOW())
         ON CONFLICT (user_id, role) DO NOTHING`, [uid]);
        // Get free plan ID
        const plans = await (0, db_1.query)(`SELECT id FROM plans WHERE name = 'free' AND type = 'personal' AND is_active = true LIMIT 1`);
        if (plans.length > 0) {
            const freePlanId = plans[0].id;
            // Create free subscription
            await (0, db_1.execute)(`INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
           VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '100 years', NOW(), NOW())`, [uid, freePlanId]);
            // Initialize usage tracking
            const currentPeriod = new Date().toISOString().slice(0, 7);
            await (0, db_1.execute)(`INSERT INTO usage (user_id, period, storage_bytes, documents_count, ai_requests_count, created_at, updated_at)
           VALUES ($1, $2, 0, 0, 0, NOW(), NOW())
           ON CONFLICT (user_id, period) DO NOTHING`, [uid, currentPeriod]);
        }
        functions.logger.info('User profile and subscription created:', { uid });
    }
    catch (error) {
        functions.logger.error('Error creating user profile:', error);
        throw error;
    }
});
/**
 * Triggered when a user is deleted from Firebase Auth
 * Cleans up user data
 */
exports.onUserDeleted = functions
    .region('europe-west1')
    .auth.user()
    .onDelete(async (user) => {
    const { uid } = user;
    functions.logger.info('User deleted:', { uid });
    try {
        // Delete user data (cascade should handle related tables)
        await (0, db_1.execute)(`DELETE FROM profiles WHERE user_id = $1`, [uid]);
        await (0, db_1.execute)(`DELETE FROM subscriptions WHERE user_id = $1`, [uid]);
        await (0, db_1.execute)(`DELETE FROM user_roles WHERE user_id = $1`, [uid]);
        functions.logger.info('User data cleaned up:', { uid });
    }
    catch (error) {
        functions.logger.error('Error cleaning up user data:', error);
        throw error;
    }
});
/**
 * HTTP function to check if user has admin role
 */
exports.checkAdminRole = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const uid = context.auth.uid;
    const roles = await (0, db_1.query)(`SELECT role FROM user_roles WHERE user_id = $1 AND role = 'admin'`, [uid]);
    return { isAdmin: roles.length > 0 };
});
/**
 * HTTP function to get user profile with subscription
 */
exports.getUserProfile = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const uid = context.auth.uid;
    // Get profile
    const profiles = await (0, db_1.query)(`SELECT * FROM profiles WHERE user_id = $1`, [uid]);
    // Get subscription with plan
    const subscriptions = await (0, db_1.query)(`SELECT s.*, p.name as plan_name, p.display_name as plan_display_name, p.features
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = $1 AND s.status IN ('active', 'trialing')
       ORDER BY s.created_at DESC
       LIMIT 1`, [uid]);
    // Get current usage
    const currentPeriod = new Date().toISOString().slice(0, 7);
    const usage = await (0, db_1.query)(`SELECT * FROM usage WHERE user_id = $1 AND period = $2`, [uid, currentPeriod]);
    return {
        profile: profiles[0] || null,
        subscription: subscriptions[0] || null,
        usage: usage[0] || null,
    };
});
//# sourceMappingURL=index.js.map