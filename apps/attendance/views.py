from __future__ import annotations

from typing import TYPE_CHECKING

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Shift, AttendanceRecord, ClockEvent
from .serializers import ShiftSerializer, AttendanceRecordSerializer, ClockEventSerializer

if TYPE_CHECKING:
    from apps.core.types import WorkspaceRequest


class ShiftViewSet(viewsets.ModelViewSet):
    if TYPE_CHECKING:
        request: WorkspaceRequest

    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['shift_type', 'is_active']
    search_fields = ['name']
    ordering_fields = ['name', 'start_time']
    ordering = ['shift_type', 'start_time']

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(workspace=self.request.workspace)
        return qs

    def perform_create(self, serializer):
        if hasattr(self.request, 'workspace') and self.request.workspace:
            serializer.save(workspace=self.request.workspace)
        else:
            serializer.save()


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    if TYPE_CHECKING:
        request: WorkspaceRequest

    queryset = AttendanceRecord.objects.select_related('employee', 'shift').all()
    serializer_class = AttendanceRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'date', 'status', 'shift']
    ordering_fields = ['date', 'employee__employee_id']
    ordering = ['-date']

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(employee__workspace=self.request.workspace)

        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Return today's attendance records for the workspace."""
        today = timezone.now().date()
        qs = self.get_queryset().filter(date=today)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Return attendance counts for today."""
        from django.db.models import Count, Q
        today = timezone.now().date()
        qs = self.get_queryset().filter(date=today)
        counts = qs.aggregate(
            present=Count('id', filter=Q(status='PRESENT')),
            absent=Count('id', filter=Q(status='ABSENT')),
            half_day=Count('id', filter=Q(status='HALF_DAY')),
            on_leave=Count('id', filter=Q(status='ON_LEAVE')),
            late=Count('id', filter=Q(is_late=True)),
        )
        return Response({'date': today, **counts})


class ClockEventViewSet(viewsets.ModelViewSet):
    if TYPE_CHECKING:
        request: WorkspaceRequest

    queryset = ClockEvent.objects.select_related('employee').all()
    serializer_class = ClockEventSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'event_type']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(employee__workspace=self.request.workspace)
        return qs

    def perform_create(self, serializer):
        event = serializer.save()
        self._sync_attendance_record(event)

    def _sync_attendance_record(self, event: ClockEvent):
        """Update or create today's AttendanceRecord when a clock event arrives."""
        record_date = event.timestamp.date()
        record, _ = AttendanceRecord.objects.get_or_create(
            employee=event.employee,
            date=record_date,
            defaults={'status': 'PRESENT'},
        )
        if event.event_type == 'IN':
            record.clock_in = event.timestamp.time()
            record.status = 'PRESENT'
        elif event.event_type == 'OUT':
            record.clock_out = event.timestamp.time()
        record.compute_hours()
        record.save()
