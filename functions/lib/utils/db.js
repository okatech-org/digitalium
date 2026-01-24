"use strict";
/**
 * Database connection utility for Cloud SQL PostgreSQL
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = getPool;
exports.query = query;
exports.queryOne = queryOne;
exports.execute = execute;
const pg_1 = require("pg");
const secrets_1 = require("./secrets");
// Cloud SQL connection pool
let pool = null;
let poolPromise = null;
async function createPool() {
    // Detect if running in Cloud Functions/Cloud Run environment
    const isCloudFunction = !!process.env.FUNCTION_NAME || !!process.env.K_SERVICE;
    const connectionName = process.env.CLOUD_SQL_CONNECTION_NAME;
    const dbUser = process.env.DB_USER || 'digitalium_user';
    const dbName = process.env.DB_NAME || 'digitalium';
    // Get password from Secret Manager or environment
    const dbPassword = await (0, secrets_1.getSecret)('db-password', process.env.DB_PASSWORD);
    if (isCloudFunction && connectionName) {
        // Unix socket connection for Cloud SQL in Cloud Functions
        console.log(`Connecting to Cloud SQL via socket: /cloudsql/${connectionName}`);
        return new pg_1.Pool({
            user: dbUser,
            password: dbPassword,
            database: dbName,
            host: `/cloudsql/${connectionName}`,
        });
    }
    else {
        // TCP connection for local development
        console.log('Using TCP connection for local development');
        return new pg_1.Pool({
            user: dbUser,
            password: dbPassword,
            database: dbName,
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
        });
    }
}
async function getPool() {
    if (pool)
        return pool;
    if (!poolPromise) {
        poolPromise = createPool().then(p => {
            pool = p;
            return p;
        });
    }
    return poolPromise;
}
async function query(text, params) {
    const p = await getPool();
    const client = await p.connect();
    try {
        const result = await client.query(text, params);
        return result.rows;
    }
    finally {
        client.release();
    }
}
async function queryOne(text, params) {
    const rows = await query(text, params);
    return rows[0] || null;
}
async function execute(text, params) {
    const p = await getPool();
    const client = await p.connect();
    try {
        const result = await client.query(text, params);
        return result.rowCount || 0;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=db.js.map