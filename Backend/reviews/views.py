from django.db.models import Avg, Count
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsAdmin, IsOrganization
from companies.models import Company

from .models import Review
from .serializers import ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = Review.objects.select_related("company", "customer").filter(
            status=Review.STATUS_VISIBLE,
            company__status=Company.STATUS_APPROVED,
            company__is_active=True,
        )
        company_id = self.request.query_params.get("company_id")
        if company_id:
            qs = qs.filter(company_id=company_id)
        return qs.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        if request.user.role != User.ROLE_ORGANIZATION:
            return Response(
                {"detail": "Only organization accounts can leave reviews."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company_id = serializer.validated_data.get("company_id")
        company = get_object_or_404(Company, pk=company_id)
        if not (company.status == Company.STATUS_APPROVED and company.is_active):
            return Response(
                {"detail": "Can only review approved and active companies."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        review = serializer.save(customer=request.user, company=company)
        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


class CompanyReviewsView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, company_id):
        qs = Review.objects.select_related("customer").filter(
            company_id=company_id,
            status=Review.STATUS_VISIBLE,
        )
        serializer = ReviewSerializer(qs, many=True)
        return Response(serializer.data)


class CompanyRatingView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, company_id):
        agg = Review.objects.filter(
            company_id=company_id,
            status=Review.STATUS_VISIBLE,
        ).aggregate(avg=Avg("rating"), count=Count("id"))
        return Response({
            "average": round(agg["avg"] or 0, 1),
            "count": agg["count"] or 0,
        })


class AdminReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (IsAdmin,)

    def get_queryset(self):
        qs = Review.objects.select_related("company", "customer").all()
        company_id = self.request.query_params.get("company_id")
        status_filter = self.request.query_params.get("status")
        search = self.request.query_params.get("search")
        if company_id:
            qs = qs.filter(company_id=company_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if search:
            qs = qs.filter(comment__icontains=search)
        return qs.order_by("-created_at")


class AdminReviewActionView(APIView):
    permission_classes = (IsAdmin,)

    def post(self, request, pk, action):
        review = get_object_or_404(Review, pk=pk)
        if action == "hide":
            review.status = Review.STATUS_HIDDEN
        elif action == "remove":
            review.status = Review.STATUS_REMOVED
        elif action == "restore":
            review.status = Review.STATUS_VISIBLE
        else:
            return Response(
                {"detail": f"Unknown action: {action}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        review.save()
        return Response(ReviewSerializer(review).data)