"""
Activities API ViewSets
Handles reports, interviews, hearings, investigations, case studies, and KPIs.
"""

from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Report, ReportType, Interview, Hearing, Investigation, CaseStudy, Charge, KPI,
    Appraisal, AppraisalObjective, AppraisalFactor,
    AppraisalImprovementItem, AppraisalNextObjective, AppraisalDevelopmentItem,
    ScheduleEvent,
)
from .serializers import (
    ReportSerializer, ReportTypeSerializer, InterviewSerializer, HearingSerializer,
    InvestigationSerializer, CaseStudySerializer, ChargeSerializer, KPISerializer,
    AppraisalSerializer, AppraisalObjectiveSerializer, AppraisalFactorSerializer,
    AppraisalImprovementItemSerializer, AppraisalNextObjectiveSerializer,
    AppraisalDevelopmentItemSerializer, ScheduleEventSerializer,
)


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet for safety, complaint, grievance, and disciplinary reports."""
    queryset = Report.objects.select_related('reported_by').all()
    serializer_class = ReportSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['report_type', 'severity', 'status', 'case_study']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by workspace through reporter or reported employee
        if hasattr(self.request, 'workspace') and self.request.workspace:
            from django.db.models import Q
            qs = qs.filter(
                Q(reported_by__workspace=self.request.workspace) |
                Q(reported_employee__workspace=self.request.workspace)
            )
        return qs

    def perform_create(self, serializer):
        from django.utils import timezone
        from apps.hcm.models import Employee

        incident_date = serializer.validated_data.get('incident_date')
        if not incident_date:
            serializer.validated_data['incident_date'] = timezone.now().date()

        if not serializer.validated_data.get('reported_by'):
            user_email = getattr(self.request.user, 'email', None)
            if user_email:
                reporter = Employee.objects.filter(email__iexact=user_email).first()
                if reporter:
                    serializer.validated_data['reported_by'] = reporter

        serializer.save()


class ReportTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """Lookup for report types."""
    queryset = ReportType.objects.all()
    serializer_class = ReportTypeSerializer


class InterviewViewSet(viewsets.ModelViewSet):
    """ViewSet for candidate interviews."""
    queryset = Interview.objects.all()
    serializer_class = InterviewSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['candidate_name', 'position']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save()


class HearingViewSet(viewsets.ModelViewSet):
    """ViewSet for disciplinary hearings."""
    queryset = Hearing.objects.select_related('related_employee').all()
    serializer_class = HearingSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['related_employee', 'hearing_date', 'status', 'case_study']
    ordering_fields = ['created_at', 'hearing_date']
    ordering = ['-hearing_date']

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by workspace through related_employee
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(related_employee__workspace=self.request.workspace)
        return qs

    def perform_create(self, serializer):
        serializer.save()


class InvestigationViewSet(viewsets.ModelViewSet):
    """ViewSet for investigations."""
    queryset = Investigation.objects.select_related('related_report', 'related_employee').all()
    serializer_class = InvestigationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['related_employee', 'status', 'investigation_date', 'case_study']
    search_fields = ['title', 'description', 'investigator', 'findings', 'observations']
    ordering_fields = ['created_at', 'investigation_date']
    ordering = ['-investigation_date']

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by workspace through related_employee
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(related_employee__workspace=self.request.workspace)
        return qs

    def perform_create(self, serializer):
        serializer.save()


class CaseStudyViewSet(viewsets.ModelViewSet):
    """ViewSet for case studies linking reports to hearings/investigations."""
    queryset = CaseStudy.objects.select_related('related_report', 'related_employee').all()
    serializer_class = CaseStudySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['case_number', 'title']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by workspace through related_employee
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(related_employee__workspace=self.request.workspace)
        return qs

    def perform_create(self, serializer):
        serializer.save()


class ChargeViewSet(viewsets.ModelViewSet):
    """Standalone charge sheets before case study creation."""
    queryset = Charge.objects.select_related('employee').all()
    serializer_class = ChargeSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'case_study', 'status', 'plea']
    search_fields = ['employee__first_name', 'employee__last_name', 'allegations', 'statement']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by workspace through employee
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(employee__workspace=self.request.workspace)
        return qs

    def perform_create(self, serializer):
        serializer.save()


class KPIViewSet(viewsets.ModelViewSet):
    """ViewSet for KPI tracking."""
    queryset = KPI.objects.select_related('employee').all()
    serializer_class = KPISerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'kpi_type', 'frequency']
    search_fields = ['kpi_name', 'description']
    ordering_fields = ['created_at', 'start_date', 'end_date']
    ordering = ['-end_date']

    def perform_create(self, serializer):
        serializer.save()


class AppraisalViewSet(viewsets.ModelViewSet):
    """ViewSet for performance appraisals."""
    queryset = Appraisal.objects.select_related('appraisee', 'supervisor', 'department').all()
    serializer_class = AppraisalSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'appraisee': ['exact'],
        'supervisor': ['exact'],
        'department': ['exact'],
        'review_start': ['exact', 'gte', 'lte'],
        'review_end': ['exact', 'gte', 'lte'],
    }
    search_fields = [
        'appraisee__first_name',
        'appraisee__last_name',
        'appraisee__employee_id',
        'supervisor__first_name',
        'supervisor__last_name',
        'position_held',
    ]
    ordering_fields = ['review_end', 'created_at']
    ordering = ['-review_end']

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by workspace through appraisee (employee being appraised)
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(appraisee__workspace=self.request.workspace)
        return qs

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class AppraisalObjectiveViewSet(viewsets.ModelViewSet):
    queryset = AppraisalObjective.objects.select_related('appraisal').all()
    serializer_class = AppraisalObjectiveSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['appraisal']
    ordering_fields = ['order']
    ordering = ['order']


class AppraisalFactorViewSet(viewsets.ModelViewSet):
    queryset = AppraisalFactor.objects.select_related('appraisal').all()
    serializer_class = AppraisalFactorSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['appraisal', 'group']
    ordering_fields = ['order']
    ordering = ['order']


class AppraisalImprovementItemViewSet(viewsets.ModelViewSet):
    queryset = AppraisalImprovementItem.objects.select_related('appraisal').all()
    serializer_class = AppraisalImprovementItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['appraisal']


class AppraisalNextObjectiveViewSet(viewsets.ModelViewSet):
    queryset = AppraisalNextObjective.objects.select_related('appraisal').all()
    serializer_class = AppraisalNextObjectiveSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['appraisal']


class AppraisalDevelopmentItemViewSet(viewsets.ModelViewSet):
    queryset = AppraisalDevelopmentItem.objects.select_related('appraisal').all()
    serializer_class = AppraisalDevelopmentItemSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['appraisal']


class ScheduleEventViewSet(viewsets.ModelViewSet):
    """ViewSet for calendar schedule events."""
    queryset = ScheduleEvent.objects.all()
    serializer_class = ScheduleEventSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'status', 'date']
    search_fields = ['title', 'case_study']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'workspace') and self.request.workspace:
            # Explicitly filter by workspace and exclude NULL workspaces
            qs = qs.filter(workspace=self.request.workspace).exclude(workspace__isnull=True)
        else:
            # If no workspace context, return empty queryset
            qs = qs.none()
        return qs

    def perform_create(self, serializer):
        if hasattr(self.request, 'workspace') and self.request.workspace:
            serializer.save(workspace=self.request.workspace)
        else:
            serializer.save()
    
    def perform_update(self, serializer):
        # Preserve workspace on update
        if hasattr(self.request, 'workspace') and self.request.workspace:
            serializer.save(workspace=self.request.workspace)
        else:
            serializer.save()
