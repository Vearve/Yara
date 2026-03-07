"""
Management command to create demo users (regular + superuser).
Use this after seeding workspaces to ensure demo accounts work.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create demo users for testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Creating demo users...'))

        # Create/update regular demo user
        demo_user, created = User.objects.get_or_create(
            username='demo',
            defaults={
                'email': 'demo@yara.com',
                'first_name': 'Demo',
                'last_name': 'User'
            }
        )
        
        # Always update password to ensure it's set correctly
        demo_user.set_password('demo123')
        demo_user.is_active = True
        demo_user.save()
        
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created demo user'))
        else:
            self.stdout.write(self.style.SUCCESS('✓ Updated demo user password'))

        # Create/update superuser for admin access
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@yara.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        
        admin_user.set_password('admin123')
        admin_user.is_active = True
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created admin superuser'))
        else:
            self.stdout.write(self.style.SUCCESS('✓ Updated admin password'))

        self.stdout.write(self.style.SUCCESS('\n✅ Demo users created successfully!'))
        self.stdout.write(self.style.WARNING('\nAvailable login credentials:'))
        self.stdout.write('  Regular User:')
        self.stdout.write('    Username: demo')
        self.stdout.write('    Password: demo123')
        self.stdout.write('\n  Admin Superuser:')
        self.stdout.write('    Username: admin')
        self.stdout.write('    Password: admin123')
        self.stdout.write('\n  Admin Panel: http://localhost:8000/admin/')
