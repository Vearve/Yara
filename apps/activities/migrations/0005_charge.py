from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('activities', '0004_case_study_charge_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='Charge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('allegations', models.TextField()),
                ('plea', models.CharField(choices=[('GUILTY', 'Guilty'), ('NOT_GUILTY', 'Not Guilty'), ('PENDING', 'Pending')], default='PENDING', max_length=20)),
                ('statement', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('OPENED', 'Opened'), ('UNDER_REVIEW', 'Under Review'), ('CLOSED', 'Closed')], default='OPENED', max_length=20)),
                ('charges_document', models.FileField(blank=True, upload_to='charges/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='charges', to='hcm.employee')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
