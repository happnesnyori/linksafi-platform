from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_ORGANIZATION = "organization"
    ROLE_COMPANY = "company"
    ROLE_CHOICES = (
        (ROLE_ORGANIZATION, "Organization"),
        (ROLE_COMPANY, "Company"),
    )

    ORG_TYPE_UNIVERSITY = "university"
    ORG_TYPE_APARTMENT = "apartment"
    ORG_TYPE_CHOICES = (
        (ORG_TYPE_UNIVERSITY, "University"),
        (ORG_TYPE_APARTMENT, "Apartment"),
    )

    name = models.CharField(max_length=120, blank=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_ORGANIZATION)
    phone = models.CharField(max_length=32, blank=True)
    organization_type = models.CharField(max_length=20, choices=ORG_TYPE_CHOICES, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.email} ({self.role})"