"""
DRF Serializers for Tracking Models
"""

from rest_framework import serializers
from apps.tracking.models import (
    Training, TrainingType, Medical, MedicalType,
    Permit, PermitType, Probation, ComplianceAlert
)


class TrainingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingType
        fields = ['id', 'name', 'category', 'description', 'requires_certification', 'default_validity_months']


class TrainingSerializer(serializers.ModelSerializer):
    training_type_detail = TrainingTypeSerializer(source='training_type', read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Training
        fields = [
            'id', 'employee', 'employee_name', 'training_type', 'training_type_detail',
            'provider', 'status', 'scheduled_date', 'completion_date',
            'issue_date', 'expiry_date', 'certificate_number', 'certificate_document',
            'cost', 'notes', 'is_expired', 'days_until_expiry', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_expired', 'days_until_expiry']


class MedicalTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalType
        fields = ['id', 'name', 'description', 'frequency_months']


class MedicalSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    medical_type_name = serializers.CharField(source='medical_type', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Medical
        fields = [
            'id', 'employee', 'employee_name', 'medical_type', 'medical_type_name',
            'scheduled_date', 'completion_date', 'facility', 'status',
            'clearance_status', 'findings', 'restrictions', 'report_document',
            'issue_date', 'expiry_date', 'is_expired', 'days_until_expiry',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_expired', 'days_until_expiry']


class PermitTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermitType
        fields = ['id', 'name', 'description', 'validity_months']


class PermitSerializer(serializers.ModelSerializer):
    permit_type_detail = PermitTypeSerializer(source='permit_type', read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Permit
        fields = [
            'id', 'employee', 'employee_name', 'permit_type', 'permit_type_detail',
            'status', 'issue_date', 'expiry_date', 'permit_number', 'document',
            'issued_by', 'is_expired', 'days_until_expiry', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_expired', 'days_until_expiry']


class ProbationSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Probation
        fields = [
            'id', 'employee', 'employee_name', 'start_date', 'end_date',
            'status', 'decision', 'decision_date', 'decision_remarks', 'decided_by',
            'extension_end_date', 'extension_reason', 'is_active', 'days_remaining',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_active', 'days_remaining']


class ComplianceAlertSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    
    class Meta:
        model = ComplianceAlert
        fields = [
            'id', 'employee', 'employee_name', 'alert_type', 'status',
            'title', 'description', 'due_date', 'content_type', 'object_id',
            'acknowledged_at', 'acknowledged_by', 'resolved_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'acknowledged_at', 'resolved_at']
