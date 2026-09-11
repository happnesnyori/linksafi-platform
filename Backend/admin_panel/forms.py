from django import forms

from accounts.models import User
from companies.models import Company
from service_requests.models import ServiceRequest


class UserCreateForm(forms.ModelForm):
    password1 = forms.CharField(
        label="Password",
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}),
    )
    password2 = forms.CharField(
        label="Confirm Password",
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}),
        help_text="Enter the same password as before.",
    )

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "name",
            "role",
            "phone",
            "is_active",
            "is_staff",
            "is_superuser",
            "groups",
            "user_permissions",
        ]
        widgets = {
            "groups": forms.CheckboxSelectMultiple,
            "user_permissions": forms.CheckboxSelectMultiple,
        }

    def clean(self):
        cleaned = super().clean()
        if cleaned.get("password1") != cleaned.get("password2"):
            raise forms.ValidationError("Passwords do not match.")
        return cleaned

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
            self.save_m2m()
        return user


class UserUpdateForm(forms.ModelForm):
    password = forms.CharField(
        label="New Password",
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"}),
        required=False,
        help_text="Leave blank to keep the current password.",
    )

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "name",
            "role",
            "phone",
            "is_active",
            "is_staff",
            "is_superuser",
            "groups",
            "user_permissions",
        ]
        widgets = {
            "groups": forms.CheckboxSelectMultiple,
            "user_permissions": forms.CheckboxSelectMultiple,
        }

    def save(self, commit=True):
        user = super().save(commit=False)
        if self.cleaned_data.get("password"):
            user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
            self.save_m2m()
        return user


class CompanyForm(forms.ModelForm):
    class Meta:
        model = Company
        fields = ["owner", "name", "description", "location", "logo", "services"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["owner"].queryset = User.objects.filter(
            role=User.ROLE_COMPANY
        ).order_by("email")


class ServiceRequestForm(forms.ModelForm):
    class Meta:
        model = ServiceRequest
        fields = [
            "organization",
            "company",
            "service",
            "description",
            "status",
            "response_note",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["organization"].queryset = User.objects.filter(
            role=User.ROLE_ORGANIZATION
        ).order_by("email")
