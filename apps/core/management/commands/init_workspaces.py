"""
Management command to initialize workspace structure and migrate existing data.
Run this after applying workspace migrations for the first time.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.core.models import Workspace, WorkspaceMembership
from apps.hcm.models import Employee
from apps.core.assignments import Site, Project, Client


class Command(BaseCommand):
    help = 'Initialize workspace structure and assign existing data to default workspace'

    def add_arguments(self, parser):
        parser.add_argument(
            '--workspace-name',
            type=str,
            default='Default Organization',
            help='Name of the default workspace to create'
        )
        parser.add_argument(
            '--workspace-code',
            type=str,
            default='DEFAULT',
            help='Code for the default workspace'
        )

    def handle(self, *args, **options):
        workspace_name = options['workspace_name']
        workspace_code = options['workspace_code']

        self.stdout.write(self.style.WARNING('Starting workspace initialization...'))

        # Step 1: Create default workspace if it doesn't exist
        workspace, created = Workspace.objects.get_or_create(
            code=workspace_code,
            defaults={
                'name': workspace_name,
                'workspace_type': 'COMPANY',
                'is_active': True,
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created default workspace: {workspace}'))
        else:
            self.stdout.write(self.style.WARNING(f'✓ Default workspace already exists: {workspace}'))

        # Step 2: Assign all employees without workspace to default workspace
        employees_without_workspace = Employee.objects.filter(workspace__isnull=True)
        count = employees_without_workspace.count()
        
        if count > 0:
            employees_without_workspace.update(workspace=workspace)
            self.stdout.write(self.style.SUCCESS(f'✓ Assigned {count} employees to default workspace'))
        else:
            self.stdout.write(self.style.WARNING('✓ No employees need workspace assignment'))

        # Step 3: Assign sites without workspace
        sites_without_workspace = Site.objects.filter(workspace__isnull=True)
        count = sites_without_workspace.count()
        
        if count > 0:
            sites_without_workspace.update(workspace=workspace)
            self.stdout.write(self.style.SUCCESS(f'✓ Assigned {count} sites to default workspace'))
        else:
            self.stdout.write(self.style.WARNING('✓ No sites need workspace assignment'))

        # Step 4: Assign projects without workspace
        projects_without_workspace = Project.objects.filter(workspace__isnull=True)
        count = projects_without_workspace.count()
        
        if count > 0:
            projects_without_workspace.update(workspace=workspace)
            self.stdout.write(self.style.SUCCESS(f'✓ Assigned {count} projects to default workspace'))
        else:
            self.stdout.write(self.style.WARNING('✓ No projects need workspace assignment'))

        # Step 5: Assign clients without workspace
        clients_without_workspace = Client.objects.filter(workspace__isnull=True)
        count = clients_without_workspace.count()
        
        if count > 0:
            clients_without_workspace.update(workspace=workspace)
            self.stdout.write(self.style.SUCCESS(f'✓ Assigned {count} clients to default workspace'))
        else:
            self.stdout.write(self.style.WARNING('✓ No clients need workspace assignment'))

        # Step 6: Create workspace membership for all existing users
        users = User.objects.all()
        memberships_created = 0
        
        for user in users:
            membership, created = WorkspaceMembership.objects.get_or_create(
                user=user,
                workspace=workspace,
                defaults={
                    'role': 'ADMIN' if user.is_superuser else 'HR_MANAGER',
                    'is_default': True,
                    'is_active': True,
                }
            )
            if created:
                memberships_created += 1

        if memberships_created > 0:
            self.stdout.write(self.style.SUCCESS(f'✓ Created {memberships_created} workspace memberships'))
        else:
            self.stdout.write(self.style.WARNING('✓ All users already have workspace memberships'))

        self.stdout.write(self.style.SUCCESS('\n✓ Workspace initialization complete!'))
        self.stdout.write(self.style.SUCCESS(f'Default workspace: {workspace.name} ({workspace.code})'))
        self.stdout.write(self.style.SUCCESS(f'Total employees: {Employee.objects.filter(workspace=workspace).count()}'))
        self.stdout.write(self.style.SUCCESS(f'Total users with access: {WorkspaceMembership.objects.filter(workspace=workspace).count()}'))
