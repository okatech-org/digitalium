/**
 * Admin Service - Cloud Functions Implementation
 *
 * Frontend service layer for RBAC, user management, organizations, and audit.
 * Wraps Cloud Functions: rbac/* + organizations/*
 */

import { functions } from '@/config/firebase';
import { httpsCallable } from 'firebase/functions';

// =============================================================================
// Types
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
  organization_id: string | null;
  organization_name: string | null;
  organization_slug: string | null;
  is_global: boolean;
}

export interface PlatformUser {
  user_id: string;
  display_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  platform_role: PlatformRole | null;
  organization_id: string | null;
  role_active: boolean | null;
  granted_at: string | null;
  organization_name: string | null;
  organization_slug: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  sector: string | null;
  nif: string | null;
  rccm: string | null;
  max_users: number;
  storage_quota_bytes: number;
  modules_enabled: string[];
  created_by: string | null;
  plan_id: string | null;
  created_at: string;
  updated_at: string;
  member_count: number;
  admin_count: number;
}

export interface OrgMember {
  user_id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  role: PlatformRole;
  granted_at: string;
  granted_by: string | null;
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: PlatformRole;
  invited_by: string;
  token: string;
  status: string;
  expires_at: string;
  message: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string;
  actor_role: PlatformRole;
  action: string;
  target_type: string;
  target_id: string | null;
  organization_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

// =============================================================================
// Cloud Function callable references
// =============================================================================

// RBAC
const getUserRolesFn = httpsCallable<
  Record<string, never>,
  {
    roles: UserRoleInfo[];
    highestRole: PlatformRole | null;
    highestLevel: number;
    isSystemAdmin: boolean;
    isPlatformAdmin: boolean;
    organizations: { id: string; name: string; slug: string; role: PlatformRole; level: number }[];
  }
>(functions, 'getUserRoles');

const listUsersFn = httpsCallable<
  { organizationId?: string; searchTerm?: string; roleFilter?: string; limit?: number; offset?: number },
  { users: PlatformUser[]; count: number }
>(functions, 'listUsers');

const assignRoleFn = httpsCallable<
  { targetUserId: string; role: PlatformRole; organizationId?: string },
  { success: boolean; role: PlatformRole; organizationId?: string }
>(functions, 'assignRole');

const removeRoleFn = httpsCallable<
  { targetUserId: string; organizationId?: string },
  { success: boolean }
>(functions, 'removeRole');

const getAuditLogFn = httpsCallable<
  { organizationId?: string; action?: string; limit?: number; offset?: number },
  { logs: AuditLogEntry[]; count: number }
>(functions, 'getAuditLog');

// Organizations
const getOrganizationsFn = httpsCallable<
  { searchTerm?: string; statusFilter?: string; limit?: number; offset?: number },
  { organizations: Organization[] }
>(functions, 'getOrganizations');

const getOrganizationFn = httpsCallable<
  { organizationId: string },
  { organization: Organization; members: OrgMember[]; invitations: Invitation[] }
>(functions, 'getOrganization');

const createOrganizationFn = httpsCallable<
  {
    name: string;
    type: string;
    sector?: string;
    address?: string;
    city?: string;
    country?: string;
    contactEmail?: string;
    contactPhone?: string;
    nif?: string;
    rccm?: string;
    maxUsers?: number;
    storageQuotaBytes?: number;
    modulesEnabled?: string[];
    planId?: string;
  },
  { success: boolean; organization: { id: string; name: string; slug: string; type: string; status: string } }
>(functions, 'createOrganization');

const updateOrganizationFn = httpsCallable<
  { organizationId: string; updates: Record<string, unknown> },
  { success: boolean }
>(functions, 'updateOrganization');

const inviteUserFn = httpsCallable<
  { organizationId: string; email: string; role?: PlatformRole; message?: string },
  { success: boolean; invitation: Invitation }
>(functions, 'inviteUser');

const revokeInvitationFn = httpsCallable<
  { invitationId: string },
  { success: boolean }
>(functions, 'revokeInvitation');

const getOrgMembersFn = httpsCallable<
  { organizationId: string },
  { members: OrgMember[]; count: number }
>(functions, 'getOrgMembers');

const removeMemberFn = httpsCallable<
  { organizationId: string; userId: string },
  { success: boolean }
>(functions, 'removeMember');

// =============================================================================
// Public API
// =============================================================================

export const adminService = {
  // ── RBAC ───────────────────────────────────────────────────────────────────
  async getUserRoles() {
    const result = await getUserRolesFn({});
    return result.data;
  },

  async listUsers(params?: {
    organizationId?: string;
    searchTerm?: string;
    roleFilter?: string;
    limit?: number;
    offset?: number;
  }) {
    const result = await listUsersFn(params || {});
    return result.data;
  },

  async assignRole(targetUserId: string, role: PlatformRole, organizationId?: string) {
    const result = await assignRoleFn({ targetUserId, role, organizationId });
    return result.data;
  },

  async removeRole(targetUserId: string, organizationId?: string) {
    const result = await removeRoleFn({ targetUserId, organizationId });
    return result.data;
  },

  async getAuditLog(params?: {
    organizationId?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }) {
    const result = await getAuditLogFn(params || {});
    return result.data;
  },

  // ── Organizations ──────────────────────────────────────────────────────────
  async getOrganizations(params?: {
    searchTerm?: string;
    statusFilter?: string;
    limit?: number;
    offset?: number;
  }) {
    const result = await getOrganizationsFn(params || {});
    return result.data;
  },

  async getOrganization(organizationId: string) {
    const result = await getOrganizationFn({ organizationId });
    return result.data;
  },

  async createOrganization(data: {
    name: string;
    type: string;
    sector?: string;
    address?: string;
    city?: string;
    country?: string;
    contactEmail?: string;
    contactPhone?: string;
    nif?: string;
    rccm?: string;
    maxUsers?: number;
    storageQuotaBytes?: number;
    modulesEnabled?: string[];
    planId?: string;
  }) {
    const result = await createOrganizationFn(data);
    return result.data;
  },

  async updateOrganization(organizationId: string, updates: Record<string, unknown>) {
    const result = await updateOrganizationFn({ organizationId, updates });
    return result.data;
  },

  async inviteUser(organizationId: string, email: string, role?: PlatformRole, message?: string) {
    const result = await inviteUserFn({ organizationId, email, role, message });
    return result.data;
  },

  async revokeInvitation(invitationId: string) {
    const result = await revokeInvitationFn({ invitationId });
    return result.data;
  },

  async getOrgMembers(organizationId: string) {
    const result = await getOrgMembersFn({ organizationId });
    return result.data;
  },

  async removeMember(organizationId: string, userId: string) {
    const result = await removeMemberFn({ organizationId, userId });
    return result.data;
  },
};

export default adminService;
