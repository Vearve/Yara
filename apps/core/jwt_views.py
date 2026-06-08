from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from apps.core.models import WorkspaceMembership


class WorkspaceAwareTokenObtainPairSerializer(TokenObtainPairSerializer):
    workspace_id = serializers.IntegerField(required=False, allow_null=True)

    def validate(self, attrs):
        # Extract optional workspace_id from request data
        workspace_id = attrs.pop('workspace_id', None)
        data = super().validate(attrs)

        user = self.user
        
        # Fetch all active workspace memberships in a SINGLE query with select_related
        memberships = WorkspaceMembership.objects.filter(
            user=user,
            is_active=True
        ).select_related('workspace').prefetch_related('workspace')
        
        # Build comprehensive workspace data for frontend (avoid second API call)
        workspace_list = []
        default_ws = None
        workspace_ids = []
        
        for m in memberships:
            workspace_ids.append(m.workspace_id)
            workspace_data = {
                'id': m.workspace_id,
                'name': m.workspace.name,
                'code': m.workspace.code,
                'workspace_type': m.workspace.workspace_type,
                'is_default': m.is_default,
                'role': m.role,
                'logo': m.workspace.logo_data if hasattr(m.workspace, 'logo_data') else None,
            }
            workspace_list.append(workspace_data)
            
            if m.is_default:
                default_ws = m.workspace_id
        
        # If no default, use first
        if not default_ws and workspace_ids:
            default_ws = workspace_ids[0]
        
        # Respect requested workspace if user has access
        selected_ws = workspace_id if (workspace_id and workspace_id in workspace_ids) else default_ws
        
        # Include comprehensive workspace data to AVOID second API call
        data['workspaces'] = workspace_list  # Array of full workspace objects
        data['workspace_ids'] = workspace_ids
        data['default_workspace_id'] = default_ws
        data['selected_workspace_id'] = selected_ws
        
        return data


class WorkspaceAwareTokenObtainPairView(TokenObtainPairView):
    serializer_class = WorkspaceAwareTokenObtainPairSerializer
