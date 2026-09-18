from rest_framework import serializers

from accounts.serializers import UserSerializer
from companies.models import Company
from companies.serializers import CompanySerializer

from .models import ServiceRequest


def validate_company_service(company, service):
    if company.status != Company.STATUS_APPROVED or not company.is_active:
        raise serializers.ValidationError("Company is not available for service requests.")

    categories = set(company.service_items.values_list("category", flat=True))
    high_level_services = set(company.services or [])
    if service == Company.SERVICE_BOTH:
        offered = Company.SERVICE_BOTH in high_level_services or {
            Company.SERVICE_CLEANING,
            Company.SERVICE_DECORATION,
        }.issubset(categories)
    else:
        offered = service in high_level_services or service in categories

    if not offered:
        raise serializers.ValidationError("Company does not offer the selected service.")


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
        try:
            company = Company.objects.get(pk=value)
        except Company.DoesNotExist:
            raise serializers.ValidationError("Company not found.")
        validate_company_service(company, self.initial_data.get("service"))
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
        try:
            company = Company.objects.get(pk=value)
        except Company.DoesNotExist:
            raise serializers.ValidationError("Company not found.")
        validate_company_service(company, self.initial_data.get("service"))
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
