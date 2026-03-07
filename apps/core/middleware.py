"""
Workspace Middleware
Captures current workspace from request header and adds it to request object.
Attaches role information for permission checking.
"""

from apps.core.models import WorkspaceMembership


class WorkspaceMiddleware:
    """
    Middleware to capture workspace context from request headers.
    Expects 'X-Workspace-ID' header with workspace ID.
    Also checks query param ?workspace= as fallback.
    Sets up request.workspace, request.workspace_id, and request.workspace_role.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        workspace_id = None
        request.workspace = None
        request.workspace_id = None
        request.workspace_role = None
        
        # Try header first
        if 'HTTP_X_WORKSPACE_ID' in request.META:
            try:
                workspace_id = int(request.META['HTTP_X_WORKSPACE_ID'])
                # DEBUG: Log workspace from header
                import sys
                print(f"[WORKSPACE] Header sent - workspace_id={workspace_id}, path={request.path}", file=sys.stderr)
            except (ValueError, TypeError):
                pass
        else:
            # DEBUG: No header found
            import sys
            print(f"[WORKSPACE] NO HEADER - path={request.path}, user={request.user}", file=sys.stderr)
        
        # Try query param as fallback
        if not workspace_id and 'workspace' in request.GET:
            try:
                workspace_id = int(request.GET['workspace'])
            except (ValueError, TypeError):
                pass
        
        # If user is authenticated and workspace specified, verify & attach access info
        if request.user and request.user.is_authenticated and workspace_id:
            try:
                import sys
                print(f"[WORKSPACE] Looking up membership: user={request.user.email}, workspace_id={workspace_id}", file=sys.stderr)
                membership = WorkspaceMembership.objects.select_related('workspace').get(
                    user=request.user,
                    workspace_id=workspace_id,
                    is_active=True
                )
                request.workspace = membership.workspace
                request.workspace_id = workspace_id
                request.workspace_role = membership.role
                print(f"[WORKSPACE] ✓ Workspace attached: {membership.workspace.name} (ID={workspace_id})", file=sys.stderr)
            except WorkspaceMembership.DoesNotExist:
                import sys
                print(f"[WORKSPACE] ✗ User {request.user.email} has NO ACTIVE membership to workspace {workspace_id}", file=sys.stderr)
                # Check if membership exists but is inactive
                inactive = WorkspaceMembership.objects.filter(user=request.user, workspace_id=workspace_id).first()
                if inactive:
                    print(f"[WORKSPACE] Found INACTIVE membership (is_active={inactive.is_active})", file=sys.stderr)
                else:
                    print(f"[WORKSPACE] No membership record found at all", file=sys.stderr)
                pass
        elif request.user and request.user.is_authenticated and not workspace_id:
            # Try to use default workspace
            default_membership = WorkspaceMembership.objects.select_related('workspace').filter(
                user=request.user,
                is_default=True,
                is_active=True
            ).first()
            if default_membership:
                import sys
                print(f"[WORKSPACE] ⚠ NO HEADER - Using DEFAULT workspace: {default_membership.workspace.name} (ID={default_membership.workspace_id})", file=sys.stderr)
                request.workspace = default_membership.workspace
                request.workspace_id = default_membership.workspace_id
                request.workspace_role = default_membership.role
        
        response = self.get_response(request)
        return response
