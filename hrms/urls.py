"""
Main URL configuration for HRMS.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from apps.core.jwt_views import WorkspaceAwareTokenObtainPairView
from apps.core.profile_views import UserProfileView

urlpatterns = [
    # Root redirect
    path('', TemplateView.as_view(template_name='api_index.html'), name='api-index'),
    
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Auth (JWT)
    path('api/v1/auth/token/', WorkspaceAwareTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('api/v1/auth/profile/', UserProfileView.as_view(), name='user-profile'),
    
    # API Routes
    path('api/v1/hcm/', include('apps.hcm.urls')),
    path('api/v1/payroll/', include('apps.payroll.urls')),
    path('api/v1/leave/', include('apps.leave.urls')),
    path('api/v1/recruitment/', include('apps.recruitment.urls')),
    path('api/v1/tracking/', include('apps.tracking.urls')),
    path('api/v1/activities/', include('apps.activities.urls')),
    path('api/v1/performance/', include('apps.performance.urls')),
    path('api/v1/core/', include('apps.core.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
