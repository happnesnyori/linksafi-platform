from django.db.models import Count, Q
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsAdmin, IsSuperUser
from companies.models import Company, Service
from service_requests.models import ServiceRequest
from reviews.models import Review

from .models import AdminAuditLog, log_admin_action
from .serializers import (
    AdminAdminCreateSerializer,
    AdminAdminSerializer,
    AdminAuditLogSerializer,
    AdminCompanyCreateSerializer,
    AdminCompanySerializer,
    AdminDashboardStatsSerializer,
    AdminReviewSerializer,
    AdminServiceRequestSerializer,
    AdminServiceSerializer,
    AdminUserDetailSerializer,
    AdminUserSerializer,
)


class AdminDashboardStatsView(APIView):
    permission_classes = (IsAdmin,)

    def get(self, request):
        users = User.objects.all()
        companies = Company.objects.all()
        requests = ServiceRequest.objects.all()

        role_counts = users.values("role").annotate(count=Count("id"))
        role_map = {item["role"]: item["count"] for item in role_counts}

        status_counts = requests.values("status").annotate(count=Count("id"))
        status_map = {item["status"]: item["count"] for item in status_counts}

        company_status_counts = companies.values("status").annotate(count=Count("id"))
        company_status_map = {item["status"]: item["count"] for item in company_status_counts}

        both_companies = companies.filter(
            Q(services__contains=[Company.SERVICE_BOTH])
            | (Q(services__contains=[Company.SERVICE_CLEANING]) & Q(services__contains=[Company.SERVICE_DECORATION]))
        ).count()
        cleaning_companies = companies.filter(
            services__contains=[Company.SERVICE_CLEANING]
        ).exclude(services__contains=[Company.SERVICE_BOTH]).exclude(
            services__contains=[Company.SERVICE_DECORATION]
        ).count()
        decoration_companies = companies.filter(
            services__contains=[Company.SERVICE_DECORATION]
        ).exclude(services__contains=[Company.SERVICE_BOTH]).exclude(
            services__contains=[Company.SERVICE_CLEANING]
        ).count()

        pending = status_map.get(ServiceRequest.STATUS_PENDING, 0)
        accepted = status_map.get(ServiceRequest.STATUS_ACCEPTED, 0)
        rejected = status_map.get(ServiceRequest.STATUS_REJECTED, 0)
        completed = status_map.get(ServiceRequest.STATUS_COMPLETED, 0)

        data = {
            "total_companies": companies.count(),
            "pending_companies": company_status_map.get(Company.STATUS_PENDING, 0),
            "approved_companies": company_status_map.get(Company.STATUS_APPROVED, 0),
            "suspended_companies": company_status_map.get(Company.STATUS_SUSPENDED, 0),
            "rejected_companies": company_status_map.get(Company.STATUS_REJECTED, 0),
            "total_customers": users.count(),
            "total_organizations": role_map.get(User.ROLE_ORGANIZATION, 0),
            "total_company_users": role_map.get(User.ROLE_COMPANY, 0),
            "total_service_requests": requests.count(),
            "pending_requests": pending,
            "accepted_requests": accepted,
            "rejected_requests": rejected,
            "completed_requests": completed,
            "cleaning_companies": cleaning_companies,
            "decoration_companies": decoration_companies,
            "both_companies": both_companies,
        }
        serializer = AdminDashboardStatsSerializer(data=data)
        serializer.is_valid()
        return Response(serializer.data)


class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = (IsAdmin,)

    def get_queryset(self):
        qs = User.objects.all()
        role = self.request.query_params.get("role")
        is_active = self.request.query_params.get("is_active")
        search = self.request.query_params.get("search")
        if role == "admin":
            qs = qs.filter(Q(is_staff=True) | Q(is_superuser=True))
        elif role:
            qs = qs.filter(role=role, is_staff=False, is_superuser=False)
        if is_active in ("true", "false"):
            qs = qs.filter(is_active=(is_active == "true"))
        if search:
            qs = qs.filter(Q(email__icontains=search) | Q(name__icontains=search))
        return qs.order_by("-date_joined")


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminUserDetailSerializer
    permission_classes = (IsAdmin,)
    queryset = User.objects.all()

    def get_object(self):
        obj = super().get_object()
        obj.service_requests_count = ServiceRequest.objects.filter(organization=obj).count()
        return obj

    def perform_destroy(self, instance):
        if instance.is_staff or instance.is_superuser:
            raise ValidationError({"detail": "Admin accounts can't be deleted from this endpoint."})
        log_admin_action(self.request.user, "user_deleted", instance)
        instance.delete()


class AdminCompanyListView(generics.ListCreateAPIView):
    """Admin: list all companies with optional status filter, or create a new company."""
    serializer_class = AdminCompanySerializer
    permission_classes = (IsAdmin,)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AdminCompanyCreateSerializer
        return AdminCompanySerializer

    def get_queryset(self):
        qs = Company.objects.select_related("owner").all()
        status_filter = self.request.query_params.get("status")
        is_active = self.request.query_params.get("is_active")
        search = self.request.query_params.get("search")
        if status_filter:
            qs = qs.filter(status=status_filter)
        if is_active in ("true", "false"):
            qs = qs.filter(is_active=(is_active == "true"))
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(location__icontains=search)
                | Q(email__icontains=search)
            )
        return qs.order_by("-created_at")


class AdminCompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: retrieve/update/permanently delete any company."""
    serializer_class = AdminCompanySerializer
    permission_classes = (IsAdmin,)
    queryset = Company.objects.select_related("owner").all()

    def perform_destroy(self, instance):
        log_admin_action(self.request.user, "company_deleted", instance)
        instance.delete()


class AdminServiceRequestListView(generics.ListCreateAPIView):
    serializer_class = AdminServiceRequestSerializer
    permission_classes = (IsAdmin,)

    def get_queryset(self):
        qs = ServiceRequest.objects.select_related(
            "organization", "company__owner"
        ).all()
        status_filter = self.request.query_params.get("status")
        service = self.request.query_params.get("service")
        property_type = self.request.query_params.get("property_type")
        search = self.request.query_params.get("search")
        if status_filter:
            qs = qs.filter(status=status_filter)
        if service:
            qs = qs.filter(service=service)
        if property_type:
            qs = qs.filter(property_type=property_type)
        if search:
            qs = qs.filter(
                Q(organization__email__icontains=search)
                | Q(company__name__icontains=search)
                | Q(location__icontains=search)
            )
        return qs.order_by("-created_at")


class AdminServiceRequestDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AdminServiceRequestSerializer
    permission_classes = (IsAdmin,)
    queryset = ServiceRequest.objects.select_related(
        "organization", "company__owner"
    ).all()


class AdminReviewListView(generics.ListAPIView):
    serializer_class = AdminReviewSerializer
    permission_classes = (IsAdmin,)

    def get_queryset(self):
        qs = Review.objects.select_related("company", "customer").all()
        company_id = self.request.query_params.get("company_id")
        status_filter = self.request.query_params.get("status")
        search = self.request.query_params.get("search")
        if company_id:
            qs = qs.filter(company_id=company_id)
        if status_filter:
            if status_filter == "published":
                qs = qs.filter(status__in=[Review.STATUS_PUBLISHED, "visible"])
            elif status_filter == "pending":
                qs = qs.filter(status__in=[Review.STATUS_PENDING, "hidden"])
            elif status_filter == "rejected":
                qs = qs.filter(status__in=[Review.STATUS_REJECTED, "removed"])
            else:
                qs = qs.filter(status=status_filter)
        if search:
            qs = qs.filter(
                Q(comment__icontains=search)
                | Q(customer__name__icontains=search)
                | Q(company__name__icontains=search)
            )
        return qs.order_by("-created_at")


class AdminReviewDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AdminReviewSerializer
    permission_classes = (IsAdmin,)
    queryset = Review.objects.select_related("company", "customer").all()


class AdminCompanyCustomersView(APIView):
    """Admin: list customers (users) associated with a specific company."""
    permission_classes = (IsAdmin,)

    def get(self, request, company_id):
        from django.http import Http404
        try:
            company = Company.objects.get(pk=company_id)
        except Company.DoesNotExist:
            raise Http404("Company not found.")
        users = User.objects.filter(role=User.ROLE_ORGANIZATION).order_by("-date_joined")
        serializer = AdminUserSerializer(users, many=True)
        return Response(
            {
                "company": company.name,
                "company_id": company.id,
                "customers": serializer.data,
            }
        )


class AdminUserRequestsView(APIView):
    """Admin: list service requests made by a specific customer."""
    permission_classes = (IsAdmin,)

    def get(self, request, pk):
        from django.http import Http404
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise Http404("Customer not found.")
        requests = ServiceRequest.objects.select_related(
            "company", "company__owner"
        ).filter(organization=user).order_by("-created_at")
        serializer = AdminServiceRequestSerializer(requests, many=True)
        return Response(
            {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "role": user.role,
                    "phone": user.phone,
                    "is_active": user.is_active,
                },
                "service_requests": serializer.data,
            }
        )


class AdminServiceListView(generics.ListCreateAPIView):
    """Admin: full CRUD over the service catalog (list/create)."""
    serializer_class = AdminServiceSerializer
    permission_classes = (IsAdmin,)
    pagination_class = None

    def get_queryset(self):
        qs = Service.objects.all().order_by("category", "ordering", "name")
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs

    def perform_create(self, serializer):
        service = serializer.save()
        log_admin_action(self.request.user, "service_created", service)


class AdminServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: retrieve/update/delete a single catalog service."""
    serializer_class = AdminServiceSerializer
    permission_classes = (IsAdmin,)
    queryset = Service.objects.all()

    def perform_destroy(self, instance):
        log_admin_action(self.request.user, "service_deleted", instance)
        instance.delete()


class AdminAdminListView(generics.ListAPIView):
    """Admin: list all admin (staff/superuser) accounts."""
    serializer_class = AdminAdminSerializer
    permission_classes = (IsAdmin,)
    pagination_class = None

    def get_queryset(self):
        return User.objects.filter(Q(is_staff=True) | Q(is_superuser=True)).order_by("-date_joined")


class AdminAdminCreateView(APIView):
    """Admin: invite a new admin account. Returns a one-time temporary password."""
    permission_classes = (IsAdmin,)

    def post(self, request):
        serializer = AdminAdminCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        log_admin_action(request.user, "admin_invited", user)
        return Response(
            {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "temporary_password": user.temp_password,
            },
            status=201,
        )


class AdminAdminDetailView(generics.DestroyAPIView):
    """Superadmin: remove a staff admin account that was invited by an admin.

    Restricted to superusers, and the queryset excludes superusers so this
    endpoint can never be used to remove yourself or another superadmin.
    """
    permission_classes = (IsSuperUser,)
    queryset = User.objects.filter(is_staff=True, is_superuser=False)

    def perform_destroy(self, instance):
        log_admin_action(self.request.user, "admin_removed", instance)
        instance.delete()


class AdminAuditLogListView(generics.ListAPIView):
    serializer_class = AdminAuditLogSerializer
    permission_classes = (IsAdmin,)

    def get_queryset(self):
        qs = AdminAuditLog.objects.select_related("actor").all()
        target_type = self.request.query_params.get("target_type")
        if target_type:
            qs = qs.filter(target_type=target_type)
        return qs