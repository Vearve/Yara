from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0012_project_workspace'),
    ]

    operations = [
        migrations.AddField(
            model_name='workspace',
            name='logo_content_type',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='workspace',
            name='logo_data',
            field=models.BinaryField(blank=True, editable=False, null=True),
        ),
    ]