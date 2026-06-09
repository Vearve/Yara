"""
Attendance Models
Tracks employee shifts, clock-in/out events, and daily attendance status.
"""

from django.db import models
from django.utils import timezone
from apps.hcm.models import Employee
from apps.core.models import Workspace


class Shift(models.Model):
    """Named work shift definition per workspace."""
    SHIFT_TYPES = [
        ('DAY', 'Day Shift'),
        ('AFTERNOON', 'Afternoon Shift'),
        ('NIGHT', 'Night Shift'),
    ]

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='shifts')
    name = models.CharField(max_length=100)
    shift_type = models.CharField(max_length=20, choices=SHIFT_TYPES, default='DAY')
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['workspace', 'name']]
        ordering = ['shift_type', 'start_time']

    def __str__(self):
        return f"{self.name} ({self.start_time}–{self.end_time})"


class AttendanceRecord(models.Model):
    """Daily attendance entry for an employee."""
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('HALF_DAY', 'Half Day'),
        ('ON_LEAVE', 'On Leave'),
        ('HOLIDAY', 'Holiday'),
        ('WEEKEND', 'Weekend'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    shift = models.ForeignKey(Shift, on_delete=models.SET_NULL, null=True, blank=True, related_name='attendance_records')
    date = models.DateField(db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PRESENT')

    # Clock times (set by ClockEvent signals or manual entry)
    clock_in = models.TimeField(null=True, blank=True)
    clock_out = models.TimeField(null=True, blank=True)

    # Derived
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_late = models.BooleanField(default=False)
    late_minutes = models.PositiveIntegerField(default=0)

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['employee', 'date']]
        ordering = ['-date', 'employee__employee_id']
        indexes = [
            models.Index(fields=['date', 'status']),
            models.Index(fields=['employee', 'date']),
        ]

    def __str__(self):
        return f"{self.employee.full_name} — {self.date} ({self.status})"

    def compute_hours(self):
        """Calculate hours_worked and is_late from clock_in/clock_out."""
        if self.clock_in and self.clock_out:
            from datetime import datetime, date
            base = date.today()
            dt_in = datetime.combine(base, self.clock_in)
            dt_out = datetime.combine(base, self.clock_out)
            if dt_out < dt_in:
                from datetime import timedelta
                dt_out += timedelta(days=1)
            delta = dt_out - dt_in
            self.hours_worked = round(delta.seconds / 3600, 2)

        if self.shift and self.clock_in:
            from datetime import datetime, date, timedelta
            base = date.today()
            expected = datetime.combine(base, self.shift.start_time)
            actual = datetime.combine(base, self.clock_in)
            diff = (actual - expected).total_seconds() / 60
            if diff > 0:
                self.is_late = True
                self.late_minutes = int(diff)
            else:
                self.is_late = False
                self.late_minutes = 0


class ClockEvent(models.Model):
    """Raw clock-in or clock-out event — source of truth for attendance."""
    EVENT_TYPES = [
        ('IN', 'Clock In'),
        ('OUT', 'Clock Out'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='clock_events')
    event_type = models.CharField(max_length=3, choices=EVENT_TYPES)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    location = models.CharField(max_length=200, blank=True, help_text="Gate, site, or GPS coordinates")
    device_id = models.CharField(max_length=100, blank=True, help_text="Badge reader or mobile device ID")
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [models.Index(fields=['employee', 'timestamp'])]

    def __str__(self):
        return f"{self.employee.full_name} {self.event_type} @ {self.timestamp:%Y-%m-%d %H:%M}"
