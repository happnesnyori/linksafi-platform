from rest_framework import serializers

from accounts.serializers import UserSerializer
from companies.models import Company
from companies.serializers import CompanySerializer
from service_requests.models import ServiceRequest

from .models import Review


class ReviewPublicSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)

    class Meta:
        model = Review
        fields = (
            "id",
            "company_id",
            "company_name",
            "customer_name",
            "service_name",
            "rating",
            "comment",
            "created_at",
        )


class ReviewSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    company_id = serializers.IntegerField(write_only=True)
    service_request_id = serializers.IntegerField(write_only=True)
    service_name = serializers.CharField(read_only=True)

    class Meta:
        model = Review
        fields = (
            "id",
            "company",
            "company_name",
            "company_id",
            "customer",
            "customer_name",
            "service_request",
            "service_request_id",
            "service_name",
            "rating",
            "comment",
            "status",
            "is_featured",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "customer",
            "company",
            "company_name",
            "customer_name",
            "service_request",
            "service_name",
            "status",
            "is_featured",
            "created_at",
            "updated_at",
        )

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate_company_id(self, value):
        if not Company.objects.filter(
            pk=value,
            status=Company.STATUS_APPROVED,
            is_active=True,
        ).exists():
            raise serializers.ValidationError("Company is not available for reviews.")
        return value

    def validate_service_request_id(self, value):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication is required.")
        try:
            service_request = ServiceRequest.objects.select_related("company").get(pk=value)
        except ServiceRequest.DoesNotExist:
            raise serializers.ValidationError("Service request not found.")

        if service_request.organization_id != request.user.id:
            raise serializers.ValidationError("Service request does not belong to this customer.")
        if service_request.status != ServiceRequest.STATUS_COMPLETED:
            raise serializers.ValidationError("Only completed service requests can be reviewed.")
        if Review.objects.filter(service_request_id=value).exists():
            raise serializers.ValidationError("This service request has already been reviewed.")
        return value

    def validate(self, attrs):
        service_request_id = attrs.get("service_request_id")
        company_id = attrs.get("company_id")
        if not service_request_id:
            raise serializers.ValidationError({
                "service_request_id": "A completed service request is required."
            })
        service_request = ServiceRequest.objects.get(pk=service_request_id)
        if company_id and service_request.company_id != company_id:
            raise serializers.ValidationError({
                "company_id": "Company must match the completed service request."
            })
        return attrs

    def create(self, validated_data):
        service_request = validated_data.pop("service_request_id")
        validated_data["service_name"] = service_request.service
        return Review.objects.create(**validated_data)
