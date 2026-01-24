/**
 * Secret Manager utility for accessing secrets at runtime
 */

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
const PROJECT_ID = 'digitalium-ga';

// Cache secrets to avoid repeated API calls
const secretCache: Map<string, string> = new Map();

/**
 * Get a secret value from Secret Manager
 * Falls back to environment variable if in development
 */
export async function getSecret(secretName: string, envFallback?: string): Promise<string> {
  // Check cache first
  if (secretCache.has(secretName)) {
    return secretCache.get(secretName)!;
  }

  // Check environment variable first (for local development)
  const envKey = secretName.toUpperCase().replace(/-/g, '_');
  if (process.env[envKey]) {
    return process.env[envKey]!;
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
  } catch (error) {
    console.error(`Failed to access secret ${secretName}:`, error);
  }

  // Return fallback or empty string
  return envFallback || '';
}

/**
 * Pre-load all payment secrets into cache
 */
export async function loadPaymentSecrets(): Promise<void> {
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
export async function getPayDunyaConfig(): Promise<{
  masterKey: string;
  privateKey: string;
  publicKey: string;
  token: string;
  mode: 'test' | 'live' | 'demo';
}> {
  return {
    masterKey: await getSecret('paydunya-master-key'),
    privateKey: await getSecret('paydunya-private-key'),
    publicKey: await getSecret('paydunya-public-key'),
    token: await getSecret('paydunya-token'),
    mode: (process.env.PAYDUNYA_MODE || 'test') as 'test' | 'live' | 'demo',
  };
}

/**
 * Get Flutterwave configuration
 */
export async function getFlutterwaveConfig(): Promise<{
  publicKey: string;
  secretKey: string;
  encryptionKey: string;
  mode: 'test' | 'live' | 'demo';
}> {
  return {
    publicKey: await getSecret('flutterwave-public-key'),
    secretKey: await getSecret('flutterwave-secret-key'),
    encryptionKey: await getSecret('flutterwave-encryption-key'),
    mode: (process.env.FLUTTERWAVE_MODE || 'test') as 'test' | 'live' | 'demo',
  };
}

/**
 * Get CinetPay configuration
 */
export async function getCinetPayConfig(): Promise<{
  apiKey: string;
  siteId: string;
  secretKey: string;
  mode: 'test' | 'live' | 'demo';
}> {
  return {
    apiKey: await getSecret('cinetpay-api-key'),
    siteId: await getSecret('cinetpay-site-id'),
    secretKey: await getSecret('cinetpay-secret-key'),
    mode: (process.env.CINETPAY_MODE || 'test') as 'test' | 'live' | 'demo',
  };
}
