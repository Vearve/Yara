"""
Core Serializers: Workspace, WorkspaceMembership
"""

from rest_framework import serializers
from .models import Workspace, WorkspaceMembership, WorkspaceAccessRequest, CustomRole
from django.contrib.auth.models import User


class WorkspaceSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    employee_count = serializers.SerializerMethodField()
    logo = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Workspace
        fields = [
            'id', 'name', 'code', 'workspace_type', 'description', 
            'industry', 'contact_email', 'contact_phone', 'address',
            'logo', 'is_active', 'created_at', 'updated_at',
            'member_count', 'employee_count'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_member_count(self, obj):
        return obj.members.filter(is_active=True).count()
    
    def get_employee_count(self, obj):
        return obj.employees.filter(employment_status='ACTIVE').count()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user info with workspace context when available."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']


class WorkspaceMembershipSerializer(serializers.ModelSerializer):
    user_details = UserBasicSerializer(source='user', read_only=True)
    workspace_details = WorkspaceSerializer(source='workspace', read_only=True)
    
    class Meta:
        model = WorkspaceMembership
        fields = [
            'id', 'user', 'workspace', 'role', 'is_default', 'is_active',
            'joined_at', 'invited_by',
            'user_details', 'workspace_details'
        ]
        read_only_fields = ['joined_at']


class WorkspaceSwitchSerializer(serializers.Serializer):
    """Serializer for workspace switching"""
    workspace_id = serializers.IntegerField()


class WorkspaceUserCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=False, allow_blank=True, write_only=True)
    role = serializers.ChoiceField(choices=WorkspaceMembership.ROLE_CHOICES, default='VIEWER')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("User with this email already exists. Use 'Add existing member' instead.")
        return value

    def create(self, validated_data):
        workspace = self.context.get('workspace')
        request = self.context.get('request')
        if not workspace:
            raise serializers.ValidationError('Workspace is required for creating members.')

        base_username = validated_data.get('username') or (validated_data['email'].split('@')[0] if validated_data.get('email') else 'user')
        username = base_username
        suffix = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{suffix}"
            suffix += 1

        password = validated_data.get('password') or User.objects.make_random_password()

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=password,
        )

        membership = WorkspaceMembership.objects.create(
            user=user,
            workspace=workspace,
            role=validated_data.get('role') or 'VIEWER',
            invited_by=request.user if request else None,
        )

        self.generated_password = password if not validated_data.get('password') else None
        return membership

    def to_representation(self, instance):
        data = WorkspaceMembershipSerializer(instance, context=self.context).data
        if getattr(self, 'generated_password', None):
            data['temporary_password'] = self.generated_password
        return data


class WorkspaceAccessRequestSerializer(serializers.ModelSerializer):
    """Serializer for workspace access requests"""
    requesting_user_details = UserBasicSerializer(source='requesting_user', read_only=True)
    workspace_details = WorkspaceSerializer(source='workspace', read_only=True)
    processed_by_details = UserBasicSerializer(source='processed_by', read_only=True)
    
    class Meta:
        model = WorkspaceAccessRequest
        fields = [
            'id', 'workspace', 'requesting_user', 'message', 'status',
            'processed_by', 'processed_at', 'admin_notes',
            'assigned_role', 'assigned_custom_role',
            'requested_at',
            'requesting_user_details', 'workspace_details', 'processed_by_details'
        ]
        read_only_fields = ['requesting_user', 'status', 'processed_by', 'processed_at', 'requested_at']


class WorkspaceAccessRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating access requests"""
    class Meta:
        model = WorkspaceAccessRequest
        fields = ['workspace', 'message']
    
    def create(self, validated_data):
        validated_data['requesting_user'] = self.context['request'].user
        
        # Check if user already has membership
        workspace = validated_data['workspace']
        user = validated_data['requesting_user']
        
        if WorkspaceMembership.objects.filter(workspace=workspace, user=user).exists():
            raise serializers.ValidationError("You already have access to this workspace")
        
        # Check if pending request already exists
        if WorkspaceAccessRequest.objects.filter(
            workspace=workspace,
            requesting_user=user,
            status='PENDING'
        ).exists():
            raise serializers.ValidationError("You already have a pending request for this workspace")
        
        return super().create(validated_data)


class WorkspaceAccessRequestProcessSerializer(serializers.Serializer):
    """Serializer for approving/denying access requests"""
    action = serializers.ChoiceField(choices=['APPROVE', 'DENY'])
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    assigned_role = serializers.ChoiceField(choices=WorkspaceMembership.ROLE_CHOICES, required=False)
    assigned_custom_role = serializers.IntegerField(required=False, allow_null=True)
