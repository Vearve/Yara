import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrms.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from apps.core.models import WorkspaceMembership

User = get_user_model()
needle_terms = ['twambo', 'miniva', 'leo', 'zhen', 'field', 'consult']

qs = User.objects.all().order_by('username')
filtered = [
    u for u in qs
    if any(term in (u.username or '').lower() or term in (u.first_name or '').lower() or term in (u.last_name or '').lower() for term in needle_terms)
]

print('MATCHED USERS:')
for u in filtered:
    print(f"- id={u.id} username={u.username} name={u.first_name} {u.last_name} email={u.email}")

print('\nMEMBERSHIPS:')
for u in filtered:
    memberships = WorkspaceMembership.objects.filter(user=u).select_related('workspace').order_by('-is_active', '-is_default', 'workspace__name')
    print(f"\n{u.username} ({u.first_name} {u.last_name})")
    if not memberships:
        print('  (no memberships)')
        continue
    for m in memberships:
        print(
            f"  membership_id={m.id} workspace_id={m.workspace_id} workspace={m.workspace.name} "
            f"type={m.workspace.workspace_type} role={m.role} default={m.is_default} active={m.is_active}"
        )
