"""
Custom Role ViewSet
Allows workspace admins to create and manage custom roles
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db import transaction

from .models import CustomRole, CustomRolePermission, WorkspaceMembership
from .custom_role_serializers import CustomRoleSerializer, CustomRoleDetailSerializer, SetRolePermissionsSerializer
from .permissions import check_permission


class CustomRoleViewSet(viewsets.ModelViewSet):
    """
    Custom role management for workspace admins.
    Only OWNER/ADMIN can create and manage custom roles.
    """
    serializer_class = CustomRoleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get custom roles for current workspace"""
        workspace = getattr(self.request, 'workspace', None)
        if not workspace:
            return CustomRole.objects.none()
        return CustomRole.objects.filter(workspace=workspace).prefetch_related('permissions')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['workspace'] = getattr(self.request, 'workspace', None)
        return context
    
    def check_admin_permission(self):
        """Ensure user is OWNER or ADMIN"""
        workspace = getattr(self.request, 'workspace', None)
        if not workspace:
            raise PermissionDenied('Workspace context required')
        
        if not check_permission(self.request.user, workspace, 'can_manage_members'):
            raise PermissionDenied('Only workspace admins can manage roles')
    
    def list(self, request, *args, **kwargs):
        """List all custom roles in workspace"""
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """Get detailed role with permissions"""
        instance = self.get_object()
        serializer = CustomRoleDetailSerializer(instance)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Create a new custom role (admin only)"""
        self.check_admin_permission()
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Update a custom role (admin only)"""
        self.check_admin_permission()
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a custom role (admin only)"""
        self.check_admin_permission()
        instance = self.get_object()
        
        # Check if role is in use
        if WorkspaceMembership.objects.filter(role=instance.name).exists():
            return Response(
                {'detail': f'Cannot delete role "{instance.name}" - it is assigned to members'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def set_permissions(self, request, pk=None):
        """
        Set permissions for a role.
        POST: {"permission_codes": ["can_manage_payroll", "can_view_reports", ...]}
        """
        self.check_admin_permission()
        
        role = self.get_object()
        serializer = SetRolePermissionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        permission_codes = serializer.validated_data['permission_codes']
        
        # Validate all codes exist
        valid_codes = dict(CustomRolePermission.AVAILABLE_PERMISSIONS).keys()
        invalid_codes = [code for code in permission_codes if code not in valid_codes]
        
        if invalid_codes:
            return Response(
                {'detail': f'Invalid permission codes: {invalid_codes}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update permissions atomically
        with transaction.atomic():
            # Delete old permissions
            role.permissions.all().delete()
            
            # Create new permissions
            for code in permission_codes:
                CustomRolePermission.objects.create(
                    role=role,
                    permission_code=code
                )
        
        serializer = CustomRoleDetailSerializer(role)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available_permissions(self, request):
        """Get list of all available permissions"""
        permissions_list = [
            {'code': code, 'label': label}
            for code, label in CustomRolePermission.AVAILABLE_PERMISSIONS
        ]
        return Response(permissions_list)
    
    @action(detail=True, methods=['post'])
    def assign_to_user(self, request, pk=None):
        """
        Assign this custom role to an existing user.
        POST: {"user_id": 5}
        """
        from .models import UserCustomRole
        from django.contrib.auth import get_user_model
        
        self.check_admin_permission()
        
        role = self.get_object()
        workspace = getattr(request, 'workspace', None)
        
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'detail': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        User = get_user_model()
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'detail': f'User with id {user_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is member of workspace
        if not WorkspaceMembership.objects.filter(user=user, workspace=workspace).exists():
            return Response(
                {'detail': 'User is not a member of this workspace'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create or get UserCustomRole
        user_role, created = UserCustomRole.objects.get_or_create(
            user=user,
            role=role,
            workspace=workspace,
            defaults={'assigned_by': request.user}
        )
        
        if not created:
            return Response(
                {'detail': f'{user.username} already has this role'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'detail': f'Role assigned to {user.username}',
            'user_role_id': user_role.id
        })
    
    @action(detail=True, methods=['post'])
    def create_user_with_role(self, request, pk=None):
        """
        Create a new user and assign this custom role.
        POST: {
            "username": "john@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "password": "optional - will auto-generate if not provided"
        }
        """
        from .models import UserCustomRole
        from django.contrib.auth import get_user_model
        import secrets
        import string
        
        self.check_admin_permission()
        
        role = self.get_object()
        workspace = getattr(request, 'workspace', None)
        
        username = request.data.get('username')
        email = request.data.get('email', username)
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        password = request.data.get('password')
        
        if not username:
            return Response(
                {'detail': 'username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Auto-generate password if not provided
        if not password:
            alphabet = string.ascii_letters + string.digits + '!@#$%'
            password = ''.join(secrets.choice(alphabet) for _ in range(7))
        
        User = get_user_model()
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'detail': f'User {username} already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Create workspace membership
            membership = WorkspaceMembership.objects.create(
                user=user,
                workspace=workspace,
                role='MEMBER',
                is_default=True,
                is_active=True
            )
            
            # Assign custom role
            user_role = UserCustomRole.objects.create(
                user=user,
                role=role,
                workspace=workspace,
                assigned_by=request.user
            )
        
        return Response({
            'detail': f'User {username} created and role assigned',
            'user_id': user.id,
            'username': user.username,
            'password': password,
            'membership_id': membership.id,
            'user_role_id': user_role.id
        }, status=status.HTTP_201_CREATED)
