"""
HCM (Human Capital Management) Models
Covers employees, contracts, engagements, terminations, and employment categories.
"""

from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.core.models import Workspace


class EmployeeCategory(models.Model):
    """Employee category: Junior, Senior, Management, etc."""
    CATEGORY_CHOICES = [
        ('JUNIOR', 'Junior'),
        ('SENIOR', 'Senior'),
        ('MANAGEMENT', 'Management'),
        ('EXECUTIVE', 'Executive'),
    ]
    
    name = models.CharField(max_length=100, choices=CATEGORY_CHOICES, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Employee Categories"
    
    def __str__(self):
        return self.name


class EmployeeClassification(models.Model):
    """Employee classification: Local, Regional, National, Expatriate"""
    CLASSIFICATION_CHOICES = [
        ('LOCAL', 'Local'),
        ('REGIONAL', 'Regional'),
        ('NATIONAL', 'National'),
        ('EXPATRIATE', 'Expatriate'),
    ]
    
    name = models.CharField(max_length=100, choices=CLASSIFICATION_CHOICES, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Employee Classifications"
    
    def __str__(self):
        return self.name


class EmploymentType(models.Model):
    """Employment type: Direct, Contractor, etc."""
    TYPES = [
        ('DIRECT', 'Direct Employee'),
        ('CONTRACTOR', 'Contractor'),
        ('CONSULTANT', 'Consultant'),
        ('TEMPORARY', 'Temporary'),
    ]
    
    name = models.CharField(max_length=50, choices=TYPES, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Employment Types"
    
    def __str__(self):
        return self.name


class ContractType(models.Model):
    """Contract type: Permanent, Fixed-term, Probation, etc."""
    TYPES = [
        ('PERMANENT', 'Permanent'),
        ('FIXED_TERM', 'Fixed-Term'),
        ('PROBATION', 'Probation'),
        ('SHORT_TERM', 'Short-Term'),
        ('VERBAL', 'Verbal Agreement'),
        ('TEMPORARY', 'Temporary'),
        ('SEASONAL', 'Seasonal'),
        ('CONSULTANT', 'Consultant'),
    ]
    
    name = models.CharField(max_length=50, choices=TYPES, unique=True)
    default_duration_months = models.IntegerField(null=True, blank=True, help_text="Default duration for this contract type")
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Contract Types"
    
    def __str__(self):
        return self.get_name_display()


class TerminationReason(models.Model):
    """Termination reason: Resignation, Redundancy, Retirement, Terminated, etc."""
    REASONS = [
        ('RESIGNATION', 'Resignation'),
        ('REDUNDANCY', 'Redundancy'),
        ('RETIREMENT', 'Retirement'),
        ('TERMINATED', 'Terminated'),
        ('ENDED', 'Contract Ended'),
        ('DECEASED', 'Deceased'),
        ('OTHER', 'Other'),
    ]
    
    name = models.CharField(max_length=100, choices=REASONS, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Termination Reasons"
    
    def __str__(self):
        return self.name


class Department(models.Model):
    """Departments within a company."""
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='departments',
        null=True,
        blank=True,
        help_text="Organization/workspace this department belongs to"
    )
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    manager = models.ForeignKey('Employee', null=True, blank=True, on_delete=models.SET_NULL, related_name='managed_departments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Departments"
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class Job(models.Model):
    """Job titles attached to a department."""
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('department', 'title')]
        ordering = ['title']

    def __str__(self):
        return f"{self.department.code} - {self.title}"


class Employee(models.Model):
    """Core Employee Model"""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('OTHER', 'Other'),
    ]
    
    EMPLOYMENT_STATUS = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('SUSPENDED', 'Suspended'),
        ('ON_LEAVE', 'On Leave'),
        ('TERMINATED', 'Terminated'),
    ]
    
    RESIDENCY_CHOICES = [
        ('KITWE', 'Kitwe'),
        ('CHINGOLA', 'Chingola'),
        ('NKANA', 'Nkana'),
        ('OTHER', 'Other'),
    ]
    
    CONTRACTOR_TYPE_CHOICES = [
        ('PERMANENT', 'Permanent Staff'),
        ('CONTRACT', 'Contract Staff'),
        ('CONTRACTOR', 'External Contractor'),
        ('CONSULTANT', 'Consultant'),
        ('TEMPORARY', 'Temporary'),
    ]
    
    # ============================================
    # WORKSPACE & MULTI-TENANT
    # ============================================
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='employees',
        null=True,
        blank=True,
        help_text="Organization/company this employee belongs to"
    )
    
    # For contractors: which contractor firm do they actually work for?
    contractor_company = models.ForeignKey(
        Workspace,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deployed_contractors',
        help_text="Contractor firm this person works for (if external contractor)"
    )
    
    contractor_type = models.CharField(
        max_length=20,
        choices=CONTRACTOR_TYPE_CHOICES,
        default='PERMANENT',
        help_text="Employment classification"
    )
    
    # Identity
    employee_id = models.CharField(max_length=50, unique=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    nrc = models.CharField(max_length=50, unique=True, help_text="National Registration Card")
    nrc_number = models.CharField(max_length=50, blank=True, help_text="NRC unique portion")
    passport = models.CharField(max_length=50, blank=True)
    tpin = models.CharField(max_length=50, unique=True, blank=True, null=True, help_text="Tax PIN")
    nhima = models.CharField(max_length=50, blank=True, help_text="National Health Insurance Management Authority")
    sss_number = models.CharField(max_length=50, blank=True, help_text="S/S Number")
    napsa_number = models.CharField(max_length=50, blank=True, help_text="NAPSA membership number")
    
    # Personal Details
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    nationality = models.CharField(max_length=100, default='Zambian')
    
    # Photo
    photo = models.ImageField(upload_to='employee_photos/', blank=True)
    
    # Contact
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    house_address = models.TextField()
    residential_area = models.CharField(max_length=100, choices=RESIDENCY_CHOICES, default='OTHER')
    
    # Employment Details
    employment_type = models.ForeignKey(EmploymentType, on_delete=models.PROTECT)
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS, default='ACTIVE')
    job_title = models.CharField(max_length=200)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    category = models.ForeignKey(EmployeeCategory, on_delete=models.SET_NULL, null=True, blank=True, help_text="Junior/Senior/Management")
    classification = models.ForeignKey(EmployeeClassification, on_delete=models.SET_NULL, null=True, blank=True, help_text="Local/Regional/National/Expatriate")
    point_of_hire = models.CharField(max_length=100, blank=True)
    
    # Dates
    hire_date = models.DateField(db_index=True)
    
    # Next of Kin
    next_of_kin_name = models.CharField(max_length=200, blank=True)
    next_of_kin_relationship = models.CharField(max_length=100, blank=True)
    next_of_kin_phone = models.CharField(max_length=20, blank=True)
    
    # System
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, related_name='employees_created')
    
    class Meta:
        ordering = ['employee_id']
        indexes = [
            models.Index(fields=['employment_status', 'hire_date']),
            models.Index(fields=['department', 'employment_status']),
        ]
    
    def __str__(self):
        return f"{self.employee_id} - {self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Contract(models.Model):
    """Employment Contract"""
    CONTRACT_STATUS = [
        ('ACTIVE', 'Active'),
        ('EXPIRED', 'Expired'),
        ('RENEWED', 'Renewed'),
        ('TERMINATED', 'Terminated'),
        ('PENDING_RENEWAL', 'Pending Renewal'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='contracts')
    contract_type = models.ForeignKey(ContractType, on_delete=models.PROTECT)
    contract_number = models.CharField(max_length=100, unique=True)
    
    # Dates
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    duration_months = models.IntegerField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=CONTRACT_STATUS, default='ACTIVE')
    
    # Terms
    salary_currency = models.CharField(max_length=3, default='ZMW')
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Documents
    document_url = models.URLField(blank=True, help_text="Link to contract document")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['end_date']),
        ]
    
    def __str__(self):
        return f"{self.contract_number} - {self.employee.full_name}"
    
    @property
    def is_expired(self):
        if self.end_date:
            return self.end_date < timezone.now().date()
        return False
    
    @property
    def days_until_expiry(self):
        if self.end_date:
            delta = self.end_date - timezone.now().date()
            return delta.days
        return None


class EmployeeDocument(models.Model):
    """Employee documents such as CVs, certificates, IDs."""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=200, blank=True)
    file = models.FileField(upload_to='employee_documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.title or 'Document'}"


class ContractorCompliance(models.Model):
    """
    Track compliance requirements for external contractors.
    Ensures contractors meet safety, legal, and operational requirements.
    """
    COMPLIANCE_STATUS_CHOICES = [
        ('COMPLIANT', 'Compliant'),
        ('EXPIRING_SOON', 'Expiring Soon'),
        ('NON_COMPLIANT', 'Non-Compliant'),
        ('PENDING_REVIEW', 'Pending Review'),
    ]
    
    # Links
    contractor = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='compliance_records',
        limit_choices_to={'contractor_type': 'CONTRACTOR'}
    )
    client_workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='contractor_compliance',
        help_text="Client site where contractor is deployed"
    )
    
    # Compliance Documents & Status
    work_permit_valid = models.BooleanField(default=False)
    work_permit_number = models.CharField(max_length=100, blank=True)
    work_permit_expiry = models.DateField(null=True, blank=True)
    
    safety_induction_completed = models.BooleanField(default=False)
    safety_induction_date = models.DateField(null=True, blank=True)
    safety_induction_valid_until = models.DateField(null=True, blank=True)
    
    medical_clearance_valid = models.BooleanField(default=False)
    medical_clearance_date = models.DateField(null=True, blank=True)
    medical_clearance_expiry = models.DateField(null=True, blank=True)
    
    insurance_valid = models.BooleanField(default=False)
    insurance_provider = models.CharField(max_length=200, blank=True)
    insurance_policy_number = models.CharField(max_length=100, blank=True)
    insurance_expiry = models.DateField(null=True, blank=True)
    
    # Background checks
    police_clearance_valid = models.BooleanField(default=False)
    police_clearance_date = models.DateField(null=True, blank=True)
    
    # Overall status
    compliance_status = models.CharField(
        max_length=20,
        choices=COMPLIANCE_STATUS_CHOICES,
        default='PENDING_REVIEW'
    )
    notes = models.TextField(blank=True, help_text="Additional compliance notes")
    
    # Metadata
    last_checked = models.DateTimeField(auto_now=True)
    checked_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Contractor Compliance Records"
        unique_together = [('contractor', 'client_workspace')]
        ordering = ['-last_checked']
    
    def __str__(self):
        return f"{self.contractor.full_name} @ {self.client_workspace.name} - {self.compliance_status}"
    
    def update_compliance_status(self):
        """Auto-calculate compliance status based on document validity"""
        from datetime import date, timedelta
        today = date.today()
        warning_days = 30  # Days before expiry to show warning
        
        # Check if any required documents are expired or missing
        expired = []
        expiring_soon = []
        
        if not self.work_permit_valid or (self.work_permit_expiry and self.work_permit_expiry < today):
            expired.append('work_permit')
        elif self.work_permit_expiry and self.work_permit_expiry < today + timedelta(days=warning_days):
            expiring_soon.append('work_permit')
        
        if not self.medical_clearance_valid or (self.medical_clearance_expiry and self.medical_clearance_expiry < today):
            expired.append('medical')
        elif self.medical_clearance_expiry and self.medical_clearance_expiry < today + timedelta(days=warning_days):
            expiring_soon.append('medical')
        
        if not self.insurance_valid or (self.insurance_expiry and self.insurance_expiry < today):
            expired.append('insurance')
        elif self.insurance_expiry and self.insurance_expiry < today + timedelta(days=warning_days):
            expiring_soon.append('insurance')
        
        if not self.safety_induction_completed:
            expired.append('safety_induction')
        elif self.safety_induction_valid_until and self.safety_induction_valid_until < today:
            expired.append('safety_induction')
        elif self.safety_induction_valid_until and self.safety_induction_valid_until < today + timedelta(days=warning_days):
            expiring_soon.append('safety_induction')
        
        # Set status
        if expired:
            self.compliance_status = 'NON_COMPLIANT'
        elif expiring_soon:
            self.compliance_status = 'EXPIRING_SOON'
        else:
            self.compliance_status = 'COMPLIANT'
        
        self.save()


class Engagement(models.Model):
    """Track when an employee was engaged/joined."""
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='engagement')
    engagement_date = models.DateField()
    contract_type = models.ForeignKey(ContractType, on_delete=models.PROTECT, null=True, blank=True)
    contract_duration_months = models.IntegerField(null=True, blank=True)
    initial_contract_end_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.employee.full_name} - Engaged {self.engagement_date}"


class Termination(models.Model):
    """Track when an employee was terminated/left."""
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='termination')
    termination_date = models.DateField()
    termination_reason = models.ForeignKey(TerminationReason, on_delete=models.PROTECT)
    payroll_final = models.BooleanField(default=False, help_text="Final payroll processed")
    comments = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-termination_date']
    
    def __str__(self):
        return f"{self.employee.full_name} - Terminated {self.termination_date}"


# Signal handlers for automatic employee status updates
@receiver(post_save, sender=Termination)
def update_employee_status_on_termination(sender, instance, created, **kwargs):
    """Update employee status to TERMINATED when termination record is created or updated."""
    employee = instance.employee
    employee.employment_status = 'TERMINATED'
    employee.save(update_fields=['employment_status', 'updated_at'])


@receiver(post_delete, sender=Termination)
def revert_employee_status_on_termination_delete(sender, instance, **kwargs):
    """Revert employee status to ACTIVE when termination record is deleted."""
    employee = instance.employee
    employee.employment_status = 'ACTIVE'
    employee.save(update_fields=['employment_status', 'updated_at'])


@receiver(post_save, sender=Engagement)
def create_or_update_contract_on_engagement(sender, instance, created, **kwargs):
    """
    Create or update a Contract record when an Engagement is created or updated.
    This ensures contract data is available in Contract Schedule.
    """
    engagement = instance
    employee = engagement.employee
    
    # Generate contract number if not exists
    contract_number = f"CONT-{employee.id}-{engagement.id}"
    
    # Get or create contract
    contract, created_contract = Contract.objects.get_or_create(
        employee=employee,
        defaults={
            'contract_number': contract_number,
            'contract_type': engagement.contract_type,
            'start_date': engagement.engagement_date,
            'end_date': engagement.initial_contract_end_date,
            'duration_months': engagement.contract_duration_months,
            'status': 'ACTIVE',
        }
    )
    
    # If contract exists, update it
    if not created_contract:
        contract.contract_type = engagement.contract_type
        contract.start_date = engagement.engagement_date
        contract.end_date = engagement.initial_contract_end_date
        contract.duration_months = engagement.contract_duration_months
        contract.save(update_fields=['contract_type', 'start_date', 'end_date', 'duration_months', 'updated_at'])
