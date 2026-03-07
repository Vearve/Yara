"""
Custom Role Models
Allow workspace admins to create custom roles with granular permissions
"""

from django.db import models
from .models import Workspace
from django.contrib.auth.models import User


class CustomRole(models.Model):
    """
    Custom roles defined by workspace admins.
    Each workspace can have multiple custom roles with specific permissions.
    """
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='custom_roles')
    name = models.CharField(max_length=100)  # e.g., "Admin Payroll Only", "Project Manager"
    description = models.TextField(blank=True)
    color = models.CharField(max_length=20, default='blue', help_text="For UI display")
    
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_roles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = [('workspace', 'name')]
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} @ {self.workspace.name}"


class CustomRolePermission(models.Model):
    """
    Permission assignments for custom roles.
    Maps which permissions are available for a custom role.
    """
    AVAILABLE_PERMISSIONS = [
        # Member Management
        ('can_manage_members', 'Manage Workspace Members'),
        ('can_manage_settings', 'Manage Workspace Settings'),
        
        # Employee Management
        ('can_view_employees', 'View Employees'),
        ('can_create_employees', 'Create Employees'),
        ('can_edit_employees', 'Edit Employees'),
        ('can_delete_employees', 'Delete Employees'),
        
        # Sites/Projects
        ('can_manage_sites', 'Manage Sites'),
        ('can_manage_projects', 'Manage Projects'),
        ('can_manage_clients', 'Manage Clients'),
        ('can_manage_assignments', 'Manage Assignments'),
        
        # Payroll
        ('can_view_payroll', 'View Payroll'),
        ('can_manage_payroll', 'Manage Payroll'),
        
        # Approvals
        ('can_approve_leaves', 'Approve Leaves'),
        ('can_approve_timesheets', 'Approve Timesheets'),
        
        # Contracts
        ('can_manage_contracts', 'Manage Contracts'),
        
        # Reports
        ('can_view_reports', 'View Reports'),
        ('can_create_reports', 'Create Reports'),
        
        # Analytics
        ('can_view_analytics', 'View Analytics'),
    ]
    
    role = models.ForeignKey(CustomRole, on_delete=models.CASCADE, related_name='permissions')
    permission_code = models.CharField(max_length=100, choices=AVAILABLE_PERMISSIONS)
    
    class Meta:
        unique_together = [('role', 'permission_code')]
    
    def __str__(self):
        return f"{self.role.name} → {self.permission_code}"


class UserCustomRole(models.Model):
    """
    Assigns custom roles to users within specific workspaces.
    A user can have multiple custom roles across different workspaces.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='custom_roles')
    role = models.ForeignKey(CustomRole, on_delete=models.CASCADE, related_name='user_assignments')
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='user_custom_roles')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='custom_role_assignments_made')
    
    class Meta:
        unique_together = [('user', 'role', 'workspace')]
        ordering = ['-assigned_at']
    
    def __str__(self):
        return f"{self.user.username} → {self.role.name} @ {self.workspace.name}"
