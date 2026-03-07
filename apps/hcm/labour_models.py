"""
Labour Recon Models (Headcount vs Budget by Position)
Matches LR sheets: position, budget, actual, variance, complement, comment.
"""

from django.db import models


class LabourRecon(models.Model):
    position = models.CharField(max_length=200, db_index=True)
    budget = models.IntegerField(default=0)
    actual = models.IntegerField(default=0)
    variance = models.IntegerField(default=0)
    complement = models.IntegerField(default=0)
    comment = models.TextField(blank=True)

    report_date = models.DateField(null=True, blank=True)
    department_name = models.CharField(max_length=200, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.position} Budget:{self.budget} Actual:{self.actual}"
