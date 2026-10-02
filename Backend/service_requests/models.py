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

    CONTACT_EMAIL = "email"
    CONTACT_PHONE = "phone"
    CONTACT_CHOICES = (
        (CONTACT_EMAIL, "Email"),
        (CONTACT_PHONE, "Phone"),
    )

    # Nullable so anonymous (guest) quote requests can be submitted
    organization = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_requests",
    )
    guest_name = models.CharField(max_length=120, blank=True)
    guest_email = models.EmailField(blank=True)
    guest_phone = models.CharField(max_length=32, blank=True)

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
    preferred_contact = models.CharField(
        max_length=10, choices=CONTACT_CHOICES, default=CONTACT_EMAIL
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    response_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Request #{self.id} - {self.service} ({self.status})"

    @property
    def contact_name(self):
        if self.organization_id and self.organization:
            return self.organization.name or self.organization.username
        return self.guest_name

    @property
    def contact_email(self):
        if self.organization_id and self.organization:
            return self.organization.email
        return self.guest_email

    @property
    def contact_phone(self):
        if self.organization_id and self.organization:
            return self.organization.phone
        return self.guest_phone
