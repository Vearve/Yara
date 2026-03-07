from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_alter_project_site'),
    ]

    operations = [
        migrations.AddField(
            model_name='workspace',
            name='logo',
            field=models.ImageField(blank=True, null=True, upload_to='workspace_logos/'),
        ),
    ]
