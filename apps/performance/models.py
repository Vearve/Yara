from django.db import models
from django.utils import timezone
from apps.hcm.models import Employee

class KPI(models.Model):
    """Key Performance Indicator tracking"""
    name = models.CharField(max_length=100)
    value = models.FloatField()
    target = models.FloatField(null=True, blank=True)
    period_start = models.DateField()
    period_end = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name', 'period_start']),
        ]

    def __str__(self):
        return f"{self.name} - {self.value}"
