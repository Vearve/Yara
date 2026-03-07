import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrms.settings')
django.setup()

from apps.core.models import WorkspaceMembership

memberships = WorkspaceMembership.objects.filter(
    user__username__in=['miniva', 'twambo']
).select_related('user', 'workspace').order_by('user__username', '-is_default')

print("\nCurrent Workspace Memberships:")
print("-" * 80)
for m in memberships:
    print(f"{m.user.username:10} | {m.workspace.name:30} | {m.role:10} | Default: {m.is_default}")
