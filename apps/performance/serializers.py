from rest_framework import serializers
from .models import KPI

class KPISerializer(serializers.ModelSerializer):
    class Meta:
        model = KPI
        fields = ['id', 'name', 'value', 'target', 'period_start', 'period_end', 'created_at', 'updated_at']
