/**
 * IDN.ga OAuth Integration
 * Handles OAuth callback from identite.ga
 */

import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

// Define secrets for IDN.ga OAuth
const idnClientId = defineSecret('idn-client-id');
const idnClientSecret = defineSecret('idn-client-secret');

// IDN.ga OAuth configuration
const IDN_OAUTH_URL = 'https://identite.ga';

interface IdnTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    id_token?: string;
}

interface IdnUserInfo {
    id: string;
    email: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    nip?: string;
    picture?: string;
}

interface OAuthCallbackRequest {
    code: string;
    state?: string;
}

interface OAuthCallbackResponse {
    success: boolean;
    customToken?: string;
    user?: {
        id: string;
        email: string;
        displayName: string;
        nip?: string;
    };
    error?: string;
}

/**
 * Exchange OAuth code for tokens and create/link Firebase user
 */
export const handleIdnOAuthCallback = onCall<OAuthCallbackRequest, Promise<OAuthCallbackResponse>>(
    {
        region: 'europe-west1',
        secrets: [idnClientId, idnClientSecret],
    },
    async (request) => {
        const { code, state: _state } = request.data;

        if (!code) {
            throw new HttpsError('invalid-argument', 'Authorization code is required');
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
                throw new HttpsError('unauthenticated', 'Failed to exchange authorization code');
            }

            const tokens: IdnTokenResponse = await tokenResponse.json();

            // 2. Get user info from IDN.ga
            const userInfoResponse = await fetch(`${IDN_OAUTH_URL}/oauth/userinfo`, {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            });

            if (!userInfoResponse.ok) {
                throw new HttpsError('unauthenticated', 'Failed to get user info from IDN.ga');
            }

            const idnUser: IdnUserInfo = await userInfoResponse.json();

            // 3. Find or create Firebase user
            const db = admin.firestore();
            let firebaseUid: string;

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
            } else {
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
                } catch {
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

        } catch (error) {
            console.error('IDN OAuth callback error:', error);

            if (error instanceof HttpsError) {
                throw error;
            }

            throw new HttpsError('internal', 'Authentication failed');
        }
    }
);
