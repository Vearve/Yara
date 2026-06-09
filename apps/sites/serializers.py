from rest_framework import serializers
from .models import Site, SiteEmployee, SitePeriod


class SiteEmployeeSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    department = serializers.SerializerMethodField()
    job_title = serializers.CharField(source='employee.job_title', read_only=True, default='')

    class Meta:
        model = SiteEmployee
        fields = [
            'id', 'site', 'employee', 'employee_name', 'employee_number',
            'department', 'job_title', 'role_on_site', 'start_date', 'end_date',
            'is_active', 'notes', 'created_at',
        ]
        read_only_fields = ['created_at']

    def get_department(self, obj):
        dept = getattr(obj.employee, 'department', None)
        if dept:
            return {'id': dept.id, 'name': dept.name}
        return None

    def validate(self, data):
        # enforce one active site per employee
        employee = data.get('employee', getattr(self.instance, 'employee', None))
        is_active = data.get('is_active', getattr(self.instance, 'is_active', True))
        if is_active and employee:
            qs = SiteEmployee.objects.filter(employee=employee, is_active=True)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                other = qs.first()
                raise serializers.ValidationError(
                    f"{employee.full_name} is already active on site '{other.site.name}'. "
                    "De-activate that assignment first."
                )
        return data


class SiteSerializer(serializers.ModelSerializer):
    active_employee_count = serializers.IntegerField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Site
        fields = [
            'id', 'workspace', 'name', 'location', 'description', 'cost_centre',
            'start_date', 'end_date', 'status', 'status_display',
            'active_employee_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class SitePeriodSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    period_type_display = serializers.CharField(source='get_period_type_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    locked_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SitePeriod
        fields = [
            'id', 'site', 'site_name', 'name', 'period_type', 'period_type_display',
            'start_date', 'end_date', 'status', 'status_display',
            'notes', 'locked_at', 'locked_by', 'locked_by_name', 'created_at',
        ]
        read_only_fields = ['locked_at', 'locked_by', 'created_at']

    def get_locked_by_name(self, obj):
        if obj.locked_by:
            return obj.locked_by.get_full_name() or obj.locked_by.username
        return None
