import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrms.settings')
django.setup()

from apps.core.models import WorkspaceMembership, User, Workspace
from django.utils import timezone

print("Starting membership fixes...")

# 1. DELETE Miniva's leo's investments membership (membership_id=2)
miniva_leos = WorkspaceMembership.objects.filter(id=2).first()
if miniva_leos:
    print(f"Deleting: {miniva_leos.user.username} from {miniva_leos.workspace.name}")
    miniva_leos.delete()
    print("✅ Deleted Miniva's leo's investments membership")
else:
    print("⚠️ Miniva's leo's membership not found")

# 2. UPDATE Twambo's leo's investments to NOT be default
twambo_leos = WorkspaceMembership.objects.filter(id=3).first()
if twambo_leos:
    print(f"Updating: {twambo_leos.user.username} - {twambo_leos.workspace.name} default=False")
    twambo_leos.is_default = False
    twambo_leos.save()
    print("✅ Set Twambo's leo's investments to non-default")
else:
    print("⚠️ Twambo's leo's membership not found")

# 3. INSERT Twambo to Field Consultant as OWNER with default=True
twambo = User.objects.get(id=1)
fc_workspace = Workspace.objects.get(id=2)

existing = WorkspaceMembership.objects.filter(user=twambo, workspace=fc_workspace).first()
if existing:
    print(f"⚠️ Twambo already has FC membership (id={existing.id}), updating...")
    existing.role = 'OWNER'
    existing.is_default = True
    existing.is_active = True
    existing.save()
    print("✅ Updated Twambo's FC membership to Owner/default")
else:
    new_membership = WorkspaceMembership.objects.create(
        user=twambo,
        workspace=fc_workspace,
        role='OWNER',
        is_default=True,
        is_active=True,
        joined_at=timezone.now()
    )
    print(f"✅ Created Twambo's FC membership (id={new_membership.id}) as Owner/default")

print("\n" + "="*60)
print("FINAL STATE:")
print("="*60)

for username in ['Miniva@26', 'Twambo@2342']:
    user = User.objects.get(username=username)
    print(f"\n{username}:")
    memberships = WorkspaceMembership.objects.filter(user=user).select_related('workspace').order_by('-is_default', 'workspace__name')
    for m in memberships:
        default_marker = " (DEFAULT)" if m.is_default else ""
        print(f"  - {m.workspace.name}: {m.role}{default_marker}")
