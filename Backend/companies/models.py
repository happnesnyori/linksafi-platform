from django.conf import settings
from django.db import models


class Service(models.Model):
    CATEGORY_CLEANING = "cleaning"
    CATEGORY_DECORATION = "decoration"
    CATEGORY_CHOICES = (
        (CATEGORY_CLEANING, "Cleaning"),
        (CATEGORY_DECORATION, "Decoration"),
    )

    name = models.CharField(max_length=160, unique=True)
    slug = models.SlugField(max_length=180, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="services/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    ordering = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("category", "ordering", "name")

    def __str__(self):
        return self.name


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
    tagline = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=160, blank=True)
    service_areas = models.JSONField(default=list, blank=True)
    working_hours = models.TextField(blank=True)
    logo = models.ImageField(upload_to="company_logos/", blank=True, null=True)
    cover_image = models.ImageField(upload_to="company_covers/", blank=True, null=True)
    services = models.JSONField(default=list, blank=True)
    service_items = models.ManyToManyField(
        Service,
        through="CompanyService",
        related_name="companies",
        blank=True,
    )
    specialties = models.JSONField(default=list, blank=True)
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
    profile_views = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.name


class CompanyService(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="service_memberships",
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name="company_memberships",
    )
    ordering = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("ordering", "service__name")
        constraints = (
            models.UniqueConstraint(
                fields=("company", "service"),
                name="unique_company_service",
            ),
        )

    def __str__(self):
        return f"{self.company.name} - {self.service.name}"


class GalleryImage(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="gallery_images",
    )
    image = models.ImageField(upload_to="company_gallery/")
    title = models.CharField(max_length=160, blank=True)
    description = models.TextField(blank=True)
    ordering = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("ordering", "created_at")

    def __str__(self):
        return self.title or f"Gallery image {self.id}"
