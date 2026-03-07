from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Conversation, Message
from .serializers import UserBasicSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserBasicSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'body', 'created_at']
        read_only_fields = ['id', 'conversation', 'sender', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserBasicSerializer(many=True, read_only=True)
    participants_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, write_only=True
    )
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'name', 'is_group', 'workspace', 'participants', 'participants_ids',
            'last_message', 'unread_count', 'created_at'
        ]
        read_only_fields = ['id', 'participants', 'last_message', 'unread_count', 'created_at']

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        if not last:
            return None
        return MessageSerializer(last).data
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return 0
        return obj.unread_count_for_user(request.user)

    def create(self, validated_data):
        request = self.context['request']
        participant_ids = validated_data.pop('participants_ids', [])
        participant_users = []
        if participant_ids:
            # Get users by ID instead of username
            participant_users = list(User.objects.filter(id__in=participant_ids))
        # Ensure the creator is included
        if request.user not in participant_users:
            participant_users.append(request.user)
        conv = Conversation.objects.create(**validated_data)
        conv.participants.set(participant_users)
        return conv
