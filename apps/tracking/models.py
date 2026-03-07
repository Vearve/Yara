"""
Tracking Models
Tracks trainings, medicals, permits, probation periods, and compliance expiries.
"""

from django.db import models
from django.utils import timezone
from apps.hcm.models import Employee


class TrainingType(models.Model):
    """Training type classification."""
    CATEGORIES = [
        ('ADMINISTRATIVE', 'Administrative'),
        ('THIRD_PARTY', 'Third-Party Certified'),
        ('DRILL', 'Drill'),
    ]
    
    name = models.CharField(max_length=200, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORIES)
    description = models.TextField(blank=True)
    requires_certification = models.BooleanField(default=False)
    default_validity_months = models.IntegerField(null=True, blank=True)
    
    class Meta:
        verbose_name_plural = "Training Types"
    
    def __str__(self):
        return f"{self.name} ({self.category})"


class Training(models.Model):
    """Employee training record."""
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='trainings')
    training_type = models.ForeignKey(TrainingType, on_delete=models.PROTECT)
    
    provider = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    
    # Dates
    scheduled_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    # Details
    certificate_number = models.CharField(max_length=100, blank=True)
    certificate_document = models.FileField(upload_to='training_certs/', blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-issue_date']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['expiry_date']),
        ]
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.training_type.name}"
    
    @property
    def is_expired(self):
        if self.expiry_date:
            return self.expiry_date < timezone.now().date()
        return False
    
    @property
    def days_until_expiry(self):
        if self.expiry_date:
            delta = self.expiry_date - timezone.now().date()
            return delta.days
        return None


class MedicalType(models.Model):
    """Medical exam types: Silicosis, Physical, etc."""
    TYPES = [
        ('SILICOSIS', 'Silicosis'),
        ('PHYSICAL', 'Physical Examination'),
        ('BASELINE', 'Baseline Medical'),
        ('EXIT', 'Exit Medical'),
    ]
    
    name = models.CharField(max_length=100, choices=TYPES, unique=True)
    description = models.TextField(blank=True)
    frequency_months = models.IntegerField(null=True, blank=True, help_text="Frequency in months for mandatory re-tests")
    
    class Meta:
        verbose_name_plural = "Medical Types"
    
    def __str__(self):
        return self.name


class Medical(models.Model):
    """Employee medical record."""
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('COMPLETED', 'Completed'),
        ('CLEARED', 'Cleared'),
        ('RESTRICTED', 'Restricted'),
        ('NOT_CLEARED', 'Not Cleared'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='medicals')
    medical_type = models.CharField(max_length=100, help_text="Type of medical examination (e.g., Silicosis, Physical Examination)")
    
    scheduled_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    facility = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    
    # Results
    clearance_status = models.CharField(max_length=50, blank=True)
    findings = models.TextField(blank=True)
    restrictions = models.TextField(blank=True, help_text="Any work restrictions")
    report_document = models.FileField(upload_to='medical_reports/', blank=True)
    
    # Expiry
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-completion_date']
        indexes = [
            models.Index(fields=['employee', 'medical_type']),
            models.Index(fields=['expiry_date']),
        ]
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.medical_type}"
    
    @property
    def is_expired(self):
        if self.expiry_date:
            return self.expiry_date < timezone.now().date()
        return False
    
    @property
    def days_until_expiry(self):
        if self.expiry_date:
            delta = self.expiry_date - timezone.now().date()
            return delta.days
        return None


class PermitType(models.Model):
    """Permit types: Site, Pit, IBF, Initial, Leo, etc."""
    TYPES = [
        ('SITE', 'Site Permit'),
        ('PIT', 'Pit Entry'),
        ('IBF', 'IBF'),
        ('INITIAL', 'Initial Entry'),
        ('LEO', 'LEO Induction'),
    ]
    
    name = models.CharField(max_length=100, choices=TYPES, unique=True)
    description = models.TextField(blank=True)
    validity_months = models.IntegerField(null=True, blank=True)
    
    class Meta:
        verbose_name_plural = "Permit Types"
    
    def __str__(self):
        return self.name


class Permit(models.Model):
    """Employee permits/inductions."""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ISSUED', 'Issued'),
        ('EXPIRED', 'Expired'),
        ('RENEWED', 'Renewed'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='permits')
    permit_type = models.ForeignKey(PermitType, on_delete=models.PROTECT)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    issue_date = models.DateField()
    expiry_date = models.DateField()
    
    permit_number = models.CharField(max_length=100, blank=True)
    document = models.FileField(upload_to='permits/', blank=True)
    issued_by = models.CharField(max_length=200, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-issue_date']
        indexes = [
            models.Index(fields=['employee', 'permit_type']),
            models.Index(fields=['expiry_date']),
        ]
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.permit_type.name}"
    
    @property
    def is_expired(self):
        return self.expiry_date < timezone.now().date()
    
    @property
    def days_until_expiry(self):
        delta = self.expiry_date - timezone.now().date()
        return delta.days


class Probation(models.Model):
    """Probation period tracking."""
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('EXTENDED', 'Extended'),
    ]
    
    DECISION_CHOICES = [
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('PENDING', 'Pending'),
    ]
    
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='probation')
    
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Decision
    decision = models.CharField(max_length=20, choices=DECISION_CHOICES, default='PENDING')
    decision_date = models.DateField(null=True, blank=True)
    decision_remarks = models.TextField(blank=True)
    decided_by = models.CharField(max_length=200, blank=True)
    
    # Extension (if needed)
    extension_end_date = models.DateField(null=True, blank=True)
    extension_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.employee.full_name} - Probation"
    
    @property
    def is_active(self):
        return self.status == 'ACTIVE' and self.end_date >= timezone.now().date()
    
    @property
    def days_remaining(self):
        end = self.extension_end_date or self.end_date
        delta = end - timezone.now().date()
        return delta.days


class ComplianceAlert(models.Model):
    """Compliance alerts for expiring items."""
    ALERT_TYPES = [
        ('TRAINING', 'Training Expiry'),
        ('MEDICAL', 'Medical Expiry'),
        ('PERMIT', 'Permit Expiry'),
        ('CONTRACT', 'Contract Expiry'),
        ('PROBATION', 'Probation Due'),
    ]
    
    STATUSES = [
        ('ACTIVE', 'Active'),
        ('ACKNOWLEDGED', 'Acknowledged'),
        ('RESOLVED', 'Resolved'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='compliance_alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    status = models.CharField(max_length=20, choices=STATUSES, default='ACTIVE')
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateField()
    
    # Link to specific record
    content_type = models.CharField(max_length=50, blank=True)  # e.g., 'Training', 'Medical'
    object_id = models.IntegerField(blank=True, null=True)
    
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    acknowledged_by = models.CharField(max_length=200, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['due_date']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.alert_type}"
