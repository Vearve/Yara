from django.contrib import admin
from .models import Site, SiteEmployee, SitePeriod


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = ['name', 'workspace', 'location', 'status', 'start_date', 'end_date']
    list_filter = ['status', 'workspace']
    search_fields = ['name', 'location']


@admin.register(SiteEmployee)
class SiteEmployeeAdmin(admin.ModelAdmin):
    list_display = ['employee', 'site', 'role_on_site', 'start_date', 'end_date', 'is_active']
    list_filter = ['is_active', 'site']
    search_fields = ['employee__first_name', 'employee__last_name']


@admin.register(SitePeriod)
class SitePeriodAdmin(admin.ModelAdmin):
    list_display = ['name', 'site', 'period_type', 'start_date', 'end_date', 'status']
    list_filter = ['status', 'period_type', 'site']
