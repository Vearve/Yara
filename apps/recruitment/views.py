"""
Recruitment API ViewSets
Handles ATR (Approval To Recruit) and Candidate pipeline management.

ATR (Approval To Recruit):
- Department managers use this to request approval for new hiring
- Captures required skills, experience, qualifications, and skill sets
- Tracks budget, headcount categories, and recruitment strategies
- Requires approvals from HR Manager, Operations Manager, and Director
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import ATR, Candidate, CandidateDocument
from .serializers import ATRSerializer, CandidateSerializer, CandidateDocumentSerializer


class ATRViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Approval To Recruit forms.
    
    Department managers or authorized users submit ATR forms to request
    approval for new hires. Each ATR specifies:
    - Position title and required roles to fill
    - Required skills, experience, and qualifications
    - Budget allocation and headcount categories
    - Recruitment strategies (internal/external advertising, agencies, etc.)
    - Approval workflow (HR Manager -> Operations Manager -> Director)
    """
    queryset = ATR.objects.select_related('department').all()
    serializer_class = ATRSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'budgeted']
    search_fields = ['reference_number', 'position_title', 'hiring_supervisor_name']
    ordering_fields = ['created_at', 'due_date']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by workspace directly through department
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(department__workspace=self.request.workspace)
        return qs

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Return summary statistics for ATR dashboard."""
        from django.db.models import Count, Q
        
        qs = ATR.objects.all()
        if hasattr(request, 'workspace') and request.workspace:
            qs = qs.filter(department__workspace=request.workspace)
        
        total = qs.count()
        pending_approval = qs.filter(approval_status='PENDING').count()
        fully_approved = qs.filter(approval_status='APPROVED').count()
        
        return Response({
            'total_atrs': total,
            'pending_approval': pending_approval,
            'fully_approved': fully_approved,
            'total_roles_to_fill': qs.aggregate(total=Count('roles_to_fill'))['total'] or 0,
        })


class CandidateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for recruitment candidates and pipeline tracking.
    
    Tracks candidates through the recruitment and onboarding pipeline including:
    - Interview and recommendation stages
    - Medical assessments (silicosis, medicals)
    - Induction programs (IBF, initial, company, site)
    - Permits (site, pit, pit operation)
    - Safety certifications (OHS)
    """
    queryset = Candidate.objects.select_related('atr').all()
    serializer_class = CandidateSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'atr']
    search_fields = ['name', 'nrc', 'phone_number', 'position']
    ordering_fields = ['created_at', 'engaged_date']

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by workspace directly
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(workspace=self.request.workspace)
        return qs
    
    ordering = ['-created_at']

    def _save_documents(self, candidate):
        files = self.request.FILES.getlist('documents')
        for f in files:
            CandidateDocument.objects.create(candidate=candidate, document=f)

    def perform_create(self, serializer):
        # Assign workspace from request context
        if hasattr(self.request, 'workspace') and self.request.workspace:
            candidate = serializer.save(workspace=self.request.workspace)
        else:
            candidate = serializer.save()
        self._save_documents(candidate)

    def perform_update(self, serializer):
        candidate = serializer.save()
        self._save_documents(candidate)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Return summary statistics for recruitment dashboard."""
        total = Candidate.objects.count()
        pipeline = Candidate.objects.filter(status='Pipeline').count()
        onboarded = Candidate.objects.filter(status='Onboarded').count()
        rejected = Candidate.objects.filter(status='Rejected').count()
        
        return Response({
            'total_candidates': total,
            'in_pipeline': pipeline,
            'onboarded': onboarded,
            'rejected': rejected,
        })


class CandidateDocumentViewSet(viewsets.ModelViewSet):
    queryset = CandidateDocument.objects.select_related('candidate').all()
    serializer_class = CandidateDocumentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['candidate']
    ordering_fields = ['uploaded_at']
    ordering = ['-uploaded_at']

    def perform_create(self, serializer):
        serializer.save()
