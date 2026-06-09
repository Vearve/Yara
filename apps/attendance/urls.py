from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShiftViewSet, AttendanceRecordViewSet, ClockEventViewSet

router = DefaultRouter()
router.register('shifts', ShiftViewSet, basename='shift')
router.register('records', AttendanceRecordViewSet, basename='attendance-record')
router.register('clock-events', ClockEventViewSet, basename='clock-event')

urlpatterns = [
    path('', include(router.urls)),
]
