import json

from rest_framework import serializers

from accounts.models import User
from companies.models import Company
from reviews.models import Review
from service_requests.models import ServiceRequest


class AdminUserSerializer(serializers.ModelSerializer):
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
        )
        read_only_fields = ("id", "date_joined", "last_login")


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

    class Meta:
        model = Company
        fields = (
            "id",
            "owner",
            "owner_email",
            "owner_name",
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
        read_only_fields = ("id", "owner", "owner_email", "owner_name", "created_at", "updated_at")


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
            "rating",
            "comment",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "company", "customer", "company_name", "customer_name", "customer_email", "created_at", "updated_at")


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