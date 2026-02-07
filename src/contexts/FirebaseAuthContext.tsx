import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth } from '@/config/firebase';
import { getFunctions } from 'firebase/functions';

// =============================================================================
// Types RBAC
// =============================================================================

export type PlatformRole =
  | 'system_admin'
  | 'platform_admin'
  | 'org_admin'
  | 'org_manager'
  | 'org_member'
  | 'org_viewer';

export interface UserRoleInfo {
  role: PlatformRole;
  level: number;
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
}

export interface UserOrganization {
  id: string | null;
  name: string | null;
  slug: string | null;
  role: PlatformRole;
}

interface CheckAdminRoleResponse {
  isAdmin: boolean;
  role: PlatformRole;
  level: number;
  isSystemAdmin: boolean;
  isPlatformAdmin: boolean;
  isOrgAdmin: boolean;
  isManager: boolean;
  roles: UserRoleInfo[];
  organizations: UserOrganization[];
}

// =============================================================================
// Context Type
// =============================================================================

interface AuthContextType {
  // Firebase Auth
  user: User | null;
  isLoading: boolean;

  // Legacy compatibility (kept for existing components)
  isAdmin: boolean;

  // New RBAC system
  userRole: PlatformRole | null;
  userLevel: number;
  roles: UserRoleInfo[];
  organizations: UserOrganization[];

  // Role check helpers
  isSystemAdmin: boolean;
  isPlatformAdmin: boolean;
  isOrgAdmin: boolean;
  isManager: boolean;

  // Utility: check if user has at least the required role
  hasRole: (requiredRole: PlatformRole, organizationId?: string) => boolean;

  // Actions
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshRoles: () => Promise<void>;
}

const ROLE_LEVELS: Record<PlatformRole, number> = {
  system_admin: 0,
  platform_admin: 1,
  org_admin: 2,
  org_manager: 3,
  org_member: 4,
  org_viewer: 5,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// Provider
// =============================================================================

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // RBAC state
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<PlatformRole | null>(null);
  const [userLevel, setUserLevel] = useState<number>(99);
  const [roles, setRoles] = useState<UserRoleInfo[]>([]);
  const [organizations, setOrganizations] = useState<UserOrganization[]>([]);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);

  // Fetch roles from Cloud Function
  const fetchRoles = useCallback(async (firebaseUser: User) => {
    // Demo accounts — hardcoded role mappings for offline/dev mode
    const demoRoleMappings: Record<string, { role: PlatformRole; level: number }> = {
      'demo-sysadmin@digitalium.ga': { role: 'system_admin', level: 0 },
      'demo-admin@digitalium.ga': { role: 'platform_admin', level: 1 },
      'ornella.doumba@digitalium.ga': { role: 'platform_admin', level: 1 },
      'dg@ascoma.ga': { role: 'org_admin', level: 2 },
    };

    const email = firebaseUser.email || '';
    const demoMapping = demoRoleMappings[email];

    try {
      const functions = getFunctions(undefined, 'europe-west1');
      const checkAdminRole = httpsCallable<unknown, CheckAdminRoleResponse>(functions, 'checkAdminRole');
      const result = await checkAdminRole({});
      const data = result.data;

      // Set all RBAC state from backend response
      setIsAdmin(data.isAdmin);
      setUserRole(data.role);
      setUserLevel(data.level);
      setIsSystemAdmin(data.isSystemAdmin);
      setIsPlatformAdmin(data.isPlatformAdmin);
      setIsOrgAdmin(data.isOrgAdmin);
      setIsManager(data.isManager);
      setRoles(data.roles || []);
      setOrganizations(data.organizations || []);
    } catch (error) {
      console.error('Error checking roles:', error);

      // Fallback: use demo mappings or dev mode
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (demoMapping) {
        // Known demo account — use hardcoded mapping
        const level = demoMapping.level;
        setUserRole(demoMapping.role);
        setUserLevel(level);
        setIsAdmin(level <= 2);
        setIsSystemAdmin(level === 0);
        setIsPlatformAdmin(level <= 1);
        setIsOrgAdmin(level <= 2);
        setIsManager(level <= 3);
        setRoles([{
          role: demoMapping.role,
          level,
          organizationId: null,
          organizationName: null,
          organizationSlug: null,
        }]);
        setOrganizations([]);

        if (isDev) {
          console.warn(`[DEV] Cloud Function unavailable — using demo role: ${demoMapping.role}`);
        }
      } else if (isDev) {
        // Dev mode: grant platform_admin for easy testing
        console.warn('[DEV] Cloud Function unavailable — granting platform_admin access for local testing');
        setIsAdmin(true);
        setUserRole('platform_admin');
        setUserLevel(1);
        setIsSystemAdmin(false);
        setIsPlatformAdmin(true);
        setIsOrgAdmin(true);
        setIsManager(true);
        setRoles([{
          role: 'platform_admin',
          level: 1,
          organizationId: null,
          organizationName: null,
          organizationSlug: null,
        }]);
        setOrganizations([]);
      } else {
        // Production fallback: no access
        resetRoleState();
      }
    }
  }, []);

  const resetRoleState = useCallback(() => {
    setIsAdmin(false);
    setUserRole(null);
    setUserLevel(99);
    setIsSystemAdmin(false);
    setIsPlatformAdmin(false);
    setIsOrgAdmin(false);
    setIsManager(false);
    setRoles([]);
    setOrganizations([]);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        await fetchRoles(firebaseUser);
      } else {
        resetRoleState();
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [fetchRoles, resetRoleState]);

  // Role check utility
  const hasRole = useCallback((requiredRole: PlatformRole, organizationId?: string): boolean => {
    const requiredLevel = ROLE_LEVELS[requiredRole];

    // Global admins have access everywhere
    if (userLevel <= 1) return true;

    // Check if user has the required level
    if (userLevel > requiredLevel) return false;

    // If org-scoped check is needed
    if (organizationId) {
      return roles.some(
        r => ROLE_LEVELS[r.role] <= requiredLevel && r.organizationId === organizationId
      );
    }

    return true;
  }, [userLevel, roles]);

  // Refresh roles (e.g. after accepting an invitation)
  const refreshRoles = useCallback(async () => {
    if (user) {
      await fetchRoles(user);
    }
  }, [user, fetchRoles]);

  // Auth actions
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    resetRoleState();
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        // Firebase Auth
        user,
        isLoading,

        // Legacy compatibility
        isAdmin,

        // RBAC
        userRole,
        userLevel,
        roles,
        organizations,
        isSystemAdmin,
        isPlatformAdmin,
        isOrgAdmin,
        isManager,
        hasRole,

        // Actions
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        refreshRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =============================================================================
// Hooks
// =============================================================================

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}

// Export as useAuth for compatibility
export const useAuth = useFirebaseAuth;
