from rest_framework import serializers
from .labour_models import LabourRecon


class LabourReconSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabourRecon
        fields = '__all__'
