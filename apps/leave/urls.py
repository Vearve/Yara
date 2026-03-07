from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaveRequestViewSet, SickNoteViewSet, AbsenteeismViewSet, DoubleTicketRequestViewSet

router = DefaultRouter()
router.register(r'requests', LeaveRequestViewSet, basename='leave-requests')
router.register(r'sick-notes', SickNoteViewSet, basename='sick-notes')
router.register(r'absenteeism', AbsenteeismViewSet, basename='absenteeism')
router.register(r'double-tickets', DoubleTicketRequestViewSet, basename='double-tickets')

urlpatterns = [
	path('', include(router.urls)),
]
