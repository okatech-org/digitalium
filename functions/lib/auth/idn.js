"use strict";
/**
 * IDN.ga OAuth Integration
 * Handles OAuth callback from identite.ga
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
exports.handleIdnOAuthCallback = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
// Define secrets for IDN.ga OAuth
const idnClientId = (0, params_1.defineSecret)('idn-client-id');
const idnClientSecret = (0, params_1.defineSecret)('idn-client-secret');
// IDN.ga OAuth configuration
const IDN_OAUTH_URL = 'https://identite.ga';
/**
 * Exchange OAuth code for tokens and create/link Firebase user
 */
exports.handleIdnOAuthCallback = (0, https_1.onCall)({
    region: 'europe-west1',
    secrets: [idnClientId, idnClientSecret],
}, async (request) => {
    const { code, state: _state } = request.data;
    if (!code) {
        throw new https_1.HttpsError('invalid-argument', 'Authorization code is required');
    }
    try {
        // 1. Exchange code for tokens
        const tokenResponse = await fetch(`${IDN_OAUTH_URL}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: idnClientId.value(),
                client_secret: idnClientSecret.value(),
                redirect_uri: 'https://digitalium.ga/auth/idn/callback',
            }),
        });
        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('IDN token exchange failed:', errorText);
            throw new https_1.HttpsError('unauthenticated', 'Failed to exchange authorization code');
        }
        const tokens = await tokenResponse.json();
        // 2. Get user info from IDN.ga
        const userInfoResponse = await fetch(`${IDN_OAUTH_URL}/oauth/userinfo`, {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });
        if (!userInfoResponse.ok) {
            throw new https_1.HttpsError('unauthenticated', 'Failed to get user info from IDN.ga');
        }
        const idnUser = await userInfoResponse.json();
        // 3. Find or create Firebase user
        const db = admin.firestore();
        let firebaseUid;
        // Check if user already exists with this IDN ID
        const existingUserQuery = await db
            .collection('users')
            .where('idn_user_id', '==', idnUser.id)
            .limit(1)
            .get();
        if (!existingUserQuery.empty) {
            // User exists, get their UID
            firebaseUid = existingUserQuery.docs[0].id;
            // Update user info
            await db.collection('users').doc(firebaseUid).update({
                email: idnUser.email,
                displayName: idnUser.name || `${idnUser.given_name || ''} ${idnUser.family_name || ''}`.trim(),
                nip: idnUser.nip || null,
                photoURL: idnUser.picture || null,
                idn_last_login: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        else {
            // Check if user exists with same email
            try {
                const existingFirebaseUser = await admin.auth().getUserByEmail(idnUser.email);
                firebaseUid = existingFirebaseUser.uid;
                // Link IDN ID to existing user
                await db.collection('users').doc(firebaseUid).update({
                    idn_user_id: idnUser.id,
                    nip: idnUser.nip || null,
                    idn_linked_at: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
            catch {
                // Create new Firebase user
                const displayName = idnUser.name || `${idnUser.given_name || ''} ${idnUser.family_name || ''}`.trim() || 'Utilisateur IDN';
                const newUser = await admin.auth().createUser({
                    email: idnUser.email,
                    displayName,
                    photoURL: idnUser.picture || undefined,
                });
                firebaseUid = newUser.uid;
                // Create user document
                await db.collection('users').doc(firebaseUid).set({
                    email: idnUser.email,
                    displayName,
                    photoURL: idnUser.picture || null,
                    idn_user_id: idnUser.id,
                    nip: idnUser.nip || null,
                    role: 'citizen',
                    plan: 'free',
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
                    idn_linked_at: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }
        // 4. Generate custom token for Firebase Auth
        const customToken = await admin.auth().createCustomToken(firebaseUid, {
            idn_user_id: idnUser.id,
        });
        return {
            success: true,
            customToken,
            user: {
                id: firebaseUid,
                email: idnUser.email,
                displayName: idnUser.name || `${idnUser.given_name || ''} ${idnUser.family_name || ''}`.trim(),
                nip: idnUser.nip,
            },
        };
    }
    catch (error) {
        console.error('IDN OAuth callback error:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', 'Authentication failed');
    }
});
//# sourceMappingURL=idn.js.map