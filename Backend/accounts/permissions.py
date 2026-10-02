from rest_framework import permissions


class IsCompany(permissions.BasePermission):
    message = "Only company accounts can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "company")


class IsOrganization(permissions.BasePermission):
    message = "Only organization accounts can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "organization")


class IsAdmin(permissions.BasePermission):
    message = "Only admin users can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.is_superuser)
        )


class IsSuperUser(permissions.BasePermission):
    message = "Only the super admin can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )