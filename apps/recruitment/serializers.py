from rest_framework import serializers
from .models import ATR, Candidate, CandidateDocument


class ATRSerializer(serializers.ModelSerializer):
    class Meta:
        model = ATR
        fields = '__all__'


class CandidateSerializer(serializers.ModelSerializer):
    atr_reference = serializers.CharField(source='atr.reference_number', read_only=True)
    documents = serializers.SerializerMethodField()

    class Meta:
        model = Candidate
        fields = '__all__'

    def get_documents(self, obj):
        docs = getattr(obj, 'documents', None)
        if not docs:
            return []
        return CandidateDocumentSerializer(docs.all(), many=True).data


class CandidateDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateDocument
        fields = ['id', 'candidate', 'document', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']
