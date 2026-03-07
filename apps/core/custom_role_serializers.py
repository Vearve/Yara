"""
Custom Role Serializers
"""

from rest_framework import serializers
from .models import CustomRole, CustomRolePermission


class CustomRolePermissionSerializer(serializers.ModelSerializer):
    permission_label = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomRolePermission
        fields = ['id', 'permission_code', 'permission_label']
    
    def get_permission_label(self, obj):
        labels = dict(CustomRolePermission.AVAILABLE_PERMISSIONS)
        return labels.get(obj.permission_code, obj.permission_code)


class CustomRoleSerializer(serializers.ModelSerializer):
    permissions = CustomRolePermissionSerializer(many=True, read_only=True)
    permission_codes = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = CustomRole
        fields = [
            'id', 'name', 'description', 'color', 'is_active',
            'permissions', 'permission_codes', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def get_permission_codes(self, obj):
        """Get list of permission codes for this role"""
        return obj.permissions.values_list('permission_code', flat=True)
    
    def create(self, validated_data):
        # Get workspace from context
        workspace = self.context.get('workspace')
        request = self.context.get('request')
        
        validated_data['workspace'] = workspace
        validated_data['created_by'] = request.user if request else None
        
        role = CustomRole.objects.create(**validated_data)
        return role
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.color = validated_data.get('color', instance.color)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()
        return instance


class CustomRoleDetailSerializer(serializers.ModelSerializer):
    """Detailed role with permission details"""
    permissions = CustomRolePermissionSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = CustomRole
        fields = [
            'id', 'name', 'description', 'color', 'is_active',
            'permissions', 'created_by_name',
            'created_at', 'updated_at'
        ]


class SetRolePermissionsSerializer(serializers.Serializer):
    """Serializer for setting permissions on a role"""
    permission_codes = serializers.ListField(
        child=serializers.CharField(),
        help_text="List of permission codes to assign to this role"
    )
