from django.conf import settings
from django.db import models

from companies.models import Company


class Review(models.Model):
    STATUS_PENDING = "pending"
    STATUS_PUBLISHED = "published"
    STATUS_REJECTED = "rejected"

    # Legacy aliases
    STATUS_VISIBLE = "published"
    STATUS_HIDDEN = "pending"
    STATUS_REMOVED = "rejected"

    STATUS_CHOICES = (
        (STATUS_PENDING, "Pending"),
        (STATUS_PUBLISHED, "Published"),
        (STATUS_REJECTED, "Rejected"),
        ("visible", "Published (Legacy)"),
        ("hidden", "Hidden (Legacy)"),
        ("removed", "Removed (Legacy)"),
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    service_request = models.ForeignKey(
        "service_requests.ServiceRequest",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviews",
    )
    service_name = models.CharField(max_length=120, blank=True)
    rating = models.IntegerField()
    comment = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Review #{self.id} — {self.rating}★ for {self.company.name} ({self.status})"