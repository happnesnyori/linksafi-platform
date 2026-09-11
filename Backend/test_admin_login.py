from django.test import Client, override_settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    def handle(self, *args, **options):
        with override_settings(ALLOWED_HOSTS=["*"]):
            client = Client()

            # Login page
            resp = client.get("/admin/login/")
            html = resp.content.decode()
            self.stdout.write(f"Login page: {resp.status_code}")
            self.stdout.write(f"  Has form: {'<form' in html}")
            self.stdout.write(f"  Has username: {'name=\"username\"' in html}")

            # Login
            resp = client.post("/admin/login/", {"username": "admin@gmail.com", "password": "admin", "next": "/admin/"})
            self.stdout.write(f"Login POST: {resp.status_code}")
            if resp.status_code == 302:
                self.stdout.write(f"  Redirect: {resp.url}")
                resp = client.get(resp.url)
                self.stdout.write(f"  After redirect: {resp.status_code}")
                if resp.status_code == 200:
                    html = resp.content.decode()
                    self.stdout.write(f"  Has sidebar: {'sidebar' in html}")
                    self.stdout.write(f"  Has charts: {'statusChart' in html}")
            else:
                self.stdout.write("  Login failed")

            # Logout
            resp = client.get("/admin/logout/")
            self.stdout.write(f"Logout: {resp.status_code}, redirect to: {resp.url if resp.status_code == 302 else 'N/A'}")
