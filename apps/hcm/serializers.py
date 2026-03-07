"""
DRF Serializers for HCM Models
"""

from rest_framework import serializers
from apps.hcm.models import (
    Employee, Contract, Engagement, Termination,
    Department, Job, EmployeeCategory, EmployeeClassification, EmploymentType,
    ContractType, TerminationReason, EmployeeDocument
)


class EmployeeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeCategory
        fields = ['id', 'name', 'description']


class EmployeeClassificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeClassification
        fields = ['id', 'name', 'description']


class EmploymentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentType
        fields = ['id', 'name', 'description']


class JobSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Job
        fields = ['id', 'department', 'department_name', 'title', 'is_active', 'created_at', 'updated_at']


class ContractTypeSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='get_name_display', read_only=True)
    
    class Meta:
        model = ContractType
        fields = ['id', 'name', 'display_name', 'default_duration_months', 'description']


class DepartmentSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    jobs = serializers.SerializerMethodField()
    job_titles = serializers.ListField(child=serializers.CharField(), required=False)
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'manager', 'manager_name', 'job_titles', 'jobs', 'created_at', 'updated_at']

    def get_jobs(self, obj):
        return [{'id': job.id, 'title': job.title, 'is_active': job.is_active} for job in obj.jobs.all()]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not data.get('job_titles'):
            data['job_titles'] = [job['title'] for job in data.get('jobs', [])]
        return data

    def _sync_jobs(self, department, titles):
        if titles is None:
            return
        clean_titles = [t.strip() for t in titles if isinstance(t, str) and t.strip()]
        existing = {job.title: job for job in department.jobs.all()}
        keep = set(clean_titles)

        for title in clean_titles:
            if title not in existing:
                Job.objects.create(department=department, title=title)

        for title, job in existing.items():
            if title not in keep:
                job.delete()

    def create(self, validated_data):
        job_titles = validated_data.pop('job_titles', None)
        department = super().create(validated_data)
        self._sync_jobs(department, job_titles)
        return department

    def update(self, instance, validated_data):
        job_titles = validated_data.pop('job_titles', None)
        department = super().update(instance, validated_data)
        self._sync_jobs(department, job_titles)
        return department


class EmployeeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for lists."""
    employment_type_name = serializers.CharField(source='employment_type.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    classification_name = serializers.CharField(source='classification.name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'job_title', 'department', 'department_name',
            'employment_type', 'employment_type_name', 'category', 'category_name',
            'classification', 'classification_name',
            'employment_status', 'hire_date', 'gender', 'date_of_birth', 'nationality', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'full_name']


class EmployeeDetailSerializer(serializers.ModelSerializer):
    """Full employee details."""
    employment_type_detail = EmploymentTypeSerializer(source='employment_type', read_only=True)
    department_detail = DepartmentSerializer(source='department', read_only=True)
    category_detail = EmployeeCategorySerializer(source='category', read_only=True)
    classification_detail = EmployeeClassificationSerializer(source='classification', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'first_name', 'last_name', 'full_name',
            'nrc', 'nrc_number', 'passport', 'tpin', 'nhima', 'sss_number', 'napsa_number',
            'date_of_birth', 'gender', 'nationality',
            'email', 'phone', 'house_address', 'residential_area',
            'employment_type', 'employment_type_detail',
            'employment_status', 'job_title', 'department', 'department_detail',
            'category', 'category_detail', 'classification', 'classification_detail', 
            'point_of_hire', 'contractor_type',
            'hire_date', 'next_of_kin_name', 'next_of_kin_relationship', 'next_of_kin_phone',
            'photo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_name']


class ContractSerializer(serializers.ModelSerializer):
    contract_type_name = serializers.CharField(source='contract_type.name', read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Contract
        fields = [
            'id', 'employee', 'employee_name', 'contract_type', 'contract_type_name',
            'contract_number', 'start_date', 'end_date', 'duration_months',
            'status', 'salary_currency', 'basic_salary', 'document_url',
            'is_expired', 'days_until_expiry', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_expired', 'days_until_expiry']


class EngagementSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    contract_type_name = serializers.CharField(source='contract_type.name', read_only=True)
    
    class Meta:
        model = Engagement
        fields = [
            'id', 'employee', 'employee_name', 'engagement_date',
            'contract_type', 'contract_type_name', 'contract_duration_months',
            'initial_contract_end_date', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TerminationReasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerminationReason
        fields = ['id', 'name', 'description']


class TerminationSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    termination_reason_name = serializers.CharField(source='termination_reason.name', read_only=True)
    
    class Meta:
        model = Termination
        fields = [
            'id', 'employee', 'employee_name', 'termination_date',
            'termination_reason', 'termination_reason_name', 'payroll_final',
            'comments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeDocument
        fields = ['id', 'employee', 'title', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']
