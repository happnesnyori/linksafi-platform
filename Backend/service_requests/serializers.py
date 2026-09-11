from rest_framework import serializers

from accounts.serializers import UserSerializer
from companies.models import Company
from companies.serializers import CompanySerializer

from .models import ServiceRequest


class ServiceRequestSerializer(serializers.ModelSerializer):
    organization = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ServiceRequest
        fields = (
            "id",
            "organization",
            "company",
            "company_id",
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
        read_only_fields = ("id", "organization", "company", "status", "response_note", "created_at", "updated_at")

    def validate_service(self, value):
        allowed = {c[0] for c in Company.SERVICE_CHOICES}
        if value not in allowed:
            raise serializers.ValidationError("Invalid service.")
        return value

    def validate_company_id(self, value):
        if not Company.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Company not found.")
        return value