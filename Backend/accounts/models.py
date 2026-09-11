from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_ORGANIZATION = "organization"
    ROLE_COMPANY = "company"
    ROLE_CHOICES = (
        (ROLE_ORGANIZATION, "Organization"),
        (ROLE_COMPANY, "Company"),
    )

    name = models.CharField(max_length=120, blank=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_ORGANIZATION)
    phone = models.CharField(max_length=32, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.email} ({self.role})"