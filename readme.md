# Django REST Framework Ecommerce Project

A Django + DRF application for showcasing personal projects.

## Tech stack

- Python 3.12, Django 6, Django REST Framework 3
- SQLite3
- django-filter, DRF TokenAuthentication
- Gunicorn + Nginx (prod)
- Docker / docker-compose

## Features

- Public read API with pagination, search, filter, ordering
- Token-protected write API (POST / PATCH / PUT / DELETE)
- Precise DataBase Design
- Test with PyTest

## Repository layout

```

```

## Local setup (without Docker)

```bash
cd project
python -m venv .venv
source .venv/bin/activate
pip install -r requirements/dev.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Open `http://127.0.0.1:8000/`.

## Docker — development

```bash
docker compose up --build
```

## Docker — production

```bash
export DJANGO_SECRET_KEY="rotate-me"
export DJANGO_ALLOWED_HOSTS="localhost,my-domain.example"
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml exec web python manage.py createsuperuser
```

App available on port 80.

## API

| Method | Endpoint              | Auth                      |
|--------|-----------------------|---------------------------|
| GET    | `/api/projects/`      | public                    |
| GET    | `/api/projects/<id>/` | public                    |
| POST   | `/api/projects/`      | token                     |
| PATCH  | `/api/projects/<id>/` | token                     |
| PUT    | `/api/projects/<id>/` | token                     |
| DELETE | `/api/projects/<id>/` | token                     |
| POST   | `/api/auth/token/`    | username/password → token |

### Query params

- `?search=<text>` — searches name, description, technologies
- `?ordering=start_date` (or `-start_date`, `name`, `end_date`, `created_at`)
- `?technologies=<substring>` — case-insensitive contains
- `?start_date_after=YYYY-MM-DD`, `?start_date_before=YYYY-MM-DD`
- `?page=<n>&page_size=<n>` (default 10, max 100)

## Seed data

Populate the database with 7 sample projects:

```bash
cd project
python seed_projects.py
```

Safe to run multiple times — existing projects are not duplicated.

## Running tests

```bash
cd project
python manage.py test -v 2
```

10 tests covering model, list/retrieve, search, ordering, auth boundaries, CRUD round-trip, and date validation.