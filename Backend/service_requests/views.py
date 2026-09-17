from django.db.models import Count
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCompany, IsOrganization
from companies.models import Company

from .models import ServiceRequest
from .serializers import (
    PublicServiceRequestSerializer,
    ServiceRequestSerializer,
)


class RequestListCreateView(generics.ListCreateAPIView):
    """
    Authenticated organization/company request endpoint.

    Organizations can create requests.
    Organizations see their own requests.
    Companies see requests sent to their companies.
    """

    serializer_class = ServiceRequestSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user

        qs = ServiceRequest.objects.select_related(
            "organization",
            "company__owner",
        ).all()

        if user.role == "organization":
            qs = qs.filter(organization=user)

        elif user.role == "company":
            qs = qs.filter(company__owner=user)

        req_status = self.request.query_params.get("status")

        if req_status:
            qs = qs.filter(status=req_status)

        return qs

    def create(self, request, *args, **kwargs):
        if request.user.role != "organization":
            return Response(
                {"detail": "Only organizations can create requests."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user)


class PublicServiceRequestView(generics.CreateAPIView):
    """
    Public endpoint for visitors who do not have a LinkSafi account.

    No authentication is required.
    The request is linked directly to the selected company.
    """

    serializer_class = PublicServiceRequestSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        request_obj = serializer.save()

        return Response(
            {
                "message": "Service request submitted successfully.",
                "request": PublicServiceRequestSerializer(request_obj).data,
            },
            status=status.HTTP_201_CREATED,
        )


class RequestDetailView(generics.RetrieveAPIView):
    """
    Allows an authenticated organization or company owner
    to view a specific request that belongs to them.
    """

    serializer_class = ServiceRequestSerializer
    permission_classes = (permissions.IsAuthenticated,)

    queryset = ServiceRequest.objects.select_related(
        "organization",
        "company__owner",
    ).all()

    def get_object(self):
        obj = super().get_object()

        user = self.request.user

        organization_matches = obj.organization_id == user.id
        company_matches = obj.company.owner_id == user.id

        if not organization_matches and not company_matches:
            self.permission_denied(
                self.request,
                message="Not your request.",
            )

        return obj


class CompanyRequestListView(generics.ListAPIView):
    """
    Returns requests received by the currently logged-in company.
    """

    serializer_class = ServiceRequestSerializer
    permission_classes = (
        permissions.IsAuthenticated,
        IsCompany,
    )

    def get_queryset(self):
        qs = ServiceRequest.objects.filter(
            company__owner=self.request.user
        ).select_related(
            "organization",
            "company__owner",
        )

        req_status = self.request.query_params.get("status")

        if req_status:
            qs = qs.filter(status=req_status)

        return qs


class _StatusTransitionView(APIView):
    """
    Base class for accepting/rejecting service requests.
    """

    permission_classes = (permissions.IsAuthenticated,)

    new_status = None

    def post(self, request, pk):
        try:
            req = ServiceRequest.objects.select_related(
                "company__owner"
            ).get(pk=pk)

        except ServiceRequest.DoesNotExist:
            return Response(
                {"detail": "Not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if req.company.owner_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "Only the company owner can update this request."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if req.status != ServiceRequest.STATUS_PENDING:
            return Response(
                {
                    "detail": (
                        f"Request is already {req.status}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        req.status = self.new_status
        req.save()

        return Response(
            ServiceRequestSerializer(req).data
        )


class AcceptRequestView(_StatusTransitionView):
    new_status = ServiceRequest.STATUS_ACCEPTED


class RejectRequestView(_StatusTransitionView):
    new_status = ServiceRequest.STATUS_REJECTED


class RespondToRequestView(APIView):
    """
    Allows a company to respond to a request.
    """

    permission_classes = (
        permissions.IsAuthenticated,
        IsCompany,
    )

    def post(self, request, pk):
        try:
            req = ServiceRequest.objects.select_related(
                "company__owner"
            ).get(pk=pk)

        except ServiceRequest.DoesNotExist:
            return Response(
                {"detail": "Not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if req.company.owner_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "Only the company owner can respond."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        note = request.data.get("response_note", "")

        req.response_note = note

        if req.status == ServiceRequest.STATUS_PENDING:
            req.status = ServiceRequest.STATUS_ACCEPTED

        req.save()

        return Response(
            ServiceRequestSerializer(req).data
        )


class StatsView(APIView):
    """
    Returns request statistics for the logged-in user.

    Organizations receive their own request statistics.
    Companies receive requests sent to their company.
    """

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user

        if user.role == "organization":
            qs = ServiceRequest.objects.filter(
                organization=user
            )

        else:
            qs = ServiceRequest.objects.filter(
                company__owner=user
            )

        data = {
            "total": qs.count(),
            "pending": qs.filter(
                status=ServiceRequest.STATUS_PENDING
            ).count(),
            "accepted": qs.filter(
                status=ServiceRequest.STATUS_ACCEPTED
            ).count(),
            "rejected": qs.filter(
                status=ServiceRequest.STATUS_REJECTED
            ).count(),
            "completed": qs.filter(
                status=ServiceRequest.STATUS_COMPLETED
            ).count(),
        }

        return Response(data)