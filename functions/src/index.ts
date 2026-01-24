/**
 * DIGITALIUM Cloud Functions
 * Backend API for billing, payments, and webhooks
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export * from './auth';
export * from './billing';
export * from './payments/paydunya';
export * from './payments/flutterwave';
export * from './payments/cinetpay';
