from rest_framework import serializers
from .models import Shift, AttendanceRecord, ClockEvent


class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = ['id', 'workspace', 'name', 'shift_type', 'start_time', 'end_time', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AttendanceRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    shift_name = serializers.CharField(source='shift.name', read_only=True, allow_null=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'employee', 'employee_name', 'employee_id',
            'shift', 'shift_name', 'date', 'status',
            'clock_in', 'clock_out', 'hours_worked',
            'is_late', 'late_minutes', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'hours_worked', 'is_late', 'late_minutes', 'created_at', 'updated_at']

    def create(self, validated_data):
        record = super().create(validated_data)
        record.compute_hours()
        record.save(update_fields=['hours_worked', 'is_late', 'late_minutes'])
        return record

    def update(self, instance, validated_data):
        record = super().update(instance, validated_data)
        record.compute_hours()
        record.save(update_fields=['hours_worked', 'is_late', 'late_minutes'])
        return record


class ClockEventSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = ClockEvent
        fields = ['id', 'employee', 'employee_name', 'event_type', 'timestamp', 'location', 'device_id', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']
