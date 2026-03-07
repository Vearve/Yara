from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReportViewSet, ReportTypeViewSet, InterviewViewSet, HearingViewSet,
    InvestigationViewSet, CaseStudyViewSet, ChargeViewSet, KPIViewSet,
    AppraisalViewSet, AppraisalObjectiveViewSet, AppraisalFactorViewSet,
    AppraisalImprovementItemViewSet, AppraisalNextObjectiveViewSet,
    AppraisalDevelopmentItemViewSet, ScheduleEventViewSet,
)

app_name = 'activities'

router = DefaultRouter()
router.register(r'report-types', ReportTypeViewSet, basename='report-type')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'interviews', InterviewViewSet, basename='interview')
router.register(r'hearings', HearingViewSet, basename='hearing')
router.register(r'investigations', InvestigationViewSet, basename='investigation')
router.register(r'case-studies', CaseStudyViewSet, basename='case-study')
router.register(r'charges', ChargeViewSet, basename='charge')
router.register(r'kpis', KPIViewSet, basename='kpi')
router.register(r'appraisals', AppraisalViewSet, basename='appraisal')
router.register(r'appraisal-objectives', AppraisalObjectiveViewSet, basename='appraisal-objective')
router.register(r'appraisal-factors', AppraisalFactorViewSet, basename='appraisal-factor')
router.register(r'appraisal-improvements', AppraisalImprovementItemViewSet, basename='appraisal-improvement')
router.register(r'appraisal-next-objectives', AppraisalNextObjectiveViewSet, basename='appraisal-next-objective')
router.register(r'appraisal-development-items', AppraisalDevelopmentItemViewSet, basename='appraisal-development-item')
router.register(r'schedule-events', ScheduleEventViewSet, basename='schedule-event')

urlpatterns = [
    path('', include(router.urls)),
]
