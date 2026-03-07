"""
RBAC (Role-Based Access Control) Models & Permissions
Defines roles, permissions, and user assignments.
"""

from django.db import models
from django.contrib.auth.models import User, Permission, Group
from django.contrib.contenttypes.models import ContentType


class Role(models.Model):
    """System roles: Owner, HR Admin, Manager, Employee, Contractor HR, Client Viewer."""
    ROLE_CHOICES = [
        ('OWNER', 'Owner/Director'),
        ('HR_ADMIN', 'HR Administrator'),
        ('MANAGER', 'Manager'),
        ('EMPLOYEE', 'Employee'),
        ('CONTRACTOR_HR', 'Contractor HR'),
        ('CLIENT_VIEWER', 'Client Viewer'),
    ]
    
    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Roles"
    
    def __str__(self):
        return self.name


class Permission_(models.Model):
    """Granular permissions for features."""
    PERMISSION_CHOICES = [
        # HCM
        ('VIEW_EMPLOYEES', 'View Employees'),
        ('ADD_EMPLOYEES', 'Add Employees'),
        ('EDIT_EMPLOYEES', 'Edit Employees'),
        ('DELETE_EMPLOYEES', 'Delete Employees'),
        ('VIEW_CONTRACTS', 'View Contracts'),
        ('MANAGE_CONTRACTS', 'Manage Contracts'),
        
        # Activities
        ('VIEW_REPORTS', 'View Reports'),
        ('CREATE_REPORTS', 'Create Reports'),
        ('MANAGE_HEARINGS', 'Manage Hearings'),
        ('MANAGE_INVESTIGATIONS', 'Manage Investigations'),
        
        # Tracking
        ('VIEW_COMPLIANCE', 'View Compliance'),
        ('MANAGE_TRAINING', 'Manage Training'),
        ('MANAGE_MEDICALS', 'Manage Medicals'),
        
        # Payroll
        ('VIEW_PAYROLL', 'View Payroll'),
        ('MANAGE_PAYROLL', 'Manage Payroll'),
        
        # Recruitment
        ('VIEW_RECRUITMENT', 'View Recruitment'),
        ('MANAGE_RECRUITMENT', 'Manage Recruitment'),
        
        # Approvals
        ('APPROVE_LEAVES', 'Approve Leaves'),
        ('APPROVE_TIMESHEETS', 'Approve Timesheets'),
        
        # Admin
        ('MANAGE_USERS', 'Manage Users'),
        ('VIEW_ANALYTICS', 'View Analytics'),
        ('MANAGE_SETTINGS', 'Manage Settings'),
    ]
    
    code = models.CharField(max_length=100, choices=PERMISSION_CHOICES, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Permissions"
    
    def __str__(self):
        return self.code


class RolePermission(models.Model):
    """Maps roles to permissions."""
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='permissions')
    permission = models.ForeignKey(Permission_, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = [['role', 'permission']]
        verbose_name_plural = "Role Permissions"
    
    def __str__(self):
        return f"{self.role.name} → {self.permission.code}"


class UserRole(models.Model):
    """Assigns a user to a role within a tenant/company."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_role')
    role = models.ForeignKey(Role, on_delete=models.PROTECT)
    
    # Scope (optional manager of a department/site)
    department = models.ForeignKey('hcm.Department', on_delete=models.SET_NULL, null=True, blank=True, help_text="For managers: their managed department")
    site = models.ForeignKey('core.assignments.Site', on_delete=models.SET_NULL, null=True, blank=True, help_text="For site managers")
    
    # Effective permissions
    custom_permissions = models.ManyToManyField(Permission_, blank=True, help_text="Override role permissions")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "User Roles"
    
    def __str__(self):
        return f"{self.user.username} → {self.role.name}"
    
    @property
    def effective_permissions(self):
        """Get all permissions for this user (role + custom overrides)."""
        role_perms = self.role.permissions.all()
        custom_perms = self.custom_permissions.all()
        return set(list(role_perms) + list(custom_perms))


# Helper functions to set up default roles with permissions
def setup_default_roles():
    """Initialize default roles and permissions."""
    
    permissions_map = {
        'OWNER': [
            'VIEW_EMPLOYEES', 'ADD_EMPLOYEES', 'EDIT_EMPLOYEES', 'DELETE_EMPLOYEES',
            'VIEW_CONTRACTS', 'MANAGE_CONTRACTS',
            'VIEW_REPORTS', 'MANAGE_HEARINGS', 'MANAGE_INVESTIGATIONS',
            'VIEW_COMPLIANCE', 'MANAGE_TRAINING', 'MANAGE_MEDICALS',
            'VIEW_PAYROLL', 'MANAGE_PAYROLL',
            'VIEW_RECRUITMENT', 'MANAGE_RECRUITMENT',
            'APPROVE_LEAVES', 'APPROVE_TIMESHEETS',
            'MANAGE_USERS', 'VIEW_ANALYTICS', 'MANAGE_SETTINGS',
        ],
        'HR_ADMIN': [
            'VIEW_EMPLOYEES', 'ADD_EMPLOYEES', 'EDIT_EMPLOYEES',
            'VIEW_CONTRACTS', 'MANAGE_CONTRACTS',
            'VIEW_REPORTS', 'CREATE_REPORTS', 'MANAGE_HEARINGS', 'MANAGE_INVESTIGATIONS',
            'VIEW_COMPLIANCE', 'MANAGE_TRAINING', 'MANAGE_MEDICALS',
            'VIEW_PAYROLL', 'MANAGE_PAYROLL',
            'VIEW_RECRUITMENT', 'MANAGE_RECRUITMENT',
            'APPROVE_LEAVES', 'APPROVE_TIMESHEETS',
            'VIEW_ANALYTICS',
        ],
        'MANAGER': [
            'VIEW_EMPLOYEES',
            'VIEW_REPORTS', 'CREATE_REPORTS',
            'VIEW_COMPLIANCE',
            'APPROVE_LEAVES', 'APPROVE_TIMESHEETS',
            'VIEW_ANALYTICS',
        ],
        'EMPLOYEE': [
            'VIEW_EMPLOYEES',  # Limited to self/team
        ],
        'CONTRACTOR_HR': [
            'VIEW_EMPLOYEES', 'ADD_EMPLOYEES', 'EDIT_EMPLOYEES',
            'VIEW_CONTRACTS', 'MANAGE_CONTRACTS',
            'VIEW_REPORTS', 'CREATE_REPORTS', 'MANAGE_HEARINGS', 'MANAGE_INVESTIGATIONS',
            'VIEW_COMPLIANCE', 'MANAGE_TRAINING', 'MANAGE_MEDICALS',
            'VIEW_PAYROLL', 'MANAGE_PAYROLL',
            'VIEW_RECRUITMENT', 'MANAGE_RECRUITMENT',
            'APPROVE_LEAVES', 'APPROVE_TIMESHEETS',
            'VIEW_ANALYTICS',
        ],
        'CLIENT_VIEWER': [
            'VIEW_EMPLOYEES',  # Assigned to them only
            'VIEW_REPORTS',    # Their site incidents
            'VIEW_COMPLIANCE', # Their assigned staff
        ],
    }
    
    for role_name, perm_codes in permissions_map.items():
        role, _ = Role.objects.get_or_create(name=role_name)
        for perm_code in perm_codes:
            perm, _ = Permission_.objects.get_or_create(code=perm_code)
            RolePermission.objects.get_or_create(role=role, permission=perm)
    
    print("✓ Default roles and permissions set up.")
