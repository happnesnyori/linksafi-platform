from django.db.models import Count
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCompany, IsOrganization
from companies.models import Company

from .models import ServiceRequest
from .serializers import ServiceRequestSerializer


class RequestListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        qs = ServiceRequest.objects.select_related("organization", "company__owner").all()
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


class RequestDetailView(generics.RetrieveAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = ServiceRequest.objects.select_related("organization", "company__owner").all()

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if obj.organization_id != user.id and obj.company.owner_id != user.id:
            self.permission_denied(self.request, message="Not your request.")
        return obj


class CompanyRequestListView(generics.ListAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = (permissions.IsAuthenticated, IsCompany)

    def get_queryset(self):
        qs = ServiceRequest.objects.filter(company__owner=self.request.user).select_related(
            "organization", "company__owner"
        )
        req_status = self.request.query_params.get("status")
        if req_status:
            qs = qs.filter(status=req_status)
        return qs


class _StatusTransitionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    new_status = None

    def post(self, request, pk):
        try:
            req = ServiceRequest.objects.select_related("company__owner").get(pk=pk)
        except ServiceRequest.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        if req.company.owner_id != request.user.id:
            return Response(
                {"detail": "Only the company owner can update this request."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if req.status != ServiceRequest.STATUS_PENDING:
            return Response(
                {"detail": f"Request is already {req.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        req.status = self.new_status
        req.save()
        return Response(ServiceRequestSerializer(req).data)


class AcceptRequestView(_StatusTransitionView):
    new_status = ServiceRequest.STATUS_ACCEPTED


class RejectRequestView(_StatusTransitionView):
    new_status = ServiceRequest.STATUS_REJECTED


class RespondToRequestView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsCompany)

    def post(self, request, pk):
        try:
            req = ServiceRequest.objects.select_related("company__owner").get(pk=pk)
        except ServiceRequest.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        if req.company.owner_id != request.user.id:
            return Response(
                {"detail": "Only the company owner can respond."},
                status=status.HTTP_403_FORBIDDEN,
            )
        note = request.data.get("response_note", "")
        req.response_note = note
        if req.status == ServiceRequest.STATUS_PENDING:
            req.status = ServiceRequest.STATUS_ACCEPTED
        req.save()
        return Response(ServiceRequestSerializer(req).data)


class StatsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        if user.role == "organization":
            qs = ServiceRequest.objects.filter(organization=user)
            data = {
                "total": qs.count(),
                "pending": qs.filter(status=ServiceRequest.STATUS_PENDING).count(),
                "accepted": qs.filter(status=ServiceRequest.STATUS_ACCEPTED).count(),
                "rejected": qs.filter(status=ServiceRequest.STATUS_REJECTED).count(),
                "completed": qs.filter(status=ServiceRequest.STATUS_COMPLETED).count(),
            }
        else:
            qs = ServiceRequest.objects.filter(company__owner=user)
            data = {
                "total": qs.count(),
                "pending": qs.filter(status=ServiceRequest.STATUS_PENDING).count(),
                "accepted": qs.filter(status=ServiceRequest.STATUS_ACCEPTED).count(),
                "rejected": qs.filter(status=ServiceRequest.STATUS_REJECTED).count(),
                "completed": qs.filter(status=ServiceRequest.STATUS_COMPLETED).count(),
            }
        return Response(data)