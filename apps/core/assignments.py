"""
Assignment Model
Links employees to sites, projects, clients, and departments.
"""

from django.db import models
from apps.core.models import Workspace


class Site(models.Model):
    """Physical work site/location."""
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='sites',
        null=True,
        blank=True,
        help_text="Organization that owns this site"
    )
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50)
    location = models.CharField(max_length=300)
    address = models.TextField(blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Sites"
        unique_together = [('workspace', 'code'), ('workspace', 'name')]
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class Project(models.Model):
    """Simple project/initiative tracker."""
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='projects',
        null=True,
        blank=True,
        help_text="Organization/workspace this project belongs to"
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=50, choices=[
        ('PLANNING', 'Planning'),
        ('ACTIVE', 'Active'),
        ('ON_HOLD', 'On Hold'),
        ('COMPLETED', 'Completed'),
    ], default='ACTIVE')
    
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    progress = models.PositiveSmallIntegerField(default=0)
    team_members = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Projects"
    
    def __str__(self):
        return self.name


class Client(models.Model):
    """Client company (e.g., mining company for contractors)."""
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='clients',
        null=True,
        blank=True,
        help_text="Organization managing this client relationship"
    )
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50)
    industry = models.CharField(max_length=200, blank=True)
    contact_person = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Clients"
        unique_together = [('workspace', 'code'), ('workspace', 'name')]
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class Assignment(models.Model):
    """
    Employee assignment to site/project/client.
    Tracks who is assigned to where and when.
    """
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('SUSPENDED', 'Suspended'),
        ('ENDED', 'Ended'),
    ]
    
    employee = models.ForeignKey('hcm.Employee', on_delete=models.CASCADE, related_name='assignments')
    
    # Assignment targets
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='assignments')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='assignments')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='assignments', help_text="Client paying for/receiving contractor")
    
    # Assignment status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Dates
    assignment_start_date = models.DateField()
    assignment_end_date = models.DateField(null=True, blank=True)
    
    # Role/Details
    role_at_site = models.CharField(max_length=200, blank=True, help_text="Role specific to this assignment")
    shift = models.CharField(max_length=50, blank=True, help_text="e.g., Day, Night, Rotating")
    
    # Visibility
    visible_to_client = models.BooleanField(default=True, help_text="Can client see this assignment?")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-assignment_start_date']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['site', 'client']),
            models.Index(fields=['assignment_end_date']),
        ]
        unique_together = [['employee', 'site', 'client', 'assignment_start_date']]
    
    def __str__(self):
        return f"{self.employee.full_name} → {self.site.name} ({self.client.name})"
    
    @property
    def is_current(self):
        from django.utils import timezone
        today = timezone.now().date()
        if self.assignment_end_date:
            return self.assignment_start_date <= today <= self.assignment_end_date
        return self.assignment_start_date <= today
