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
            "guest_name",
            "guest_email",
            "guest_phone",
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
            "company",
            "status",
            "response_note",
            "created_at",
            "updated_at",
        )

    def validate_service(self, value):
        allowed = {choice[0] for choice in Company.SERVICE_CHOICES}

        if value not in allowed:
            raise serializers.ValidationError("Invalid service.")

        return value

    def validate_company_id(self, value):
        if not Company.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Company not found.")

        return value


class PublicServiceRequestSerializer(serializers.ModelSerializer):
    company_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ServiceRequest
        fields = (
            "id",
            "company_id",
            "guest_name",
            "guest_email",
            "guest_phone",
            "service",
            "property_type",
            "location",
            "requested_date",
            "description",
            "status",
            "created_at",
        )
        read_only_fields = (
            "id",
            "status",
            "created_at",
        )

    def validate_company_id(self, value):
        if not Company.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Company not found.")

        return value

    def validate_service(self, value):
        allowed = {choice[0] for choice in Company.SERVICE_CHOICES}

        if value not in allowed:
            raise serializers.ValidationError("Invalid service.")

        return value

    def create(self, validated_data):
        company_id = validated_data.pop("company_id")

        company = Company.objects.get(pk=company_id)

        return ServiceRequest.objects.create(
            company=company,
            **validated_data,
        )