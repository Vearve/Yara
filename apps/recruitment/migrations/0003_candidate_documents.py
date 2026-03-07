from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('recruitment', '0002_add_atr_approval_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='CandidateDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document', models.FileField(upload_to='recruitment/candidates/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='recruitment.candidate')),
            ],
            options={
                'ordering': ['-uploaded_at'],
            },
        ),
    ]
