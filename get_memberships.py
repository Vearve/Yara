import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrms.settings')
django.setup()

from apps.core.models import WorkspaceMembership

print("=" * 60)
print("CURRENT WORKSPACE MEMBERSHIPS")
print("=" * 60)

for m in WorkspaceMembership.objects.filter(
    user__username__in=['miniva', 'twambo']
).select_related('user', 'workspace').order_by('user__username', 'workspace__name'):
    print(f"User: {m.user.username}")
    print(f"  Workspace: {m.workspace.name} (ID: {m.workspace.id})")
    print(f"  Role: {m.role}")
    print(f"  Is Default: {m.is_default}")
    print(f"  Is Active: {m.is_active}")
    print("-" * 60)
