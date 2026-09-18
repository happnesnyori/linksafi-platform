import json
import secrets

from rest_framework import serializers

from accounts.models import User
from companies.models import Company, Service
from reviews.models import Review
from service_requests.models import ServiceRequest

from .models import AdminAuditLog


class AdminUserSerializer(serializers.ModelSerializer):
    total_requests = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "name",
            "role",
            "phone",
            "organization_type",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
            "total_requests",
        )
        read_only_fields = ("id", "date_joined", "last_login")

    def get_total_requests(self, obj):
        return obj.sent_requests.count()


class AdminUserDetailSerializer(serializers.ModelSerializer):
    service_requests_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "name",
            "role",
            "phone",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
            "service_requests_count",
        )
        read_only_fields = ("id", "date_joined", "last_login")


class AdminServiceRequestSerializer(serializers.ModelSerializer):
    organization_email = serializers.EmailField(source="organization.email", read_only=True)
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_owner_email = serializers.EmailField(source="company.owner.email", read_only=True)

    class Meta:
        model = ServiceRequest
        fields = (
            "id",
            "organization",
            "organization_email",
            "organization_name",
            "company",
            "company_name",
            "company_owner_email",
            "service",
            "property_type",
            "location",
            "requested_date",
            "description",
            "status",
            "response_note",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "organization",
            "organization_email",
            "organization_name",
            "company",
            "company_name",
            "company_owner_email",
            "created_at",
            "updated_at",
        )

    def validate_status(self, value):
        allowed = {c[0] for c in ServiceRequest.STATUS_CHOICES}
        if value not in allowed:
            raise serializers.ValidationError(f"Invalid status: {value}")
        return value


class AdminCompanySerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    owner_name = serializers.CharField(source="owner.name", read_only=True)

    service_items = serializers.SerializerMethodField()
    service_ids = serializers.SerializerMethodField()
    gallery_images = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    requests_received_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = (
            "id",
            "owner",
            "owner_email",
            "owner_name",
            "name",
            "tagline",
            "email",
            "phone",
            "description",
            "location",
            "logo",
            "cover_image",
            "services",
            "service_items",
            "service_ids",
            "specialties",
            "gallery_images",
            "rating",
            "reviews_count",
            "requests_received_count",
            "verification_status",
            "status",
            "is_active",
            "profile_views",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner", "owner_email", "owner_name", "service_ids", "rating", "reviews_count", "requests_received_count", "profile_views", "created_at", "updated_at")

    def get_requests_received_count(self, obj):
        return obj.received_requests.count()

    def get_service_items(self, obj):
        from companies.serializers import ServiceSerializer
        return ServiceSerializer(obj.service_items.all(), many=True).data

    def get_service_ids(self, obj):
        return list(obj.service_items.values_list("id", flat=True))

    def get_gallery_images(self, obj):
        from companies.serializers import GalleryImageSerializer
        return GalleryImageSerializer(obj.gallery_images.all(), many=True).data

    def get_rating(self, obj):
        from reviews.models import Review
        from django.db.models import Avg
        agg = Review.objects.filter(
            company=obj,
            status=Review.STATUS_PUBLISHED,
        ).aggregate(avg=Avg("rating"))
        if agg["avg"] is not None:
            return round(float(agg["avg"]), 1)
        return None

    def get_reviews_count(self, obj):
        from reviews.models import Review
        return Review.objects.filter(
            company=obj,
            status=Review.STATUS_PUBLISHED,
        ).count()


class AdminCompanyCreateSerializer(serializers.ModelSerializer):
    """Serializer for admin to create companies (auto-approved)."""
    owner_id = serializers.IntegerField(write_only=True, required=False)
    owner_email = serializers.EmailField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Company
        fields = (
            "id",
            "owner_id",
            "owner_email",
            "password",
            "name",
            "email",
            "phone",
            "description",
            "location",
            "logo",
            "services",
            "specialties",
            "verification_status",
            "status",
            "is_active",
        )
        read_only_fields = ("id",)

    def to_internal_value(self, data):
        parsed = data.copy()
        if hasattr(parsed, "keys"):
            parsed = {key: parsed.get(key) for key in parsed.keys()}
        for field_name in ("services", "specialties"):
            value = parsed.get(field_name)
            if isinstance(value, str):
                try:
                    parsed[field_name] = json.loads(value)
                except (TypeError, ValueError):
                    pass
        return super().to_internal_value(parsed)

    def validate(self, attrs):
        owner_id = attrs.get("owner_id")
        owner_email = attrs.get("owner_email")
        password = attrs.get("password")
        if not owner_id and not owner_email:
            raise serializers.ValidationError(
                {"owner_id": "Provide owner_id or owner_email with password."}
            )
        if owner_email and not password:
            raise serializers.ValidationError(
                {"password": "Password is required when creating a new owner by email."}
            )
        if owner_id and User.objects.filter(pk=owner_id).count() != 1:
            raise serializers.ValidationError(
                {"owner_id": "User not found."}
            )
        if owner_id:
            owner = User.objects.get(pk=owner_id)
            if owner.role != User.ROLE_COMPANY:
                raise serializers.ValidationError(
                    {"owner_id": "Owner must have a company account role."}
                )
        if owner_email and User.objects.filter(email__iexact=owner_email).exists():
            raise serializers.ValidationError(
                {"owner_email": "A user with this email already exists."}
            )
        return attrs

    def validate_services(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("services must be a list.")
        allowed = {c[0] for c in Company.SERVICE_CHOICES}
        for svc in value:
            if svc not in allowed:
                raise serializers.ValidationError(f"'{svc}' is not a valid service.")
        return value

    def create(self, validated_data):
        owner_email = validated_data.pop("owner_email", None)
        password = validated_data.pop("password", None)
        owner_id = validated_data.pop("owner_id", None)

        if owner_email and password:
            username = owner_email.split("@")[0]
            base_username = username
            i = 1
            while User.objects.filter(username=username).exists():
                i += 1
                username = f"{base_username}{i}"
            owner = User(username=username, email=owner_email, role=User.ROLE_COMPANY)
            owner.set_password(password)
            owner.save()
        else:
            owner = User.objects.get(pk=owner_id)

        validated_data["status"] = Company.STATUS_APPROVED
        validated_data["is_active"] = True
        company = Company.objects.create(owner=owner, **validated_data)
        return company


class AdminReviewSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    customer_email = serializers.EmailField(source="customer.email", read_only=True)

    class Meta:
        model = Review
        fields = (
            "id",
            "company",
            "company_name",
            "customer",
            "customer_name",
            "customer_email",
            "service_request",
            "service_name",
            "rating",
            "comment",
            "status",
            "is_featured",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "company", "customer", "company_name", "customer_name", "customer_email", "service_request", "status", "is_featured", "created_at", "updated_at")


class AdminServiceSerializer(serializers.ModelSerializer):
    companies_count = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = (
            "id",
            "name",
            "slug",
            "category",
            "description",
            "image",
            "is_active",
            "ordering",
            "companies_count",
        )
        read_only_fields = ("id", "slug", "companies_count")

    def get_companies_count(self, obj):
        return obj.companies.count()

    def validate_category(self, value):
        allowed = {c[0] for c in Service.CATEGORY_CHOICES}
        if value not in allowed:
            raise serializers.ValidationError("Category must be 'cleaning' or 'decoration'.")
        return value

    def create(self, validated_data):
        from django.utils.text import slugify

        base_slug = slugify(validated_data.get("name", "")) or "service"
        slug = base_slug
        suffix = 1
        while Service.objects.filter(slug=slug).exists():
            suffix += 1
            slug = f"{base_slug}-{suffix}"
        return Service.objects.create(slug=slug, **validated_data)


class AdminAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "name", "is_staff", "is_superuser", "date_joined", "last_login")
        read_only_fields = fields


class AdminAdminCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=120)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        email = validated_data["email"]
        username = email.split("@")[0]
        base_username = username
        i = 1
        while User.objects.filter(username=username).exists():
            i += 1
            username = f"{base_username}{i}"

        temp_password = secrets.token_urlsafe(9)
        user = User(
            username=username,
            email=email,
            name=validated_data["name"],
            role=User.ROLE_ORGANIZATION,
            is_staff=True,
        )
        user.set_password(temp_password)
        user.save()
        user.temp_password = temp_password
        return user


class AdminAuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor.email", read_only=True, default=None)

    class Meta:
        model = AdminAuditLog
        fields = (
            "id",
            "actor",
            "actor_email",
            "action",
            "target_type",
            "target_id",
            "target_repr",
            "metadata",
            "created_at",
        )
        read_only_fields = fields


class AdminDashboardStatsSerializer(serializers.Serializer):
    total_companies = serializers.IntegerField()
    pending_companies = serializers.IntegerField()
    approved_companies = serializers.IntegerField()
    suspended_companies = serializers.IntegerField()
    rejected_companies = serializers.IntegerField()
    total_customers = serializers.IntegerField()
    total_organizations = serializers.IntegerField()
    total_company_users = serializers.IntegerField()
    total_service_requests = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    accepted_requests = serializers.IntegerField()
    rejected_requests = serializers.IntegerField()
    completed_requests = serializers.IntegerField()
    cleaning_companies = serializers.IntegerField()
    decoration_companies = serializers.IntegerField()
    both_companies = serializers.IntegerField()