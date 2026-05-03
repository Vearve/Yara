"""
Performance indexes for frequently filtered fields.
Adds workspace index on Employee (multi-tenant filter) and
created_at index for date-range sorting.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hcm', '0008_employeebeneficiary'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='employee',
            index=models.Index(fields=['workspace'], name='hcm_emp_workspace_idx'),
        ),
        migrations.AddIndex(
            model_name='employee',
            index=models.Index(fields=['workspace', 'employment_status'], name='hcm_emp_ws_status_idx'),
        ),
        migrations.AddIndex(
            model_name='employee',
            index=models.Index(fields=['created_at'], name='hcm_emp_created_idx'),
        ),
        migrations.AddIndex(
            model_name='contract',
            index=models.Index(fields=['employee', 'status'], name='hcm_contract_emp_status_idx'),
        ),
        migrations.AddIndex(
            model_name='contract',
            index=models.Index(fields=['end_date', 'status'], name='hcm_contract_end_status_idx'),
        ),
    ]
