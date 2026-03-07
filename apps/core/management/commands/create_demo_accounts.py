from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.core.models import Workspace, WorkspaceMembership

class Command(BaseCommand):
    help = "Create consultant_demo and client_demo demo accounts with memberships"

    def handle(self, *args, **options):
        consultant, _ = User.objects.get_or_create(
            username='consultant_demo', defaults={'email': 'consultant_demo@example.com'}
        )
        consultant.set_password('consultant123')
        consultant.save()

        client, _ = User.objects.get_or_create(
            username='client_demo', defaults={'email': 'client_demo@example.com'}
        )
        client.set_password('client123')
        client.save()

        workspaces = list(Workspace.objects.all())
        for i, ws in enumerate(workspaces):
            membership, created = WorkspaceMembership.objects.get_or_create(
                user=consultant,
                workspace=ws,
                defaults={'role': 'ADMIN', 'is_active': True, 'is_default': i == 0},
            )
            if not created:
                membership.is_active = True
                membership.role = 'ADMIN'
                membership.is_default = i == 0
                membership.save()

        assigned_ws = None
        if workspaces:
            ws = workspaces[0]
            membership, created = WorkspaceMembership.objects.get_or_create(
                user=client,
                workspace=ws,
                defaults={'role': 'ADMIN', 'is_active': True, 'is_default': True},
            )
            if not created:
                membership.is_active = True
                membership.role = 'ADMIN'
                membership.is_default = True
                membership.save()
            assigned_ws = ws.name

        self.stdout.write(self.style.SUCCESS(
            f"Created consultant_demo/consultant123 and client_demo/client123; client assigned to {assigned_ws or 'no workspace'}"
        ))
