from typing import Any, cast

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from apps.activities.models import Report, ReportType
from apps.core.models import Workspace, WorkspaceMembership


class ReportCreateViewTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username="report_tester",
            email="report_tester@example.com",
            password="pass1234",
        )
        self.api_client = APIClient()
        self.api_client.force_authenticate(user=self.user)
        self.report_type, _ = ReportType.objects.get_or_create(name="SAFETY")
        self.url = reverse("activities:report-list")

    def test_create_report_view_saves_report_in_database(self):
        report_type_pk = cast(int, self.report_type.pk)
        payload = {
            "report_type": report_type_pk,
            "title": "Factory floor incident",
            "description": "Minor spill near machine area.",
            "incident_date": "2026-03-29",
            "severity": "LOW",
            "status": "SUBMITTED",
        }

        response: Any = self.api_client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Report.objects.count(), 1)

        report_data = Report.objects.values("title", "report_type_id", "report_number").first()
        self.assertIsNotNone(report_data)
        saved_report = cast(dict[str, Any], report_data)

        self.assertEqual(saved_report["title"], payload["title"])
        self.assertEqual(saved_report["report_type_id"], report_type_pk)
        self.assertTrue(str(saved_report["report_number"]).startswith("RPT-"))

    def test_created_report_is_visible_in_workspace_scoped_list(self):
        workspace = Workspace.objects.create(name="Test Workspace", code="TWS")
        WorkspaceMembership.objects.create(
            user=self.user,
            workspace=workspace,
            role="ADMIN",
            is_active=True,
        )

        report_type_pk = cast(int, self.report_type.pk)
        payload = {
            "report_type": report_type_pk,
            "title": "Visibility check",
            "description": "Ensure list endpoint returns created item.",
            "incident_date": "2026-03-29",
            "severity": "LOW",
            "status": "SUBMITTED",
        }

        create_response: Any = self.api_client.post(
            self.url,
            payload,
            format="json",
            HTTP_X_WORKSPACE_ID=str(workspace.pk),
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        list_response: Any = self.api_client.get(
            self.url,
            HTTP_X_WORKSPACE_ID=str(workspace.pk),
        )
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        body = cast(dict[str, Any], list_response.data)
        results = cast(list[dict[str, Any]], body.get("results", []))
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "Visibility check")
