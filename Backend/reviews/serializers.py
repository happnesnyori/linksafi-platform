from rest_framework import serializers

from accounts.serializers import UserSerializer
from companies.serializers import CompanySerializer

from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True, required=False)
    customer_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Review
        fields = (
            "id",
            "company",
            "company_id",
            "customer",
            "customer_id",
            "rating",
            "comment",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "customer", "company", "status", "created_at", "updated_at")

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate_company_id(self, value):
        from companies.models import Company
        if not Company.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Company not found.")
        return value

    def validate_customer_id(self, value):
        from accounts.models import User
        if not User.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Customer not found.")
        return value