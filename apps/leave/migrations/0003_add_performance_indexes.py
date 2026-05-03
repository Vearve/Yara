"""
Performance indexes for leave frequently filtered fields.
Covers employee+status lookups, date range queries, and absenteeism lookups.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leave', '0002_doubleticketrequest'),
    ]

    operations = [
        # LeaveRequest: most common filters
        migrations.AddIndex(
            model_name='leaverequest',
            index=models.Index(fields=['employee', 'status'], name='leave_req_emp_status_idx'),
        ),
        migrations.AddIndex(
            model_name='leaverequest',
            index=models.Index(fields=['start_date', 'end_date'], name='leave_req_dates_idx'),
        ),
        migrations.AddIndex(
            model_name='leaverequest',
            index=models.Index(fields=['leave_type', 'status'], name='leave_req_type_status_idx'),
        ),
        # Absenteeism: payslip auto-fetch query
        migrations.AddIndex(
            model_name='absenteeism',
            index=models.Index(fields=['employee', 'status', 'date'], name='leave_absent_emp_status_date_idx'),
        ),
        # DoubleTicketRequest: payslip auto-fetch query
        migrations.AddIndex(
            model_name='doubleticketrequest',
            index=models.Index(fields=['employee', 'status', 'work_date'], name='leave_dt_emp_status_date_idx'),
        ),
    ]
