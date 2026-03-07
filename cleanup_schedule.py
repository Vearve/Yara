#!/usr/bin/env python
"""Cleanup script to fix schedule events with NULL workspace."""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hrms.settings')
django.setup()

from apps.activities.models import ScheduleEvent
from apps.core.models import Workspace

# Count events with NULL workspace
null_count = ScheduleEvent.objects.filter(workspace__isnull=True).count()
total_count = ScheduleEvent.objects.count()

print(f"\n{'='*60}")
print(f"Schedule Events Analysis")
print(f"{'='*60}")
print(f"Total schedule events: {total_count}")
print(f"Events with NULL workspace: {null_count}")
print(f"Events with workspace assigned: {total_count - null_count}")

if null_count > 0:
    print(f"\n{'='*60}")
    print("Orphaned Events (NULL workspace):")
    print(f"{'='*60}")
    orphaned = ScheduleEvent.objects.filter(workspace__isnull=True)
    for event in orphaned[:10]:  # Show first 10
        print(f"  ID: {event.id}, Title: {event.title}, Date: {event.date}, Type: {event.type}")
    
    if null_count > 10:
        print(f"  ... and {null_count - 10} more")
    
    print(f"\n{'='*60}")
    print("Available Workspaces:")
    print(f"{'='*60}")
    workspaces = Workspace.objects.all()
    for ws in workspaces:
        print(f"  ID: {ws.id}, Code: {ws.code}, Name: {ws.name}")
    
    # Delete orphaned events (safer than assigning to random workspace)
    print(f"\n{'='*60}")
    print("Action: Deleting orphaned schedule events...")
    print(f"{'='*60}")
    deleted_count, _ = ScheduleEvent.objects.filter(workspace__isnull=True).delete()
    print(f"✓ Deleted {deleted_count} orphaned schedule events")
    print("\nThese events had no workspace context and shouldn't appear in any workspace.")
    print("Users should recreate them in the correct workspace if needed.")
else:
    print("\n✓ All schedule events have workspace assigned. No cleanup needed.")

print(f"\n{'='*60}\n")
