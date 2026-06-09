"""
Site Management ViewSets
"""
import csv
from io import StringIO

from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Site, SiteEmployee, SitePeriod
from .serializers import SiteSerializer, SiteEmployeeSerializer, SitePeriodSerializer


class SiteViewSet(viewsets.ModelViewSet):
    serializer_class = SiteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['workspace', 'status']
    search_fields = ['name', 'location', 'cost_centre']
    ordering = ['-start_date', 'name']

    def get_queryset(self):
        qs = Site.objects.select_related('workspace')
        workspace_id = self.request.query_params.get('workspace')
        if workspace_id:
            qs = qs.filter(workspace_id=workspace_id)
        elif hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(workspace=self.request.workspace)
        return qs

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        site = self.get_object()
        breakdown = list(site.department_breakdown)
        return Response({
            'site_id': site.id,
            'site_name': site.name,
            'active_employee_count': site.active_employee_count,
            'department_breakdown': [
                {
                    'department': b['employee__department__name'] or 'Unassigned',
                    'count': b['count'],
                }
                for b in breakdown
            ],
        })


class SiteEmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = SiteEmployeeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['site', 'is_active']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_number', 'role_on_site']

    def get_queryset(self):
        return SiteEmployee.objects.select_related(
            'employee', 'employee__department', 'site'
        ).filter(site__workspace_id=self._workspace_id())

    def _workspace_id(self):
        wid = self.request.query_params.get('workspace')
        if wid:
            return wid
        if hasattr(self.request, 'workspace') and self.request.workspace:
            return self.request.workspace.id
        return None

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        assignment = self.get_object()
        assignment.is_active = False
        if not assignment.end_date:
            from datetime import date
            assignment.end_date = date.today()
        assignment.save()
        return Response(SiteEmployeeSerializer(assignment).data)


class SitePeriodViewSet(viewsets.ModelViewSet):
    serializer_class = SitePeriodSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['site', 'status', 'period_type']
    ordering = ['-start_date']

    def get_queryset(self):
        return SitePeriod.objects.select_related('site', 'locked_by').filter(
            site__workspace_id=self._workspace_id()
        )

    def _workspace_id(self):
        wid = self.request.query_params.get('workspace')
        if wid:
            return wid
        if hasattr(self.request, 'workspace') and self.request.workspace:
            return self.request.workspace.id
        return None

    @action(detail=True, methods=['post'])
    def lock(self, request, pk=None):
        period = self.get_object()
        if period.status == SitePeriod.Status.LOCKED:
            return Response({'error': 'Period is already locked.'}, status=status.HTTP_400_BAD_REQUEST)
        period.status = SitePeriod.Status.LOCKED
        period.locked_at = timezone.now()
        period.locked_by = request.user
        period.save()
        return Response(SitePeriodSerializer(period).data)

    @action(detail=True, methods=['post'])
    def unlock(self, request, pk=None):
        period = self.get_object()
        period.status = SitePeriod.Status.OPEN
        period.locked_at = None
        period.locked_by = None
        period.save()
        return Response(SitePeriodSerializer(period).data)

    @action(detail=True, methods=['get'])
    def labour_recon(self, request, pk=None):
        period = self.get_object()
        rows = period.get_labour_recon()
        # Strip the detailed sub-lists for the summary response
        summary_rows = [
            {k: v for k, v in row.items() if k not in ('leaves', 'sick_notes', 'absences')}
            for row in rows
        ]
        return Response({
            'period': SitePeriodSerializer(period).data,
            'rows': summary_rows,
            'totals': {
                'employees': len(rows),
                'working_days': rows[0]['working_days'] if rows else 0,
                'total_annual_leave': sum(r['annual_leave_days'] for r in rows),
                'total_sick_leave': sum(r['sick_leave_days'] for r in rows),
                'total_casual_leave': sum(r['casual_leave_days'] for r in rows),
                'total_unpaid_leave': sum(r['unpaid_leave_days'] for r in rows),
                'total_sick_notes': sum(r['sick_note_days'] for r in rows),
                'total_absent': sum(r['absent_days'] for r in rows),
            }
        })

    @action(detail=True, methods=['get'])
    def export_csv(self, request, pk=None):
        period = self.get_object()
        rows = period.get_labour_recon()

        output = StringIO()
        writer = csv.writer(output)
        writer.writerow([
            'Employee #', 'Name', 'Department', 'Role on Site',
            'Working Days', 'Days Worked',
            'Annual Leave', 'Sick Leave', 'Casual Leave', 'Unpaid Leave',
            'Sick Note Days', 'Absent Days',
        ])
        for row in rows:
            writer.writerow([
                row['employee_number'],
                row['employee_name'],
                row['department'],
                row['role_on_site'],
                row['working_days'],
                row['days_worked'],
                row['annual_leave_days'],
                row['sick_leave_days'],
                row['casual_leave_days'],
                row['unpaid_leave_days'],
                row['sick_note_days'],
                row['absent_days'],
            ])

        filename = f"labour_recon_{period.site.name.replace(' ', '_')}_{period.name.replace(' ', '_')}.csv"
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
