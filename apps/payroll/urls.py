from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PayrollComponentViewSet,
    PayrollEntryViewSet,
    SalaryRangeViewSet,
    TitleBreakdownViewSet,
    PayrollPeriodViewSet,
    PayslipViewSet,
    PAYEReturnViewSet,
)

app_name = 'payroll'

router = DefaultRouter()
router.register(r'components', PayrollComponentViewSet, basename='component')
router.register(r'entries', PayrollEntryViewSet, basename='entry')
router.register(r'salary-ranges', SalaryRangeViewSet, basename='salary-range')
router.register(r'title-breakdowns', TitleBreakdownViewSet, basename='title-breakdown')
router.register(r'periods', PayrollPeriodViewSet, basename='period')
router.register(r'payslips', PayslipViewSet, basename='payslip')
router.register(r'paye-returns', PAYEReturnViewSet, basename='paye-return')

urlpatterns = [
    path('', include(router.urls)),
]
