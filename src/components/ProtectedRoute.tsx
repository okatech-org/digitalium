import { Navigate } from 'react-router-dom';
import { useAuth, PlatformRole } from '@/contexts/FirebaseAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;

  /** Legacy: require any admin role (system_admin, platform_admin, or org_admin) */
  requireAdmin?: boolean;

  /** New RBAC: require a specific minimum role level */
  requiredRole?: PlatformRole;

  /** Optional: scope check to a specific organization */
  organizationId?: string;

  /** Where to redirect if access denied (default: /pro) */
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requiredRole,
  organizationId,
  redirectTo = '/pro',
}: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // New RBAC check (takes priority if specified)
  if (requiredRole) {
    if (!hasRole(requiredRole, organizationId)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Legacy admin check (backward compatibility)
  if (requireAdmin && !isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
