import os
import boto3
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.core.files.storage import default_storage
from apps.core.models import UserProfile
from apps.hcm.models import Employee


class Command(BaseCommand):
    help = 'Migrate employee and user profile photos from local storage to S3'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without actually uploading or modifying database',
        )
        parser.add_argument(
            '--delete-local',
            action='store_true',
            help='Delete local files after successful upload',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        delete_local = options['delete_local']

        # Validate S3 is configured
        if not self._validate_s3_config():
            raise CommandError('S3 is not properly configured. Check AWS environment variables.')

        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )

        self.stdout.write(f'Dry run: {dry_run}')
        self.stdout.write(f'Delete local files: {delete_local}')
        self.stdout.write('=' * 60)

        # Migrate UserProfile photos
        self.stdout.write('Starting UserProfile photo migration...')
        user_count = self._migrate_user_profiles(s3_client, dry_run, delete_local)

        # Migrate Employee photos
        self.stdout.write('Starting Employee photo migration...')
        employee_count = self._migrate_employees(s3_client, dry_run, delete_local)

        self.stdout.write('=' * 60)
        self.stdout.write(
            self.style.SUCCESS(
                f'✓ Migration complete!\n'
                f'  UserProfiles migrated: {user_count}\n'
                f'  Employees migrated: {employee_count}\n'
                f'  Total: {user_count + employee_count}'
            )
        )

    def _validate_s3_config(self):
        """Check if S3 is configured"""
        required = [
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY',
            'AWS_STORAGE_BUCKET_NAME',
            'AWS_S3_REGION_NAME',
        ]
        for attr in required:
            if not getattr(settings, attr, None):
                self.stdout.write(
                    self.style.ERROR(f'Missing setting: {attr}')
                )
                return False
        return True

    def _migrate_user_profiles(self, s3_client, dry_run, delete_local):
        """Migrate UserProfile profile_picture field"""
        migrated = 0
        skipped = 0

        user_profiles = UserProfile.objects.filter(profile_picture__isnull=False).exclude(
            profile_picture=''
        )

        for profile in user_profiles:
            try:
                # Get local file path - try .path first, fall back to manual construction
                try:
                    local_path = profile.profile_picture.path
                except Exception:
                    # If .path fails (S3 storage backend), construct path manually
                    local_path = os.path.join(settings.MEDIA_ROOT, profile.profile_picture.name)

                if not os.path.exists(local_path):
                    self.stdout.write(
                        self.style.WARNING(
                            f'Skipped UserProfile {profile.user.id}: '  # type: ignore[attr-defined]
                            f'local file not found at {local_path}'
                        )
                    )
                    skipped += 1
                    continue

                # Upload to S3
                s3_key = f'profile_pictures/{profile.profile_picture.name.split("/")[-1]}'
                
                if not dry_run:
                    with open(local_path, 'rb') as f:
                        s3_client.upload_fileobj(
                            f,
                            settings.AWS_STORAGE_BUCKET_NAME,
                            s3_key,
                            ExtraArgs={'ContentType': 'image/jpeg'},
                        )

                    # Update database to point to S3
                    profile.profile_picture.name = s3_key
                    profile.save(update_fields=['profile_picture'])

                    # Delete local file if requested
                    if delete_local:
                        os.remove(local_path)

                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ UserProfile {profile.user.id}: {s3_key}'  # type: ignore[attr-defined]
                    )
                )
                migrated += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Error migrating UserProfile {profile.user.id}: {str(e)}'  # type: ignore[attr-defined]
                    )
                )
                skipped += 1

        self.stdout.write(f'UserProfiles: {migrated} migrated, {skipped} skipped')
        return migrated

    def _migrate_employees(self, s3_client, dry_run, delete_local):
        """Migrate Employee photo field"""
        migrated = 0
        skipped = 0

        employees = Employee.objects.filter(photo__isnull=False).exclude(photo='')

        for employee in employees:
            try:
                # Get local file path - try .path first, fall back to manual construction
                try:
                    local_path = employee.photo.path
                except Exception:
                    # If .path fails (S3 storage backend), construct path manually
                    local_path = os.path.join(settings.MEDIA_ROOT, employee.photo.name)

                if not os.path.exists(local_path):
                    self.stdout.write(
                        self.style.WARNING(
                            f'Skipped Employee {employee.id}: '  # type: ignore[attr-defined]
                            f'local file not found at {local_path}'
                        )
                    )
                    skipped += 1
                    continue

                # Upload to S3
                s3_key = f'employee_photos/{employee.photo.name.split("/")[-1]}'
                
                if not dry_run:
                    with open(local_path, 'rb') as f:
                        s3_client.upload_fileobj(
                            f,
                            settings.AWS_STORAGE_BUCKET_NAME,
                            s3_key,
                            ExtraArgs={'ContentType': 'image/jpeg'},
                        )

                    # Update database to point to S3
                    employee.photo.name = s3_key
                    employee.save(update_fields=['photo'])

                    # Delete local file if requested
                    if delete_local:
                        os.remove(local_path)

                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Employee {employee.id}: {s3_key}'  # type: ignore[attr-defined]
                    )
                )
                migrated += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Error migrating Employee {employee.id}: {str(e)}'  # type: ignore[attr-defined]
                    )
                )
                skipped += 1

        self.stdout.write(f'Employees: {migrated} migrated, {skipped} skipped')
        return migrated
