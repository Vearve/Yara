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
        # List of accessible workspaces
        memberships = WorkspaceMembership.objects.filter(user=user, is_active=True).select_related('workspace')
        workspace_ids = [m.workspace_id for m in memberships]
        default_ws = next((m.workspace_id for m in memberships if m.is_default), workspace_ids[0] if workspace_ids else None)

        # Respect requested workspace if user has access
        if workspace_id and workspace_id in workspace_ids:
            selected_ws = workspace_id
        else:
            selected_ws = default_ws

        # Include claims to help frontend
        data['workspaces'] = workspace_ids
        data['default_workspace_id'] = default_ws
        data['selected_workspace_id'] = selected_ws
        return data


class WorkspaceAwareTokenObtainPairView(TokenObtainPairView):
    serializer_class = WorkspaceAwareTokenObtainPairSerializer
