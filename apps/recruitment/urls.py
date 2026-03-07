from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ATRViewSet, CandidateViewSet, CandidateDocumentViewSet

app_name = 'recruitment'

router = DefaultRouter()
router.register(r'atrs', ATRViewSet, basename='atr')
router.register(r'candidates', CandidateViewSet, basename='candidate')
router.register(r'candidate-documents', CandidateDocumentViewSet, basename='candidate-document')

urlpatterns = [
    path('', include(router.urls)),
]
