"""
DRF Serializers for Activities Models
"""

from rest_framework import serializers
from apps.activities.models import (
    Report, ReportType, Interview, Hearing,
    Investigation, CaseStudy, Charge, KPI,
    Appraisal, AppraisalObjective, AppraisalFactor,
    AppraisalImprovementItem, AppraisalNextObjective,
    AppraisalDevelopmentItem, ScheduleEvent,
)


class ReportTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportType
        fields = ['id', 'name', 'description']


class ReportSerializer(serializers.ModelSerializer):
    report_type_detail = ReportTypeSerializer(source='report_type', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.full_name', read_only=True)
    reported_employee_name = serializers.CharField(source='reported_employee.full_name', read_only=True)
    case_number = serializers.CharField(source='case_study.case_number', read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'report_number', 'report_type', 'report_type_detail',
            'reported_by', 'reported_by_name', 'reported_employee', 'reported_employee_name',
            'case_study', 'case_number',
            'title', 'description', 'location', 'incident_date', 'incident_time',
            'status', 'severity', 'attachments', 'is_escalated', 'escalated_to_case',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = [
            'id', 'candidate_name', 'candidate_nrc', 'position',
            'interview_date', 'interview_time', 'status',
            'committee_members', 'questions', 'final_score', 'recommendations',
            'interview_document', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class HearingSerializer(serializers.ModelSerializer):
    related_employee_name = serializers.CharField(source='related_employee.full_name', read_only=True)
    related_report_number = serializers.CharField(source='related_report.report_number', read_only=True)
    case_number = serializers.CharField(source='case_study.case_number', read_only=True)
    
    class Meta:
        model = Hearing
        fields = [
            'id', 'hearing_number', 'related_employee', 'related_employee_name',
            'related_report', 'related_report_number', 'case_study', 'case_number', 'hearing_date', 'hearing_time',
            'location', 'status', 'committee_members', 'chairperson',
            'charges', 'employee_statement', 'committee_findings',
            'recommendations', 'sanctions', 'hearing_document',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InvestigationSerializer(serializers.ModelSerializer):
    related_report_number = serializers.CharField(source='related_report.report_number', read_only=True)
    related_employee_name = serializers.CharField(source='related_employee.full_name', read_only=True)
    case_number = serializers.CharField(source='case_study.case_number', read_only=True)
    
    class Meta:
        model = Investigation
        fields = [
            'id', 'investigation_number', 'related_report', 'related_report_number',
            'related_employee', 'related_employee_name', 'case_study', 'case_number', 'title', 'description',
            'investigation_date', 'status', 'investigator',
            'evidence_collected', 'observations', 'findings', 'conclusion_of_scene', 'conclusions', 'recommendations',
            'investigation_document', 'supporting_documents', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CaseStudySerializer(serializers.ModelSerializer):
    related_report_number = serializers.CharField(source='related_report.report_number', read_only=True)
    related_employee_name = serializers.CharField(source='related_employee.full_name', read_only=True)
    hearings_count = serializers.SerializerMethodField()
    investigations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CaseStudy
        fields = [
            'id', 'case_number', 'related_report', 'related_report_number',
            'related_employee', 'related_employee_name', 'status', 'verdict',
            'charges_document', 'charges_text', 'allegations', 'plea', 'statement',
            'hearings_count', 'investigations_count',
            'final_verdict_text', 'sanctions_imposed', 'appeal_status',
            'case_opened_date', 'case_closed_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'case_opened_date']
    
    def get_hearings_count(self, obj):
        linked = getattr(obj, 'hearing_links', None)
        return obj.hearings.count() + (linked.count() if linked is not None else 0)
    
    def get_investigations_count(self, obj):
        linked = getattr(obj, 'investigation_links', None)
        return obj.investigations.count() + (linked.count() if linked is not None else 0)


class ChargeSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    case_number = serializers.CharField(source='case_study.case_number', read_only=True)

    class Meta:
        model = Charge
        fields = [
            'id', 'employee', 'employee_name', 'case_study', 'case_number',
            'allegations', 'plea', 'statement', 'status', 'charges_document',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class KPISerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    achievement_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = KPI
        fields = [
            'id', 'employee', 'employee_name', 'kpi_name', 'kpi_type',
            'description', 'frequency', 'start_date', 'end_date',
            'target_value', 'actual_value', 'unit', 'achieved',
            'achievement_percentage', 'comments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'achievement_percentage']


class AppraisalObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppraisalObjective
        fields = ['id', 'appraisal', 'title', 'self_rating', 'supervisor_rating', 'agreed_rating', 'comments', 'order']
        read_only_fields = ['id']


class AppraisalFactorSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppraisalFactor
        fields = ['id', 'appraisal', 'group', 'name', 'rating', 'notes', 'order']
        read_only_fields = ['id']


class AppraisalImprovementItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppraisalImprovementItem
        fields = ['id', 'appraisal', 'issue', 'limiting_factors', 'actions', 'completion_indicator', 'due_date']
        read_only_fields = ['id']


class AppraisalNextObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppraisalNextObjective
        fields = ['id', 'appraisal', 'key_area', 'objective', 'indicators']
        read_only_fields = ['id']


class AppraisalDevelopmentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppraisalDevelopmentItem
        fields = ['id', 'appraisal', 'training_need', 'action', 'responsible', 'due_date', 'application_note', 'review_date']
        read_only_fields = ['id']


class AppraisalSerializer(serializers.ModelSerializer):
    appraisee_name = serializers.CharField(source='appraisee.full_name', read_only=True)
    supervisor_name = serializers.CharField(source='supervisor.full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Appraisal
        fields = [
            'id', 'appraisee', 'appraisee_name', 'supervisor', 'supervisor_name', 'department', 'department_name',
            'position_held', 'review_start', 'review_end',
            'feedback_notes', 'employee_comments', 'supervisor_comments',
            'employee_signed_at', 'supervisor_signed_at',
            'overall_percentage', 'overall_rating', 'attachment',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ScheduleEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleEvent
        fields = ['id', 'title', 'description', 'date', 'type', 'case_study', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
