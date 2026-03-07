"""
HCM URL Configuration
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet, ContractViewSet, EngagementViewSet,
    TerminationViewSet, DepartmentViewSet, ContractTypeViewSet,
    TerminationReasonViewSet, EmploymentTypeViewSet, JobViewSet,
    EmployeeCategoryViewSet, EmployeeDocumentViewSet
)

app_name = 'hcm'

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'contracts', ContractViewSet, basename='contract')
router.register(r'engagements', EngagementViewSet, basename='engagement')
router.register(r'terminations', TerminationViewSet, basename='termination')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'contract-types', ContractTypeViewSet, basename='contract-type')
router.register(r'termination-reasons', TerminationReasonViewSet, basename='termination-reason')
router.register(r'employment-types', EmploymentTypeViewSet, basename='employment-type')
router.register(r'employee-categories', EmployeeCategoryViewSet, basename='employee-category')
router.register(r'employee-documents', EmployeeDocumentViewSet, basename='employee-document')

urlpatterns = [
    path('', include(router.urls)),
]
