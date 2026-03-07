"""
Activities Models
Covers reports, interviews, hearings, investigations, case studies, and KPIs.
"""

from django.db import models
from django.utils import timezone
from apps.hcm.models import Employee, Department
from apps.core.models import Workspace


class ReportType(models.Model):
    """Report types: Safety, Complaint, Grievance, Disciplinary."""
    TYPES = [
        ('SAFETY', 'Safety'),
        ('COMPLAINT', 'Complaint'),
        ('GRIEVANCE', 'Grievance'),
        ('DISCIPLINARY', 'Disciplinary'),
    ]
    
    name = models.CharField(max_length=100, choices=TYPES, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Report Types"
    
    def __str__(self):
        return self.name


class Report(models.Model):
    """Activity: Report (Safety, Complaint, Grievance, Disciplinary)."""
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('ACKNOWLEDGED', 'Acknowledged'),
        ('ESCALATED', 'Escalated'),
        ('CLOSED', 'Closed'),
    ]
    
    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    report_number = models.CharField(max_length=100, unique=True)
    report_type = models.ForeignKey(ReportType, on_delete=models.PROTECT)
    
    # People involved
    reported_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='reports_submitted')
    reported_employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports_against')
    case_study = models.ForeignKey('CaseStudy', on_delete=models.SET_NULL, null=True, blank=True, related_name='reports')
    
    # Details
    title = models.CharField(max_length=300)
    description = models.TextField()
    location = models.CharField(max_length=200, blank=True)
    incident_date = models.DateField()
    incident_time = models.TimeField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='MEDIUM')
    
    # Attachments
    attachments = models.FileField(upload_to='reports/', blank=True)
    
    # Escalation
    is_escalated = models.BooleanField(default=False)
    escalated_to_case = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['report_type', 'status']),
            models.Index(fields=['incident_date']),
        ]
    
    def __str__(self):
        return f"{self.report_number} - {self.report_type.name}"


class Interview(models.Model):
    """Activity: Interview (from recruitment process)."""
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('COMPLETED', 'Completed'),
        ('PASSED', 'Passed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    # Link to recruitment candidate
    candidate_name = models.CharField(max_length=300)
    candidate_nrc = models.CharField(max_length=50, blank=True)
    position = models.CharField(max_length=200)
    
    interview_date = models.DateField()
    interview_time = models.TimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    
    # Committee
    committee_members = models.TextField(help_text="Names of committee members, comma-separated")
    
    # Interview questions & scoring
    questions = models.TextField(help_text="Interview questions, formatted as JSON or plain text")
    final_score = models.FloatField(null=True, blank=True)
    recommendations = models.TextField(blank=True)
    
    # Documents
    interview_document = models.FileField(upload_to='interviews/', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-interview_date']
    
    def __str__(self):
        return f"Interview - {self.candidate_name} ({self.position})"


class Hearing(models.Model):
    """Activity: Hearing (disciplinary/grievance)."""
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('HELD', 'Held'),
        ('ADJOURNED', 'Adjourned'),
        ('CONCLUDED', 'Concluded'),
    ]
    
    hearing_number = models.CharField(max_length=100, unique=True)
    
    # Related to
    related_employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='hearings')
    related_report = models.ForeignKey(Report, on_delete=models.SET_NULL, null=True, blank=True)
    case_study = models.ForeignKey('CaseStudy', on_delete=models.SET_NULL, null=True, blank=True, related_name='hearing_links')
    
    hearing_date = models.DateField()
    hearing_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    
    # Committee
    committee_members = models.TextField(help_text="Names of committee members")
    chairperson = models.CharField(max_length=200, blank=True)
    
    # Charges & Outcome
    charges = models.TextField()
    employee_statement = models.TextField(blank=True, help_text="Employee's response/statement")
    committee_findings = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    sanctions = models.TextField(blank=True, help_text="Recommended sanctions if any")
    
    # Documents
    hearing_document = models.FileField(upload_to='hearings/', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-hearing_date']
    
    def __str__(self):
        return f"Hearing {self.hearing_number} - {self.related_employee.full_name}"


class Investigation(models.Model):
    """Activity: Investigation."""
    STATUS_CHOICES = [
        ('INITIATED', 'Initiated'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CLOSED', 'Closed'),
    ]
    
    investigation_number = models.CharField(max_length=100, unique=True)
    
    # Related to
    related_report = models.ForeignKey(Report, on_delete=models.SET_NULL, null=True, blank=True)
    case_study = models.ForeignKey('CaseStudy', on_delete=models.SET_NULL, null=True, blank=True, related_name='investigation_links')
    related_employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='investigations')
    
    # Details
    title = models.CharField(max_length=300)
    description = models.TextField()
    investigation_date = models.DateField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='INITIATED')
    
    # Investigator
    investigator = models.CharField(max_length=200)
    
    # Findings
    evidence_collected = models.TextField(blank=True)
    observations = models.TextField(blank=True, help_text="Observations from scene/interviews")
    findings = models.TextField(blank=True)
    conclusion_of_scene = models.TextField(blank=True, help_text="Conclusion from scene analysis")
    conclusions = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    
    # Documents
    investigation_document = models.FileField(upload_to='investigations/', blank=True)
    supporting_documents = models.FileField(upload_to='investigations/supporting/', blank=True, null=True, help_text="Additional supporting documents")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-investigation_date']
    
    def __str__(self):
        return f"Investigation {self.investigation_number}"


class CaseStudy(models.Model):
    """
    Activity: Case Study (escalated report).
    Flow: Report → Escalation → Case → Charges → Hearing → Investigation → Verdict
    """
    STATUS_CHOICES = [
        ('OPENED', 'Opened'),
        ('UNDER_REVIEW', 'Under Review'),
        ('HEARING_PENDING', 'Hearing Pending'),
        ('INVESTIGATION_PENDING', 'Investigation Pending'),
        ('VERDICT_PENDING', 'Verdict Pending'),
        ('CLOSED', 'Closed'),
    ]
    
    VERDICT_CHOICES = [
        ('GUILTY', 'Guilty'),
        ('NOT_GUILTY', 'Not Guilty'),
        ('SETTLED', 'Settled'),
        ('DISMISSED', 'Dismissed'),
        ('PENDING', 'Pending'),
    ]
    
    case_number = models.CharField(max_length=100, unique=True)
    
    # Originating report
    related_report = models.OneToOneField(Report, on_delete=models.PROTECT)
    related_employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='case_studies')
    
    # Case flow
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='OPENED')
    verdict = models.CharField(max_length=20, choices=VERDICT_CHOICES, default='PENDING')
    
    # Charges
    charges_document = models.FileField(upload_to='cases/charges/', blank=True)
    charges_text = models.TextField(blank=True)
    allegations = models.TextField(blank=True)
    plea = models.CharField(max_length=20, choices=VERDICT_CHOICES, default='PENDING')
    statement = models.TextField(blank=True)
    
    # Related activities (links)
    hearings = models.ManyToManyField(Hearing, blank=True, related_name='case_studies')
    investigations = models.ManyToManyField(Investigation, blank=True, related_name='case_studies')
    # Note: Charges are embedded in charges_document/charges_text; could add Charge model if needed
    # Optional: Link to appraisal if performance-related
    related_appraisal = models.ForeignKey('Appraisal', on_delete=models.SET_NULL, null=True, blank=True, related_name='related_cases')
    
    # Final outcome
    final_verdict_text = models.TextField(blank=True)
    sanctions_imposed = models.TextField(blank=True)
    appeal_status = models.CharField(max_length=50, blank=True)
    
    # Dates
    case_opened_date = models.DateField(auto_now_add=True)
    case_closed_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-case_opened_date']
    
    def __str__(self):
        return f"Case {self.case_number} - {self.related_employee.full_name}"


class Charge(models.Model):
    """Standalone charge sheet before case study creation."""
    STATUS_CHOICES = [
        ('OPENED', 'Opened'),
        ('UNDER_REVIEW', 'Under Review'),
        ('CLOSED', 'Closed'),
    ]

    PLEA_CHOICES = [
        ('GUILTY', 'Guilty'),
        ('NOT_GUILTY', 'Not Guilty'),
        ('PENDING', 'Pending'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='charges')
    case_study = models.ForeignKey(CaseStudy, on_delete=models.SET_NULL, null=True, blank=True, related_name='charges')
    allegations = models.TextField()
    plea = models.CharField(max_length=20, choices=PLEA_CHOICES, default='PENDING')
    statement = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPENED')
    charges_document = models.FileField(upload_to='charges/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Charge - {self.employee.full_name}"


class KPI(models.Model):
    """Key Performance Indicators."""
    FREQUENCIES = [
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('YEARLY', 'Yearly'),
    ]
    
    KPI_TYPES = [
        ('PRODUCTIVITY', 'Productivity'),
        ('ATTENDANCE', 'Attendance'),
        ('SAFETY', 'Safety'),
        ('QUALITY', 'Quality'),
        ('EFFICIENCY', 'Efficiency'),
        ('CUSTOM', 'Custom'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='kpis')
    
    # Definition
    kpi_name = models.CharField(max_length=200)
    kpi_type = models.CharField(max_length=20, choices=KPI_TYPES, default='CUSTOM')
    description = models.TextField(blank=True)
    
    # Period
    frequency = models.CharField(max_length=20, choices=FREQUENCIES)
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Performance
    target_value = models.FloatField()
    actual_value = models.FloatField(null=True, blank=True)
    unit = models.CharField(max_length=50, blank=True, help_text="e.g., units, %, hours")
    
    # Status
    achieved = models.BooleanField(default=False)
    comments = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-end_date']
        indexes = [
            models.Index(fields=['employee', 'frequency']),
            models.Index(fields=['end_date']),
        ]
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.kpi_name} ({self.frequency})"
    
    @property
    def achievement_percentage(self):
        if self.target_value and self.actual_value:
            return (self.actual_value / self.target_value) * 100
        return 0


class Appraisal(models.Model):
    """Performance Appraisal header capturing period, parties, and overall outcome."""
    RATING_CHOICES = [
        (1, 'PP'),  # Poor Performance
        (2, 'SP'),  # Satisfactory Performance (with guidance)
        (3, 'AP'),  # Acceptable Performance
        (4, 'AE'),  # Above Expectation
        (5, 'OP'),  # Outstanding Performance
    ]

    # Core
    appraisee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='appraisals')
    supervisor = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='appraisals_supervised')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    position_held = models.CharField(max_length=200)

    review_start = models.DateField()
    review_end = models.DateField()

    # Section 6/7 and administrative fields
    feedback_notes = models.TextField(blank=True, help_text='180°/360° feedback summary')
    employee_comments = models.TextField(blank=True)
    supervisor_comments = models.TextField(blank=True)

    employee_signed_at = models.DateTimeField(null=True, blank=True)
    supervisor_signed_at = models.DateTimeField(null=True, blank=True)

    # Calculated/declared overall
    overall_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    overall_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)

    # Attachments
    attachment = models.FileField(upload_to='appraisals/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-review_end']

    def __str__(self):
        return f"Appraisal {self.appraisee.full_name} ({self.review_start} → {self.review_end})"

    @staticmethod
    def percentage_to_band(percentage: float) -> int:
        if percentage is None:
            return 0
        if percentage >= 86:
            return 5  # OP
        if percentage >= 76:
            return 4  # AE
        if percentage >= 66:
            return 3  # AP
        if percentage >= 50:
            return 2  # SP
        return 1  # PP


class AppraisalObjective(models.Model):
    """Section 1 objectives with ratings from self/supervisor/agreed."""
    appraisal = models.ForeignKey(Appraisal, on_delete=models.CASCADE, related_name='objectives')
    title = models.TextField(help_text='State Performance Objective')
    self_rating = models.IntegerField(choices=Appraisal.RATING_CHOICES, null=True, blank=True)
    supervisor_rating = models.IntegerField(choices=Appraisal.RATING_CHOICES, null=True, blank=True)
    agreed_rating = models.IntegerField(choices=Appraisal.RATING_CHOICES, null=True, blank=True)
    comments = models.TextField(blank=True)

    order = models.IntegerField(default=0)

    def __str__(self):
        return f"Objective #{self.order or ''} for {self.appraisal.appraisee.full_name}"


class AppraisalFactor(models.Model):
    """Section 2 general performance factors (Performance/Behavioral/Supervisory)."""
    GROUP_CHOICES = [
        ('PERFORMANCE', 'Performance Factors'),
        ('BEHAVIORAL', 'Behavioral Traits'),
        ('SUPERVISORY', 'Supervisory Factors'),
    ]

    appraisal = models.ForeignKey(Appraisal, on_delete=models.CASCADE, related_name='factors')
    group = models.CharField(max_length=20, choices=GROUP_CHOICES)
    name = models.CharField(max_length=200)
    rating = models.IntegerField(choices=Appraisal.RATING_CHOICES, null=True, blank=True)
    notes = models.TextField(blank=True)

    order = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.group} - {self.name} ({self.appraisal.appraisee.full_name})"


class AppraisalImprovementItem(models.Model):
    """Section 3 Performance Improvement Plan items."""
    appraisal = models.ForeignKey(Appraisal, on_delete=models.CASCADE, related_name='improvement_items')
    issue = models.TextField(help_text='Objectives not achieved / challenges / areas for improvement')
    limiting_factors = models.TextField(blank=True)
    actions = models.TextField(blank=True)
    completion_indicator = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)


class AppraisalNextObjective(models.Model):
    """Section 4 objectives for next period."""
    appraisal = models.ForeignKey(Appraisal, on_delete=models.CASCADE, related_name='next_objectives')
    key_area = models.CharField(max_length=200, blank=True)
    objective = models.TextField(help_text='SMART objective for next period')
    indicators = models.TextField(blank=True, help_text='How achievement will be measured')


class AppraisalDevelopmentItem(models.Model):
    """Section 5 Personal Development Plan items."""
    appraisal = models.ForeignKey(Appraisal, on_delete=models.CASCADE, related_name='development_items')
    training_need = models.TextField()
    action = models.TextField(blank=True)
    responsible = models.CharField(max_length=200, blank=True)
    due_date = models.DateField(null=True, blank=True)
    application_note = models.TextField(blank=True, help_text='How learning will be applied')
    review_date = models.DateField(null=True, blank=True)


class ScheduleEvent(models.Model):
    """Generic schedule events for calendar view."""
    EVENT_TYPES = [
        ('hearing', 'Hearing'),
        ('investigation', 'Investigation'),
        ('charge', 'Charge'),
        ('report', 'Report'),
        ('training', 'Training'),
        ('medical', 'Medical'),
        ('leave', 'Leave'),
        ('meeting', 'Meeting'),
        ('travel', 'Travel'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    type = models.CharField(max_length=20, choices=EVENT_TYPES)
    case_study = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='schedule_events', null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.date})"
