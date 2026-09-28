"""
Production settings (used on Liara).

Select with DJANGO_SETTINGS_MODULE=drfecommerce.settings.production. Everything
environment-specific comes from environment variables.
"""
import os

from .base import *  # noqa

DEBUG = os.environ.get("DEBUG", "False") == "True"

if SECRET_KEY.startswith("django-insecure"):  # noqa: F405
    raise RuntimeError("SECRET_KEY must be set in the environment for production.")

# BASE_DIR is the inner "drfecommerce" package; the deployed project root is one level up.
PROJECT_ROOT = BASE_DIR.parent  # noqa: F405

ALLOWED_HOSTS = [h for h in os.environ.get("ALLOWED_HOSTS", ".liara.run").split(",") if h]
CSRF_TRUSTED_ORIGINS = [o for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",") if o]

# Liara terminates TLS in front of the app.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# SQLite on a persistent Liara disk mounted at <project>/database.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": PROJECT_ROOT / "database" / "db.sqlite3",
    }
}

# Liara's nginx serves /static from <project>/staticfiles and /media from <project>/media.
STATIC_URL = "/static/"
STATIC_ROOT = PROJECT_ROOT / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = PROJECT_ROOT / "media"
