import json
from django.db.models import Avg, Count
from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import Company, CompanyService, GalleryImage, Service


def parse_json_form_fields(data):
    parsed = data.copy()
    if hasattr(parsed, "keys"):
        parsed = {key: parsed.get(key) for key in parsed.keys()}
    for field_name in ("services", "specialties", "service_areas"):
        value = parsed.get(field_name)
        if isinstance(value, str):
            try:
                parsed[field_name] = json.loads(value)
            except (TypeError, ValueError):
                if field_name == "specialties" and "," in value:
                    parsed[field_name] = [s.strip() for s in value.split(",") if s.strip()]
    return parsed


class ServiceSerializer(serializers.ModelSerializer):
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
        )
        read_only_fields = ("id", "slug", "image", "is_active", "ordering")

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Service name is required.")
        return value

    def validate_category(self, value):
        allowed = {c[0] for c in Service.CATEGORY_CHOICES}
        if value not in allowed:
            raise serializers.ValidationError("Category must be 'cleaning' or 'decoration'.")
        return value


class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = (
            "id",
            "company",
            "image",
            "title",
            "description",
            "ordering",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "company", "created_at", "updated_at")


class CompanySerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    service_items = ServiceSerializer(many=True, read_only=True)
    gallery_images = GalleryImageSerializer(many=True, read_only=True)
    service_ids = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = (
            "id",
            "owner",
            "name",
            "tagline",
            "email",
            "phone",
            "description",
            "location",
            "service_areas",
            "working_hours",
            "logo",
            "cover_image",
            "services",
            "service_ids",
            "service_items",
            "specialties",
            "gallery_images",
            "rating",
            "reviews_count",
            "verification_status",
            "status",
            "is_active",
            "profile_views",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "owner",
            "service_ids",
            "rating",
            "reviews_count",
            "verification_status",
            "status",
            "is_active",
            "profile_views",
            "created_at",
            "updated_at",
        )

    def get_service_ids(self, obj):
        return list(obj.service_items.values_list("id", flat=True))

    def get_rating(self, obj):
        rating = getattr(obj, "_rating", None)
        if rating is not None:
            return round(float(rating), 1)
        from reviews.models import Review
        agg = Review.objects.filter(
            company=obj,
            status=Review.STATUS_PUBLISHED,
        ).aggregate(avg=Avg("rating"))
        if agg["avg"] is not None:
            return round(float(agg["avg"]), 1)
        return None

    def get_reviews_count(self, obj):
        count = getattr(obj, "_reviews_count", None)
        if count is not None:
            return count
        from reviews.models import Review
        return Review.objects.filter(
            company=obj,
            status=Review.STATUS_PUBLISHED,
        ).count()

    def to_internal_value(self, data):
        return super().to_internal_value(parse_json_form_fields(data))

    def validate_services(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("services must be a list.")
        allowed = {c[0] for c in Company.SERVICE_CHOICES}
        for svc in value:
            if svc not in allowed:
                raise serializers.ValidationError(f"'{svc}' is not a valid service category.")
        return value


class CompanyAdminSerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(write_only=True, required=False)
    owner = UserSerializer(read_only=True)
    service_items = ServiceSerializer(many=True, read_only=True)
    service_ids = serializers.SerializerMethodField()
    gallery_images = GalleryImageSerializer(many=True, read_only=True)
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = (
            "id",
            "owner",
            "owner_id",
            "name",
            "tagline",
            "email",
            "phone",
            "description",
            "location",
            "service_areas",
            "working_hours",
            "logo",
            "cover_image",
            "services",
            "service_ids",
            "service_items",
            "specialties",
            "gallery_images",
            "rating",
            "reviews_count",
            "verification_status",
            "status",
            "is_active",
            "profile_views",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner", "service_ids", "rating", "reviews_count", "profile_views", "created_at", "updated_at")

    def get_service_ids(self, obj):
        return list(obj.service_items.values_list("id", flat=True))

    def get_rating(self, obj):
        rating = getattr(obj, "_rating", None)
        if rating is not None:
            return round(float(rating), 1)
        from reviews.models import Review
        agg = Review.objects.filter(
            company=obj,
            status=Review.STATUS_PUBLISHED,
        ).aggregate(avg=Avg("rating"))
        if agg["avg"] is not None:
            return round(float(agg["avg"]), 1)
        return None

    def get_reviews_count(self, obj):
        count = getattr(obj, "_reviews_count", None)
        if count is not None:
            return count
        from reviews.models import Review
        return Review.objects.filter(
            company=obj,
            status=Review.STATUS_PUBLISHED,
        ).count()

    def to_internal_value(self, data):
        return super().to_internal_value(parse_json_form_fields(data))

    def validate_services(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("services must be a list.")
        allowed = {c[0] for c in Company.SERVICE_CHOICES}
        for svc in value:
            if svc not in allowed:
                raise serializers.ValidationError(f"'{svc}' is not a valid service category.")
        return value

    def create(self, validated_data):
        validated_data["status"] = Company.STATUS_APPROVED
        validated_data["is_active"] = True
        return super().create(validated_data)
