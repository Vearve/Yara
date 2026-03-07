from django.db import migrations, models


def set_approval_status(apps, schema_editor):
    ATR = apps.get_model('recruitment', 'ATR')
    for atr in ATR.objects.all():
        if atr.hr_manager_signed_at or atr.ops_manager_signed_at or atr.director_signed_at:
            atr.approval_status = 'APPROVED'
        else:
            atr.approval_status = 'PENDING'
        atr.save(update_fields=['approval_status'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('recruitment', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='atr',
            name='approval_status',
            field=models.CharField(choices=[('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')], default='PENDING', max_length=20),
        ),
        migrations.RunPython(set_approval_status, noop_reverse),
    ]
