"""
Tracking API ViewSets
Handles training, medicals, permits, probation, and compliance alerts.
"""

from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Training, TrainingType, Medical, Permit, Probation, ComplianceAlert
from .serializers import (
    TrainingSerializer, TrainingTypeSerializer, MedicalSerializer, PermitSerializer,
    ProbationSerializer, ComplianceAlertSerializer
)


class TrainingTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for training type lookup."""
    queryset = TrainingType.objects.all()
    serializer_class = TrainingTypeSerializer
    pagination_class = None  # Return all training types without pagination

    def get_queryset(self):
        qs = super().get_queryset()
        if not qs.exists():
            TrainingType.objects.bulk_create(
                [
                    TrainingType(name='Safety Induction', category='DRILL'),
                    TrainingType(name='First Aid', category='THIRD_PARTY'),
                    TrainingType(name='Equipment Operation', category='THIRD_PARTY'),
                    TrainingType(name='Compliance Refresher', category='ADMINISTRATIVE'),
                ],
                ignore_conflicts=True,
            )
            qs = super().get_queryset()
        return qs


class TrainingViewSet(viewsets.ModelViewSet):
    """ViewSet for employee training records."""
    queryset = Training.objects.select_related('employee', 'training_type').all()
    serializer_class = TrainingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'training_type', 'status']
    search_fields = ['title', 'provider', 'employee__first_name', 'employee__last_name']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by workspace through employee
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(employee__workspace=self.request.workspace)
        return qs


class MedicalViewSet(viewsets.ModelViewSet):
    """ViewSet for employee medical records."""
    serializer_class = MedicalSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'medical_type', 'status']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id', 'medical_type']
    ordering_fields = ['created_at', 'expiry_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        qs = Medical.objects.select_related('employee').all()
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(employee__workspace=self.request.workspace)
        return qs


class PermitViewSet(viewsets.ModelViewSet):
    """ViewSet for employee permits."""
    serializer_class = PermitSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'permit_type', 'status']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        qs = Permit.objects.select_related('employee', 'permit_type').all()
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(employee__workspace=self.request.workspace)
        return qs


class ProbationViewSet(viewsets.ModelViewSet):
    """ViewSet for employee probation tracking."""
    serializer_class = ProbationSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'status']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        qs = Probation.objects.select_related('employee').all()
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(employee__workspace=self.request.workspace)
        return qs


class ComplianceAlertViewSet(viewsets.ModelViewSet):
    """ViewSet for compliance alerts and expiry notifications."""
    queryset = ComplianceAlert.objects.select_related('employee').all()
    serializer_class = ComplianceAlertSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'alert_type', 'status']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
