from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteViewSet, SiteEmployeeViewSet, SitePeriodViewSet

app_name = 'sites'

router = DefaultRouter()
router.register(r'sites', SiteViewSet, basename='site')
router.register(r'site-employees', SiteEmployeeViewSet, basename='site-employee')
router.register(r'site-periods', SitePeriodViewSet, basename='site-period')

urlpatterns = [
    path('', include(router.urls)),
]
