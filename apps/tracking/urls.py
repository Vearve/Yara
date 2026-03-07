from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TrainingViewSet, TrainingTypeViewSet, MedicalViewSet, PermitViewSet,
    ProbationViewSet, ComplianceAlertViewSet
)

app_name = 'tracking'

router = DefaultRouter()
router.register(r'training-types', TrainingTypeViewSet, basename='training-type')
router.register(r'trainings', TrainingViewSet, basename='training')
router.register(r'medicals', MedicalViewSet, basename='medical')
router.register(r'permits', PermitViewSet, basename='permit')
router.register(r'probations', ProbationViewSet, basename='probation')
router.register(r'compliance-alerts', ComplianceAlertViewSet, basename='compliance-alert')

urlpatterns = [
    path('', include(router.urls)),
]
