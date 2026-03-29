from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0013_workspace_logo_data'),
        ('activities', '0010_scheduleevent_workspace'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='workspace',
            field=models.ForeignKey(
                blank=True,
                help_text='Organization/workspace this report belongs to',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='activity_reports',
                to='core.workspace',
            ),
        ),
    ]
