"""
Management command to fix workspace access issues
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.core.models import Workspace, WorkspaceMembership


class Command(BaseCommand):
    help = 'Add user to all workspaces'
    requires_system_checks = []  # Skip system checks

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='User email address')

    def handle(self, *args, **options):
        user_email = options.get('email') or 'hr.lumwana@leosinvestments.com'
        
        # Get the user
        try:
            user = User.objects.get(email=user_email)
            self.stdout.write(self.style.SUCCESS(f'✓ Found user: {user.username} ({user.email})'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'✗ User with email "{user_email}" not found!'))
            self.stdout.write('\nAvailable users:')
            for u in User.objects.all()[:10]:
                self.stdout.write(f'  - {u.username} ({u.email})')
            return

        # Get all workspaces
        workspaces = Workspace.objects.filter(is_active=True)
        self.stdout.write(f'\n✓ Found {workspaces.count()} active workspaces:')
        for ws in workspaces:
            self.stdout.write(f'  - {ws.code}: {ws.name}')

        # Check existing memberships
        existing = WorkspaceMembership.objects.filter(user=user, is_active=True)
        self.stdout.write(f'\n✓ User already has {existing.count()} workspace membership(s):')
        for mem in existing:
            self.stdout.write(f'  - {mem.workspace.code}: {mem.workspace.name} (Role: {mem.role})')

        # Add user to all workspaces they don't have access to
        added = 0
        for workspace in workspaces:
            membership, created = WorkspaceMembership.objects.get_or_create(
                user=user,
                workspace=workspace,
                defaults={
                    'role': 'ADMIN',
                    'is_active': True,
                    'is_default': (added == 0)
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'\n✓ Added {user.username} to {workspace.name} as ADMIN'))
                added += 1
            else:
                if not membership.is_active:
                    membership.is_active = True
                    membership.save()
                    self.stdout.write(self.style.SUCCESS(f'\n✓ Reactivated {user.username}\'s access to {workspace.name}'))
                    added += 1
                else:
                    self.stdout.write(f'- {user.username} already has access to {workspace.name}')

        if added > 0:
            self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully added/updated {added} workspace membership(s)!'))
            self.stdout.write('\nThe user should now see all workspaces when they log in.')
        else:
            self.stdout.write(self.style.SUCCESS('\n✓ User already has access to all workspaces.'))

        self.stdout.write('\n' + '='*60)
        self.stdout.write('If you still don\'t see workspaces in the frontend:')
        self.stdout.write('1. Clear browser cache and cookies')
        self.stdout.write('2. Log out and log back in')
        self.stdout.write('3. Check the JWT token includes workspace data')
        self.stdout.write('='*60)
