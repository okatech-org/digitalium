/**
 * Database connection utility for Cloud SQL PostgreSQL
 */

import { Pool } from 'pg';
import { getSecret } from './secrets';

// Cloud SQL connection pool
let pool: Pool | null = null;
let poolPromise: Promise<Pool> | null = null;

async function createPool(): Promise<Pool> {
  // Detect if running in Cloud Functions/Cloud Run environment
  const isCloudFunction = !!process.env.FUNCTION_NAME || !!process.env.K_SERVICE;

  const connectionName = process.env.CLOUD_SQL_CONNECTION_NAME;
  const dbUser = process.env.DB_USER || 'digitalium_user';
  const dbName = process.env.DB_NAME || 'digitalium';

  // Get password from Secret Manager or environment
  const dbPassword = await getSecret('db-password', process.env.DB_PASSWORD);

  if (isCloudFunction && connectionName) {
    // Unix socket connection for Cloud SQL in Cloud Functions
    console.log(`Connecting to Cloud SQL via socket: /cloudsql/${connectionName}`);
    return new Pool({
      user: dbUser,
      password: dbPassword,
      database: dbName,
      host: `/cloudsql/${connectionName}`,
    });
  } else {
    // TCP connection for local development
    console.log('Using TCP connection for local development');
    return new Pool({
      user: dbUser,
      password: dbPassword,
      database: dbName,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
    });
  }
}

export async function getPool(): Promise<Pool> {
  if (pool) return pool;

  if (!poolPromise) {
    poolPromise = createPool().then(p => {
      pool = p;
      return p;
    });
  }

  return poolPromise;
}

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const p = await getPool();
  const client = await p.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

export async function execute(text: string, params?: unknown[]): Promise<number> {
  const p = await getPool();
  const client = await p.connect();
  try {
    const result = await client.query(text, params);
    return result.rowCount || 0;
  } finally {
    client.release();
  }
}
