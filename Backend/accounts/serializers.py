from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def issue_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


class UserSerializer(serializers.ModelSerializer):
    admin_role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "name",
            "role",
            "phone",
            "organization_type",
            "is_staff",
            "is_superuser",
            "admin_role",
        )
        read_only_fields = ("id", "role")

    def get_admin_role(self, obj):
        if obj.is_superuser:
            return "superuser"
        if obj.is_staff:
            return "staff"
        return None


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    name = serializers.CharField(max_length=120)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)
    organization_type = serializers.ChoiceField(
        choices=User.ORG_TYPE_CHOICES, required=False, allow_blank=True
    )

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email is already registered.")
        return value.lower()

    def validate(self, attrs):
        if attrs.get("role") == User.ROLE_ORGANIZATION and not attrs.get("organization_type"):
            raise serializers.ValidationError(
                {"organization_type": "Select whether you're a university or an apartment."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        username = validated_data["email"].split("@")[0]
        base_username = username
        i = 1
        while User.objects.filter(username=username).exists():
            i += 1
            username = f"{base_username}{i}"
        user = User(username=username, **validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs["email"].strip()
        try:
            user = User.objects.get(email__iexact=identifier)
        except User.DoesNotExist:
            try:
                user = User.objects.get(username__iexact=identifier)
            except User.DoesNotExist:
                raise serializers.ValidationError({"detail": "Invalid credentials."})
        if not user.check_password(attrs["password"]):
            raise serializers.ValidationError({"detail": "Invalid credentials."})
        if not user.is_active:
            raise serializers.ValidationError({"detail": "Account disabled."})
        attrs["user"] = user
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate(self, attrs):
        try:
            user_id = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"detail": "This reset link is invalid or has expired."})

        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError({"detail": "This reset link is invalid or has expired."})

        attrs["user"] = user
        return attrs

    def save(self):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user