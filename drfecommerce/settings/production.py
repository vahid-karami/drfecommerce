import os

from .base import *  # noqa

DEBUG = os.environ.get("DEBUG", "False") == "True"

if SECRET_KEY.startswith("django-insecure"):  # noqa: F405
    raise RuntimeError("SECRET_KEY must be set in the environment for production.")
