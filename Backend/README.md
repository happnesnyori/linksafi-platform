# LinkSafi Backend

Django REST Framework backend for the LinkSafi platform.

## Stack

- Django 5.x
- Django REST Framework
- PostgreSQL
- JWT auth (SimpleJWT)
- CORS for the Vite frontend (`http://localhost:5173`)

## Setup

1. Create and activate a Python venv:

   ```powershell
   cd "D:\MY PROJECTS\LinkSafi\Backend"
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. Install dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

3. Copy env file and edit values:

   ```powershell
   copy .env.example .env
   ```

   Update `POSTGRES_*` with your local Postgres credentials.

4. Create the database in Postgres (e.g. `createdb linksafi`) and run migrations:

   ```powershell
   python manage.py makemigrations accounts companies service_requests
   python manage.py migrate
   ```

5. Create a superuser (optional, for /admin):

   ```powershell
   python manage.py createsuperuser
   ```

6. Run the dev server:

   ```powershell
   python manage.py runserver
   ```

   Backend will be at `http://127.0.0.1:8000`.

## API Endpoints

| Method | Path                              | Auth | Role          | Description                            |
|--------|-----------------------------------|------|---------------|----------------------------------------|
| POST   | `/api/auth/register`              | No   | -             | Register organization or company       |
| POST   | `/api/auth/login`                 | No   | -             | Login, returns `{user, access, refresh}` |
| POST   | `/api/auth/logout`                | Yes  | any           | Logout (client discards tokens)        |
| POST   | `/api/auth/refresh`               | No   | -             | Refresh access token                   |
| GET    | `/api/auth/me`                    | Yes  | any           | Current user                           |
| GET    | `/api/companies`                  | Yes  | any           | List companies (filters: `service`, `search`) |
| POST   | `/api/companies`                  | Yes  | company       | Create company profile                 |
| GET    | `/api/companies/me`               | Yes  | company       | Current user's company                 |
| GET    | `/api/companies/:id`              | Yes  | any           | Company details                        |
| PUT    | `/api/companies/:id`              | Yes  | company       | Update own company                     |
| PUT    | `/api/companies/:id/services`     | Yes  | company       | Update offered services                |
| GET    | `/api/requests`                   | Yes  | any           | List own requests                      |
| POST   | `/api/requests`                   | Yes  | organization  | Create service request                 |
| GET    | `/api/requests/:id`               | Yes  | any           | Request details                        |
| POST   | `/api/requests/:id/accept`        | Yes  | company       | Accept request                         |
| POST   | `/api/requests/:id/reject`        | Yes  | company       | Reject request                         |
| POST   | `/api/requests/:id/respond`       | Yes  | company       | Respond with note                      |
| GET    | `/api/company/requests`           | Yes  | company       | List requests for my company           |
| GET    | `/api/stats`                      | Yes  | any           | Request counts by status               |

## Frontend wiring

The Vite frontend already points at `/auth/...`, `/companies`, `/requests`, etc. with `VITE_API_BASE_URL` (see `Frontend/src/services/api.js`).

Create `Frontend/.env` with:

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

so all API calls hit Django.