"""
Fix schedule events with NULL or incorrect workspace assignments.
Run this with: python manage.py shell < scripts/fix_schedule_workspaces.py
"""

from apps.activities.models import ScheduleEvent
from apps.core.models import Workspace

# Count events with NULL workspace
null_count = ScheduleEvent.objects.filter(workspace__isnull=True).count()
print(f"Found {null_count} schedule events with NULL workspace")

if null_count > 0:
    print("\nDeleting orphaned schedule events with NULL workspace...")
    deleted = ScheduleEvent.objects.filter(workspace__isnull=True).delete()
    print(f"Deleted {deleted[0]} orphaned schedule events")
else:
    print("No orphaned schedule events found - all good!")

# Show workspace distribution
print("\n=== Schedule Events by Workspace ===")
workspaces = Workspace.objects.all()
for ws in workspaces:
    count = ScheduleEvent.objects.filter(workspace=ws).count()
    print(f"{ws.name}: {count} events")

print("\n✓ Schedule workspace cleanup complete!")
