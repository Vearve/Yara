#!/usr/bin/env python
"""
Setup script to create a test user for load testing.
Run: python manage.py shell < setup_load_test_user.py
Or call directly: python setup_load_test_user.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrms.settings')
django.setup()

from django.contrib.auth.models import User
from apps.core.models import Workspace, WorkspaceMembership

def create_test_user():
    """Create or update test user for load testing."""
    username = 'loadtest'
    password = 'loadtest123'
    email = 'loadtest@hrms.local'
    
    # Create user
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'first_name': 'Load',
            'last_name': 'Test',
        }
    )
    
    if created:
        print(f"✓ Created test user: {username}")
        user.set_password(password)
        user.save()
        print(f"  Password: {password}")
    else:
        print(f"✓ Test user already exists: {username}")
        user.set_password(password)
        user.save()
        print(f"  Password reset to: {password}")
    
    # Ensure user has workspace assignment for workspace-scoped endpoints
    try:
        workspace = Workspace.objects.first()
        if not workspace:
            workspace = Workspace.objects.create(
                name='Load Test Workspace',
                code='LOADTEST',
                workspace_type='COMPANY',
                is_active=True,
                created_by=user,
            )
            print(f"✓ Created workspace: {workspace.name}")

        membership, membership_created = WorkspaceMembership.objects.get_or_create(
            user=user,
            workspace=workspace,
            defaults={
                'role': 'ADMIN',
                'is_active': True,
                'is_default': True,
            }
        )

        if not membership_created:
            membership.role = 'ADMIN'
            membership.is_active = True
            if not WorkspaceMembership.objects.filter(user=user, is_default=True).exclude(pk=membership.pk).exists():
                membership.is_default = True
            membership.save()

        print(f"✓ Workspace membership active: {workspace.name} ({membership.role})")
    except Exception as e:
        print(f"! Could not assign to workspace: {e}")
    
    print(f"\n✓ Test user setup complete!")
    print(f"\nUse the following credentials for load testing:")
    print(f"  Username: {username}")
    print(f"  Password: {password}")
    print(f"\nExample load test command:")
    print(f"  python load_test.py http://localhost:8000 {username} {password} 50")


if __name__ == '__main__':
    create_test_user()
