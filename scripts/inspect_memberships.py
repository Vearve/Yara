import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrms.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from apps.core.models import WorkspaceMembership

User = get_user_model()
users = User.objects.all().order_by('username')

print('USERS:')
for u in users:
    print(f"- id={u.id} username={u.username} name={u.first_name} {u.last_name} email={u.email}")

print('\nMEMBERSHIPS:')
for u in users:
    memberships = WorkspaceMembership.objects.filter(user=u).select_related('workspace').order_by('-is_active', '-is_default', 'workspace__name')
    if not memberships:
        continue
    print(f"\n{u.username}")
    for m in memberships:
        print(
            f"  membership_id={m.id} workspace_id={m.workspace_id} workspace={m.workspace.name} "
            f"role={m.role} default={m.is_default} active={m.is_active}"
        )
