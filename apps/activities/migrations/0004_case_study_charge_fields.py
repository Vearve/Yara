from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activities', '0003_seed_report_types'),
    ]

    operations = [
        migrations.AddField(
            model_name='casestudy',
            name='allegations',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='casestudy',
            name='plea',
            field=models.CharField(choices=[('GUILTY', 'Guilty'), ('NOT_GUILTY', 'Not Guilty'), ('SETTLED', 'Settled'), ('DISMISSED', 'Dismissed'), ('PENDING', 'Pending')], default='PENDING', max_length=20),
        ),
        migrations.AddField(
            model_name='casestudy',
            name='statement',
            field=models.TextField(blank=True),
        ),
    ]
