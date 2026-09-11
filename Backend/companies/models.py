from django.conf import settings
from django.db import models


class Company(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_SUSPENDED = "suspended"
    STATUS_CHOICES = (
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
        (STATUS_SUSPENDED, "Suspended"),
    )

    VERIFICATION_UNVERIFIED = "unverified"
    VERIFICATION_VERIFIED = "verified"
    VERIFICATION_CHOICES = (
        (VERIFICATION_UNVERIFIED, "Unverified"),
        (VERIFICATION_VERIFIED, "Verified"),
    )

    SERVICE_CLEANING = "cleaning"
    SERVICE_DECORATION = "decoration"
    SERVICE_BOTH = "both"
    SERVICE_CHOICES = (
        (SERVICE_CLEANING, "Cleaning"),
        (SERVICE_DECORATION, "Decoration"),
        (SERVICE_BOTH, "Cleaning + Decoration"),
    )

    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="company",
    )
    name = models.CharField(max_length=160)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=160, blank=True)
    logo = models.ImageField(upload_to="company_logos/", blank=True, null=True)
    services = models.JSONField(default=list)
    specialties = models.JSONField(default=list)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    is_active = models.BooleanField(default=False)
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_CHOICES,
        default=VERIFICATION_UNVERIFIED,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.name