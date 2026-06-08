"""
Workspace Middleware
Captures current workspace from request header and adds it to request object.
Attaches role information for permission checking.
Uses request-level caching to prevent duplicate lookups.
"""

from apps.core.models import WorkspaceMembership


class WorkspaceMiddleware:
    """
    Middleware to capture workspace context from request headers.
    Expects 'X-Workspace-ID' header with workspace ID.
    Also checks query param ?workspace= as fallback.
    Sets up request.workspace, request.workspace_id, and request.workspace_role.
    
    Uses request._workspace_cache to prevent duplicate DB lookups within same request.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        workspace_id = None
        request.workspace = None
        request.workspace_id = None
        request.workspace_role = None
        request._workspace_cache = {}  # Cache for this request lifecycle
        
        # Try header first
        if 'HTTP_X_WORKSPACE_ID' in request.META:
            try:
                workspace_id = int(request.META['HTTP_X_WORKSPACE_ID'])
            except (ValueError, TypeError):
                pass
        
        # Try query param as fallback
        if not workspace_id and 'workspace' in request.GET:
            try:
                workspace_id = int(request.GET['workspace'])
            except (ValueError, TypeError):
                pass
        
        # If user is authenticated and workspace specified, verify & attach access info
        if request.user and request.user.is_authenticated and workspace_id:
            try:
                # Build cache key
                cache_key = f"ws_{request.user.id}_{workspace_id}"
                
                # Check request-level cache first (prevents duplicate queries in same request)
                if cache_key in request._workspace_cache:
                    membership = request._workspace_cache[cache_key]
                else:
                    membership = WorkspaceMembership.objects.select_related('workspace').get(
                        user=request.user,
                        workspace_id=workspace_id,
                        is_active=True
                    )
                    # Cache in request
                    request._workspace_cache[cache_key] = membership
                
                request.workspace = membership.workspace
                request.workspace_id = workspace_id
                request.workspace_role = membership.role
            except WorkspaceMembership.DoesNotExist:
                pass
        elif request.user and request.user.is_authenticated and not workspace_id:
            # Try to use default workspace
            cache_key = f"default_ws_{request.user.id}"
            if cache_key in request._workspace_cache:
                default_membership = request._workspace_cache[cache_key]
            else:
                default_membership = WorkspaceMembership.objects.select_related('workspace').filter(
                    user=request.user,
                    is_default=True,
                    is_active=True
                ).first()
                if default_membership:
                    request._workspace_cache[cache_key] = default_membership
            
            if default_membership:
                request.workspace = default_membership.workspace
                request.workspace_id = default_membership.workspace_id
                request.workspace_role = default_membership.role
        
        response = self.get_response(request)
        return response
