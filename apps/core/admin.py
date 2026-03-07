"""
Django Admin for Core models: Workspace, WorkspaceMembership
"""

from django.contrib import admin
from .models import Workspace, WorkspaceMembership


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'workspace_type', 'is_active', 'created_at']
    list_filter = ['workspace_type', 'is_active', 'industry']
    search_fields = ['name', 'code', 'contact_email']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'code', 'workspace_type', 'industry', 'description')
        }),
        ('Contact', {
            'fields': ('contact_email', 'contact_phone', 'address')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(WorkspaceMembership)
class WorkspaceMembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'workspace', 'role', 'is_default', 'is_active', 'joined_at']
    list_filter = ['role', 'is_active', 'is_default', 'workspace']
    search_fields = ['user__username', 'user__email', 'workspace__name']
    readonly_fields = ['joined_at']
    autocomplete_fields = ['user', 'workspace', 'invited_by']
