from rest_framework import serializers
from .models import ATR, Candidate, CandidateDocument


def _absolutize_file_urls(data, request, fields):
    if not request:
        return data
    for field in fields:
        value = data.get(field)
        if isinstance(value, str) and value.startswith('/'):
            data[field] = request.build_absolute_uri(value)
    return data


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
        return CandidateDocumentSerializer(docs.all(), many=True, context=self.context).data


class CandidateDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateDocument
        fields = ['id', 'candidate', 'document', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return _absolutize_file_urls(data, self.context.get('request'), ['document'])
