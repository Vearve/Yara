from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('activities', '0005_charge'),
    ]

    operations = [
        migrations.AddField(
            model_name='charge',
            name='case_study',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='charges', to='activities.casestudy'),
        ),
    ]
