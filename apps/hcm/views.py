"""
HCM API ViewSets
Handles CRUD operations for employees, contracts, departments, etc.
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Sum, Q
from django.utils import timezone
from django.http import HttpResponse
from datetime import datetime, timedelta
import pandas as pd
import csv
from io import BytesIO, StringIO
from .models import (
    Employee, Contract, Engagement, Termination, Department, Job,
    ContractType, TerminationReason, EmploymentType, EmployeeCategory, EmployeeDocument
)
from apps.core.models import WorkspaceMembership
from .serializers import (
    EmployeeListSerializer, EmployeeDetailSerializer,
    ContractSerializer, EngagementSerializer, TerminationSerializer,
    DepartmentSerializer, JobSerializer, ContractTypeSerializer, TerminationReasonSerializer,
    EmploymentTypeSerializer, EmployeeCategorySerializer, EmployeeDocumentSerializer
)


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Employee CRUD operations.
    List view uses EmployeeListSerializer, detail uses EmployeeDetailSerializer.
    """
    queryset = Employee.objects.all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'employment_status', 'gender', 'category']
    search_fields = ['first_name', 'last_name', 'nrc', 'employee_id', 'email']
    ordering_fields = ['created_at', 'first_name', 'last_name', 'hire_date']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by workspace context when available
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(workspace=self.request.workspace)
        
        # Handle full name search
        search_param = self.request.query_params.get('search', '').strip()
        if search_param:
            from django.db.models import Q, Value, CharField
            from django.db.models.functions import Concat
            # Search for full name pattern "First Last"
            name_parts = search_param.split()
            if len(name_parts) >= 2:
                # Try to match "FirstName LastName" pattern
                first_name_query = name_parts[0]
                last_name_query = ' '.join(name_parts[1:])
                qs = qs.filter(
                    Q(first_name__icontains=first_name_query, last_name__icontains=last_name_query) |
                    Q(first_name__icontains=search_param) |
                    Q(last_name__icontains=search_param) |
                    Q(employee_id__icontains=search_param) |
                    Q(email__icontains=search_param) |
                    Q(nrc__icontains=search_param)
                )
            # If only one word, let the default search filter handle it
        
        return qs

    def _resolve_workspace(self, request):
        if hasattr(request, 'workspace') and request.workspace:
            return request.workspace
        if request.user and request.user.is_authenticated:
            membership = WorkspaceMembership.objects.filter(
                user=request.user,
                is_active=True,
                is_default=True
            ).select_related('workspace').first()
            if not membership:
                membership = WorkspaceMembership.objects.filter(
                    user=request.user,
                    is_active=True
                ).select_related('workspace').first()
            if membership:
                return membership.workspace
        return None

    def perform_create(self, serializer):
        # Auto-assign workspace on create; require a workspace to prevent orphan employees
        workspace = self._resolve_workspace(self.request)
        if not workspace:
            raise ValidationError({'workspace': 'Workspace is required for employee creation.'})
        serializer.save(workspace=workspace, created_by=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        return EmployeeDetailSerializer

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Return live counts for dashboard cards and current situations."""
        # DEBUG: Log workspace context
        import sys
        print(f"[SUMMARY] workspace_id from request: {getattr(request, 'workspace_id', 'NOT SET')}", file=sys.stderr)
        print(f"[SUMMARY] workspace object: {getattr(request, 'workspace', 'NOT SET')}", file=sys.stderr)
        
        today = timezone.now().date()
        in_30 = today + timedelta(days=30)
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

        employees_qs = Employee.objects.all()
        if hasattr(request, 'workspace') and request.workspace:
            employees_qs = employees_qs.filter(workspace=request.workspace)
            print(f"[SUMMARY] Filtered by workspace {request.workspace.id}: {employees_qs.count()} employees", file=sys.stderr)
        else:
            print(f"[SUMMARY] NO WORKSPACE FILTER - returning all {employees_qs.count()} employees", file=sys.stderr)
        if dept_id:
            employees_qs = employees_qs.filter(department_id=dept_id)
        if search:
            employees_qs = employees_qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(employee_id__icontains=search)
                | Q(email__icontains=search)
            )
        if date_from and date_to:
            employees_qs = employees_qs.filter(hire_date__gte=date_from, hire_date__lte=date_to)

        # Employee status counts (Total = active headcount)
        active_qs = employees_qs.filter(employment_status='ACTIVE')
        total = active_qs.count()
        active = total
        
        # Calculate absenteeism: employees currently on approved leave (today falls within leave period)
        try:
            from apps.leave.models import LeaveRequest
            current_leave_qs = LeaveRequest.objects.filter(
                status='APPROVED',
                start_date__lte=today,
                end_date__gte=today
            )
            if hasattr(request, 'workspace') and request.workspace:
                current_leave_qs = current_leave_qs.filter(employee__workspace=request.workspace)
            if dept_id or search or (date_from and date_to):
                current_leave_qs = current_leave_qs.filter(employee__in=employees_qs)
            
            # Count unique employees currently on leave
            on_leave = current_leave_qs.values('employee').distinct().count()
        except Exception:
            # Fallback to employment status if leave app not available
            on_leave = employees_qs.filter(employment_status='ON_LEAVE').count()
        
        suspended = employees_qs.filter(employment_status='SUSPENDED').count()
        terminated = employees_qs.filter(employment_status='TERMINATED').count()

        # Contracts expiring in next 30 days
        contracts_qs = Contract.objects.filter(status='ACTIVE', end_date__isnull=False)
        if hasattr(request, 'workspace') and request.workspace:
            contracts_qs = contracts_qs.filter(employee__workspace=request.workspace)
        if dept_id or search or (date_from and date_to):
            contracts_qs = contracts_qs.filter(employee__in=active_qs)
        else:
            contracts_qs = contracts_qs.filter(employee__in=active_qs)
        if date_from and date_to:
            contracts_qs = contracts_qs.filter(end_date__gte=date_from, end_date__lte=date_to)
        else:
            contracts_qs = contracts_qs.filter(end_date__gte=today, end_date__lte=in_30)
        expiring_30d = contracts_qs.count()

        # Cross-app: sick notes active today
        try:
            from apps.leave.models import SickNote
            sick_qs = SickNote.objects.filter(
                start_date__lte=today,
                end_date__gte=today
            )
            if hasattr(request, 'workspace') and request.workspace:
                sick_qs = sick_qs.filter(employee__workspace=request.workspace)
            if dept_id or search or (date_from and date_to):
                sick_qs = sick_qs.filter(employee__in=employees_qs)
            sick_pending = sick_qs.filter(status='PENDING').count()
            sick_total = sick_qs.count()
        except Exception:
            sick_pending = 0
            sick_total = 0

        try:
            from apps.leave.models import LeaveRequest
            # Count leave requests active today
            leave_qs = LeaveRequest.objects.filter(
                status='APPROVED',
                start_date__lte=today,
                end_date__gte=today
            )
            if hasattr(request, 'workspace') and request.workspace:
                leave_qs = leave_qs.filter(employee__workspace=request.workspace)
            if dept_id or search or (date_from and date_to):
                leave_qs = leave_qs.filter(employee__in=employees_qs)
            leave_total = leave_qs.count()
            leave_days = leave_qs.aggregate(total=Sum('days')).get('total') or 0
        except Exception:
            leave_days = 0
            leave_total = 0

        try:
            from apps.activities.models import Hearing, Investigation
            hearings_qs = Hearing.objects.exclude(status='CONCLUDED')
            investigations_qs = Investigation.objects.exclude(status__in=['COMPLETED', 'CLOSED'])
            if hasattr(request, 'workspace') and request.workspace:
                hearings_qs = hearings_qs.filter(related_employee__workspace=request.workspace)
                investigations_qs = investigations_qs.filter(related_employee__workspace=request.workspace)
            if dept_id or search or (date_from and date_to):
                hearings_qs = hearings_qs.filter(related_employee__in=employees_qs)
                investigations_qs = investigations_qs.filter(related_employee__in=employees_qs)
            hearings_active = hearings_qs.count()
            investigations_active = investigations_qs.count()
        except Exception:
            hearings_active = 0
            investigations_active = 0

        return Response({
            'employees': {
                'total': total,
                'active': active,
                'on_leave': on_leave,
                'suspended': suspended,
                'terminated': terminated,
            },
            'sick_notes': {
                'pending': sick_pending,
                'total': sick_total,
            },
            'leave': {
                'approved_days': leave_days,
                'total_requests': leave_total,
            },
            'situations': {
                'contracts_expiring_30d': expiring_30d,
                'hearings_active': hearings_active,
                'investigations_active': investigations_active,
            }
        })

    @action(detail=False, methods=['get'])
    def classification_summary(self, request):
        """Return employee counts by classification (Local, Regional, National, Expatriate)"""
        from apps.hcm.models import EmployeeClassification
        
        classifications = EmployeeClassification.objects.all()
        data = {}
        
        # Get workspace-filtered queryset
        employee_qs = Employee.objects.filter(employment_status='ACTIVE')
        if hasattr(request, 'workspace') and request.workspace:
            employee_qs = employee_qs.filter(workspace=request.workspace)
        
        for classification in classifications:
            count = employee_qs.filter(classification=classification).count()
            data[classification.name.lower()] = count
        
        return Response(data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def weekly_headcount(self, request):
        """Return weekly headcount movement (previous week vs current week)"""
        from django.utils import timezone
        from datetime import timedelta
        
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        # Filter by workspace if available
        employee_qs = Employee.objects.all()
        if hasattr(request, 'workspace') and request.workspace:
            employee_qs = employee_qs.filter(workspace=request.workspace)
        
        # Current week active employees
        current_total = employee_qs.filter(employment_status='ACTIVE').count()
        
        # Previous week total (approximate):
        # Count employees hired on or before last week and not terminated before last week
        previous_total = employee_qs.filter(
            hire_date__lte=week_ago,
            employment_status__in=['ACTIVE', 'SUSPENDED']  # Include suspended as they were employed
        ).count()
        
        difference = current_total - previous_total
        
        return Response({
            'previous_week_total': previous_total,
            'current_week_total': current_total,
            'headcount_difference': difference,
            'comment': f'Week of {week_ago.strftime("%b %d, %Y")}'
        })

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def template_download(self, request):
        """
        Download CSV template for employee import.
        Headers show all supported fields and example data.
        No authentication required.
        """
        output = StringIO()
        writer = csv.writer(output)
        
        # Define CSV headers
        headers = [
            'Employee ID',
            'First Name',
            'Last Name',
            'Email',
            'NRC',
            'Phone',
            'Job Title',
            'Hire Date (YYYY-MM-DD)',
            'Date of Birth (YYYY-MM-DD)',
            'Gender (M/F/OTHER)',
            'House Address',
            'TPIN',
            'NHIMA',
            'SSS Number',
        ]
        
        writer.writerow(headers)
        
        # Add example row
        example_row = [
            'EMP-001',
            'John',
            'Doe',
            'john.doe@company.com',
            '353891/66/1',
            '+260971234567',
            'Software Engineer',
            '2023-01-15',
            '1990-05-20',
            'M',
            '123 Main Street, Kitwe',
            'TPN123456',
            'NHM456789',
            'SSS987654',
        ]
        
        writer.writerow(example_row)
        
        # Create HTTP response with CSV
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="employee_template.csv"'
        
        return response

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def import_data(self, request):
        """
        Import employees from CSV or XLSX file.
        Expects 'file' in multipart form data.
        """
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read file based on extension
            if file_obj.name.endswith('.csv'):
                df = pd.read_csv(BytesIO(file_obj.read()))
            elif file_obj.name.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(BytesIO(file_obj.read()))
            else:
                return Response({'error': 'Unsupported file format. Use CSV or XLSX.'}, status=status.HTTP_400_BAD_REQUEST)

            # Map common column names to model fields (case-insensitive)
            column_mapping = {
                'employee id': 'employee_id',
                'employee number': 'employee_id',
                's/no': 'skip_column',  # Skip S/No column
                'full name': 'full_name',  # Handle Full Name
                'first name': 'first_name',
                'surname': 'last_name',
                'last name': 'last_name',
                'job title': 'job_title',
                'hire date': 'hire_date',
                'date of birth': 'date_of_birth',
                'dob': 'date_of_birth',
                'gender': 'gender',
                'nrc': 'nrc',
                'national id (nrc)': 'nrc',
                'tpin': 'tpin',
                'tpin number': 'tpin',
                'nhima': 'nhima',
                'nhima number': 'nhima',
                's/s number': 'sss_number',
                'sss_number': 'sss_number',
                'phone': 'phone',
                'contact details': 'phone',
                'email': 'email',
                'house address': 'house_address',
                'address': 'house_address',
                'point of hire': 'point_of_hire',
            }

            # Normalize column names
            df.columns = df.columns.str.strip().str.lower()
            df.rename(columns=column_mapping, inplace=True)

            created = 0
            updated = 0
            errors = []

            workspace = self._resolve_workspace(request)
            if not workspace:
                return Response({'error': 'Workspace is required for employee import.'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                for idx, row in df.iterrows():
                    try:
                        # Skip rows with missing employee_id (header rows, etc)
                        emp_id = row.get('employee_id')
                        if pd.isna(emp_id) or str(emp_id).strip() == '':
                            continue
                        
                        emp_id_str = str(emp_id).strip()
                        
                        # Skip header-like rows
                        if emp_id_str.lower() in ['employee number', 'employee id', 's/no', '']:
                            continue

                        # Get first and last names
                        first_name = str(row.get('first_name', '')).strip()
                        last_name = str(row.get('last_name', '')).strip()
                        
                        # If Full Name is provided but First/Last names are empty, split it
                        if (not first_name or not last_name) and pd.notna(row.get('full_name')):
                            full_name = str(row.get('full_name', '')).strip()
                            if full_name and ' ' in full_name:
                                parts = full_name.rsplit(' ', 1)  # Split on last space
                                first_name = first_name or parts[0]
                                last_name = last_name or parts[1]
                            elif full_name:
                                first_name = first_name or full_name
                                last_name = last_name or 'Employee'

                        # Build employee data
                        employee_data = {
                            'employee_id': emp_id_str,
                            'first_name': first_name or 'Unknown',
                            'last_name': last_name or 'Employee',

                            'job_title': str(row.get('job_title', '')).strip() or 'Not Specified',
                            'nrc': str(row.get('nrc', '')).strip() or f"NRC-{row.get('employee_id', idx)}",
                            'email': str(row.get('email', '')).strip() or f"employee{row.get('employee_id', idx)}@company.com",
                            'phone': str(row.get('phone', '')).strip() or '0000000000',
                            'house_address': str(row.get('house_address', '')).strip() or 'N/A',
                            'gender': 'OTHER',  # Default gender
                            'date_of_birth': pd.to_datetime('1990-01-01').date(),  # Default DOB
                        }

                        # Optional fields - override defaults if provided
                        if pd.notna(row.get('hire_date')):
                            employee_data['hire_date'] = pd.to_datetime(row['hire_date']).date()
                        
                        if pd.notna(row.get('date_of_birth')):
                            employee_data['date_of_birth'] = pd.to_datetime(row['date_of_birth']).date()
                        
                        if pd.notna(row.get('gender')):
                            gender = str(row['gender']).strip().upper()
                            if gender in ['M', 'MALE']:
                                employee_data['gender'] = 'M'
                            elif gender in ['F', 'FEMALE']:
                                employee_data['gender'] = 'F'
                            else:
                                employee_data['gender'] = 'OTHER'

                        if pd.notna(row.get('tpin')):
                            employee_data['tpin'] = str(row['tpin']).strip()
                        
                        if pd.notna(row.get('nhima')):
                            employee_data['nhima'] = str(row['nhima']).strip()
                        
                        if pd.notna(row.get('sss_number')):
                            employee_data['sss_number'] = str(row['sss_number']).strip()
                        
                        if pd.notna(row.get('point_of_hire')):
                            employee_data['point_of_hire'] = str(row['point_of_hire']).strip()

                        # Handle employment type - normalize and use valid choices
                        # Valid EmploymentType choices: DIRECT, CONTRACTOR, CONSULTANT, TEMPORARY
                        if pd.notna(row.get('employment_type')):
                            raw_type = str(row['employment_type']).strip().upper()
                        else:
                            raw_type = ''

                        mapping = {
                            'DIRECT': 'DIRECT',
                            'EMPLOYEE': 'DIRECT',
                            'PERMANENT': 'DIRECT',  # Map common synonym to DIRECT employee
                            'CONTRACTOR': 'CONTRACTOR',
                            'CONTRACT': 'CONTRACTOR',
                            'CONSULTANT': 'CONSULTANT',
                            'TEMP': 'TEMPORARY',
                            'TEMPORARY': 'TEMPORARY',
                        }
                        emp_type_name = mapping.get(raw_type, 'DIRECT')

                        emp_type, _ = EmploymentType.objects.get_or_create(name=emp_type_name)
                        employee_data['employment_type'] = emp_type

                        # Always assign workspace to avoid orphan employees
                        employee_data['workspace'] = workspace

                        existing = Employee.objects.filter(employee_id=employee_data['employee_id']).first()
                        if existing and existing.workspace and existing.workspace != workspace:
                            raise ValueError('Employee ID belongs to a different workspace')

                        # Update or create
                        employee, created_flag = Employee.objects.update_or_create(
                            employee_id=employee_data['employee_id'],
                            defaults=employee_data
                        )

                        if created_flag:
                            created += 1
                        else:
                            updated += 1

                    except Exception as e:
                        errors.append(f"Row {idx + 1}: {str(e)}")

            return Response({
                'success': True,
                'created': created,
                'updated': updated,
                'errors': errors,
                'total_processed': created + updated
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f'Import failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContractViewSet(viewsets.ModelViewSet):
    """ViewSet for employee contracts."""
    queryset = Contract.objects.select_related('employee', 'contract_type').all()
    serializer_class = ContractSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'status', 'contract_type']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id', 'contract_number']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(employee__workspace=self.request.workspace)
        
        # Allow filtering by department_id through employee
        dept_id = self.request.query_params.get('department_id')
        if dept_id:
            qs = qs.filter(employee__department_id=dept_id)
        
        return qs


class EngagementViewSet(viewsets.ModelViewSet):
    """ViewSet for employee engagements."""
    queryset = Engagement.objects.select_related('employee').all()
    serializer_class = EngagementSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee']
    ordering_fields = ['engagement_date', 'created_at']
    ordering = ['-engagement_date']

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(employee__workspace=self.request.workspace)
        return qs


class TerminationViewSet(viewsets.ModelViewSet):
    """ViewSet for employee terminations."""
    queryset = Termination.objects.select_related('employee', 'termination_reason').all()
    serializer_class = TerminationSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'termination_reason']
    ordering_fields = ['termination_date', 'created_at']
    ordering = ['-termination_date']

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(employee__workspace=self.request.workspace)
        return qs

    def perform_create(self, serializer):
        termination = serializer.save()
        employee = termination.employee
        if employee.employment_status != 'TERMINATED':
            employee.employment_status = 'TERMINATED'
            employee.save(update_fields=['employment_status', 'updated_at'])

    def perform_update(self, serializer):
        termination = serializer.save()
        employee = termination.employee
        if employee.employment_status != 'TERMINATED':
            employee.employment_status = 'TERMINATED'
            employee.save(update_fields=['employment_status', 'updated_at'])


class ContractTypeViewSet(viewsets.ModelViewSet):
    """Lookup ViewSet for contract types."""
    queryset = ContractType.objects.all().order_by('name')
    serializer_class = ContractTypeSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['name']


class TerminationReasonViewSet(viewsets.ModelViewSet):
    """Lookup ViewSet for termination reasons."""
    queryset = TerminationReason.objects.all().order_by('name')
    serializer_class = TerminationReasonSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['name']


class DepartmentViewSet(viewsets.ModelViewSet):
    """ViewSet for departments."""
    queryset = Department.objects.select_related('manager').prefetch_related('jobs').all()
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter departments by workspace FK
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(workspace=self.request.workspace)
        return qs

    def perform_create(self, serializer):
        if hasattr(self.request, 'workspace') and self.request.workspace:
            serializer.save(workspace=self.request.workspace)
        else:
            serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class JobViewSet(viewsets.ModelViewSet):
    """ViewSet for department job titles."""
    queryset = Job.objects.select_related('department').all()
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'is_active']
    search_fields = ['title', 'department__name']
    ordering_fields = ['title', 'created_at']
    ordering = ['title']

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(department__workspace=self.request.workspace)
        return qs

    def perform_create(self, serializer):
        department = serializer.validated_data.get('department')
        if hasattr(self.request, 'workspace') and self.request.workspace:
            if department and department.workspace_id != self.request.workspace.id:
                raise ValidationError({'department': 'Department is not in your active workspace.'})
        serializer.save()

    def perform_update(self, serializer):
        department = serializer.validated_data.get('department', getattr(serializer.instance, 'department', None))
        if hasattr(self.request, 'workspace') and self.request.workspace:
            if department and department.workspace_id != self.request.workspace.id:
                raise ValidationError({'department': 'Department is not in your active workspace.'})
        serializer.save()


class EmploymentTypeViewSet(viewsets.ModelViewSet):
    """Lookup ViewSet for employment types."""
    queryset = EmploymentType.objects.all().order_by('name')
    serializer_class = EmploymentTypeSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['name']


class EmployeeCategoryViewSet(viewsets.ModelViewSet):
    """Lookup ViewSet for employee categories."""
    queryset = EmployeeCategory.objects.all().order_by('name')
    serializer_class = EmployeeCategorySerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['name']


class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    """Employee document uploads."""
    queryset = EmployeeDocument.objects.select_related('employee').all()
    serializer_class = EmployeeDocumentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee']
    ordering_fields = ['uploaded_at']
    ordering = ['-uploaded_at']

    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'workspace') and self.request.workspace:
            qs = qs.filter(employee__workspace=self.request.workspace)
        return qs
