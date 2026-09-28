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
# Fill in missing category photos (never replaces images uploaded in the admin).
python manage.py seed_category_images

echo "SportMed pre-start finished."
