from django.apps import AppConfig


class HcmConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.hcm'

    def ready(self):
        """Import signals when app is ready."""
        from apps.hcm import models  # noqa
