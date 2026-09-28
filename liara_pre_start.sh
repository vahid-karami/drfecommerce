#!/bin/sh
# Runs on Liara before the app starts (environment variables are available here).
set -e

echo "SportMed pre-start: using settings ${DJANGO_SETTINGS_MODULE}"

mkdir -p database media

python manage.py migrate --noinput
# Collect Django admin assets and the built React app into staticfiles/ (served by nginx).
python manage.py collectstatic --noinput
# Load the demo catalogue on first boot only.
python manage.py seed_demo_store

echo "SportMed pre-start finished."
