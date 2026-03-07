"""
JWT Authentication Middleware
Authenticates the user from JWT token before other middleware runs.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import AnonymousUser


class JWTAuthenticationMiddleware:
    """
    Middleware to authenticate user via JWT token.
    This runs before WorkspaceMiddleware so request.user is available.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Try to authenticate via JWT
        if 'HTTP_AUTHORIZATION' in request.META:
            try:
                jwt_auth = JWTAuthentication()
                auth_result = jwt_auth.authenticate(request)
                if auth_result is not None:
                    user, token = auth_result
                    request.user = user
                    request.auth = token
            except Exception:
                # If JWT authentication fails, leave user as AnonymousUser
                pass
        
        response = self.get_response(request)
        return response
