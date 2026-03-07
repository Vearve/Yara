from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import KPIViewSet

router = SimpleRouter()
router.register(r'kpis', KPIViewSet, basename='kpi')

urlpatterns = [
    path('', include(router.urls)),
]
