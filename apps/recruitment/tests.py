from typing import Any, cast

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.core.models import Workspace, WorkspaceMembership
from apps.hcm.models import Department
from apps.recruitment.models import ATR


class ATRDeleteTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username='atr_delete_tester',
            email='atr_delete_tester@example.com',
            password='pass1234',
        )
        self.workspace = Workspace.objects.create(name='Recruitment Workspace', code='RWS')
        WorkspaceMembership.objects.create(
            user=self.user,
            workspace=self.workspace,
            role='ADMIN',
            is_active=True,
            is_default=True,
        )
        self.department = Department.objects.create(
            name='Recruitment',
            workspace=self.workspace,
        )
        self.api_client = APIClient()
        self.api_client.force_authenticate(user=self.user)

    def test_approved_atr_can_be_deleted(self):
        atr = ATR.objects.create(
            reference_number='ATR-APPROVED-DELETE',
            department=self.department,
            hiring_supervisor_name='Hiring Supervisor',
            position_title='Drill Operator',
            roles_to_fill=2,
            approval_status='APPROVED',
        )

        response: Any = self.api_client.delete(
            reverse('recruitment:atr-detail', args=[cast(int, atr.pk)]),
            HTTP_X_WORKSPACE_ID=str(self.workspace.pk),
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ATR.objects.filter(pk=atr.pk).exists())