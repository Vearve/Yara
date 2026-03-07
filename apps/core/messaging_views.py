from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from .models import Conversation, Message
from .messaging_serializers import ConversationSerializer, MessageSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    """Conversation and message endpoints."""
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        print(f"[ConversationViewSet] Fetching conversations for user: {user.email}")
        
        # Get all conversations where user is a participant
        qs = Conversation.objects.filter(participants=user).prefetch_related('participants')
        
        workspace_id = self.request.query_params.get('workspace')
        if workspace_id:
            # If workspace specified, get conversations from that workspace AND cross-workspace ones
            qs = qs.filter(Q(workspace_id=workspace_id) | Q(workspace__isnull=True))
            print(f"[ConversationViewSet] Filtering by workspace {workspace_id}: {qs.count()} conversations")
        else:
            # If no workspace specified, show ALL conversations (cross-workspace + single workspace)
            print(f"[ConversationViewSet] No workspace filter: {qs.count()} conversations")
        
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        # For cross-workspace conversations, don't set workspace (leave as NULL)
        # The workspace parameter is only used if explicitly provided AND user is in that workspace
        workspace_id = self.request.data.get('workspace')
        workspace_from_middleware = getattr(self.request, 'workspace', None)
        
        # Only set workspace if explicitly provided in payload
        if workspace_id:
            print(f"[ConversationViewSet] Creating conversation in workspace {workspace_id}")
            serializer.save(workspace_id=workspace_id)
        else:
            # Cross-workspace conversation: workspace=NULL
            print(f"[ConversationViewSet] Creating cross-workspace conversation (workspace=NULL)")
            serializer.save(workspace=None)

    @action(detail=True, methods=['get', 'post'], url_path='messages')
    def messages(self, request, pk=None):
        conversation = self.get_object()
        if request.method.lower() == 'get':
            msgs = conversation.messages.select_related('sender').order_by('-created_at')[:200]
            # Mark all messages as read by current user
            for msg in msgs:
                if request.user not in msg.read_by.all():
                    msg.read_by.add(request.user)
            return Response(MessageSerializer(msgs, many=True).data)
        # POST
        body = request.data.get('body', '').strip()
        if not body:
            return Response({'detail': 'Message body required'}, status=status.HTTP_400_BAD_REQUEST)
        msg = Message.objects.create(conversation=conversation, sender=request.user, body=body)
        # Mark sender's own message as read
        msg.read_by.add(request.user)
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)
