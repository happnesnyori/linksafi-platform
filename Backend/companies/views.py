from django.db.models import Avg, Case, Count, F, FloatField, Q, When
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsAdmin, IsCompany
from admin_api.models import log_admin_action
from companies.models import Company, GalleryImage, Service
from reviews.models import Review

from .serializers import (
    CompanyAdminSerializer,
    CompanySerializer,
    GalleryImageSerializer,
    ServiceSerializer,
)


def company_metrics(queryset):
    return queryset.annotate(
        _rating=Avg(
            Case(
                When(reviews__status=Review.STATUS_PUBLISHED, then="reviews__rating"),
                output_field=FloatField(),
            )
        ),
        _reviews_count=Count(
            "reviews",
            filter=Q(reviews__status=Review.STATUS_PUBLISHED),
            distinct=True,
        ),
    )


def sync_company_high_level_services(company):
    categories = set(company.service_items.values_list("category", flat=True))
    if "cleaning" in categories and "decoration" in categories:
        company.services = [Company.SERVICE_BOTH, Company.SERVICE_CLEANING, Company.SERVICE_DECORATION]
    elif "cleaning" in categories:
        company.services = [Company.SERVICE_CLEANING]
    elif "decoration" in categories:
        company.services = [Company.SERVICE_DECORATION]
    else:
        company.services = []
    company.save(update_fields=["services"])


class ServiceListView(generics.ListCreateAPIView):
    pagination_class = None
    serializer_class = ServiceSerializer
    queryset = Service.objects.filter(is_active=True).order_by("category", "ordering", "name")

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsCompany()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        from django.utils.text import slugify

        base_slug = slugify(serializer.validated_data.get("name", "")) or "service"
        slug = base_slug
        suffix = 1
        while Service.objects.filter(slug=slug).exists():
            suffix += 1
            slug = f"{base_slug}-{suffix}"

        service = serializer.save(slug=slug, is_active=True)

        company = getattr(self.request.user, "company", None)
        if company:
            company.service_items.add(service)
            sync_company_high_level_services(company)


class CompanyListCreateView(generics.ListCreateAPIView):
    serializer_class = CompanySerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def get_queryset(self):
        qs = company_metrics(
            Company.objects.select_related("owner")
            .prefetch_related("service_items", "gallery_images")
            .filter(
                status=Company.STATUS_APPROVED,
                is_active=True,
            )
        )
        service = self.request.query_params.get("service")
        search = self.request.query_params.get("search")
        if service and service != "all":
            if service == Company.SERVICE_BOTH:
                qs = qs.filter(
                    Q(services__contains=["both"])
                    | (Q(services__contains=["cleaning"]) & Q(services__contains=["decoration"]))
                )
            elif service in (Company.SERVICE_CLEANING, Company.SERVICE_DECORATION):
                qs = qs.filter(
                    Q(services__contains=[service])
                    | Q(service_items__category=service),
                ).exclude(
                    services__contains=["both"],
                ).distinct()
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(tagline__icontains=search)
                | Q(location__icontains=search)
                | Q(service_items__name__icontains=search)
            ).distinct()
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
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = serializer.save(owner=request.user)
        company.status = Company.STATUS_PENDING
        company.is_active = False
        company.save()
        return Response(
            CompanySerializer(company, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class CompanyDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CompanySerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    queryset = company_metrics(
        Company.objects.select_related("owner")
        .prefetch_related("service_items", "gallery_images")
        .all()
    )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if obj.status != Company.STATUS_APPROVED or not obj.is_active:
            if not (
                user.is_staff
                or user.is_superuser
                or obj.owner_id == getattr(user, "id", None)
            ):
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

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        is_owner_or_staff = (
            getattr(user, "is_authenticated", False)
            and (user.is_staff or user.is_superuser or instance.owner_id == user.id)
        )
        if not is_owner_or_staff:
            Company.objects.filter(pk=instance.pk).update(
                profile_views=F("profile_views") + 1
            )
            instance.refresh_from_db(fields=["profile_views"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CompanyServicesView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request, pk=None):
        if pk is None or pk == "me":
            company = getattr(request.user, "company", None)
            if not company:
                return Response({"detail": "Company profile not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
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

        service_ids = request.data.get("service_ids")
        services_input = request.data.get("services")

        if service_ids is not None:
            if not isinstance(service_ids, list) or not service_ids:
                return Response(
                    {"service_ids": ["Provide a non-empty list of service IDs."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not all(isinstance(service_id, int) for service_id in service_ids):
                return Response(
                    {"service_ids": ["Service IDs must be integers."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            services_qs = Service.objects.filter(id__in=service_ids, is_active=True)
            found_ids = set(services_qs.values_list("id", flat=True))
            missing_ids = sorted(set(service_ids) - found_ids)
            if missing_ids:
                return Response(
                    {"service_ids": [f"Unknown or inactive service IDs: {', '.join(map(str, missing_ids))}."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            company.service_items.set(services_qs)
        elif services_input is not None:
            if not isinstance(services_input, list) or not services_input:
                return Response(
                    {"services": ["Provide a non-empty list of catalog service names or slugs."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not all(isinstance(value, str) for value in services_input):
                return Response(
                    {"services": ["Catalog service names and slugs must be strings."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            services_qs = Service.objects.filter(
                Q(name__in=services_input) | Q(slug__in=services_input),
                is_active=True,
            )
            found_values = set(services_qs.values_list("name", flat=True)) | set(
                services_qs.values_list("slug", flat=True)
            )
            missing_values = sorted(set(services_input) - found_values)
            if missing_values:
                return Response(
                    {"services": [f"Unknown or inactive catalog services: {', '.join(missing_values)}."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            company.service_items.set(services_qs)
        else:
            return Response(
                {"detail": "Provide service_ids or services."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sync_company_high_level_services(company)

        return Response(CompanySerializer(company, context={"request": request}).data)


class MyCompanyView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsCompany)
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get_company(self, request):
        return getattr(request.user, "company", None)

    def get(self, request):
        company = self.get_company(request)
        if not company:
            return Response({"detail": "No company profile."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CompanySerializer(company, context={"request": request}).data)

    def put(self, request):
        company = self.get_company(request)
        if not company:
            return Response({"detail": "No company profile."}, status=status.HTTP_404_NOT_FOUND)
        serializer = CompanySerializer(company, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        return self.put(request)


class CompanyGalleryView(APIView):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get(self, request, pk=None):
        if pk is None or pk == "me":
            company = getattr(request.user, "company", None)
            if not company:
                return Response({"detail": "Company profile not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            company = get_object_or_404(Company, pk=pk)
            if (
                (company.status != Company.STATUS_APPROVED or not company.is_active)
                and not (
                    request.user.is_staff
                    or request.user.is_superuser
                    or company.owner_id == getattr(request.user, "id", None)
                )
            ):
                raise PermissionDenied("Company gallery is not publicly visible.")
        images = company.gallery_images.all()
        return Response(GalleryImageSerializer(images, many=True, context={"request": request}).data)

    def post(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        if pk is None or pk == "me":
            company = getattr(request.user, "company", None)
            if not company:
                return Response({"detail": "Company profile not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            company = get_object_or_404(Company, pk=pk)
            if company.owner_id != request.user.id and not (request.user.is_staff or request.user.is_superuser):
                return Response({"detail": "You can only manage gallery for your own company."}, status=status.HTTP_403_FORBIDDEN)

        serializer = GalleryImageSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(company=company)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CompanyGalleryDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, pk):
        image = get_object_or_404(GalleryImage, pk=pk)
        if image.company.owner_id != request.user.id and not (request.user.is_staff or request.user.is_superuser):
            return Response({"detail": "You can only delete your own images."}, status=status.HTTP_403_FORBIDDEN)
        image.delete()
        return Response({"detail": "Image deleted."}, status=status.HTTP_204_NO_CONTENT)


class AdminCompanyListView(generics.ListAPIView):
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
    serializer_class = CompanyAdminSerializer
    permission_classes = (IsAdmin,)
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    queryset = Company.objects.select_related("owner").all()


class AdminCompanyActionView(APIView):
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
        log_admin_action(
            request.user,
            f"company_{action}",
            company,
            metadata={"status": company.status, "is_active": company.is_active},
        )
        return Response(CompanyAdminSerializer(company).data)
