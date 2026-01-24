"use strict";
/**
 * Secret Manager utility for accessing secrets at runtime
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecret = getSecret;
exports.loadPaymentSecrets = loadPaymentSecrets;
exports.getPayDunyaConfig = getPayDunyaConfig;
exports.getFlutterwaveConfig = getFlutterwaveConfig;
exports.getCinetPayConfig = getCinetPayConfig;
const secret_manager_1 = require("@google-cloud/secret-manager");
const client = new secret_manager_1.SecretManagerServiceClient();
const PROJECT_ID = 'digitalium-ga';
// Cache secrets to avoid repeated API calls
const secretCache = new Map();
/**
 * Get a secret value from Secret Manager
 * Falls back to environment variable if in development
 */
async function getSecret(secretName, envFallback) {
    // Check cache first
    if (secretCache.has(secretName)) {
        return secretCache.get(secretName);
    }
    // Check environment variable first (for local development)
    const envKey = secretName.toUpperCase().replace(/-/g, '_');
    if (process.env[envKey]) {
        return process.env[envKey];
    }
    try {
        const [version] = await client.accessSecretVersion({
            name: `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`,
        });
        const payload = version.payload?.data?.toString();
        if (payload) {
            secretCache.set(secretName, payload);
            return payload;
        }
    }
    catch (error) {
        console.error(`Failed to access secret ${secretName}:`, error);
    }
    // Return fallback or empty string
    return envFallback || '';
}
/**
 * Pre-load all payment secrets into cache
 */
async function loadPaymentSecrets() {
    const secrets = [
        'db-password',
        'paydunya-master-key',
        'paydunya-private-key',
        'paydunya-public-key',
        'paydunya-token',
        'flutterwave-public-key',
        'flutterwave-secret-key',
        'flutterwave-encryption-key',
        'cinetpay-api-key',
        'cinetpay-site-id',
        'cinetpay-secret-key',
    ];
    await Promise.all(secrets.map(s => getSecret(s)));
}
/**
 * Get PayDunya configuration
 */
async function getPayDunyaConfig() {
    return {
        masterKey: await getSecret('paydunya-master-key'),
        privateKey: await getSecret('paydunya-private-key'),
        publicKey: await getSecret('paydunya-public-key'),
        token: await getSecret('paydunya-token'),
        mode: (process.env.PAYDUNYA_MODE || 'test'),
    };
}
/**
 * Get Flutterwave configuration
 */
async function getFlutterwaveConfig() {
    return {
        publicKey: await getSecret('flutterwave-public-key'),
        secretKey: await getSecret('flutterwave-secret-key'),
        encryptionKey: await getSecret('flutterwave-encryption-key'),
        mode: (process.env.FLUTTERWAVE_MODE || 'test'),
    };
}
/**
 * Get CinetPay configuration
 */
async function getCinetPayConfig() {
    return {
        apiKey: await getSecret('cinetpay-api-key'),
        siteId: await getSecret('cinetpay-site-id'),
        secretKey: await getSecret('cinetpay-secret-key'),
        mode: (process.env.CINETPAY_MODE || 'test'),
    };
}
//# sourceMappingURL=secrets.js.map