/**
 * Workspace Role-Based Permission Helpers
 */

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'HR_MANAGER' | 'MANAGER' | 'VIEWER';

export const ROLE_PERMISSIONS: Record<WorkspaceRole, Record<string, boolean>> = {
  OWNER: {
    can_manage_members: true,
    can_manage_settings: true,
    can_create_employees: true,
    can_edit_employees: true,
    can_delete_employees: true,
    can_manage_sites: true,
    can_manage_projects: true,
    can_manage_clients: true,
    can_manage_assignments: true,
    can_view_payroll: true,
    can_manage_payroll: true,
    can_approve_leaves: true,
    can_approve_timesheets: true,
    can_manage_contracts: true,
    can_view_reports: true,
    can_create_reports: true,
    can_view_analytics: true,
  },
  ADMIN: {
    can_manage_members: true,
    can_manage_settings: true,
    can_create_employees: true,
    can_edit_employees: true,
    can_delete_employees: false,
    can_manage_sites: true,
    can_manage_projects: true,
    can_manage_clients: true,
    can_manage_assignments: true,
    can_view_payroll: true,
    can_manage_payroll: true,
    can_approve_leaves: true,
    can_approve_timesheets: true,
    can_manage_contracts: true,
    can_view_reports: true,
    can_create_reports: true,
    can_view_analytics: true,
  },
  HR_MANAGER: {
    can_manage_members: false,
    can_manage_settings: false,
    can_create_employees: true,
    can_edit_employees: true,
    can_delete_employees: false,
    can_manage_sites: false,
    can_manage_projects: false,
    can_manage_clients: false,
    can_manage_assignments: true,
    can_view_payroll: true,
    can_manage_payroll: false,
    can_approve_leaves: true,
    can_approve_timesheets: true,
    can_manage_contracts: true,
    can_view_reports: true,
    can_create_reports: true,
    can_view_analytics: true,
  },
  MANAGER: {
    can_manage_members: false,
    can_manage_settings: false,
    can_create_employees: false,
    can_edit_employees: false,
    can_delete_employees: false,
    can_manage_sites: false,
    can_manage_projects: false,
    can_manage_clients: false,
    can_manage_assignments: false,
    can_view_payroll: false,
    can_manage_payroll: false,
    can_approve_leaves: true,
    can_approve_timesheets: true,
    can_manage_contracts: false,
    can_view_reports: true,
    can_create_reports: true,
    can_view_analytics: true,
  },
  VIEWER: {
    can_manage_members: false,
    can_manage_settings: false,
    can_create_employees: false,
    can_edit_employees: false,
    can_delete_employees: false,
    can_manage_sites: false,
    can_manage_projects: false,
    can_manage_clients: false,
    can_manage_assignments: false,
    can_view_payroll: false,
    can_manage_payroll: false,
    can_approve_leaves: false,
    can_approve_timesheets: false,
    can_manage_contracts: false,
    can_view_reports: true,
    can_create_reports: false,
    can_view_analytics: false,
  },
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: WorkspaceRole | null, permissionKey: string): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role];
  return perms ? perms[permissionKey] === true : false;
}

/**
 * Get user's workspace role from localStorage
 */
export function getUserWorkspaceRole(): WorkspaceRole | null {
  const role = localStorage.getItem('workspaceRole');
  return (role as WorkspaceRole) || null;
}

/**
 * Set user's workspace role in localStorage
 */
export function setUserWorkspaceRole(role: WorkspaceRole): void {
  localStorage.setItem('workspaceRole', role);
}

/**
 * Check if user can perform an action based on current role
 */
export function canPerformAction(permissionKey: string): boolean {
  const role = getUserWorkspaceRole();
  return hasPermission(role, permissionKey);
}

/**
 * Get role label for display
 */
export function getRoleLabel(role: WorkspaceRole): string {
  const labels: Record<WorkspaceRole, string> = {
    OWNER: 'Owner',
    ADMIN: 'Admin',
    HR_MANAGER: 'HR Manager',
    MANAGER: 'Manager',
    VIEWER: 'Viewer',
  };
  return labels[role] || role;
}

/**
 * Get role color for badge/tag display
 */
export function getRoleColor(role: WorkspaceRole): string {
  const colors: Record<WorkspaceRole, string> = {
    OWNER: 'red',
    ADMIN: 'orange',
    HR_MANAGER: 'blue',
    MANAGER: 'cyan',
    VIEWER: 'default',
  };
  return colors[role] || 'default';
}
