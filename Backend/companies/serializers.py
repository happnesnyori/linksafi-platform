import json

from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import Company


def parse_json_form_fields(data):
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
    return parsed


class CompanySerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Company
        fields = (
            "id",
            "owner",
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
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner", "created_at", "updated_at")

    def to_internal_value(self, data):
        return super().to_internal_value(parse_json_form_fields(data))

    def validate_services(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("services must be a list.")
        allowed = {c[0] for c in Company.SERVICE_CHOICES}
        for svc in value:
            if svc not in allowed:
                raise serializers.ValidationError(f"'{svc}' is not a valid service.")
        return value


class CompanyAdminSerializer(serializers.ModelSerializer):
    """Serializer for admin management - includes owner_id as writable."""
    owner_id = serializers.IntegerField(write_only=True, required=False)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Company
        fields = (
            "id",
            "owner",
            "owner_id",
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
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner", "created_at", "updated_at")

    def to_internal_value(self, data):
        return super().to_internal_value(parse_json_form_fields(data))

    def validate_services(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("services must be a list.")
        allowed = {c[0] for c in Company.SERVICE_CHOICES}
        for svc in value:
            if svc not in allowed:
                raise serializers.ValidationError(f"'{svc}' is not a valid service.")
        return value

    def create(self, validated_data):
        # Admin-created companies are automatically approved and active
        validated_data["status"] = Company.STATUS_APPROVED
        validated_data["is_active"] = True
        return super().create(validated_data)
