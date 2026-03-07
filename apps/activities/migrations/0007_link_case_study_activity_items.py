from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('activities', '0006_charge_case_study'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='case_study',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reports', to='activities.casestudy'),
        ),
        migrations.AddField(
            model_name='hearing',
            name='case_study',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='hearing_links', to='activities.casestudy'),
        ),
        migrations.AddField(
            model_name='investigation',
            name='case_study',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='investigation_links', to='activities.casestudy'),
        ),
    ]
