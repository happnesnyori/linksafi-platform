from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsCompany, IsAdmin
from companies.models import Company

from .serializers import CompanyAdminSerializer, CompanySerializer


class CompanyListCreateView(generics.ListCreateAPIView):
    serializer_class = CompanySerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get_queryset(self):
        # Public listing: only approved AND active companies
        qs = Company.objects.select_related("owner").filter(
            status=Company.STATUS_APPROVED,
            is_active=True,
        )
        service = self.request.query_params.get("service")
        search = self.request.query_params.get("search")
        if service and service != "all":
            if service == Company.SERVICE_BOTH:
                qs = qs.filter(services__contains=["both"])
            elif service in (Company.SERVICE_CLEANING, Company.SERVICE_DECORATION):
                qs = qs.filter(
                    services__contains=[service],
                ).exclude(
                    services__contains=["both"],
                )
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        return qs

    def create(self, request, *args, **kwargs):
        if request.user.role != User.ROLE_COMPANY:
            return Response(
                {"detail": "Only company accounts can create companies."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if hasattr(request.user, "company"):
            return Response(
                {"detail": "Company profile already exists for this account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Self-registered company starts as pending and inactive
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = serializer.save(owner=request.user)
        company.status = Company.STATUS_PENDING
        company.is_active = False
        company.save()
        return Response(
            CompanySerializer(company).data, status=status.HTTP_201_CREATED
        )


class CompanyDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CompanySerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    queryset = Company.objects.select_related("owner").all()

    def get_object(self):
        obj = super().get_object()
        # Only owners or admins can see non-public companies
        user = self.request.user
        if obj.status != Company.STATUS_APPROVED or not obj.is_active:
            if not (user.is_staff or user.is_superuser or obj.owner_id == user.id):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Company not publicly visible.")
        return obj

    def update(self, request, *args, **kwargs):
        company = self.get_object()
        if company.owner_id != request.user.id and not (
            request.user.is_staff or request.user.is_superuser
        ):
            return Response(
                {"detail": "You can only edit your own company."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)


class CompanyServicesView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request, pk):
        try:
            company = Company.objects.get(pk=pk)
        except Company.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        if company.owner_id != request.user.id and not (
            request.user.is_staff or request.user.is_superuser
        ):
            return Response(
                {"detail": "You can only edit your own company."},
                status=status.HTTP_403_FORBIDDEN,
            )
        services = request.data.get("services", [])
        if not isinstance(services, list):
            return Response(
                {"services": ["Must be a list."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        allowed = {c[0] for c in Company.SERVICE_CHOICES}
        invalid = [s for s in services if s not in allowed]
        if invalid:
            return Response(
                {"services": [f"Invalid: {invalid}"]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        company.services = services
        company.save()
        return Response(CompanySerializer(company).data)


class MyCompanyView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsCompany)

    def get(self, request):
        company = getattr(request.user, "company", None)
        if not company:
            return Response({"detail": "No company profile."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CompanySerializer(company).data)


# ---------------------------------------------------------------------------
# Admin company management endpoints
# ---------------------------------------------------------------------------


class AdminCompanyListView(generics.ListAPIView):
    """Admin: list all companies with optional status filter."""
    serializer_class = CompanyAdminSerializer
    permission_classes = (IsAdmin,)
    parser_classes = (JSONParser, MultiPartParser, FormParser)

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
                Q(name__icontains=search) | Q(location__icontains=search)
            )
        return qs.order_by("-created_at")


class AdminCompanyDetailView(generics.RetrieveUpdateAPIView):
    """Admin: retrieve/update any company."""
    serializer_class = CompanyAdminSerializer
    permission_classes = (IsAdmin,)
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    queryset = Company.objects.select_related("owner").all()


class AdminCompanyActionView(APIView):
    """Admin: approve / reject / suspend / reactivate a company."""
    permission_classes = (IsAdmin,)

    def _get_company(self, pk):
        return get_object_or_404(Company.objects.select_related("owner"), pk=pk)

    def post(self, request, pk, action):
        company = self._get_company(pk)
        if action == "approve":
            company.status = Company.STATUS_APPROVED
            company.is_active = True
        elif action == "reject":
            company.status = Company.STATUS_REJECTED
            company.is_active = False
        elif action == "suspend":
            company.status = Company.STATUS_SUSPENDED
            company.is_active = False
        elif action == "reactivate":
            company.status = Company.STATUS_APPROVED
            company.is_active = True
        else:
            return Response(
                {"detail": f"Unknown action: {action}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        company.save()
        return Response(CompanyAdminSerializer(company).data)