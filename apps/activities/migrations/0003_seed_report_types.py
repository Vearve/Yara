from django.db import migrations


def seed_report_types(apps, schema_editor):
    ReportType = apps.get_model('activities', 'ReportType')
    choices = ReportType._meta.get_field('name').choices
    for value, _label in choices:
        ReportType.objects.get_or_create(name=value)


class Migration(migrations.Migration):

    dependencies = [
        ('activities', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(seed_report_types, migrations.RunPython.noop),
    ]
