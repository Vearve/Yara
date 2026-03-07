from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Avg, Max
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import datetime, timedelta
from .models import KPI
from .serializers import KPISerializer
from apps.hcm.models import Employee, Termination, Engagement
from apps.tracking.models import Training
from apps.recruitment.models import Candidate

class KPIViewSet(viewsets.ModelViewSet):
    """Analytics and KPI endpoint"""
    queryset = KPI.objects.all()
    serializer_class = KPISerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get analytics summary with all KPIs"""
        today = timezone.now().date()
        year_ago = today - timedelta(days=365)
        
        # Apply workspace filtering
        terminations_qs = Termination.objects.all()
        employees_qs = Employee.objects.all()
        trainings_qs = Training.objects.all()
        candidates_qs = Candidate.objects.all()
        
        if hasattr(request, 'workspace') and request.workspace:
            terminations_qs = terminations_qs.filter(employee__workspace=request.workspace)
            employees_qs = employees_qs.filter(workspace=request.workspace)
            trainings_qs = trainings_qs.filter(employee__workspace=request.workspace)
            candidates_qs = candidates_qs.filter(
                Q(workspace=request.workspace)
                | Q(workspace__isnull=True, atr__department__workspace=request.workspace)
            )
        
        # Turnover Rate: Terminated employees / Total employees * 100
        terminations = terminations_qs.filter(
            termination_date__gte=year_ago,
            termination_date__lte=today
        ).count()
        total_employees = employees_qs.filter(employment_status='ACTIVE').count()
        turnover_rate = (terminations / max(total_employees, 1)) * 100
        
        # Overtime Rate: Not tracked in Employee model, default to 0
        avg_overtime = 0
        
        # Training ROI: Use completed trainings count (no participant table)
        completed_trainings = trainings_qs.filter(
            completion_date__gte=year_ago,
            completion_date__lte=today,
            status='COMPLETED'
        ).count()
        training_roi = completed_trainings * 5000
        
        # Offer Acceptance Rate: Onboarded candidates / Total candidates * 100
        total_candidates = candidates_qs.count()
        onboarded = candidates_qs.filter(status='Onboarded').count()
        offer_acceptance = (onboarded / max(total_candidates, 1)) * 100 if total_candidates > 0 else 0
        
        return Response({
            'turnover_rate': round(turnover_rate, 1),
            'overtime_rate': round(avg_overtime, 1),
            'training_roi': int(training_roi),
            'offer_acceptance': round(offer_acceptance, 1),
            'total_employees': total_employees,
            'active_trainings': Training.objects.filter(
                scheduled_date__lte=today,
                status__in=['SCHEDULED', 'IN_PROGRESS']
            ).count(),
            'pending_applicants': Candidate.objects.filter(
                status='Pipeline'
            ).count(),
        })

    @action(detail=False, methods=['get'])
    def turnover(self, request):
        """Monthly turnover trend"""
        today = timezone.now().date()
        year_ago = today - timedelta(days=365)
        
        terminations = Termination.objects.filter(
            termination_date__gte=year_ago,
            termination_date__lte=today
        ).values('termination_date').annotate(count=Count('id'))
        
        return Response(terminations)

    @action(detail=False, methods=['get'])
    def turnover_details(self, request):
        """Return engagement/termination counts and turnover rate with optional filters."""
        today = timezone.now().date()
        year_ago = today - timedelta(days=365)
        
        # Extract filter params
        dept_id = request.query_params.get('department')
        search = request.query_params.get('search', '').strip()
        date_from_raw = request.query_params.get('date_from')
        date_to_raw = request.query_params.get('date_to')
        
        date_from = None
        date_to = None
        try:
            if date_from_raw:
                date_from = datetime.strptime(date_from_raw, '%Y-%m-%d').date()
            if date_to_raw:
                date_to = datetime.strptime(date_to_raw, '%Y-%m-%d').date()
        except ValueError:
            date_from = None
            date_to = None
        
        # Base queryset for employees to filter engagements/terminations by
        employees_qs = Employee.objects.all()
        if hasattr(request, 'workspace') and request.workspace:
            employees_qs = employees_qs.filter(workspace=request.workspace)
        if dept_id:
            employees_qs = employees_qs.filter(department_id=dept_id)
        if search:
            employees_qs = employees_qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(employee_id__icontains=search)
                | Q(email__icontains=search)
            )
        
        # Determine date range for queries
        period_start = date_from if date_from else year_ago
        period_end = date_to if date_to else today
        
        # Engagements
        eng_qs = Engagement.objects.filter(engagement_date__gte=period_start, engagement_date__lte=period_end)
        if hasattr(request, 'workspace') and request.workspace:
            eng_qs = eng_qs.filter(employee__workspace=request.workspace)
        if dept_id or search or (date_from and date_to):
            eng_qs = eng_qs.filter(employee__in=employees_qs)
        engagements = eng_qs.count()
        
        # Terminations
        term_qs = Termination.objects.filter(termination_date__gte=period_start, termination_date__lte=period_end)
        if hasattr(request, 'workspace') and request.workspace:
            term_qs = term_qs.filter(employee__workspace=request.workspace)
        if dept_id or search or (date_from and date_to):
            term_qs = term_qs.filter(employee__in=employees_qs)
        terminations = term_qs.count()
        
        # Active employees (always current active count, not filtered by date range)
        active_qs = Employee.objects.filter(employment_status='ACTIVE')
        if hasattr(request, 'workspace') and request.workspace:
            active_qs = active_qs.filter(workspace=request.workspace)
        if dept_id:
            active_qs = active_qs.filter(department_id=dept_id)
        if search:
            active_qs = active_qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(employee_id__icontains=search)
                | Q(email__icontains=search)
            )
        active = active_qs.count()
        
        turnover_rate = (terminations / max(active, 1)) * 100

        return Response({
            'engagements': engagements,
            'terminations': terminations,
            'active_employees': active,
            'turnover_rate': round(turnover_rate, 2),
            'period_start': period_start,
            'period_end': period_end,
        })

    @action(detail=False, methods=['get'])
    def training_roi(self, request):
        """Training ROI calculation"""
        trainings_qs = Training.objects.all()
        if hasattr(request, 'workspace') and request.workspace:
            trainings_qs = trainings_qs.filter(employee__workspace=request.workspace)
        
        trainings = trainings_qs.filter(
            scheduled_date__gte=timezone.now() - timedelta(days=365)
        ).values('training_type').annotate(
            sessions=Count('id'),
            estimated_value=Count('id') * 5000  # Base value per training session
        )
        return Response(trainings)

    @action(detail=False, methods=['get'])
    def recruitment_funnel(self, request):
        """Recruitment funnel analytics"""
        candidates_qs = Candidate.objects.all()
        if hasattr(request, 'workspace') and request.workspace:
            candidates_qs = candidates_qs.filter(
                Q(workspace=request.workspace)
                | Q(workspace__isnull=True, atr__department__workspace=request.workspace)
            )
        
        # Use actual Candidate statuses
        pipeline = candidates_qs.filter(status='Pipeline').count()
        onboarded = candidates_qs.filter(status='Onboarded').count()
        rejected = candidates_qs.filter(status='Rejected').count()
        
        funnel = [
            {'stage': 'Pipeline', 'count': pipeline},
            {'stage': 'Onboarded', 'count': onboarded},
            {'stage': 'Rejected', 'count': rejected},
        ]
        
        return Response(funnel)

    @action(detail=False, methods=['get'])
    def turnover_monthly(self, request):
        """Monthly engagements vs terminations for charting (last 12 months)."""
        today = timezone.now().date()
        year_ago = today - timedelta(days=365)

        terminations_qs = Termination.objects.all()
        engagements_qs = Engagement.objects.all()
        
        if hasattr(request, 'workspace') and request.workspace:
            terminations_qs = terminations_qs.filter(employee__workspace=request.workspace)
            engagements_qs = engagements_qs.filter(employee__workspace=request.workspace)

        terminations = (
            terminations_qs
            .filter(termination_date__gte=year_ago, termination_date__lte=today)
            .annotate(month=TruncMonth('termination_date'))
            .values('month')
            .annotate(total=Count('id'))
        )

        engagements = (
            engagements_qs
            .filter(engagement_date__gte=year_ago, engagement_date__lte=today)
            .annotate(month=TruncMonth('engagement_date'))
            .values('month')
            .annotate(total=Count('id'))
        )

        # merge months
        month_map = {}
        for row in terminations:
            key = row['month'].strftime('%Y-%m') if row['month'] else 'unknown'
            month_map[key] = {'month': key, 'terminations': row['total'], 'engagements': 0}
        for row in engagements:
            key = row['month'].strftime('%Y-%m') if row['month'] else 'unknown'
            if key not in month_map:
                month_map[key] = {'month': key, 'terminations': 0, 'engagements': row['total']}
            else:
                month_map[key]['engagements'] = row['total']

        # sort chronologically
        data = sorted(month_map.values(), key=lambda x: x['month'])
        return Response(data)

    @action(detail=False, methods=['get'])
    def department_distribution(self, request):
        """Employee distribution by department"""
        from apps.hcm.models import Department
        
        dept_qs = Department.objects.all()
        
        if hasattr(request, 'workspace') and request.workspace:
            # Filter departments that have employees in this workspace
            dept_qs = dept_qs.filter(employee__workspace=request.workspace).distinct()
        
        departments = dept_qs.annotate(
            employee_count=Count('employee', filter=Q(employee__workspace=request.workspace) if hasattr(request, 'workspace') and request.workspace else Q())
        ).values('name', 'employee_count')
        
        return Response(departments)

    @action(detail=False, methods=['get'])
    def employee_trend(self, request):
        """Monthly employee status trend"""
        from apps.leave.models import LeaveRequest, SickNote, Absenteeism

        today = timezone.now().date()

        employees_qs = Employee.objects.all()
        terminations_qs = Termination.objects.all()
        leaves_qs = LeaveRequest.objects.all()
        sick_notes_qs = SickNote.objects.all()
        absenteeism_qs = Absenteeism.objects.all()

        if hasattr(request, 'workspace') and request.workspace:
            employees_qs = employees_qs.filter(workspace=request.workspace)
            terminations_qs = terminations_qs.filter(employee__workspace=request.workspace)
            leaves_qs = leaves_qs.filter(employee__workspace=request.workspace)
            sick_notes_qs = sick_notes_qs.filter(employee__workspace=request.workspace)
            absenteeism_qs = absenteeism_qs.filter(employee__workspace=request.workspace)

        def add_months(dt, months):
            year = dt.year + (dt.month - 1 + months) // 12
            month = (dt.month - 1 + months) % 12 + 1
            return dt.replace(year=year, month=month, day=1)

        employees = list(
            employees_qs.filter(hire_date__lte=today).values('id', 'hire_date', 'employment_status')
        )
        termination_dates = {
            row['employee_id']: row['last_termination']
            for row in terminations_qs.values('employee_id').annotate(last_termination=Max('termination_date'))
        }

        start_month = add_months(today.replace(day=1), -11)
        data = []

        for i in range(12):
            month_dt = add_months(start_month, i)
            key = month_dt.strftime('%b %Y')
            next_month = (month_dt.replace(day=28) + timedelta(days=4)).replace(day=1)
            month_end = next_month - timedelta(days=1)

            employed_ids = set()
            for emp in employees:
                if emp['hire_date'] and emp['hire_date'] > month_end:
                    continue
                term_date = termination_dates.get(emp['id'])
                if term_date and term_date <= month_end:
                    continue
                if emp.get('employment_status') == 'TERMINATED' and not term_date:
                    continue
                employed_ids.add(emp['id'])

            leave_ids = set(
                leaves_qs.filter(
                    start_date__lte=month_end,
                    end_date__gte=month_dt,
                    status='APPROVED',
                ).values_list('employee_id', flat=True)
            )
            sick_ids = set(
                sick_notes_qs.filter(
                    start_date__lte=month_end,
                    end_date__gte=month_dt,
                    status='APPROVED',
                ).values_list('employee_id', flat=True)
            )
            absent_ids = set(
                absenteeism_qs.filter(
                    date__gte=month_dt,
                    date__lte=month_end,
                ).values_list('employee_id', flat=True)
            )

            inactive_ids = (leave_ids | sick_ids | absent_ids) & employed_ids
            on_leave_ids = leave_ids & employed_ids
            active_count = max(0, len(employed_ids) - len(inactive_ids))

            data.append({
                'month': key,
                'active': active_count,
                'inactive': len(inactive_ids),
                'on_leave': len(on_leave_ids),
            })

        return Response(data)
    @action(detail=False, methods=['get'])
    def monthly_performance_summary(self, request):
        """Complete monthly performance summary for analytics dashboard"""
        from apps.leave.models import LeaveRequest, SickNote, Absenteeism
        from apps.recruitment.models import Candidate
        
        today = timezone.now().date()
        year_ago = today - timedelta(days=365)

        # Apply workspace scoping when available
        employees_qs = Employee.objects.all()
        engagements_qs = Engagement.objects.all()
        terminations_qs = Termination.objects.all()
        leaves_qs = LeaveRequest.objects.all()
        sick_notes_qs = SickNote.objects.all()
        absenteeism_qs = Absenteeism.objects.all()
        trainings_qs = Training.objects.all()
        candidates_qs = Candidate.objects.all()

        if hasattr(request, 'workspace') and request.workspace:
            employees_qs = employees_qs.filter(workspace=request.workspace)
            engagements_qs = engagements_qs.filter(employee__workspace=request.workspace)
            terminations_qs = terminations_qs.filter(employee__workspace=request.workspace)
            leaves_qs = leaves_qs.filter(employee__workspace=request.workspace)
            sick_notes_qs = sick_notes_qs.filter(employee__workspace=request.workspace)
            absenteeism_qs = absenteeism_qs.filter(employee__workspace=request.workspace)
            trainings_qs = trainings_qs.filter(employee__workspace=request.workspace)
            candidates_qs = candidates_qs.filter(
                Q(workspace=request.workspace)
                | Q(workspace__isnull=True, atr__department__workspace=request.workspace)
            )

        # Monthly aggregations
        engagements_by_month = (
            engagements_qs
            .filter(engagement_date__gte=year_ago, engagement_date__lte=today)
            .annotate(month=TruncMonth('engagement_date'))
            .values('month')
            .annotate(total=Count('id'))
        )

        terminations_by_month = (
            terminations_qs
            .filter(termination_date__gte=year_ago, termination_date__lte=today)
            .annotate(month=TruncMonth('termination_date'))
            .values('month')
            .annotate(total=Count('id'))
        )

        leaves_by_month = (
            leaves_qs
            .filter(start_date__gte=year_ago, start_date__lte=today)
            .annotate(month=TruncMonth('start_date'))
            .values('month')
            .annotate(total=Count('id'))
        )

        sick_notes_by_month = (
            sick_notes_qs
            .filter(start_date__gte=year_ago, start_date__lte=today)
            .annotate(month=TruncMonth('start_date'))
            .values('month')
            .annotate(total=Count('id'))
        )

        absenteeism_by_month = (
            absenteeism_qs
            .filter(date__gte=year_ago, date__lte=today)
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total=Count('id'))
        )

        trainings_by_month = (
            trainings_qs
            .filter(completion_date__gte=year_ago, completion_date__lte=today, status='COMPLETED')
            .annotate(month=TruncMonth('completion_date'))
            .values('month')
            .annotate(total=Count('id'))
        )

        def add_months(dt, months):
            year = dt.year + (dt.month - 1 + months) // 12
            month = (dt.month - 1 + months) % 12 + 1
            return dt.replace(year=year, month=month, day=1)

        # Build month map for the last 12 months (including current)
        month_map = {}
        month_order = []
        start_month = add_months(today.replace(day=1), -11)
        for i in range(12):
            month_dt = add_months(start_month, i)
            key = month_dt.strftime('%b %Y')
            month_order.append(key)
            month_map[key] = {
                'month': key,
                'engagements': 0,
                'terminations': 0,
                'leaves': 0,
                'sickNotes': 0,
                'absenteeism': 0,
                'completed': 0,
                'offers': 0,
                'active': 0,
            }
        
        for row in engagements_by_month:
            if row['month']:
                key = row['month'].strftime('%b %Y')
                if key in month_map:
                    month_map[key]['engagements'] = row['total']
        
        for row in terminations_by_month:
            if row['month']:
                key = row['month'].strftime('%b %Y')
                if key in month_map:
                    month_map[key]['terminations'] = row['total']
        
        for row in leaves_by_month:
            if row['month']:
                key = row['month'].strftime('%b %Y')
                if key in month_map:
                    month_map[key]['leaves'] = row['total']
        
        for row in sick_notes_by_month:
            if row['month']:
                key = row['month'].strftime('%b %Y')
                if key in month_map:
                    month_map[key]['sickNotes'] = row['total']
        
        for row in absenteeism_by_month:
            if row['month']:
                key = row['month'].strftime('%b %Y')
                if key in month_map:
                    month_map[key]['absenteeism'] = row['total']
        
        for row in trainings_by_month:
            if row['month']:
                key = row['month'].strftime('%b %Y')
                if key in month_map:
                    month_map[key]['completed'] = row['total']

        # Add active employee count per month based on hire date and termination date
        employees = list(
            employees_qs.filter(hire_date__lte=today).values('id', 'hire_date', 'employment_status')
        )
        termination_dates = {
            row['employee_id']: row['last_termination']
            for row in terminations_qs.values('employee_id').annotate(last_termination=Max('termination_date'))
        }

        for key in month_map:
            try:
                month_dt = datetime.strptime(key, '%b %Y').date()
            except Exception:
                month_map[key]['active'] = 0
                continue

            # Month end date
            next_month = (month_dt.replace(day=28) + timedelta(days=4)).replace(day=1)
            month_end = next_month - timedelta(days=1)

            active_count = 0
            for emp in employees:
                if emp['hire_date'] and emp['hire_date'] > month_end:
                    continue
                term_date = termination_dates.get(emp['id'])
                if term_date and term_date <= month_end:
                    continue
                if emp.get('employment_status') == 'TERMINATED' and not term_date:
                    continue
                active_count += 1
            month_map[key]['active'] = active_count

        # Add offers accepted (hired candidates)
        hired_by_month = (
            candidates_qs
            .filter(created_at__gte=year_ago, created_at__lte=today, status='Onboarded')
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(total=Count('id'))
        )
        
        for row in hired_by_month:
            if row['month']:
                key = row['month'].strftime('%b %Y')
                if key in month_map:
                    month_map[key]['offers'] = row['total']

        # Sort chronologically and return
        data = [month_map[key] for key in month_order]
        return Response(data)