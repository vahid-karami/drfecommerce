# Deploying SportMed to Liara

One Liara **Django** app serves everything: the API (`/api/...`), Django admin (`/admin/`),
and the built React site (every other URL). Liara's nginx serves `/static` and `/media`.

Files involved: `liara.json`, `liara_pre_start.sh`, `.liaraignore`,
`drfecommerce/settings/production.py`, `products/management/commands/seed_demo_store.py`.

## One-time setup (Liara console)

1. Create an app: **Platform → Django**, pick an ID (e.g. `sportmed`). Your site will be
   `https://sportmed.liara.run`.
2. In the app's **Disks** section create two disks (1 GB each is plenty for the demo):
   - `database` (SQLite database)
   - `media` (product and sport photos)
3. In **Environment variables** add:

   | Variable | Value |
   | --- | --- |
   | `DJANGO_SETTINGS_MODULE` | `drfecommerce.settings.production` |
   | `ALLOWED_HOSTS` | `sportmed.liara.run` |
   | `CSRF_TRUSTED_ORIGINS` | `https://sportmed.liara.run` |

   `SECRET_KEY` is created automatically by Liara; keep it.

   Optional, for demos only:
   - `PAYMENT_SANDBOX=True`: checkout uses the fake payment gateway instead of failing.
   - `OTP_RETURN_IN_RESPONSE=True`: shows the SMS code on screen (there is no SMS provider yet).
     Anyone can then log in to any phone number, so only use it with demo accounts.

## Every deploy (your PC)

```bash
npm install -g @liara/cli        # once
liara login                      # once
cd frontend
npm run build:django             # builds React with /static/ URLs into frontend/dist
cd ..
liara deploy --app sportmed
```

On start, `liara_pre_start.sh` runs migrations, collects static files and, on the very first
boot only, loads the Persian demo catalogue.

## Admin user

After the first deploy, open the app's **Console** (terminal) in Liara and run:

```bash
python manage.py createsuperuser
```

Then sign in at `https://sportmed.liara.run/admin/`.

## Later: your own domain

Add the domain under the app's **Domains** section, point its DNS to Liara as instructed there,
and append it to `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` (comma-separated).
