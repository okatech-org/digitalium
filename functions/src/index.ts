/**
 * DIGITALIUM Cloud Functions
 * Backend API for billing, payments, leads, and webhooks
 *
 * Database: Cloud SQL PostgreSQL (db_digitalium)
 * Instance: digitalium-ga:europe-west1:digitalium-db
 * Host: 35.195.248.19 (Hub de développement partagé)
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export * from './auth';
export * from './billing';
export * from './leads';
export * from './rbac';
export * from './organizations';
export * from './archive';
export * from './signature';
export * from './payments/paydunya';
export * from './payments/flutterwave';
export * from './payments/cinetpay';
