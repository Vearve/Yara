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
from apps.core.models import Workspace, WorkspaceMembership

User = get_user_model()

miniva = User.objects.get(username='Miniva@26')
twambo = User.objects.get(username='Twambo@2342')

field_ws = Workspace.objects.get(name='Field Consaultant')
leos_ws = Workspace.objects.get(name="leo's  investments LTD")
zhen_ws = Workspace.objects.get(name='Zhen Jun')

# 1) Miniva should only have Field + Leos active. Deactivate Zhen Jun.
WorkspaceMembership.objects.filter(user=miniva, workspace=zhen_ws).update(is_active=False, is_default=False)

# 2) Ensure Twambo has Field membership.
tw_field, created = WorkspaceMembership.objects.get_or_create(
    user=twambo,
    workspace=field_ws,
    defaults={
        'role': 'OWNER',
        'is_active': True,
        'is_default': False,
        'invited_by': miniva,
    },
)

if not created:
    tw_field.is_active = True
    if not tw_field.role:
        tw_field.role = 'OWNER'
    tw_field.save(update_fields=['is_active', 'role'])

# 3) Ensure Twambo Leos membership remains active but not default.
WorkspaceMembership.objects.filter(user=twambo, workspace=leos_ws).update(is_active=True, is_default=False)

# 4) Make Field default for Twambo (model save enforces single default).
tw_field.is_default = True
tw_field.save(update_fields=['is_default'])

# Print final state
for user in [miniva, twambo]:
    ms = WorkspaceMembership.objects.filter(user=user).select_related('workspace').order_by('-is_active', '-is_default', 'workspace__name')
    print(f"\n{user.username} memberships:")
    for m in ms:
        print(
            f"  membership_id={m.id} workspace_id={m.workspace_id} workspace={m.workspace.name} "
            f"role={m.role} default={m.is_default} active={m.is_active}"
        )
