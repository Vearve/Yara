/**
 * Hook for view-level permission checks
 * Provides utilities to control button visibility and action availability
 */

import { canPerformAction } from '../lib/permissions';

interface ActionPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}

/**
 * Get action permissions for a resource type
 */
export function useResourcePermissions(resourceType: string): ActionPermissions {
  const permissionMap: Record<string, Partial<ActionPermissions>> = {
    employees: {
      canCreate: canPerformAction('can_create_employees'),
      canEdit: canPerformAction('can_edit_employees'),
      canDelete: canPerformAction('can_delete_employees'),
      canView: canPerformAction('can_view_reports'),
    },
    sites: {
      canCreate: canPerformAction('can_manage_sites'),
      canEdit: canPerformAction('can_manage_sites'),
      canDelete: canPerformAction('can_manage_sites'),
      canView: true,
    },
    projects: {
      canCreate: canPerformAction('can_manage_projects'),
      canEdit: canPerformAction('can_manage_projects'),
      canDelete: canPerformAction('can_manage_projects'),
      canView: true,
    },
    clients: {
      canCreate: canPerformAction('can_manage_clients'),
      canEdit: canPerformAction('can_manage_clients'),
      canDelete: canPerformAction('can_manage_clients'),
      canView: true,
    },
    assignments: {
      canCreate: canPerformAction('can_manage_assignments'),
      canEdit: canPerformAction('can_manage_assignments'),
      canDelete: canPerformAction('can_manage_assignments'),
      canView: true,
    },
    payroll: {
      canCreate: canPerformAction('can_manage_payroll'),
      canEdit: canPerformAction('can_manage_payroll'),
      canDelete: canPerformAction('can_manage_payroll'),
      canView: canPerformAction('can_view_payroll'),
    },
    contracts: {
      canCreate: canPerformAction('can_manage_contracts'),
      canEdit: canPerformAction('can_manage_contracts'),
      canDelete: canPerformAction('can_manage_contracts'),
      canView: canPerformAction('can_manage_contracts'),
    },
    leaves: {
      canCreate: true,
      canEdit: canPerformAction('can_approve_leaves'),
      canDelete: canPerformAction('can_approve_leaves'),
      canView: true,
    },
    timesheets: {
      canCreate: true,
      canEdit: canPerformAction('can_approve_timesheets'),
      canDelete: canPerformAction('can_approve_timesheets'),
      canView: true,
    },
  };

  const perms = permissionMap[resourceType] || {};
  return {
    canCreate: perms.canCreate || false,
    canEdit: perms.canEdit || false,
    canDelete: perms.canDelete || false,
    canView: perms.canView !== false,
  };
}

/**
 * Check if user can perform a specific action on a resource
 */
export function canPerformResourceAction(resourceType: string, action: 'create' | 'edit' | 'delete'): boolean {
  const perms = useResourcePermissions(resourceType);
  const actionMap = {
    create: perms.canCreate,
    edit: perms.canEdit,
    delete: perms.canDelete,
  };
  return actionMap[action] || false;
}
