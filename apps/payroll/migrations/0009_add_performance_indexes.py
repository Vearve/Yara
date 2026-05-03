"""
Performance indexes for payroll frequently filtered fields.
Covers workspace-scoped lookups via employee FK, period/status filters,
and created_at ordering.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payroll', '0008_payslip_double_ticket_payment'),
    ]

    operations = [
        # Payslip: most common filters
        migrations.AddIndex(
            model_name='payslip',
            index=models.Index(fields=['employee', 'is_active'], name='payroll_slip_emp_active_idx'),
        ),
        migrations.AddIndex(
            model_name='payslip',
            index=models.Index(fields=['period', 'is_active'], name='payroll_slip_period_active_idx'),
        ),
        migrations.AddIndex(
            model_name='payslip',
            index=models.Index(fields=['is_active', 'created_at'], name='payroll_slip_active_created_idx'),
        ),
        # PayrollEntry: workspace lookup via employee
        migrations.AddIndex(
            model_name='payrollentry',
            index=models.Index(fields=['employee'], name='payroll_entry_emp_idx'),
        ),
        migrations.AddIndex(
            model_name='payrollentry',
            index=models.Index(fields=['updated_at'], name='payroll_entry_updated_idx'),
        ),
    ]
