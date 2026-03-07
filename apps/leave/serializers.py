from rest_framework import serializers
from .models import LeaveRequest, SickNote, Absenteeism, DoubleTicketRequest


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    employee_code = serializers.CharField(source="employee.employee_id", read_only=True)

    class Meta:
        model = LeaveRequest
        fields = "__all__"
        read_only_fields = ["days", "created_at", "updated_at", "approved_by"]

    def validate(self, attrs):
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start and end and start > end:
            raise serializers.ValidationError("start_date cannot be after end_date")
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user and not validated_data.get("approved_by"):
            # Applicants are the employee; approver set later
            pass
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class SickNoteSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    employee_code = serializers.CharField(source="employee.employee_id", read_only=True)

    class Meta:
        model = SickNote
        fields = "__all__"
        read_only_fields = ["days", "created_at", "updated_at", "issued_by"]

    def validate(self, attrs):
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start and end and start > end:
            raise serializers.ValidationError("start_date cannot be after end_date")
        return attrs


class LeaveSummarySerializer(serializers.Serializer):
    employee = serializers.IntegerField()
    employee_name = serializers.CharField()
    total_requests = serializers.IntegerField()
    pending = serializers.IntegerField()
    approved = serializers.IntegerField()
    rejected = serializers.IntegerField()
    cancelled = serializers.IntegerField()
    total_days = serializers.IntegerField()
    sick_days = serializers.IntegerField()
    annual_days = serializers.IntegerField()


class AbsenteeismSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    employee_code = serializers.CharField(source="employee.employee_id", read_only=True)
    reported_by_name = serializers.CharField(source="reported_by.username", read_only=True)

    class Meta:
        model = Absenteeism
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at", "reported_by"]


class DoubleTicketRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    employee_code = serializers.CharField(source="employee.employee_id", read_only=True)
    approved_by_name = serializers.CharField(source="approved_by.username", read_only=True)
    calculated_payment = serializers.SerializerMethodField()

    class Meta:
        model = DoubleTicketRequest
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at", "approved_by", "approved_at", "calculated_amount"]

    def get_calculated_payment(self, obj):
        """Return calculated double ticket payment"""
        return obj.calculate_payment()

    def validate_hours_worked(self, value):
        """Ensure hours worked is reasonable (0-24)"""
        if value <= 0 or value > 24:
            raise serializers.ValidationError("Hours worked must be between 0 and 24")
        return value

