from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('hcm', '0007_merge_0004_seed_lookup_values_0006_department_workspace_alter_employee_department'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmployeeBeneficiary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('relationship', models.CharField(max_length=100)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('percentage', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='beneficiaries', to='hcm.employee')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
