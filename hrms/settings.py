"""
Django settings for HRMS project.
Multi-tenant HRM system for Zambian context.
"""

import os
from pathlib import Path
from datetime import timedelta
from decouple import config, Csv
import dj_database_url
from urllib.parse import urlparse

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-dev-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

def _normalize_host(raw: str) -> str:
    value = (raw or '').strip()
    if not value:
        return ''
    if '://' in value:
        parsed = urlparse(value)
        value = parsed.hostname or ''
    value = value.split('/')[0].split(':')[0].strip()
    return value


# ALLOWED_HOSTS: tolerate env values with scheme/port and keep wildcard entries
_raw_allowed_hosts = config(
    'ALLOWED_HOSTS',
    default='localhost,127.0.0.1,*.onrender.com',
    cast=Csv()
)
ALLOWED_HOSTS = [
    host if host.startswith('*.') else _normalize_host(host)
    for host in _raw_allowed_hosts
]
ALLOWED_HOSTS = [host for host in ALLOWED_HOSTS if host]

# Application definition
# Temporarily using single-tenant mode with SQLite (enable django-tenants when Docker/Postgres is ready)
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # REST Framework
    'rest_framework',
    'drf_spectacular',
    'django_filters',
    
    # CORS
    'corsheaders',
    
    # JWT
    'rest_framework_simplejwt',
    
    # Local apps
    'apps.core.apps.CoreConfig',
    'apps.hcm.apps.HcmConfig',
    'apps.payroll.apps.PayrollConfig',
    'apps.attendance.apps.AttendanceConfig',
    'apps.leave.apps.LeaveConfig',
    'apps.recruitment.apps.RecruitmentConfig',
    'apps.performance.apps.PerformanceConfig',
    'apps.safety.apps.SafetyConfig',
    'apps.tracking.apps.TrackingConfig',
    'apps.activities.apps.ActivitiesConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Serve static files in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.core.jwt_middleware.JWTAuthenticationMiddleware',  # Authenticate via JWT before workspace
    'apps.core.middleware.WorkspaceMiddleware',  # Add workspace context
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'hrms.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'hrms.wsgi.application'

# Database Configuration
# Priority: DATABASE_URL -> explicit DB_* env vars -> SQLite fallback
db_url = os.environ.get('DATABASE_URL')
if db_url:
    DATABASES = {
        'default': dj_database_url.config(
            default=db_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
elif config('DB_HOST', default=None):
    # Local/Postgres (e.g., Docker compose postgres service)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='hrms_db'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default='postgres'),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }
else:
    # Development: SQLite fallback
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# If you re-enable multi-tenant Postgres, switch ENGINE and routers accordingly:
# DATABASES['default']['ENGINE'] = 'django_tenants.postgresql_backend'
# DATABASE_ROUTERS = ('django_tenants.routers.TenantSyncRouter',)
# TENANT_MODEL = 'core.Tenant'
# TENANT_DOMAIN_MODEL = 'core.Domain'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Lusaka'  # Zambian timezone
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
_project_static_dir = os.path.join(BASE_DIR, 'static')
STATICFILES_DIRS = [_project_static_dir] if os.path.isdir(_project_static_dir) else []

# Use WhiteNoise for serving static files in production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Simple JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS Configuration
# Default includes localhost for dev, will be overridden by env var for Render
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176',
    cast=Csv()
)
CORS_ALLOWED_ORIGIN_REGEXES = config(
    'CORS_ALLOWED_ORIGIN_REGEXES',
    default=r'^https://.*\.onrender\.com$',
    cast=Csv()
)
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-workspace-id',
]
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_EXPOSE_HEADERS = [
    'Content-Type',
    'X-CSRFToken',
]

# Spectacular (OpenAPI) Configuration
SPECTACULAR_SETTINGS = {
    'TITLE': 'HRMS API',
    'DESCRIPTION': 'Human Resource Management System API for Zambian context',
    'VERSION': '1.0.0',
    'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny'],
    'SERVERS': [
        {'url': 'http://localhost:8000', 'description': 'Local development'},
        {'url': 'https://api.hrms.zm', 'description': 'Production'},
    ],
}

# Celery Configuration
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Africa/Lusaka'

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'hrms.log'),
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
}

# Create logs directory
os.makedirs(os.path.join(BASE_DIR, 'logs'), exist_ok=True)

# CSRF Configuration
# Works for both dev and production
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,https://*.onrender.com',
    cast=Csv()
)

# Production Security Settings
if not DEBUG:
    # Security
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # Trust proxy headers from Render
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
