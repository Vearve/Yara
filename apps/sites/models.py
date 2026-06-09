"""
Site Management Models
Tracks work sites, employee allocations per site, and site periods for labour reconciliation.
"""
from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError


class Site(models.Model):
    class Status(models.TextChoices):
        PLANNED = 'PLANNED', 'Planned'
        ACTIVE = 'ACTIVE', 'Active'
        CLOSED = 'CLOSED', 'Closed'

    workspace = models.ForeignKey(
        'core.Workspace', on_delete=models.CASCADE, related_name='work_sites'
    )
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    cost_centre = models.CharField(max_length=100, blank=True, help_text="Cost centre code for billing/payroll")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date', 'name']
        verbose_name = 'Site'
        verbose_name_plural = 'Sites'

    def __str__(self):
        return f"{self.name} ({self.workspace.name})"

    @property
    def active_employee_count(self):
        return self.employee_assignments.filter(is_active=True).count()

    @property
    def department_breakdown(self):
        from django.db.models import Count
        return (
            self.employee_assignments
            .filter(is_active=True)
            .values('employee__department__name')
            .annotate(count=Count('employee'))
            .order_by('-count')
        )


class SiteEmployee(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='employee_assignments')
    employee = models.ForeignKey('hcm.Employee', on_delete=models.CASCADE, related_name='site_assignments')
    role_on_site = models.CharField(max_length=200, blank=True, help_text="Role/position on this site")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True, help_text="Leave blank if still active on site")
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Site Employee'
        verbose_name_plural = 'Site Employees'

    def __str__(self):
        return f"{self.employee.full_name} @ {self.site.name}"

    def clean(self):
        # Enforce: one active site per employee at a time
        if self.is_active:
            conflict_qs = SiteEmployee.objects.filter(
                employee=self.employee,
                is_active=True,
            )
            if self.pk:
                conflict_qs = conflict_qs.exclude(pk=self.pk)
            if conflict_qs.exists():
                other = conflict_qs.first()
                raise ValidationError(
                    f"{self.employee.full_name} is already active on site '{other.site.name}'. "
                    "De-activate that assignment first."
                )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class SitePeriod(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        LOCKED = 'LOCKED', 'Locked'

    class PeriodType(models.TextChoices):
        WEEKLY = 'WEEKLY', 'Weekly'
        MONTHLY = 'MONTHLY', 'Monthly'
        CUSTOM = 'CUSTOM', 'Custom'

    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='periods')
    name = models.CharField(max_length=200, help_text='e.g. "June 2025" or "Week 23 — June 2025"')
    period_type = models.CharField(max_length=10, choices=PeriodType.choices, default=PeriodType.MONTHLY)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)
    notes = models.TextField(blank=True)
    locked_at = models.DateTimeField(null=True, blank=True)
    locked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='locked_site_periods'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Site Period'
        verbose_name_plural = 'Site Periods'

    def __str__(self):
        return f"{self.site.name} — {self.name}"

    def get_labour_recon(self):
        """
        Build the labour reconciliation data for this period.
        Returns a list of employee rows with leave/sick/absenteeism breakdowns.
        """
        from apps.leave.models import LeaveRequest, SickNote, Absenteeism
        from django.db.models import Q

        # Get all employees who were assigned to this site and active during the period
        assignments = SiteEmployee.objects.filter(
            site=self.site,
        ).filter(
            Q(start_date__lte=self.end_date) &
            (Q(end_date__isnull=True) | Q(end_date__gte=self.start_date))
        ).select_related('employee', 'employee__department')

        employee_ids = [a.employee_id for a in assignments]
        assignment_map = {a.employee_id: a for a in assignments}

        # Leaves in period
        leaves = LeaveRequest.objects.filter(
            employee_id__in=employee_ids,
            start_date__lte=self.end_date,
            end_date__gte=self.start_date,
        ).values('employee_id', 'leave_type', 'days', 'status', 'start_date', 'end_date')

        # Sick notes in period
        sick_notes = SickNote.objects.filter(
            employee_id__in=employee_ids,
            start_date__lte=self.end_date,
            end_date__gte=self.start_date,
        ).values('employee_id', 'days', 'status', 'start_date', 'end_date', 'diagnosis')

        # Absenteeism in period
        absences = Absenteeism.objects.filter(
            employee_id__in=employee_ids,
            date__gte=self.start_date,
            date__lte=self.end_date,
        ).values('employee_id', 'date', 'status')

        # Group by employee
        from collections import defaultdict
        leave_map = defaultdict(list)
        sick_map = defaultdict(list)
        absent_map = defaultdict(list)

        for l in leaves:
            leave_map[l['employee_id']].append(l)
        for s in sick_notes:
            sick_map[s['employee_id']].append(s)
        for a in absences:
            absent_map[a['employee_id']].append(a)

        period_days = (self.end_date - self.start_date).days + 1
        working_days = max(1, round(period_days * 26 / 30))  # approximate working days

        rows = []
        for emp_id in employee_ids:
            assignment = assignment_map[emp_id]
            emp = assignment.employee

            annual_days = sum(l['days'] for l in leave_map[emp_id] if l['leave_type'] == 'ANNUAL')
            sick_days = sum(l['days'] for l in leave_map[emp_id] if l['leave_type'] == 'SICK')
            casual_days = sum(l['days'] for l in leave_map[emp_id] if l['leave_type'] == 'CASUAL')
            unpaid_days = sum(l['days'] for l in leave_map[emp_id] if l['leave_type'] == 'UNPAID')
            sick_note_days = sum(s['days'] for s in sick_map[emp_id])
            absent_days = len(absent_map[emp_id])
            total_away = annual_days + sick_days + casual_days + unpaid_days + absent_days
            days_worked = max(0, working_days - total_away)

            rows.append({
                'employee_id': emp_id,
                'employee_name': emp.full_name,
                'employee_number': getattr(emp, 'employee_number', ''),
                'department': emp.department.name if emp.department else '',
                'role_on_site': assignment.role_on_site,
                'working_days': working_days,
                'days_worked': days_worked,
                'annual_leave_days': annual_days,
                'sick_leave_days': sick_days,
                'casual_leave_days': casual_days,
                'unpaid_leave_days': unpaid_days,
                'sick_note_days': sick_note_days,
                'absent_days': absent_days,
                'leaves': list(leave_map[emp_id]),
                'sick_notes': list(sick_map[emp_id]),
                'absences': list(absent_map[emp_id]),
            })

        rows.sort(key=lambda r: (r['department'], r['employee_name']))
        return rows
