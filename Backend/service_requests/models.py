from django.conf import settings
from django.db import models

from companies.models import Company


class ServiceRequest(models.Model):
    PROPERTY_UNIVERSITY = "university"
    PROPERTY_APARTMENT = "apartment"
    PROPERTY_HOSTEL = "hostel"
    PROPERTY_CHOICES = (
        (PROPERTY_UNIVERSITY, "University"),
        (PROPERTY_APARTMENT, "Apartment"),
        (PROPERTY_HOSTEL, "Hostel"),
    )

    STATUS_PENDING = "pending"
    STATUS_ACCEPTED = "accepted"
    STATUS_REJECTED = "rejected"
    STATUS_COMPLETED = "completed"
    STATUS_CHOICES = (
        (STATUS_PENDING, "Pending"),
        (STATUS_ACCEPTED, "Accepted"),
        (STATUS_REJECTED, "Rejected"),
        (STATUS_COMPLETED, "Completed"),
    )

    organization = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_requests",
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="received_requests",
    )
    service = models.CharField(max_length=32, choices=Company.SERVICE_CHOICES)
    property_type = models.CharField(
        max_length=20,
        choices=PROPERTY_CHOICES,
        blank=True,
    )
    location = models.CharField(max_length=200, blank=True)
    requested_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    response_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Request #{self.id} — {self.service} ({self.status})"