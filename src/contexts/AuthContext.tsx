/**
 * AuthContext.tsx - Compatibility shim
 *
 * This file re-exports everything from FirebaseAuthContext
 * so that existing imports from '@/contexts/AuthContext' continue to work.
 *
 * Migrated from Supabase Auth to Firebase Auth.
 */

export { FirebaseAuthProvider as AuthProvider, useAuth } from './FirebaseAuthContext';
