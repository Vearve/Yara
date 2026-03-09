from django.db import migrations


def seed_hcm_lookup_values(apps, schema_editor):
    EmploymentType = apps.get_model('hcm', 'EmploymentType')
    EmployeeCategory = apps.get_model('hcm', 'EmployeeCategory')
    EmployeeClassification = apps.get_model('hcm', 'EmployeeClassification')
    ContractType = apps.get_model('hcm', 'ContractType')
    TerminationReason = apps.get_model('hcm', 'TerminationReason')

    for code, _label in [
        ('DIRECT', 'Direct Employee'),
        ('CONTRACTOR', 'Contractor'),
        ('CONSULTANT', 'Consultant'),
        ('TEMPORARY', 'Temporary'),
    ]:
        EmploymentType.objects.get_or_create(name=code)

    for code, _label in [
        ('JUNIOR', 'Junior'),
        ('SENIOR', 'Senior'),
        ('MANAGEMENT', 'Management'),
        ('EXECUTIVE', 'Executive'),
    ]:
        EmployeeCategory.objects.get_or_create(name=code)

    for code, _label in [
        ('LOCAL', 'Local'),
        ('REGIONAL', 'Regional'),
        ('NATIONAL', 'National'),
        ('EXPATRIATE', 'Expatriate'),
    ]:
        EmployeeClassification.objects.get_or_create(name=code)

    for code, _label in [
        ('PERMANENT', 'Permanent'),
        ('FIXED_TERM', 'Fixed-Term'),
        ('PROBATION', 'Probation'),
        ('SHORT_TERM', 'Short-Term'),
        ('VERBAL', 'Verbal Agreement'),
        ('TEMPORARY', 'Temporary'),
        ('SEASONAL', 'Seasonal'),
        ('CONSULTANT', 'Consultant'),
    ]:
        ContractType.objects.get_or_create(name=code)

    for code, _label in [
        ('RESIGNATION', 'Resignation'),
        ('REDUNDANCY', 'Redundancy'),
        ('RETIREMENT', 'Retirement'),
        ('TERMINATED', 'Terminated'),
        ('ENDED', 'Contract Ended'),
        ('DECEASED', 'Deceased'),
        ('OTHER', 'Other'),
    ]:
        TerminationReason.objects.get_or_create(name=code)


def unseed_hcm_lookup_values(apps, schema_editor):
    # Keep reverse migration non-destructive for existing production data.
    return


class Migration(migrations.Migration):

    dependencies = [
        ('hcm', '0003_employeedocument'),
    ]

    operations = [
        migrations.RunPython(seed_hcm_lookup_values, unseed_hcm_lookup_values),
    ]
