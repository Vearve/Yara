"""
Role-Based Permission System for Workspace Membership
Controls access to resources based on workspace membership role
Supports both built-in roles and custom roles
"""

from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from functools import wraps
from django.http import JsonResponse
from .models import WorkspaceMembership


class WorkspaceMembershipPermission(permissions.BasePermission):
    """
    Checks if user is an active member of the workspace.
    """
    def has_permission(self, request, view):
        # Superusers always have access
        if request.user.is_superuser:
            return True
        
        workspace_id = self._get_workspace_id(request, view)
        if not workspace_id:
            return False
        
        # Check if user is active member
        return WorkspaceMembership.objects.filter(
            user=request.user,
            workspace_id=workspace_id,
            is_active=True
        ).exists()

    def _get_workspace_id(self, request, view):
        """Extract workspace ID from request"""
        return getattr(request, 'workspace_id', None) or request.query_params.get('workspace')


class HasWorkspaceRole(permissions.BasePermission):
    """
    Checks if user has required role(s) in workspace.
    Usage: permission_classes = [HasWorkspaceRole]
    Set required_roles in view: required_roles = ['OWNER', 'ADMIN']
    """
    
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True
        
        workspace_id = self._get_workspace_id(request, view)
        required_roles = getattr(view, 'required_roles', None)
        
        if not workspace_id or not required_roles:
            return True
        
        membership = WorkspaceMembership.objects.filter(
            user=request.user,
            workspace_id=workspace_id,
            is_active=True
        ).first()
        
        if not membership:
            return False
        
        return membership.role in required_roles

    def _get_workspace_id(self, request, view):
        return getattr(request, 'workspace_id', None) or request.query_params.get('workspace')


# Role hierarchy and permissions mapping (for built-in roles)
ROLE_PERMISSIONS = {
    'OWNER': {
        'can_manage_members': True,
        'can_manage_settings': True,
        'can_create_employees': True,
        'can_edit_employees': True,
        'can_delete_employees': True,
        'can_manage_sites': True,
        'can_manage_projects': True,
        'can_manage_clients': True,
        'can_manage_assignments': True,
        'can_view_payroll': True,
        'can_manage_payroll': True,
        'can_approve_leaves': True,
        'can_approve_timesheets': True,
        'can_manage_contracts': True,
        'can_view_reports': True,
        'can_create_reports': True,
        'can_view_analytics': True,
    },
    'ADMIN': {
        'can_manage_members': True,
        'can_manage_settings': True,
        'can_create_employees': True,
        'can_edit_employees': True,
        'can_delete_employees': False,
        'can_manage_sites': True,
        'can_manage_projects': True,
        'can_manage_clients': True,
        'can_manage_assignments': True,
        'can_view_payroll': True,
        'can_manage_payroll': True,
        'can_approve_leaves': True,
        'can_approve_timesheets': True,
        'can_manage_contracts': True,
        'can_view_reports': True,
        'can_create_reports': True,
        'can_view_analytics': True,
    },
    'HR_MANAGER': {
        'can_manage_members': False,
        'can_manage_settings': False,
        'can_create_employees': True,
        'can_edit_employees': True,
        'can_delete_employees': False,
        'can_manage_sites': False,
        'can_manage_projects': False,
        'can_manage_clients': False,
        'can_manage_assignments': True,
        'can_view_payroll': True,
        'can_manage_payroll': False,
        'can_approve_leaves': True,
        'can_approve_timesheets': True,
        'can_manage_contracts': True,
        'can_view_reports': True,
        'can_create_reports': True,
        'can_view_analytics': True,
    },
    'MANAGER': {
        'can_manage_members': False,
        'can_manage_settings': False,
        'can_create_employees': False,
        'can_edit_employees': False,
        'can_delete_employees': False,
        'can_manage_sites': False,
        'can_manage_projects': False,
        'can_manage_clients': False,
        'can_manage_assignments': False,
        'can_view_payroll': False,
        'can_manage_payroll': False,
        'can_approve_leaves': True,
        'can_approve_timesheets': True,
        'can_manage_contracts': False,
        'can_view_reports': True,
        'can_create_reports': True,
        'can_view_analytics': True,
    },
    'VIEWER': {
        'can_manage_members': False,
        'can_manage_settings': False,
        'can_create_employees': False,
        'can_edit_employees': False,
        'can_delete_employees': False,
        'can_manage_sites': False,
        'can_manage_projects': False,
        'can_manage_clients': False,
        'can_manage_assignments': False,
        'can_view_payroll': False,
        'can_manage_payroll': False,
        'can_approve_leaves': False,
        'can_approve_timesheets': False,
        'can_manage_contracts': False,
        'can_view_reports': True,
        'can_create_reports': False,
        'can_view_analytics': False,
    },
}


def get_user_workspace_role(user, workspace):
    """Get user's role in a workspace"""
    membership = WorkspaceMembership.objects.filter(
        user=user,
        workspace=workspace,
        is_active=True
    ).first()
    return membership.role if membership else None


def get_user_permissions(user, workspace):
    """
    Get all permissions for user in workspace.
    Checks both built-in role and custom role permissions.
    """
    membership = WorkspaceMembership.objects.filter(
        user=user,
        workspace=workspace,
        is_active=True
    ).first()
    
    if not membership:
        return {}
    
    # If it's a built-in role, use predefined permissions
    if membership.role in ROLE_PERMISSIONS:
        return ROLE_PERMISSIONS[membership.role]
    
    # If it's a custom role, get permissions from CustomRolePermission
    try:
        from .custom_roles import CustomRole, CustomRolePermission
        custom_role = CustomRole.objects.filter(
            workspace=workspace,
            name=membership.role,
            is_active=True
        ).first()
        
        if custom_role:
            permissions_dict = {}
            for perm in custom_role.permissions.all():
                permissions_dict[perm.permission_code] = True
            return permissions_dict
    except:
        pass
    
    return {}


def check_permission(user, workspace, permission_key):
    """Check if user has specific permission in workspace"""
    perms = get_user_permissions(user, workspace)
    return perms.get(permission_key, False)


def require_workspace_permission(permission_key):
    """Decorator to check workspace permission on view methods"""
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            workspace = getattr(request, 'workspace', None)
            if not workspace:
                return JsonResponse({'detail': 'Workspace context required'}, status=400)
            
            if not check_permission(request.user, workspace, permission_key):
                return JsonResponse({'detail': f'Permission denied: {permission_key}'}, status=403)
            
            return func(self, request, *args, **kwargs)
        return wrapper
    return decorator
